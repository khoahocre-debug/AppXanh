import { createClient } from '@/lib/supabase/server'
import { formatPrice } from '@/lib/utils'
import Link from 'next/link'
import {
  TrendingUp, ShoppingBag, Clock,
  CheckCircle2, Users, Package, ArrowRight,
  AlertTriangle, Zap, XCircle,
} from 'lucide-react'

export const metadata = { title: 'Dashboard | XanhSoft Admin' }

export default async function AdminDashboard() {
  const supabase = await createClient()

  const [
    { data: orders },
    { data: profiles },
    { data: products },
    { data: poolData },
  ] = await Promise.all([
    supabase.from('orders')
      .select('id, order_code, total, order_status, payment_status, customer_email, customer_name, created_at')
      .order('created_at', { ascending: false }),
    supabase.from('profiles').select('id').eq('role', 'customer'),
    supabase.from('products').select('id, name, price, status').eq('status', 'active'),
    supabase.from('product_ready_accounts')
      .select('product_id, status, products(id, name, slug)')
      .eq('status', 'available'),
  ])

  const totalRevenue = orders?.filter(o => o.order_status === 'completed').reduce((s, o) => s + (o.total ?? 0), 0) ?? 0
  const totalOrders = orders?.length ?? 0
  const pendingOrders = orders?.filter(o => o.order_status === 'pending') ?? []
  const processingOrders = orders?.filter(o => o.order_status === 'processing') ?? []
  const completedOrders = orders?.filter(o => o.order_status === 'completed').length ?? 0
  const totalCustomers = profiles?.length ?? 0

  // Đơn chờ xử lý (pending + processing)
  const needActionCount = pendingOrders.length + processingOrders.length

  // Pool sắp hết — nhóm theo product, tìm những product có < 3 tài khoản còn
  const poolByProduct: Record<string, { name: string; slug: string; count: number }> = {}
  ;(poolData ?? []).forEach((row: any) => {
    const pid = row.product_id
    if (!poolByProduct[pid]) {
      poolByProduct[pid] = {
        name: row.products?.name ?? pid,
        slug: row.products?.slug ?? '',
        count: 0,
      }
    }
    poolByProduct[pid].count++
  })
  const lowPoolProducts = Object.entries(poolByProduct)
    .filter(([, v]) => v.count < 3)
    .sort((a, b) => a[1].count - b[1].count)
    .slice(0, 5)

  // Đơn lỗi giao — paid + completed nhưng không có delivery (heuristic)
  const stuckOrders = orders?.filter(o =>
    o.payment_status === 'paid' && o.order_status === 'pending'
  ) ?? []

  const stats = [
    {
      label: 'Tổng Doanh Thu',
      value: formatPrice(totalRevenue),
      icon: TrendingUp,
      color: '#2563EB', bg: '#EFF6FF',
      href: '/admin/orders?status=completed',
    },
    {
      label: 'Tổng Đơn Hàng',
      value: totalOrders,
      icon: ShoppingBag,
      color: '#7C3AED', bg: '#F5F3FF',
      href: '/admin/orders',
    },
    {
      label: 'Cần Xử Lý',
      value: needActionCount,
      icon: Clock,
      color: needActionCount > 0 ? '#D97706' : '#16A34A',
      bg: needActionCount > 0 ? '#FFFBEB' : '#F0FDF4',
      href: '/admin/orders?status=pending',
      alert: needActionCount > 0,
    },
    {
      label: 'Hoàn Thành',
      value: completedOrders,
      icon: CheckCircle2,
      color: '#16A34A', bg: '#F0FDF4',
      href: '/admin/orders?status=completed',
    },
    {
      label: 'Khách Hàng',
      value: totalCustomers,
      icon: Users,
      color: '#0891B2', bg: '#ECFEFF',
      href: '/admin/users',
    },
    {
      label: 'Sản Phẩm Active',
      value: products?.length ?? 0,
      icon: Package,
      color: '#EA580C', bg: '#FFF7ED',
      href: '/admin/products',
    },
  ]

  const recentOrders = orders?.slice(0, 8) ?? []

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-black text-slate-900" style={{ fontFamily: 'Sora, sans-serif' }}>
          Dashboard
        </h1>
        <p className="text-slate-500 text-sm mt-1">Tổng quan hoạt động XanhSoft</p>
      </div>

      {/* Alert KPIs — chỉ hiện khi có vấn đề */}
      {(needActionCount > 0 || stuckOrders.length > 0 || lowPoolProducts.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">

          {needActionCount > 0 && (
            <Link href="/admin/orders?status=pending"
              className="flex items-start gap-3 p-4 rounded-2xl border-2 transition-all hover:-translate-y-0.5"
              style={{ background: '#FFFBEB', borderColor: '#FDE68A' }}>
              <div className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: '#FEF3C7' }}>
                <Clock size={18} style={{ color: '#D97706' }} />
              </div>
              <div>
                <p className="font-bold text-sm" style={{ color: '#92400E' }}>
                  {needActionCount} đơn chờ xử lý
                </p>
                <p className="text-xs mt-0.5" style={{ color: '#D97706' }}>
                  {pendingOrders.length} pending · {processingOrders.length} processing
                </p>
                <p className="text-xs font-semibold mt-1.5" style={{ color: '#D97706' }}>
                  Xem ngay →
                </p>
              </div>
            </Link>
          )}

          {stuckOrders.length > 0 && (
            <Link href="/admin/orders"
              className="flex items-start gap-3 p-4 rounded-2xl border-2 transition-all hover:-translate-y-0.5"
              style={{ background: '#FFF1F2', borderColor: '#FECDD3' }}>
              <div className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: '#FFE4E6' }}>
                <XCircle size={18} style={{ color: '#E11D48' }} />
              </div>
              <div>
                <p className="font-bold text-sm" style={{ color: '#9F1239' }}>
                  {stuckOrders.length} đơn đã thanh toán chưa giao
                </p>
                <p className="text-xs mt-0.5" style={{ color: '#E11D48' }}>
                  paid nhưng còn pending — cần xử lý
                </p>
                <p className="text-xs font-semibold mt-1.5" style={{ color: '#E11D48' }}>
                  Kiểm tra ngay →
                </p>
              </div>
            </Link>
          )}

          {lowPoolProducts.length > 0 && (
            <div className="flex items-start gap-3 p-4 rounded-2xl border-2"
              style={{ background: '#F0F9FF', borderColor: '#BAE6FD' }}>
              <div className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: '#E0F2FE' }}>
                <AlertTriangle size={18} style={{ color: '#0284C7' }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm mb-1" style={{ color: '#0369A1' }}>
                  {lowPoolProducts.length} sản phẩm pool sắp hết
                </p>
                {lowPoolProducts.map(([pid, v]) => (
                  <div key={pid} className="flex items-center justify-between gap-2">
                    <Link href={`/admin/products?q=${encodeURIComponent(v.name)}`}
                      className="text-xs truncate hover:underline" style={{ color: '#0284C7' }}>
                      {v.name}
                    </Link>
                    <span className="text-xs font-bold flex-shrink-0 px-1.5 py-0.5 rounded-full"
                      style={{ background: v.count === 0 ? '#FEE2E2' : '#FEF9C3', color: v.count === 0 ? '#991B1B' : '#854D0E' }}>
                      {v.count === 0 ? 'Hết' : `còn ${v.count}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {stats.map(stat => (
          <Link key={stat.label} href={stat.href}
            className="bg-white rounded-2xl border border-slate-200 p-5 transition-all hover:-translate-y-0.5 hover:shadow-md hover:border-blue-100 group"
            style={stat.alert ? { borderColor: '#FDE68A' } : {}}>
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
            <p className="text-xs mt-3 font-semibold group-hover:underline" style={{ color: stat.color }}>
              Xem chi tiết →
            </p>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {[
          { label: 'Đơn chờ xử lý', href: '/admin/orders?status=pending', icon: Clock, color: '#D97706', bg: '#FFFBEB', count: pendingOrders.length },
          { label: 'Đơn đang xử lý', href: '/admin/orders?status=processing', icon: Zap, color: '#2563EB', bg: '#EFF6FF', count: processingOrders.length },
          { label: 'Đã thanh toán', href: '/admin/orders', icon: CheckCircle2, color: '#16A34A', bg: '#F0FDF4', count: orders?.filter(o => o.payment_status === 'paid').length ?? 0 },
          { label: 'Cần giao gấp', href: '/admin/orders', icon: AlertTriangle, color: '#E11D48', bg: '#FFF1F2', count: stuckOrders.length },
        ].map(item => (
          <Link key={item.label} href={item.href}
            className="flex items-center gap-3 p-3.5 rounded-2xl border transition-all hover:-translate-y-0.5"
            style={{ background: item.bg, borderColor: 'transparent' }}>
            <div className="flex-shrink-0">
              <item.icon size={18} style={{ color: item.color }} />
            </div>
            <div>
              <p className="text-xs font-semibold" style={{ color: item.color }}>{item.label}</p>
              <p className="text-lg font-black" style={{ color: item.color }}>{item.count}</p>
            </div>
          </Link>
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
                <tr key={order.id} className="hover:bg-slate-50 transition-colors"
                  style={{
                    background: order.payment_status === 'paid' && order.order_status === 'pending'
                      ? '#FFF1F2' : undefined,
                  }}>
                  <td className="px-5 py-4 font-mono font-bold text-xs" style={{ color: '#2563EB' }}>
                    #{order.order_code}
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-medium text-slate-900 text-xs">{order.customer_name || '—'}</p>
                    <p className="text-xs text-slate-400">{order.customer_email}</p>
                  </td>
                  <td className="px-5 py-4 font-bold text-slate-900">{formatPrice(order.total)}</td>
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
                      {order.order_status === 'completed' ? '✅ Hoàn thành' :
                       order.order_status === 'pending' ? '⏳ Chờ xử lý' :
                       order.order_status === 'processing' ? '⚙️ Đang xử lý' : '❌ Đã hủy'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold"
                      style={{
                        background: order.payment_status === 'paid' ? '#DCFCE7' : '#FEF9C3',
                        color: order.payment_status === 'paid' ? '#166534' : '#854D0E',
                      }}>
                      {order.payment_status === 'paid' ? '✅ Đã thanh toán' : '⏳ Chờ thanh toán'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-xs text-slate-400 whitespace-nowrap">
                    {new Date(order.created_at).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-5 py-4">
                    <Link href={`/admin/orders/${order.id}`}
                      className="text-xs font-semibold hover:underline" style={{ color: '#2563EB' }}>
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