import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Research Hub — humanoidintel.ai',
  description:
    'Key academic papers shaping humanoid robotics — locomotion, manipulation, sim-to-real transfer, VLA foundation models, and tactile sensing research.',
  alternates: {
    canonical: 'https://humanoidintel.ai/research',
  },
  openGraph: {
    title: 'Research Hub — humanoidintel.ai',
    description:
      'Key academic papers shaping humanoid robotics — locomotion, manipulation, sim-to-real transfer, VLA foundation models, and tactile sensing research.',
    url: 'https://humanoidintel.ai/research',
    siteName: 'humanoidintel.ai',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Research Hub — humanoidintel.ai',
    description:
      'Key academic papers shaping humanoid robotics — locomotion, manipulation, sim-to-real transfer, VLA foundation models, and tactile sensing research.',
    creator: '@humanoidintel',
  },
}

export default function ResearchLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
