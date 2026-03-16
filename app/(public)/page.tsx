import Link from 'next/link'
import { ArrowRight, CheckCircle2, Star, Zap, Shield, HeadphonesIcon, TrendingDown, Clock, Award } from 'lucide-react'

const PRODUCTS = [
  { name: 'ChatGPT Plus Business', price: '99.000đ', original: '620.000đ', discount: 84, badge: '🔥 Hot', category: 'AI Chatbot', emoji: '🤖', slug: 'chatgpt-plus-business', desc: 'GPT-5.2 đầy đủ, DALL-E, Sora, AI Agent' },
  { name: 'Claude Pro 1 Tháng', price: '350.000đ', original: '620.000đ', discount: 43, badge: '⭐ Mới', category: 'AI Chatbot', emoji: '🧠', slug: 'claude-pro-1-thang', desc: 'Claude 4.5, nâng cấp chính chủ trên email của bạn' },
  { name: 'YouTube Premium 1 Năm', price: '500.000đ', original: '900.000đ', discount: 44, badge: '🎬 Hot', category: 'Giải Trí', emoji: '▶️', slug: 'youtube-premium-1-nam', desc: 'Xem không quảng cáo, YouTube Music, tải offline' },
  { name: 'ChatGPT Go 1 Năm', price: '200.000đ', original: '1.600.000đ', discount: 87, badge: '💰 Rẻ nhất', category: 'AI Chatbot', emoji: '🤖', slug: 'chatgpt-go-1-nam', desc: 'Email riêng tư, Thinking cơ bản, duyệt web' },
  { name: 'Canva Pro 1 Năm', price: '150.000đ', original: '1.400.000đ', discount: 89, badge: '🎨 Bán chạy', category: 'Thiết Kế', emoji: '🎨', slug: 'canva-pro-1-nam', desc: '100M+ template, xóa nền, Magic AI đầy đủ' },
  { name: 'GitHub Copilot Pro', price: '180.000đ', original: '400.000đ', discount: 55, badge: '💻 Dev', category: 'Công Cụ Dev', emoji: '💻', slug: 'github-copilot-pro-1-thang', desc: 'AI code completion, chat trong IDE' },
]

const CATEGORIES = [
  { name: 'AI Chatbot', emoji: '🤖', count: 12, color: 'from-blue-500 to-blue-600', slug: 'ai-chatbot' },
  { name: 'Thiết Kế', emoji: '🎨', count: 8, color: 'from-purple-500 to-purple-600', slug: 'thiet-ke' },
  { name: 'Video & Nhạc', emoji: '🎬', count: 6, color: 'from-red-500 to-red-600', slug: 'video-am-nhac' },
  { name: 'Học Tập', emoji: '📚', count: 10, color: 'from-green-500 to-green-600', slug: 'hoc-tap' },
  { name: 'Giải Trí', emoji: '🎵', count: 7, color: 'from-yellow-500 to-orange-500', slug: 'giai-tri' },
  { name: 'Công Cụ Dev', emoji: '💻', count: 9, color: 'from-cyan-500 to-cyan-600', slug: 'cong-cu-dev' },
]

const REVIEWS = [
  { name: 'Minh Tuấn', avatar: '👨‍💻', rating: 5, text: 'Mua ChatGPT Plus ở đây rẻ hơn nhiều so với mua trực tiếp. Giao hàng cực nhanh, chỉ vài phút là có tài khoản!', product: 'ChatGPT Plus Business' },
  { name: 'Thanh Hà', avatar: '👩‍🎨', rating: 5, text: 'Canva Pro giá chỉ 150k mà dùng được cả năm, quá xịn! Shop hỗ trợ tận tình qua Zalo khi có thắc mắc.', product: 'Canva Pro 1 Năm' },
  { name: 'Hoàng Long', avatar: '👨‍🏫', rating: 5, text: 'YouTube Premium không quảng cáo nghe nhạc thoải mái. Đã mua lần 2 rồi, uy tín lắm!', product: 'YouTube Premium' },
  { name: 'Thu Phương', avatar: '👩‍💼', rating: 5, text: 'Claude Pro code đỉnh hơn ChatGPT nhiều. Shop nâng cấp lên email mình luôn, không phải dùng chung với ai.', product: 'Claude Pro' },
]

