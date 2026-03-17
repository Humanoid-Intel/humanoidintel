#!/usr/bin/env tsx
/**
 * LinkedIn URN Helper
 * Run this once after getting your access token to find your Author URN.
 *
 * Usage:
 *   npx tsx agent/scripts/get-linkedin-urn.ts
 */

import { config as dotenv } from 'dotenv'
import { resolve } from 'path'
dotenv({ path: resolve(__dirname, '../../.env.local'), override: true })

async function main() {
  const token = process.env.LINKEDIN_ACCESS_TOKEN

  if (!token) {
    console.error('Error: LINKEDIN_ACCESS_TOKEN not set in .env.local')
    process.exit(1)
  }

  const res = await fetch('https://api.linkedin.com/v2/userinfo', {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!res.ok) {
    console.error(`LinkedIn API error ${res.status}:`, await res.text())
    process.exit(1)
  }

  const data = await res.json() as any
  const urn = `urn:li:person:${data.sub}`

  console.log('\n✓ LinkedIn profile found:')
  console.log(`  Name:  ${data.name ?? (data.given_name + ' ' + data.family_name)}`)
  console.log(`\n  Author URN: ${urn}`)
  console.log('\nAdd this to .env.local:')
  console.log(`  LINKEDIN_AUTHOR_URN=${urn}\n`)
}

main().catch((err) => {
  console.error('Error:', err)
  process.exit(1)
})
