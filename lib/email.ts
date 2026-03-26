import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = process.env.RESEND_FROM ?? 'no-reply@xanhsoft.com'
const SITE = 'https://xanhsoft.com'

const vnd = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n)

// ── Shared components ─────────────────────────────────────
function emailLogo() {
  return `
<table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
  <tr>
    <td style="width:42px;height:42px;background:rgba(255,255,255,0.15);border-radius:10px;text-align:center;vertical-align:middle;">
      <span style="color:white;font-size:20px;font-weight:900;display:block;line-height:42px;">X</span>
    </td>
    <td style="padding-left:10px;vertical-align:middle;">
      <span style="color:white;font-size:18px;font-weight:900;letter-spacing:-0.3px;">XanhSoft</span>
    </td>
  </tr>
</table>`
}

function emailHeader(title: string, subtitle: string, gradient = 'linear-gradient(135deg,#0f172a 0%,#1e40af 55%,#0891b2 100%)') {
  return `
<div style="background:${gradient};border-radius:24px 24px 0 0;padding:36px 40px;">
  ${emailLogo()}
  <h1 style="margin:0 0 8px;color:white;font-size:26px;font-weight:900;line-height:1.25;letter-spacing:-0.5px;">${title}</h1>
  <p style="margin:0;color:rgba(255,255,255,0.72);font-size:14px;line-height:1.6;">${subtitle}</p>
</div>`
}

function emailFooter() {
  return `
<div style="background:#f8fafc;border-radius:0 0 24px 24px;padding:24px 40px;border-top:1px solid #e2e8f0;text-align:center;">
  <table cellpadding="0" cellspacing="0" border="0" width="100%">
    <tr>
      <td style="text-align:center;padding-bottom:8px;">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:inline;vertical-align:middle;margin-right:5px;">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="#dbeafe" stroke="#2563eb" stroke-width="1.8"/>
        </svg>
        <span style="color:#64748b;font-size:12px;font-weight:600;vertical-align:middle;">Giao dịch được bảo mật bởi XanhSoft</span>
      </td>
    </tr>
    <tr>
      <td style="text-align:center;">
        <p style="margin:0;color:#94a3b8;font-size:12px;line-height:1.8;">
          Cần hỗ trợ? <a href="https://zalo.me/0888993991" style="color:#2563eb;text-decoration:none;font-weight:600;">Zalo 0888993991</a> &nbsp;·&nbsp; 08:00–22:00 hàng ngày<br/>
          <a href="${SITE}" style="color:#94a3b8;text-decoration:none;">xanhsoft.com</a> &nbsp;·&nbsp; © ${new Date().getFullYear()} XanhSoft
        </p>
      </td>
    </tr>
  </table>
</div>`
}

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
    <div style="background:white;border-radius:24px;overflow:hidden;box-shadow:0 4px 32px rgba(15,23,42,0.10);border:1px solid #e2e8f0;">
      ${content}
    </div>
  </div>
</body>
</html>`
}

function itemsTable(items: { name: string; variant?: string | null; quantity: number; price: number }[]) {
  return `
<table cellpadding="0" cellspacing="0" border="0" width="100%" style="border:1px solid #e2e8f0;border-radius:14px;overflow:hidden;border-collapse:separate;border-spacing:0;">
  ${items.map((item, i) => `
  <tr style="background:${i % 2 === 0 ? 'white' : '#fafafa'};">
    <td style="padding:14px 18px;${i < items.length - 1 ? 'border-bottom:1px solid #f1f5f9;' : ''}vertical-align:top;">
      <p style="margin:0;font-size:14px;font-weight:700;color:#0f172a;">${item.name}</p>
      ${item.variant ? `<p style="margin:3px 0 0;font-size:12px;color:#64748b;">${item.variant}</p>` : ''}
      <p style="margin:3px 0 0;font-size:12px;color:#94a3b8;">Số lượng: ${item.quantity}</p>
    </td>
    <td style="padding:14px 18px;${i < items.length - 1 ? 'border-bottom:1px solid #f1f5f9;' : ''}text-align:right;vertical-align:top;white-space:nowrap;">
      <p style="margin:0;font-size:14px;font-weight:800;color:#2563eb;">${vnd(item.price * item.quantity)}</p>
    </td>
  </tr>`).join('')}
  <tr style="background:#eff6ff;">
    <td style="padding:14px 18px;font-size:14px;font-weight:700;color:#1e40af;">Tổng cộng</td>
    <td style="padding:14px 18px;font-size:20px;font-weight:900;color:#2563eb;text-align:right;white-space:nowrap;">
      ${vnd(items.reduce((s, i) => s + i.price * i.quantity, 0))}
    </td>
  </tr>
