'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useParams } from 'next/navigation'
import { formatPrice, formatDate } from '@/lib/utils'
import { ArrowLeft, Save, Plus, Trash2, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

export default function AdminOrderDetailPage() {
  const params = useParams()
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [orderStatus, setOrderStatus] = useState('')
  const [paymentStatus, setPaymentStatus] = useState('')
  const [adminNote, setAdminNote] = useState('')
  const [deliveries, setDeliveries] = useState<any[]>([])
  const [showPass, setShowPass] = useState<Record<number, boolean>>({})

  useEffect(() => {
    const supabase = createClient()
    supabase.from('orders')
      .select(`*, order_items(*), order_deliveries(*)`)
      .eq('id', params.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setOrder(data)
          setOrderStatus(data.order_status)
          setPaymentStatus(data.payment_status)
          setAdminNote(data.admin_note ?? '')
          setDeliveries(
            data.order_deliveries?.length > 0
              ? data.order_deliveries
              : [emptyDelivery()]
          )
        }
        setLoading(false)
      })
  }, [params.id])

  const emptyDelivery = () => ({
    id: null,
    delivery_title: '',
    account_email: '',
    account_password: '',
    account_extra: '',
    delivery_content_html: '',
    admin_note: '',
    visible_to_customer: true,
  })

  const updateDelivery = (index: number, field: string, value: any) => {
    setDeliveries(prev => prev.map((d, i) => i === index ? { ...d, [field]: value } : d))
  }

  const addDelivery = () => setDeliveries(prev => [...prev, emptyDelivery()])

  const removeDelivery = async (index: number) => {
    const d = deliveries[index]
    if (d.id) {
      const supabase = createClient()
      await supabase.from('order_deliveries').delete().eq('id', d.id)
      toast.success('Đã xóa thông tin giao hàng')
    }
    setDeliveries(prev => prev.filter((_, i) => i !== index))
  }

  const handleSave = async () => {
    setSaving(true)
    const supabase = createClient()
    try {
      // Update order status
      await supabase.from('orders').update({
        order_status: orderStatus,
        payment_status: paymentStatus,
        admin_note: adminNote,
      }).eq('id', order.id)

      // Upsert deliveries
      for (const d of deliveries) {
        const deliveryData = {
          order_id: order.id,
          delivery_title: d.delivery_title || null,
          account_email: d.account_email || null,
          account_password: d.account_password || null,
          account_extra: d.account_extra || null,
          delivery_content_html: d.delivery_content_html || null,
          admin_note: d.admin_note || null,
          visible_to_customer: d.visible_to_customer,
          delivered_at: (d.account_email || d.account_password || d.delivery_content_html)
            ? new Date().toISOString() : null,
        }
        if (d.id) {
          await supabase.from('order_deliveries').update(deliveryData).eq('id', d.id)
        } else if (d.account_email || d.account_password || d.delivery_content_html || d.delivery_title) {
          const { data } = await supabase.from('order_deliveries').insert(deliveryData).select().single()
          if (data) {
            setDeliveries(prev => prev.map(item =>
              item === d ? { ...item, id: data.id } : item
            ))
          }
        }
      }

      toast.success('Đã lưu thành công! Khách có thể xem ngay.')
    } catch (err: any) {
      toast.error('Lỗi khi lưu', { description: err.message })
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!order) return (
    <div className="text-center py-20 text-slate-400">Không tìm thấy đơn hàng</div>
  )

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-7">
        <div className="flex items-center gap-3">
          <Link href="/admin/orders"
            className="p-2 rounded-xl hover:bg-slate-200 transition-colors">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-xl font-black text-slate-900 font-mono">
              #{order.order_code}
            </h1>
            <p className="text-sm text-slate-400">{formatDate(order.created_at)}</p>
          </div>
        </div>
        <button onClick={handleSave} disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white disabled:opacity-60"
          style={{ background: 'linear-gradient(135deg, #2563EB, #1d4ed8)' }}>
          {saving ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Đang lưu...
            </span>
          ) : <><Save size={16} /> Lưu & Giao Cho Khách</>}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left: Status + Delivery */}
        <div className="lg:col-span-2 space-y-5">

          {/* Status */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="font-bold text-slate-900 mb-4">Cập Nhật Trạng Thái</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Trạng Thái Đơn
                </label>
                <select value={orderStatus} onChange={e => setOrderStatus(e.target.value)} className="input text-sm">
                  <option value="pending">⏳ Chờ xử lý</option>
                  <option value="processing">⚙️ Đang xử lý</option>
                  <option value="completed">✅ Hoàn thành</option>
                  <option value="cancelled">❌ Đã hủy</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Thanh Toán
                </label>
                <select value={paymentStatus} onChange={e => setPaymentStatus(e.target.value)} className="input text-sm">
                  <option value="pending">⏳ Chờ thanh toán</option>
                  <option value="paid">✅ Đã thanh toán</option>
                  <option value="failed">❌ Thất bại</option>
                  <option value="refunded">↩️ Hoàn tiền</option>
                </select>
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Ghi Chú Admin (khách không thấy)
              </label>
              <textarea value={adminNote} onChange={e => setAdminNote(e.target.value)}
                rows={2} className="input resize-none text-sm"
                placeholder="Ghi chú nội bộ..." />
            </div>
          </div>

          {/* Delivery info — CORE FEATURE */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h2 className="font-bold text-slate-900">📦 Thông Tin Giao Tài Khoản</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Nhập xong bấm "Lưu & Giao Cho Khách" — khách vào Đơn Hàng sẽ thấy ngay
                </p>
              </div>
              <button onClick={addDelivery}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border-2 transition-all"
                style={{ borderColor: '#2563EB', color: '#2563EB' }}>
                <Plus size={14} /> Thêm
              </button>
            </div>

            <div className="space-y-6 mt-5">
              {deliveries.map((d, i) => (
                <div key={i} className="border-2 rounded-2xl p-5 space-y-4 relative"
                  style={{ borderColor: d.account_email || d.delivery_content_html ? '#2563EB' : '#E2E8F0' }}>

                  {/* Index label */}
                  <div className="absolute -top-3 left-4 text-xs font-bold px-2.5 py-1 rounded-full border"
                    style={{
                      background: 'white',
                      borderColor: d.account_email || d.delivery_content_html ? '#2563EB' : '#E2E8F0',
                      color: d.account_email || d.delivery_content_html ? '#2563EB' : '#64748B',
                    }}>
                    Tài khoản {i + 1}
                  </div>

                  {deliveries.length > 1 && (
                    <button onClick={() => removeDelivery(i)}
                      className="absolute top-3 right-3 p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 size={14} />
                    </button>
                  )}

                  {/* Title */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      Tiêu đề
                    </label>
                    <input value={d.delivery_title}
                      onChange={e => updateDelivery(i, 'delivery_title', e.target.value)}
                      placeholder="VD: Tài khoản ChatGPT Plus của bạn"
                      className="input text-sm" />
                  </div>

                  {/* Email + Password */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                        Email / Tài khoản
                      </label>
                      <input type="text" value={d.account_email}
                        onChange={e => updateDelivery(i, 'account_email', e.target.value)}
                        placeholder="email@outlook.com"
                        className="input text-sm font-mono" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                        Mật khẩu
                      </label>
                      <div className="relative">
                        <input
                          type={showPass[i] ? 'text' : 'password'}
                          value={d.account_password}
                          onChange={e => updateDelivery(i, 'account_password', e.target.value)}
                          placeholder="••••••••"
                          className="input text-sm font-mono pr-10" />
                        <button type="button"
                          onClick={() => setShowPass(p => ({ ...p, [i]: !p[i] }))}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                          {showPass[i] ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Extra info */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      Thông tin thêm (link kích hoạt, serial, passMail...)
                    </label>
                    <textarea value={d.account_extra}
                      onChange={e => updateDelivery(i, 'account_extra', e.target.value)}
                      rows={2} className="input resize-none text-sm font-mono"
                      placeholder="VD: passMail: abc123 | Link: https://..." />
                  </div>

                  {/* HTML instructions */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      Hướng dẫn sử dụng HTML (hiển thị cho khách)
                    </label>
                    <textarea value={d.delivery_content_html}
                      onChange={e => updateDelivery(i, 'delivery_content_html', e.target.value)}
                      rows={5} className="input resize-none text-xs font-mono leading-relaxed"
                      placeholder={'<h3>Hướng dẫn đăng nhập</h3>\n<ol>\n  <li>Bước 1: Truy cập chat.openai.com</li>\n  <li>Bước 2: Nhập email và mật khẩu trên</li>\n</ol>'} />
                    {d.delivery_content_html && (
                      <details className="mt-2">
                        <summary className="text-xs font-semibold cursor-pointer" style={{ color: '#2563EB' }}>
                          👁️ Preview
                        </summary>
                        <div className="mt-2 p-3 rounded-xl border text-sm product-content"
                          style={{ background: '#F8FAFC' }}
                          dangerouslySetInnerHTML={{ __html: d.delivery_content_html }} />
                      </details>
                    )}
                  </div>

                  {/* Visible toggle */}
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input type="checkbox" checked={d.visible_to_customer}
                      onChange={e => updateDelivery(i, 'visible_to_customer', e.target.checked)}
                      className="w-4 h-4 rounded" style={{ accentColor: '#2563EB' }} />
                    <span className="text-sm font-medium text-slate-700">Hiển thị cho khách</span>
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Order summary */}
        <div className="space-y-5">

          {/* Customer info */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h2 className="font-bold text-slate-900 mb-4">Thông Tin Khách</h2>
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Tên</span>
                <span className="font-semibold text-slate-900">{order.customer_name || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Email</span>
                <span className="font-semibold text-slate-900 text-xs">{order.customer_email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Zalo</span>
                <span className="font-semibold text-slate-900">{order.customer_phone || '—'}</span>
              </div>
              {order.note && (
                <div className="pt-2 border-t border-slate-100">
                  <p className="text-xs text-slate-500 mb-1">Ghi chú khách:</p>
                  <p className="text-xs text-slate-700">{order.note}</p>
                </div>
              )}
            </div>
          </div>

          {/* Products */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h2 className="font-bold text-slate-900 mb-4">Sản Phẩm</h2>
            <div className="space-y-3">
              {order.order_items?.map((item: any) => (
                <div key={item.id} className="p-3 rounded-xl border border-slate-100">
                  <p className="font-semibold text-slate-900 text-xs leading-snug">{item.product_name}</p>
                  {item.variant_name && <p className="text-xs text-slate-400 mt-0.5">{item.variant_name}</p>}
                  {item.upgrade_email && (
                    <p className="text-xs mt-0.5" style={{ color: '#2563EB' }}>📧 {item.upgrade_email}</p>
                  )}
                  <p className="text-xs text-slate-500 mt-1">
                    x{item.quantity} × {formatPrice(item.unit_price)}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between font-black text-slate-900">
              <span>Tổng</span>
              <span style={{ color: '#2563EB' }}>{formatPrice(order.total)}</span>
            </div>
          </div>

          {/* Quick actions */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h2 className="font-bold text-slate-900 mb-3">Thao Tác Nhanh</h2>
            <div className="space-y-2">
              <button
                onClick={() => {
                  setOrderStatus('completed')
                  setPaymentStatus('paid')
                  toast.info('Đã set hoàn thành — nhớ bấm Lưu!')
                }}
                className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all text-left px-4"
                style={{ background: '#DCFCE7', color: '#166534' }}>
                ✅ Đánh dấu Hoàn thành + Đã thanh toán
              </button>
              <button
                onClick={() => {
                  setOrderStatus('cancelled')
                  toast.info('Đã set hủy — nhớ bấm Lưu!')
                }}
                className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all text-left px-4"
                style={{ background: '#FEE2E2', color: '#991B1B' }}>
                ❌ Hủy đơn hàng
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}