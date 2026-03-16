import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 mt-20">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-sm font-black">A</div>
              <span className="text-white font-extrabold text-xl" style={{ fontFamily: 'Sora, sans-serif' }}>App Xanh</span>
            </div>
            <p className="text-sm leading-relaxed text-slate-400">
              Tài khoản số giá xanh, giao nhanh, dùng ổn định. Mua app premium với giá tốt nhất Việt Nam.
            </p>
            <div className="mt-4">
              <span className="text-xs bg-green-900/60 text-green-400 px-3 py-1 rounded-full font-medium">✓ Bảo hành tận tâm</span>
            </div>
          </div>

          {/* Danh mục */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Danh Mục</h4>
            <ul className="space-y-2.5">
              {['AI Chatbot', 'Thiết Kế', 'Video & Âm Nhạc', 'Học Tập', 'Giải Trí', 'Công Cụ Dev'].map(cat => (
                <li key={cat}>
                  <Link href="/shop" className="text-sm hover:text-blue-400 transition-colors">{cat}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Hỗ trợ */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Hỗ Trợ</h4>
            <ul className="space-y-2.5">
              <li><Link href="/guides" className="text-sm hover:text-blue-400 transition-colors">Hướng Dẫn Sử Dụng</Link></li>
              <li><Link href="/guides" className="text-sm hover:text-blue-400 transition-colors">Câu Hỏi Thường Gặp</Link></li>
              <li><a href="https://zalo.me/0888993991" className="text-sm hover:text-blue-400 transition-colors">Liên Hệ Zalo</a></li>
              <li><Link href="/account/orders" className="text-sm hover:text-blue-400 transition-colors">Tra Cứu Đơn Hàng</Link></li>
            </ul>
          </div>

          {/* Liên hệ */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Liên Hệ</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm">
                <span className="text-blue-400 mt-0.5">📱</span>
                <div>
                  <p className="text-slate-400 text-xs">Zalo hỗ trợ</p>
                  <a href="https://zalo.me/0888993991" className="text-slate-300 hover:text-blue-400 font-medium">0888 993 991</a>
                </div>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <span className="text-blue-400 mt-0.5">🕐</span>
                <div>
                  <p className="text-slate-400 text-xs">Thời gian hỗ trợ</p>
                  <p className="text-slate-300">8:00 – 22:00 hằng ngày</p>
                </div>
              </li>
            </ul>
            <div className="mt-5 p-3 bg-blue-900/40 border border-blue-800/50 rounded-xl">
              <p className="text-xs text-blue-300 font-medium">⚡ Giao hàng tự động sau thanh toán</p>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500">© 2024 App Xanh. Tất cả quyền được bảo lưu.</p>
          <div className="flex items-center gap-4">
            <Link href="#" className="text-xs text-slate-500 hover:text-slate-400">Điều Khoản</Link>
            <Link href="#" className="text-xs text-slate-500 hover:text-slate-400">Bảo Mật</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}