</table>`
}

// ── Welcome email ─────────────────────────────────────────
export async function sendWelcomeEmail({ to, name }: { to: string; name: string }) {
  const benefits = [
    { text: 'Tài khoản premium giao tự động sau thanh toán' },
    { text: 'ChatGPT Plus, Claude Pro, Canva Pro giá rẻ đến 90%' },
    { text: 'Bảo hành đăng nhập, hỗ trợ đổi mới nếu lỗi' },
    { text: 'Theo dõi đơn hàng mọi lúc qua trang Đơn Hàng' },
  ]

  const html = emailWrapper(`
  ${emailHeader('Chào mừng đến với XanhSoft!', 'Tài khoản của bạn đã được tạo thành công.')}

  <div style="padding:36px 40px;">
    <p style="margin:0 0 24px;color:#334155;font-size:15px;line-height:1.75;">
      Xin chào <strong style="color:#0f172a;">${name}</strong>,<br/>
      Chào mừng bạn đến với <strong style="color:#2563eb;">XanhSoft</strong> — nơi mua tài khoản premium giá tốt nhất Việt Nam.
    </p>

    <!-- Benefits -->
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:16px;padding:8px 20px;margin-bottom:28px;">
      <table cellpadding="0" cellspacing="0" border="0" width="100%">
        ${benefits.map((b, i) => `
        <tr>
          <td style="padding:12px 0;${i < benefits.length - 1 ? 'border-bottom:1px solid #f1f5f9;' : ''}vertical-align:top;width:28px;">
            <div style="width:22px;height:22px;background:#dcfce7;border-radius:50%;text-align:center;line-height:22px;">
              <span style="color:#16a34a;font-size:13px;font-weight:900;">✓</span>
            </div>
          </td>
          <td style="padding:12px 0 12px 10px;${i < benefits.length - 1 ? 'border-bottom:1px solid #f1f5f9;' : ''}vertical-align:middle;">
            <p style="margin:0;color:#334155;font-size:14px;line-height:1.5;">${b.text}</p>
          </td>
        </tr>`).join('')}
      </table>
    </div>

    <!-- Highlight -->
    <div style="background:linear-gradient(135deg,#eff6ff,#f0f9ff);border:1px solid #bfdbfe;border-radius:16px;padding:20px;margin-bottom:28px;text-align:center;">
      <p style="margin:0 0 4px;font-size:12px;font-weight:700;color:#1e40af;text-transform:uppercase;letter-spacing:0.1em;">Ưu đãi cho thành viên mới</p>
      <p style="margin:0;font-size:28px;font-weight:900;color:#1d4ed8;">Tiết kiệm đến 90%</p>
      <p style="margin:4px 0 0;font-size:13px;color:#3b82f6;">so với giá gốc trên thị trường</p>
    </div>

    <!-- CTA -->
    <div style="text-align:center;margin-bottom:28px;">
      <a href="${SITE}/shop"
        style="display:inline-block;background:linear-gradient(135deg,#2563eb,#1d4ed8);color:white;font-size:15px;font-weight:800;text-decoration:none;padding:15px 36px;border-radius:14px;box-shadow:0 6px 20px rgba(37,99,235,0.32);">
        Khám phá sản phẩm ngay
      </a>
    </div>

    <p style="margin:0;font-size:13px;color:#94a3b8;text-align:center;line-height:1.6;">
      Bạn nhận email này vì vừa đăng ký tại xanhsoft.com.<br/>
      Nếu không phải bạn, hãy bỏ qua email này.
    </p>
  </div>

  ${emailFooter()}`)

  await resend.emails.send({
    from: `XanhSoft <${FROM}>`,
    to,
    subject: `Chào mừng bạn đến với XanhSoft, ${name}!`,
    html,
  })
}

// ── Order confirmation email (gửi khi đặt hàng) ──────────
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
  ${emailHeader('Đơn hàng đã được đặt thành công', `Cảm ơn bạn đã tin tưởng XanhSoft, ${customerName}!`)}

  <div style="padding:36px 40px;">

    <!-- Status badge -->
    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:14px;margin-bottom:28px;">
      <tr>
        <td style="padding:16px 20px;vertical-align:middle;width:36px;">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="11" fill="#16a34a"/>
            <path d="M7 12.5L10.5 16L17 9" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </td>
        <td style="padding:16px 20px 16px 8px;vertical-align:middle;">
          <p style="margin:0;font-size:15px;font-weight:800;color:#166534;">Đặt hàng thành công!</p>
          <p style="margin:4px 0 0;font-size:13px;color:#16a34a;">
            Mã đơn: <strong style="font-family:monospace;">#${orderCode}</strong>
            &nbsp;·&nbsp; Vui lòng hoàn tất thanh toán
          </p>
        </td>
      </tr>
    </table>

    <!-- Items -->
    <p style="margin:0 0 12px;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:#64748b;">Sản phẩm đặt mua</p>
    <div style="margin-bottom:24px;">
      ${itemsTable(items)}
    </div>

    <!-- Bank transfer -->
    <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:14px;padding:20px;margin-bottom:28px;">
      <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:14px;">
        <tr>
          <td style="vertical-align:middle;padding-right:8px;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="10" width="18" height="11" rx="2" stroke="#92400e" stroke-width="1.8"/>
              <path d="M3 10L12 3L21 10" stroke="#92400e" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
              <rect x="9" y="14" width="6" height="7" rx="1" stroke="#92400e" stroke-width="1.6"/>
            </svg>
          </td>
          <td style="vertical-align:middle;">
            <p style="margin:0;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:#92400e;">Thông tin chuyển khoản</p>
          </td>
        </tr>
      </table>
      <table cellpadding="0" cellspacing="0" border="0" width="100%">
        ${[
          ['Ngân hàng', 'ACB', false],
          ['Số tài khoản', '62291', true],
          ['Chủ tài khoản', 'NGUYEN HUU THANG', false],
          ['Số tiền', vnd(total), false],
          ['Nội dung CK ⚠️', `APPXANH ${orderCode}`, true],
        ].map(([label, value, mono], i) => `
        <tr style="${i > 0 ? 'border-top:1px solid #fef3c7;' : ''}">
          <td style="padding:8px 0;font-size:13px;color:#78350f;width:45%;vertical-align:top;">${label}</td>
          <td style="padding:8px 0;font-size:13px;font-weight:700;color:${label === 'Số tiền' ? '#2563eb' : label === 'Nội dung CK ⚠️' ? '#1d4ed8' : '#0f172a'};font-family:${mono ? 'monospace' : 'inherit'};vertical-align:top;">${value}</td>
        </tr>`).join('')}
      </table>
    </div>

    <!-- Steps -->
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:14px;padding:18px 20px;margin-bottom:28px;">
      <p style="margin:0 0 14px;font-size:13px;font-weight:700;color:#0f172a;">Các bước tiếp theo</p>
      <table cellpadding="0" cellspacing="0" border="0" width="100%">
        ${[
          'Chuyển khoản đúng số tiền và nội dung ở trên',
          'Bấm "Tôi Đã Chuyển Khoản Xong" trên trang thanh toán',
          'Admin xác nhận và giao tài khoản trong vài phút',
          'Bạn nhận thông tin đăng nhập qua trang Đơn Hàng',
        ].map((step, i) => `
        <tr>
          <td style="width:26px;padding:0 10px ${i < 3 ? '12px' : '0'} 0;vertical-align:top;">
            <div style="width:22px;height:22px;background:#2563eb;border-radius:50%;text-align:center;line-height:22px;">
              <span style="color:white;font-size:11px;font-weight:800;">${i + 1}</span>
            </div>
          </td>
          <td style="padding:0 0 ${i < 3 ? '12px' : '0'} 0;vertical-align:top;">
            <p style="margin:0;font-size:13px;color:#334155;line-height:1.6;padding-top:2px;">${step}</p>
          </td>
        </tr>`).join('')}
      </table>
    </div>

    <!-- CTA -->
    <div style="text-align:center;">
      <a href="${SITE}/payment/${orderCode}"
        style="display:inline-block;background:linear-gradient(135deg,#2563eb,#1d4ed8);color:white;font-size:15px;font-weight:800;text-decoration:none;padding:15px 36px;border-radius:14px;box-shadow:0 6px 20px rgba(37,99,235,0.32);">
        Hoàn tất thanh toán ngay
      </a>
      <p style="margin:12px 0 0;font-size:12px;color:#94a3b8;">
        hoặc <a href="${SITE}/account/orders/${orderCode}" style="color:#2563eb;text-decoration:none;font-weight:600;">xem chi tiết đơn hàng</a>
      </p>
    </div>
  </div>

  ${emailFooter()}`)

  await resend.emails.send({
    from: `XanhSoft <${FROM}>`,
    to,
    subject: `Xác nhận đơn hàng #${orderCode} — XanhSoft`,
    html,
  })
}

