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

