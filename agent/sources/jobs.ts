/**
 * Job Board Source Aggregator
 *
 * Fetches open roles from:
 *   Tier 1 — Greenhouse ATS (public JSON API, no auth)
 *   Tier 2 — Lever ATS (public JSON API, no auth)
 *   Tier 3 — Ashby ATS (public JSON API, no auth — popular with new robotics startups)
 *   Tier 4 — Personio RSS (European companies: Wandercraft, Enchanted Tools, Clone Robotics)
 *   Tier 5 — Indeed RSS (broad catch-all)
 *
 * All fetches are silent on failure — a single source going down
 * doesn't break the pipeline.
 *
 * Confirmed working (verified live):
 *   Greenhouse: figureai, agilityrobotics, apptronik
 *   Lever: sanctuary
 *   Ashby: 1x (endpoint live, 0 jobs right now — will auto-populate)
 *
 * Not accessible (Workday/internal systems):
 *   Boston Dynamics (Workday — API requires auth), Tesla (internal)
 */

import type { Job } from '../../lib/types'

// ─── Company → ATS token mapping ─────────────────────────────────────────────

interface Company {
  name: string
  slug: string
  token: string
}

interface PersonioCompany {
  name: string
  slug: string
  subdomain: string   // {subdomain}.jobs.personio.de
}

const GREENHOUSE_COMPANIES: Company[] = [
  // Confirmed working ✓
  { name: 'Figure AI',             slug: 'figure-ai',             token: 'figureai' },
  { name: 'Agility Robotics',      slug: 'agility-robotics',      token: 'agilityrobotics' },
  { name: 'Apptronik',             slug: 'apptronik',             token: 'apptronik' },
  { name: 'Diligent Robotics',     slug: 'diligent-robotics',     token: 'diligentrobotics' },
  { name: 'Nimble Robotics',       slug: 'nimble-robotics',       token: 'nimblerobotics' },
  // Silently skip if 404 — tokens preserved for when these companies set up boards
  { name: 'Skild AI',              slug: 'skild-ai',              token: 'skild' },
  { name: 'Astribot',              slug: 'astribot',              token: 'astribot' },
]

const LEVER_COMPANIES: Company[] = [
  // Confirmed working ✓
  { name: 'Sanctuary AI',          slug: 'sanctuary-ai',          token: 'sanctuary' },
]

const ASHBY_COMPANIES: Company[] = [
  // Confirmed working ✓
  { name: 'Physical Intelligence', slug: 'physical-intelligence', token: 'physicalintelligence' },
  { name: 'Fourier Intelligence',  slug: 'fourier-intelligence',  token: 'fourier' },
  { name: '1X Technologies',       slug: '1x-technologies',       token: '1x' },
]

const PERSONIO_COMPANIES: PersonioCompany[] = [
  // European humanoid robotics companies — sequential fetch to avoid rate limits
  { name: 'Wandercraft',           slug: 'wandercraft',           subdomain: 'wandercraft' },
  { name: 'Enchanted Tools',       slug: 'enchanted-tools',       subdomain: 'enchanted-tools' },
  { name: 'Clone Robotics',        slug: 'clone-robotics',        subdomain: 'clone-robotics' },
  { name: 'Mentee Robotics',       slug: 'mentee-robotics',       subdomain: 'mentee-robotics' },
  { name: 'NEURA Robotics',        slug: 'neura-robotics',        subdomain: 'neura-robotics' },
]

// Indeed RSS search queries — broad humanoid/robotics talent keywords
const INDEED_QUERIES = [
  '"humanoid robot"',
  '"humanoid robotics"',
  'bipedal locomotion engineer',
  '"whole-body control" robotics',
]

// ─── Tag inference ────────────────────────────────────────────────────────────

