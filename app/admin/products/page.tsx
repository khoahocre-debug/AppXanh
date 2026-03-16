import { createClient } from '@/lib/supabase/server'
import { formatPrice } from '@/lib/utils'
import Link from 'next/link'
import { Plus, Edit, Eye, EyeOff } from 'lucide-react'

export const metadata = { title: 'Sản Phẩm | Admin' }

export default async function AdminProductsPage() {
  const supabase = await createClient()
  const { data: products } = await supabase
    .from('products')
    .select(`*, categories(name)`)
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="text-2xl font-black text-slate-900" style={{ fontFamily: 'Sora, sans-serif' }}>
            Quản Lý Sản Phẩm
          </h1>
          <p className="text-slate-500 text-sm mt-1">{products?.length ?? 0} sản phẩm</p>
        </div>
        <Link href="/admin/products/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white transition-all"
          style={{ background: 'linear-gradient(135deg, #2563EB, #1d4ed8)' }}>
          <Plus size={18} /> Thêm Sản Phẩm
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: '#F8FAFC' }}>
                {['Sản Phẩm', 'Danh Mục', 'Giá', 'Tồn Kho', 'Trạng Thái', 'Badge', ''].map(h => (
                  <th key={h} className="text-left px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products?.map(product => (
                <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-semibold text-slate-900 max-w-[200px] truncate">{product.name}</p>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">{product.slug}</p>
                  </td>
                  <td className="px-5 py-4 text-slate-600 text-xs">
                    {(product as any).categories?.name || '—'}
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-bold" style={{ color: '#2563EB' }}>{formatPrice(product.price)}</p>
                    {product.compare_at_price && (
                      <p className="text-xs text-slate-400 line-through">{formatPrice(product.compare_at_price)}</p>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <span className="font-bold"
                      style={{
                        color: product.stock === 0 ? '#EF4444' :
                          product.stock < 5 ? '#D97706' : '#16A34A'
                      }}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold"
                      style={{
                        background: product.status === 'active' ? '#DCFCE7' :
                          product.status === 'draft' ? '#F1F5F9' : '#FEE2E2',
                        color: product.status === 'active' ? '#166534' :
                          product.status === 'draft' ? '#475569' : '#991B1B',
                      }}>
                      {product.status === 'active' ? '● Active' :
                       product.status === 'draft' ? '● Draft' : '● Hết hàng'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    {product.badge_text && (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold"
                        style={{ background: '#DBEAFE', color: '#1E40AF' }}>
                        {product.badge_text}
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <Link href={`/admin/products/${product.id}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold hover:underline"
                      style={{ color: '#2563EB' }}>
                      <Edit size={13} /> Sửa
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {(!products || products.length === 0) && (
            <div className="text-center py-16">
              <div className="text-4xl mb-3">📦</div>
              <p className="text-slate-400 mb-4">Chưa có sản phẩm nào</p>
              <Link href="/admin/products/new"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white"
                style={{ background: '#2563EB' }}>
                <Plus size={16} /> Thêm sản phẩm đầu tiên
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}