// ── Order completed email (gửi khi thanh toán xác nhận) ───
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
  ${emailHeader(
    'Tài khoản của bạn đã sẵn sàng!',
    'Thanh toán xác nhận — đơn hàng hoàn tất.',
    'linear-gradient(135deg,#052e16 0%,#166534 55%,#15803d 100%)'
  )}

  <div style="padding:36px 40px;">

    <!-- Success -->
    <div style="text-align:center;margin-bottom:28px;">
      <div style="display:inline-block;background:linear-gradient(135deg,#f0fdf4,#dcfce7);border:1px solid #86efac;border-radius:20px;padding:24px 40px;">
        <svg width="52" height="52" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:block;margin:0 auto 12px;">
          <defs>
            <linearGradient id="gc" x1="10" y1="10" x2="54" y2="54" gradientUnits="userSpaceOnUse">
              <stop stop-color="#4ade80"/>
              <stop offset="1" stop-color="#16a34a"/>
            </linearGradient>
          </defs>
          <circle cx="32" cy="32" r="28" fill="url(#gc)"/>
          <circle cx="32" cy="32" r="22" fill="rgba(255,255,255,0.15)"/>
          <path d="M22 32L28.5 38.5L42 25" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <p style="margin:0;font-size:18px;font-weight:900;color:#166534;">Đơn hàng hoàn tất!</p>
        <p style="margin:4px 0 0;font-size:13px;color:#16a34a;">
          Mã đơn: <strong style="font-family:monospace;">#${orderCode}</strong>
        </p>
      </div>
    </div>

    <p style="margin:0 0 24px;color:#334155;font-size:15px;line-height:1.75;text-align:center;">
      Xin chào <strong style="color:#0f172a;">${customerName}</strong>!<br/>
      Tài khoản của bạn đã được giao thành công.<br/>
      Vào trang đơn hàng để xem thông tin đăng nhập.
    </p>

    <!-- Items -->
    ${items.length > 0 ? `
    <p style="margin:0 0 12px;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:#64748b;">Sản phẩm đã mua</p>
    <div style="margin-bottom:24px;">
      ${itemsTable(items)}
    </div>` : `
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:14px;padding:16px 20px;margin-bottom:24px;text-align:center;">
      <p style="margin:0;font-size:14px;font-weight:700;color:#0f172a;">Tổng thanh toán</p>
      <p style="margin:6px 0 0;font-size:24px;font-weight:900;color:#16a34a;">${vnd(total)}</p>
    </div>`}

    <!-- Warranty -->
    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:14px;margin-bottom:28px;">
      <tr>
        <td style="padding:16px 20px;vertical-align:top;width:28px;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="#dcfce7" stroke="#16a34a" stroke-width="1.8"/>
            <path d="M9 12l2 2 4-4" stroke="#16a34a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </td>
        <td style="padding:16px 20px 16px 8px;vertical-align:top;">
          <p style="margin:0;font-size:14px;font-weight:700;color:#166534;">Chính sách bảo hành</p>
          <p style="margin:4px 0 0;font-size:13px;color:#16a34a;line-height:1.6;">
            XanhSoft bảo hành đăng nhập lần đầu. Nếu không đăng nhập được,
            liên hệ Zalo <strong>0888993991</strong> để được hỗ trợ đổi tài khoản mới hoặc hoàn tiền trong 24h.
          </p>
        </td>
      </tr>
    </table>

    <!-- CTA -->
    <div style="text-align:center;">
      <a href="${SITE}/account/orders/${orderCode}"
        style="display:inline-block;background:linear-gradient(135deg,#16a34a,#059669);color:white;font-size:15px;font-weight:800;text-decoration:none;padding:15px 36px;border-radius:14px;box-shadow:0 6px 20px rgba(22,163,74,0.32);">
        Xem thông tin tài khoản
      </a>
      <p style="margin:12px 0 0;font-size:12px;color:#94a3b8;">
        <a href="${SITE}/account/orders" style="color:#64748b;text-decoration:none;">Xem tất cả đơn hàng</a>
      </p>
    </div>
  </div>

  ${emailFooter()}`)

  await resend.emails.send({
    from: `XanhSoft <${FROM}>`,
    to,
    subject: `Tài khoản đã sẵn sàng — Đơn #${orderCode} hoàn tất | XanhSoft`,
    html,
  })
}