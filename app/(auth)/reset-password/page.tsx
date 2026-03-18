'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { Lock, Eye, EyeOff, CheckCircle2, XCircle } from 'lucide-react'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [ready, setReady] = useState(false)
  const router = useRouter()

  // Supabase puts session in URL hash after redirect — wait for it
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setReady(true)
      }
    })
  }, [])

  const rules = [
    { label: 'Ít nhất 8 ký tự', ok: password.length >= 8 },
    { label: 'Có chữ hoa', ok: /[A-Z]/.test(password) },
    { label: 'Có chữ số', ok: /[0-9]/.test(password) },
    { label: 'Mật khẩu khớp nhau', ok: password === confirm && confirm.length > 0 },
  ]
  const allOk = rules.every(r => r.ok)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!allOk) return
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      toast.error('Lỗi đặt lại mật khẩu', { description: error.message })
    } else {
      setDone(true)
      setTimeout(() => router.push('/login'), 3000)
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
          {done ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: '#F0FDF4' }}>
                <CheckCircle2 size={32} style={{ color: '#16A34A' }} />
              </div>
              <h2 className="text-xl font-black text-slate-900 mb-2">Đặt lại thành công!</h2>
              <p className="text-slate-500 text-sm mb-4">
                Mật khẩu của bạn đã được cập nhật. Đang chuyển về trang đăng nhập...
              </p>
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : (
            <>
              <div className="text-center mb-6">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{ background: '#EFF6FF' }}>
                  <Lock size={24} style={{ color: '#2563EB' }} />
                </div>
                <h1 className="text-2xl font-black text-slate-900 mb-2">Đặt mật khẩu mới</h1>
                <p className="text-slate-500 text-sm">Nhập mật khẩu mới cho tài khoản của bạn</p>
              </div>

              {!ready && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-5 text-sm text-amber-800">
                  ⏳ Đang xác thực link reset... nếu lâu quá hãy thử click lại link trong email.
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* New password */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Mật khẩu mới
                  </label>
                  <div className="relative">
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Nhập mật khẩu mới..."
                      className="input pr-12"
                      required
                    />
                    <button type="button" onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Confirm password */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Xác nhận mật khẩu
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      value={confirm}
                      onChange={e => setConfirm(e.target.value)}
                      placeholder="Nhập lại mật khẩu..."
                      className="input pr-12"
                      required
                    />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Password strength rules */}
                {password.length > 0 && (
                  <div className="bg-slate-50 rounded-2xl p-4 space-y-2">
                    {rules.map(rule => (
                      <div key={rule.label} className="flex items-center gap-2 text-sm">
                        {rule.ok
                          ? <CheckCircle2 size={15} style={{ color: '#16A34A' }} />
                          : <XCircle size={15} style={{ color: '#EF4444' }} />}
                        <span style={{ color: rule.ok ? '#166534' : '#991B1B' }}>
                          {rule.label}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <button type="submit"
                  disabled={loading || !allOk || !ready}
                  className="btn-primary w-full py-3.5 justify-center disabled:opacity-60">
                  {loading ? (
                    <span className="flex items-center gap-2 justify-center">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Đang cập nhật...
                    </span>
                  ) : '🔐 Đặt Lại Mật Khẩu'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}