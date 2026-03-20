import { ProductForm } from '@/components/admin/ProductForm'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

export const metadata = { title: 'Sua San Pham | Admin' }

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const selectQuery = '*, product_variants(*), product_images(*)'

  const [{ data: product }, { data: categories }] = await Promise.all([
    supabase.from('products').select(selectQuery).eq('id', id).single(),
    supabase.from('categories').select('*').eq('is_active', true).order('sort_order'),
  ])

  if (!product) notFound()

  const productUrl = '/product/' + product.slug

  return (
    <div>
      <div className="mb-7">
        <h1 className="text-2xl font-black text-slate-900" style={{ fontFamily: 'Sora, sans-serif' }}>
          Sua San Pham
        </h1>
        <a href={productUrl} target="_blank" className="text-sm mt-1 font-mono hover:underline inline-flex items-center gap-1" style={{ color: '#2563EB' }}>
          {product.slug} ↗
        </a>
      </div>
      <ProductForm categories={categories ?? []} product={product} />
    </div>
  )
}