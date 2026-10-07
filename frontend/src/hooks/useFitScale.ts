import { useCallback, useRef, useState } from 'react';

// Returns a callback ref and the scale needed to fit `designWidth` into the
// referenced element's width. Uses ResizeObserver so it reacts to any layout
// change (scrollbars appearing, late mounts), not just window resizes.
export function useFitScale<T extends HTMLElement>(designWidth: number) {
  const [scale, setScale] = useState(1);
  const observerRef = useRef<ResizeObserver | null>(null);

  const ref = useCallback(
    (node: T | null) => {
      observerRef.current?.disconnect();
      observerRef.current = null;
      if (!node) return;

      const update = () => setScale(node.offsetWidth / designWidth);
      update();
      observerRef.current = new ResizeObserver(update);
      observerRef.current.observe(node);
    },
    [designWidth],
  );

  return [ref, scale] as const;
}
