/**
 * Publisher
 * Saves generated articles to content/drafts/ or content/news/
 * Sends notifications and optionally triggers git push
 */

import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'
import { config } from '../config'
import type { GeneratedArticle } from './writer'

const CONTENT_ROOT = path.resolve(__dirname, '../../content')
const NEWS_DIR = path.join(CONTENT_ROOT, 'news')
const DRAFTS_DIR = path.join(CONTENT_ROOT, 'drafts')

function ensureDirs() {
  ;[NEWS_DIR, DRAFTS_DIR].forEach((dir) => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  })
}

function sanitizeFilename(slug: string): string {
  return slug.replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').toLowerCase()
}

async function sendNotification(articles: GeneratedArticle[], targetDir: string) {
  if (!config.notifications.webhookUrl) return

  const mode = targetDir.includes('drafts') ? 'DRAFT' : 'PUBLISHED'
  const body = JSON.stringify({
    text: `[humanoidintel.ai] ${articles.length} article(s) ${mode}:\n${articles.map((a) => `• ${a.slug}`).join('\n')}`,
  })

  try {
    await fetch(config.notifications.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    })
  } catch (err) {
    console.error('[Publisher] Notification failed:', err)
  }
}

function gitCommitAndPush(filePaths: string[]) {
  if (!config.api.github) {
    console.log('[Publisher] No GitHub token — skipping git push')
    return
  }

  try {
    const repoRoot = path.resolve(__dirname, '../..')
    const relativePaths = filePaths.map((f) => path.relative(repoRoot, f))

    execSync(`git -C "${repoRoot}" add ${relativePaths.map((p) => `"${p}"`).join(' ')}`)
    execSync(
      `git -C "${repoRoot}" commit -m "feat(content): auto-publish ${filePaths.length} article(s) [bot]"`,
    )
    execSync(`git -C "${repoRoot}" push origin HEAD`)
    console.log('[Publisher] Git push successful — Cloudflare deploy triggered')
  } catch (err) {
    console.error('[Publisher] Git push failed:', err)
  }
}

// Returns map of sourceUrl → published slug (only for newly saved articles)
export async function publishArticles(articles: GeneratedArticle[]): Promise<Map<string, string>> {
  ensureDirs()

  const mode = config.agent.publishMode
  const targetDir = mode === 'draft' ? DRAFTS_DIR : NEWS_DIR
  const publishedPaths: string[] = []
  const slugMap = new Map<string, string>() // sourceUrl → slug

  for (const article of articles) {
    const filename = `${sanitizeFilename(article.slug)}.md`
    const filePath = path.join(targetDir, filename)

    // Avoid overwriting existing articles
    if (fs.existsSync(filePath)) {
      console.log(`[Publisher] Skipping existing: ${filename}`)
      continue
    }

    fs.writeFileSync(filePath, article.raw, 'utf-8')
    publishedPaths.push(filePath)
    slugMap.set(article.sourceUrl, sanitizeFilename(article.slug))
    console.log(`[Publisher] Saved to ${mode === 'draft' ? 'drafts' : 'news'}: ${filename}`)
  }

  if (publishedPaths.length === 0) return slugMap

  // Send notification
  await sendNotification(
    articles.filter((_, i) => publishedPaths[i]),
    targetDir,
  )

  // Auto-push for autonomous modes
  if (mode === 'auto' || mode === 'full') {
    gitCommitAndPush(publishedPaths)
  } else {
    console.log(
      `[Publisher] ${publishedPaths.length} draft(s) saved. Review at content/drafts/ and move to content/news/ to publish.`,
    )
  }

  return slugMap
}
