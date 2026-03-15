/**
 * humanoidintel.ai Agent Configuration
 * Central config for all source URLs, API keys, thresholds, and agent behavior
 */

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
    maxArticlesPerRun: 5,
  },

  rssFeeds: [
    'https://spectrum.ieee.org/feeds/topic/robotics.rss',
    'https://techcrunch.com/tag/robotics/feed/',
    'https://www.therobotreport.com/feed/',
    'https://www.theverge.com/rss/robotics/index.xml',
    'https://arxiv.org/rss/cs.RO',
    'https://blog.google/technology/ai/rss/',
    'https://feeds.feedburner.com/venturebeat/SZYF', // VentureBeat AI
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
    minThreshold: 50, // minimum score to generate article
  },

  // Companies to specifically track (slug → display name)
  trackedCompanies: {
    'figure-ai': 'Figure AI',
    tesla: 'Tesla',
    'boston-dynamics': 'Boston Dynamics',
    'agility-robotics': 'Agility Robotics',
    '1x-technologies': '1X Technologies',
    'sanctuary-ai': 'Sanctuary AI',
    apptronik: 'Apptronik',
    unitree: 'Unitree Robotics',
    'neura-robotics': 'NEURA Robotics',
    'fourier-intelligence': 'Fourier Intelligence',
    agibot: 'Agibot',
    kepler: 'Kepler',
    'physical-intelligence': 'Physical Intelligence',
  },

  // API keys (loaded from environment)
  api: {
    anthropic: process.env.ANTHROPIC_API_KEY || '',
    twitterBearer: process.env.TWITTER_BEARER_TOKEN || '',
    googleNews: process.env.GOOGLE_NEWS_API_KEY || '',
    github: process.env.GITHUB_TOKEN || '',
    buttondown: process.env.BUTTONDOWN_API_KEY || '',
  },

  notifications: {
    webhookUrl: process.env.NOTIFICATION_WEBHOOK || '',
    slackChannel: '#humanoidintel-drafts',
  },
}
