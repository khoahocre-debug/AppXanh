import { ProductForm } from '@/components/admin/ProductForm'
import { createClient } from '@/lib/supabase/server'

export const metadata = { title: 'Thêm Sản Phẩm | Admin' }

export default async function NewProductPage() {
  const supabase = await createClient()
  const { data: categories } = await supabase
    .from('categories').select('*').eq('is_active', true).order('sort_order')

  return (
    <div>
      <div className="mb-7">
        <h1 className="text-2xl font-black text-slate-900" style={{ fontFamily: 'Sora, sans-serif' }}>
          Thêm Sản Phẩm Mới
        </h1>
        <p className="text-slate-500 text-sm mt-1">Điền đầy đủ thông tin sản phẩm</p>
      </div>
      <ProductForm categories={categories ?? []} />
    </div>
  )
}