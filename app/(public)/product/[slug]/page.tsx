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

  return <ProductDetail product={product} />
}