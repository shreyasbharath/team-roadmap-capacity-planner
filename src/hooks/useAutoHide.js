// src/hooks/useAutoHide.js
import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Custom hook for auto-hide functionality
 * Provides visibility state and event handlers for auto-hiding UI elements
 * 
 * @param {number} timeout - Auto-hide timeout in milliseconds (default: 3000)
 * @param {boolean} disabled - Disable auto-hide (e.g., for print mode)
 * @returns {object} { isVisible, showControls, hideTimer, elementRef }
 */
export const useAutoHide = (timeout = 3000, disabled = false) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isHovering, setIsHovering] = useState(false);
  const hideTimerRef = useRef(null);
  const elementRef = useRef(null);

  // Clear existing timer
  const clearHideTimer = useCallback(() => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  }, []);

  // Show controls and reset hide timer
  const showControls = useCallback(() => {
    setIsVisible(true);
    clearHideTimer();
    
    // Don't set hide timer if disabled or hovering
    if (disabled || isHovering) return;
    
    hideTimerRef.current = setTimeout(() => {
      setIsVisible(false);
    }, timeout);
  }, [timeout, disabled, isHovering, clearHideTimer]);

  // Handle mouse enter (hover start)
  const handleMouseEnter = useCallback(() => {
    setIsHovering(true);
    setIsVisible(true);
    clearHideTimer();
  }, [clearHideTimer]);

  // Handle mouse leave (hover end)
  const handleMouseLeave = useCallback(() => {
    setIsHovering(false);
    showControls(); // This will start the hide timer
  }, [showControls]);

  // Handle user interaction (clicks, etc.)
  const handleInteraction = useCallback(() => {
    showControls();
  }, [showControls]);

  // Set up global mouse movement listener
  useEffect(() => {
    const handleMouseMove = () => {
      if (!disabled) {
        showControls();
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      clearHideTimer();
    };
  }, [showControls, disabled, clearHideTimer]);

  // Initial hide timer
  useEffect(() => {
    if (!disabled) {
      showControls();
    }
  }, [disabled, showControls]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearHideTimer();
    };
  }, [clearHideTimer]);

  return {
    isVisible,
    showControls,
    elementRef,
    handlers: {
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
      onClick: handleInteraction,
    }
  };
};

export default useAutoHide;
