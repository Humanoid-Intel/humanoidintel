import type { Metadata } from 'next'
import fs from 'fs'
import path from 'path'
import Header from '@/components/Header'
import TickerTape from '@/components/TickerTape'
import Footer from '@/components/Footer'
import { SchemaMarkup } from '@/components/SchemaMarkup'
import MapClient from './MapClient'

export const metadata: Metadata = {
  title: 'Deployment Map — humanoidintel.ai',
  description:
    'Interactive global map of humanoid robot deployments. See where Tesla Optimus, Agility Digit, Figure AI, UBTECH, Unitree, and other humanoid robots are deployed worldwide.',
  alternates: { canonical: 'https://humanoidintel.ai/map' },
  openGraph: {
    title: 'Deployment Map — humanoidintel.ai',
    description:
      'Interactive global map of humanoid robot deployments worldwide.',
    url: 'https://humanoidintel.ai/map',
    images: [{ url: 'https://humanoidintel.ai/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@HumanoidIntelAI',
  },
}

interface DeploymentLocation {
  id: string
  company: string
  robot: string
  location: string
  country: string
  lat: number
  lng: number
  units: number
  type: string
  note: string
}

const mapSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Deployment Map',
  description:
    'Interactive global map of humanoid robot deployments. See where Tesla Optimus, Agility Digit, Figure AI, UBTECH, Unitree, and other humanoid robots are deployed worldwide.',
  url: 'https://humanoidintel.ai/map',
  breadcrumb: {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://humanoidintel.ai' },
      { '@type': 'ListItem', position: 2, name: 'Deployment Map', item: 'https://humanoidintel.ai/map' },
    ],
  },
}

export default function MapPage() {
  const dataPath = path.join(process.cwd(), 'content/data/deployment-locations.json')
  const locations: DeploymentLocation[] = JSON.parse(fs.readFileSync(dataPath, 'utf-8'))

  return (
    <>
      <SchemaMarkup schema={mapSchema} />
      <Header />
      <TickerTape />
      <MapClient locations={locations} />
      <Footer />
    </>
  )
}
