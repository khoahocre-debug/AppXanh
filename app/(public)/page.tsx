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

  const { data: allProducts } = await supabase
    .from('products')
    .select(`*, product_images(*)`)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(3)

  return (
    <div className="overflow-x-hidden">
      <HeroSection featuredProducts={allProducts ?? []} />
      <StatsSection />
      <FeaturedProducts products={products ?? []} />
      <HowItWorksSection />
      <ReviewsSection />
      <CtaSection />
    </div>
  )
}

// ── Hero ──────────────────────────────────────────────────
function HeroSection({ featuredProducts }: { featuredProducts: any[] }) {
  const heroCards = [
    {
      name: 'ChatGPT Plus Business',
      sub: 'GPT-5.2 · DALL-E · Sora',
      price: 99000,
      oldPrice: 620000,
      logo: (
        <svg viewBox="0 0 41 41" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8">
          <path d="M37.532 16.87a9.963 9.963 0 0 0-.856-8.184 10.078 10.078 0 0 0-10.855-4.835 9.964 9.964 0 0 0-6.239-3.746 10.078 10.078 0 0 0-9.413 3.632 9.963 9.963 0 0 0-3.735 6.176A10.078 10.078 0 0 0 .908 20.07a9.963 9.963 0 0 0 .856 8.185 10.078 10.078 0 0 0 10.855 4.835 9.964 9.964 0 0 0 6.239 3.746 10.078 10.078 0 0 0 9.414-3.632 9.963 9.963 0 0 0 3.734-6.176 10.078 10.078 0 0 0-4.474-10.158zM22.016 37.422a7.474 7.474 0 0 1-4.799-1.735c.061-.033.168-.091.237-.134l7.964-4.6a1.294 1.294 0 0 0 .655-1.134V19.054l3.366 1.944a.12.12 0 0 1 .066.092v9.299a7.505 7.505 0 0 1-7.49 7.033zM6.1 31.14a7.471 7.471 0 0 1-.894-5.023c.06.036.162.099.237.141l7.964 4.6a1.297 1.297 0 0 0 1.308 0l9.724-5.614v3.888a.12.12 0 0 1-.048.103L16.323 34.2A7.505 7.505 0 0 1 6.1 31.14zm-1.986-16.32A7.474 7.474 0 0 1 8.023 10.8c0 .068-.004.19-.004.274v9.201a1.294 1.294 0 0 0 .654 1.132l9.723 5.614-3.366 1.944a.12.12 0 0 1-.114.012L7.044 24.3a7.504 7.504 0 0 1-2.93-9.48zm27.658 6.437l-9.724-5.615 3.367-1.943a.121.121 0 0 1 .114-.012l7.872 4.547a7.505 7.505 0 0 1-1.158 13.528v-9.476a1.293 1.293 0 0 0-.471-1.029zm3.35-5.043c-.059-.037-.162-.099-.236-.141l-7.965-4.6a1.298 1.298 0 0 0-1.308 0l-9.723 5.614v-3.888a.12.12 0 0 1 .048-.103l7.867-4.542a7.505 7.505 0 0 1 11.317 7.66zm-21.063 6.929l-3.367-1.944a.12.12 0 0 1-.065-.092v-9.299a7.505 7.505 0 0 1 12.293-5.756 6.94 6.94 0 0 0-.236.134l-7.965 4.6a1.294 1.294 0 0 0-.654 1.132l-.006 11.225zm1.829-3.943l4.33-2.501 4.332 2.497v4.998l-4.331 2.5-4.331-2.5z" fill="currentColor"/>
        </svg>
      ),
      color: '#10A37F', bg: '#E8F7F3',
    },
    {
      name: 'YouTube Premium 1 Năm',
      sub: 'Không quảng cáo',
      price: 500000,
      oldPrice: 900000,
      logo: (
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" fill="#FF0000"/>
        </svg>
      ),
      color: '#FF0000', bg: '#FFF0F0',
    },
    {
      name: 'Canva Pro 1 Năm',
      sub: '100M+ templates',
      price: 150000,
      oldPrice: 1400000,
      logo: (
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8">
          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm-.55 16.742c-.606 0-1.162-.098-1.669-.294-.507-.196-.944-.482-1.313-.857-.368-.375-.655-.83-.862-1.366C7.4 13.69 7.3 13.088 7.3 12.42c0-.668.1-1.27.3-1.806.2-.536.486-.991.857-1.366.37-.375.81-.661 1.318-.857.508-.196 1.063-.294 1.668-.294.438 0 .85.06 1.238.18.388.12.735.29 1.04.513.308.222.558.49.75.806.194.315.316.67.37 1.062h-1.73c-.064-.375-.23-.664-.5-.866-.27-.202-.613-.303-1.03-.303-.293 0-.558.052-.794.156-.235.104-.436.254-.604.45-.167.196-.297.436-.387.72-.09.284-.135.606-.135.966 0 .365.046.692.135.98.09.287.22.531.387.732.167.2.37.354.604.46.236.105.5.157.794.157.44 0 .8-.112 1.08-.337.28-.225.452-.534.518-.927h1.73c-.056.395-.177.747-.363 1.057-.186.31-.43.572-.73.787-.3.214-.645.378-1.032.49-.388.112-.81.168-1.264.168zm6.54-.12h-1.72V9.35h1.72v7.272zm-.86-8.4c-.284 0-.516-.093-.698-.279-.182-.185-.273-.413-.273-.682 0-.27.09-.497.273-.683.182-.186.414-.279.698-.279s.516.093.698.279c.182.186.273.413.273.683 0 .269-.09.497-.273.682-.182.186-.414.28-.698.28z" fill="#7D2AE8"/>
        </svg>
      ),
      color: '#7D2AE8', bg: '#F3EEFF',
    },
  ]

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 40%, #f0fdf4 100%)' }}>

      {/* Background blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-1/4 w-96 h-96 rounded-full opacity-20 blur-3xl"
          style={{ background: 'radial-gradient(circle, #3B82F6, transparent)' }} />
        <div className="absolute bottom-20 right-1/4 w-80 h-80 rounded-full opacity-15 blur-3xl"
          style={{ background: 'radial-gradient(circle, #06B6D4, transparent)' }} />
        <div className="absolute top-1/2 left-10 w-64 h-64 rounded-full opacity-10 blur-3xl"
          style={{ background: 'radial-gradient(circle, #818CF8, transparent)' }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-20 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Left */}
          <div>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold mb-6 border"
              style={{ background: 'rgba(255,255,255,0.8)', borderColor: '#BFDBFE', color: '#1D4ED8' }}>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: '#22C55E' }} />
                <span className="relative inline-flex h-2 w-2 rounded-full" style={{ background: '#22C55E' }} />
              </span>
              Giao hàng tự động 24/7 — Không cần chờ đợi
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 leading-tight mb-6">
              Kho Tài Khoản<br />
              Premium{' '}
              <span className="gradient-text">Giá Xanh</span>
            </h1>

            {/* Feature pills */}
            <div className="flex flex-wrap gap-2 mb-6">
              {[
                { icon: '✓', text: 'Tài Khoản Ổn Định' },
                { icon: '⚡', text: 'Thanh toán có liền' },
                { icon: '🛡️', text: 'Bảo hành trọn gói' },
              ].map(item => (
                <span key={item.text}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold border"
                  style={{ background: 'rgba(255,255,255,0.9)', borderColor: '#E2E8F0', color: '#1E293B' }}>
                  <span>{item.icon}</span> {item.text}
                </span>
              ))}
            </div>

            <p className="text-slate-600 text-lg leading-relaxed mb-8">
              Mua <strong>ChatGPT Plus, Claude Pro, Canva, YouTube Premium</strong> và 100+ app premium khác.
              Giá rẻ hơn đến <strong className="text-blue-600">90%</strong> so với mua trực tiếp.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/shop"
                className="btn-primary py-4 px-8 text-base justify-center"
                style={{ boxShadow: '0 8px 24px rgba(37,99,235,0.35)' }}>
                Xem Tất Cả Sản Phẩm →
              </Link>
              <a href="https://zalo.me/0888993991" target="_blank"
                className="btn-outline py-4 px-8 text-base justify-center">
                💬 Tư Vấn Zalo
              </a>
            </div>

            {/* Trust row */}
            <div className="flex flex-wrap items-center gap-4 mt-8 pt-8 border-t border-slate-200">
              {[
                { icon: '✅', text: 'Bảo hành đăng nhập' },
                { icon: '⚡', text: 'Giao trong 5 phút' },
                { icon: '🔒', text: 'Tài khoản riêng tư' },
              ].map(item => (
                <div key={item.text} className="flex items-center gap-1.5 text-sm text-slate-600 font-medium">
                  <span>{item.icon}</span> {item.text}
                </div>
              ))}
            </div>
          </div>

          {/* Right: floating product cards */}
          <div className="relative h-96 lg:h-auto hidden lg:block">
            <div className="relative w-full h-[480px]">
              {heroCards.map((card, i) => (
                <div key={card.name}
                  className="absolute bg-white rounded-2xl shadow-xl border border-slate-100 p-4 w-64"
                  style={{
                    top: i === 0 ? '0%' : i === 1 ? '35%' : '68%',
                    left: i === 0 ? '30%' : i === 1 ? '0%' : '35%',
                    animation: `float ${3 + i * 0.7}s ease-in-out infinite`,
                    animationDelay: `${i * 0.5}s`,
                    zIndex: 3 - i,
                  }}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: card.bg, color: card.color }}>
                      {card.logo}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm leading-tight">{card.name}</p>
                      <p className="text-xs text-slate-400">{card.sub}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-lg font-black" style={{ color: '#2563EB' }}>
                        {formatPrice(card.price)}
                      </span>
                      <span className="text-xs text-slate-400 line-through ml-2">
                        {formatPrice(card.oldPrice)}
                      </span>
                    </div>
                    <span className="text-xs font-bold px-2 py-1 rounded-lg"
                      style={{ background: '#FEE2E2', color: '#991B1B' }}>
                      -{discountPercent(card.price, card.oldPrice)}%
                    </span>
                  </div>
                </div>
              ))}

              {/* Giao ngay button */}
              <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10"
                style={{ animation: 'float 2.5s ease-in-out infinite' }}>
                <div className="bg-blue-600 text-white px-5 py-3 rounded-2xl font-bold shadow-xl text-sm flex items-center gap-2">
                  ⚡ Giao ngay!
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ── Stats ─────────────────────────────────────────────────
function StatsSection() {
  const stats = [
    { value: '1,200+', label: 'Khách hàng tin dùng', icon: '👥' },
    { value: '50+', label: 'Sản phẩm premium', icon: '📦' },
    { value: '99%', label: 'Tỷ lệ hài lòng', icon: '⭐' },
    { value: '< 5 phút', label: 'Thời gian giao hàng', icon: '⚡' },
  ]
  return (
    <section className="py-12 border-y border-slate-200" style={{ background: 'white' }}>
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map(stat => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl mb-1">{stat.icon}</div>
              <p className="text-2xl md:text-3xl font-black text-slate-900">{stat.value}</p>
              <p className="text-sm text-slate-500 mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Featured Products ─────────────────────────────────────
function FeaturedProducts({ products }: { products: any[] }) {
  if (products.length === 0) return null

  return (
    <section className="py-16 md:py-20" style={{ background: '#F8FAFC' }}>
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="text-center mb-10">
          <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#2563EB' }}>
            Sản Phẩm Nổi Bật
          </p>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900">
            Được Mua Nhiều Nhất
          </h2>
          <p className="text-slate-500 mt-2">Chất lượng đảm bảo, giá tốt nhất thị trường</p>
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
                className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300">

                {/* Image 16:9 */}
                <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
                  <div className="absolute inset-0"
                    style={{ background: 'linear-gradient(145deg, #f0f9ff, #e0f2fe)' }}>
                    {coverImage ? (
                      <img src={coverImage.image_url} alt={coverImage.alt_text ?? product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-6xl opacity-30">🤖</div>
                    )}
                    {product.badge_text && (
                      <div className="absolute top-3 left-3">
                        <span className="text-xs font-bold px-2.5 py-1 rounded-lg text-white shadow"
                          style={{ background: product.badge_text === 'Hot' ? '#EF4444' : product.badge_text === 'Mới' ? '#22C55E' : '#F97316' }}>
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

                <div className="p-4">
                  <p className="font-bold text-slate-900 line-clamp-2 leading-snug mb-1 group-hover:text-blue-700 transition-colors">
                    {product.name}
                  </p>
                  {product.short_description && (
                    <p className="text-xs text-slate-500 line-clamp-2 mb-3">{product.short_description}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xl font-black" style={{ color: '#2563EB' }}>{formatPrice(price)}</span>
                      {compareAt && compareAt > price && (
                        <span className="text-xs text-slate-400 line-through ml-2">{formatPrice(compareAt)}</span>
                      )}
                    </div>
                    <span className="text-xs font-semibold px-2 py-1 rounded-full"
                      style={{ background: '#DCFCE7', color: '#166534' }}>
                      ● Còn hàng
                    </span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        <div className="text-center mt-8">
          <Link href="/shop"
            className="btn-primary px-8 py-3.5 text-base"
            style={{ boxShadow: '0 4px 16px rgba(37,99,235,0.25)' }}>
            Xem Tất Cả Sản Phẩm →
          </Link>
        </div>
      </div>
    </section>
  )
}

// ── How It Works ──────────────────────────────────────────
function HowItWorksSection() {
  const steps = [
    {
      step: '01',
      icon: '🔍',
      title: 'Chọn sản phẩm',
      desc: 'Duyệt qua 50+ tài khoản premium. Chọn gói phù hợp với nhu cầu.',
      color: '#2563EB', bg: '#EFF6FF',
    },
    {
      step: '02',
      icon: '💳',
      title: 'Thanh toán QR',
      desc: 'Quét mã VietQR, chuyển khoản nhanh. Xác nhận trong vài giây.',
      color: '#7C3AED', bg: '#F5F3FF',
    },
    {
      step: '03',
      icon: '📦',
      title: 'Nhận tài khoản',
      desc: 'Admin giao tài khoản ngay sau khi xác nhận. Thường dưới 5 phút.',
      color: '#16A34A', bg: '#F0FDF4',
    },
    {
      step: '04',
      icon: '✅',
      title: 'Sử dụng & bảo hành',
      desc: 'Đăng nhập ngay. Có vấn đề? Bảo hành miễn phí, hỗ trợ Zalo 24/7.',
      color: '#D97706', bg: '#FFFBEB',
    },
  ]

  return (
    <section className="py-16 md:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="text-center mb-12">
          <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#2563EB' }}>Quy Trình</p>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900">
            Mua Hàng Đơn Giản 4 Bước
          </h2>
          <p className="text-slate-500 mt-2">Từ lúc chọn đến lúc dùng chưa đến 10 phút</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <div key={step.step} className="relative">
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-10 left-full w-full h-0.5 z-0"
                  style={{ background: 'linear-gradient(to right, #CBD5E1, transparent)' }} />
              )}
              <div className="relative z-10 text-center p-6 rounded-2xl border border-slate-100 hover:shadow-md transition-all"
                style={{ background: '#FAFAFA' }}>
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4"
                  style={{ background: step.bg }}>
                  {step.icon}
                </div>
                <div className="text-xs font-black mb-2" style={{ color: step.color }}>{step.step}</div>
                <h3 className="font-bold text-slate-900 mb-2">{step.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Reviews ───────────────────────────────────────────────
function ReviewsSection() {
  const reviews = [
    { name: 'Nguyễn Minh Tuấn', avatar: 'N', role: 'Freelance Designer', rating: 5, text: 'Mua Canva Pro giá rẻ hơn 10 lần so với mua trực tiếp. Tài khoản ổn định, dùng được 6 tháng chưa có vấn đề gì. Rất recommend!', product: 'Canva Pro 1 Năm', color: '#7C3AED' },
    { name: 'Trần Thị Lan', avatar: 'T', role: 'Content Creator', rating: 5, text: 'ChatGPT Plus Business xịn lắm, có đầy đủ GPT-5.2 và DALL-E. Admin hỗ trợ rất nhiệt tình, giao hàng siêu nhanh luôn.', product: 'ChatGPT Plus Business', color: '#10A37F' },
    { name: 'Lê Hoàng Nam', avatar: 'L', role: 'Marketing Manager', rating: 5, text: 'Đã mua YouTube Premium và Claude Pro. Cả 2 đều chất lượng, giá rẻ bất ngờ. Sẽ tiếp tục ủng hộ App Xanh!', product: 'YouTube Premium', color: '#FF0000' },
    { name: 'Phạm Thị Hoa', avatar: 'P', role: 'Sinh viên', rating: 5, text: 'Sinh viên như mình cần tiết kiệm nên App Xanh là lựa chọn hoàn hảo. Mua ChatGPT Go chỉ 200k mà dùng cả năm, quá ngon!', product: 'ChatGPT Go 1 Năm', color: '#2563EB' },
    { name: 'Võ Đình Khoa', avatar: 'V', role: 'Developer', rating: 5, text: 'GitHub Copilot Pro mua ở đây rẻ hơn nhiều. Code xịn hẳn lên, tiết kiệm thời gian cực kỳ. Admin giao nhanh, có bảo hành đàng hoàng.', product: 'GitHub Copilot Pro', color: '#0891B2' },
    { name: 'Đặng Thu Hương', avatar: 'Đ', role: 'Entrepreneur', rating: 5, text: 'Mua nhiều lần rồi, lần nào cũng ổn. Giá tốt, service tốt, tài khoản bền. Đã giới thiệu cho cả team dùng!', product: 'Adobe CC + Canva', color: '#EA580C' },
  ]

  return (
    <section className="py-16 md:py-20" style={{ background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #f0fdf4 100%)' }}>
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="text-center mb-12">
          <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#2563EB' }}>Đánh Giá</p>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900">
            Khách Hàng Nói Gì?
          </h2>
          <div className="flex items-center justify-center gap-2 mt-3">
            <div className="flex">
              {[1,2,3,4,5].map(s => (
                <svg key={s} className="w-5 h-5" fill="#F59E0B" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
              ))}
            </div>
            <span className="font-bold text-slate-900">5.0</span>
            <span className="text-slate-500 text-sm">/ 200+ đánh giá</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {reviews.map((review, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all">
              {/* Stars */}
              <div className="flex mb-3">
                {[1,2,3,4,5].map(s => (
                  <svg key={s} className="w-4 h-4" fill="#F59E0B" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                ))}
              </div>

              <p className="text-slate-700 text-sm leading-relaxed mb-4">"{review.text}"</p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                    style={{ background: `linear-gradient(135deg, ${review.color}, #0891B2)` }}>
                    {review.avatar}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-sm">{review.name}</p>
                    <p className="text-xs text-slate-400">{review.role}</p>
                  </div>
                </div>
                <span className="text-xs px-2 py-1 rounded-full font-semibold flex-shrink-0"
                  style={{ background: '#F1F5F9', color: '#475569' }}>
                  {review.product}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom trust bar */}
        <div className="mt-12 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {[
              { icon: '🏆', value: '1,200+', label: 'Đơn hàng thành công' },
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
    <section className="py-16 md:py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <div className="rounded-3xl p-10 md:p-14 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #1D4ED8 0%, #0891B2 100%)' }}>

          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -top-10 -right-10 w-64 h-64 rounded-full"
              style={{ background: 'radial-gradient(circle, white, transparent)' }} />
            <div className="absolute -bottom-10 -left-10 w-64 h-64 rounded-full"
              style={{ background: 'radial-gradient(circle, white, transparent)' }} />
          </div>

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold mb-5 text-blue-900"
              style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}>
              ⚡ Giao hàng tự động 24/7
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
              Sẵn sàng tiết kiệm đến 90%?
            </h2>
            <p className="text-blue-100 text-lg mb-8 max-w-xl mx-auto">
              Hàng trăm khách hàng đã tin dùng App Xanh. Tham gia ngay hôm nay!
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/shop"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-bold text-base bg-white transition-all hover:bg-blue-50"
                style={{ color: '#1D4ED8' }}>
                🛍️ Mua Ngay
              </Link>
              <a href="https://zalo.me/0888993991" target="_blank"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-bold text-base border-2 border-white text-white transition-all hover:bg-white/10">
                💬 Chat Zalo
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}