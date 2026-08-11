import type { Metadata } from 'next';
import { Fraunces, Inter, JetBrains_Mono } from 'next/font/google';
import '../styles/globals.css';
import '@phosphor-icons/web/light';

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap'
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap'
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap'
});

export const metadata: Metadata = {
  title: 'Radar Quest',
  description: '把"看到热点"变成"产出一个作品"。每完成一次，就点亮一颗星。'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh" className={`${fraunces.variable} ${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="starfield min-h-screen bg-ink-900 text-bone-50 antialiased">
        {children}
      </body>
    </html>
  );
}
