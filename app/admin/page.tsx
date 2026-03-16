import { createClient } from '@/lib/supabase/server'
import { formatPrice } from '@/lib/utils'
import Link from 'next/link'
import {
  TrendingUp, ShoppingBag, Clock,
  CheckCircle2, Users, Package, ArrowRight
} from 'lucide-react'

export const metadata = { title: 'Dashboard | Admin' }

export default async function AdminDashboard() {
  const supabase = await createClient()

  const [
    { data: orders },
    { data: profiles },
    { data: products },
  ] = await Promise.all([
    supabase.from('orders').select('id, order_code, total, order_status, payment_status, customer_email, customer_name, created_at').order('created_at', { ascending: false }),
    supabase.from('profiles').select('id', { count: 'exact' }).eq('role', 'customer'),
    supabase.from('products').select('id, name, price, status').eq('status', 'active'),
  ])

  const totalRevenue = orders?.filter(o => o.order_status === 'completed').reduce((s, o) => s + o.total, 0) ?? 0
  const totalOrders = orders?.length ?? 0
  const pendingOrders = orders?.filter(o => o.order_status === 'pending').length ?? 0
  const completedOrders = orders?.filter(o => o.order_status === 'completed').length ?? 0
  const totalCustomers = profiles?.length ?? 0

  const stats = [
    { label: 'Tổng Doanh Thu', value: formatPrice(totalRevenue), icon: TrendingUp, color: '#2563EB', bg: '#EFF6FF' },
    { label: 'Tổng Đơn Hàng', value: totalOrders, icon: ShoppingBag, color: '#7C3AED', bg: '#F5F3FF' },
    { label: 'Chờ Xử Lý', value: pendingOrders, icon: Clock, color: '#D97706', bg: '#FFFBEB' },
    { label: 'Hoàn Thành', value: completedOrders, icon: CheckCircle2, color: '#16A34A', bg: '#F0FDF4' },
    { label: 'Khách Hàng', value: totalCustomers, icon: Users, color: '#0891B2', bg: '#ECFEFF' },
    { label: 'Sản Phẩm Active', value: products?.length ?? 0, icon: Package, color: '#EA580C', bg: '#FFF7ED' },
  ]

  const recentOrders = orders?.slice(0, 8) ?? []

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-black text-slate-900" style={{ fontFamily: 'Sora, sans-serif' }}>
          Dashboard
        </h1>
        <p className="text-slate-500 text-sm mt-1">Tổng quan hoạt động App Xanh</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {stats.map(stat => (
          <div key={stat.label} className="bg-white rounded-2xl border border-slate-200 p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  {stat.label}
                </p>
                <p className="text-2xl font-black text-slate-900">{stat.value}</p>
              </div>
              <div className="p-2.5 rounded-xl" style={{ background: stat.bg }}>
                <stat.icon size={20} style={{ color: stat.color }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent orders */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="font-bold text-slate-900">Đơn Hàng Gần Đây</h2>
          <Link href="/admin/orders"
            className="text-sm font-semibold flex items-center gap-1 hover:gap-2 transition-all"
            style={{ color: '#2563EB' }}>
            Xem tất cả <ArrowRight size={14} />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: '#F8FAFC' }}>
                {['Mã Đơn', 'Khách Hàng', 'Tổng Tiền', 'Đơn Hàng', 'Thanh Toán', 'Ngày Tạo', ''].map(h => (
                  <th key={h} className="text-left px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentOrders.map(order => (
                <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-4 font-mono font-bold text-xs" style={{ color: '#2563EB' }}>
                    #{order.order_code}
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-medium text-slate-900 text-xs">{order.customer_name || '—'}</p>
                    <p className="text-xs text-slate-400">{order.customer_email}</p>
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
                        background: order.payment_status === 'paid' ? '#DCFCE7' : '#FEF9C3',
                        color: order.payment_status === 'paid' ? '#166534' : '#854D0E',
                      }}>
                      {order.payment_status === 'paid' ? 'Đã thanh toán' : 'Chờ thanh toán'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-xs text-slate-400 whitespace-nowrap">
                    {new Date(order.created_at).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-5 py-4">
                    <Link href={`/admin/orders/${order.id}`}
                      className="text-xs font-semibold hover:underline"
                      style={{ color: '#2563EB' }}>
                      Chi tiết →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {recentOrders.length === 0 && (
            <div className="text-center py-16">
              <ShoppingBag size={36} className="mx-auto mb-3 text-slate-300" />
              <p className="text-slate-400">Chưa có đơn hàng nào</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}