'use client'
import { useState, useEffect } from 'react'
import { useCartStore } from '@/lib/stores/cart'
import { formatPrice } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Shield, ChevronRight, Eye, EyeOff, Lock } from 'lucide-react'
import Link from 'next/link'

export default function CheckoutPage() {
  const { items, total, clearCart } = useCartStore()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [form, setForm] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    upgrade_email: '',
    note: '',
    create_account: true,
    password: '',
  })

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles').select('*').eq('id', session.user.id).single()
        if (profile) {
          setUser(profile)
          setForm(f => ({
            ...f,
            customer_email: profile.email,
            customer_name: profile.full_name ?? '',
            customer_phone: profile.phone ?? '',
          }))
        }
      }
    })
  }, [])

  const totalAmount = total()

  if (items.length === 0) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="text-6xl mb-4">🛒</div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Giỏ hàng trống</h2>
        <p className="text-slate-500 mb-6">Vui lòng thêm sản phẩm trước khi thanh toán</p>
        <Link href="/shop" className="btn-primary">Xem Sản Phẩm</Link>
      </div>
    )
  }

  // Check if any item needs upgrade email
  const hasUpgradeItem = items.some(item =>
    item.product.delivery_type === 'upgrade_owner' || item.product.delivery_type === 'both'
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.customer_name || !form.customer_email) {
      toast.error('Vui lòng điền đầy đủ họ tên và email')
      return
    }
    setLoading(true)
    const supabase = createClient()

    try {
      let userId = user?.id ?? null

      // Tạo account nếu chưa login
      if (!user && form.create_account && form.password) {
        if (form.password.length < 6) {
          toast.error('Mật khẩu tối thiểu 6 ký tự')
          setLoading(false)
          return
        }
        const { data, error } = await supabase.auth.signUp({
          email: form.customer_email,
          password: form.password,
          options: { data: { full_name: form.customer_name } },
        })
        if (error) throw error
        userId = data.user?.id ?? null
      }

      // Tạo order
      const { data: order, error: orderError } = await supabase
        .from('orders').insert({
          user_id: userId,
          customer_email: form.customer_email,
          customer_name: form.customer_name,
          customer_phone: form.customer_phone || null,
          subtotal: totalAmount,
          total: totalAmount,
          note: form.note || null,
          payment_method: 'bank_transfer',
          payment_status: 'pending',
          order_status: 'pending',
        }).select().single()

      if (orderError) throw orderError

      // Tạo order items
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.productId,
        product_name: item.product.name,
        variant_name: item.variant?.option_value ?? null,
        quantity: item.quantity,
        unit_price: item.variant?.price ?? item.product.price,
        total_price: (item.variant?.price ?? item.product.price) * item.quantity,
        upgrade_email: item.upgradeEmail ?? form.upgrade_email ?? null,
        usage_guide_html_snapshot: item.product.usage_guide_html ?? null,
      }))

      await supabase.from('order_items').insert(orderItems)

      clearCart()
      toast.success('Đặt hàng thành công!')

      // Redirect to payment page with QR
      window.location.href = `/payment/${order.order_code}?amount=${totalAmount}`
    } catch (err: any) {
      toast.error('Đặt hàng thất bại', { description: err.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-10">
      <div className="mb-8">
        <p className="text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: '#2563EB' }}>Thanh Toán</p>
        <h1 className="text-3xl font-black text-slate-900" style={{ fontFamily: 'Sora, sans-serif' }}>
          Xác Nhận Đơn Hàng
        </h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* Left */}
          <div className="lg:col-span-3 space-y-5">

            {/* Thông tin */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h2 className="font-bold text-slate-900 mb-5 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full text-white text-xs flex items-center justify-center font-black"
                  style={{ background: '#2563EB' }}>1</span>
                Thông Tin Nhận Hàng
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Họ và tên *</label>
                    <input required value={form.customer_name}
                      onChange={e => setForm(f => ({ ...f, customer_name: e.target.value }))}
                      placeholder="Nguyễn Văn A" className="input" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Số điện thoại / Zalo</label>
                    <input value={form.customer_phone}
                      onChange={e => setForm(f => ({ ...f, customer_phone: e.target.value }))}
                      placeholder="0888 xxx xxx" className="input" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Email nhận thông báo *
                  </label>
                  <input required type="email" value={form.customer_email}
                    onChange={e => setForm(f => ({ ...f, customer_email: e.target.value }))}
                    placeholder="email@example.com" className="input"
                    readOnly={!!user} />
                  {user && <p className="text-xs mt-1" style={{ color: '#2563EB' }}>✓ Email từ tài khoản đăng nhập</p>}
                </div>

                {/* Email nâng cấp chính chủ */}
                {hasUpgradeItem && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      📧 Email nâng cấp chính chủ
                    </label>
                    <input type="email" value={form.upgrade_email}
                      onChange={e => setForm(f => ({ ...f, upgrade_email: e.target.value }))}
                      placeholder="Email bạn muốn nâng cấp..."
                      className="input" />
                    <p className="text-xs text-slate-400 mt-1.5">
                      💡 Bỏ qua nếu bạn chọn gói cấp sẵn — tài khoản riêng sẽ được giao sau thanh toán
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Ghi chú (nếu có)</label>
                  <textarea value={form.note}
                    onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
                    placeholder="Yêu cầu đặc biệt..." rows={2} className="input resize-none" />
                </div>
              </div>
            </div>

            {/* Tạo tài khoản */}
            {!user && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <h2 className="font-bold text-slate-900 mb-1 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full text-white text-xs flex items-center justify-center font-black"
                    style={{ background: '#2563EB' }}>2</span>
                  Tài Khoản
                </h2>
                <p className="text-sm text-slate-500 mb-4 ml-8">
                  Tạo tài khoản để tra cứu đơn hàng và nhận thông tin tài khoản dễ dàng hơn.
                </p>
                <label className="flex items-center gap-3 mb-4 ml-8 cursor-pointer">
                  <input type="checkbox" checked={form.create_account}
                    onChange={e => setForm(f => ({ ...f, create_account: e.target.checked }))}
                    className="w-4 h-4 rounded" style={{ accentColor: '#2563EB' }} />
                  <span className="text-sm font-medium text-slate-700">Tạo tài khoản App Xanh</span>
                </label>
                {form.create_account && (
                  <div className="ml-8">
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Mật khẩu *</label>
                    <div className="relative">
                      <input type={showPass ? 'text' : 'password'} value={form.password}
                        onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                        placeholder="Tối thiểu 6 ký tự" className="input pr-10"
                        minLength={6} required={form.create_account} />
                      <button type="button" onClick={() => setShowPass(!showPass)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2" style={{ color: '#94A3B8' }}>
                        {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    <p className="text-xs text-slate-400 mt-1.5 flex items-center gap-1">
                      <Lock size={11} /> Mật khẩu được mã hóa an toàn
                    </p>
                  </div>
                )}
                <p className="text-sm text-slate-500 mt-3 ml-8">
                  Đã có tài khoản?{' '}
                  <Link href="/login" className="font-semibold" style={{ color: '#2563EB' }}>Đăng nhập</Link>
                </p>
              </div>
            )}
          </div>

          {/* Right: Order summary */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sticky top-24">
              <h2 className="font-bold text-slate-900 mb-4">
                Đơn Hàng ({items.length} sản phẩm)
              </h2>

              <div className="space-y-3 mb-5 max-h-64 overflow-y-auto pr-1">
                {items.map(item => {
                  const price = item.variant?.price ?? item.product.price
                  return (
                    <div key={`${item.productId}-${item.variantId}`} className="flex gap-3">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg, #EFF6FF, #E0F2FE)' }}>
                        🤖
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900 line-clamp-2 leading-tight">
                          {item.product.name}
                        </p>
                        {item.variant && <p className="text-xs text-slate-400">{item.variant.option_value}</p>}
                        {item.upgradeEmail && <p className="text-xs" style={{ color: '#2563EB' }}>📧 {item.upgradeEmail}</p>}
                        <p className="text-xs text-slate-400 mt-0.5">x{item.quantity} × {formatPrice(price)}</p>
                      </div>
                      <p className="text-sm font-bold text-slate-900 flex-shrink-0">
                        {formatPrice(price * item.quantity)}
                      </p>
                    </div>
                  )
                })}
              </div>

              <div className="space-y-2 border-t border-slate-100 pt-4 mb-5">
                <div className="flex justify-between font-black text-lg text-slate-900">
                  <span>Tổng cộng</span>
                  <span style={{ color: '#2563EB' }}>{formatPrice(totalAmount)}</span>
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="btn-primary w-full justify-center text-base py-3.5 disabled:opacity-60">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Đang xử lý...
                  </span>
                ) : <>Đặt Hàng & Thanh Toán <ChevronRight size={18} /></>}
              </button>

              <div className="mt-3 flex items-center justify-center gap-1.5 text-xs" style={{ color: '#94A3B8' }}>
                <Shield size={13} /> Thông tin được bảo mật an toàn
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}