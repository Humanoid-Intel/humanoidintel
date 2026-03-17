#!/usr/bin/env tsx
/**
 * LinkedIn Org Post Test
 * Sends a test post to the HumanoidIntelAI company page to verify org posting works.
 *
 * Usage:
 *   npx tsx agent/scripts/test-linkedin-post.ts
 */

import { config as dotenv } from 'dotenv'
import { resolve } from 'path'
dotenv({ path: resolve(__dirname, '../../.env.local'), override: true })

async function main() {
  const token = process.env.LINKEDIN_ACCESS_TOKEN
  const authorUrn = process.env.LINKEDIN_AUTHOR_URN

  if (!token || !authorUrn) {
    console.error('Error: LINKEDIN_ACCESS_TOKEN or LINKEDIN_AUTHOR_URN not set')
    process.exit(1)
  }

  console.log(`\n📤 Posting to: ${authorUrn}`)

  const body = {
    author: authorUrn,
    commentary: '🤖 Test post from HumanoidIntel — verifying automated org page posting is live.\n\nIf you see this, the LinkedIn automation pipeline is working correctly.\n\n#HumanoidRobotics #AI #Robotics',
    visibility: 'PUBLIC',
    distribution: {
      feedDistribution: 'MAIN_FEED',
      targetEntities: [],
      thirdPartyDistributionChannels: [],
    },
    lifecycleState: 'PUBLISHED',
    isReshareDisabledByAuthor: false,
  }

  const res = await fetch('https://api.linkedin.com/rest/posts', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'LinkedIn-Version': '202602',
      'X-Restli-Protocol-Version': '2.0.0',
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const err = await res.text()
    console.error(`\n❌ LinkedIn API error ${res.status}:`, err)
    process.exit(1)
  }

  const postId = res.headers.get('x-restli-id') ?? res.headers.get('location') ?? '(unknown)'
  console.log(`\n✅ Posted successfully!`)
  console.log(`   Post ID: ${postId}`)
  console.log(`\n   Check: https://www.linkedin.com/company/humanoidintelai/posts/\n`)
}

main().catch((err) => {
  console.error('Error:', err)
  process.exit(1)
})
