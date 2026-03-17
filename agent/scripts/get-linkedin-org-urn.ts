#!/usr/bin/env tsx
/**
 * LinkedIn Organization URN Helper
 * Finds the organization URN for company page posting.
 *
 * Usage:
 *   npx tsx agent/scripts/get-linkedin-org-urn.ts
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

  console.log('Fetching organizations you admin...\n')

  // Get organizations the user admins via the Organization Access Control API
  const res = await fetch(
    'https://api.linkedin.com/v2/organizationAcls?q=roleAssignee&role=ADMINISTRATOR&state=APPROVED&projection=(elements*(organization~(id,localizedName,vanityName)))',
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'LinkedIn-Version': '202602',
        'X-Restli-Protocol-Version': '2.0.0',
      },
    }
  )

  if (!res.ok) {
    const err = await res.text()
    console.error(`LinkedIn API error ${res.status}: ${err}`)
    console.error('\nMake sure your token has the w_organization_social scope.')
    console.error('Re-authorize at: https://www.linkedin.com/developers/apps → Auth tab')
    process.exit(1)
  }

  const data = await res.json() as any
  const orgs = data.elements ?? []

  if (orgs.length === 0) {
    console.log('No organizations found. Make sure:')
    console.log('  1. Your token has w_organization_social scope')
    console.log('  2. You are an admin of the HumanoidIntel LinkedIn page')
    process.exit(1)
  }

  console.log('✓ Organizations you admin:\n')
  for (const el of orgs) {
    const org = el['organization~'] ?? {}
    const id = org.id
    const name = org.localizedName ?? org.vanityName ?? 'Unknown'
    const urn = `urn:li:organization:${id}`
    console.log(`  Name: ${name}`)
    console.log(`  URN:  ${urn}`)
    console.log('')
  }

  console.log('Update your GitHub secret:')
  console.log('  LINKEDIN_AUTHOR_URN = urn:li:organization:<id from above>')
  console.log('\nAlso update .env.local for local testing.')
}

main().catch((err) => {
  console.error('Error:', err)
  process.exit(1)
})
