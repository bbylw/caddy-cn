import { useEffect, useState } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

function initial(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia(QUERY).matches;
}

export function usePrefersReducedMotion(): boolean {
  const [reduce, setReduce] = useState(initial);

  useEffect(() => {
    const mq = window.matchMedia(QUERY);
    setReduce(mq.matches);
    const onChange = (event: MediaQueryListEvent) => setReduce(event.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return reduce;
}
