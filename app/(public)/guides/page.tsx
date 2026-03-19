import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Hướng Dẫn Mua Hàng | App Xanh',
  description: 'Hướng dẫn mua tài khoản premium tại App Xanh. Quy trình đặt hàng, thanh toán VietQR, nhận tài khoản và chính sách bảo hành.',
}

const FAQS = [
  {
    q: 'Tôi cần làm gì sau khi chuyển khoản?',
    a: 'Sau khi chuyển khoản, bấm nút "Tôi Đã Chuyển Khoản" trên trang thanh toán. Admin sẽ xác nhận và giao tài khoản trong vòng 5–15 phút (trong giờ 8:00–22:00).',
  },
  {
    q: 'Nội dung chuyển khoản cần ghi gì?',
    a: 'Ghi đúng nội dung: APPXANH + Mã đơn hàng. VD: APPXANH AX123456. Điều này giúp admin xác nhận đơn nhanh hơn.',
  },
  {
    q: 'Tài khoản được giao ở đâu?',
    a: 'Vào mục Đơn Hàng → chọn đơn hàng đó → phần "Thông Tin Tài Khoản" sẽ hiển thị email, mật khẩu và hướng dẫn đăng nhập chi tiết.',
  },
  {
    q: 'Tôi có thể mua mà không cần đăng ký tài khoản không?',
    a: 'Bạn nên tạo tài khoản tại bước checkout để dễ tra cứu đơn hàng và nhận thông tin tài khoản. Chỉ mất 30 giây để tạo.',
  },
  {
    q: 'Nếu tài khoản không đăng nhập được thì sao?',
    a: 'App Xanh bảo hành đăng nhập lần đầu. Liên hệ Zalo ngay, tao sẽ hỗ trợ đổi tài khoản mới hoặc hoàn tiền trong vòng 24 giờ.',
  },
  {
    q: 'Tài khoản có dùng chung với người khác không?',
    a: 'Tuỳ theo loại sản phẩm. Loại "Cấp sẵn" là tài khoản riêng tư của bạn. Loại "Nâng cấp chính chủ" thì nâng cấp trực tiếp trên email của bạn — hoàn toàn riêng tư.',
  },
  {
    q: 'Thanh toán bằng cách nào?',
    a: 'Hiện tại App Xanh hỗ trợ chuyển khoản ngân hàng ACB qua mã QR VietQR. Quét mã bằng bất kỳ app ngân hàng nào là xong.',
  },
  {
    q: 'Giờ hỗ trợ của App Xanh là khi nào?',
    a: 'Hỗ trợ qua Zalo từ 8:00 đến 22:00 hàng ngày kể cả cuối tuần. Ngoài giờ này, đơn hàng sẽ được xử lý vào sáng hôm sau.',
  },
]

