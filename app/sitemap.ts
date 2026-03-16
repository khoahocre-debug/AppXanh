import { createClient } from '@/lib/supabase/server'
import type { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient()
  const { data: products } = await supabase
    .from('products').select('slug, updated_at').eq('status', 'active')

  const productUrls = products?.map(p => ({
    url: `https://appxanh.com/product/${p.slug}`,
    lastModified: new Date(p.updated_at),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  })) ?? []

  return [
    { url: 'https://appxanh.com', lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: 'https://appxanh.com/shop', lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    ...productUrls,
  ]
}