import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'DevMultiplier Academy | Become a 10x-100x Developer in the Age of AI',
  description:
    'Master Domain-Driven Design, CQRS, database optimization, REST APIs, and AI-assisted development. Transform your development skills with expert-led courses designed for CTOs and senior developers.',
  keywords: [
    'DDD',
    'Domain-Driven Design',
    'CQRS',
    'SQL Server',
    'PostgreSQL',
    'REST API',
    'Next.js',
    'AI development',
    'software architecture',
    'developer training',
  ],
  authors: [{ name: 'DevMultiplier Academy' }],
  openGraph: {
    title: 'DevMultiplier Academy | Become a 10x-100x Developer',
    description: 'Master modern software architecture with AI-assisted development courses.',
    url: 'https://devmultiplier.com',
    siteName: 'DevMultiplier Academy',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DevMultiplier Academy | Become a 10x-100x Developer',
    description: 'Master modern software architecture with AI-assisted development courses.',
  },
  icons: {
    icon: '/favicon.png',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
