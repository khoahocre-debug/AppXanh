import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AdminSidebar } from '@/components/admin/AdminSidebar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  console.log('Admin check - user:', user.email, 'role:', profile?.role)

  if (!profile || profile.role !== 'admin') {
    redirect('/')
  }

  return (
    <div className="min-h-screen flex" style={{ background: '#F8FAFC' }}>
      <AdminSidebar />
      <div className="flex-1 min-w-0 overflow-x-hidden">
        <main className="p-6 md:p-8 max-w-7xl mx-auto">
          {children}
        </main>
      </div>
    </div>
  )
}