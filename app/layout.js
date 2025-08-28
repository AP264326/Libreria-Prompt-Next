// app/layout.js
import './globals.css'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import Script from 'next/script'

export const metadata = {
  title: 'Prompt Library B2B',
  description: 'Libreria di prompt'
}

export default function RootLayout({ children }) {
  return (
    <html lang="it">
      <body>
        {/* Mammoth (browser build) per import .docx */}
        <Script
          src="https://unpkg.com/mammoth@1.4.2/mammoth.browser.min.js"
          strategy="afterInteractive"
        />
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
