import { useEffect, useRef } from 'react';

/**
 * Хук для обработки touch pinch-to-zoom
 * @param containerRef - Реф контейнера, на котором слушаем события
 * @param onZoom - Колбэк при изменении масштаба
 */
export function usePinchZoom(
 containerRef: React.RefObject<HTMLDivElement | null>,
 onZoom: (delta: number) => void
) {
 const lastDistanceRef = useRef<number | null>(null);

 useEffect(() => {
  const container = containerRef.current;
  if (!container) return;

  function getDistance(touches: TouchList): number {
   const [t1, t2] = [touches[0], touches[1]];
   const dx = t1.clientX - t2.clientX;
   const dy = t1.clientY - t2.clientY;
   return Math.sqrt(dx * dx + dy * dy);
  }

  function getCenter(touches: TouchList): { x: number; y: number } {
   const [t1, t2] = [touches[0], touches[1]];
   return {
    x: (t1.clientX + t2.clientX) / 2,
    y: (t1.clientY + t2.clientY) / 2,
   };
  }

  function handleTouchStart(e: TouchEvent) {
   if (e.touches.length === 2) {
    e.preventDefault();
    lastDistanceRef.current = getDistance(e.touches);
   }
  }

  function handleTouchMove(e: TouchEvent) {
   const container = containerRef.current;
   if (!container) return;
   
   if (e.touches.length === 2 && lastDistanceRef.current !== null) {
    e.preventDefault();
    const newDistance = getDistance(e.touches);
    const delta = (newDistance - lastDistanceRef.current) / 100;
    const _center = getCenter(e.touches);
    
    const _rect = container.getBoundingClientRect();
    onZoom(delta);
    lastDistanceRef.current = newDistance;
   }
  }

  function handleTouchEnd() {
   lastDistanceRef.current = null;
  }

  container.addEventListener('touchstart', handleTouchStart, { passive: false });
  container.addEventListener('touchmove', handleTouchMove, { passive: false });
  container.addEventListener('touchend', handleTouchEnd);

  return () => {
   container.removeEventListener('touchstart', handleTouchStart);
   container.removeEventListener('touchmove', handleTouchMove);
   container.removeEventListener('touchend', handleTouchEnd);
  };
 }, [containerRef, onZoom]);
}
