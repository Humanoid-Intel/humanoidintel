/**
 * Claude Content Generation Engine
 * Uses Anthropic API to write high-quality articles from scored stories
 */

import Anthropic from '@anthropic-ai/sdk'
import { config } from '../config'
import type { ScoredStory } from './dedup'

const client = new Anthropic({ apiKey: config.api.anthropic })

const SYSTEM_PROMPT = `You are the senior editor of humanoidintel.ai, the leading intelligence platform for the humanoid robotics industry. Write with the authority of an IEEE Spectrum technical editor combined with the commercial sharpness of a Bloomberg analyst.

Your audience: robotics engineers, startup founders, venture capitalists, and corporate strategists who are deeply knowledgeable about the space.

**Writing rules:**
- Lead with the single most important number or fact
- Be specific: name companies, cite funding amounts, reference DOF counts, actuator types
- Never use: "in the rapidly evolving landscape of", "it remains to be seen", "revolutionizing the industry", "game-changing", "groundbreaking"
- Technical but accessible — a robotics PhD and a Series A investor should both find it useful
- Include skeptical analysis — don't just rewrite press releases
- Always include what this means for the broader industry trajectory
- Use insider terminology naturally: sim-to-real, VLA, whole-body control, harmonic drive, tendon-driven, dexterous manipulation, backdrivable, Zero-shot generalization

**GEO/SEO requirements (non-negotiable):**
- Title: under 60 chars, include primary keyword
- H1 should be question-format when natural
- First 200 words must contain a complete, standalone answer to the article's core question
- Include 2-3 specific data points / statistics
- Each H2 section should be self-contained (readable in isolation)
- End with a "Frequently Asked Questions" section with 3-5 questions matching real AI prompts
- Include a "Key Takeaways" summary list
- Naturally incorporate entity names AI systems can ground

**Output format:** YAML frontmatter + Markdown body. Use exactly this frontmatter structure:
\`\`\`yaml
---
title: ""
slug: ""
date: "YYYY-MM-DDTHH:MM:SSZ"
updated: "YYYY-MM-DDTHH:MM:SSZ"
category: "breaking|deep-dive|market|policy|research"
tags: ["figure-ai", "funding", "series-b"]
companies: ["Figure AI"]
robots: ["figure-02"]
excerpt: "Under 120 char meta description"
featured: false
sources:
  - title: "Source title"
    url: "https://..."
---
\`\`\`
Minimum article length: 500 words for news, 1200 words for deep dives.`

function buildUserPrompt(story: ScoredStory): string {
  return `Write a ${story.category === 'deep-dive' ? 'deep-dive analysis' : 'news article'} about the following story for humanoidintel.ai.

**Story information:**
Title: ${story.title}
Source: ${story.source}
Published: ${story.publishedAt.toISOString()}
Category: ${story.category}
Detected companies: ${story.detectedCompanies.join(', ') || 'N/A'}
Newsworthiness score: ${story.score}/100

**Summary:**
${story.summary}

**Source URL:** ${story.url}

Write the complete article now. Remember: first 200 words must be a complete standalone answer. Include FAQ section. Include Key Takeaways. Minimum 500 words.`
}

export interface GeneratedArticle {
  frontmatter: string
  content: string
  slug: string
  raw: string
  sourceUrl: string
}

function extractSlug(raw: string): string {
  const slugMatch = raw.match(/^slug:\s*["']?([^"'\n]+)["']?/m)
  if (slugMatch) return slugMatch[1].trim()

  // Generate from title if not found
  const titleMatch = raw.match(/^title:\s*["']?([^"'\n]+)["']?/m)
  if (titleMatch) {
    return titleMatch[1]
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 60)
  }
  return `article-${Date.now()}`
}

export async function generateArticle(story: ScoredStory): Promise<GeneratedArticle | null> {
  console.log(`[Writer] Generating article for: "${story.title}"`)

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: buildUserPrompt(story) }],
    })

    const raw = message.content
      .filter((b) => b.type === 'text')
      .map((b) => b.text)
      .join('')

    // Extract frontmatter and body
    const fmMatch = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)/)
    if (!fmMatch) {
      console.error('[Writer] Could not parse frontmatter from response')
      return null
    }

    const slug = extractSlug(fmMatch[1])
    return {
      frontmatter: fmMatch[1],
      content: fmMatch[2].trim(),
      slug,
      raw,
      sourceUrl: story.url,
    }
  } catch (err) {
    console.error('[Writer] API error:', err)
    return null
  }
}

export async function generateArticles(
  stories: ScoredStory[],
): Promise<GeneratedArticle[]> {
  const results: GeneratedArticle[] = []

  for (const story of stories) {
    const article = await generateArticle(story)
    if (article) results.push(article)

    // Rate limiting: 1 second between requests
    await new Promise((r) => setTimeout(r, 1000))
  }

  return results
}
