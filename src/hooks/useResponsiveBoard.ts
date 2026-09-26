/**
 * Hook for responsive board sizing
 * Calculates square size based on viewport width and board columns
 */

import { useState, useEffect, useCallback } from 'react';

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
  const calculateSquareSize = useCallback((): number => {
    if (typeof window === 'undefined') return minSquareSize;
    const viewportWidth = window.innerWidth;
    const availableWidth = Math.min(viewportWidth - 40, maxWidth);
    const calculated = availableWidth / boardCols;
    return Math.max(minSquareSize, Math.min(maxSquareSize, calculated));
  }, [boardCols, maxWidth, minSquareSize, maxSquareSize]);

  const [squareSize, setSquareSize] = useState<number>(calculateSquareSize);

  useEffect(() => {
    const onResize = () => setSquareSize(calculateSquareSize());

    // Recalculate whenever the inputs change, then listen for resizes
    onResize();
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
    };
  }, [calculateSquareSize]);

  return { squareSize };
}