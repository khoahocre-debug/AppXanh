import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AccountSettingsForm } from '@/components/account/AccountSettingsForm'

export const metadata = { title: 'Cài Đặt Tài Khoản | XanhSoft' }

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', user.id).single()

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-slate-900">Cài Đặt Tài Khoản</h1>
        <p className="text-slate-500 text-sm mt-1">Quản lý thông tin cá nhân và bảo mật tài khoản</p>
      </div>
      <AccountSettingsForm profile={profile} userEmail={user.email ?? ''} />
    </div>
  )
}