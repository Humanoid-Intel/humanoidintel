import type { Metadata } from 'next'
import fs from 'fs'
import path from 'path'
import Header from '@/components/Header'
import TickerTape from '@/components/TickerTape'
import Footer from '@/components/Footer'
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

export default function MapPage() {
  const dataPath = path.join(process.cwd(), 'content/data/deployment-locations.json')
  const locations: DeploymentLocation[] = JSON.parse(fs.readFileSync(dataPath, 'utf-8'))

  return (
    <>
      <Header />
      <TickerTape />
      <MapClient locations={locations} />
      <Footer />
    </>
  )
}
