import type { CSSProperties, ReactNode, MouseEventHandler } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  href?: string;
  target?: string;
  onClick?: MouseEventHandler<HTMLAnchorElement | HTMLDivElement>;
}

/**
 * Surface primitive. Renders an `<a>` if `href` is set, otherwise a `<div>`.
 * Just a styled box — no domain knowledge.
 */
export function Card({ children, className = '', style, href, target, onClick }: CardProps) {
  if (href) {
    return (
      <a
        href={href}
        target={target ?? '_blank'}
        rel="noreferrer"
        onClick={onClick as MouseEventHandler<HTMLAnchorElement>}
        className={`card ${className}`.trim()}
        style={style}
      >
        {children}
      </a>
    );
  }
  return (
    <div className={`card ${className}`.trim()} style={style} onClick={onClick as MouseEventHandler<HTMLDivElement>}>
      {children}
    </div>
  );
}
