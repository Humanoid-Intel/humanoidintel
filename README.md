# humanoidintel.ai

**The Bloomberg Terminal of Humanoid Robotics**

Real-time intelligence, funding data, robot specifications, company profiles, and market analysis for the humanoid robotics industry.

## Stack

- **Framework**: Next.js 16 (App Router) with static export (SSG)
- **Styling**: Tailwind CSS v4 — dark terminal aesthetic
- **Deployment**: Cloudflare Pages
- **CMS**: Git-based markdown files in `/content`
- **AI Pipeline**: Anthropic Claude API for autonomous content generation
- **Analytics**: Plausible Analytics

## Getting Started

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.local.example .env.local
# Edit .env.local with your API keys

# Run development server
npm run dev

# Build for production
npm run build
```

## Running the AI Agent

The agent autonomously scrapes robotics news sources, scores stories for newsworthiness, and generates articles using Claude.

```bash
# Set ANTHROPIC_API_KEY in .env.local first

# Run once
npm run agent

# Run continuously (hourly)
npm run agent:watch
```

**Agent modes** (set `PUBLISH_MODE` in `.env.local`):
- `draft` — saves to `content/drafts/`, sends notification for human review
- `auto` — auto-publishes high-confidence articles, notifies
- `full` — fully autonomous, weekly human audit

## Content Structure

```
content/
  news/          # Published articles (markdown + YAML frontmatter)
  drafts/        # Agent-generated drafts awaiting review
  glossary/      # Glossary term pages (50+ terms)
  newsletter/    # Weekly newsletter editions
  data/
    robot-specs.json       # Robot database (20+ robots)
    company-directory.json  # Company tracker (18+ companies)
    funding-rounds.json     # All funding rounds (25+ entries)
```

## Publishing Workflow

1. Agent runs hourly (cron or `npm run agent`)
2. New articles saved to `content/drafts/`
3. Notification sent to Slack/email webhook
4. Editor reviews, edits if needed, moves to `content/news/`
5. `git commit && git push` triggers Cloudflare Pages build
6. Site rebuilds and deploys in ~60 seconds

## Deployment

Connect to Cloudflare Pages:
- Build command: `npm run build`
- Build output: `out`
- Node version: 20.x

**CRITICAL**: Disable "Bot Fight Mode" in Cloudflare Security settings to allow AI crawlers. The `robots.txt` and `llms.txt` already grant permission — Cloudflare's WAF blocks before robots.txt is checked.

## GEO Strategy

This site is optimized for Generative Engine Optimization (GEO) — being cited by ChatGPT, Claude, Perplexity, and similar AI systems:

- `robots.txt` explicitly allows all AI crawlers
- `llms.txt` provides structured site manifest for AI
- Every article has Article + FAQPage JSON-LD schema
- FAQ sections match real AI prompts
- Self-contained H2 sections for RAG extraction
- Original data assets (robot DB, funding tracker) earn citations
- Glossary pages target definition queries ("what is sim-to-real transfer")

## Environment Variables

See `.env.local.example` for all required and optional variables.

## License

Proprietary. All rights reserved. © 2026 humanoidintel.ai
