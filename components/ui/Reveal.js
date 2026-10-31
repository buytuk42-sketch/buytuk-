'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Scroll-reveal primitive (brief §7).
 * - Uses IntersectionObserver, so it costs nothing on idle.
 * - Disables itself entirely under prefers-reduced-motion.
 * - Honours the "motion off" toggle by reading data-motion on <html>.
 */
export default function Reveal({ children, delay = 0, as: Tag = 'div', className = '', style, ...rest }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  const [cancelled, setCancelled] = useState(false);

  useEffect(() => {
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduce || document.documentElement.dataset.motion === 'off') {
      setCancelled(true);
      setVisible(true);
      return;
    }

    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.08 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      className={className}
      data-reveal={cancelled ? undefined : ''}
      data-visible={visible ? 'true' : 'false'}
      style={{ '--reveal-delay': `${delay}ms`, ...style }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
