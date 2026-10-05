interface Props {
  className?: string;
  title?: string;
}

/** Het kruis van de site: goud met donkere rand (public/images/ui/kruis.webp, gemaakt met scripts/app-iconen.mjs). */
export default function Cross({ className = 'h-8 w-8', title = 'Kruis' }: Props) {
  return <img src="/images/ui/kruis.webp" alt={title} className={`object-contain ${className}`} decoding="async" draggable={false} />;
}
