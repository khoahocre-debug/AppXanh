'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { ShoppingCart, Menu, X, LogOut, Package, ChevronDown } from 'lucide-react'
import { useCartStore } from '@/lib/stores/cart'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

const navLinks = [
  { href: '/', label: 'Trang Chủ' },
  { href: '/shop', label: 'Sản Phẩm' },
  { href: '/guides', label: 'Hướng Dẫn' },
]

interface UserInfo {
  id: string
  email: string
  full_name: string | null
  role: string
}

export function Header() {
  const pathname = usePathname()
  const { itemCount, openCart } = useCartStore()
  const [mounted, setMounted] = useState(false)
  const [user, setUser] = useState<UserInfo | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  const count = mounted ? itemCount() : 0

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    const supabase = createClient()

    async function loadUser() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) { setUser(null); return }

      const u = session.user
      // Try profiles first
      const { data: profile } = await supabase
        .from('profiles').select('*').eq('id', u.id).single()

      if (profile) {
        setUser(profile)
      } else {
        setUser({
          id: u.id,
          email: u.email ?? '',
          full_name: u.user_metadata?.full_name ?? u.user_metadata?.name ?? null,
          role: 'customer',
        })
      }
    }

    loadUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        loadUser()
      }
      if (event === 'SIGNED_OUT') {
        setUser(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setUser(null)
    setUserMenuOpen(false)
    setMobileOpen(false)
    window.location.href = '/'
  }

  return (
    <header className={cn(
      'sticky top-0 z-50 transition-all duration-200',
      scrolled
        ? 'bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm'
        : 'bg-white border-b border-slate-200'
    )}>
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm font-black"
              style={{ background: 'linear-gradient(135deg, #2563EB, #0891B2)' }}>A</div>
            <span className="gradient-text font-extrabold text-xl" style={{ fontFamily: 'Sora, sans-serif' }}>
              App Xanh
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(({ href, label }) => (
              <Link key={href} href={href}
                className={cn(
                  'px-4 py-2 rounded-xl text-sm font-medium transition-all',
                  pathname === href
                    ? 'text-blue-700 bg-blue-50'
                    : 'text-slate-600 hover:text-blue-700 hover:bg-slate-50'
                )}>
                {label}
              </Link>
            ))}
          </nav>

          {/* Right */}
          <div className="flex items-center gap-1.5">

            {/* Cart */}
            <button onClick={openCart}
              className="relative p-2.5 rounded-xl text-slate-600 hover:text-blue-700 hover:bg-blue-50 transition-all">
              <ShoppingCart size={20} />
              {mounted && count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 text-white text-xs rounded-full flex items-center justify-center font-bold"
                  style={{ background: '#2563EB' }}>
                  {count > 9 ? '9+' : count}
                </span>
              )}
            </button>

            {/* Desktop auth */}
            {mounted && user ? (
              <>
                <Link href="/account/orders"
                  className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-slate-600 hover:text-blue-700 hover:bg-slate-50 transition-all">
                  <Package size={16} /> Đơn Hàng
                </Link>

                <div className="relative hidden md:block">
                  <button onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-all">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
                      style={{ background: 'linear-gradient(135deg, #2563EB, #0891B2)' }}>
                      {(user.full_name || user.email || 'U').charAt(0).toUpperCase()}
                    </div>
                    <span className="max-w-[100px] truncate">
                      {user.full_name || user.email.split('@')[0]}
                    </span>
                    <ChevronDown size={14} />
                  </button>

                  {userMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                      <div className="absolute right-0 top-full mt-1 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl z-20 py-1.5 overflow-hidden">
                        <div className="px-4 py-3 border-b border-slate-100">
                          <p className="text-xs text-slate-400 mb-0.5">Xin chào!</p>
                          <p className="text-sm font-bold text-slate-900 truncate">
                            {user.full_name || user.email}
                          </p>
                        </div>
                        {user.role === 'admin' && (
                          <Link href="/admin" onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors">
                            ⚙️ Admin Panel
                          </Link>
                        )}
                        <Link href="/account/orders" onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                          <Package size={15} /> Đơn Hàng Của Tôi
                        </Link>
                        <div className="border-t border-slate-100 mt-1 pt-1">
                          <button onClick={handleSignOut}
                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                            <LogOut size={15} /> Đăng Xuất
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : mounted && !user ? (
              <div className="hidden md:flex items-center gap-2">
                <Link href="/login" className="btn-outline py-2 text-sm">Đăng Nhập</Link>
                <Link href="/register" className="btn-primary py-2 text-sm">Đăng Ký</Link>
              </div>
            ) : null}

            {/* Mobile toggle */}
            <button onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2.5 rounded-xl text-slate-600 hover:bg-slate-100 transition-all">
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-slate-100 py-3 space-y-1 pb-4">
            {navLinks.map(({ href, label }) => (
              <Link key={href} href={href} onClick={() => setMobileOpen(false)}
                className={cn(
                  'flex items-center px-4 py-2.5 rounded-xl text-sm font-medium transition-all',
                  pathname === href ? 'text-blue-700 bg-blue-50' : 'text-slate-700 hover:bg-slate-50'
                )}>
                {label}
              </Link>
            ))}
            {user && (
              <Link href="/account/orders" onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50">
                <Package size={16} /> Đơn Hàng
              </Link>
            )}
            <div className="pt-3 border-t border-slate-100 px-1 space-y-2">
              {user ? (
                <>
                  <div className="px-3 py-2 rounded-xl" style={{ background: '#F8FAFC' }}>
                    <p className="text-xs text-slate-400">Xin chào!</p>
                    <p className="text-sm font-bold text-slate-900 truncate">
                      {user.full_name || user.email}
                    </p>
                  </div>
                  <button onClick={handleSignOut}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-red-600 border border-red-200 hover:bg-red-50 transition-colors">
                    <LogOut size={16} /> Đăng Xuất
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setMobileOpen(false)}
                    className="btn-outline w-full justify-center">Đăng Nhập</Link>
                  <Link href="/register" onClick={() => setMobileOpen(false)}
                    className="btn-primary w-full justify-center">Đăng Ký</Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}