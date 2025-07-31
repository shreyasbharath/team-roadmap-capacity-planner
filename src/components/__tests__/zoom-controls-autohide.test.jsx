// src/components/__tests__/zoom-controls-autohide.test.jsx
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ZoomControls } from '../NavigationControls.jsx';

describe('ZoomControls Auto-Hide', () => {
  const mockProps = {
    zoom: 1.0,
    zoomIn: vi.fn(),
    zoomOut: vi.fn(),
    resetZoom: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('should be visible initially', () => {
    render(<ZoomControls {...mockProps} />);
    
    const controls = screen.getByTestId('zoom-controls');
    expect(controls).toBeInTheDocument();
    expect(controls).toHaveClass('opacity-100'); // Should start visible
  });

  it('should hide after 3 seconds of inactivity', async () => {
    render(<ZoomControls {...mockProps} />);
    
    const controls = screen.getByTestId('zoom-controls');
    
    // Initially visible
    expect(controls).toHaveClass('opacity-100');
    
    // Fast-forward 3 seconds
    vi.advanceTimersByTime(3000);
    
    // Should now be hidden
    await waitFor(() => {
      expect(controls).toHaveClass('opacity-0');
    });
  });

  it('should show on mouse movement and hide again after timeout', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<ZoomControls {...mockProps} />);
    
    const controls = screen.getByTestId('zoom-controls');
    
    // Fast-forward to hide initially
    vi.advanceTimersByTime(3000);
    await waitFor(() => {
      expect(controls).toHaveClass('opacity-0');
    });
    
    // Simulate mouse movement
    fireEvent.mouseMove(document.body);
    
    // Should be visible again
    await waitFor(() => {
      expect(controls).toHaveClass('opacity-100');
    });
    
    // Fast-forward again
    vi.advanceTimersByTime(3000);
    
    // Should hide again
    await waitFor(() => {
      expect(controls).toHaveClass('opacity-0');
    });
  });

  it('should show on hover and stay visible while hovering', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<ZoomControls {...mockProps} />);
    
    const controls = screen.getByTestId('zoom-controls');
    
    // Hide initially
    vi.advanceTimersByTime(3000);
    await waitFor(() => {
      expect(controls).toHaveClass('opacity-0');
    });
    
    // Hover over controls
    await user.hover(controls);
    
    // Should be visible
    await waitFor(() => {
      expect(controls).toHaveClass('opacity-100');
    });
    
    // Fast-forward while still hovering - should stay visible
    vi.advanceTimersByTime(5000);
    expect(controls).toHaveClass('opacity-100');
    
    // Unhover
    await user.unhover(controls);
    
    // Fast-forward after unhover - should hide
    vi.advanceTimersByTime(3000);
    await waitFor(() => {
      expect(controls).toHaveClass('opacity-0');
    });
  });

  it('should remain visible during button interactions', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<ZoomControls {...mockProps} />);
    
    const controls = screen.getByTestId('zoom-controls');
    const zoomInButton = screen.getByTitle(/zoom in/i);
    
    // Hide initially
    vi.advanceTimersByTime(3000);
    await waitFor(() => {
      expect(controls).toHaveClass('opacity-0');
    });
    
    // Click zoom in button
    await user.click(zoomInButton);
    
    // Should be visible and function called
    expect(controls).toHaveClass('opacity-100');
    expect(mockProps.zoomIn).toHaveBeenCalled();
    
    // Should reset the hide timer
    vi.advanceTimersByTime(2000); // Less than 3 seconds
    expect(controls).toHaveClass('opacity-100'); // Still visible
    
    vi.advanceTimersByTime(1500); // Total 3.5 seconds
    await waitFor(() => {
      expect(controls).toHaveClass('opacity-0'); // Now hidden
    });
  });

  it('should be visible in print mode (no auto-hide)', () => {
    // Simulate print media query
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: query === 'print',
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    });

    render(<ZoomControls {...mockProps} />);
    
    const controls = screen.getByTestId('zoom-controls');
    
    // Should be visible and not hide in print mode
    vi.advanceTimersByTime(5000);
    expect(controls).toHaveClass('opacity-100');
  });
});
