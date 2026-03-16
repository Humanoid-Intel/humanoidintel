import type { Metadata } from 'next'
import { getJobs } from '@/lib/content'
import JobsClient from './JobsClient'

export const metadata: Metadata = {
  title: 'Jobs — humanoidintel.ai',
  description:
    'Open roles across the humanoid robotics industry. Aggregated daily from Figure AI, Boston Dynamics, Agility Robotics, Physical Intelligence, and 40+ companies.',
  alternates: { canonical: 'https://humanoidintel.ai/jobs' },
  openGraph: {
    title: 'Humanoid Robotics Jobs — humanoidintel.ai',
    description:
      'Open roles across the humanoid robotics industry, updated hourly.',
    url: 'https://humanoidintel.ai/jobs',
  },
}

export default function JobsPage() {
  const jobs = getJobs()
  return <JobsClient jobs={jobs} />
}
