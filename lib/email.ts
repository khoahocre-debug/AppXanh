import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = process.env.RESEND_FROM ?? 'no-reply@xanhsoft.com'
const SITE = 'https://xanhsoft.com'

const vnd = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n)

// ── SVG Icons ─────────────────────────────────────────────
const IconCheck = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="12" fill="#16a34a"/><path d="M7 12.5L10.5 16L17 9" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`

const IconPackage = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" stroke="#2563eb" stroke-width="1.8" stroke-linejoin="round"/><polyline points="3.27 6.96 12 12.01 20.73 6.96" stroke="#2563eb" stroke-width="1.8" stroke-linecap="round"/><line x1="12" y1="22.08" x2="12" y2="12" stroke="#2563eb" stroke-width="1.8" stroke-linecap="round"/></svg>`

const IconBank = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="10" width="18" height="11" rx="2" stroke="#92400e" stroke-width="1.8"/><path d="M3 10L12 3L21 10" stroke="#92400e" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><rect x="9" y="14" width="6" height="7" rx="1" stroke="#92400e" stroke-width="1.6"/></svg>`

const IconStar = `<svg width="16" height="16" viewBox="0 0 24 24" fill="#f59e0b" xmlns="http://www.w3.org/2000/svg"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`

const IconShield = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="#dcfce7" stroke="#16a34a" stroke-width="1.8" stroke-linejoin="round"/><path d="M9 12l2 2 4-4" stroke="#16a34a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`

const IconZap = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="#fef3c7" stroke="#d97706" stroke-width="1.8" stroke-linejoin="round"/></svg>`

const IconMail = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="#2563eb" stroke-width="1.8" stroke-linejoin="round"/><polyline points="22,6 12,13 2,6" stroke="#2563eb" stroke-width="1.8" stroke-linecap="round"/></svg>`

