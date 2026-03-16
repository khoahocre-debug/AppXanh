import { createClient } from '@/lib/supabase/server'
import { formatPrice, discountPercent } from '@/lib/utils'
import Link from 'next/link'

export default async function HomePage() {
  const supabase = await createClient()

  const { data: products } = await supabase
    .from('products')
    .select(`*, categories(*), product_variants(*), product_images(*)`)
    .eq('status', 'active')
    .eq('featured', true)
    .order('created_at', { ascending: false })
    .limit(6)

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('sort_order')

  const { data: allProducts } = await supabase
    .from('products')
    .select(`*, product_images(*)`)
    .eq('status', 'active')
    .limit(3)

  return (
    <div className="overflow-x-hidden">
      <HeroSection />
      <CategoriesSection categories={categories ?? []} />
      <FeaturedProducts products={products ?? []} />
      <WhySection />
      <HowItWorksSection />
      <ReviewsSection />
      <CtaSection />
    </div>
  )
}

// ── LOGOS SVG ─────────────────────────────────────────────
const ChatGPTLogo = ({ size = 32 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 41 41" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M37.532 16.87a9.963 9.963 0 00-.856-8.184 10.078 10.078 0 00-10.855-4.835 9.964 9.964 0 00-6.239-3.746 10.078 10.078 0 00-9.413 3.632 9.963 9.963 0 00-3.735 6.176A10.078 10.078 0 00.908 20.07a9.963 9.963 0 00.856 8.185 10.078 10.078 0 0010.855 4.835 9.964 9.964 0 006.239 3.746 10.078 10.078 0 009.414-3.632 9.963 9.963 0 003.734-6.176 10.078 10.078 0 00-4.474-10.158zM22.016 37.422a7.474 7.474 0 01-4.799-1.735c.061-.033.168-.091.237-.134l7.964-4.6a1.294 1.294 0 00.655-1.134V19.054l3.366 1.944a.12.12 0 01.066.092v9.299a7.505 7.505 0 01-7.49 7.033zM6.1 31.14a7.471 7.471 0 01-.894-5.023c.06.036.162.099.237.141l7.964 4.6a1.297 1.297 0 001.308 0l9.724-5.614v3.888a.12.12 0 01-.048.103L16.323 34.2A7.505 7.505 0 016.1 31.14zm-1.986-16.32A7.474 7.474 0 018.023 10.8c0 .068-.004.19-.004.274v9.201a1.294 1.294 0 00.654 1.132l9.723 5.614-3.366 1.944a.12.12 0 01-.114.012L7.044 24.3a7.504 7.504 0 01-2.93-9.48zm27.658 6.437l-9.724-5.615 3.367-1.943a.121.121 0 01.114-.012l7.872 4.547a7.505 7.505 0 01-1.158 13.528v-9.476a1.293 1.293 0 00-.471-1.029zm3.35-5.043c-.059-.037-.162-.099-.236-.141l-7.965-4.6a1.298 1.298 0 00-1.308 0l-9.723 5.614v-3.888a.12.12 0 01.048-.103l7.867-4.542a7.505 7.505 0 0111.317 7.66zm-21.063 6.929l-3.367-1.944a.12.12 0 01-.065-.092v-9.299a7.505 7.505 0 0112.293-5.756 6.94 6.94 0 00-.236.134l-7.965 4.6a1.294 1.294 0 00-.654 1.132l-.006 11.225zm1.829-3.943l4.33-2.501 4.332 2.497v4.998l-4.331 2.5-4.331-2.5z" fill="#10A37F"/>
  </svg>
)

const YoutubeLogo = ({ size = 32 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" fill="#FF0000"/>
  </svg>
)

const CanvaLogo = ({ size = 32 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm3.578 16.813c-.472.392-1.174.59-2.109.59-.606 0-1.162-.098-1.669-.294-.507-.196-.944-.482-1.313-.857-.368-.375-.655-.83-.862-1.366C9.4 14.35 9.3 13.748 9.3 13.08c0-.668.1-1.27.3-1.806.2-.536.486-.991.857-1.366.37-.375.81-.661 1.318-.857.508-.196 1.063-.294 1.668-.294.438 0 .85.06 1.238.18.388.12.735.29 1.04.513.308.222.558.49.75.806.194.315.316.67.37 1.062h-1.73c-.064-.375-.23-.664-.5-.866-.27-.202-.613-.303-1.03-.303-.293 0-.558.052-.794.156-.235.104-.436.254-.604.45-.167.196-.297.436-.387.72-.09.284-.135.606-.135.966 0 .365.046.692.135.98.09.287.22.531.387.732.167.2.37.354.604.46.236.105.5.157.794.157.44 0 .8-.112 1.08-.337.28-.225.452-.534.518-.927h1.73c-.056.395-.177.747-.363 1.057-.186.31-.43.572-.73.787zm2.312.117h-1.72V9.35h1.72v7.58zm-.86-8.75c-.284 0-.516-.093-.698-.279-.182-.185-.273-.413-.273-.682 0-.27.09-.497.273-.683.182-.186.414-.279.698-.279s.516.093.698.279c.182.186.273.413.273.683 0 .269-.09.497-.273.682-.182.186-.414.28-.698.28z" fill="#7D2AE8"/>
  </svg>
)

const ClaudeLogo = ({ size = 32 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18c-4.418 0-8-3.582-8-8s3.582-8 8-8 8 3.582 8 8-3.582 8-8 8z" fill="#CC9B7A"/>
    <path d="M14.5 8.5c-.828 0-1.5.672-1.5 1.5v4c0 .828.672 1.5 1.5 1.5S16 14.828 16 14v-4c0-.828-.672-1.5-1.5-1.5zM9.5 8.5C8.672 8.5 8 9.172 8 10v4c0 .828.672 1.5 1.5 1.5S11 14.828 11 14v-4c0-.828-.672-1.5-1.5-1.5z" fill="#CC9B7A"/>
  </svg>
)

const GithubLogo = ({ size = 32 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="#24292F" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
  </svg>
)

// ── HERO ──────────────────────────────────────────────────
function HeroSection() {
  const heroCards = [
    {
      name: 'ChatGPT Plus Business',
      sub: 'GPT-5.2 · DALL-E · Sora',
      price: 99000, oldPrice: 620000,
      logo: <ChatGPTLogo size={28} />,
      bg: '#E8F7F3', color: '#10A37F',
      rotate: 'rotate(2deg)', pos: { top: '0%', right: '0%' }, width: 'w-72',
    },
    {
      name: 'YouTube Premium 1 Năm',
      sub: 'Không quảng cáo',
      price: 500000, oldPrice: 900000,
      logo: <YoutubeLogo size={24} />,
      bg: '#FFF0F0', color: '#FF0000',
      rotate: 'rotate(-2deg)', pos: { top: '38%', left: '0%' }, width: 'w-64',
    },
    {
      name: 'Canva Pro 1 Năm',
      sub: '100M+ templates',
      price: 150000, oldPrice: 1400000,
      logo: <CanvaLogo size={24} />,
      bg: '#F3EEFF', color: '#7D2AE8',
      rotate: 'rotate(1deg)', pos: { bottom: '5%', right: '8%' }, width: 'w-60',
    },
  ]

  return (
    <section className="relative overflow-hidden py-20 md:py-28 px-4"
      style={{ background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 30%, #f0fdf4 70%, #f8fafc 100%)' }}>

      {/* Blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-25 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #3b82f6, transparent)' }} />
      <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #06b6d4, transparent)' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-10 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #8b5cf6, transparent)' }} />

      <div className="relative max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Left */}
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 text-sm font-semibold border"
              style={{ background: 'rgba(255,255,255,0.85)', borderColor: '#BFDBFE', color: '#1D4ED8' }}>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: '#22C55E' }} />
                <span className="relative inline-flex h-2 w-2 rounded-full" style={{ background: '#22C55E' }} />
              </span>
              Giao hàng tự động 24/7 — Không cần chờ đợi
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight mb-5 text-slate-900">
              Kho Tài Khoản<br />
              Premium{' '}
              <span className="gradient-text">Giá Xanh</span>
            </h1>

            <div className="flex flex-wrap gap-2 mb-5">
              {[
                { icon: '✓', text: 'Tài Khoản Ổn Định' },
                { icon: '⚡', text: 'Thanh toán có liền' },
                { icon: '🛡️', text: 'Bảo hành trọn gói' },
              ].map(item => (
                <span key={item.text}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold border"
                  style={{ background: 'rgba(255,255,255,0.9)', borderColor: '#E2E8F0', color: '#1E293B' }}>
                  <span style={{ color: '#2563EB' }}>{item.icon}</span> {item.text}
                </span>
              ))}
            </div>

            <p className="text-slate-600 text-lg leading-relaxed mb-8">
              Mua <strong>ChatGPT Plus, Claude Pro, Canva, YouTube Premium</strong> và 100+ app premium khác.
              Giá rẻ hơn đến <strong className="text-blue-600">90%</strong> so với mua trực tiếp. Bảo hành tận tâm.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mb-10">
              <Link href="/shop" className="btn-primary py-4 px-8 text-base justify-center"
                style={{ boxShadow: '0 8px 24px rgba(37,99,235,0.3)' }}>
                Xem Tất Cả Sản Phẩm →
              </Link>
              <a href="https://zalo.me/0888993991" className="btn-outline py-4 px-8 text-base justify-center">
                💬 Tư Vấn Zalo
              </a>
            </div>

            <div className="flex flex-wrap items-center gap-5 pt-6 border-t border-slate-200">
              {[
                { icon: '✅', text: 'Bảo hành đăng nhập' },
                { icon: '⚡', text: 'Giao trong 5 phút' },
                { icon: '🔒', text: 'Tài khoản riêng tư' },
              ].map(item => (
                <div key={item.text} className="flex items-center gap-1.5 text-sm text-slate-600 font-medium">
                  {item.icon} {item.text}
                </div>
              ))}
            </div>
          </div>

          {/* Right: floating cards */}
          <div className="hidden lg:block relative h-[460px]">
            {heroCards.map((card, i) => (
              <div key={card.name}
                className={`absolute bg-white rounded-2xl shadow-xl border border-slate-100 p-4 ${card.width}`}
                style={{
                  ...card.pos,
                  transform: card.rotate,
                  animation: `float ${3 + i * 0.8}s ease-in-out infinite`,
                  animationDelay: `${i * 0.4}s`,
                }}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: card.bg }}>
                    {card.logo}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-sm leading-tight">{card.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{card.sub}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-lg font-black" style={{ color: '#2563EB' }}>{formatPrice(card.price)}</span>
                    <span className="text-xs text-slate-400 line-through ml-2">{formatPrice(card.oldPrice)}</span>
                  </div>
                  <span className="text-xs font-bold px-2 py-1 rounded-lg" style={{ background: '#FEE2E2', color: '#991B1B' }}>
                    -{discountPercent(card.price, card.oldPrice)}%
                  </span>
                </div>
              </div>
            ))}
            <div className="absolute top-[45%] right-4 z-10" style={{ animation: 'float 2.5s ease-in-out infinite' }}>
              <div className="bg-blue-600 text-white px-4 py-2.5 rounded-2xl font-bold shadow-xl text-sm flex items-center gap-2">
                ⚡ Giao ngay!
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { value: '5,000+', label: 'Khách hàng tin dùng', icon: '👥' },
            { value: '100+', label: 'Sản phẩm premium', icon: '📦' },
            { value: '99%', label: 'Tỷ lệ hài lòng', icon: '⭐' },
            { value: '< 5 phút', label: 'Thời gian giao hàng', icon: '⚡' },
          ].map(stat => (
            <div key={stat.label} className="bg-white/80 backdrop-blur rounded-2xl p-4 text-center border border-slate-100 shadow-sm">
              <div className="text-2xl mb-1">{stat.icon}</div>
              <p className="text-2xl font-black text-slate-900">{stat.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── CATEGORIES ────────────────────────────────────────────
function CategoriesSection({ categories }: { categories: any[] }) {
  const CAT_CONFIG: Record<string, { color: string; from: string; to: string; icon: React.ReactNode }> = {
    'ai-chatbot': {
      color: '#2563EB', from: '#2563EB', to: '#0891B2',
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <rect x="2" y="4" width="20" height="14" rx="4" fill="white" fillOpacity="0.9"/>
          <circle cx="8" cy="11" r="2" fill="#2563EB"/>
          <circle cx="16" cy="11" r="2" fill="#2563EB"/>
          <path d="M9 15h6" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M8 4V2M16 4V2" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
          <rect x="0" y="8" width="2" height="6" rx="1" fill="white" fillOpacity="0.7"/>
          <rect x="22" y="8" width="2" height="6" rx="1" fill="white" fillOpacity="0.7"/>
        </svg>
      )
    },
    'thiet-ke': {
      color: '#7C3AED', from: '#7C3AED', to: '#A855F7',
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" fill="white" fillOpacity="0.9"/>
          <circle cx="12" cy="12" r="4" fill="#7C3AED" fillOpacity="0.4"/>
          <circle cx="12" cy="6" r="2.5" fill="white"/>
          <circle cx="12" cy="18" r="2.5" fill="white"/>
          <circle cx="6" cy="12" r="2.5" fill="white"/>
          <circle cx="18" cy="12" r="2.5" fill="white"/>
          <circle cx="12" cy="12" r="2" fill="#7C3AED"/>
        </svg>
      )
    },
    'video-am-nhac': {
      color: '#EF4444', from: '#EF4444', to: '#F97316',
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <rect x="2" y="4" width="20" height="14" rx="3" fill="white" fillOpacity="0.9"/>
          <path d="M10 8.5l6 3.5-6 3.5V8.5z" fill="#EF4444"/>
        </svg>
      )
    },
    'hoc-tap': {
      color: '#16A34A', from: '#16A34A', to: '#059669',
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <path d="M12 3L22 8L12 13L2 8L12 3Z" fill="white" fillOpacity="0.9"/>
          <path d="M6 10.5V16c0 2 2.5 4 6 4s6-2 6-4v-5.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="22" y1="8" x2="22" y2="16" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      )
    },
    'giai-tri': {
      color: '#D97706', from: '#D97706', to: '#F59E0B',
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" fill="white" fillOpacity="0.15"/>
          <circle cx="12" cy="12" r="5" fill="white" fillOpacity="0.3"/>
          <circle cx="12" cy="12" r="2" fill="white"/>
          <path d="M12 3v2M12 19v2M3 12h2M19 12h2" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M5.6 5.6l1.4 1.4M16.9 16.9l1.4 1.4M5.6 18.4l1.4-1.4M16.9 7.1l1.4-1.4" stroke="white" strokeWidth="1.2" strokeLinecap="round"/>
        </svg>
      )
    },
    'cong-cu-dev': {
      color: '#0891B2', from: '#0891B2', to: '#0E7490',
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <rect x="2" y="4" width="20" height="14" rx="3" fill="white" fillOpacity="0.15"/>
          <rect x="3" y="5" width="18" height="12" rx="2" fill="white" fillOpacity="0.2"/>
          <path d="M8 10L5 12l3 2" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M12 10l3 2-3 2" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M9 20h6" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      )
    },
  }

  const fallbackConfig = {
    color: '#64748B', from: '#64748B', to: '#94A3B8',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="18" height="18" rx="4" fill="white" fillOpacity="0.9"/>
        <path d="M8 12h8M12 8v8" stroke="#64748B" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    )
  }

  return (
    <section className="max-w-7xl mx-auto px-4 md:px-8 py-16">
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#2563EB' }}>Danh Mục</p>
          <h2 className="text-3xl font-black text-slate-900">Tìm theo loại sản phẩm</h2>
        </div>
        <Link href="/shop" className="text-sm font-semibold flex items-center gap-1 hover:gap-2 transition-all"
          style={{ color: '#2563EB' }}>
          Xem tất cả →
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
        {categories.map(cat => {
          const config = CAT_CONFIG[cat.slug] ?? fallbackConfig
          return (
            <Link key={cat.slug} href={`/shop?category=${cat.slug}`}
              className="group flex flex-col items-center text-center gap-3 p-5 rounded-2xl border border-slate-100 bg-white hover:shadow-md hover:-translate-y-1 transition-all duration-200 cursor-pointer">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200 shadow-sm"
                style={{ background: `linear-gradient(135deg, ${config.from}, ${config.to})` }}>
                {config.icon}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800 group-hover:text-blue-700 transition-colors">{cat.name}</p>
                <p className="text-xs text-slate-400 mt-0.5">{cat.description || 'Premium'}</p>
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
    <section className="pb-16" style={{ background: '#F8FAFC' }}>
      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#2563EB' }}>Nổi Bật</p>
            <h2 className="text-3xl font-black text-slate-900">Sản phẩm bán chạy nhất</h2>
          </div>
          <Link href="/shop" className="text-sm font-semibold flex items-center gap-1 hover:gap-2 transition-all"
            style={{ color: '#2563EB' }}>
            Xem thêm →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {products.map(product => {
            const price = product.price
            const compareAt = product.compare_at_price
            const discount = discountPercent(price, compareAt ?? 0)
            const coverImage = product.product_images?.find((img: any) => img.sort_order === 0)
              ?? product.product_images?.[0] ?? null

            return (
              <Link key={product.id} href={`/product/${product.slug}`}
                className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col">

                {/* Image 16:9 */}
                <div className="relative w-full flex-shrink-0" style={{ paddingTop: '56.25%' }}>
                  <div className="absolute inset-0"
                    style={{ background: 'linear-gradient(145deg, #f0f9ff, #e0f2fe)' }}>
                    {coverImage ? (
                      <img src={coverImage.image_url} alt={coverImage.alt_text ?? product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center opacity-20">
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="#2563EB">
                          <rect x="2" y="4" width="20" height="14" rx="4"/>
                        </svg>
                      </div>
                    )}

                    {product.badge_text && (
                      <div className="absolute top-3 left-3">
                        <span className="text-xs font-bold px-2.5 py-1 rounded-lg text-white shadow-sm"
                          style={{
                            background: product.badge_text === 'Hot' ? '#EF4444' :
                              product.badge_text === 'Mới' ? '#22C55E' : '#F97316'
                          }}>
                          {product.badge_text}
                        </span>
                      </div>
                    )}
                    {discount >= 10 && (
                      <div className="absolute top-3 right-3">
                        <span className="text-xs font-black px-2.5 py-1 rounded-lg"
                          style={{ background: '#FEF9C3', color: '#854D0E' }}>
                          -{discount}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col flex-1 p-4 gap-1.5">
                  {product.categories && (
                    <span className="text-xs font-bold" style={{ color: '#2563EB' }}>
                      {product.categories.name}
                    </span>
                  )}
                  <h3 className="font-bold text-slate-900 line-clamp-2 leading-snug group-hover:text-blue-700 transition-colors">
                    {product.name}
                  </h3>
                  {product.short_description && (
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed flex-1">
                      {product.short_description}
                    </p>
                  )}
                  <div className="flex items-center justify-between pt-3 mt-auto border-t border-slate-100">
                    <div>
                      <span className="text-xl font-black" style={{ color: '#2563EB' }}>{formatPrice(price)}</span>
                      {compareAt && compareAt > price && (
                        <span className="text-xs text-slate-400 line-through ml-2">{formatPrice(compareAt)}</span>
                      )}
                    </div>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full"
                      style={{ background: '#DCFCE7', color: '#166534' }}>
                      <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: '#22C55E' }} />
                      Còn hàng
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

// ── WHY APPXANH ───────────────────────────────────────────
function WhySection() {
  const features = [
    {
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="white" stroke="white" strokeWidth="0.5" strokeLinejoin="round"/>
        </svg>
      ),
      title: 'Giao Hàng Tức Thì',
      desc: 'Nhận tài khoản ngay sau khi admin xác nhận thanh toán. Không cần chờ đợi lâu.',
      highlight: '< 5 phút',
      from: '#2563EB', to: '#0891B2',
    },
    {
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <path d="M12 2L3 7v6c0 5.25 3.75 10.15 9 11.25C17.25 23.15 21 18.25 21 13V7L12 2z" fill="white" fillOpacity="0.9"/>
          <path d="M9 12l2 2 4-4" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      title: 'Bảo Hành Tận Tâm',
      desc: 'Cam kết hoàn tiền hoặc đổi tài khoản mới nếu không đăng nhập được lần đầu.',
      highlight: '100% bảo hành',
      from: '#16A34A', to: '#059669',
    },
    {
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" fill="white" fillOpacity="0.2"/>
          <path d="M16 12H8M8 12l3-3M8 12l3 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="12" cy="12" r="9" stroke="white" strokeWidth="1.5"/>
        </svg>
      ),
      title: 'Giá Rẻ Nhất',
      desc: 'Tiết kiệm đến 90% so với mua trực tiếp. Cập nhật giá liên tục, cạnh tranh nhất.',
      highlight: 'Tiết kiệm 90%',
      from: '#D97706', to: '#F59E0B',
    },
    {
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.51 12 19.79 19.79 0 01.48 3.42 2 2 0 012.46 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 8.64a16 16 0 006.29 6.29l.91-.91a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" fill="white" fillOpacity="0.9"/>
        </svg>
      ),
      title: 'Hỗ Trợ Zalo 24/7',
      desc: 'Đội ngũ CSKH hỗ trợ tận tình qua Zalo. Phản hồi nhanh trong vòng vài phút.',
      highlight: '8:00 - 22:00',
      from: '#7C3AED', to: '#A855F7',
    },
  ]

  return (
    <section className="py-20 px-4" style={{ background: 'linear-gradient(135deg, #1e40af 0%, #0891b2 100%)' }}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-blue-200 text-xs font-bold uppercase tracking-widest mb-3">Tại Sao Chọn App Xanh</p>
          <h2 className="text-3xl md:text-4xl font-black text-white mb-3">Mua app xịn, giá không xịn</h2>
          <p className="text-blue-100 max-w-xl mx-auto">
            Hàng nghìn khách hàng đã tiết kiệm hàng triệu đồng mỗi năm khi mua qua App Xanh
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map(item => (
            <div key={item.title} className="rounded-2xl p-6 group hover:scale-[1.02] transition-all"
              style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.15)' }}>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 shadow-sm"
                style={{ background: `linear-gradient(135deg, ${item.from}, ${item.to})` }}>
                {item.icon}
              </div>
              <div className="text-xs font-bold px-2.5 py-1 rounded-full mb-3 inline-block"
                style={{ background: 'rgba(255,255,255,0.15)', color: 'white' }}>
                {item.highlight}
              </div>
              <h3 className="text-white font-bold text-lg mb-2">{item.title}</h3>
              <p className="text-blue-100 text-sm leading-relaxed">{item.desc}</p>
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
    {
      step: '01', icon: '🛒', title: 'Chọn sản phẩm',
      desc: 'Duyệt qua 100+ tài khoản premium. Chọn gói phù hợp với nhu cầu và xem mô tả chi tiết.',
      color: '#2563EB', bg: '#EFF6FF',
    },
    {
      step: '02', icon: '💳', title: 'Thanh toán QR',
      desc: 'Quét mã VietQR, chuyển khoản nhanh qua ACB. Xác nhận trong vài giây.',
      color: '#7C3AED', bg: '#F5F3FF',
    },
    {
      step: '03', icon: '📦', title: 'Nhận tài khoản',
      desc: 'Admin giao tài khoản ngay sau khi xác nhận. Thường trong vòng 5 phút.',
      color: '#16A34A', bg: '#F0FDF4',
    },
    {
      step: '04', icon: '🎉', title: 'Dùng & bảo hành',
      desc: 'Đăng nhập ngay. Có vấn đề? Bảo hành miễn phí, hỗ trợ Zalo 8:00-22:00.',
      color: '#D97706', bg: '#FFFBEB',
    },
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
              <div className="absolute -top-4 -right-4 text-8xl font-black opacity-[0.04] select-none"
                style={{ color: step.color }}>{step.step}</div>
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
function ReviewsSection() {
  const reviews = [
    { name: 'Nguyễn Minh Tuấn', role: 'Freelance Designer', rating: 5, color: '#7C3AED',
      text: 'Mua Canva Pro giá rẻ hơn 10 lần so với mua trực tiếp. Tài khoản ổn định, dùng 6 tháng chưa có vấn đề gì. Rất recommend!',
      product: 'Canva Pro 1 Năm' },
    { name: 'Trần Thị Lan', role: 'Content Creator', rating: 5, color: '#10A37F',
      text: 'ChatGPT Plus Business xịn lắm, có đầy đủ GPT-5.2 và DALL-E. Admin hỗ trợ rất nhiệt tình, giao hàng siêu nhanh!',
      product: 'ChatGPT Plus Business' },
    { name: 'Lê Hoàng Nam', role: 'Marketing Manager', rating: 5, color: '#FF0000',
      text: 'Đã mua YouTube Premium và Claude Pro. Cả 2 đều chất lượng, giá rẻ bất ngờ. Sẽ tiếp tục ủng hộ App Xanh!',
      product: 'YouTube Premium' },
    { name: 'Phạm Thị Hoa', role: 'Sinh viên', rating: 5, color: '#2563EB',
      text: 'Sinh viên như mình cần tiết kiệm nên App Xanh là lựa chọn hoàn hảo. Mua ChatGPT Go chỉ 200k dùng cả năm, quá ngon!',
      product: 'ChatGPT Go 1 Năm' },
    { name: 'Võ Đình Khoa', role: 'Developer', rating: 5, color: '#0891B2',
      text: 'GitHub Copilot Pro mua ở đây rẻ hơn nhiều. Code xịn hẳn lên, tiết kiệm thời gian cực kỳ. Có bảo hành đàng hoàng.',
      product: 'GitHub Copilot Pro' },
    { name: 'Đặng Thu Hương', role: 'Entrepreneur', rating: 5, color: '#EA580C',
      text: 'Mua nhiều lần rồi, lần nào cũng ổn. Giá tốt, service tốt, tài khoản bền. Đã giới thiệu cho cả team!',
      product: 'Adobe CC + Canva' },
  ]

  return (
    <section className="py-20 px-4" style={{ background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #f0fdf4 100%)' }}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#2563EB' }}>Đánh Giá</p>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-3">Khách hàng nói gì?</h2>
          <div className="flex items-center justify-center gap-2">
            <div className="flex">
              {[1,2,3,4,5].map(s => (
                <svg key={s} className="w-5 h-5" fill="#F59E0B" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
              ))}
            </div>
            <span className="font-bold text-slate-900">5.0</span>
            <span className="text-slate-500 text-sm">/ 500+ đánh giá</span>
          </div>
        </div>

        {/* Scrollable reviews */}
        <div className="overflow-x-auto pb-4 -mx-4 px-4"
          style={{ scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' }}>
          <div className="flex gap-4" style={{ width: 'max-content' }}>
            {reviews.map((review, i) => (
              <div key={i}
                className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all flex-shrink-0 flex flex-col"
                style={{ width: '300px', scrollSnapAlign: 'start' }}>
                <div className="flex mb-3">
                  {[1,2,3,4,5].map(s => (
                    <svg key={s} className="w-4 h-4" fill="#F59E0B" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                  ))}
                </div>
                <p className="text-slate-600 text-sm leading-relaxed flex-1 mb-4">"{review.text}"</p>
                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-black flex-shrink-0"
                      style={{ background: `linear-gradient(135deg, ${review.color}, #0891B2)` }}>
                      {review.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{review.name}</p>
                      <p className="text-xs text-slate-400">{review.role}</p>
                    </div>
                  </div>
                </div>
                <div className="mt-2">
                  <span className="text-xs px-2 py-1 rounded-full font-semibold"
                    style={{ background: '#F1F5F9', color: '#475569' }}>
                    {review.product}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 mt-3">← Vuốt để xem thêm đánh giá →</p>

        {/* Trust stats */}
        <div className="mt-10 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {[
              { icon: '🏆', value: '5,000+', label: 'Đơn hàng thành công' },
              { icon: '⭐', value: '5.0/5', label: 'Điểm đánh giá TB' },
              { icon: '🔄', value: '95%', label: 'Khách quay lại' },
              { icon: '💬', value: '< 2 phút', label: 'Thời gian phản hồi' },
            ].map(item => (
              <div key={item.label}>
                <div className="text-2xl mb-1">{item.icon}</div>
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
    <section className="py-20 bg-white px-4">
      <div className="max-w-4xl mx-auto">
        <div className="rounded-3xl p-10 md:p-14 text-center relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #1e40af 0%, #0891b2 50%, #059669 100%)' }}>
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(circle at 30% 50%, rgba(255,255,255,0.08), transparent 60%)' }} />
          <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, white, transparent)' }} />

          <div className="relative">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold mb-5"
              style={{ background: 'rgba(255,255,255,0.15)', color: 'white' }}>
              ⚡ Giao hàng tự động 24/7
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
              Sẵn sàng tiết kiệm đến 90%?
            </h2>
            <p className="text-blue-100 text-lg mb-8 max-w-xl mx-auto">
              Hàng trăm sản phẩm premium đang chờ bạn với mức giá không thể tin được.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/shop"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-bold text-base bg-white transition-all hover:bg-blue-50"
                style={{ color: '#1D4ED8' }}>
                Xem Sản Phẩm Ngay →
              </Link>
              <a href="https://zalo.me/0888993991"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-bold text-base border-2 border-white text-white transition-all hover:bg-white/10">
                💬 Chat Zalo Ngay
              </a>
            </div>
            <div className="mt-8 flex flex-wrap justify-center gap-6 text-blue-100 text-sm">
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