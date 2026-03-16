import { ProductForm } from '@/components/admin/ProductForm'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

export const metadata = { title: 'Sửa Sản Phẩm | Admin' }

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: product }, { data: categories }] = await Promise.all([
    supabase.from('products')
      .select(`*, product_variants(*), product_images(*)`)
      .eq('id', id).single(),
    supabase.from('categories').select('*').eq('is_active', true).order('sort_order'),
  ])

  if (!product) notFound()

  return (
    <div>
      <div className="mb-7">
        <h1 className="text-2xl font-black text-slate-900" style={{ fontFamily: 'Sora, sans-serif' }}>
          Sửa Sản Phẩm
        </h1>
        <p className="text-slate-500 text-sm mt-1 font-mono">{product.slug}</p>
      </div>
      <ProductForm categories={categories ?? []} product={product} />
    </div>
  )
}