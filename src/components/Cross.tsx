interface Props {
  className?: string;
  title?: string;
}

/** Orthodox kruis met drie dwarsbalken. */
export default function Cross({ className = 'h-8 w-8', title = 'Orthodox kruis' }: Props) {
  return (
    <svg viewBox="0 0 64 96" className={className} role="img" aria-label={title} fill="currentColor">
      <rect x="29" y="2" width="6" height="92" rx="1" />
      <rect x="20" y="12" width="24" height="5" rx="1" />
      <rect x="8" y="28" width="48" height="6" rx="1" />
      <g transform="rotate(-22 32 72)">
        <rect x="16" y="69.5" width="32" height="5" rx="1" />
      </g>
    </svg>
  );
}