// ── Shared layout ─────────────────────────────────────────
function emailWrapper(content: string) {
  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <meta name="color-scheme" content="light"/>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Inter',system-ui,-apple-system,sans-serif;">
  <div style="max-width:600px;margin:32px auto;padding:0 16px 40px;">
    ${content}
  </div>
</body>
</html>`
}

function emailHeader(title: string, subtitle: string) {
  return `
<div style="background:linear-gradient(135deg,#0f172a 0%,#1e40af 55%,#0891b2 100%);border-radius:24px 24px 0 0;padding:36px 40px;">
  <!-- Logo -->
  <div style="display:inline-flex;align-items:center;gap:10px;margin-bottom:24px;">
    <div style="width:40px;height:40px;background:rgba(255,255,255,0.15);border-radius:10px;display:flex;align-items:center;justify-content:center;">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L2 7l10 5 10-5-10-5z" fill="white" opacity="0.9"/>
        <path d="M2 17l10 5 10-5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" opacity="0.7"/>
        <path d="M2 12l10 5 10-5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </div>
    <span style="color:white;font-size:18px;font-weight:900;letter-spacing:-0.3px;">XanhSoft</span>
  </div>
  <h1 style="margin:0 0 8px;color:white;font-size:26px;font-weight:900;line-height:1.25;letter-spacing:-0.5px;">${title}</h1>
  <p style="margin:0;color:rgba(255,255,255,0.72);font-size:14px;line-height:1.6;">${subtitle}</p>
</div>`
}

function emailFooter() {
  return `
<div style="background:#f8fafc;border-radius:0 0 24px 24px;padding:24px 40px;border-top:1px solid #e2e8f0;text-align:center;">
  <div style="display:inline-flex;align-items:center;gap:6px;margin-bottom:10px;">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="#dbeafe" stroke="#2563eb" stroke-width="1.8"/></svg>
    <span style="color:#64748b;font-size:12px;font-weight:600;">Giao dịch được bảo mật bởi XanhSoft</span>
  </div>
  <p style="margin:0;color:#94a3b8;font-size:12px;line-height:1.6;">
    Cần hỗ trợ? 
    <a href="https://zalo.me/0888993991" style="color:#2563eb;text-decoration:none;font-weight:600;">Zalo 0888993991</a>
    &nbsp;·&nbsp; 08:00–22:00 hàng ngày
    <br/>
    <a href="${SITE}" style="color:#94a3b8;text-decoration:none;">xanhsoft.com</a>
    &nbsp;·&nbsp; © ${new Date().getFullYear()} XanhSoft
  </p>
</div>`
}

// ── Welcome email ─────────────────────────────────────────
export async function sendWelcomeEmail({ to, name }: { to: string; name: string }) {
  const benefits = [
    { icon: IconZap, text: 'Tài khoản premium giao tự động sau thanh toán' },
    { icon: IconStar, text: 'ChatGPT Plus, Claude Pro, Canva Pro giá rẻ đến 90%' },
    { icon: IconShield, text: 'Bảo hành đăng nhập, hỗ trợ đổi mới nếu lỗi' },
    { icon: IconMail, text: 'Theo dõi đơn hàng mọi lúc qua trang Đơn Hàng' },
  ]

  const html = emailWrapper(`
  <div style="background:white;border-radius:24px;overflow:hidden;box-shadow:0 4px 32px rgba(15,23,42,0.10);border:1px solid #e2e8f0;">
    ${emailHeader('Chào mừng đến với XanhSoft!', 'Tài khoản của bạn đã được tạo thành công.')}

    <div style="padding:36px 40px;">
      <p style="margin:0 0 24px;color:#334155;font-size:15px;line-height:1.75;">
        Xin chào <strong style="color:#0f172a;">${name}</strong>,<br/>
        Chào mừng bạn đến với <strong style="color:#2563eb;">XanhSoft</strong> — nơi mua tài khoản premium giá tốt nhất Việt Nam. Dưới đây là những gì bạn sẽ nhận được:
      </p>

      <!-- Benefits -->
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:16px;padding:20px;margin-bottom:28px;">
        ${benefits.map(b => `
        <div style="display:flex;align-items:flex-start;gap:12px;padding:10px 0;border-bottom:1px solid #f1f5f9;">
          <div style="flex-shrink:0;margin-top:1px;">${b.icon}</div>
          <p style="margin:0;color:#334155;font-size:14px;line-height:1.6;">${b.text}</p>
        </div>`).join('')}
      </div>

      <!-- Highlight box -->
      <div style="background:linear-gradient(135deg,#eff6ff,#f0f9ff);border:1px solid #bfdbfe;border-radius:16px;padding:20px;margin-bottom:28px;text-align:center;">
        <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:#1e40af;text-transform:uppercase;letter-spacing:0.1em;">Ưu đãi cho thành viên mới</p>
        <p style="margin:0;font-size:26px;font-weight:900;color:#1d4ed8;">Tiết kiệm đến 90%</p>
        <p style="margin:4px 0 0;font-size:13px;color:#3b82f6;">so với giá gốc trên thị trường</p>
      </div>

      <!-- CTA -->
      <div style="text-align:center;margin-bottom:28px;">
        <a href="${SITE}/shop"
          style="display:inline-block;background:linear-gradient(135deg,#2563eb,#1d4ed8);color:white;font-size:15px;font-weight:800;text-decoration:none;padding:15px 36px;border-radius:14px;letter-spacing:0.01em;box-shadow:0 6px 20px rgba(37,99,235,0.32);">
          Khám phá sản phẩm ngay
        </a>
      </div>

      <p style="margin:0;font-size:13px;color:#94a3b8;text-align:center;line-height:1.6;">
        Bạn nhận email này vì vừa đăng ký tài khoản tại xanhsoft.com.<br/>
        Nếu không phải bạn, hãy bỏ qua email này.
      </p>
    </div>

    ${emailFooter()}
  </div>`)

  await resend.emails.send({
    from: `XanhSoft <${FROM}>`,
    to,
    subject: `Chào mừng bạn đến với XanhSoft, ${name}!`,
    html,
  })
}

// ── Order confirmation email ───────────────────────────────
export async function sendOrderConfirmationEmail({
  to, customerName, orderCode, items, total,
}: {
  to: string
  customerName: string
  orderCode: string
  items: { name: string; variant?: string | null; quantity: number; price: number }[]
  total: number
}) {
  const html = emailWrapper(`
  <div style="background:white;border-radius:24px;overflow:hidden;box-shadow:0 4px 32px rgba(15,23,42,0.10);border:1px solid #e2e8f0;">
    ${emailHeader('Đơn hàng đã được đặt thành công', `Cảm ơn bạn đã tin tưởng XanhSoft, ${customerName}!`)}

    <div style="padding:36px 40px;">

      <!-- Status badge -->
      <div style="display:flex;align-items:center;gap:12px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:14px;padding:16px 20px;margin-bottom:28px;">
        <div style="flex-shrink:0;">${IconCheck}</div>
        <div>
          <p style="margin:0;font-size:15px;font-weight:800;color:#166534;">Đặt hàng thành công!</p>
          <p style="margin:4px 0 0;font-size:13px;color:#16a34a;">
            Mã đơn: <strong style="font-family:monospace;">#${orderCode}</strong>
            &nbsp;·&nbsp; Vui lòng hoàn tất thanh toán
          </p>
        </div>
      </div>

      <!-- Order items -->
      <div style="margin-bottom:20px;">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;">
          ${IconPackage}
          <p style="margin:0;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:#64748b;">Sản phẩm đặt mua</p>
        </div>
        <div style="border:1px solid #e2e8f0;border-radius:14px;overflow:hidden;">
          ${items.map((item, i) => `
          <div style="padding:14px 18px;${i < items.length - 1 ? 'border-bottom:1px solid #f1f5f9;' : ''}display:flex;justify-content:space-between;align-items:center;gap:12px;">
            <div style="min-width:0;flex:1;">
              <p style="margin:0;font-size:14px;font-weight:700;color:#0f172a;">${item.name}</p>
              ${item.variant ? `<p style="margin:3px 0 0;font-size:12px;color:#64748b;">${item.variant}</p>` : ''}
              <p style="margin:3px 0 0;font-size:12px;color:#94a3b8;">Số lượng: ${item.quantity}</p>
            </div>
            <p style="margin:0;font-size:14px;font-weight:800;color:#2563eb;white-space:nowrap;">${vnd(item.price * item.quantity)}</p>
          </div>`).join('')}
          <!-- Total row -->
          <div style="padding:14px 18px;background:#eff6ff;display:flex;justify-content:space-between;align-items:center;">
            <p style="margin:0;font-size:14px;font-weight:700;color:#1e40af;">Tổng cộng</p>
            <p style="margin:0;font-size:20px;font-weight:900;color:#2563eb;">${vnd(total)}</p>
          </div>
        </div>
      </div>

      <!-- Bank transfer info -->
      <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:14px;padding:20px;margin-bottom:28px;">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:14px;">
          ${IconBank}
          <p style="margin:0;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:#92400e;">Thông tin chuyển khoản</p>
        </div>
        <table style="width:100%;border-collapse:collapse;">
          ${[
            ['Ngân hàng', 'ACB'],
            ['Số tài khoản', '62291'],
            ['Chủ tài khoản', 'NGUYEN HUU THANG'],
            ['Số tiền', vnd(total)],
            ['Nội dung CK', `APPXANH ${orderCode}`],
          ].map(([label, value], i) => `
          <tr style="${i > 0 ? 'border-top:1px solid #fef3c7;' : ''}">
            <td style="padding:8px 0;font-size:13px;color:#78350f;width:45%;">${label}</td>
            <td style="padding:8px 0;font-size:13px;font-weight:700;color:#0f172a;font-family:${label === 'Số tài khoản' || label === 'Nội dung CK' ? 'monospace' : 'inherit'};${label === 'Số tiền' ? 'color:#2563eb;font-size:15px;' : ''}${label === 'Nội dung CK' ? 'color:#1d4ed8;' : ''}">${value}</td>
          </tr>`).join('')}
        </table>
      </div>

      <!-- Steps -->
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:14px;padding:18px 20px;margin-bottom:28px;">
        <p style="margin:0 0 12px;font-size:13px;font-weight:700;color:#0f172a;">Các bước tiếp theo</p>
        ${[
          'Chuyển khoản đúng số tiền và nội dung ở trên',
          'Bấm "Tôi Đã Chuyển Khoản Xong" trên trang thanh toán',
          'Admin xác nhận và giao tài khoản trong vài phút',
          'Bạn nhận thông tin đăng nhập qua trang Đơn Hàng',
        ].map((step, i) => `
        <div style="display:flex;align-items:flex-start;gap:10px;${i > 0 ? 'margin-top:10px;' : ''}">
          <div style="flex-shrink:0;width:22px;height:22px;background:#2563eb;border-radius:50%;display:flex;align-items:center;justify-content:center;">
            <span style="color:white;font-size:11px;font-weight:800;">${i + 1}</span>
          </div>
          <p style="margin:0;font-size:13px;color:#334155;line-height:1.6;padding-top:2px;">${step}</p>
        </div>`).join('')}
      </div>

      <!-- CTA -->
      <div style="text-align:center;">
        <a href="${SITE}/payment/${orderCode}"
          style="display:inline-block;background:linear-gradient(135deg,#2563eb,#1d4ed8);color:white;font-size:15px;font-weight:800;text-decoration:none;padding:15px 36px;border-radius:14px;box-shadow:0 6px 20px rgba(37,99,235,0.32);">
          Hoàn tất thanh toán ngay
        </a>
        <p style="margin:14px 0 0;font-size:12px;color:#94a3b8;">
          hoặc 
          <a href="${SITE}/account/orders/${orderCode}" style="color:#2563eb;text-decoration:none;font-weight:600;">xem chi tiết đơn hàng</a>
        </p>
      </div>
    </div>

    ${emailFooter()}
  </div>`)

  await resend.emails.send({
    from: `XanhSoft <${FROM}>`,
    to,
    subject: `Xác nhận đơn hàng #${orderCode} — XanhSoft`,
    html,
  })
}

