import { MetadataRoute } from 'next'
import { createServerClient } from '@/lib/supabase'
import { siteConfig } from '@/config/site'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteConfig.url

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

  try {
    const supabase = createServerClient()
    const { data: activeJobs } = await supabase
      .from('jobs')
      .select('category, countries, companies(slug)')
      .eq('status', 'active')

    if (activeJobs && activeJobs.length > 0) {
      // 1. Tally categories
      const catCounts: Record<string, number> = {}
      // 2. Tally countries
      const countryCounts: Record<string, number> = {}
      // 3. Tally companies
      const companyCounts: Record<string, number> = {}

      for (const job of activeJobs) {
        if (job.category) {
          catCounts[job.category] = (catCounts[job.category] || 0) + 1
        }
        if (Array.isArray(job.countries)) {
          for (const c of job.countries) {
            countryCounts[c] = (countryCounts[c] || 0) + 1
          }
        }
        const comp = job.companies as any
        if (comp?.slug) {
          companyCounts[comp.slug] = (companyCounts[comp.slug] || 0) + 1
        }
      }

      // Add categories with >= 5 jobs
      for (const [cat, count] of Object.entries(catCounts)) {
        if (count >= 5) {
          const slug = cat.toLowerCase().replace(/[^a-z0-9]+/g, '-')
          routes.push({
            url: `${baseUrl}/jobs/role/${slug}`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.7,
          })
        }
      }

      // Add countries with >= 5 jobs
      for (const [country, count] of Object.entries(countryCounts)) {
        if (count >= 5) {
          const slug = country.toLowerCase().replace(/[^a-z0-9]+/g, '-')
          routes.push({
            url: `${baseUrl}/jobs/country/${slug}`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.7,
          })
        }
      }

      // Add companies with >= 5 jobs
      for (const [slug, count] of Object.entries(companyCounts)) {
        if (count >= 5) {
          routes.push({
            url: `${baseUrl}/companies/${slug}`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.6,
          })
        }
      }
    }
  } catch (err) {
    console.error('Failed to query database for sitemap:', err)
  }

  return routes
}
