import React from 'react';
import { navigateClientPath } from './next-navigation';

export interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  children: React.ReactNode;
  prefetch?: boolean;
  replace?: boolean;
  scroll?: boolean;
}

export default function Link({
  href,
  children,
  className,
  onClick,
  prefetch: _prefetch,
  replace,
  scroll: _scroll,
  ...props
}: LinkProps) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onClick) {
      onClick(e);
    }
    if (e.defaultPrevented) {
      return;
    }

    if (href.startsWith('#') && href.length > 1) {
      const targetEl = document.getElementById(href.slice(1));
      if (targetEl) {
        e.preventDefault();
        targetEl.scrollIntoView({ behavior: 'smooth' });
      }
      return;
    }

    // Client-side SPA navigation for internal paths
    if (href.startsWith('/') && !href.startsWith('//')) {
      e.preventDefault();
      navigateClientPath(href, Boolean(replace));
    }
  };

  return (
    <a
      href={href}
      className={className}
      onClick={handleClick}
      {...props}
    >
      {children}
    </a>
  );
}