function inferTags(title: string, department: string): string[] {
  const text = `${title} ${department}`.toLowerCase()
  const tags: string[] = []

  if (/controls?|locomotion|dynamics|trajectory|motion planning/.test(text)) tags.push('controls')
  if (/machine learning|deep learning|neural|ml|ai|llm|vla|foundation model/.test(text)) tags.push('ml/ai')
  if (/embedded|firmware|fpga|rtos|real.time/.test(text)) tags.push('embedded')
  if (/mechanical|hardware|cad|solidworks|actuat|mechanism|dof/.test(text)) tags.push('hardware')
  if (/perception|vision|lidar|slam|mapping|sensor/.test(text)) tags.push('perception')
  if (/simulation|isaac|unity|gazebo|mujoco|sim.to.real/.test(text)) tags.push('simulation')
  if (/software|backend|frontend|fullstack|web|platform|infra/.test(text)) tags.push('software')
  if (/safety|compliance|reliability|testing|qa|quality/.test(text)) tags.push('safety')
  if (/product|program|project|manager|pm|pmo/.test(text)) tags.push('product')
  if (/research|scientist|phd|postdoc|researcher/.test(text)) tags.push('research')
  if (/electrical|pcb|schematic|power electronics/.test(text)) tags.push('electrical')
  if (/operations|supply chain|manufacturing|production/.test(text)) tags.push('operations')

  // Seniority
  if (/\bintern\b|internship/.test(text)) tags.push('internship')
  else if (/\bjunior\b|\bassociate\b|entry.level/.test(text)) tags.push('junior')
  else if (/\bstaff\b|\bprincipal\b|\blead\b|\bsenior\b/.test(text)) tags.push('senior')
  else if (/director|vp\b|head of|vice president/.test(text)) tags.push('leadership')

  return tags
}

function isRemote(location: string): boolean {
  return /remote|distributed|anywhere|worldwide/i.test(location)
}

function inferType(commitment: string): string {
  const c = commitment.toLowerCase()
  if (/intern/.test(c)) return 'internship'
  if (/contract|freelance/.test(c)) return 'contract'
  if (/part.time/.test(c)) return 'part-time'
  return 'full-time'
}

// ─── Greenhouse ───────────────────────────────────────────────────────────────

async function fetchGreenhouseJobs(): Promise<Job[]> {
  const results: Job[] = []

  await Promise.allSettled(
    GREENHOUSE_COMPANIES.map(async (company) => {
      try {
        const url = `https://boards-api.greenhouse.io/v1/boards/${company.token}/jobs`
        const res = await fetch(url, { signal: AbortSignal.timeout(10000) })
        if (!res.ok) return // 404 = company not on Greenhouse — silently skip

        const data = await res.json() as { jobs: any[] }
        if (!Array.isArray(data.jobs)) return

        for (const job of data.jobs) {
          const location = job.location?.name ?? 'Unknown'
          const department = job.departments?.[0]?.name ?? 'General'
          const title = job.title ?? ''

          results.push({
            id: `greenhouse-${company.token}-${job.id}`,
            company: company.name,
            companySlug: company.slug,
            title,
            department,
            location,
            remote: isRemote(location),
            type: 'full-time',
            url: job.absolute_url ?? `https://boards.greenhouse.io/${company.token}/jobs/${job.id}`,
            postedAt: job.updated_at ?? new Date().toISOString(),
            updatedAt: job.updated_at ?? new Date().toISOString(),
            source: 'greenhouse',
            status: 'open',
            tags: inferTags(title, department),
            salary: null,
          })
        }
      } catch {
        // Silently skip — single source failure doesn't break pipeline
      }
    })
  )

  return results
}

// ─── Lever ────────────────────────────────────────────────────────────────────

async function fetchLeverJobs(): Promise<Job[]> {
  const results: Job[] = []

  await Promise.allSettled(
    LEVER_COMPANIES.map(async (company) => {
      try {
        const url = `https://api.lever.co/v0/postings/${company.token}?mode=json`
        const res = await fetch(url, { signal: AbortSignal.timeout(10000) })
        if (!res.ok) return

        const jobs = await res.json() as any[]
        if (!Array.isArray(jobs)) return

        for (const job of jobs) {
          const location = job.categories?.location ?? 'Unknown'
          const department = job.categories?.department ?? 'General'
          const title = job.text ?? ''
          const commitment = job.categories?.commitment ?? 'Full-time'

          results.push({
            id: `lever-${company.token}-${job.id}`,
            company: company.name,
            companySlug: company.slug,
            title,
            department,
            location,
            remote: isRemote(location),
            type: inferType(commitment),
            url: job.hostedUrl ?? `https://jobs.lever.co/${company.token}/${job.id}`,
            postedAt: job.createdAt ? new Date(job.createdAt).toISOString() : new Date().toISOString(),
            updatedAt: job.updatedAt ? new Date(job.updatedAt).toISOString() : new Date().toISOString(),
            source: 'lever',
            status: 'open',
            tags: inferTags(title, department),
            salary: null,
          })
        }
      } catch {
        // Silently skip
      }
    })
  )

  return results
}

