'use client'
import { useParams, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatPrice } from '@/lib/utils'
import Link from 'next/link'
import { CheckCircle2, Clock, Copy, Package, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

const BANK = {
  id: 'ACB',
  account: '62291',
  name: 'NGUYEN HUU THANG',
}

export default function PaymentPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const orderCode = params.orderCode as string
  const amount = parseInt(searchParams.get('amount') ?? '0')

  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'confirming' | 'paid'>('pending')
  const [polling, setPolling] = useState(false)

  const content = `APPXANH ${orderCode}`
  const qrUrl = `https://img.vietqr.io/image/${BANK.id}-${BANK.account}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(content)}&accountName=${encodeURIComponent(BANK.name)}`

  useEffect(() => {
    const supabase = createClient()
    supabase.from('orders').select('*').eq('order_code', orderCode).single()
      .then(({ data }) => {
        if (data) {
          setOrder(data)
          if (data.payment_status === 'paid') setPaymentStatus('paid')
        }
        setLoading(false)
      })
  }, [orderCode])

  // Poll khi khách bấm xác nhận
  useEffect(() => {
    if (!polling) return
    const supabase = createClient()
    const interval = setInterval(async () => {
      const { data } = await supabase
        .from('orders').select('payment_status, order_status')
        .eq('order_code', orderCode).single()
      if (data?.payment_status === 'paid') {
        setPaymentStatus('paid')
        setPolling(false)
        clearInterval(interval)
        toast.success('Thanh toán đã được xác nhận! 🎉')
        setTimeout(() => {
          window.location.href = `/account/orders/${orderCode}`
        }, 2000)
      }
    }, 5000)
    return () => clearInterval(interval)
  }, [polling, orderCode])

  const handleConfirmPayment = async () => {
    // Update order note để admin biết khách đã CK
    const supabase = createClient()
    await supabase.from('orders').update({
      note: (order?.note ? order.note + ' | ' : '') + 'Khách đã xác nhận chuyển khoản',
      order_status: 'processing',
    }).eq('order_code', orderCode)

    setPaymentStatus('confirming')
    setPolling(true)
    toast.info('Đang chờ admin xác nhận thanh toán...')
  }

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`Đã sao chép ${label}!`)
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  // Đã thanh toán thành công
  if (paymentStatus === 'paid') {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-5"
          style={{ background: '#DCFCE7' }}>
          <CheckCircle2 size={48} style={{ color: '#16A34A' }} />
        </div>
        <h1 className="text-2xl font-black text-slate-900 mb-2" style={{ fontFamily: 'Sora, sans-serif' }}>
          Thanh toán xác nhận! 🎉
        </h1>
        <p className="text-slate-500 mb-2">Thông tin tài khoản đã sẵn sàng.</p>
        <p className="text-sm text-slate-400 mb-8">Đang chuyển đến đơn hàng của bạn...</p>
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
        <Link href={`/account/orders/${orderCode}`} className="btn-primary justify-center py-3">
          <Package size={18} /> Xem Đơn Hàng Ngay
        </Link>
      </div>
    )
  }

  // Đang chờ xác nhận
  if (paymentStatus === 'confirming') {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-5"
          style={{ background: '#DBEAFE' }}>
          <Loader2 size={48} className="animate-spin" style={{ color: '#2563EB' }} />
        </div>
        <h1 className="text-2xl font-black text-slate-900 mb-2" style={{ fontFamily: 'Sora, sans-serif' }}>
          Đang xác nhận thanh toán...
        </h1>
        <p className="text-slate-500 mb-2">Admin đang kiểm tra giao dịch của bạn.</p>
        <p className="text-sm text-slate-400 mb-8">Trang sẽ tự động cập nhật, vui lòng không tắt trình duyệt.</p>

        <div className="rounded-2xl p-4 mb-6 border" style={{ background: '#FFFBEB', borderColor: '#FDE68A' }}>
          <p className="text-sm font-bold mb-1" style={{ color: '#854D0E' }}>⏳ Thời gian xử lý</p>
          <p className="text-xs" style={{ color: '#92400E' }}>
            Thường trong vòng 5-15 phút trong giờ hành chính (8:00–22:00).
            Ngoài giờ sẽ xử lý vào sáng hôm sau.
          </p>
        </div>

        <Link href={`/account/orders/${orderCode}`}
          className="text-sm font-semibold" style={{ color: '#2563EB' }}>
          Xem chi tiết đơn hàng →
        </Link>
      </div>
    )
  }

  // Trang thanh toán chính
  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      <div className="text-center mb-8">
        <p className="text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: '#2563EB' }}>
          Bước cuối cùng
        </p>
        <h1 className="text-2xl font-black text-slate-900" style={{ fontFamily: 'Sora, sans-serif' }}>
          Hoàn Tất Thanh Toán
        </h1>
        <p className="text-slate-500 text-sm mt-1">Quét mã QR hoặc chuyển khoản thủ công</p>
      </div>

      {/* Order info */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-5 flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-400">Mã đơn hàng</p>
          <p className="font-black text-slate-900 font-mono">#{orderCode}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-400">Số tiền</p>
          <p className="text-2xl font-black" style={{ color: '#2563EB' }}>{formatPrice(amount)}</p>
        </div>
      </div>

      {/* QR Code */}
      <div className="bg-white rounded-3xl border-2 border-blue-100 p-6 text-center mb-5">
        <p className="text-sm font-bold text-slate-700 mb-4">📱 Quét QR bằng app ngân hàng</p>
        <div className="flex justify-center mb-4">
          <div className="p-3 rounded-2xl border border-slate-100 shadow-sm">
            <img src={qrUrl} alt="QR thanh toán" className="w-56 h-56 object-contain"
              onError={e => {
                (e.target as HTMLImageElement).src = `https://api.qrserver.com/v1/create-qr-code/?size=224x224&data=${encodeURIComponent(`${BANK.id} ${BANK.account} ${amount} ${content}`)}`
              }} />
          </div>
        </div>
        <p className="text-xs text-slate-400">Hỗ trợ tất cả app ngân hàng Việt Nam</p>
      </div>

      {/* Bank info */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-5">
        <p className="text-sm font-bold text-slate-700 mb-4">🏦 Chuyển khoản thủ công</p>
        <div className="space-y-3">
          {[
            { label: 'Ngân hàng', value: BANK.id, copy: false },
            { label: 'Số tài khoản', value: BANK.account, copy: true },
            { label: 'Chủ tài khoản', value: BANK.name, copy: false },
            { label: 'Số tiền', value: formatPrice(amount), copy: true, rawValue: amount.toString() },
            { label: 'Nội dung CK ⚠️', value: content, copy: true, highlight: true },
          ].map(item => (
            <div key={item.label} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
              <span className="text-sm text-slate-500">{item.label}</span>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-bold ${item.highlight ? 'font-mono' : 'text-slate-900'}`}
                  style={item.highlight ? { color: '#2563EB' } : {}}>
                  {item.value}
                </span>
                {item.copy && (
                  <button onClick={() => copy((item as any).rawValue || item.value, item.label)}
                    className="p-1.5 rounded-lg hover:bg-blue-50 transition-colors" style={{ color: '#2563EB' }}>
                    <Copy size={14} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Confirm button */}
      <button onClick={handleConfirmPayment}
        className="w-full py-4 rounded-2xl font-black text-white text-base transition-all mb-4"
        style={{ background: 'linear-gradient(135deg, #16A34A, #15803D)', boxShadow: '0 4px 16px rgba(22,163,74,0.3)' }}>
        ✅ Tôi Đã Chuyển Khoản Xong
      </button>

      <p className="text-center text-xs text-slate-400">
        Bấm nút trên sau khi đã chuyển khoản thành công để admin xử lý nhanh hơn
      </p>

      <div className="mt-5 text-center">
        <Link href={`/account/orders/${orderCode}`}
          className="text-sm font-semibold" style={{ color: '#2563EB' }}>
          Xem chi tiết đơn hàng →
        </Link>
      </div>
    </div>
  )
}