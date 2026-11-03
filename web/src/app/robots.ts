import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.SITE_URL || 'https://cyberboard.co'

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/go/', '/admin/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
