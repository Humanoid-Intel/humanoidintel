import type { Metadata } from 'next'
import { getJobs } from '@/lib/content'
import { SchemaMarkup } from '@/components/SchemaMarkup'
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

const employmentTypeMap: Record<string, string> = {
  'full-time': 'FULL_TIME',
  'part-time': 'PART_TIME',
  contract: 'CONTRACTOR',
  internship: 'INTERN',
}

export default function JobsPage() {
  const jobs = getJobs()
  const topJobs = jobs.filter((j) => j.status === 'open').slice(0, 10)

  return (
    <>
      {topJobs.map((job) => (
        <SchemaMarkup
          key={job.id}
          schema={{
            '@context': 'https://schema.org',
            '@type': 'JobPosting',
            title: job.title,
            description: `${job.title} at ${job.company} — ${job.department}`,
            datePosted: job.postedAt,
            validThrough: job.updatedAt,
            employmentType: employmentTypeMap[job.type] || 'FULL_TIME',
            hiringOrganization: {
              '@type': 'Organization',
              name: job.company,
              sameAs: `https://humanoidintel.ai/companies/${job.companySlug}`,
            },
            jobLocation: {
              '@type': 'Place',
              address: job.location,
            },
            jobLocationType: job.remote ? 'TELECOMMUTE' : undefined,
            url: job.url,
          }}
        />
      ))}
      <JobsClient jobs={jobs} />
    </>
  )
}
