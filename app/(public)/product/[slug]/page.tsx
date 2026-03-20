import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { ProductDetail } from '@/components/product/ProductDetail'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: product } = await supabase
    .from('products').select('*').eq('slug', slug).single()
  if (!product) return { title: 'Không tìm thấy sản phẩm' }
  return {
    title: `${product.name} — Giá Rẻ | App Xanh`,
    description: product.short_description ?? `Mua ${product.name} giá rẻ tại App Xanh. Giao tự động 24/7, bảo hành đăng nhập.`,
    openGraph: {
      title: product.name,
      description: product.short_description ?? '',
      url: `https://xanhsoft.com/product/${product.slug}`,
      siteName: 'App Xanh',
      locale: 'vi_VN',
      type: 'website',
    },
  }
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()

  const [{ data: product }, ] = await Promise.all([
    supabase.from('products')
      .select(`*, categories(*), product_variants(*), product_images(*), product_reviews(*)`)
      .eq('slug', slug).eq('status', 'active').single(),
  ])

  if (!product) notFound()
 const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = user
    ? await supabase.from('profiles').select('role').eq('id', user.id).single()
    : { data: null }

  if (profile?.role === 'admin') {
    return (
      <>
        <ProductDetail product={product} />
        <a href={'/admin/products/' + product.id} className="fixed bottom-6 right-6 z-50 inline-flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-bold text-white hover:opacity-90 transition-all" style={{ background: 'linear-gradient(135deg,#2563EB,#1d4ed8)', boxShadow: '0 8px 24px rgba(37,99,235,0.4)' }}>
          ✏️ Sửa sản phẩm
        </a>
      </>
    )
  }
  return <ProductDetail product={product} />
}