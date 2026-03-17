import type { Metadata } from 'next'
import type { Article, Robot } from './types'

const BASE_URL = 'https://humanoidintel.ai'
const SITE_NAME = 'humanoidintel.ai'

export function generateMetaTags(
  title: string,
  description: string,
  path: string,
): Metadata {
  const url = `${BASE_URL}${path}`
  return {
    title: `${title} — ${SITE_NAME}`,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: 'website',
      url,
      siteName: SITE_NAME,
      title: `${title} — ${SITE_NAME}`,
      description,
      images: [{ url: '/og-image.png', width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} — ${SITE_NAME}`,
      description,
      images: ['/og-image.png'],
      creator: '@humanoidintel',
    },
  }
}

export function generateArticleSchema(article: Article) {
  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.title,
    description: article.excerpt,
    datePublished: article.date,
    dateModified: article.updated ?? article.date,
    image: `${BASE_URL}/news/${article.slug}/opengraph-image`,
    author: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: BASE_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: BASE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${BASE_URL}/logo.png`,
      },
    },
    url: `${BASE_URL}/news/${article.slug}`,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${BASE_URL}/news/${article.slug}`,
    },
    keywords: article.tags.join(', '),
    articleSection: article.category,
    isAccessibleForFree: true,
  }
}

export function generateBreadcrumbSchema(crumbs: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((crumb, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: crumb.name,
      item: crumb.url,
    })),
  }
}

export function generateRobotSchema(robot: Robot) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: robot.name,
    description: robot.description,
    brand: {
      '@type': 'Brand',
      name: robot.manufacturer,
    },
    category: 'Humanoid Robot',
    url: `${BASE_URL}/robots/${robot.slug}`,
    additionalProperty: [
      robot.height && {
        '@type': 'PropertyValue',
        name: 'Height',
        value: robot.height,
      },
      robot.weight && {
        '@type': 'PropertyValue',
        name: 'Weight',
        value: robot.weight,
      },
      robot.payload && {
        '@type': 'PropertyValue',
        name: 'Payload',
        value: robot.payload,
      },
      robot.battery && {
        '@type': 'PropertyValue',
        name: 'Battery Life',
        value: robot.battery,
      },
      {
        '@type': 'PropertyValue',
        name: 'Actuation Type',
        value: robot.actuatorType,
      },
    ].filter(Boolean),
  }
}

export function generateFAQSchema(faqs: { q: string; a: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.a,
      },
    })),
  }
}

export function generateOrgSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: BASE_URL,
    logo: `${BASE_URL}/logo.png`,
    description:
      'The definitive intelligence platform for humanoid robotics — covering funding, robot specs, market data, and research.',
    foundingDate: '2025',
    sameAs: ['https://twitter.com/humanoidintel'],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'editorial',
      email: 'hello@humanoidintel.ai',
    },
  }
}
