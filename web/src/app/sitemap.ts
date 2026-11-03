import { MetadataRoute } from 'next'
import { ALL_CATEGORIES } from '@/lib/types'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.SITE_URL || 'https://cyberboard.co'

  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/employers`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/remove`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ]

  // Add category landing pages
  ALL_CATEGORIES.forEach((cat) => {
    const slug = cat.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    routes.push({
      url: `${baseUrl}/jobs/role/${slug}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    })
  })

  // Add top countries
  const countries = ['india', 'united-states', 'united-kingdom', 'canada', 'germany', 'israel', 'singapore']
  countries.forEach((country) => {
    routes.push({
      url: `${baseUrl}/jobs/country/${country}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    })
  })

  return routes
}
