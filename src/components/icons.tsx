/**
 * Inline SVG icon set. We avoid emoji-as-icons (inconsistent across platforms,
 * not themeable) and ship no icon dependency. All icons inherit `currentColor`
 * and a consistent 1.75 stroke; size via `className` (default 1em square).
 */
import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

/** Shape of every icon export — handy for icon-by-role maps. */
export type IconComponent = (props: IconProps) => React.JSX.Element;

function Svg({ children, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      width="1em"
      height="1em"
      aria-hidden
      {...props}
    >
      {children}
    </svg>
  );
}

export function IconOverview(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="3" y="3" width="7" height="9" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" />
    </Svg>
  );
}

export function IconEvents(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M3 12h3l2-5 4 10 2.5-7 1.5 2H21" />
    </Svg>
  );
}

export function IconUsers(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3.5 19a5.5 5.5 0 0 1 11 0" />
      <path d="M16 5.2a3.2 3.2 0 0 1 0 6" />
      <path d="M17.5 13.6A5.5 5.5 0 0 1 20.5 19" />
    </Svg>
  );
}

export function IconHelp(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.2 9.3a2.8 2.8 0 0 1 5.4 1c0 1.9-2.6 2.2-2.6 3.7" />
      <path d="M12 17.2h.01" />
    </Svg>
  );
}

export function IconClose(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M6 6l12 12M18 6 6 18" />
    </Svg>
  );
}

export function IconChevronRight(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M9 6l6 6-6 6" />
    </Svg>
  );
}

export function IconChevronDown(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M6 9l6 6 6-6" />
    </Svg>
  );
}

export function IconArrowLeft(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M19 12H5M11 6l-6 6 6 6" />
    </Svg>
  );
}

export function IconUser(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="8" r="3.4" />
      <path d="M5.5 19.5a6.5 6.5 0 0 1 13 0" />
    </Svg>
  );
}

export function IconLock(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </Svg>
  );
}

export function IconSignOut(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3" />
      <path d="M10 17l-5-5 5-5M5 12h11" />
    </Svg>
  );
}

/** Stylized penguin-on-a-wave brand mark. Decorative; paired with the wordmark. */
export function PenguinMark(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="1em" height="1em" aria-hidden {...props}>
      {/* body */}
      <path
        d="M12 2.5c-3 0-5 2.4-5 6.2 0 2 .3 3.4.3 5.1 0 2.7-1 3.6-1 5.1 0 1 .9 1.6 2 1.6h7.4c1.1 0 2-.6 2-1.6 0-1.5-1-2.4-1-5.1 0-1.7.3-3.1.3-5.1 0-3.8-2-6.2-5-6.2Z"
        fill="currentColor"
      />
      {/* belly */}
      <path
        d="M12 6.5c-1.7 0-2.6 1.6-2.6 4.2 0 1.6.2 2.7.2 4.1 0 2.2-.7 2.9-.7 4.1 0 .5.5.8 1.1.8h4c.6 0 1.1-.3 1.1-.8 0-1.2-.7-1.9-.7-4.1 0-1.4.2-2.5.2-4.1 0-2.6-.9-4.2-2.6-4.2Z"
        fill="#0a0f1e"
      />
      {/* eyes + beak */}
      <circle cx="10.4" cy="8" r="0.7" fill="#0a0f1e" />
      <circle cx="13.6" cy="8" r="0.7" fill="#0a0f1e" />
      <path d="M11 9.6h2l-1 1.4Z" fill="#f59e0b" />
    </svg>
  );
}
