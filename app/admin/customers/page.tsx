import { createClient } from '@/lib/supabase/server'
import { formatPrice } from '@/lib/utils'

export const metadata = { title: 'Khách Hàng | Admin' }

export default async function AdminCustomersPage() {
  const supabase = await createClient()

  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'customer')
    .order('created_at', { ascending: false })

  const { data: orders } = await supabase
    .from('orders')
    .select('user_id, total, order_status')

  // Build stats per customer
  const customerStats = profiles?.map(profile => {
    const customerOrders = orders?.filter(o => o.user_id === profile.id) ?? []
    const totalSpent = customerOrders
      .filter(o => o.order_status === 'completed')
      .reduce((sum, o) => sum + o.total, 0)
    return {
      ...profile,
      orderCount: customerOrders.length,
      totalSpent,
    }
  }) ?? []

  return (
    <div>
      <div className="mb-7">
        <h1 className="text-2xl font-black text-slate-900" style={{ fontFamily: 'Sora, sans-serif' }}>
          Quản Lý Khách Hàng
        </h1>
        <p className="text-slate-500 text-sm mt-1">{profiles?.length ?? 0} khách hàng</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: '#F8FAFC' }}>
                {['Khách Hàng', 'Email', 'Số Điện Thoại', 'Số Đơn', 'Tổng Chi Tiêu', 'Ngày Tham Gia'].map(h => (
                  <th key={h} className="text-left px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {customerStats.map(customer => (
                <tr key={customer.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg, #2563EB, #0891B2)' }}>
                        {(customer.full_name || customer.email || 'U').charAt(0).toUpperCase()}
                      </div>
                      <p className="font-semibold text-slate-900">
                        {customer.full_name || '—'}
                      </p>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-slate-600">{customer.email}</td>
                  <td className="px-5 py-4 text-slate-600">{customer.phone || '—'}</td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold"
                      style={{ background: '#DBEAFE', color: '#1E40AF' }}>
                      {customer.orderCount} đơn
                    </span>
                  </td>
                  <td className="px-5 py-4 font-bold"
                    style={{ color: customer.totalSpent > 0 ? '#2563EB' : '#94A3B8' }}>
                    {customer.totalSpent > 0 ? formatPrice(customer.totalSpent) : '—'}
                  </td>
                  <td className="px-5 py-4 text-xs text-slate-400 whitespace-nowrap">
                    {new Date(customer.created_at).toLocaleDateString('vi-VN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {customerStats.length === 0 && (
            <div className="text-center py-16">
              <div className="text-4xl mb-3">👥</div>
              <p className="text-slate-400">Chưa có khách hàng nào</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}