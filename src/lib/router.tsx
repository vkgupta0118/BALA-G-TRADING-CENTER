import {
  type AnchorHTMLAttributes,
  createContext,
  type MouseEvent,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { stripBase, withBase } from '@/config/env';

/**
 * Minimal, dependency-free client-side router.
 * - Works with static pre-rendering (initial path is provided by the server)
 * - Uses the History API; falls back to full navigation when JS is off
 * - Manages focus + scroll on navigation for accessibility
 */

interface RouterState {
  path: string;
  navigate: (to: string, options?: { replace?: boolean }) => void;
}

const RouterContext = createContext<RouterState | null>(null);

export function normalisePath(path: string): string {
  const clean = path.split('?')[0]?.split('#')[0] ?? '/';
  const trimmed = clean.replace(/\/+$/, '');
  return trimmed === '' ? '/' : trimmed;
}

export function RouterProvider({
  initialPath,
  children,
}: {
  initialPath: string;
  children: ReactNode;
}) {
  const [path, setPath] = useState(() => normalisePath(initialPath));

  useEffect(() => {
    const onPop = () => setPath(normalisePath(stripBase(window.location.pathname)));
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const navigate = useCallback((to: string, options?: { replace?: boolean }) => {
    const next = normalisePath(to);
    const hash = to.includes('#') ? to.slice(to.indexOf('#')) : '';
    const url = withBase(to);
    if (options?.replace) window.history.replaceState(null, '', url);
    else window.history.pushState(null, '', url);
    setPath(next);
    // Scroll + focus management: move to the hash target if any, otherwise to top + main heading.
    window.requestAnimationFrame(() => {
      if (hash) {
        const target = document.querySelector<HTMLElement>(hash);
        if (target) {
          target.scrollIntoView({ block: 'start' });
          target.focus({ preventScroll: true });
          return;
        }
      }
      window.scrollTo({ top: 0 });
      const main = document.getElementById('main');
      main?.focus({ preventScroll: true });
    });
  }, []);

  const value = useMemo(() => ({ path, navigate }), [path, navigate]);
  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>;
}

export function useRouter(): RouterState {
  const ctx = useContext(RouterContext);
  if (!ctx) throw new Error('useRouter must be used within RouterProvider');
  return ctx;
}

type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  to: string;
  children: ReactNode;
};

function isModifiedEvent(event: MouseEvent): boolean {
  return event.metaKey || event.altKey || event.ctrlKey || event.shiftKey || event.button !== 0;
}

/** Internal link that performs client-side navigation and marks the active route. */
export function Link({ to, children, onClick, ...rest }: LinkProps) {
  const { path, navigate } = useRouter();
  const isInternal = to.startsWith('/') && !to.startsWith('//');
  const isActive = isInternal && normalisePath(to) === path;

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (!isInternal || event.defaultPrevented || isModifiedEvent(event) || rest.target === '_blank')
      return;
    event.preventDefault();
    navigate(to);
  };

  return (
    <a
      href={isInternal ? withBase(to) : to}
      onClick={handleClick}
      aria-current={isActive ? 'page' : undefined}
      {...rest}
    >
      {children}
    </a>
  );
}