// ── Order completed email (gửi cho khách khi đơn hoàn thành) ─
export async function sendOrderCompletedEmail({
  to, customerName, orderCode, items, total,
}: {
  to: string
  customerName: string
  orderCode: string
  items: { name: string; variant?: string | null; quantity: number; price: number }[]
  total: number
}) {
  const html = emailWrapper(`
  <div style="background:white;border-radius:24px;overflow:hidden;box-shadow:0 4px 32px rgba(15,23,42,0.10);border:1px solid #e2e8f0;">
    ${emailHeader('Tài khoản của bạn đã sẵn sàng!', 'Thanh toán đã được xác nhận và đơn hàng hoàn tất.')}

    <div style="padding:36px 40px;">

      <!-- Success badge -->
      <div style="text-align:center;margin-bottom:28px;">
        <div style="display:inline-flex;flex-direction:column;align-items:center;gap:12px;background:linear-gradient(135deg,#f0fdf4,#dcfce7);border:1px solid #86efac;border-radius:20px;padding:24px 36px;">
          <svg width="48" height="48" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="32" cy="32" r="28" fill="url(#g1)"/>
            <defs><linearGradient id="g1" x1="10" y1="10" x2="54" y2="54" gradientUnits="userSpaceOnUse"><stop stop-color="#4ade80"/><stop offset="1" stop-color="#16a34a"/></linearGradient></defs>
            <circle cx="32" cy="32" r="22" fill="rgba(255,255,255,0.15)"/>
            <path d="M22 32L28.5 38.5L42 25" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <div>
            <p style="margin:0;font-size:18px;font-weight:900;color:#166534;">Đơn hàng hoàn tất!</p>
            <p style="margin:4px 0 0;font-size:13px;color:#16a34a;">Mã đơn: <strong style="font-family:monospace;">#${orderCode}</strong></p>
          </div>
        </div>
      </div>

      <p style="margin:0 0 24px;color:#334155;font-size:15px;line-height:1.75;text-align:center;">
        Xin chào <strong style="color:#0f172a;">${customerName}</strong>!<br/>
        Tài khoản của bạn đã được giao thành công. Vào trang đơn hàng để xem thông tin đăng nhập.
      </p>

      <!-- Items summary -->
      <div style="border:1px solid #e2e8f0;border-radius:14px;overflow:hidden;margin-bottom:24px;">
        <div style="background:#f8fafc;padding:12px 18px;border-bottom:1px solid #e2e8f0;display:flex;align-items:center;gap:8px;">
          ${IconPackage}
          <p style="margin:0;font-size:13px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.1em;">Sản phẩm đã mua</p>
        </div>
        ${items.map((item, i) => `
        <div style="padding:12px 18px;${i < items.length - 1 ? 'border-bottom:1px solid #f1f5f9;' : ''}display:flex;justify-content:space-between;align-items:center;">
          <div>
            <p style="margin:0;font-size:14px;font-weight:700;color:#0f172a;">${item.name}</p>
            ${item.variant ? `<p style="margin:2px 0 0;font-size:12px;color:#64748b;">${item.variant}</p>` : ''}
          </div>
          <p style="margin:0;font-size:14px;font-weight:800;color:#16a34a;">${vnd(item.price * item.quantity)}</p>
        </div>`).join('')}
        <div style="padding:12px 18px;background:#f0fdf4;display:flex;justify-content:space-between;">
          <p style="margin:0;font-size:14px;font-weight:700;color:#166534;">Tổng đã thanh toán</p>
          <p style="margin:0;font-size:18px;font-weight:900;color:#16a34a;">${vnd(total)}</p>
        </div>
      </div>

      <!-- Warranty note -->
      <div style="display:flex;align-items:flex-start;gap:12px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:14px;padding:16px 20px;margin-bottom:28px;">
        <div style="flex-shrink:0;margin-top:1px;">${IconShield}</div>
        <div>
          <p style="margin:0;font-size:14px;font-weight:700;color:#166534;">Chính sách bảo hành</p>
          <p style="margin:4px 0 0;font-size:13px;color:#16a34a;line-height:1.6;">
            XanhSoft bảo hành đăng nhập lần đầu. Nếu không đăng nhập được,
            liên hệ Zalo <strong>0888993991</strong> để được hỗ trợ đổi tài khoản mới hoặc hoàn tiền trong 24h.
          </p>
        </div>
      </div>

      <!-- CTA -->
      <div style="text-align:center;">
        <a href="${SITE}/account/orders/${orderCode}"
          style="display:inline-block;background:linear-gradient(135deg,#16a34a,#059669);color:white;font-size:15px;font-weight:800;text-decoration:none;padding:15px 36px;border-radius:14px;box-shadow:0 6px 20px rgba(22,163,74,0.32);">
          Xem thông tin tài khoản
        </a>
      </div>
    </div>

    ${emailFooter()}
  </div>`)

  await resend.emails.send({
    from: `XanhSoft <${FROM}>`,
    to,
    subject: `Tài khoản đã sẵn sàng — Đơn #${orderCode} hoàn tất | XanhSoft`,
    html,
  })
}