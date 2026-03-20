import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { ProductDetail } from '@/components/product/ProductDetail'
import type { Metadata } from 'next'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data: product } = await supabase
    .from('products').select('name, short_description, slug').eq('slug', slug).single()
  if (!product) return { title: 'Không tìm thấy sản phẩm' }
  return {
    title: `${product.name} — Giá Rẻ | XanhSoft`,
    description: product.short_description ?? `Mua ${product.name} giá rẻ tại XanhSoft. Giao tự động 24/7, bảo hành đăng nhập.`,
    alternates: { canonical: `https://xanhsoft.com/product/${product.slug}` },
    openGraph: {
      title: `${product.name} | XanhSoft`,
      description: product.short_description ?? '',
      url: `https://xanhsoft.com/product/${product.slug}`,
      siteName: 'XanhSoft',
      locale: 'vi_VN',
      type: 'website',
    },
  }
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: product } = await supabase
    .from('products')
    .select(`*, categories(*), product_variants(*), product_images(*), product_reviews(*)`)
    .eq('slug', slug)
    .eq('status', 'active')
    .single()

  if (!product) notFound()

  // Check admin
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = user
    ? await supabase.from('profiles').select('role').eq('id', user.id).single()
    : { data: null }
  const isAdmin = profile?.role === 'admin'

  return (
    <>
      <ProductDetail product={product} />

      {isAdmin && (
        
          href={`/admin/products/${product.id}`}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-bold text-white shadow-2xl hover:opacity-90 transition-all hover:-translate-y-0.5 active:scale-95"
          style={{
            background: 'linear-gradient(135deg, #2563EB, #1d4ed8)',
            boxShadow: '0 8px 24px rgba(37,99,235,0.4)',
          }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
          ✏️ Sửa sản phẩm
        </a>
      )}
    </>
  )
}