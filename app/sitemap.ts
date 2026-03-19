import { createClient } from '@/lib/supabase/server'
import type { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient()
  const { data: products } = await supabase
    .from('products').select('slug, updated_at').eq('status', 'active')

  const now = new Date()

  const productUrls: MetadataRoute.Sitemap = (products ?? []).map(p => ({
    url: `https://xanhsoft.com/product/${p.slug}`,
    lastModified: p.updated_at ? new Date(p.updated_at) : now,
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  return [
    { url: 'https://xanhsoft.com', lastModified: now, changeFrequency: 'daily', priority: 1.0 },
    { url: 'https://xanhsoft.com/shop', lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: 'https://xanhsoft.com/guides', lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    ...productUrls,
  ]
}