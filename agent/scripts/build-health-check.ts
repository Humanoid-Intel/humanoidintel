#!/usr/bin/env tsx
/**
 * Build Health Check
 *
 * After a git push, waits 3 minutes then checks if the site deployed correctly.
 * Verifies: site is up, returns 200, contains expected content markers.
 *
 * Usage: npx tsx agent/scripts/build-health-check.ts
 */

const SITE_URL = 'https://humanoidintel.ai'
const CHECKS = [
  { url: '/', marker: 'humanoidintel.ai', name: 'Homepage' },
  { url: '/news/', marker: 'Latest', name: 'News page' },
  { url: '/companies/', marker: 'Company', name: 'Companies page' },
  { url: '/robots/', marker: 'Robot', name: 'Robots page' },
  { url: '/funding/', marker: 'Funding', name: 'Funding page' },
]

async function checkURL(path: string, marker: string, name: string): Promise<{ ok: boolean; status: number; hasMarker: boolean }> {
  try {
    const res = await fetch(`${SITE_URL}${path}`, {
      headers: { 'User-Agent': 'humanoidintel-build-check/1.0' },
    })
    const html = await res.text()
    const hasMarker = html.includes(marker)
    return { ok: res.ok, status: res.status, hasMarker }
  } catch (err) {
    return { ok: false, status: 0, hasMarker: false }
  }
}

async function run() {
  console.log(`[Build Check] Checking ${SITE_URL} at ${new Date().toISOString()}`)
  console.log('')

  let allOk = true

  for (const check of CHECKS) {
    const result = await checkURL(check.url, check.marker, check.name)
    const status = result.ok && result.hasMarker ? '✅' : '❌'
    console.log(`${status} ${check.name} (${check.url}): HTTP ${result.status}, marker ${result.hasMarker ? 'found' : 'MISSING'}`)
    if (!result.ok || !result.hasMarker) allOk = false
  }

  console.log('')
  if (allOk) {
    console.log('[Build Check] ✅ All checks passed — site is healthy')
  } else {
    console.log('[Build Check] ❌ SOME CHECKS FAILED — possible build/deploy issue')
    console.log('[Build Check] Check Cloudflare Pages dashboard for build errors')
    process.exit(1)
  }
}

run().catch((err) => {
  console.error('[Build Check] Fatal:', err)
  process.exit(1)
})
