import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { formatPrice } from '@/lib/utils'
import Link from 'next/link'
import { ArrowLeft, Package, CheckCircle2, Clock, XCircle } from 'lucide-react'
import { OrderDeliverySection } from '@/components/account/OrderDeliverySection'

interface Props { params: Promise<{ orderCode: string }> }

export default async function OrderDetailPage({ params }: Props) {
  const { orderCode } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: order } = await supabase
    .from('orders')
    .select(`*, order_items(*), order_deliveries(*)`)
    .eq('order_code', orderCode)
    .eq('user_id', user!.id)
    .single()

  if (!order) notFound()

  const hasDelivery = order.order_deliveries &&
    order.order_deliveries.length > 0 &&
    order.order_deliveries.some((d: any) =>
      d.visible_to_customer && (d.account_email || d.account_password || d.delivery_content_html)
    )

  const statusConfig = {
    pending: { icon: <Clock size={18} />, label: 'Chờ xử lý', bg: '#FEF9C3', color: '#854D0E' },
    processing: { icon: <Clock size={18} />, label: 'Đang xử lý', bg: '#DBEAFE', color: '#1E40AF' },
    completed: { icon: <CheckCircle2 size={18} />, label: 'Hoàn thành', bg: '#DCFCE7', color: '#166534' },
    cancelled: { icon: <XCircle size={18} />, label: 'Đã hủy', bg: '#FEE2E2', color: '#991B1B' },
  }
  const sc = statusConfig[order.order_status as keyof typeof statusConfig] ?? statusConfig.pending

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/account/orders"
          className="p-2 rounded-xl hover:bg-slate-100 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <p className="text-sm text-slate-500">Chi tiết đơn hàng</p>
          <h1 className="text-2xl font-black text-slate-900 font-mono">
            #{order.order_code}
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Left: main content */}
        <div className="md:col-span-2 space-y-5">

          {/* Status */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <Package size={18} style={{ color: '#2563EB' }} />
                <span className="font-bold text-slate-900">Trạng thái đơn hàng</span>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold"
                style={{ background: sc.bg, color: sc.color }}>
                {sc.icon} {sc.label}
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-2">
              Đặt lúc: {new Date(order.created_at).toLocaleDateString('vi-VN', {
                day: '2-digit', month: '2-digit', year: 'numeric',
                hour: '2-digit', minute: '2-digit'
              })}
            </p>
            {order.note && (
              <div className="mt-3 p-3 rounded-xl text-sm text-slate-600"
                style={{ background: '#F8FAFC' }}>
                <strong>Ghi chú:</strong> {order.note}
              </div>
            )}
          </div>

          {/* Products */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h2 className="font-bold text-slate-900 mb-4">Sản Phẩm Đã Mua</h2>
            <div className="space-y-3">
              {order.order_items?.map((item: any) => (
                <div key={item.id} className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-100">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #EFF6FF, #E0F2FE)' }}>
                    🤖
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 text-sm leading-snug">
                      {item.product_name}
                    </p>
                    {item.variant_name && (
                      <p className="text-xs text-slate-400 mt-0.5">{item.variant_name}</p>
                    )}
                    {item.upgrade_email && (
                      <p className="text-xs mt-0.5 font-mono" style={{ color: '#2563EB' }}>
                        📧 {item.upgrade_email}
                      </p>
                    )}
                    <p className="text-xs text-slate-400 mt-1">
                      x{item.quantity} × {formatPrice(item.unit_price)}
                    </p>
                  </div>
                  <p className="font-bold text-slate-900 text-sm flex-shrink-0">
                    {formatPrice(item.total_price)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery info — THE CORE */}
          {hasDelivery ? (
            <OrderDeliverySection
              deliveries={order.order_deliveries.filter((d: any) => d.visible_to_customer)}
              orderItems={order.order_items}
            />
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <div className="flex items-center gap-2 mb-3">
                <Package size={18} style={{ color: '#94A3B8' }} />
                <h2 className="font-bold text-slate-900">Thông Tin Tài Khoản</h2>
              </div>
              {order.payment_status === 'pending' ? (
                <div className="rounded-xl p-4 border" style={{ background: '#FEF9C3', borderColor: '#FDE68A' }}>
                  <p className="text-sm font-semibold mb-1" style={{ color: '#854D0E' }}>
                    ⏳ Chờ xác nhận thanh toán
                  </p>
                  <p className="text-sm" style={{ color: '#92400E' }}>
                    Vui lòng hoàn tất thanh toán để nhận thông tin tài khoản.
                  </p>
                  <Link href={`/payment/${order.order_code}?amount=${order.total}`}
                    className="inline-flex items-center gap-1.5 mt-3 text-sm font-bold px-4 py-2 rounded-xl text-white"
                    style={{ background: '#D97706' }}>
                    Thanh toán ngay →
                  </Link>
                </div>
              ) : (
                <div className="rounded-xl p-4 border" style={{ background: '#EFF6FF', borderColor: '#BFDBFE' }}>
                  <p className="text-sm font-semibold mb-1" style={{ color: '#1E40AF' }}>
                    ⚙️ Đang xử lý
                  </p>
                  <p className="text-sm" style={{ color: '#1D4ED8' }}>
                    Admin đang chuẩn bị tài khoản cho bạn. Thường trong 5-15 phút.
                    Vui lòng refresh trang sau ít phút.
                  </p>
                  <a href="https://zalo.me/0888993991"
                    className="inline-flex items-center gap-1.5 mt-3 text-sm font-semibold"
                    style={{ color: '#2563EB' }}>
                    💬 Liên hệ Zalo để được hỗ trợ →
                  </a>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: summary */}
        <div>
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sticky top-24 space-y-4">
            <h2 className="font-bold text-slate-900">Tóm Tắt</h2>

            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Khách hàng</span>
                <span className="font-semibold text-slate-900">{order.customer_name || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Email</span>
                <span className="font-semibold text-slate-900 text-xs truncate ml-2">{order.customer_email}</span>
              </div>
              {order.customer_phone && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Zalo</span>
                  <span className="font-semibold text-slate-900">{order.customer_phone}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-500">Thanh toán</span>
                <span className="font-semibold text-sm px-2 py-0.5 rounded-full"
                  style={{
                    background: order.payment_status === 'paid' ? '#DCFCE7' : '#FEF9C3',
                    color: order.payment_status === 'paid' ? '#166534' : '#854D0E',
                  }}>
                  {order.payment_status === 'paid' ? 'Đã thanh toán' : 'Chờ thanh toán'}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-100 flex justify-between font-black text-base">
                <span>Tổng tiền</span>
                <span style={{ color: '#2563EB' }}>{formatPrice(order.total)}</span>
              </div>
            </div>

            <Link href="/shop"
              className="block w-full text-center py-2.5 rounded-xl text-sm font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all">
              Tiếp tục mua sắm
            </Link>

            <a href="https://zalo.me/0888993991"
              className="block w-full text-center py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={{ background: '#EFF6FF', color: '#2563EB' }}>
              💬 Hỗ trợ Zalo
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}