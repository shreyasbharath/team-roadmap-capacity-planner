import { useState } from 'react';

/**
 * Hook for managing zoom functionality
 */
export const useZoom = (initialZoom = 1) => {
  const [zoom, setZoom] = useState(initialZoom);

  const zoomIn = () => setZoom(prev => Math.min(prev + 0.1, 2));
  const zoomOut = () => setZoom(prev => Math.max(prev - 0.1, 0.5));
  const resetZoom = () => setZoom(1);

  return { zoom, zoomIn, zoomOut, resetZoom };
};