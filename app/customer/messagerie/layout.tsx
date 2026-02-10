import { ReactNode } from 'react';

export default function CustomerMessagerieLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div>
      {children}
    </div>
  );
}