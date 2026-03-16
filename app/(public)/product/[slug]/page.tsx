import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { ProductDetail } from '@/components/product/ProductDetail'
import type { Metadata } from 'next'
import { formatPrice } from '@/lib/utils'

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data: product } = await supabase
    .from('products').select('name, short_description, price').eq('slug', slug).single()
  if (!product) return { title: 'Sản phẩm không tìm thấy' }
  return {
    title: product.name,
    description: product.short_description ?? `Mua ${product.name} chỉ ${formatPrice(product.price)} tại App Xanh`,
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