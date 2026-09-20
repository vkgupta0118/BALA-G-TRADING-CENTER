import { type ElementType, type ReactNode, useEffect, useRef } from 'react';

/**
 * Subtle scroll reveal (fade + 12px rise). Content is visible by default for
 * crawlers/no-JS (`.no-js .reveal`) and for prefers-reduced-motion.
 */
export function Reveal({
  as: Tag = 'div',
  className = '',
  children,
  ...rest
}: {
  as?: ElementType;
  className?: string;
  children: ReactNode;
  id?: string;
  'aria-labelledby'?: string;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !('IntersectionObserver' in window)) {
      el?.classList.add('is-visible');
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        }
      },
      { rootMargin: '0px 0px -10% 0px' },
    );
    io.observe(el);
    // Safety net: never leave content hidden if the observer does not fire (e.g. print, odd embeds).
    const timer = window.setTimeout(() => el.classList.add('is-visible'), 2500);
    return () => {
      io.disconnect();
      window.clearTimeout(timer);
    };
  }, []);

  return (
    <Tag ref={ref} className={`reveal ${className}`.trim()} {...rest}>
      {children}
    </Tag>
  );
}
