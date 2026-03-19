import Link from 'next/link'

export function Footer() {
  return (
    <footer style={{ background: '#0A0F1E' }}>

      {/* Top CTA strip */}
      <div style={{ background: 'linear-gradient(90deg, #1e40af, #0891b2)' }}>
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: '#22C55E' }} />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5" style={{ background: '#22C55E' }} />
            </span>
            <p className="text-white text-sm font-semibold">Hệ thống giao hàng tự động 24/7 — Nhận tài khoản ngay sau thanh toán!</p>
          </div>
          <Link href="/shop"
            className="flex-shrink-0 text-xs font-bold px-4 py-2 rounded-xl text-blue-900 hover:opacity-90 transition-all"
            style={{ background: 'white' }}>
            Mua ngay →
          </Link>
        </div>
      </div>

      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">

          {/* Brand — col 4 */}
          <div className="md:col-span-4">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 mb-5 group w-fit">
              <div className="relative w-9 h-9 flex-shrink-0">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-md"
                  style={{ background: 'linear-gradient(135deg, #2563EB 0%, #0891B2 100%)' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L2 7l10 5 10-5-10-5z" fill="white" opacity="0.9"/>
                    <path d="M2 17l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.7"/>
                    <path d="M2 12l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none"/>
                  </svg>
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2"
                  style={{ background: '#22C55E', borderColor: '#0A0F1E' }} />
              </div>
              <div className="leading-none">
                <span className="font-black text-lg tracking-tight" style={{
                  fontFamily: 'Sora, sans-serif',
                  background: 'linear-gradient(135deg, #60A5FA, #38BDF8)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>XanhSoft</span>
                <p className="text-[9px] font-semibold tracking-widest uppercase" style={{ color: '#475569', marginTop: '-1px' }}>
                  Premium Store
                </p>
              </div>
            </Link>

            <p className="text-sm leading-relaxed mb-5" style={{ color: '#64748B', maxWidth: '280px' }}>
              Kho tài khoản số premium giá tốt nhất Việt Nam. Giao hàng tự động, bảo hành tận tâm, hỗ trợ 8:00–22:00.
            </p>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-2 mb-6">
              {[
                { icon: '⚡', text: 'Giao tức thì' },
                { icon: '🛡️', text: 'Bảo hành 100%' },
                { icon: '🔒', text: 'An toàn' },
              ].map(b => (
                <span key={b.text} className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full"
                  style={{ background: 'rgba(37,99,235,0.12)', border: '1px solid rgba(37,99,235,0.2)', color: '#60A5FA' }}>
                  {b.icon} {b.text}
                </span>
              ))}
            </div>

            {/* Social */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#475569' }}>Mạng Xã Hội</p>
              <div className="flex items-center gap-2.5">
                {[
                  {
                    name: 'Facebook', href: '#',
                    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>,
                    color: '#1877F2',
                  },
                  {
                    name: 'Instagram', href: '#',
                    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>,
                    color: '#E1306C',
                  },
                  {
                    name: 'Telegram', href: '#',
                    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M21.05 2.293L2.02 9.67c-1.27.51-1.26 1.22-.23 1.54l4.9 1.53 1.9 5.8c.23.67.12.93.82.93.53 0 .77-.25 1.07-.54l2.56-2.49 5.33 3.93c.98.54 1.68.26 1.93-.91L23 3.39c.37-1.48-.57-2.16-1.95-1.097z"/></svg>,
                    color: '#26A5E4',
                  },
                  {
                    name: 'X', href: '#',
                    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>,
                    color: '#E2E8F0',
                  },
                ].map(social => (
                  <a key={social.name} href={social.href}
                    title={social.name}
                    className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-110 hover:-translate-y-0.5"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', color: social.color }}>
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Links — col 8 */}
          <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-8">

            {/* Sản phẩm */}
            <div>
              <h4 className="font-bold text-sm mb-4 uppercase tracking-wider" style={{ color: '#94A3B8' }}>Sản Phẩm</h4>
              <ul className="space-y-2.5">
                {[
                  { label: 'AI Chatbot', href: '/shop?category=ai-chatbot' },
                  { label: 'Thiết Kế', href: '/shop?category=thiet-ke' },
                  { label: 'Video & Nhạc', href: '/shop?category=video-am-nhac' },
                  { label: 'Học Tập', href: '/shop?category=hoc-tap' },
                  { label: 'Giải Trí', href: '/shop?category=giai-tri' },
                  { label: 'Công Cụ Dev', href: '/shop?category=cong-cu-dev' },
                ].map(item => (
                  <li key={item.label}>
                    <Link href={item.href}
                      className="text-sm transition-colors hover:text-blue-400"
                      style={{ color: '#64748B' }}>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Hỗ trợ */}
            <div>
              <h4 className="font-bold text-sm mb-4 uppercase tracking-wider" style={{ color: '#94A3B8' }}>Hỗ Trợ</h4>
              <ul className="space-y-2.5">
                {[
                  { label: 'Hướng Dẫn Mua', href: '/guides' },
                  { label: 'Câu Hỏi Thường Gặp', href: '/guides#faq' },
                  { label: 'Tra Cứu Đơn Hàng', href: '/account/orders' },
                  { label: 'Liên Hệ Zalo', href: 'https://zalo.me/0888993991' },
                  { label: 'Báo Lỗi', href: 'https://zalo.me/0888993991' },
                ].map(item => (
                  <li key={item.label}>
                    <Link href={item.href}
                      className="text-sm transition-colors hover:text-blue-400"
                      style={{ color: '#64748B' }}>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Chính sách */}
            <div>
              <h4 className="font-bold text-sm mb-4 uppercase tracking-wider" style={{ color: '#94A3B8' }}>Chính Sách</h4>
              <ul className="space-y-2.5">
                {[
                  { label: 'Chính Sách Bảo Hành', href: '/guides#warranty' },
                  { label: 'Chính Sách Hoàn Tiền', href: '/guides#warranty' },
                  { label: 'Điều Khoản Dịch Vụ', href: '#' },
                  { label: 'Chính Sách Bảo Mật', href: '#' },
                  { label: 'Quy Định Sử Dụng', href: '#' },
                ].map(item => (
                  <li key={item.label}>
                    <Link href={item.href}
                      className="text-sm transition-colors hover:text-blue-400"
                      style={{ color: '#64748B' }}>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Liên hệ */}
            <div>
              <h4 className="font-bold text-sm mb-4 uppercase tracking-wider" style={{ color: '#94A3B8' }}>Liên Hệ</h4>
              <ul className="space-y-3.5">
                <li>
                  <a href="https://zalo.me/0888993991"
                    className="flex items-start gap-2.5 group">
                    <span className="text-base mt-0.5">📱</span>
                    <div>
                      <p className="text-xs" style={{ color: '#475569' }}>Zalo hỗ trợ</p>
                      <p className="text-sm font-semibold group-hover:text-blue-400 transition-colors" style={{ color: '#CBD5E1' }}>
                        0888 993 991
                      </p>
                    </div>
                  </a>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-base mt-0.5">🕐</span>
                  <div>
                    <p className="text-xs" style={{ color: '#475569' }}>Giờ hỗ trợ</p>
                    <p className="text-sm font-semibold" style={{ color: '#CBD5E1' }}>8:00 – 22:00</p>
                    <p className="text-xs" style={{ color: '#475569' }}>Hằng ngày</p>
                  </div>
                </li>
                <li>
                  <div className="mt-1 rounded-xl p-3" style={{ background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.2)' }}>
                    <p className="text-xs font-semibold" style={{ color: '#60A5FA' }}>⚡ Phản hồi trong 5 phút</p>
                    <p className="text-xs mt-0.5" style={{ color: '#475569' }}>Trong giờ hỗ trợ</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="mt-12 pt-6" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">

            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #2563EB, #0891B2)' }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" fill="white"/>
                </svg>
              </div>
              <p className="text-xs" style={{ color: '#334155' }}>
                © 2026 <span className="font-bold" style={{ color: '#475569' }}>XanhSoft</span>. Tất cả quyền được bảo lưu.
              </p>
            </div>

            <div className="flex items-center gap-1" style={{ color: '#334155' }}>
              <p className="text-xs">Made with</p>
              <span className="text-red-500 text-sm mx-0.5">♥</span>
              <p className="text-xs">in Vietnam</p>
              <span className="ml-1.5">🇻🇳</span>
            </div>

            <div className="flex items-center gap-4">
              {[
                { label: 'Điều Khoản', href: '#' },
                { label: 'Bảo Mật', href: '#' },
                { label: 'Sitemap', href: '/sitemap.xml' },
              ].map(item => (
                <Link key={item.label} href={item.href}
                  className="text-xs transition-colors hover:text-slate-300"
                  style={{ color: '#334155' }}>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}