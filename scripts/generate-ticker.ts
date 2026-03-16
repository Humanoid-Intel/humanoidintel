/**
 * Generates /public/ticker-data.json from latest news + funding data.
 * Run after every agent publish cycle.
 * npx tsx scripts/generate-ticker.ts
 */
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const root = path.join(__dirname, '..')
const outputPath = path.join(root, 'public/ticker-data.json')

interface TickerItem {
  symbol: string
  label: string
  status: string
  positive: boolean
}

const COMPANY_TICKERS: Array<{
  symbol: string
  label: string
  companyNames: string[]
  defaultStatus: string
  defaultPositive: boolean
}> = [
  { symbol: 'FIG.AI',    label: 'Figure 03',   companyNames: ['figure ai', 'figure'],            defaultStatus: '+1.5B.SeriesC', defaultPositive: true },
  { symbol: 'TSLA.BOT',  label: 'Optimus',     companyNames: ['tesla', 'optimus'],               defaultStatus: '+8k.Units.Q1',  defaultPositive: true },
  { symbol: 'BOS.DYN',   label: 'Atlas',       companyNames: ['boston dynamics', 'atlas'],       defaultStatus: '+New.CEO.2026',  defaultPositive: true },
  { symbol: 'AGIL.ROB',  label: 'Digit',       companyNames: ['agility robotics', 'digit'],      defaultStatus: '+AMZN.Scale',   defaultPositive: true },
  { symbol: 'NEURA',     label: '4NE-1',       companyNames: ['neura', 'neura robotics'],        defaultStatus: '+$1B.SeriesD',  defaultPositive: true },
  { symbol: 'APP.TRON',  label: 'Apollo',      companyNames: ['apptronik', 'apollo'],            defaultStatus: '+$520M.ExtA',   defaultPositive: true },
  { symbol: 'UNIT.REE',  label: 'G1',          companyNames: ['unitree', 'unitree robotics'],    defaultStatus: '+3k.Ships.25',  defaultPositive: true },
  { symbol: 'SUNDAY',    label: 'HomeBot',     companyNames: ['sunday robotics', 'sunday'],      defaultStatus: '+$1.15B.Val',   defaultPositive: true },
  { symbol: 'GALBOT',    label: 'G1',          companyNames: ['galbot'],                         defaultStatus: '+RMB2.5B.SerB', defaultPositive: true },
  { symbol: 'SANC.AI',   label: 'Phoenix',     companyNames: ['sanctuary ai', 'sanctuary'],      defaultStatus: '+$90M.SeriesD', defaultPositive: true },
  { symbol: '1X.TECH',   label: 'NEO',         companyNames: ['1x technologies', '1x'],          defaultStatus: '+$125M.SerC',   defaultPositive: true },
  { symbol: 'MIND.ROB',  label: 'Stealth',     companyNames: ['mind robotics', 'rivian'],        defaultStatus: '+Founded.2026', defaultPositive: true },
]

function compressTitle(title: string, company: string): { status: string; positive: boolean } {
  const t = title.toLowerCase()

  // Negative signals
  if (t.includes('steps down') || t.includes('resign') || t.includes('layoff')) {
    return { status: '-CEO.Change', positive: false }
  }
  if (t.includes('delay') || t.includes('recall') || t.includes('shutdown')) {
    return { status: '-Prod.Delay', positive: false }
  }

  // Funding — match $ or € or RMB amounts
  const fundMatch = title.match(/\$([0-9.]+[MBmb])/i)
  const eurMatch = title.match(/€([0-9.]+[MBmb])/i)
  const rmbMatch = title.match(/RMB\s*([0-9.]+[BMbm])/i)
  if (fundMatch || eurMatch || rmbMatch) {
    const raw = fundMatch?.[0] ?? eurMatch?.[0] ?? `RMB${rmbMatch![1]}`
    const seriesMatch = title.match(/Series\s+([A-Z])/i)
    if (seriesMatch) return { status: `+Ser${seriesMatch[1]}.${raw}`, positive: true }
    return { status: `+Fund.${raw}`, positive: true }
  }

  // Valuation
  const valMatch = title.match(/\$([0-9.]+[BMbm])\s+[Vv]aluation/)
  if (valMatch) return { status: `+Val.${valMatch[1]}`, positive: true }

  // Deployment
  if (t.includes('deploy') || t.includes('factory') || t.includes('plant') || t.includes('warehouse')) {
    return { status: '+Factory.Deploy', positive: true }
  }

  // Demo / public
  if (t.includes('times square') || t.includes('mwc') || t.includes('ces ') || t.includes('demo')) {
    return { status: '+Public.Demo', positive: true }
  }

  // Partnership / collab
  if (t.includes('partner') || t.includes('collab') || t.includes('powered') || t.includes('integrat')) {
    return { status: '+Partnership', positive: true }
  }

  // Launch / announce
  if (t.includes('launch') || t.includes('introduce') || t.includes('unveil') || t.includes('announce')) {
    return { status: '+Launch', positive: true }
  }

  // IPO / unicorn
  if (t.includes('unicorn') || t.includes('ipo') || t.includes('billion')) {
    return { status: '+Unicorn', positive: true }
  }

  return { status: '+News', positive: true }
}

