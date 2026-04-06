import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: "Hue's Who",
  description: 'A creative clue-card guessing game for teams',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col antialiased">
        {children}
      </body>
    </html>
  );
}
