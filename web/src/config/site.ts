/**
 * Global site configuration and contact channels.
 * Single source of truth driven by NEXT_PUBLIC_SITE_URL.
 */

export const siteConfig = {
  name: 'Cyberboard',
  description: 'Cybersecurity job board connecting verified practitioners with authentic security hiring teams.',
  url: process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'https://cyberboard.co',
  emails: {
    contact: 'contact@cyberboard.co',
    employers: 'employers@cyberboard.co',
    legal: 'legal@cyberboard.co',
    privacy: 'privacy@cyberboard.co',
  },
} as const

/**
 * Official launch/deployment date for the NEW badge cutoff.
 * Jobs first seen on or before this date are treated as pre-launch seed data and will NEVER show the NEW badge.
 * Only roles discovered AFTER this timestamp (and within 3 days) qualify for the NEW badge.
 * Set via NEXT_PUBLIC_LAUNCH_DATE in deployment environments or falls back to deployment timestamp.
 */
export const LAUNCH_DATE =
  process.env.NEXT_PUBLIC_LAUNCH_DATE || process.env.LAUNCH_DATE || '2026-11-23T18:00:00Z'

