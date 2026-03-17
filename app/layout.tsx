import type { Metadata, Viewport } from 'next'
import { Inter, Space_Grotesk, JetBrains_Mono } from 'next/font/google'
import { SchemaMarkup } from '@/components/SchemaMarkup'
import { generateOrgSchema } from '@/lib/seo'
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
  },
  twitter: {
    card: 'summary_large_image',
    title: 'humanoidintel.ai — The Bloomberg Terminal of Humanoid Robotics',
    description:
      'Real-time intelligence, funding data, robot profiles, and market analysis for the humanoid robotics industry.',
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
        {/* Google Analytics */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-2V55QFKZNY" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-2V55QFKZNY');
            `,
          }}
        />
      </head>
      <body className="antialiased">
        <SchemaMarkup schema={generateOrgSchema()} />
        <div className="max-w-[1600px] mx-auto">{children}</div>
      </body>
    </html>
  )
}
