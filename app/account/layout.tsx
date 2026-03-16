import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { CartDrawer } from '@/components/cart/CartDrawer'

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <>
      <Header />
      <CartDrawer />
      <main className="min-h-screen max-w-5xl mx-auto px-4 md:px-8 py-10">
        {children}
      </main>
      <Footer />
    </>
  )
}