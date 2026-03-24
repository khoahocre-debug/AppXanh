import { createClient } from '@/lib/supabase/server'
import { formatPrice } from '@/lib/utils'
import Link from 'next/link'
import { Package, ShoppingBag, ChevronRight, Clock, CheckCircle2, XCircle } from 'lucide-react'

export const metadata = { title: 'Đơn Hàng Của Tôi' }

export default async function OrdersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: orders } = await supabase
    .from('orders')
    .select(`*, order_items(*)`)
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="mb-8">
        <p className="text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: '#2563EB' }}>
          Tài Khoản
        </p>
        <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3"
          style={{ fontFamily: 'Sora, sans-serif' }}>
          <Package size={28} style={{ color: '#2563EB' }} />
          Lịch Sử Mua Hàng
        </h1>
      </div>

      {!orders || orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center">
          <ShoppingBag size={48} className="mx-auto mb-4" style={{ color: '#CBD5E1' }} />
          <p className="text-lg font-bold text-slate-700 mb-1">Bạn chưa có đơn hàng nào</p>
          <p className="text-slate-400 text-sm mb-6">Khám phá các sản phẩm premium tại XanhSoft!</p>
          <Link href="/shop" className="btn-primary">Xem Sản Phẩm</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => {
            const statusConfig = {
              pending: { icon: <Clock size={16} />, label: 'Chờ xử lý', bg: '#FEF9C3', color: '#854D0E' },
              processing: { icon: <Clock size={16} />, label: 'Đang xử lý', bg: '#DBEAFE', color: '#1E40AF' },
              completed: { icon: <CheckCircle2 size={16} />, label: 'Hoàn thành', bg: '#DCFCE7', color: '#166534' },
              cancelled: { icon: <XCircle size={16} />, label: 'Đã hủy', bg: '#FEE2E2', color: '#991B1B' },
            }
            const payConfig = {
              pending: { label: 'Chờ thanh toán', bg: '#FEF9C3', color: '#854D0E' },
              paid: { label: 'Đã thanh toán', bg: '#DCFCE7', color: '#166534' },
              failed: { label: 'Thất bại', bg: '#FEE2E2', color: '#991B1B' },
              refunded: { label: 'Hoàn tiền', bg: '#F3E8FF', color: '#7E22CE' },
            }
            const sc = statusConfig[order.order_status as keyof typeof statusConfig] ?? statusConfig.pending
            const pc = payConfig[order.payment_status as keyof typeof payConfig] ?? payConfig.pending

            return (
              <div key={order.id} className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md transition-all">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-2">

                    {/* Order code + badges */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-black text-slate-900 font-mono">
                        #{order.order_code}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
                        style={{ background: sc.bg, color: sc.color }}>
                        {sc.icon} {sc.label}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold"
                        style={{ background: pc.bg, color: pc.color }}>
                        {pc.label}
                      </span>
                    </div>

                    {/* Date + total */}
                    <p className="text-sm text-slate-500">
                      {new Date(order.created_at).toLocaleDateString('vi-VN', {
                        day: '2-digit', month: '2-digit', year: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      })}
                      {' · '}
                      <span className="font-bold" style={{ color: '#2563EB' }}>
                        {formatPrice(order.total)}
                      </span>
                    </p>

                    {/* Product names */}
                    <div className="flex flex-wrap gap-1.5">
                      {(order as any).order_items?.slice(0, 3).map((item: any) => (
                        <span key={item.id}
                          className="text-xs px-2.5 py-1 rounded-lg font-medium"
                          style={{ background: '#F1F5F9', color: '#475569' }}>
                          {item.product_name}
                        </span>
                      ))}
                      {((order as any).order_items?.length ?? 0) > 3 && (
                        <span className="text-xs text-slate-400">
                          +{(order as any).order_items.length - 3} khác
                        </span>
                      )}
                    </div>

                    {/* Pending payment warning */}
                    {order.payment_status === 'pending' && order.order_status !== 'cancelled' && (
                      <Link href={`/payment/${order.order_code}?amount=${order.total}`}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl transition-all"
                        style={{ background: '#FEF9C3', color: '#854D0E' }}>
                        ⚡ Chưa thanh toán — Thanh toán ngay
                      </Link>
                    )}
                  </div>

                  <Link href={`/account/orders/${order.order_code}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all flex-shrink-0"
                    style={{ borderColor: '#2563EB', color: '#2563EB' }}>
                    Xem Chi Tiết <ChevronRight size={15} />
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
