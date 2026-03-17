'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import {
  LayoutDashboard, Package, ShoppingBag,
  Users, FolderOpen, LogOut, ExternalLink, Menu, X, Star
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

const NAV = [
  { href: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { href: '/admin/products', icon: Package, label: 'Sản Phẩm' },
  { href: '/admin/orders', icon: ShoppingBag, label: 'Đơn Hàng' },
  { href: '/admin/reviews', icon: Star, label: 'Đánh Giá' },
  { href: '/admin/customers', icon: Users, label: 'Khách Hàng' },
  { href: '/admin/categories', icon: FolderOpen, label: 'Danh Mục' },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const isActive = (href: string, exact = false) =>
    exact ? pathname === href : pathname.startsWith(href)

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-5 border-b border-slate-200">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-black text-sm"
            style={{ background: 'linear-gradient(135deg, #2563EB, #0891B2)' }}>A</div>
          <div>
            <p className="font-black text-slate-900 text-sm" style={{ fontFamily: 'Sora, sans-serif' }}>App Xanh</p>
            <p className="text-xs font-semibold" style={{ color: '#2563EB' }}>Admin Panel</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-3 space-y-0.5">
        {NAV.map(({ href, icon: Icon, label, exact }) => (
          <Link key={href} href={href}
            onClick={() => setMobileOpen(false)}
            className={cn(
              'flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all',
              isActive(href, exact)
                ? 'font-semibold'
                : 'text-slate-600 hover:bg-slate-50'
            )}
            style={isActive(href, exact)
              ? { background: '#EFF6FF', color: '#1D4ED8' }
              : {}}>
            <Icon size={18} />
            {label}
          </Link>
        ))}
      </nav>

      <div className="p-3 border-t border-slate-200 space-y-0.5">
        <Link href="/" target="_blank"
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-all">
          <ExternalLink size={16} /> Xem Website
        </Link>
        <button onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-all">
          <LogOut size={16} /> Đăng Xuất
        </button>
      </div>
    </div>
  )

  return (
    <>
      <aside className="hidden md:flex flex-col w-60 bg-white border-r border-slate-200 min-h-screen flex-shrink-0 sticky top-0 h-screen overflow-y-auto">
        <SidebarContent />
      </aside>

      <button onClick={() => setMobileOpen(!mobileOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2.5 bg-white rounded-xl shadow-md border border-slate-200">
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {mobileOpen && (
        <>
          <div className="fixed inset-0 bg-black/30 z-40 md:hidden" onClick={() => setMobileOpen(false)} />
          <aside className="fixed left-0 top-0 h-full w-64 bg-white z-50 flex flex-col shadow-xl md:hidden">
            <SidebarContent />
          </aside>
        </>
      )}
    </>
  )
}