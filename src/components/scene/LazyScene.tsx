import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { useI18n } from '@/i18n';
import { SceneFallback } from './SceneFallback';

const MaterialsScene = lazy(() => import('./MaterialsScene'));

/**
 * Renders the static SVG immediately (also on the server), then upgrades to the
 * interactive 3D scene once the hero is on screen and the browser is idle.
 * Stays static on save-data connections or when the device reports ≤ 2 GB RAM.
 */
export function LazyScene() {
  const { t } = useI18n();
  const ref = useRef<HTMLDivElement>(null);
  const [enhance, setEnhance] = useState(false);

  useEffect(() => {
    const nav = navigator as Navigator & {
      connection?: { saveData?: boolean };
      deviceMemory?: number;
    };
    if (nav.connection?.saveData) return;
    if (typeof nav.deviceMemory === 'number' && nav.deviceMemory <= 2) return;
    if (!('IntersectionObserver' in window)) {
      setEnhance(true);
      return;
    }
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          observer.disconnect();
          const start = () => setEnhance(true);
          const w = window as Window & {
            requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number;
          };
          if (typeof w.requestIdleCallback === 'function') {
            w.requestIdleCallback(start, { timeout: 1200 });
          } else {
            window.setTimeout(start, 200);
          }
        }
      },
      { rootMargin: '120px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const label = t('hero.sceneLabel');
  return (
    <div ref={ref} className="hero-visual" data-testid="hero-visual">
      {enhance ? (
        <Suspense fallback={<SceneFallback label={label} />}>
          <MaterialsScene label={label} hint="Drag to rotate" />
        </Suspense>
      ) : (
        <SceneFallback label={label} />
      )}
    </div>
  );
}
