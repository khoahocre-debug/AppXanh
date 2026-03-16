import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { ProductDetail } from '@/components/product/ProductDetail'
import type { Metadata } from 'next'
import { formatPrice } from '@/lib/utils'

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: product } = await supabase
    .from('products').select('*').eq('slug', slug).single()

  if (!product) return { title: 'Sản phẩm không tồn tại' }

  return {
    title: `${product.name} — Giá Rẻ | App Xanh`,
    description: product.short_description ?? `Mua ${product.name} giá rẻ tại App Xanh. Giao tự động 24/7.`,
    openGraph: {
      title: product.name,
      description: product.short_description ?? '',
      url: `https://appxanh.com/product/${product.slug}`,
      siteName: 'App Xanh',
      locale: 'vi_VN',
      type: 'website',
    },
  }
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: product } = await supabase
    .from('products')
    .select(`*, categories(*), product_variants(*), product_images(*)`)
    .eq('slug', slug)
    .eq('status', 'active')
    .single()

  if (!product) notFound()
  return <ProductDetail product={product} />
}

