/**
 * Hook for responsive board sizing
 * Calculates square size based on viewport width and board columns
 */

import { useState, useEffect } from 'react';

export interface UseResponsiveBoardOptions {
  boardCols: number;
  maxWidth: number;
  minSquareSize?: number;
  maxSquareSize?: number;
}

export interface UseResponsiveBoardResult {
  squareSize: number;
}

export function useResponsiveBoard({
  boardCols,
  maxWidth,
  minSquareSize = 30,
  maxSquareSize = 80,
}: UseResponsiveBoardOptions): UseResponsiveBoardResult {
  const [squareSize, setSquareSize] = useState<number>(() => {
    // Initial calculation - will be updated on mount
    if (typeof window !== 'undefined') {
      const viewportWidth = window.innerWidth;
      const availableWidth = Math.min(viewportWidth - 40, maxWidth);
      return Math.max(minSquareSize, Math.min(maxSquareSize, availableWidth / boardCols));
    }
    return minSquareSize;
  });

  useEffect(() => {
    const calculateSquareSize = () => {
      const viewportWidth = window.innerWidth;
      const availableWidth = Math.min(viewportWidth - 40, maxWidth);
      const calculated = availableWidth / boardCols;
      setSquareSize(Math.max(minSquareSize, Math.min(maxSquareSize, calculated)));
    };

    // Initial calculation
    calculateSquareSize();

    // Listen for resize
    window.addEventListener('resize', calculateSquareSize);

    return () => {
      window.removeEventListener('resize', calculateSquareSize);
    };
  }, [boardCols, maxWidth, minSquareSize, maxSquareSize]);

  return { squareSize };
}