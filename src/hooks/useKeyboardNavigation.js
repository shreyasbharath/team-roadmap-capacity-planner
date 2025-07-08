// src/hooks/useKeyboardNavigation.js
import { useEffect } from 'react';

/**
 * Custom hook for keyboard navigation and shortcuts
 */
export const useKeyboardNavigation = ({ 
  containerRef, 
  zoomIn, 
  zoomOut, 
  resetZoom 
}) => {
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Zoom shortcuts
      if (e.ctrlKey || e.metaKey) {
        switch(e.key) {
          case '=':
          case '+':
            e.preventDefault();
            zoomIn();
            break;
          case '-':
            e.preventDefault();
            zoomOut();
            break;
          case '0':
            e.preventDefault();
            resetZoom();
            break;
        }
      }
      
      // Arrow key navigation
      if (containerRef.current && !e.ctrlKey && !e.metaKey) {
        const container = containerRef.current;
        const scrollAmount = 50;
        
        switch(e.key) {
          case 'ArrowLeft':
            e.preventDefault();
            container.scrollLeft -= scrollAmount;
            break;
          case 'ArrowRight':
            e.preventDefault();
            container.scrollLeft += scrollAmount;
            break;
          case 'ArrowUp':
            e.preventDefault();
            container.scrollTop -= scrollAmount;
            break;
          case 'ArrowDown':
            e.preventDefault();
            container.scrollTop += scrollAmount;
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [containerRef, zoomIn, zoomOut, resetZoom]);
};
