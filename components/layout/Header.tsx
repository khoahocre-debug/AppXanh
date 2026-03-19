'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { ShoppingCart, Menu, X, LogOut, Package, ChevronDown, Settings, Users, Flame } from 'lucide-react'
import { useCartStore } from '@/lib/stores/cart'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

const navLinks = [
  { href: '/', label: 'Trang Chủ' },
  { href: '/shop', label: 'Sản Phẩm' },
  { href: '/deals', label: 'Deal Hot', hot: true },
  { href: '/guides', label: 'Hướng Dẫn' },
  { href: '/account/orders', label: 'Đơn Hàng', authOnly: true },
]

interface UserInfo {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
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
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', u.id).single()
      if (profile) {
        setUser(profile)
      } else {
        setUser({ id: u.id, email: u.email ?? '', full_name: u.user_metadata?.full_name ?? null, avatar_url: null, role: 'customer' })
      }
    }
    loadUser()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') loadUser()
      if (event === 'SIGNED_OUT') setUser(null)
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

  const displayName = user?.full_name || user?.email?.split('@')[0] || 'U'
  const avatarLetter = displayName.charAt(0).toUpperCase()

  const visibleLinks = navLinks.filter(l => !l.authOnly || (l.authOnly && user))

  return (
    <header className={cn(
      'sticky top-0 z-50 transition-all duration-300',
      scrolled
        ? 'bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm'
        : 'bg-white border-b border-slate-100'
    )}>
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0 group">
            <div className="relative w-9 h-9 flex-shrink-0">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-md group-hover:shadow-lg transition-all"
                style={{ background: 'linear-gradient(135deg, #2563EB 0%, #0891B2 100%)' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" fill="white" opacity="0.9"/>
                  <path d="M2 17l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.7"/>
                  <path d="M2 12l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none"/>
                </svg>
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white"
                style={{ background: '#22C55E' }} />
            </div>
            <div className="leading-none">
              <span className="font-black text-lg tracking-tight" style={{
                fontFamily: 'Sora, sans-serif',
                background: 'linear-gradient(135deg, #1D4ED8, #0891B2)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                XanhSoft
              </span>
              <p className="text-[9px] font-semibold tracking-widest uppercase" style={{ color: '#94A3B8', marginTop: '-1px' }}>
                Premium Store
              </p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-0.5">
            {visibleLinks.map(({ href, label, hot }) => (
              <Link key={href} href={href}
                className={cn(
                  'relative px-3.5 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5',
                  pathname === href
                    ? 'text-blue-700 bg-blue-50'
                    : 'text-slate-600 hover:text-blue-700 hover:bg-slate-50'
                )}>
                {hot && (
                  <span className="flex items-center gap-0.5 text-orange-500">
                    <Flame size={13} fill="currentColor" />
                  </span>
                )}
                {label}
                {hot && (
                  <span className="absolute -top-1 -right-1 text-[9px] font-black px-1 py-0.5 rounded-full text-white leading-none"
                    style={{ background: '#EF4444' }}>
                    NEW
                  </span>
                )}
              </Link>
            ))}
          </nav>

          {/* Right */}
          <div className="flex items-center gap-1">

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
              <div className="relative hidden md:block">
                <button onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-2.5 py-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-all">
                  {/* Avatar */}
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 overflow-hidden"
                    style={{ background: 'linear-gradient(135deg, #2563EB, #0891B2)' }}>
                    {user.avatar_url
                      ? <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                      : avatarLetter}
                  </div>
                  <span className="max-w-[90px] truncate text-sm">{displayName}</span>
                  <ChevronDown size={13} className={cn('transition-transform', userMenuOpen && 'rotate-180')} />
                </button>

                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl z-20 overflow-hidden">

                      {/* User info header */}
                      <div className="px-4 py-4 border-b border-slate-100" style={{ background: 'linear-gradient(135deg, #EFF6FF, #F0FDF4)' }}>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 overflow-hidden"
                            style={{ background: 'linear-gradient(135deg, #2563EB, #0891B2)' }}>
                            {user.avatar_url
                              ? <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                              : avatarLetter}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 text-sm truncate">{displayName}</p>
                            <p className="text-xs text-slate-400 truncate">{user.email}</p>
                          </div>
                        </div>
                        {user.role === 'admin' && (
                          <div className="mt-2 inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full"
                            style={{ background: '#FEF9C3', color: '#854D0E' }}>
                            ⚙️ Admin
                          </div>
                        )}
                      </div>

                      {/* Menu items */}
                      <div className="py-1.5">
                        {user.role === 'admin' && (
                          <Link href="/admin" onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors">
                            <span className="w-7 h-7 rounded-lg flex items-center justify-center text-base" style={{ background: '#EFF6FF' }}>⚙️</span>
                            Admin Panel
                          </Link>
                        )}

                        <Link href="/account/orders" onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                          <span className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: '#F0FDF4' }}>
                            <Package size={15} style={{ color: '#16A34A' }} />
                          </span>
                          Đơn Hàng Của Tôi
                        </Link>

                        <Link href="/account/affiliate" onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-500 hover:bg-slate-50 transition-colors">
                          <span className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: '#F5F3FF' }}>
                            <Users size={15} style={{ color: '#7C3AED' }} />
                          </span>
                          <span>Cộng Tác Viên</span>
                          <span className="ml-auto text-xs px-1.5 py-0.5 rounded-full font-semibold"
                            style={{ background: '#F5F3FF', color: '#7C3AED' }}>Sắp có</span>
                        </Link>

                        <Link href="/account/settings" onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                          <span className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: '#FFFBEB' }}>
                            <Settings size={15} style={{ color: '#D97706' }} />
                          </span>
                          Cài Đặt Tài Khoản
                        </Link>
                      </div>

                      {/* Sign out */}
                      <div className="border-t border-slate-100 py-1.5">
                        <button onClick={handleSignOut}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                          <span className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: '#FEF2F2' }}>
                            <LogOut size={15} style={{ color: '#EF4444' }} />
                          </span>
                          Đăng Xuất
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
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
          <div className="md:hidden border-t border-slate-100 py-3 space-y-0.5 pb-4">
            {visibleLinks.map(({ href, label, hot }) => (
              <Link key={href} href={href} onClick={() => setMobileOpen(false)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all',
                  pathname === href ? 'text-blue-700 bg-blue-50' : 'text-slate-700 hover:bg-slate-50'
                )}>
                {hot && <Flame size={14} className="text-orange-500" fill="currentColor" />}
                {label}
                {hot && (
                  <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full text-white"
                    style={{ background: '#EF4444' }}>NEW</span>
                )}
              </Link>
            ))}

            <div className="pt-3 border-t border-slate-100 px-1 space-y-2 mt-2">
              {user ? (
                <>
                  <div className="flex items-center gap-3 px-3 py-3 rounded-xl" style={{ background: '#F8FAFC' }}>
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 overflow-hidden"
                      style={{ background: 'linear-gradient(135deg, #2563EB, #0891B2)' }}>
                      {user.avatar_url
                        ? <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                        : avatarLetter}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 truncate">{displayName}</p>
                      <p className="text-xs text-slate-400 truncate">{user.email}</p>
                    </div>
                  </div>
                  <Link href="/account/settings" onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50">
                    <Settings size={15} /> Cài Đặt Tài Khoản
                  </Link>
                  <button onClick={handleSignOut}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-red-600 border border-red-200 hover:bg-red-50 transition-colors">
                    <LogOut size={16} /> Đăng Xuất
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setMobileOpen(false)} className="btn-outline w-full justify-center">Đăng Nhập</Link>
                  <Link href="/register" onClick={() => setMobileOpen(false)} className="btn-primary w-full justify-center">Đăng Ký</Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}