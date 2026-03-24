'use client'
import Image from 'next/image'
import Link from 'next/link'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useMemo, useState } from 'react'
import {
  BadgeCheck, Building2, Check, ChevronRight, CircleAlert,
  Copy, CreditCard, Loader2, Package, QrCode, ShieldCheck, Sparkles,
} from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { formatPrice } from '@/lib/utils'

const BANK = { id: 'ACB', account: '62291', name: 'NGUYEN HUU THANG' }
const CONFIRMING_KEY = 'appxanh-payment-confirming:'

interface Order {
  id: string
  order_code: string
  note: string | null
  order_status: string | null
  payment_status: string | null
  total: number | null
}
type PaymentStatus = 'pending' | 'confirming' | 'paid'
type TransferField = { label: string; value: string; copyValue?: string; highlight?: boolean }

function SuccessIcon({ size = 40 }: { size?: number }) {
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 64 64" fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ filter: 'drop-shadow(0 10px 24px rgba(34,197,94,0.28))' }}>
      <defs>
        <linearGradient id="sg-ring" x1="10" y1="8" x2="54" y2="56" gradientUnits="userSpaceOnUse">
          <stop stopColor="#4ADE80" />
          <stop offset="1" stopColor="#16A34A" />
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="26" fill="url(#sg-ring)" />
      <circle cx="32" cy="32" r="20" fill="rgba(255,255,255,0.18)" />
      <path d="M22 32.5L28.8 39.3L42.5 25.5" stroke="white" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function PaymentContent() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const orderCode = params.orderCode as string
  const amountParam = parseInt(searchParams.get('amount') ?? '0', 10)

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('pending')
  const [polling, setPolling] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [redirecting, setRedirecting] = useState(false)

  const amount = (order?.total && order.total > 0) ? order.total : amountParam
  const content = `APPXANH ${orderCode}`

  const qrUrl = useMemo(
    () => `https://img.vietqr.io/image/${BANK.id}-${BANK.account}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(content)}&accountName=${encodeURIComponent(BANK.name)}`,
    [amount, content]
  )

  useEffect(() => {
    let active = true
    const supabase = createClient()

    const load = async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('id, order_code, note, order_status, payment_status, total')
        .eq('order_code', orderCode)
        .single()

      if (!active) return
      if (error || !data) {
        toast.error('Không tải được thông tin thanh toán')
        setLoading(false)
        return
      }

      const persisted = typeof window !== 'undefined'
        && window.sessionStorage.getItem(CONFIRMING_KEY + orderCode) === 'true'

      const status: PaymentStatus =
        data.payment_status === 'paid' ? 'paid'
          : (persisted || data.order_status === 'processing' || data.note?.includes('Khách đã xác nhận chuyển khoản'))
            ? 'confirming'
            : 'pending'

      setOrder(data)
      setPaymentStatus(status)
      setPolling(status === 'confirming')
      setLoading(false)
    }

    load()
    return () => { active = false }
  }, [orderCode])

  useEffect(() => {
    if (!polling) return
    const supabase = createClient()

    const interval = window.setInterval(async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('payment_status, order_status, note, total')
        .eq('order_code', orderCode)
        .single()

      if (error || !data) return
      setOrder(prev => (prev ? { ...prev, ...data } : prev))

      if (data.payment_status === 'paid') {
        window.sessionStorage.removeItem(CONFIRMING_KEY + orderCode)
        setPaymentStatus('paid')
        setPolling(false)
        setRedirecting(true)
        toast.success('Thanh toán đã được xác nhận! 🎉')
        window.setTimeout(() => {
          router.replace(`/account/orders/${orderCode}`)
          router.refresh()
        }, 1600)
      }
    }, 5000)

    return () => window.clearInterval(interval)
  }, [polling, orderCode, router])

  const handleConfirm = async () => {
    if (submitting || paymentStatus !== 'pending') return
    setSubmitting(true)

    const supabase = createClient()
    const { error } = await supabase
      .from('orders')
      .update({
        note: (order?.note ? order.note + ' | ' : '') + 'Khách đã xác nhận chuyển khoản',
        order_status: 'processing',
      })
      .eq('order_code', orderCode)

    if (error) {
      toast.error('Chưa thể ghi nhận xác nhận', { description: error.message })
      setSubmitting(false)
      return
    }

    window.sessionStorage.setItem(CONFIRMING_KEY + orderCode, 'true')
    setOrder(prev => prev ? {
      ...prev,
      order_status: 'processing',
      note: (prev.note ? prev.note + ' | ' : '') + 'Khách đã xác nhận chuyển khoản',
    } : prev)
    setPaymentStatus('confirming')
    setPolling(true)
    setSubmitting(false)
    toast.info('Đã ghi nhận. Hệ thống đang chờ admin xác nhận giao dịch.')
  }

  const copy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success('Đã sao chép ' + label.toLowerCase() + '!')
    } catch {
      toast.error('Không thể sao chép. Vui lòng thử lại.')
    }
  }

  const transferFields: TransferField[] = [
    { label: 'Ngân hàng', value: BANK.id },
    { label: 'Số tài khoản', value: BANK.account, copyValue: BANK.account },
    { label: 'Chủ tài khoản', value: BANK.name },
    { label: 'Số tiền', value: formatPrice(amount), copyValue: amount.toString() },
    { label: 'Nội dung chuyển khoản ⚠️', value: content, copyValue: content, highlight: true },
  ]

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
          <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
          <span className="text-sm font-semibold text-slate-600">Đang tải thông tin thanh toán...</span>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-rose-50">
          <CircleAlert className="h-10 w-10 text-rose-500" />
        </div>
        <h1 className="mb-2 text-2xl font-black text-slate-900">Không tìm thấy đơn hàng</h1>
        <p className="mb-6 text-sm text-slate-500">
          Vui lòng kiểm tra lại liên kết thanh toán hoặc xem danh sách đơn hàng.
        </p>
        <Link href="/account/orders" className="btn-primary justify-center py-3">
          <Package size={18} /> Xem danh sách đơn hàng
        </Link>
      </div>
    )
  }

  if (paymentStatus === 'paid') {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <div className="relative overflow-hidden rounded-[32px] border border-emerald-100 px-6 py-10 shadow-[0_24px_70px_rgba(16,185,129,0.12)]"
          style={{ background: 'linear-gradient(180deg,#ffffff 0%,#f0fdf4 100%)' }}>
          <div className="absolute inset-x-10 top-0 h-24 rounded-full bg-emerald-200/40 blur-3xl" />
          <div className="relative mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-[28px] bg-white shadow-[0_20px_40px_rgba(22,163,74,0.18)]">
            <SuccessIcon size={48} />
          </div>
          <div className="mb-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-widest"
            style={{ background: '#DCFCE7', color: '#16A34A' }}>
            <BadgeCheck size={14} /> Đã xác nhận thanh toán
          </div>
          <h1 className="mb-2 text-3xl font-black text-slate-900" style={{ fontFamily: 'Sora, sans-serif' }}>
            Giao dịch thành công
          </h1>
          <p className="mx-auto mb-8 max-w-md text-sm leading-6 text-slate-600">
            App Xanh đã ghi nhận thanh toán cho đơn <span className="font-semibold text-slate-900">#{orderCode}</span>.
            Đang chuyển bạn đến chi tiết đơn hàng...
          </p>
          <div className="mx-auto mb-6 flex h-10 w-10 items-center justify-center rounded-full border border-emerald-200 bg-white">
            <Loader2 className="h-5 w-5 animate-spin text-emerald-600" />
          </div>
          <Link href={`/account/orders/${orderCode}`} className="btn-primary justify-center px-5 py-3.5">
            <Package size={18} /> Xem đơn hàng ngay
          </Link>
        </div>
      </div>
    )
  }

  if (paymentStatus === 'confirming') {
    return (
      <div className="mx-auto max-w-xl px-4 py-14">
        <div className="overflow-hidden rounded-[32px] border border-blue-100 shadow-[0_22px_60px_rgba(37,99,235,0.12)]"
          style={{ background: 'linear-gradient(180deg,#ffffff 0%,#eff6ff 100%)' }}>
          <div className="border-b border-white/70 px-6 py-5 sm:px-8">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-bold uppercase tracking-widest text-blue-700 backdrop-blur">
              <ShieldCheck size={14} /> Đang chờ đối soát
            </div>
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-white text-blue-600 shadow-sm">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-900" style={{ fontFamily: 'Sora, sans-serif' }}>
                  Đang xác nhận thanh toán
                </h1>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Hệ thống đã ghi nhận bạn đã chuyển khoản. Admin sẽ kiểm tra và cập nhật đơn hàng ngay khi nhận tiền.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 px-6 py-6 sm:px-8">
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-bold text-amber-900">
                <Sparkles size={16} /> Thời gian xử lý tham khảo
              </div>
              <p className="text-sm leading-6 text-amber-800">
                Thường trong vòng <span className="font-semibold">5–15 phút</span> trong khung giờ 08:00–22:00.
                Ngoài giờ sẽ xử lý vào đầu ca tiếp theo.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Mã đơn hàng</p>
                <p className="mt-2 font-mono text-lg font-black text-slate-900">#{orderCode}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Tổng thanh toán</p>
                <p className="mt-2 text-lg font-black text-blue-700">{formatPrice(amount)}</p>
              </div>
            </div>

            <Link href={`/account/orders/${orderCode}`}
              className="flex items-center justify-center gap-2 rounded-2xl border border-blue-200 bg-white py-3.5 text-sm font-semibold text-blue-700 transition hover:bg-blue-50">
              Xem chi tiết đơn hàng <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 overflow-hidden rounded-[36px] px-6 py-7 text-white shadow-[0_30px_90px_rgba(15,23,42,0.22)] sm:px-8"
        style={{ background: 'linear-gradient(135deg,#0f172a 0%,#1d4ed8 58%,#22d3ee 100%)' }}>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-blue-100 backdrop-blur-sm">
              <ShieldCheck size={14} /> Bước cuối cùng
            </div>
            <h1 className="text-3xl font-black leading-tight sm:text-4xl" style={{ fontFamily: 'Sora, sans-serif' }}>
              Hoàn tất thanh toán
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-blue-50/90">
              Quét mã QR để thanh toán nhanh, hoặc nhập tay thông tin bên dưới.
              Sau khi chuyển khoản xong bấm xác nhận để admin xử lý ngay.
            </p>
          </div>
          <div className="grid min-w-[220px] gap-3 rounded-[28px] border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
            <div>
              <p className="text-xs uppercase tracking-widest text-blue-100/80">Mã đơn hàng</p>
              <p className="mt-1 font-mono text-lg font-black">#{orderCode}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-blue-100/80">Số tiền cần chuyển</p>
              <p className="mt-1 text-2xl font-black">{formatPrice(amount)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
        <section className="overflow-hidden rounded-[32px] border border-blue-100 bg-white shadow-[0_18px_60px_rgba(37,99,235,0.08)]">
          <div className="border-b border-slate-100 px-6 py-5 sm:px-8">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <QrCode size={24} />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900">Quét QR bằng app ngân hàng</h2>
                <p className="mt-0.5 text-sm text-slate-500">
                  Tự điền sẵn số tiền và nội dung, giảm sai sót khi thanh toán.
                </p>
              </div>
            </div>
          </div>

          <div className="px-6 py-6 sm:px-8">
            <div className="rounded-[28px] border border-blue-100 p-5 text-center"
              style={{ background: 'radial-gradient(circle at top,#eff6ff 0%,#ffffff 58%)' }}>
              <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-widest text-blue-700">
                <CreditCard size={14} /> VietQR tự động
              </div>
              <div className="mx-auto mb-5 flex w-fit rounded-[28px] border border-slate-100 bg-white p-4 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
                <Image
                  src={qrUrl}
                  alt="QR thanh toán App Xanh"
                  width={256}
                  height={256}
                  className="h-64 w-64 rounded-2xl object-contain"
                  onError={e => {
                    ;(e.target as HTMLImageElement).src =
                      'https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=' +
                      encodeURIComponent(BANK.id + ' ' + BANK.account + ' ' + amount + ' ' + content)
                  }}
                />
              </div>
              <p className="text-sm font-semibold text-slate-700">
                Mở ứng dụng ngân hàng → quét QR → kiểm tra nội dung → xác nhận.
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Hỗ trợ hầu hết app ngân hàng Việt Nam qua chuẩn VietQR.
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
            <div className="border-b border-slate-100 px-6 py-5 sm:px-7">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                  <Building2 size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900">Chuyển khoản thủ công</h2>
                  <p className="mt-0.5 text-sm text-slate-500">Nhập tay nếu không quét được QR</p>
                </div>
              </div>
            </div>

            <div className="space-y-3 px-6 py-5 sm:px-7" style={{ fontFamily: 'Inter, sans-serif' }}>
              {transferFields.map(item => (
                <div key={item.label}
                  className="flex flex-col gap-3 rounded-2xl border px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between"
                  style={{
                    background: item.highlight ? '#EFF6FF' : '#F8FAFC',
                    borderColor: item.highlight ? '#BFDBFE' : '#E2E8F0',
                  }}>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">{item.label}</p>
                    <p className="mt-1 break-all text-sm font-bold"
                      style={{ color: item.highlight ? '#1D4ED8' : '#0F172A' }}>
                      {item.value}
                    </p>
                  </div>
                  {item.copyValue && (
                    <button
                      type="button"
                      onClick={() => copy(item.copyValue!, item.label)}
                      className="inline-flex flex-shrink-0 items-center justify-center gap-2 rounded-xl border border-blue-200 bg-white px-3 py-2 text-sm font-semibold text-blue-700 transition hover:-translate-y-0.5 hover:bg-blue-50">
                      <Copy size={14} /> Sao chép
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="overflow-hidden rounded-[32px] border border-emerald-200 shadow-[0_18px_60px_rgba(22,163,74,0.08)]"
            style={{ background: 'linear-gradient(180deg,#f0fdf4 0%,#ffffff 100%)' }}>
            <div className="px-6 py-6 sm:px-7">
              <div className="mb-4 flex items-start gap-4">
                <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm">
                  <SuccessIcon size={36} />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900">Đã chuyển khoản xong?</h2>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    Bấm xác nhận để admin ưu tiên kiểm tra giao dịch của bạn và xử lý đơn hàng nhanh hơn.
                  </p>
                </div>
              </div>

              <button type="button" onClick={handleConfirm} disabled={submitting}
                className="group flex w-full items-center justify-center gap-3 rounded-[24px] px-5 py-4 text-base font-black text-white shadow-[0_16px_30px_rgba(22,163,74,0.26)] transition hover:-translate-y-0.5 hover:shadow-[0_20px_36px_rgba(22,163,74,0.3)] disabled:cursor-not-allowed disabled:opacity-70"
                style={{ background: 'linear-gradient(135deg,#16a34a 0%,#0f9f63 48%,#0f766e 100%)' }}>
                {submitting ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/20">
                    <SuccessIcon size={28} />
                  </span>
                )}
                <span>{submitting ? 'Đang ghi nhận...' : 'Tôi đã chuyển khoản xong'}</span>
              </button>

              <div className="mt-4 rounded-2xl border border-emerald-100 bg-white/80 p-4">
                <div className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-900">
                  <Check className="h-4 w-4 text-emerald-600" /> Lưu ý để đối soát nhanh
                </div>
                <ul className="space-y-1.5 text-sm text-slate-600">
                  <li>• Chuyển đúng số tiền <span className="font-semibold text-slate-900">{formatPrice(amount)}</span></li>
                  <li>• Nội dung chuyển khoản phải là <span className="font-mono font-semibold text-blue-700">{content}</span></li>
                  <li>• Sau khi bấm xác nhận, trang tự theo dõi trạng thái, không cần tải lại thủ công</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
            <span className="text-sm text-slate-500">Cần kiểm tra hoặc quay về sau?</span>
            <Link href={`/account/orders/${orderCode}`}
              className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700 transition hover:text-blue-800">
              Xem chi tiết đơn hàng <ChevronRight size={16} />
            </Link>
          </div>
        </section>
      </div>

      {redirecting && <div className="sr-only">Đang chuyển hướng tới đơn hàng</div>}
    </div>
  )
}

export default function PaymentPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }>
      <PaymentContent />
    </Suspense>
  )
}