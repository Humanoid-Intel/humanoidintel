export interface Article {
  slug: string
  title: string
  date: string
  updated?: string
  category: 'breaking' | 'deep-dive' | 'market' | 'policy' | 'research'
  tags: string[]
  companies?: string[]
  robots?: string[]
  excerpt: string
  featured?: boolean
  sources?: { title: string; url: string }[]
  content?: string
}

export interface Robot {
  slug: string
  name: string
  manufacturer: string
  country: string
  status: 'prototype' | 'pilot' | 'production' | 'r&d' | 'commercial'
  height?: string
  weight?: string
  dof?: number
  payload?: string
  battery?: string
  actuatorType: string
  description: string
  deploymentNotes?: string
  fundingTotal?: string
  milestones?: { date: string; event: string }[]
  imageUrl?: string
  motorType?: string
  transmission?: string
  compute?: string
  materials?: string
  bomEstimate?: string
  price?: string
}

export interface Brain {
  slug: string
  name: string
  developer: string
  architecture: string
  parameters?: string
  computeTops?: string
  trainingDataScale?: string
  robotsSupported: string[]
  status: 'production' | 'research' | 'pre-production' | 'commercial' | 'early-stage'
  openSource: boolean
  license?: string
  description: string
  keyDifferentiator: string
  fundingContext?: string
  milestones?: { date: string; event: string }[]
  website?: string
}

export interface Company {
  slug: string
  name: string
  founded: number
  hq: string
  ceo: string
  headcount?: string
  totalFunding?: string
  latestValuation?: string
  products: string[]
  description: string
  website?: string
  status: 'active' | 'acquired' | 'defunct'
  recentNews?: string[]
}

export interface FundingRound {
  id: string
  company: string
  companySlug: string
  round: string
  amount: string
  valuation?: string
  leadInvestors: string[]
  date: string
  geography: string
  notes?: string
}

export interface GlossaryTerm {
  slug: string
  term: string
  definition: string
  category: string
  relatedTerms?: string[]
  seeAlso?: string[]
}

export interface NewsletterEdition {
  slug: string
  title: string
  date: string
  excerpt: string
  edition: number
}

export interface Job {
  id: string
  company: string
  companySlug: string
  title: string
  department: string
  location: string
  remote: boolean
  type: 'full-time' | 'part-time' | 'contract' | 'internship'
  url: string
  postedAt: string   // ISO date
  updatedAt: string  // ISO date
  source: 'greenhouse' | 'lever' | 'indeed' | 'direct'
  status: 'open' | 'closed'
  tags: string[]
  salary?: string | null
}

export interface ResearchPaper {
  id: string
  title: string
  authors: string[]
  institution: string
  date: string
  summary: string
  url: string
  keyFinding: string
  category: string
}
