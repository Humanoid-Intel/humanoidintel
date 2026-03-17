/**
 * humanoidintel.ai Agent Configuration
 * Central config for all source URLs, API keys, thresholds, and agent behavior
 */
import { config as loadEnv } from 'dotenv'
import { resolve } from 'path'
loadEnv({ path: resolve(__dirname, '../.env.local'), override: true })

export const config = {
  site: {
    name: 'humanoidintel.ai',
    domain: 'https://humanoidintel.ai',
    contentDir: '../content',
  },

  agent: {
    publishMode: (process.env.PUBLISH_MODE as 'draft' | 'auto' | 'full') || 'draft',
    confidenceThreshold: parseFloat(process.env.CONFIDENCE_THRESHOLD || '0.8'),
    runIntervalMinutes: 60,
    maxArticlesPerRun: 20,
  },

  rssFeeds: [
    // ── Tier 1: Dedicated robotics press ──────────────────────────────────
    'https://spectrum.ieee.org/feeds/topic/robotics.rss',
    'https://www.therobotreport.com/feed/',
    // TechCrunch — topic & company tags (high signal, fast publishing, strong humanoid coverage)
    'https://techcrunch.com/tag/robotics/feed/',
    'https://techcrunch.com/tag/humanoid-robots/feed/',
    'https://techcrunch.com/tag/boston-dynamics/feed/',
    'https://techcrunch.com/tag/figure/feed/',
    'https://techcrunch.com/tag/nvidia/feed/',              // TC/Nvidia — critical during GTC + ongoing
    'https://techcrunch.com/tag/physical-intelligence/feed/', // PI π0 model news
    'https://techcrunch.com/tag/agility-robotics/feed/',    // Digit / Amazon deployments
    'https://techcrunch.com/tag/apptronik/feed/',           // Apollo / Google DeepMind news
    'https://techcrunch.com/tag/1x-technologies/feed/',     // NEO home robot
    'https://techcrunch.com/tag/skild/feed/',               // Skild Brain funding/partnerships
    'https://www.theverge.com/rss/robotics/index.xml',
    'https://venturebeat.com/category/ai/feed/',
    'https://newatlas.com/robotics/feed/',                        // New Atlas robotics
    'https://roboticsandautomationnews.com/feed/',                // Robotics & Automation News — filtered by HUMANOID_SPECIFIC gate
    'https://thedebrief.org/category/tech/feed/',                // The Debrief (defense/emerging tech)

    // ── Tier 2: General tech & business (high signal for robotics funding) ─
    'https://www.wired.com/feed/category/science/latest/rss',
    'https://www.technologyreview.com/feed/',                     // MIT Tech Review
    'https://feeds.feedburner.com/TechCrunch',                   // TC general
    'https://fortune.com/feed/',                                  // Fortune
    'https://www.businessinsider.com/rss',                       // Business Insider

    // ── Tier 3: Company blogs (working ones only) ─────────────────────────
    'https://neura-robotics.com/news/rss',                       // NEURA Robotics

    // ── Tier 4: Academic & research ───────────────────────────────────────
    'https://arxiv.org/rss/cs.RO',
    // cs.AI removed — too broad (entire AI field); cs.RO + HUMANOID_SPECIFIC gate is sufficient
    'https://rss.sciencedirect.com/publication/science/09218890', // Robotics & Autonomous Systems

    // ── Tier 5: Financial & funding signals ───────────────────────────────
    'https://news.crunchbase.com/tag/robotics/feed/',
    'https://www.globenewswire.com/RssFeed/subjectCode/16-Robotics', // GlobeNewswire robotics

    // ── Tier 6: Asia / China / Europe ─────────────────────────────────────
    'https://asia.nikkei.com/rss/feed/section/Business',         // Nikkei Asia business
    'https://www.scmp.com/rss/5/feed',                           // South China Morning Post tech
    'https://koreajoongangdaily.joins.com/rss/feeds/news.xml',   // Korea JoongAng Daily
    'https://technode.com/feed/',                                 // TechNode (China tech English)
    'https://www.theroboticspost.com/feed',                      // The Robotics Post (EU)
  ],

  // High-signal X/Twitter accounts for mention monitoring
  twitterAccounts: [
    'Figure_robot',
    'AgilityRobotics',
    'BostonDynamics',
    'apptronik',
    'UnitreeRobotics',
    'sanctuaryai',
    'NEURARobotics',
    'CloneRobotics',
    'realDrJimFan',
    'adaborobotics', // Brett Adcock
    'elonmusk',
    'JensenHuang',
    'chelseabfinn',
    'hausman_k',
  ],

  // Search queries for Google News API
  searchQueries: [
    'humanoid robot funding',
    'humanoid robotics deployment',
    'Figure AI',
    'Tesla Optimus',
    'Boston Dynamics Atlas',
    'Agility Robotics Digit',
    '1X Technologies NEO',
    'Sanctuary AI Phoenix',
    'Apptronik Apollo',
    'humanoid robot manufacturing',
    'physical AI robotics',
  ],

  // arXiv categories to monitor
  arxivCategories: ['cs.RO', 'cs.AI'],
  arxivKeywords: [
    'humanoid',
    'bipedal',
    'whole-body control',
    'sim-to-real',
    'vision-language-action',
    'dexterous manipulation',
    'locomotion',
    'legged robot',
  ],

  // Newsworthiness scoring weights
  scoring: {
    fundingRound: 90,
    productLaunch: 85,
    partnership: 80,
    deployment: 80,
    executiveHire: 60,
    technicalDemo: 70,
    researchPaper: 65,
    opinionCommentary: 30,
    timeDecay24h: 10, // bonus for last 24h
    timeDecay48h: 5,
    timeDecayWeek: 0,
    minThreshold: 40, // minimum score to generate article
  },

  // Companies to specifically track (slug → display name)
  trackedCompanies: {
    // USA
    'figure-ai': 'Figure AI',
    tesla: 'Tesla',
    'boston-dynamics': 'Boston Dynamics',
    'agility-robotics': 'Agility Robotics',
    '1x-technologies': '1X Technologies',
    'sanctuary-ai': 'Sanctuary AI',
    apptronik: 'Apptronik',
    'physical-intelligence': 'Physical Intelligence',
    'skild-ai': 'Skild AI',
    'clone-robotics': 'Clone Robotics',
    'mentee-robotics': 'Mentee Robotics',
    flexion: 'Flexion',
    'dyna-robotics': 'Dyna Robotics',
    'persona-ai': 'Persona AI',
    mobileye: 'Mobileye',
    // China
    unitree: 'Unitree Robotics',
    agibot: 'Agibot',
    kepler: 'Kepler Robotics',
    galbot: 'Galbot',
    'leju-robotics': 'Leju Robotics',
    ubtech: 'UBTECH',
    astribot: 'Astribot',
    sunday: 'Sunday',
    // Europe
    'neura-robotics': 'NEURA Robotics',
    'fourier-intelligence': 'Fourier Intelligence',
    wandercraft: 'Wandercraft',
    'enchanted-tools': 'Enchanted Tools',
    // Asia (non-China)
    honda: 'Honda',
    toyota: 'Toyota',
    hyundai: 'Hyundai',
    samsung: 'Samsung',
  },

  // API keys (loaded from environment)
  api: {
    anthropic: process.env.ANTHROPIC_API_KEY || '',
    twitterBearer: process.env.TWITTER_BEARER_TOKEN || '',
    twitterApiKey: process.env.TWITTER_API_KEY || '',
    twitterApiSecret: process.env.TWITTER_API_SECRET || '',
    twitterAccessToken: process.env.TWITTER_ACCESS_TOKEN || '',
    twitterAccessSecret: process.env.TWITTER_ACCESS_SECRET || '',
    googleNews: process.env.GOOGLE_NEWS_API_KEY || '',
    github: process.env.GITHUB_TOKEN || '',
    buttondown: process.env.BUTTONDOWN_API_KEY || '',
    linkedInToken: process.env.LINKEDIN_ACCESS_TOKEN || '',
    linkedInAuthorUrn: process.env.LINKEDIN_AUTHOR_URN || '',
  },

  xPosting: {
    enabled: process.env.X_POSTING_ENABLED === 'true',
    maxPostsPerDay: 3,          // 3 posts/day — good engagement cadence
    scoreThreshold: 85,         // quality stories (was 95 — too restrictive)
    maxAgeHours: 20,            // don't post stale news
  },

  linkedInPosting: {
    enabled: process.env.LINKEDIN_ENABLED === 'true',
    maxPostsPerDay: 3,
    scoreThreshold: 85,         // quality stories
    maxAgeHours: 24,
    categories: ['breaking', 'market'] as string[], // broader than X
  },

  notifications: {
    webhookUrl: process.env.NOTIFICATION_WEBHOOK || '',
    slackChannel: '#humanoidintel-drafts',
  },
}
