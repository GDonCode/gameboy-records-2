// components/LazyMount.tsx
// Renders its children only once the placeholder is close to the screen. Keeps heavy Home sections (the record
// crate) from loading their images and scripts until the visitor scrolls near them. The placeholder holds the
// section's height, so anchor jumps and the scrollbar behave the same before and after.
'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

export default function LazyMount({ children, className = '' }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || near) return;
    if (!('IntersectionObserver' in window)) {
      setNear(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNear(true);
          io.disconnect();
        }
      },
      { rootMargin: '100% 0px' }, // start a screen ahead
    );
    io.observe(el);
    return () => io.disconnect();
  }, [near]);

  return (
    <div ref={ref} className={className}>
      {near ? children : null}
    </div>
  );
}
