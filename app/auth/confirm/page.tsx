'use client'
import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function ConfirmPage() {
  useEffect(() => {
    const supabase = createClient()

    async function handleAuth() {
      await new Promise(resolve => setTimeout(resolve, 1000))
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        window.location.href = '/'
        return
      }
      // fallback
      window.location.href = '/login'
    }

    handleAuth()
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center"
      style={{ background: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)' }}>
      <div className="text-center">
        <div className="w-14 h-14 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mx-auto mb-5" />
        <p className="text-lg font-bold text-slate-800 mb-1">Đang đăng nhập...</p>
        <p className="text-sm text-slate-400">Vui lòng chờ trong giây lát</p>
      </div>
    </div>
  )
}