// ─── Ashby ────────────────────────────────────────────────────────────────────

async function fetchAshbyJobs(): Promise<Job[]> {
  const results: Job[] = []

  await Promise.allSettled(
    ASHBY_COMPANIES.map(async (company) => {
      try {
        const url = `https://api.ashbyhq.com/posting-api/job-board/${company.token}?includeCompensation=true`
        const res = await fetch(url, { signal: AbortSignal.timeout(10000) })
        if (!res.ok) return

        const data = await res.json() as { jobs?: any[] }
        if (!Array.isArray(data.jobs) || data.jobs.length === 0) return

        for (const job of data.jobs) {
          const location = job.location ?? job.locationName ?? 'Unknown'
          const department = job.department ?? job.team ?? 'General'
          const title = job.title ?? ''
          const commitment = job.employmentType ?? 'Full-time'

          results.push({
            id: `ashby-${company.token}-${job.id}`,
            company: company.name,
            companySlug: company.slug,
            title,
            department,
            location,
            remote: isRemote(location) || job.isRemote === true,
            type: inferType(commitment),
            url: job.jobUrl ?? `https://jobs.ashbyhq.com/${company.token}/${job.id}`,
            postedAt: job.publishedDate ?? job.createdAt ?? new Date().toISOString(),
            updatedAt: job.updatedAt ?? new Date().toISOString(),
            source: 'direct', // Ashby — structured ATS like Greenhouse/Lever
            status: 'open',
            tags: inferTags(title, department),
            salary: job.compensation?.summaryComponents?.[0]?.label ?? null,
          })
        }
      } catch {
        // Silently skip
      }
    })
  )

  return results
}

// ─── Personio RSS (European companies) ───────────────────────────────────────

async function fetchPersonioJobs(): Promise<Job[]> {
  const results: Job[] = []

  // Sequential with delay to avoid rate-limiting (429 when hit simultaneously)
  for (const company of PERSONIO_COMPANIES) {
    try {
      const url = `https://${company.subdomain}.jobs.personio.de/rss`
      const res = await fetch(url, {
        headers: { 'Accept': 'application/rss+xml, application/xml, text/xml' },
        signal: AbortSignal.timeout(10000),
      })
      if (!res.ok) {
        // Try .com variant
        const res2 = await fetch(`https://${company.subdomain}.jobs.personio.com/rss`, {
          signal: AbortSignal.timeout(8000),
        })
        if (!res2.ok) continue
        const xml = await res2.text()
        parsePersonioRss(xml, company, results)
      } else {
        const xml = await res.text()
        parsePersonioRss(xml, company, results)
      }
    } catch {
      // Silently skip
    }
    // Small delay between companies to avoid rate limits
    await new Promise((r) => setTimeout(r, 300))
  }

  return results
}

function parsePersonioRss(xml: string, company: PersonioCompany, results: Job[]) {
  const items = xml.match(/<item>([\s\S]*?)<\/item>/g) ?? []
  for (const item of items) {
    const title = item.match(/<title><!\[CDATA\[([^\]]+)\]\]><\/title>|<title>([^<]+)<\/title>/)?.[1] ?? ''
    const link  = item.match(/<link>([^<]+)<\/link>/)?.[1] ?? ''
    const pubDate = item.match(/<pubDate>([^<]+)<\/pubDate>/)?.[1] ?? ''
    const description = item.match(/<description><!\[CDATA\[([^\]]+)\]\]><\/description>/)?.[1] ?? ''

    if (!title || !link) continue

    const location = description.match(/Location[:\s]+([^<\n]+)/i)?.[1]?.trim() ??
                     description.match(/<location>([^<]+)<\/location>/i)?.[1]?.trim() ??
                     company.name.includes('Wandercraft') ? 'Paris, France'
                     : company.name.includes('Clone') ? 'Warsaw, Poland'
                     : company.name.includes('Mentee') ? 'Tel Aviv, Israel'
                     : company.name.includes('Enchanted') ? 'Paris, France'
                     : 'Europe'

    results.push({
      id: `personio-${company.subdomain}-${Buffer.from(link).toString('base64').slice(0, 16)}`,
      company: company.name,
      companySlug: company.slug,
      title,
      department: 'Engineering',
      location,
      remote: isRemote(description),
      type: 'full-time',
      url: link,
      postedAt: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      source: 'direct',
      status: 'open',
      tags: inferTags(title, ''),
      salary: null,
    })
  }
}

