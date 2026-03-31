import { createClient } from '@/lib/supabase/server'
import { ShopContent } from '@/components/shop/ShopContent'
import Script from 'next/script'
import type { Metadata } from 'next'

const SITE = 'https://xanhsoft.com'

export const metadata: Metadata = {
  title: 'Deal Hot — Tài Khoản Premium Giảm Giá Sâu | XanhSoft',
  description: 'Săn deal tài khoản premium giảm giá sâu nhất tại XanhSoft. ChatGPT Plus, Canva Pro, Claude Pro giảm đến 90%. Cập nhật liên tục, số lượng có hạn!',
  alternates: { canonical: `${SITE}/deals` },
  openGraph: {
    title: 'Deal Hot — Giảm Giá Sâu | XanhSoft',
    description: 'Tài khoản premium giảm giá sâu nhất. Cập nhật liên tục!',
    url: `${SITE}/deals`,
    siteName: 'XanhSoft',
    locale: 'vi_VN',
    type: 'website',
  },
}

export default async function DealsPage() {
  const supabase = await createClient()

  const [{ data: productsData }, { data: categoriesData }] = await Promise.all([
    supabase
      .from('products')
      .select('*, categories(*), product_variants(*), product_images(*)')
      .eq('status', 'active')
      .not('compare_at_price', 'is', null)
      .order('created_at', { ascending: false }),
    supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order'),
  ])

  // Chỉ lấy sản phẩm có giảm giá >= 10%
  const dealProducts = (productsData ?? []).filter(p =>
    p.compare_at_price && p.compare_at_price > p.price &&
    ((p.compare_at_price - p.price) / p.compare_at_price) * 100 >= 10
  )

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Deal Hot — Tài Khoản Premium Giảm Giá',
    url: `${SITE}/deals`,
    numberOfItems: dealProducts.length,
    itemListElement: dealProducts.slice(0, 24).map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: p.name,
      url: `${SITE}/product/${p.slug}`,
    })),
  }

  return (
    <>
      <Script
        id="deals-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero */}
      <div className="border-b border-slate-100"
        style={{ background: 'linear-gradient(135deg,#0f172a 0%,#1d4ed8 60%,#0891b2 100%)' }}>
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 md:py-14">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">🔥</span>
            <span className="text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-full"
              style={{ background: '#EF4444', color: 'white' }}>
              Deal Hot
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white mb-3"
            style={{ fontFamily: 'Sora, sans-serif' }}>
            Giảm Giá Sâu Hôm Nay
          </h1>
          <p className="text-blue-100/80 text-sm md:text-base max-w-xl">
            Tài khoản premium giảm đến 90% so với giá gốc.
            Số lượng có hạn — mua ngay kẻo hết!
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-2.5">
              <span className="text-lg">⚡</span>
              <div>
                <p className="text-white font-bold text-sm">{dealProducts.length} deal đang có</p>
                <p className="text-blue-200 text-xs">Cập nhật liên tục</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-2.5">
              <span className="text-lg">🛡️</span>
              <div>
                <p className="text-white font-bold text-sm">Bảo hành đăng nhập</p>
                <p className="text-blue-200 text-xs">Hỗ trợ 24/7</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {dealProducts.length === 0 ? (
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <div className="text-6xl mb-4">🎁</div>
          <h2 className="text-xl font-black text-slate-900 mb-2">Deal đang được cập nhật</h2>
          <p className="text-slate-500 mb-6">Quay lại sớm để không bỏ lỡ ưu đãi hấp dẫn nhé!</p>
          <a href="/shop"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-white text-sm"
            style={{ background: 'linear-gradient(135deg,#2563EB,#0891b2)' }}>
            Xem tất cả sản phẩm →
          </a>
        </div>
      ) : (
        <ShopContent
          initialProducts={dealProducts}
          initialCategories={categoriesData ?? []}
          initialCategory="all"
          initialSearch=""
          initialSort="price_asc"
        />
      )}
    </>
  )
}