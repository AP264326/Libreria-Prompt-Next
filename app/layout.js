// app/layout.js
import './globals.css'
import Script from 'next/script'

export const metadata = {
  title: 'Prompt Library B2B',
  description: 'Libreria di prompt per business e vendite B2B',
  openGraph: {
    title: 'Prompt Library B2B',
    description: 'Raccolta di prompt pronti per scouting, prospecting e proposition.',
    url: 'https://libreria-prompt-next.vercel.app',
    siteName: 'Prompt Library B2B',
    images: [{ url: '/icon.png', width: 512, height: 512, alt: 'Prompt Library B2B' }],
    locale: 'it_IT',
    type: 'website'
  },
  twitter: {
    card: 'summary',
    title: 'Prompt Library B2B',
    description: 'Raccolta di prompt pronti per il B2B',
    images: ['/icon.png']
  }
}

export default function RootLayout({ children }) {
  return (
    <html lang="it">
      <head />
      <body>
        {/* Script: inizializza tema da localStorage o preferenza di sistema */}
        <Script id="theme-init" strategy="beforeInteractive">
          {`(function(){
            try {
              var t = localStorage.getItem('color-scheme');
              if (!t) {
                var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                t = prefersDark ? 'dark' : 'light';
              }
              document.documentElement.setAttribute('data-color-scheme', t);
            } catch(e) {}
          })();`}
        </Script>
        {children}
      </body>
    </html>
  )
}

