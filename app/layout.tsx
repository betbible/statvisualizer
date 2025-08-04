import './globals.css';
import Link from 'next/link';
import { ReactNode } from 'react';

export const metadata = {
  title: 'Betbible Multisport Prop Visualizer',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-900 text-white min-h-screen">
        <header className="bg-gray-800 border-b border-gray-700">
          <div className="max-w-7xl mx-auto flex items-center h-16 px-6">
            <div className="flex items-center space-x-2">
              {/* Placeholder logo; replace or add a public/logo.png file if desired */}
              <span className="text-2xl font-bold">Betbible Props</span>
            </div>
            <nav className="ml-8 flex space-x-2">
              {['nba', 'afl', 'nrl', 'nfl'].map((sport) => (
                <Link
                  key={sport}
                  href={`/${sport}`}
                  className="text-gray-300 hover:text-white px-3 py-2 rounded hover:bg-gray-700 transition capitalize"
                >
                  {sport}
                </Link>
              ))}
            </nav>
          </div>
        </header>
        <main className="max-w-7xl mx-auto p-6">{children}</main>
      </body>
    </html>
  );
}