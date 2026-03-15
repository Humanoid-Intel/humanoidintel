import type { Metadata, Viewport } from 'next'
import { Inter, Space_Grotesk, JetBrains_Mono } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'humanoidintel.ai — The Bloomberg Terminal of Humanoid Robotics',
  description:
    'Real-time intelligence, funding data, robot profiles, and market analysis for the humanoid robotics industry.',
  keywords: [
    'humanoid robotics',
    'robots',
    'AI',
    'funding',
    'Figure AI',
    'Tesla Optimus',
    'Boston Dynamics',
    'Agility Robotics',
    'humanoid intelligence',
    'robotics market',
    'robot funding',
    'robotics research',
  ],
  authors: [{ name: 'humanoidintel.ai' }],
  creator: 'humanoidintel.ai',
  publisher: 'humanoidintel.ai',
  metadataBase: new URL('https://humanoidintel.ai'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://humanoidintel.ai',
    siteName: 'humanoidintel.ai',
    title: 'humanoidintel.ai — The Bloomberg Terminal of Humanoid Robotics',
    description:
      'Real-time intelligence, funding data, robot profiles, and market analysis for the humanoid robotics industry.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'humanoidintel.ai — The Bloomberg Terminal of Humanoid Robotics',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'humanoidintel.ai — The Bloomberg Terminal of Humanoid Robotics',
    description:
      'Real-time intelligence, funding data, robot profiles, and market analysis for the humanoid robotics industry.',
    images: ['/og-image.png'],
    creator: '@humanoidintel',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export const viewport: Viewport = {
  themeColor: '#050608',
  colorScheme: 'dark',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        <script
          defer
          data-domain="humanoidintel.ai"
          src="https://plausible.io/js/script.js"
        />
      </head>
      <body className="antialiased">
        <div className="max-w-[1600px] mx-auto">{children}</div>
      </body>
    </html>
  )
}
