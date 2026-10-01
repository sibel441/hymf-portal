import type { Metadata } from 'next';
import { Inter, JetBrains_Mono, Newsreader } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin', 'latin-ext'],
});

const newsreader = Newsreader({
  variable: '--font-newsreader',
  subsets: ['latin', 'latin-ext'],
  style: ['normal', 'italic'],
});

const jetbrains = JetBrains_Mono({
  variable: '--font-jetbrains',
  subsets: ['latin', 'latin-ext'],
});

export const metadata: Metadata = {
  title: 'HYMF Portal | Ankara Üniversitesi Hesaplamalı Yoğun Madde Fiziği',
  description: 'Ankara Üniversitesi Fen Fakültesi / Enstitüsü Hesaplamalı Yoğun Madde Fiziği Araştırma Grubu Özel Akademik Portalı',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="tr"
      className={`${inter.variable} ${newsreader.variable} ${jetbrains.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col text-slate-100 font-sans">
        <AuthProvider>
          <Navbar />
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-10">
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