const GUIDES = [
  {
    id: 'buy',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <line x1="3" y1="6" x2="21" y2="6" stroke="white" strokeWidth="2"/>
        <path d="M16 10a4 4 0 01-8 0" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    color: '#2563EB', bg: '#EFF6FF',
    title: 'Hướng Dẫn Mua Hàng',
    steps: [
      { n: '01', title: 'Chọn sản phẩm', desc: 'Vào trang Sản Phẩm, tìm app bạn cần. Đọc mô tả chi tiết, chọn biến thể (1 tháng / 3 tháng / 1 năm) và nhấn Mua Ngay hoặc Thêm Vào Giỏ.' },
      { n: '02', title: 'Điền thông tin', desc: 'Tại trang Checkout, điền họ tên, email nhận thông báo và số điện thoại Zalo. Nếu chọn gói "Nâng cấp chính chủ", nhập email bạn muốn nâng cấp.' },
      { n: '03', title: 'Tạo tài khoản', desc: 'Nếu chưa có tài khoản App Xanh, tích vào "Tạo tài khoản" và đặt mật khẩu. Tài khoản giúp bạn tra cứu đơn hàng dễ dàng hơn.' },
      { n: '04', title: 'Xác nhận đặt hàng', desc: 'Kiểm tra lại đơn hàng và bấm "Đặt Hàng & Thanh Toán". Hệ thống sẽ tạo đơn và chuyển bạn sang trang thanh toán.' },
    ],
  },
  {
    id: 'payment',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
        <rect x="1" y="4" width="22" height="16" rx="2" stroke="white" strokeWidth="2"/>
        <line x1="1" y1="10" x2="23" y2="10" stroke="white" strokeWidth="2"/>
      </svg>
    ),
    color: '#7C3AED', bg: '#F5F3FF',
    title: 'Hướng Dẫn Thanh Toán',
    steps: [
      { n: '01', title: 'Quét mã QR', desc: 'Tại trang thanh toán, mở app ngân hàng bất kỳ (VCB, MB, Techcombank, ACB...) → chọn Quét QR → quét mã VietQR hiển thị trên màn hình.' },
      { n: '02', title: 'Kiểm tra thông tin', desc: 'Số tiền và nội dung chuyển khoản sẽ tự điền. Kiểm tra lại: STK 62291, ACB, NGUYEN HUU THANG, số tiền đúng và nội dung APPXANH + Mã đơn.' },
      { n: '03', title: 'Xác nhận chuyển khoản', desc: 'Hoàn tất giao dịch trong app ngân hàng. Sau khi chuyển khoản thành công, quay lại App Xanh và bấm "Tôi Đã Chuyển Khoản Xong".' },
      { n: '04', title: 'Chờ xác nhận', desc: 'Admin sẽ kiểm tra giao dịch và xác nhận trong vòng 5–15 phút (8:00–22:00). Trang sẽ tự động cập nhật khi thanh toán được xác nhận.' },
    ],
  },
  {
    id: 'receive',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
        <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 002 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" stroke="white" strokeWidth="2"/>
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" stroke="white" strokeWidth="2"/>
        <line x1="12" y1="22.08" x2="12" y2="12" stroke="white" strokeWidth="2"/>
      </svg>
    ),
    color: '#16A34A', bg: '#F0FDF4',
    title: 'Nhận Thông Tin Tài Khoản',
    steps: [
      { n: '01', title: 'Vào mục Đơn Hàng', desc: 'Đăng nhập vào App Xanh → click vào tên ở góc trên phải → chọn "Đơn Hàng Của Tôi" hoặc truy cập thẳng xanhsoft.com/account/orders.' },
      { n: '02', title: 'Chọn đơn hàng', desc: 'Tìm đơn hàng vừa mua (trạng thái "Hoàn thành"). Click "Xem Chi Tiết" để mở trang chi tiết đơn hàng.' },
      { n: '03', title: 'Xem thông tin tài khoản', desc: 'Trong phần "Thông Tin Tài Khoản", bạn sẽ thấy email đăng nhập, mật khẩu và các thông tin bổ sung. Dùng nút Copy để sao chép.' },
      { n: '04', title: 'Đọc hướng dẫn sử dụng', desc: 'Bên dưới thông tin tài khoản là hướng dẫn đăng nhập chi tiết cho từng sản phẩm. Làm theo từng bước là xong!' },
    ],
  },
  {
    id: 'warranty',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
        <path d="M12 2L3 7v6c0 5.25 3.75 10.15 9 11.25C17.25 23.15 21 18.25 21 13V7L12 2z" fill="rgba(255,255,255,0.2)" stroke="white" strokeWidth="2"/>
        <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    color: '#D97706', bg: '#FFFBEB',
    title: 'Chính Sách Bảo Hành',
    steps: [
      { n: '01', title: 'Phạm vi bảo hành', desc: 'App Xanh bảo hành đăng nhập lần đầu. Nếu email/mật khẩu không đúng hoặc không đăng nhập được ngay sau khi nhận, liên hệ hỗ trợ ngay.' },
      { n: '02', title: 'Cách yêu cầu bảo hành', desc: 'Nhắn Zalo 0888993991 kèm mã đơn hàng và mô tả vấn đề. Phản hồi trong vòng 30 phút (8:00–22:00).' },
      { n: '03', title: 'Xử lý bảo hành', desc: 'Admin sẽ kiểm tra và đổi tài khoản mới hoặc cung cấp thông tin đăng nhập chính xác. Thời gian xử lý thường dưới 1 giờ.' },
      { n: '04', title: 'Không được bảo hành', desc: 'Trường hợp tự ý đổi mật khẩu, thêm bảo mật 2 lớp (2FA) hoặc vi phạm điều khoản của nhà cung cấp sẽ không được bảo hành.' },
    ],
  },
]

