
import type { Metadata, Viewport } from 'next';
import './globals.css';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { Toaster } from '@/components/ui/toaster';

export const viewport: Viewport = {
  themeColor: '#3b82f6',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: 'AquaFlow Planner',
  description: 'A modern task manager for your daily flow.',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'AquaFlow',
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><rect width=%22100%22 height=%22100%22 rx=%2222%22 fill=%22%233b82f6%22/><path d=%22M20 40h60M42 40v40%22 stroke=%22white%22 stroke-width=%228%22 stroke-linecap=%22round%22/><rect x=%2220%22 y=%2220%22 width=%2260%22 height=%2260%22 rx=%228%22 fill=%22none%22 stroke=%22white%22 stroke-width=%228%22/></svg>',
    apple: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><rect width=%22100%22 height=%22100%22 rx=%2222%22 fill=%22%233b82f6%22/><path d=%22M20 40h60M42 40v40%22 stroke=%22white%22 stroke-width=%228%22 stroke-linecap=%22round%22/><rect x=%2220%22 y=%2220%22 width=%2260%22 height=%2260%22 rx=%228%22 fill=%22none%22 stroke=%22white%22 stroke-width=%228%22/></svg>',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased bg-background text-foreground">
        <FirebaseClientProvider>
          {children}
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
