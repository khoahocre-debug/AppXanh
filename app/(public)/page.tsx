import { createClient } from '@/lib/supabase/server'
import { formatPrice, discountPercent } from '@/lib/utils'
import Link from 'next/link'
import { ReviewsCarousel } from '@/components/ReviewsCarousel'

export default async function HomePage() {
  const supabase = await createClient()
  const [{ data: products }, { data: categories }] = await Promise.all([
    supabase.from('products')
      .select(`*, categories(*), product_variants(*), product_images(*)`)
      .eq('status', 'active')
      .order('created_at', { ascending: false }).limit(6),
    supabase.from('categories').select('*').eq('is_active', true).order('sort_order'),
  ])
  return (
    <div className="overflow-x-hidden">
      <HeroSection />
      <MarqueSection />
      <CategoriesSection categories={categories ?? []} />
      <FeaturedProducts products={products ?? []} />
      <WhySection />
      <HowItWorksSection />
      <ReviewsSectionWrapper />
      <CtaSection />
    </div>
  )
}

// ── ICONS ─────────────────────────────────────────────────
const IconUsers = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="9" cy="7" r="4" stroke="#2563EB" strokeWidth="2"/>
    <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="#2563EB" strokeWidth="2" strokeLinecap="round"/>
  </svg>
)
const IconBox = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
    <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 002 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" stroke="#7C3AED" strokeWidth="2" strokeLinejoin="round"/>
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" stroke="#7C3AED" strokeWidth="2"/>
    <line x1="12" y1="22.08" x2="12" y2="12" stroke="#7C3AED" strokeWidth="2"/>
  </svg>
)
const IconStar = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="#FDE68A">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const IconClock = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke="#16A34A" strokeWidth="2"/>
    <polyline points="12 6 12 12 16 14" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const IconTrophy = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <path d="M6 9H4a2 2 0 01-2-2V5h4M18 9h2a2 2 0 002-2V5h-4" stroke="#D97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M6 5h12v7a6 6 0 01-12 0V5z" stroke="#D97706" strokeWidth="2" strokeLinecap="round"/>
    <path d="M12 18v4M8 22h8" stroke="#D97706" strokeWidth="2" strokeLinecap="round"/>
  </svg>
)
const IconStarFilled = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="#F59E0B">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
)
const IconRefresh = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <polyline points="23 4 23 10 17 10" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <polyline points="1 20 1 14 7 14" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const IconZap = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="#16A34A">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
)

