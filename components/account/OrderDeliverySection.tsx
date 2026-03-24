'use client'
import { useState } from 'react'
import { Copy, Download, CheckCircle2, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'
import type { OrderDelivery, OrderItem } from '@/types'

interface Props {
  deliveries: OrderDelivery[]
  orderItems: OrderItem[]
}

export function OrderDeliverySection({ deliveries, orderItems }: Props) {
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({})

  const togglePassword = (id: string) => {
    setShowPasswords(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const copyText = (text: string, label = 'Đã sao chép!') => {
    navigator.clipboard.writeText(text)
    toast.success(label)
  }

  const copyAll = (delivery: OrderDelivery) => {
    const parts = []
    if (delivery.delivery_title) parts.push(`=== ${delivery.delivery_title} ===`)
    if (delivery.account_email) parts.push(`Email: ${delivery.account_email}`)
    if (delivery.account_password) parts.push(`Mật khẩu: ${delivery.account_password}`)
    if (delivery.account_extra) parts.push(delivery.account_extra)
    navigator.clipboard.writeText(parts.join('\n'))
    toast.success('Đã sao chép toàn bộ thông tin!')
  }

  const downloadOrder = (delivery: OrderDelivery, orderItem?: OrderItem) => {
    const lines = []
    lines.push(`XANHSOFT — THÔNG TIN TÀI KHOẢN`)
    lines.push(`================================`)
    lines.push(`Sản phẩm: ${orderItem?.product_name || delivery.delivery_title || 'N/A'}`)
    lines.push(``)
    if (delivery.delivery_title) lines.push(`[${delivery.delivery_title}]`)
    if (delivery.account_email) lines.push(`Email: ${delivery.account_email}`)
    if (delivery.account_password) lines.push(`Mật khẩu: ${delivery.account_password}`)
    if (delivery.account_extra) lines.push(`\nThông tin thêm:\n${delivery.account_extra}`)
    lines.push(``)
    lines.push(`================================`)
    lines.push(`Lưu ý: Không chia sẻ thông tin này cho người khác!`)
    lines.push(`Hỗ trợ: Zalo 0888993991`)

    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `appxanh-order-${delivery.order_id.slice(0, 8)}.txt`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Đã tải file thông tin!')
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <CheckCircle2 size={20} style={{ color: '#16A34A' }} />
        <h2 className="font-bold text-slate-900">Thông Tin Tài Khoản</h2>
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold"
          style={{ background: '#DCFCE7', color: '#166534' }}>
          ✓ Đã giao
        </span>
      </div>

      {deliveries.map(delivery => {
        const relatedItem = delivery.order_item_id
          ? orderItems.find(i => i.id === delivery.order_item_id)
          : orderItems[0]

        return (
          <div key={delivery.id} className="rounded-2xl overflow-hidden border-2"
            style={{ borderColor: '#BBF7D0' }}>

            {/* Header */}
            <div className="px-5 py-3.5 flex items-center justify-between"
              style={{ background: 'linear-gradient(135deg, #F0FDF4, #DCFCE7)' }}>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} style={{ color: '#16A34A' }} />
                <p className="font-bold text-sm" style={{ color: '#166534' }}>
                  {delivery.delivery_title || relatedItem?.product_name || 'Thông tin tài khoản'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => copyAll(delivery)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
                  style={{ background: 'white', color: '#16A34A', border: '1px solid #BBF7D0' }}>
                  <Copy size={12} /> Sao chép tất cả
                </button>
                <button onClick={() => downloadOrder(delivery, relatedItem)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
                  style={{ background: '#16A34A', color: 'white' }}>
                  <Download size={12} /> Tải về
                </button>
              </div>
            </div>

            {/* Credentials box */}
            {(delivery.account_email || delivery.account_password || delivery.account_extra) && (
              <div className="p-5 space-y-3" style={{ background: '#F8FAFC' }}>

                {/* Email */}
                {delivery.account_email && (
                  <div className="bg-white rounded-xl p-3.5 border border-slate-200">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      📧 Email / Tài khoản
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="flex-1 font-mono text-sm font-semibold text-slate-900">
                        {delivery.account_email}
                      </span>
                      <button onClick={() => copyText(delivery.account_email!, 'Đã sao chép email!')}
                        className="p-1.5 rounded-lg hover:bg-blue-50 transition-colors flex-shrink-0"
                        style={{ color: '#2563EB' }}>
                        <Copy size={14} />
                      </button>
                    </div>
                  </div>
                )}

                {/* Password */}
                {delivery.account_password && (
                  <div className="bg-white rounded-xl p-3.5 border border-slate-200">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      🔑 Mật khẩu
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="flex-1 font-mono text-sm font-semibold text-slate-900">
                        {showPasswords[delivery.id]
                          ? delivery.account_password
                          : '•'.repeat(Math.min(delivery.account_password.length, 20))}
                      </span>
                      <button onClick={() => togglePassword(delivery.id)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-slate-400">
                        {showPasswords[delivery.id] ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                      <button onClick={() => copyText(delivery.account_password!, 'Đã sao chép mật khẩu!')}
                        className="p-1.5 rounded-lg hover:bg-blue-50 transition-colors flex-shrink-0"
                        style={{ color: '#2563EB' }}>
                        <Copy size={14} />
                      </button>
                    </div>
                  </div>
                )}

                {/* Extra info */}
                {delivery.account_extra && (
                  <div className="bg-white rounded-xl p-3.5 border border-slate-200">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      📋 Thông tin thêm
                    </p>
                    <div className="flex items-start gap-2">
                      <pre className="flex-1 font-mono text-xs text-slate-800 whitespace-pre-wrap leading-relaxed">
                        {delivery.account_extra}
                      </pre>
                      <button onClick={() => copyText(delivery.account_extra!, 'Đã sao chép!')}
                        className="p-1.5 rounded-lg hover:bg-blue-50 transition-colors flex-shrink-0 mt-0.5"
                        style={{ color: '#2563EB' }}>
                        <Copy size={14} />
                      </button>
                    </div>
                  </div>
                )}

                {/* Warning */}
                <div className="rounded-xl p-3 text-xs" style={{ background: '#FEF9C3', color: '#92400E' }}>
                  ⚠️ <strong>Lưu ý:</strong> Không chia sẻ thông tin này cho người khác.
                  Tài khoản chỉ dành riêng cho bạn.
                </div>
              </div>
            )}

            {/* HTML guide */}
            {delivery.delivery_content_html && (
              <div className="px-5 pb-5">
                <div className="rounded-2xl p-4 border" style={{ background: '#EFF6FF', borderColor: '#BFDBFE' }}>
                  <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: '#1E40AF' }}>
                    📖 Hướng Dẫn Sử Dụng
                  </p>
                  <div className="product-content text-sm"
                    dangerouslySetInnerHTML={{ __html: delivery.delivery_content_html }} />
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
