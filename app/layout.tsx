import '@/styles/globals.css';
import { Inter } from 'next/font/google';
import type { Metadata } from 'next';
import { Toaster } from 'sonner';
import Link from 'next/link';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Tealium MCP Configuration',
  description: 'Configure and test your Tealium MCP integration',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <header className="bg-purple-600 text-white p-4">
          <div className="container mx-auto flex justify-between items-center">
            <div className="text-lg font-bold">Tealium MCP Ingestion App</div>
            <nav>
              <ul className="flex space-x-4">
                <li>
                  <Link href="/" className="hover:text-purple-200">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/ai-model-config" className="hover:text-purple-200">
                    AI Config
                  </Link>
                </li>
                <li>
                  <Link href="/ai-model-documentation" className="hover:text-purple-200">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link href="/ai-model-debug" className="hover:text-purple-200">
                    Debug
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </header>
        <Toaster position="top-right" />
        {children}
      </body>
    </html>
  );
} 