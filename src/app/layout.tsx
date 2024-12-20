import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/lib/providers/next-theme-provider';
import { SessionProvider } from 'next-auth/react';
import { NextSessionProvider } from '@/lib/providers/session-provider';
import { EdgeStoreProvider } from '@/lib/providers/edgestore';
import AppStateProvider from '@/lib/providers/state-provider';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Create Next App',
  description: 'Generated by create next app',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute={'class'}
          defaultTheme="dark"
          enableSystem={true}
        >
          <NextSessionProvider>
            <AppStateProvider>
              <EdgeStoreProvider>{children}</EdgeStoreProvider>
            </AppStateProvider>
          </NextSessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
