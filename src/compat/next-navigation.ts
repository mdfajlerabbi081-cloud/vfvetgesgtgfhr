import { useState, useEffect, useMemo } from 'react';

export function navigateClientPath(href: string, replace = false): void {
  if (typeof window === 'undefined') return;
  try {
    if (replace) {
      window.history.replaceState({}, '', href);
    } else {
      window.history.pushState({}, '', href);
    }
    window.dispatchEvent(new Event('trendverse_route_change'));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch {
    window.location.href = href;
  }
}

export function useRouter() {
  return useMemo(
    () => ({
      push: (href: string) => navigateClientPath(href, false),
      replace: (href: string) => navigateClientPath(href, true),
      back: () => {
        if (typeof window !== 'undefined') {
          window.history.back();
        }
      },
      forward: () => {
        if (typeof window !== 'undefined') {
          window.history.forward();
        }
      },
      refresh: () => {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('trendverse_route_change'));
        }
      },
      prefetch: async (_href: string) => {},
    }),
    []
  );
}

export function usePathname(): string {
  const [pathname, setPathname] = useState<string>(() =>
    typeof window !== 'undefined' ? window.location.pathname || '/' : '/'
  );

  useEffect(() => {
    const sync = () => {
      setPathname(window.location.pathname || '/');
    };
    window.addEventListener('popstate', sync);
    window.addEventListener('trendverse_route_change', sync);
    return () => {
      window.removeEventListener('popstate', sync);
      window.removeEventListener('trendverse_route_change', sync);
    };
  }, []);

  return pathname;
}

export function useSearchParams(): URLSearchParams {
  const [search, setSearch] = useState<string>(() =>
    typeof window !== 'undefined' ? window.location.search : ''
  );

  useEffect(() => {
    const sync = () => {
      setSearch(window.location.search);
    };
    window.addEventListener('popstate', sync);
    window.addEventListener('trendverse_route_change', sync);
    return () => {
      window.removeEventListener('popstate', sync);
      window.removeEventListener('trendverse_route_change', sync);
    };
  }, []);

  return useMemo(() => new URLSearchParams(search), [search]);
}