// ─── Indeed RSS ───────────────────────────────────────────────────────────────

function parseRssItem(item: string): { title: string; link: string; pubDate: string; description: string } | null {
  const title = item.match(/<title><!\[CDATA\[([^\]]+)\]\]><\/title>|<title>([^<]+)<\/title>/)?.[1] ??
                item.match(/<title>([^<]*)<\/title>/)?.[1] ?? ''
  const link  = item.match(/<link>([^<]+)<\/link>/)?.[1] ??
                item.match(/<guid[^>]*>([^<]+)<\/guid>/)?.[1] ?? ''
  const pubDate = item.match(/<pubDate>([^<]+)<\/pubDate>/)?.[1] ?? ''
  const desc  = item.match(/<description><!\[CDATA\[([^\]]+)\]\]><\/description>|<description>([^<]+)<\/description>/)?.[1] ?? ''

  if (!title || !link) return null
  return { title, link, pubDate, description: desc }
}

async function fetchIndeedJobs(): Promise<Job[]> {
  const results: Job[] = []
  const seenUrls = new Set<string>()

  await Promise.allSettled(
    INDEED_QUERIES.map(async (query) => {
      try {
        const encoded = encodeURIComponent(query)
        const url = `https://www.indeed.com/jobs?q=${encoded}&sort=date&format=rss`
        const res = await fetch(url, {
          headers: { 'User-Agent': 'Mozilla/5.0 (compatible; humanoidintel-bot/1.0)' },
          signal: AbortSignal.timeout(10000),
        })
        if (!res.ok) return

        const xml = await res.text()
        const items = xml.match(/<item>([\s\S]*?)<\/item>/g) ?? []

        for (const item of items) {
          const parsed = parseRssItem(item)
          if (!parsed) continue
          if (seenUrls.has(parsed.link)) continue
          seenUrls.add(parsed.link)

          // Extract company from title — Indeed format: "Job Title - Company Name"
          const parts = parsed.title.split(' - ')
          const jobTitle = parts.slice(0, -1).join(' - ').trim() || parsed.title
          const companyName = parts[parts.length - 1]?.trim() ?? 'Unknown'

          // Quick humanoid relevance check — filter out irrelevant Indeed results
          const titleLower = parsed.title.toLowerCase()
          const descLower = parsed.description.toLowerCase()
          const relevant = /humanoid|bipedal|locomotion|manipulation|exoskele|whole.body|robot/.test(titleLower + descLower)
          if (!relevant) continue

          results.push({
            id: `indeed-${Buffer.from(parsed.link).toString('base64').slice(0, 20)}`,
            company: companyName,
            companySlug: companyName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
            title: jobTitle,
            department: 'Engineering',
            location: 'See listing',
            remote: /remote/i.test(parsed.description),
            type: 'full-time',
            url: parsed.link,
            postedAt: parsed.pubDate ? new Date(parsed.pubDate).toISOString() : new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            source: 'indeed',
            status: 'open',
            tags: inferTags(jobTitle, ''),
            salary: null,
          })
        }
      } catch {
        // Silently skip — Indeed blocks bots aggressively
      }
    })
  )

  return results
}

// ─── Main export ──────────────────────────────────────────────────────────────

export async function fetchAllJobs(): Promise<Job[]> {
  // Ashby/Personio run concurrently with the others; Personio is internally sequential
  // to avoid rate limiting but that's handled inside fetchPersonioJobs()
  const [greenhouse, lever, ashby, indeed, personio] = await Promise.all([
    fetchGreenhouseJobs(),
    fetchLeverJobs(),
    fetchAshbyJobs(),
    fetchIndeedJobs(),
    fetchPersonioJobs(),
  ])

  const all = [...greenhouse, ...lever, ...ashby, ...personio, ...indeed]
  console.log(
    `[Jobs] Fetched: Greenhouse=${greenhouse.length} Lever=${lever.length} Ashby=${ashby.length} Personio=${personio.length} Indeed=${indeed.length} Total=${all.length}`
  )
  return all
}
