import { createClient } from '@/lib/supabase/server'
import { formatPrice, formatDate } from '@/lib/utils'
import Link from 'next/link'
import { Search } from 'lucide-react'

export const metadata = { title: 'Quản Lý Đơn Hàng | Admin' }

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>
}) {
  const { status, q } = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('orders')
    .select(`*, order_items(product_name)`)
    .order('created_at', { ascending: false })

  if (status && status !== 'all') query = query.eq('order_status', status)
  if (q) query = query.or(`order_code.ilike.%${q}%,customer_email.ilike.%${q}%,customer_name.ilike.%${q}%`)

  const { data: orders } = await query

  const STATUS_TABS = [
    { value: 'all', label: 'Tất cả' },
    { value: 'pending', label: 'Chờ xử lý' },
    { value: 'processing', label: 'Đang xử lý' },
    { value: 'completed', label: 'Hoàn thành' },
    { value: 'cancelled', label: 'Đã hủy' },
  ]

  const currentStatus = status ?? 'all'

  return (
    <div>
      <div className="mb-7">
        <h1 className="text-2xl font-black text-slate-900" style={{ fontFamily: 'Sora, sans-serif' }}>
          Quản Lý Đơn Hàng
        </h1>
        <p className="text-slate-500 text-sm mt-1">{orders?.length ?? 0} đơn hàng</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">

        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <form className="relative flex-1">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input name="q" defaultValue={q}
              placeholder="Tìm mã đơn, email, tên khách..."
              className="input pl-9 text-sm h-10" />
            {status && <input type="hidden" name="status" value={status} />}
          </form>

          {/* Status tabs */}
          <div className="flex gap-1 overflow-x-auto">
            {STATUS_TABS.map(tab => (
              <Link key={tab.value}
                href={`/admin/orders?status=${tab.value}${q ? `&q=${q}` : ''}`}
                className="flex-shrink-0 px-3 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap"
                style={currentStatus === tab.value
                  ? { background: '#2563EB', color: 'white' }
                  : { color: '#64748B', background: 'transparent' }
                }>
                {tab.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: '#F8FAFC' }}>
                {['Mã Đơn', 'Khách Hàng', 'Sản Phẩm', 'Tổng Tiền', 'Đơn Hàng', 'Thanh Toán', 'Ngày Tạo', ''].map(h => (
                  <th key={h} className="text-left px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders?.map(order => (
                <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-4 font-mono font-bold text-xs" style={{ color: '#2563EB' }}>
                    #{order.order_code}
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-semibold text-slate-900 text-xs">{order.customer_name || '—'}</p>
                    <p className="text-xs text-slate-400">{order.customer_email}</p>
                  </td>
                  <td className="px-5 py-4 text-xs text-slate-600 max-w-[180px] truncate">
                    {(order as any).order_items?.map((i: any) => i.product_name).join(', ') || '—'}
                  </td>
                  <td className="px-5 py-4 font-bold text-slate-900">
                    {formatPrice(order.total)}
                  </td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold"
                      style={{
                        background: order.order_status === 'completed' ? '#DCFCE7' :
                          order.order_status === 'pending' ? '#FEF9C3' :
                          order.order_status === 'processing' ? '#DBEAFE' : '#FEE2E2',
                        color: order.order_status === 'completed' ? '#166534' :
                          order.order_status === 'pending' ? '#854D0E' :
                          order.order_status === 'processing' ? '#1E40AF' : '#991B1B',
                      }}>
                      {order.order_status === 'completed' ? 'Hoàn thành' :
                       order.order_status === 'pending' ? 'Chờ xử lý' :
                       order.order_status === 'processing' ? 'Đang xử lý' : 'Đã hủy'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold"
                      style={{
                        background: order.payment_status === 'paid' ? '#DCFCE7' :
                          order.payment_status === 'refunded' ? '#F3E8FF' : '#FEF9C3',
                        color: order.payment_status === 'paid' ? '#166534' :
                          order.payment_status === 'refunded' ? '#7E22CE' : '#854D0E',
                      }}>
                      {order.payment_status === 'paid' ? 'Đã thanh toán' :
                       order.payment_status === 'refunded' ? 'Hoàn tiền' : 'Chờ thanh toán'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-xs text-slate-400 whitespace-nowrap">
                    {new Date(order.created_at).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-5 py-4">
                    <Link href={`/admin/orders/${order.id}`}
                      className="text-xs font-semibold hover:underline whitespace-nowrap"
                      style={{ color: '#2563EB' }}>
                      Chi tiết →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {(!orders || orders.length === 0) && (
            <div className="text-center py-16">
              <div className="text-4xl mb-3">📭</div>
              <p className="text-slate-400">Không có đơn hàng nào</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}