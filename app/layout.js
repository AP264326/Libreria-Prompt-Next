// app/layout.js
import './globals.css';
import Script from 'next/script';

export const metadata = {
  title: 'Prompt Library B2B',
  description: 'Libreria di prompt per business e vendite B2B.',
  metadataBase: new URL('https://libreria-prompt-next.vercel.app'),
  openGraph: {
    title: 'Prompt Library B2B',
    description: 'Raccolta di prompt pronti per scouting, prospecting e proposition.',
    url: 'https://libreria-prompt-next.vercel.app',
    siteName: 'Prompt Library B2B',
    images: [{ url: '/icon.png', width: 512, height: 512, alt: 'Prompt Library B2B' }],
    locale: 'it_IT',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Prompt Library B2B',
    description: 'Raccolta di prompt pronti per il B2B.',
    images: ['/icon.png'],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="it" data-color-scheme="light" suppressHydrationWarning>
      <body>
        {/* Mammoth per import .docx (serve a page.js) */}
        <Script
          src="https://unpkg.com/mammoth@1.4.2/mammoth.browser.min.js"
          strategy="afterInteractive"
        />
        {children}
      </body>
    </html>
  );
}