export default function GuidesPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden py-16 md:py-20 px-4"
        style={{ background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 40%, #f0fdf4 100%)' }}>
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-20 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, #3b82f6, transparent)' }} />
        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-5 border"
            style={{ background: 'rgba(255,255,255,0.85)', borderColor: '#BFDBFE', color: '#1D4ED8' }}>
            📚 Trung Tâm Hỗ Trợ
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">
            Hướng Dẫn Sử Dụng
          </h1>
          <p className="text-slate-600 text-lg max-w-xl mx-auto mb-8">
            Tất cả những gì bạn cần biết để mua hàng, thanh toán và nhận tài khoản tại App Xanh.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/shop" className="btn-primary py-3 px-7 justify-center">
              Mua Ngay →
            </Link>
            <a href="https://zalo.me/0888993991" target="_blank"
              className="btn-outline py-3 px-7 justify-center">
              💬 Chat Zalo Hỗ Trợ
            </a>
          </div>
        </div>
      </section>

      {/* Quick nav */}
      <section className="bg-white border-b border-slate-200 sticky top-16 z-30">
        <div className="max-w-6xl mx-auto px-4 flex overflow-x-auto gap-1 py-2"
          style={{ scrollbarWidth: 'none' }}>
          {GUIDES.map(g => (
            <a key={g.id} href={`#${g.id}`}
              className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:bg-blue-50 hover:text-blue-700 text-slate-600 whitespace-nowrap">
              {g.title}
            </a>
          ))}
          <a href="#faq"
            className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:bg-blue-50 hover:text-blue-700 text-slate-600 whitespace-nowrap">
            ❓ FAQ
          </a>
        </div>
      </section>

      {/* Guide sections */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-12 space-y-16">
        {GUIDES.map((guide, gi) => (
          <section key={guide.id} id={guide.id}>
            {/* Section header */}
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm"
                style={{ background: `linear-gradient(135deg, ${guide.color}, ${guide.color}CC)` }}>
                {guide.icon}
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest" style={{ color: guide.color }}>
                  Bước {gi + 1}
                </p>
                <h2 className="text-2xl md:text-3xl font-black text-slate-900">{guide.title}</h2>
              </div>
            </div>

            {/* Steps */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {guide.steps.map((step, si) => (
                <div key={si} className="bg-white rounded-2xl border border-slate-200 p-5 flex gap-4 hover:shadow-md transition-all">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black text-white flex-shrink-0"
                    style={{ background: `linear-gradient(135deg, ${guide.color}, ${guide.color}CC)` }}>
                    {step.n}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 mb-1.5">{step.title}</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Special note for payment */}
            {guide.id === 'payment' && (
              <div className="mt-4 p-5 rounded-2xl border-2 flex items-start gap-4"
                style={{ background: '#EFF6FF', borderColor: '#BFDBFE' }}>
                <div className="text-2xl flex-shrink-0">💡</div>
                <div>
                  <p className="font-bold mb-1" style={{ color: '#1E40AF' }}>Thông tin chuyển khoản ACB</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
                    {[
                      { label: 'Ngân hàng', value: 'ACB' },
                      { label: 'Số tài khoản', value: '62291' },
                      { label: 'Chủ tài khoản', value: 'NGUYEN HUU THANG' },
                      { label: 'Nội dung', value: 'APPXANH + Mã đơn' },
                    ].map(item => (
                      <div key={item.label} className="bg-white rounded-xl p-3 border border-blue-100">
                        <p className="text-xs text-slate-400 mb-0.5">{item.label}</p>
                        <p className="font-bold text-slate-900 text-sm">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Special note for warranty */}
            {guide.id === 'warranty' && (
              <div className="mt-4 p-5 rounded-2xl border-2 flex items-start gap-4"
                style={{ background: '#F0FDF4', borderColor: '#BBF7D0' }}>
                <div className="text-2xl flex-shrink-0">✅</div>
                <div>
                  <p className="font-bold mb-1" style={{ color: '#166534' }}>Cam kết của App Xanh</p>
                  <ul className="space-y-1.5 mt-2">
                    {[
                      'Bảo hành đăng nhập lần đầu — đổi tài khoản mới nếu không vào được',
                      'Hỗ trợ Zalo từ 8:00–22:00 hàng ngày kể cả cuối tuần',
                      'Hoàn tiền 100% nếu không thể giao tài khoản',
                    ].map(item => (
                      <li key={item} className="flex items-start gap-2 text-sm" style={{ color: '#166534' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="mt-0.5 flex-shrink-0">
                          <path d="M9 12l2 2 4-4" stroke="#16A34A" strokeWidth="2" strokeLinecap="round"/>
                          <circle cx="12" cy="12" r="10" stroke="#16A34A" strokeWidth="2"/>
                        </svg>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </section>
        ))}

        {/* Video guide placeholder */}
        <section>
          <div className="text-center mb-8">
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#2563EB' }}>Video</p>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900">Xem Video Hướng Dẫn</h2>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: '#FFF0F0' }}>
              <svg width="36" height="36" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" fill="#FF0000"/>
              </svg>
            </div>
            <p className="font-bold text-slate-900 mb-1">Video hướng dẫn đang được cập nhật</p>
            <p className="text-slate-500 text-sm mb-4">Trong thời gian chờ, liên hệ Zalo để được hướng dẫn trực tiếp</p>
            <a href="https://zalo.me/0888993991" target="_blank"
              className="btn-primary inline-flex justify-center">
              💬 Chat Zalo Ngay
            </a>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq">
          <div className="text-center mb-8">
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#2563EB' }}>FAQ</p>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900">Câu Hỏi Thường Gặp</h2>
          </div>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <details key={i} className="group bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <summary className="flex items-center justify-between p-5 cursor-pointer font-semibold text-slate-900 hover:bg-slate-50 transition-colors list-none">
                  <span className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full text-xs font-black text-white flex items-center justify-center flex-shrink-0"
                      style={{ background: '#2563EB' }}>
                      {i + 1}
                    </span>
                    {faq.q}
                  </span>
                  <svg className="w-5 h-5 text-slate-400 group-open:rotate-180 transition-transform flex-shrink-0 ml-3"
                    fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
                  </svg>
                </summary>
                <div className="px-5 pb-5 pt-2 border-t border-slate-100">
                  <p className="text-slate-600 text-sm leading-relaxed pl-9">{faq.a}</p>
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* Still need help */}
        <section>
          <div className="rounded-3xl p-8 md:p-10 text-center relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #1e40af 0%, #0891b2 100%)' }}>
            <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full opacity-10"
              style={{ background: 'radial-gradient(circle, white, transparent)' }} />
            <div className="relative">
              <div className="text-4xl mb-4">💬</div>
              <h2 className="text-2xl md:text-3xl font-black text-white mb-3">
                Vẫn cần hỗ trợ?
              </h2>
              <p className="text-blue-100 mb-6 max-w-md mx-auto">
                Đội ngũ App Xanh luôn sẵn sàng hỗ trợ bạn qua Zalo từ 8:00 đến 22:00 hàng ngày.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a href="https://zalo.me/0888993991" target="_blank"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl font-bold text-base bg-white hover:bg-blue-50 transition-all"
                  style={{ color: '#1D4ED8' }}>
                  💬 Chat Zalo Ngay
                </a>
                <Link href="/shop"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl font-bold text-base border-2 border-white text-white hover:bg-white/10 transition-all">
                  🛍️ Xem Sản Phẩm
                </Link>
              </div>
              <div className="mt-6 flex flex-wrap justify-center gap-5 text-blue-200 text-sm">
                <span>📞 Zalo: 0888993991</span>
                <span>⏰ 8:00 – 22:00 hàng ngày</span>
                <span>⚡ Phản hồi trong 5 phút</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}