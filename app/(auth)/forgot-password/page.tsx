'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { toast } from 'sonner'
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (error) {
      toast.error('Lỗi gửi email', { description: error.message })
    } else {
      setSent(true)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'linear-gradient(135deg, #f0f9ff, #e0f2fe, #f0fdf4)' }}>
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-black text-lg"
              style={{ background: 'linear-gradient(135deg, #2563EB, #0891B2)' }}>A</div>
            <span className="font-black text-xl text-slate-900" style={{ fontFamily: 'Sora, sans-serif' }}>App Xanh</span>
          </Link>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8">
          {!sent ? (
            <>
              <div className="text-center mb-6">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{ background: '#EFF6FF' }}>
                  <Mail size={24} style={{ color: '#2563EB' }} />
                </div>
                <h1 className="text-2xl font-black text-slate-900 mb-2">Quên mật khẩu?</h1>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Nhập email đã đăng ký — tao sẽ gửi link đặt lại mật khẩu ngay.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="input"
                    required
                    autoFocus
                  />
                </div>

                <button type="submit" disabled={loading}
                  className="btn-primary w-full py-3.5 justify-center disabled:opacity-60">
                  {loading ? (
                    <span className="flex items-center gap-2 justify-center">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Đang gửi...
                    </span>
                  ) : '📧 Gửi Link Đặt Lại Mật Khẩu'}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: '#F0FDF4' }}>
                <CheckCircle2 size={32} style={{ color: '#16A34A' }} />
              </div>
              <h2 className="text-xl font-black text-slate-900 mb-2">Email đã được gửi!</h2>
              <p className="text-slate-500 text-sm leading-relaxed mb-2">
                Tao đã gửi link đặt lại mật khẩu đến
              </p>
              <p className="font-bold text-slate-800 mb-4">{email}</p>
              <div className="bg-slate-50 rounded-2xl p-4 text-left text-sm text-slate-600 space-y-2 mb-6">
                <p>📧 Kiểm tra hộp thư đến (kể cả Spam/Promotions)</p>
                <p>⏱️ Link có hiệu lực trong <strong>60 phút</strong></p>
                <p>🔗 Click vào link trong email để đặt lại mật khẩu</p>
              </div>
              <button onClick={() => { setSent(false); setEmail('') }}
                className="text-sm font-semibold hover:underline"
                style={{ color: '#2563EB' }}>
                Gửi lại email khác
              </button>
            </div>
          )}

          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <Link href="/login"
              className="inline-flex items-center gap-1.5 text-sm font-semibold hover:underline"
              style={{ color: '#64748B' }}>
              <ArrowLeft size={14} /> Quay lại đăng nhập
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}