function loadNewsArticles() {
  const newsDir = path.join(root, 'content/news')
  if (!fs.existsSync(newsDir)) return []
  return fs.readdirSync(newsDir)
    .filter((f) => f.endsWith('.md'))
    .map((filename) => {
      const { data } = matter(fs.readFileSync(path.join(newsDir, filename), 'utf-8'))
      return {
        title: (data.title ?? '') as string,
        date: (data.date ?? '') as string,
        companies: (Array.isArray(data.companies) ? data.companies : []) as string[],
        tags: (Array.isArray(data.tags) ? data.tags : []) as string[],
      }
    })
    .filter((a) => a.date)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

function totalRaised2026(): string {
  const file = path.join(root, 'content/data/funding-rounds.json')
  if (!fs.existsSync(file)) return '$5B+'
  const rounds: any[] = JSON.parse(fs.readFileSync(file, 'utf-8'))

  function parseM(amt: string): number {
    if (!amt || amt === 'N/A') return 0
    const parenMatch = amt.match(/\(~?\$([0-9.]+[BMbm]?)\)/)
    if (parenMatch) {
      const inner = parenMatch[1]
      const n = parseFloat(inner)
      if (!isNaN(n)) return inner.toUpperCase().includes('B') ? n * 1000 : n
    }
    const stripped = amt.replace(/[^0-9.BMKbmk]/g, '')
    const n = parseFloat(stripped)
    if (isNaN(n)) return 0
    const u = amt.toUpperCase()
    if (u.includes('B')) return n * 1000
    if (u.includes('K')) return n / 1000
    return n
  }

  const total = rounds
    .filter((r) => r.date && r.date.startsWith('2026'))
    .reduce((sum, r) => sum + parseM(r.amount), 0)

  if (total >= 1000) return `$${(total / 1000).toFixed(1)}B.2026`
  return `$${Math.round(total)}M.2026`
}

// ── Build ticker ──────────────────────────────────────────────────────────────
const articles = loadNewsArticles()

const items: TickerItem[] = COMPANY_TICKERS.map(({ symbol, label, companyNames, defaultStatus, defaultPositive }) => {
  // Find most recent article mentioning this company
  const match = articles.find((a) => {
    const text = `${a.title} ${a.companies.join(' ')} ${a.tags.join(' ')}`.toLowerCase()
    return companyNames.some((n) => text.includes(n))
  })

  if (match) {
    const { status, positive } = compressTitle(match.title, label)
    return { symbol, label, status, positive }
  }

  return { symbol, label, status: defaultStatus, positive: defaultPositive }
})

// Add fund YTD summary
items.push({ symbol: 'FUND.YTD', label: '2026', status: totalRaised2026(), positive: true })

fs.writeFileSync(outputPath, JSON.stringify(items, null, 2), 'utf-8')
console.log(`[ticker] Wrote ${items.length} ticker items to public/ticker-data.json`)
items.forEach((i) => console.log(`  ${i.symbol.padEnd(10)} ${i.label.padEnd(12)} ${i.status}`))
