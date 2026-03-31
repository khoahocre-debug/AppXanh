import { createClient } from '@/lib/supabase/server'
import { ShopContent } from '@/components/shop/ShopContent'
import { notFound } from 'next/navigation'
import Script from 'next/script'
import type { Metadata } from 'next'

const SITE = 'https://xanhsoft.com'

const CAT_META: Record<string, { desc: string; keywords: string[] }> = {
  'ai-chatbot': {
    desc: 'Mua tài khoản ChatGPT Plus, Claude Pro, Gemini Advanced giá rẻ tại XanhSoft. Tiết kiệm đến 90% so với giá gốc. Giao tự động sau thanh toán.',
    keywords: ['mua chatgpt plus', 'claude pro giá rẻ', 'gemini advanced', 'tài khoản ai giá rẻ'],
  },
  'thiet-ke': {
    desc: 'Mua tài khoản Canva Pro, Adobe Creative Cloud, Figma giá rẻ. Bản quyền chính hãng, giao ngay sau thanh toán, bảo hành đăng nhập.',
    keywords: ['canva pro giá rẻ', 'adobe creative cloud', 'figma professional', 'tài khoản thiết kế'],
  },
  'video-am-nhac': {
    desc: 'Mua YouTube Premium, Spotify Premium, CapCut Pro giá rẻ nhất Việt Nam. Xem video không quảng cáo, nghe nhạc chất lượng cao.',
    keywords: ['youtube premium giá rẻ', 'spotify premium', 'capcut pro', 'tài khoản video'],
  },
  'hoc-tap': {
    desc: 'Mua tài khoản Coursera Plus, Duolingo Plus, LinkedIn Learning giá rẻ. Học không giới hạn, chứng chỉ quốc tế, tiết kiệm đến 90%.',
    keywords: ['coursera plus giá rẻ', 'duolingo plus', 'linkedin learning', 'tài khoản học tập'],
  },
  'giai-tri': {
    desc: 'Mua tài khoản Netflix, Disney+, Amazon Prime giá rẻ tại XanhSoft. Xem phim không giới hạn, chất lượng 4K.',
    keywords: ['netflix giá rẻ', 'disney plus', 'amazon prime', 'tài khoản giải trí'],
  },
  'cong-cu-dev': {
    desc: 'Mua tài khoản GitHub Copilot, JetBrains, Replit Pro giá rẻ. Công cụ lập trình bản quyền, giao ngay sau thanh toán.',
    keywords: ['github copilot giá rẻ', 'jetbrains license', 'replit pro', 'tài khoản developer'],
  },
}

type Props = { params: Promise<{ category: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params
  const supabase = await createClient()

  const { data: cat } = await supabase
    .from('categories').select('name, slug').eq('slug', category).single()

  if (!cat) return { title: 'Không tìm thấy danh mục' }

  const extra = CAT_META[category]
  const title = `${cat.name} Giá Rẻ — Bản Quyền Chính Hãng | XanhSoft`
  const description = extra?.desc ?? `Mua ${cat.name} giá rẻ tại XanhSoft. Tiết kiệm đến 90%, giao tự động sau thanh toán, bảo hành đăng nhập.`
  const canonical = `${SITE}/shop/${cat.slug}`

  return {
    title,
    description,
    keywords: extra?.keywords ?? [`${cat.name} giá rẻ`, 'xanhsoft', 'tài khoản premium'],
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: 'XanhSoft',
      locale: 'vi_VN',
      type: 'website',
    },
    twitter: { card: 'summary_large_image', title, description },
  }
}

export default async function CategoryPage({ params }: Props) {
  const { category } = await params
  const supabase = await createClient()

  const [{ data: catData }, { data: productsData }, { data: categoriesData }] = await Promise.all([
    supabase.from('categories').select('*').eq('slug', category).single(),
    supabase
      .from('products')
      .select('*, categories(*), product_variants(*), product_images(*)')
      .eq('status', 'active'),
    supabase.from('categories').select('*').eq('is_active', true).order('sort_order'),
  ])

  if (!catData) notFound()

  const catProducts = (productsData ?? []).filter(p => p.categories?.slug === category)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${catData.name} Giá Rẻ — XanhSoft`,
    url: `${SITE}/shop/${category}`,
    numberOfItems: catProducts.length,
    itemListElement: catProducts.slice(0, 24).map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: p.name,
      url: `${SITE}/product/${p.slug}`,
    })),
  }

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Trang chủ', item: SITE },
      { '@type': 'ListItem', position: 2, name: 'Shop', item: `${SITE}/shop` },
      { '@type': 'ListItem', position: 3, name: catData.name, item: `${SITE}/shop/${category}` },
    ],
  }

  return (
    <>
      <Script id="category-schema" type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([jsonLd, breadcrumb]) }} />

      {/* Hero category */}
      <div className="border-b border-slate-100 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-10">
          {/* Breadcrumb */}
          <nav className="text-xs text-slate-400 mb-4 flex items-center gap-1.5">
            <a href="/" className="hover:text-blue-600 transition-colors">Trang chủ</a>
            <span>/</span>
            <a href="/shop" className="hover:text-blue-600 transition-colors">Shop</a>
            <span>/</span>
            <span className="font-semibold text-slate-600">{catData.name}</span>
          </nav>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 mb-2"
            style={{ fontFamily: 'Sora, sans-serif' }}>
            {catData.name} Giá Rẻ
          </h1>
          <p className="text-slate-500 text-sm max-w-2xl">
            {CAT_META[category]?.desc ?? `Mua ${catData.name} giá rẻ tại XanhSoft. Tiết kiệm đến 90%, giao tự động sau thanh toán.`}
          </p>
          <div className="mt-3 text-xs text-slate-400">
            <span className="font-semibold text-slate-600">{catProducts.length}</span> sản phẩm trong danh mục này
          </div>
        </div>
      </div>

      <ShopContent
        initialProducts={productsData ?? []}
        initialCategories={categoriesData ?? []}
        initialCategory={category}
        initialSearch=""
        initialSort="newest"
      />
    </>
  )
}