export default function HomePage() {
  return (
    <>
      {/* ═══════════════════════════════════
          HERO SECTION
      ═══════════════════════════════════ */}
      <section className="relative overflow-hidden py-20 md:py-28 px-4"
        style={{ background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 30%, #f0fdf4 70%, #f8fafc 100%)' }}>

        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-30 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, #3b82f6, transparent)' }} />
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full opacity-20 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, #06b6d4, transparent)' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-10 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, #8b5cf6, transparent)' }} />

        <div className="relative max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* Left text */}
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 text-sm font-semibold"
                style={{ background: '#dbeafe', color: '#1d4ed8', border: '1px solid #bfdbfe' }}>
                <span className="w-2 h-2 bg-green-500 rounded-full" style={{ animation: 'pulse 2s infinite' }} />
                Giao hàng tự động 24/7 — Không cần chờ đợi
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[1.1] mb-6"
                style={{ color: '#0f172a', fontFamily: 'Sora, sans-serif' }}>
                Tài khoản số
                <br />
                <span className="gradient-text">giá xanh</span>
                <br />
                <span style={{ fontSize: '0.85em' }}>dùng ổn định</span>
              </h1>

              <p className="text-lg text-slate-500 mb-8 leading-relaxed max-w-lg">
                Mua <strong>ChatGPT Plus, Claude Pro, Canva, YouTube Premium</strong> và 100+ app premium khác.
                Giá rẻ hơn đến <strong className="text-blue-600">90%</strong> so với mua trực tiếp. Bảo hành tận tâm.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mb-10">
                <Link href="/shop" className="btn-primary text-base px-8 py-4">
                  Xem Tất Cả Sản Phẩm <ArrowRight size={18} />
                </Link>
                <a href="https://zalo.me/0888993991" className="btn-outline text-base px-8 py-4">
                  💬 Tư Vấn Zalo
                </a>
              </div>

              {/* Trust indicators */}
              <div className="flex flex-wrap gap-4">
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
            <div className="hidden lg:block relative h-[420px]">
              {/* Main card */}
              <div className="absolute top-0 right-0 w-72 card p-5 shadow-xl"
                style={{ transform: 'rotate(2deg)' }}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
                    style={{ background: 'linear-gradient(135deg, #dbeafe, #e0f2fe)' }}>🤖</div>
                  <div>
                    <p className="font-bold text-slate-900 text-sm">ChatGPT Plus Business</p>
                    <p className="text-xs text-slate-500">GPT-5.2 · DALL-E · Sora</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xl font-black text-blue-700">99.000đ</span>
                    <span className="text-xs text-slate-400 line-through ml-2">620.000đ</span>
                  </div>
                  <span className="text-xs font-bold px-2 py-1 rounded-lg" style={{ background: '#fee2e2', color: '#991b1b' }}>-84%</span>
                </div>
              </div>

              {/* Second card */}
              <div className="absolute top-32 left-0 w-64 card p-4 shadow-lg"
                style={{ transform: 'rotate(-2deg)' }}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                    style={{ background: 'linear-gradient(135deg, #fef3c7, #fde68a)' }}>▶️</div>
                  <div>
                    <p className="font-bold text-slate-900 text-xs">YouTube Premium 1 Năm</p>
                    <p className="text-xs text-slate-500">Không quảng cáo</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-black text-blue-700">500.000đ</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-lg" style={{ background: '#dcfce7', color: '#166534' }}>-44%</span>
                </div>
              </div>

              {/* Third card */}
              <div className="absolute bottom-10 right-10 w-60 card p-4 shadow-lg">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                    style={{ background: 'linear-gradient(135deg, #ede9fe, #ddd6fe)' }}>🎨</div>
                  <div>
                    <p className="font-bold text-slate-900 text-xs">Canva Pro 1 Năm</p>
                    <p className="text-xs text-slate-500">100M+ templates</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-black text-blue-700">150.000đ</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-lg" style={{ background: '#fee2e2', color: '#991b1b' }}>-89%</span>
                </div>
              </div>

              {/* Floating badge */}
              <div className="absolute top-48 right-8 px-3 py-2 rounded-2xl shadow-lg text-sm font-bold"
                style={{ background: 'linear-gradient(135deg, #2563eb, #06b6d4)', color: 'white', animation: 'float 3s ease-in-out infinite' }}>
                ⚡ Giao ngay!
              </div>
            </div>
          </div>

          {/* Stats bar */}
          <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { value: '5,000+', label: 'Khách hàng tin tưởng', icon: '👥' },
              { value: '100+', label: 'Sản phẩm premium', icon: '📦' },
              { value: '99%', label: 'Khách hàng hài lòng', icon: '⭐' },
              { value: '< 5 phút', label: 'Thời gian giao hàng', icon: '⚡' },
            ].map(stat => (
              <div key={stat.label} className="card p-4 text-center">
                <div className="text-2xl mb-1">{stat.icon}</div>
                <p className="text-2xl font-black text-slate-900">{stat.value}</p>
                <p className="text-xs text-slate-500 mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════
          CATEGORIES
      ═══════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-2">Danh Mục</p>
            <h2 className="text-3xl font-black text-slate-900">Tìm theo loại sản phẩm</h2>
          </div>
          <Link href="/shop" className="text-sm text-blue-600 font-semibold flex items-center gap-1 hover:gap-2 transition-all">
            Xem tất cả <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {CATEGORIES.map(cat => (
            <Link key={cat.slug} href={`/shop?category=${cat.slug}`}
              className="group card-hover p-5 flex flex-col items-center text-center gap-3 cursor-pointer">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-3xl shadow-sm group-hover:scale-110 transition-transform duration-200`}>
                {cat.emoji}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800 group-hover:text-blue-700 transition-colors">{cat.name}</p>
                <p className="text-xs text-slate-400 mt-0.5">{cat.count} sản phẩm</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════
          FEATURED PRODUCTS
      ═══════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 pb-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-2">Nổi Bật</p>
            <h2 className="text-3xl font-black text-slate-900">Sản phẩm bán chạy nhất</h2>
          </div>
          <Link href="/shop" className="text-sm text-blue-600 font-semibold flex items-center gap-1 hover:gap-2 transition-all">
            Xem thêm <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {PRODUCTS.map(product => (
            <Link key={product.slug} href={`/product/${product.slug}`}>
              <div className="group card-hover h-full flex flex-col overflow-hidden cursor-pointer">
                {/* Image area */}
                <div className="relative h-44 flex items-center justify-center overflow-hidden"
                  style={{ background: 'linear-gradient(135deg, #eff6ff, #e0f2fe, #f0fdf4)' }}>
                  <span className="text-7xl group-hover:scale-110 transition-transform duration-300 animate-float">
                    {product.emoji}
                  </span>
                  <div className="absolute top-3 left-3">
                    <span className="text-xs font-bold px-2.5 py-1.5 rounded-xl shadow-sm"
                      style={{ background: '#ef4444', color: 'white' }}>
                      {product.badge}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3">
                    <span className="text-xs font-black px-2.5 py-1.5 rounded-xl"
                      style={{ background: '#fef9c3', color: '#854d0e' }}>
                      -{product.discount}%
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="flex flex-col flex-1 p-5 gap-2">
                  <span className="text-xs text-blue-600 font-semibold">{product.category}</span>
                  <h3 className="font-bold text-slate-900 group-hover:text-blue-700 transition-colors leading-snug">
                    {product.name}
                  </h3>
                  <p className="text-xs text-slate-500 flex-1 leading-relaxed">{product.desc}</p>
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-auto">
                    <div>
                      <span className="text-xl font-black text-blue-700">{product.price}</span>
                      <span className="text-xs text-slate-400 line-through ml-2">{product.original}</span>
                    </div>
                    <span className="text-xs text-green-600 font-semibold flex items-center gap-1">
                      <Zap size={12} /> Còn hàng
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════
          WHY APPXANH
      ═══════════════════════════════════ */}
      <section style={{ background: 'linear-gradient(135deg, #1e40af, #0891b2)' }} className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-blue-200 text-sm font-semibold uppercase tracking-wider mb-3">Tại Sao Chọn App Xanh</p>
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
              Mua app xịn, giá không xịn
            </h2>
            <p className="text-blue-100 max-w-xl mx-auto">
              Hàng nghìn khách hàng đã tiết kiệm hàng triệu đồng mỗi năm khi mua qua App Xanh
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                icon: <Zap size={28} />,
                title: 'Giao Hàng Tức Thì',
                desc: 'Nhận tài khoản ngay sau khi admin xác nhận thanh toán. Không cần chờ đợi lâu.',
                highlight: '< 5 phút'
              },
              {
                icon: <Shield size={28} />,
                title: 'Bảo Hành Tận Tâm',
                desc: 'Cam kết hoàn tiền hoặc đổi tài khoản mới nếu không đăng nhập được.',
                highlight: '100% bảo hành'
              },
              {
                icon: <TrendingDown size={28} />,
                title: 'Giá Rẻ Nhất',
                desc: 'Tiết kiệm đến 90% so với mua trực tiếp. Cập nhật giá liên tục theo thị trường.',
                highlight: 'Tiết kiệm 90%'
              },
              {
                icon: <HeadphonesIcon size={28} />,
                title: 'Hỗ Trợ Zalo 24/7',
                desc: 'Đội ngũ CSKH hỗ trợ tận tình qua Zalo. Phản hồi nhanh trong giờ làm việc.',
                highlight: '8:00 - 22:00'
              },
            ].map(item => (
              <div key={item.title}
                style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)' }}
                className="rounded-2xl p-6">
                <div className="text-white mb-4 opacity-90">{item.icon}</div>
                <div className="text-xs font-bold px-2.5 py-1 rounded-full mb-3 inline-block"
                  style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}>
                  {item.highlight}
                </div>
                <h3 className="text-white font-bold text-lg mb-2">{item.title}</h3>
                <p className="text-blue-100 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════
          HOW TO BUY
      ═══════════════════════════════════ */}
      <section className="max-w-5xl mx-auto px-4 md:px-8 py-20">
        <div className="text-center mb-12">
          <p className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-3">Quy Trình</p>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">
            Mua hàng siêu đơn giản
          </h2>
          <p className="text-slate-500 max-w-lg mx-auto">
            Chỉ 3 bước là bạn đã có ngay tài khoản premium với giá cực rẻ
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {/* Connector line */}
          <div className="hidden md:block absolute top-12 left-1/4 right-1/4 h-0.5"
            style={{ background: 'linear-gradient(to right, #2563eb, #06b6d4)' }} />

          {[
            {
              step: '01',
              icon: '🛒',
              title: 'Chọn sản phẩm',
              desc: 'Duyệt qua danh sách sản phẩm, chọn app bạn cần. Xem mô tả chi tiết, chọn biến thể và số lượng phù hợp.',
              color: '#2563eb'
            },
            {
              step: '02',
              icon: '💳',
              title: 'Thanh toán',
              desc: 'Đặt hàng và chuyển khoản ngân hàng theo thông tin hướng dẫn. Nhanh chóng và an toàn.',
              color: '#0891b2'
            },
            {
              step: '03',
              icon: '🎉',
              title: 'Nhận tài khoản',
              desc: 'Admin xác nhận và cập nhật thông tin tài khoản. Vào mục Đơn Hàng để xem thông tin đăng nhập.',
              color: '#059669'
            },
          ].map(item => (
            <div key={item.step} className="card p-7 relative overflow-hidden group hover:shadow-lg transition-all duration-200">
              <div className="absolute -top-4 -right-4 text-8xl font-black opacity-5"
                style={{ color: item.color }}>{item.step}</div>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mb-5 shadow-sm"
                style={{ background: `${item.color}15` }}>
                {item.icon}
              </div>
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-black text-white mb-4"
                style={{ background: item.color }}>
                {item.step}
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link href="/shop" className="btn-primary text-base px-10 py-4">
            Bắt Đầu Mua Sắm <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* ═══════════════════════════════════
          REVIEWS
      ═══════════════════════════════════ */}
      <section style={{ background: '#F8FAFC' }} className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-3">Đánh Giá</p>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-3">
              Khách hàng nói gì về App Xanh?
            </h2>
            <div className="flex items-center justify-center gap-1 mb-2">
              {[1,2,3,4,5].map(i => <Star key={i} size={20} fill="#facc15" className="text-yellow-400" />)}
              <span className="ml-2 text-slate-600 font-semibold">4.9/5 từ 500+ đánh giá</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {REVIEWS.map(review => (
              <div key={review.name} className="card p-5 flex flex-col gap-3 hover:shadow-md transition-all">
                <div className="flex items-center gap-1">
                  {[1,2,3,4,5].map(i => <Star key={i} size={14} fill="#facc15" className="text-yellow-400" />)}
                </div>
                <p className="text-slate-600 text-sm leading-relaxed flex-1">"{review.text}"</p>
                <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-xl"
                    style={{ background: 'linear-gradient(135deg, #dbeafe, #e0f2fe)' }}>
                    {review.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{review.name}</p>
                    <p className="text-xs text-slate-400">{review.product}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════
          CTA BOTTOM
      ═══════════════════════════════════ */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-3xl p-10 md:p-14 text-center relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #1e40af 0%, #0891b2 50%, #059669 100%)' }}>
            <div className="absolute inset-0 pointer-events-none"
              style={{ background: 'radial-gradient(circle at 30% 50%, rgba(255,255,255,0.1), transparent 60%)' }} />
            <div className="relative">
              <p className="text-blue-200 text-sm font-semibold uppercase tracking-wider mb-3">App Xanh</p>
              <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
                Sẵn sàng tiết kiệm đến 90%?
              </h2>
              <p className="text-blue-100 mb-8 max-w-lg mx-auto text-lg">
                Hàng trăm sản phẩm premium đang chờ bạn với mức giá không thể tin được.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/shop"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-base transition-all"
                  style={{ background: 'white', color: '#1d4ed8' }}>
                  Xem Sản Phẩm Ngay <ArrowRight size={18} />
                </Link>
                <a href="https://zalo.me/0888993991"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-base transition-all"
                  style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.3)' }}>
                  💬 Chat Zalo Ngay
                </a>
              </div>
              <div className="mt-8 flex flex-wrap justify-center gap-6 text-blue-100 text-sm">
                {['✅ Miễn phí đăng ký', '⚡ Giao hàng tức thì', '🛡️ Bảo hành 100%', '📞 Hỗ trợ Zalo'].map(item => (
                  <span key={item}>{item}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}