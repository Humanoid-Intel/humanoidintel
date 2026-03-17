import type { Metadata } from 'next'
import { SchemaMarkup } from '@/components/SchemaMarkup'

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

const researchSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Research Hub',
  description: 'Key academic papers shaping humanoid robotics — locomotion, manipulation, sim-to-real transfer, VLA foundation models, and tactile sensing research.',
  url: 'https://humanoidintel.ai/research',
  breadcrumb: {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://humanoidintel.ai' },
      { '@type': 'ListItem', position: 2, name: 'Research', item: 'https://humanoidintel.ai/research' },
    ],
  },
}

export default function ResearchLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <SchemaMarkup schema={researchSchema} />
      {children}
    </>
  )
}
