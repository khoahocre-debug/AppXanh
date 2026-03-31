import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { ShopContent } from '@/components/shop/ShopContent'
import Script from 'next/script'
import type { Metadata } from 'next'

const SITE = 'https://xanhsoft.com'

type Props = {
  searchParams: Promise<{ category?: string; q?: string; sort?: string }>
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { category, q } = await searchParams
  const supabase = await createClient()

  let title = 'Shop Tài Khoản Premium Giá Rẻ | XanhSoft'
  let description = 'Mua tài khoản ChatGPT Plus, Claude Pro, Canva Pro, YouTube Premium, Coursera Plus giá rẻ nhất Việt Nam. Tiết kiệm đến 90%, giao ngay sau thanh toán.'
  let canonical = `${SITE}/shop`

  if (q) {
    title = `Tìm kiếm "${q}" — Tài Khoản Premium | XanhSoft`
    description = `Kết quả tìm kiếm "${q}" tại XanhSoft. Mua tài khoản premium giá rẻ, giao tự động 24/7.`
    canonical = `${SITE}/shop` // search không canonical riêng, tránh duplicate
  } else if (category && category !== 'all') {
    const { data: cat } = await supabase
      .from('categories').select('name, slug').eq('slug', category).single()
    if (cat) {
      title = `${cat.name} Giá Rẻ — Tài Khoản Premium | XanhSoft`
      description = `Mua ${cat.name} giá rẻ tại XanhSoft. Bản quyền chính hãng, giao ngay sau thanh toán, bảo hành đăng nhập.`
      canonical = `${SITE}/shop?category=${cat.slug}`
    }
  }

  return {
    title,
    description,
    keywords: [
      'mua tài khoản chatgpt', 'claude pro giá rẻ', 'canva pro bản quyền',
      'coursera plus giá rẻ', 'youtube premium', 'tài khoản premium việt nam',
      'xanhsoft', 'mua tài khoản giá rẻ',
    ],
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: 'XanhSoft',
      locale: 'vi_VN',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  }
}

export default async function ShopPage({ searchParams }: Props) {
  const { category, q, sort } = await searchParams
  const supabase = await createClient()

  // SSR fetch — Google thấy ngay trong HTML
  const [{ data: productsData }, { data: categoriesData }] = await Promise.all([
    supabase
      .from('products')
      .select('*, categories(*), product_variants(*), product_images(*)')
      .eq('status', 'active'),
    supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order'),
  ])

  const products = productsData ?? []
  const categories = categoriesData ?? []

  // ItemList JSON-LD cho Google hiểu listing
  const listItems = products.slice(0, 24).map((p, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: p.name,
    url: `${SITE}/product/${p.slug}`,
  }))

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Tài Khoản Premium Giá Rẻ — XanhSoft',
    description: 'Danh sách tài khoản premium giá tốt nhất Việt Nam',
    url: `${SITE}/shop`,
    numberOfItems: products.length,
    itemListElement: listItems,
  }

  return (
    <>
      <Script
        id="shop-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Suspense fallback={
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="h-8 w-48 rounded-xl animate-pulse mb-8" style={{ background: '#e2e8f0' }} />
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl h-72 animate-pulse" style={{ background: '#f1f5f9' }} />
            ))}
          </div>
        </div>
      }>
        <ShopContent
          initialProducts={products}
          initialCategories={categories}
          initialCategory={category ?? 'all'}
          initialSearch={q ?? ''}
          initialSort={(sort as any) ?? 'newest'}
        />
      </Suspense>
    </>
  )
}