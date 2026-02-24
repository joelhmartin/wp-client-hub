import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'WP Client Hub',
  description: 'WordPress site management dashboard',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="h-screen overflow-hidden">
        {children}
      </body>
    </html>
  );
}