// ── HERO ──────────────────────────────────────────────────
function HeroSection() {
  const deals = [
    { name: 'ChatGPT Plus', saved: '521.000₫', pct: '84', color: '#10A37F' },
    { name: 'Claude Pro', saved: '1.150.000₫', pct: '77', color: '#CC785C' },
    { name: 'Canva Pro', saved: '1.250.000₫', pct: '89', color: '#7D2AE8' },
    { name: 'Coursera Plus', saved: '1.991.000₫', pct: '73', color: '#0056D2' },
    { name: 'YouTube Premium', saved: '400.000₫', pct: '44', color: '#FF0000' },
    { name: 'GitHub Copilot', saved: '720.000₫', pct: '80', color: '#24292E' },
  ]

  return (
    <section className="relative overflow-hidden" style={{ background: '#0A0F1E', minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
      {/* Animated mesh background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Glow orbs */}
        <div className="absolute" style={{ top: '-10%', left: '-5%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(37,99,235,0.18) 0%, transparent 70%)', borderRadius: '50%' }} />
        <div className="absolute" style={{ top: '20%', right: '-10%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(8,145,178,0.12) 0%, transparent 70%)', borderRadius: '50%' }} />
        <div className="absolute" style={{ bottom: '-10%', left: '30%', width: '700px', height: '400px', background: 'radial-gradient(circle, rgba(22,163,74,0.08) 0%, transparent 70%)', borderRadius: '50%' }} />
        {/* Grid lines */}
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 md:px-8 py-20 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* LEFT */}
          <div>
            {/* Live badge */}
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full mb-8 text-sm font-semibold"
              style={{ background: 'rgba(37,99,235,0.15)', border: '1px solid rgba(37,99,235,0.35)', color: '#93C5FD' }}>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: '#22C55E' }} />
                <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: '#22C55E' }} />
              </span>
              Đang có {deals.length} deal hot — Giá cập nhật liên tục
            </div>

            {/* Headline */}
            <h1 className="font-black leading-[1.08] mb-6" style={{ fontSize: 'clamp(2.4rem, 5vw, 4rem)', letterSpacing: '-0.03em' }}>
              <span style={{ color: 'white' }}>Tài Khoản</span>
              <br />
              <span style={{
                background: 'linear-gradient(90deg, #3B82F6 0%, #06B6D4 50%, #10B981 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>Premium Xịn</span>
              <br />
              <span style={{ color: 'white' }}>Giá </span>
              <span style={{
                background: 'linear-gradient(90deg, #FCD34D, #F97316)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>Không Xịn</span>
            </h1>

            <p className="text-lg leading-relaxed mb-8" style={{ color: '#94A3B8', maxWidth: '480px' }}>
              ChatGPT, Claude, Canva, Coursera và 100+ app premium. Tiết kiệm đến <span style={{ color: '#FCD34D', fontWeight: 700 }}>90%</span> so với mua trực tiếp. Giao tự động trong vài phút.
            </p>

            {/* Trust pills */}
            <div className="flex flex-wrap gap-2 mb-10">
              {[
                { icon: '⚡', text: 'Giao trong 5 phút' },
                { icon: '🛡️', text: 'Bảo hành 100%' },
                { icon: '🔒', text: 'Tài khoản riêng tư' },
                { icon: '💬', text: 'Hỗ trợ Zalo 24/7' },
              ].map(item => (
                <span key={item.text}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#CBD5E1' }}>
                  {item.icon} {item.text}
                </span>
              ))}
            </div>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-3 mb-12">
              <Link href="/shop"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-bold text-base text-white transition-all hover:opacity-90 active:scale-95"
                style={{ background: 'linear-gradient(135deg, #2563EB, #0891B2)', boxShadow: '0 8px 32px rgba(37,99,235,0.35)' }}>
                Xem Tất Cả Deal →
              </Link>
              <a href="https://zalo.me/0888993991"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-bold text-base transition-all hover:bg-white/10"
                style={{ border: '1px solid rgba(255,255,255,0.15)', color: '#E2E8F0' }}>
                💬 Tư Vấn Miễn Phí
              </a>
            </div>

            {/* Stats row */}
            <div className="flex items-center gap-8 pt-8" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              {[
                { num: '5.000+', label: 'khách hàng' },
                { num: '99%', label: 'hài lòng' },
                { num: '100+', label: 'sản phẩm' },
              ].map(s => (
                <div key={s.label}>
                  <p className="text-2xl font-black" style={{ color: 'white' }}>{s.num}</p>
                  <p className="text-xs" style={{ color: '#64748B' }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT — Deal cards grid */}
          <div className="hidden lg:grid grid-cols-2 gap-4">
            {deals.map((deal, i) => (
              <div key={deal.name}
                className="rounded-2xl p-5 relative overflow-hidden hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  backdropFilter: 'blur(12px)',
                  animationDelay: `${i * 0.1}s`,
                }}>
                {/* Color accent */}
                <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl" style={{ background: deal.color }} />
                <div className="absolute -bottom-6 -right-6 w-20 h-20 rounded-full opacity-10" style={{ background: deal.color }} />

                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-lg font-black"
                    style={{ background: deal.color + '22', border: `1px solid ${deal.color}44` }}>
                    <span style={{ fontSize: '18px' }}>
                      {deal.name.includes('ChatGPT') ? '🤖' :
                       deal.name.includes('Claude') ? '✨' :
                       deal.name.includes('Canva') ? '🎨' :
                       deal.name.includes('Coursera') ? '🎓' :
                       deal.name.includes('YouTube') ? '▶️' : '💻'}
                    </span>
                  </div>
                  <span className="text-xs font-black px-2.5 py-1 rounded-lg"
                    style={{ background: 'rgba(239,68,68,0.15)', color: '#FCA5A5', border: '1px solid rgba(239,68,68,0.2)' }}>
                    -{deal.pct}%
                  </span>
                </div>

                <p className="font-bold mb-1" style={{ color: 'white', fontSize: '14px' }}>{deal.name}</p>
                <p className="text-xs" style={{ color: '#64748B' }}>Tiết kiệm</p>
                <p className="font-black mt-0.5" style={{ color: '#34D399', fontSize: '15px' }}>{deal.saved}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, transparent, rgba(10,15,30,0.8))' }} />
    </section>
  )
}

// ── MARQUEE ───────────────────────────────────────────────
function MarqueSection() {
  const items = [
    '⚡ ChatGPT Plus −84%',
    '🎨 Canva Pro −89%',
    '🎓 Coursera Plus −73%',
    '✨ Claude Pro −77%',
    '▶️ YouTube Premium −44%',
    '💻 GitHub Copilot −80%',
    '📱 CapCut Pro −87%',
    '🤖 ChatGPT Go −78%',
  ]

  return (
    <div className="overflow-hidden py-4" style={{ background: 'linear-gradient(90deg, #1e40af, #0891b2)', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
      <style>{`
        @keyframes marquee { from { transform: translateX(0) } to { transform: translateX(-50%) } }
        .marquee-track { display: flex; width: max-content; animation: marquee 20s linear infinite; }
        .marquee-track:hover { animation-play-state: paused; }
      `}</style>
      <div className="marquee-track">
        {[...items, ...items].map((item, i) => (
          <span key={i} className="inline-flex items-center gap-2 px-6 text-sm font-bold whitespace-nowrap"
            style={{ color: 'rgba(255,255,255,0.9)' }}>
            {item}
            <span style={{ color: 'rgba(255,255,255,0.3)' }}>•</span>
          </span>
        ))}
      </div>
    </div>
  )
}

// ── CATEGORIES ────────────────────────────────────────────
function CategoriesSection({ categories }: { categories: any[] }) {
  const CAT_CONFIG: Record<string, { from: string; to: string; icon: React.ReactNode }> = {
    'ai-chatbot': {
      from: '#2563EB', to: '#0891B2',
      icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><rect x="2" y="4" width="20" height="14" rx="4" fill="white" fillOpacity="0.9"/><circle cx="8" cy="11" r="2" fill="#2563EB"/><circle cx="16" cy="11" r="2" fill="#2563EB"/><path d="M9 15h6" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round"/><rect x="0" y="8" width="2" height="6" rx="1" fill="rgba(255,255,255,0.6)"/><rect x="22" y="8" width="2" height="6" rx="1" fill="rgba(255,255,255,0.6)"/></svg>
    },
    'thiet-ke': {
      from: '#7C3AED', to: '#A855F7',
      icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" fill="rgba(255,255,255,0.2)"/><circle cx="12" cy="6" r="2.5" fill="white"/><circle cx="12" cy="18" r="2.5" fill="white"/><circle cx="6" cy="12" r="2.5" fill="white"/><circle cx="18" cy="12" r="2.5" fill="white"/><circle cx="12" cy="12" r="2" fill="white"/></svg>
    },
    'video-am-nhac': {
      from: '#EF4444', to: '#F97316',
      icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><rect x="2" y="4" width="20" height="14" rx="3" fill="rgba(255,255,255,0.15)"/><path d="M10 8.5l6 3.5-6 3.5V8.5z" fill="white"/></svg>
    },
    'hoc-tap': {
      from: '#16A34A', to: '#059669',
      icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M12 3L22 8L12 13L2 8L12 3Z" fill="rgba(255,255,255,0.9)"/><path d="M6 10.5V16c0 2 2.5 4 6 4s6-2 6-4v-5.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/><line x1="22" y1="8" x2="22" y2="16" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>
    },
    'giai-tri': {
      from: '#D97706', to: '#F59E0B',
      icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="4" fill="white" fillOpacity="0.3"/><circle cx="12" cy="12" r="1.5" fill="white"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2" stroke="white" strokeWidth="1.5" strokeLinecap="round"/><path d="M5.6 5.6l1.4 1.4M16.9 16.9l1.4 1.4M5.6 18.4l1.4-1.4M16.9 7.1l1.4-1.4" stroke="white" strokeWidth="1.2" strokeLinecap="round"/></svg>
    },
    'cong-cu-dev': {
      from: '#0891B2', to: '#0E7490',
      icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M8 10L5 12l3 2" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><path d="M13 10l3 2-3 2" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><rect x="2" y="4" width="20" height="14" rx="3" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5"/><path d="M9 20h6" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>
    },
  }
  const fallback = {
    from: '#64748B', to: '#94A3B8',
    icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="4" fill="rgba(255,255,255,0.9)"/><path d="M8 12h8M12 8v8" stroke="#64748B" strokeWidth="2" strokeLinecap="round"/></svg>
  }

  return (
    <section className="max-w-7xl mx-auto px-4 md:px-8 py-16">
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#2563EB' }}>Danh Mục</p>
          <h2 className="text-3xl font-black text-slate-900">Tìm theo loại sản phẩm</h2>
        </div>
        <Link href="/shop" className="text-sm font-semibold hover:underline" style={{ color: '#2563EB' }}>Xem tất cả →</Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
        {categories.map(cat => {
          const cfg = CAT_CONFIG[cat.slug] ?? fallback
          return (
            <Link key={cat.slug} href={`/shop?category=${cat.slug}`}
              className="group flex flex-col items-center text-center gap-3 p-5 rounded-2xl border border-slate-100 bg-white hover:shadow-md hover:-translate-y-1 transition-all duration-200">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200 shadow-sm"
                style={{ background: `linear-gradient(135deg, ${cfg.from}, ${cfg.to})` }}>
                {cfg.icon}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800 group-hover:text-blue-700 transition-colors">{cat.name}</p>
                <p className="text-xs text-slate-400 mt-0.5">{cat.description ?? 'Premium'}</p>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}

// ── FEATURED PRODUCTS ─────────────────────────────────────
function FeaturedProducts({ products }: { products: any[] }) {
  if (products.length === 0) return null
  return (
    <section style={{ background: '#F8FAFC' }}>
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#2563EB' }}>Nổi Bật</p>
            <h2 className="text-3xl font-black text-slate-900">Deal đang hot nhất</h2>
          </div>
          <Link href="/shop" className="text-sm font-semibold hover:underline" style={{ color: '#2563EB' }}>Xem thêm →</Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-5">
          {products.map(product => {
            const price = product.price
            const compareAt = product.compare_at_price
            const discount = discountPercent(price, compareAt ?? 0)
            const coverImage = product.product_images?.find((i: any) => i.sort_order === 0) ?? product.product_images?.[0] ?? null
            return (
              <Link key={product.id} href={`/product/${product.slug}`}
                className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
                <div className="relative w-full flex-shrink-0" style={{ paddingTop: '56.25%' }}>
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(145deg, #f0f9ff, #e0f2fe)' }}>
                    {coverImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={coverImage.image_url} alt={coverImage.alt_text ?? product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center opacity-20">
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="#2563EB"><rect x="2" y="4" width="20" height="14" rx="4"/></svg>
                      </div>
                    )}
                    {product.badge_text && (
                      <div className="absolute top-2 left-2">
                        <span className="text-xs font-bold px-2 py-0.5 rounded-lg text-white"
                          style={{ background: product.badge_text === 'Hot' ? '#EF4444' : product.badge_text === 'Mới' ? '#22C55E' : '#F97316' }}>
                          {product.badge_text}
                        </span>
                      </div>
                    )}
                    {discount >= 10 && (
                      <div className="absolute top-2 right-2">
                        <span className="text-xs font-black px-2 py-0.5 rounded-lg" style={{ background: '#FEF9C3', color: '#854D0E' }}>
                          -{discount}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-col flex-1 p-3 md:p-4 gap-1">
                  {product.categories && (
                    <span className="text-xs font-bold" style={{ color: '#2563EB' }}>{product.categories.name}</span>
                  )}
                  <h3 className="font-bold text-slate-900 line-clamp-2 leading-snug text-sm group-hover:text-blue-700 transition-colors">
                    {product.name}
                  </h3>
                  {product.short_description && (
                    <p className="hidden md:block text-xs text-slate-500 line-clamp-2 leading-relaxed flex-1">{product.short_description}</p>
                  )}
                  <div className="flex items-center justify-between pt-2 mt-auto border-t border-slate-100">
                    <div>
                      <span className="text-base md:text-lg font-black" style={{ color: '#2563EB' }}>{formatPrice(price)}</span>
                      {compareAt && compareAt > price && (
                        <span className="hidden sm:inline text-xs text-slate-400 line-through ml-1.5">{formatPrice(compareAt)}</span>
                      )}
                    </div>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={{ background: '#DCFCE7', color: '#166634' }}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#22C55E' }} />
                      <span className="hidden sm:inline">Còn hàng</span>
                      <span className="sm:hidden">Còn</span>
                    </span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        <div className="text-center mt-8">
          <Link href="/shop" className="btn-primary px-8 py-3.5 text-base"
            style={{ boxShadow: '0 4px 16px rgba(37,99,235,0.25)' }}>
            Xem Tất Cả Sản Phẩm →
          </Link>
        </div>
      </div>
    </section>
  )
}

// ── WHY ───────────────────────────────────────────────────
function WhySection() {
  const features = [
    {
      from: '#2563EB', to: '#0891B2', highlight: '< 5 phút',
      title: 'Giao Hàng Tức Thì',
      desc: 'Nhận tài khoản ngay sau khi admin xác nhận thanh toán. Không cần chờ đợi lâu.',
      icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="white" stroke="white" strokeWidth="0.5" strokeLinejoin="round"/></svg>
    },
    {
      from: '#16A34A', to: '#059669', highlight: '100% bảo hành',
      title: 'Bảo Hành Tận Tâm',
      desc: 'Cam kết hoàn tiền hoặc đổi tài khoản mới nếu không đăng nhập được lần đầu.',
      icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M12 2L3 7v6c0 5.25 3.75 10.15 9 11.25C17.25 23.15 21 18.25 21 13V7L12 2z" fill="rgba(255,255,255,0.9)"/><path d="M9 12l2 2 4-4" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
    },
    {
      from: '#D97706', to: '#F59E0B', highlight: 'Tiết kiệm 90%',
      title: 'Giá Rẻ Nhất',
      desc: 'Tiết kiệm đến 90% so với mua trực tiếp. Cập nhật giá liên tục, cạnh tranh nhất.',
      icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="white" strokeWidth="1.5"/><path d="M12 6v12M9 9h4.5a1.5 1.5 0 010 3H9m0 0h4.5a1.5 1.5 0 010 3H9" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>
    },
    {
      from: '#7C3AED', to: '#A855F7', highlight: '8:00–22:00',
      title: 'Hỗ Trợ Zalo',
      desc: 'Đội ngũ CSKH hỗ trợ tận tình qua Zalo. Phản hồi nhanh trong vòng vài phút.',
      icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.51 12 19.79 19.79 0 01.48 3.42 2 2 0 012.46 1h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.91 8.64a16 16 0 006.29 6.29l.91-.91a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" fill="rgba(255,255,255,0.9)"/></svg>
    },
  ]
  return (
    <section className="py-20 px-4" style={{ background: 'linear-gradient(135deg, #0A0F1E 0%, #0f1f3d 100%)' }}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#60A5FA' }}>Tại Sao Chọn Xanh Soft</p>
          <h2 className="text-3xl md:text-4xl font-black text-white mb-3">Mua app xịn, giá không xịn</h2>
          <p className="max-w-xl mx-auto" style={{ color: '#64748B' }}>Hàng nghìn khách hàng đã tiết kiệm hàng triệu đồng mỗi năm</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map(item => (
            <div key={item.title} className="rounded-2xl p-6 group hover:scale-[1.02] transition-all duration-200"
              style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 shadow-sm"
                style={{ background: `linear-gradient(135deg, ${item.from}, ${item.to})` }}>
                {item.icon}
              </div>
              <div className="text-xs font-bold px-2.5 py-1 rounded-full mb-3 inline-block"
                style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }}>
                {item.highlight}
              </div>
              <h3 className="font-bold text-lg mb-2 text-white">{item.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: '#64748B' }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── HOW IT WORKS ──────────────────────────────────────────
function HowItWorksSection() {
  const steps = [
    { step: '01', icon: '🛒', title: 'Chọn sản phẩm', color: '#2563EB', bg: '#EFF6FF',
      desc: 'Duyệt qua 100+ tài khoản premium. Chọn gói phù hợp và xem mô tả chi tiết.' },
    { step: '02', icon: '💳', title: 'Thanh toán QR', color: '#7C3AED', bg: '#F5F3FF',
      desc: 'Quét mã VietQR, chuyển khoản nhanh qua ACB. Xác nhận trong vài giây.' },
    { step: '03', icon: '📦', title: 'Nhận tài khoản', color: '#16A34A', bg: '#F0FDF4',
      desc: 'Admin giao tài khoản ngay sau khi xác nhận. Thường trong vòng 5 phút.' },
    { step: '04', icon: '🎉', title: 'Dùng & bảo hành', color: '#D97706', bg: '#FFFBEB',
      desc: 'Đăng nhập ngay. Có vấn đề? Bảo hành miễn phí, hỗ trợ Zalo 8:00–22:00.' },
  ]
  return (
    <section className="py-20 bg-white px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#2563EB' }}>Quy Trình</p>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-3">Mua hàng siêu đơn giản</h2>
          <p className="text-slate-500">Từ lúc chọn đến lúc dùng chưa đến 10 phút</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <div key={step.step} className="relative p-6 rounded-2xl border border-slate-100 hover:shadow-md transition-all group text-center"
              style={{ background: '#FAFAFA' }}>
              <div className="absolute -top-4 -right-4 text-8xl font-black opacity-[0.04] select-none" style={{ color: step.color }}>
                {step.step}
              </div>
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 group-hover:scale-110 transition-transform"
                style={{ background: step.bg }}>
                {step.icon}
              </div>
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-black text-white mx-auto mb-3"
                style={{ background: step.color }}>
                {i + 1}
              </div>
              <h3 className="font-bold text-slate-900 mb-2">{step.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
        <div className="text-center mt-10">
          <Link href="/shop" className="btn-primary px-10 py-4 text-base"
            style={{ boxShadow: '0 4px 16px rgba(37,99,235,0.25)' }}>
            Bắt Đầu Mua Sắm →
          </Link>
        </div>
      </div>
    </section>
  )
}

// ── REVIEWS ───────────────────────────────────────────────
function ReviewsSectionWrapper() {
  return (
    <section className="py-20 px-4" style={{ background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #f0fdf4 100%)' }}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#2563EB' }}>Đánh Giá</p>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-3">Khách hàng nói gì?</h2>
          <div className="flex items-center justify-center gap-2">
            <div className="flex">
              {[1,2,3,4,5].map(s => (
                <svg key={s} width="20" height="20" fill="#F59E0B" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
              ))}
            </div>
            <span className="font-bold text-slate-900">5.0</span>
            <span className="text-slate-500 text-sm">/ 500+ đánh giá</span>
          </div>
        </div>

        <ReviewsCarousel />

        <div className="mt-10 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {[
              { icon: <IconTrophy />, value: '5,000+', label: 'Đơn hàng thành công', bg: '#FFFBEB' },
              { icon: <IconStarFilled />, value: '5.0/5', label: 'Điểm đánh giá TB', bg: '#FFFBEB' },
              { icon: <IconRefresh />, value: '95%', label: 'Khách quay lại', bg: '#EFF6FF' },
              { icon: <IconZap />, value: '< 2 phút', label: 'Thời gian phản hồi', bg: '#F0FDF4' },
            ].map(item => (
              <div key={item.label}>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mx-auto mb-2" style={{ background: item.bg }}>
                  {item.icon}
                </div>
                <p className="font-black text-xl text-slate-900">{item.value}</p>
                <p className="text-xs text-slate-500">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// ── CTA ───────────────────────────────────────────────────
function CtaSection() {
  return (
    <section className="py-20 px-4" style={{ background: '#0A0F1E' }}>
      <div className="max-w-4xl mx-auto">
        <div className="rounded-3xl p-10 md:p-14 text-center relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #0f2942 50%, #0a1628 100%)', border: '1px solid rgba(37,99,235,0.3)' }}>
          <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-20 pointer-events-none"
            style={{ background: 'radial-gradient(circle, #3B82F6, transparent)' }} />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full opacity-15 pointer-events-none"
            style={{ background: 'radial-gradient(circle, #06B6D4, transparent)' }} />
          <div className="relative">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold mb-5"
              style={{ background: 'rgba(37,99,235,0.2)', color: '#93C5FD', border: '1px solid rgba(37,99,235,0.3)' }}>
              ⚡ Giao hàng tự động 24/7
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Sẵn sàng tiết kiệm đến 90%?</h2>
            <p className="text-lg mb-8 max-w-xl mx-auto" style={{ color: '#64748B' }}>
              Hàng trăm sản phẩm premium đang chờ bạn với mức giá không thể tin được.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/shop"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-bold text-base text-white transition-all hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #2563EB, #0891B2)', boxShadow: '0 8px 32px rgba(37,99,235,0.3)' }}>
                Xem Sản Phẩm Ngay →
              </Link>
              <a href="https://zalo.me/0888993991"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-bold text-base transition-all hover:bg-white/5"
                style={{ border: '1px solid rgba(255,255,255,0.15)', color: '#E2E8F0' }}>
                💬 Chat Zalo Ngay
              </a>
            </div>
            <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm" style={{ color: '#475569' }}>
              {['✅ Miễn phí đăng ký', '⚡ Giao hàng tức thì', '🛡️ Bảo hành 100%', '💬 Hỗ trợ Zalo'].map(item => (
                <span key={item}>{item}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}