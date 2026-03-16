/**
 * Jobs Extractor
 *
 * Fetches open roles from all job board sources, merges with the
 * existing jobs.json, prunes stale listings, and writes the result.
 *
 * Called as Phase 2.6 in agent/index.ts.
 *
 * Strategy:
 *   - Upsert by id (new jobs added, existing refreshed)
 *   - Jobs missing from a fresh fetch are marked 'closed' (soft-delete)
 *   - Hard-prune jobs that have been closed for 7+ days
 *   - Hard-prune jobs older than 60 days (stale, probably filled)
 */

import fs from 'fs'
import path from 'path'
import { fetchAllJobs } from '../sources/jobs'
import type { Job } from '../../lib/types'

const JOBS_FILE = path.join(__dirname, '../../content/data/jobs.json')
const MAX_AGE_DAYS = 60    // Prune jobs older than this
const CLOSE_GRACE_DAYS = 7 // Keep closed jobs this many days before hard pruning

function loadJobs(): Job[] {
  try {
    if (fs.existsSync(JOBS_FILE)) {
      return JSON.parse(fs.readFileSync(JOBS_FILE, 'utf-8')) as Job[]
    }
  } catch {}
  return []
}

function saveJobs(jobs: Job[]): void {
  fs.writeFileSync(JOBS_FILE, JSON.stringify(jobs, null, 2), 'utf-8')
}

function ageInDays(isoDate: string): number {
  return (Date.now() - new Date(isoDate).getTime()) / (1000 * 60 * 60 * 24)
}

export async function extractAndSaveJobs(): Promise<void> {
  const freshJobs = await fetchAllJobs()
  const freshIds = new Set(freshJobs.map((j) => j.id))

  const existing = loadJobs()
  const existingById = new Map(existing.map((j) => [j.id, j]))

  const now = new Date().toISOString()

  // Upsert fresh jobs
  for (const job of freshJobs) {
    existingById.set(job.id, {
      ...job,
      // Preserve original postedAt if already known
      postedAt: existingById.get(job.id)?.postedAt ?? job.postedAt,
      updatedAt: now,
      status: 'open',
    })
  }

  // Mark missing jobs as closed (only for Greenhouse/Lever — not Indeed which is a search feed)
  for (const [id, job] of existingById) {
    if (job.status === 'open' && !freshIds.has(id) && job.source !== 'indeed') {
      existingById.set(id, { ...job, status: 'closed', updatedAt: now })
    }
  }

  // Prune: hard-delete very old or long-closed jobs
  const pruned: Job[] = []
  let closedPruned = 0
  let agePruned = 0

  for (const job of existingById.values()) {
    const age = ageInDays(job.postedAt)
    const closedAge = ageInDays(job.updatedAt)

    if (age > MAX_AGE_DAYS) { agePruned++; continue }
    if (job.status === 'closed' && closedAge > CLOSE_GRACE_DAYS) { closedPruned++; continue }

    pruned.push(job)
  }

  // Sort: open first, then by postedAt desc
  pruned.sort((a, b) => {
    if (a.status !== b.status) return a.status === 'open' ? -1 : 1
    return new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime()
  })

  const newCount  = freshJobs.filter((j) => !existing.find((e) => e.id === j.id)).length
  const openCount = pruned.filter((j) => j.status === 'open').length
  const closedCount = pruned.filter((j) => j.status === 'closed').length

  console.log(`[Jobs] +${newCount} new | ${closedCount} closed | pruned ${agePruned + closedPruned} | ${openCount} total open`)

  saveJobs(pruned)
}
