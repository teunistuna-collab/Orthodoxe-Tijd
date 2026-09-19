import type { ReactNode } from 'react';

type Props = { title: string; eyebrow?: string; children: ReactNode };

export default function ExactPageFrame({ title, eyebrow = 'Orthodoxe Tijd', children }: Props) {
  return (
    <div className="exact-design-page">
      <div className="exact-frame">
        <div className="exact-content">{children}</div>
      </div>
    </div>
  );
}
