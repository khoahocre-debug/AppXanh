import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = process.env.RESEND_FROM ?? 'onboarding@resend.dev'
const SITE = 'https://appxanh.com'

// ── Welcome email ──────────────────────────────────────────
export async function sendWelcomeEmail({
  to, name,
}: { to: string; name: string }) {
  await resend.emails.send({
    from: `App Xanh <${FROM}>`,
    to,
    subject: '🎉 Chào mừng bạn đến với App Xanh!',
    html: `
<!DOCTYPE html>
<html lang="vi">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#F8FAFC;font-family:'Segoe UI',Arial,sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:white;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#1e40af,#0891b2);padding:36px 40px;text-align:center;">
      <div style="width:52px;height:52px;background:rgba(255,255,255,0.15);border-radius:14px;display:inline-flex;align-items:center;justify-content:center;margin-bottom:16px;">
        <span style="color:white;font-size:22px;font-weight:900;">A</span>
      </div>
      <h1 style="margin:0;color:white;font-size:24px;font-weight:900;letter-spacing:-0.5px;">App Xanh</h1>
      <p style="margin:6px 0 0;color:rgba(255,255,255,0.75);font-size:13px;">Kho Tài Khoản Premium Giá Xanh</p>
    </div>

    <!-- Body -->
    <div style="padding:36px 40px;">
      <h2 style="margin:0 0 8px;font-size:22px;font-weight:800;color:#0f172a;">Chào mừng, ${name}! 🎉</h2>
      <p style="margin:0 0 20px;color:#475569;line-height:1.7;font-size:15px;">
        Tài khoản App Xanh của bạn đã được tạo thành công. Bây giờ bạn có thể mua tài khoản premium với giá rẻ hơn đến <strong style="color:#2563eb;">90%</strong>!
      </p>

      <!-- Benefits -->
      <div style="background:#f0f9ff;border-radius:14px;padding:20px;margin-bottom:24px;">
        <p style="margin:0 0 12px;font-weight:700;color:#1e40af;font-size:14px;">✨ Bạn có thể làm gì với App Xanh?</p>
        <div style="display:grid;gap:8px;">
          ${['🤖 Mua ChatGPT Plus, Claude Pro giá cực rẻ', '🎨 Canva Pro, Adobe CC tiết kiệm 90%', '🎬 YouTube Premium, CapCut Pro', '⚡ Giao hàng tự động trong 5 phút', '🛡️ Bảo hành đăng nhập trọn gói'].map(item => `
          <div style="display:flex;align-items:center;gap:8px;font-size:13px;color:#374151;">${item}</div>
          `).join('')}
        </div>
      </div>

      <!-- CTA -->
      <div style="text-align:center;margin-bottom:28px;">
        <a href="${SITE}/shop" style="display:inline-block;background:linear-gradient(135deg,#2563eb,#1d4ed8);color:white;font-weight:700;font-size:15px;padding:14px 32px;border-radius:12px;text-decoration:none;box-shadow:0 4px 14px rgba(37,99,235,0.35);">
          🛍️ Xem Sản Phẩm Ngay →
        </a>
      </div>

      <p style="margin:0;color:#94a3b8;font-size:13px;text-align:center;line-height:1.6;">
        Cần hỗ trợ? Liên hệ qua <a href="https://zalo.me/0888993991" style="color:#2563eb;font-weight:600;">Zalo 0888993991</a><br/>
        Hỗ trợ 8:00 – 22:00 hàng ngày
      </p>
    </div>

    <!-- Footer -->
    <div style="background:#f8fafc;padding:20px 40px;border-top:1px solid #e2e8f0;text-align:center;">
      <p style="margin:0;color:#94a3b8;font-size:12px;">
        © 2025 App Xanh · <a href="${SITE}" style="color:#2563eb;">appxanh.com</a>
      </p>
    </div>
  </div>
</body>
</html>`,
  })
}

// ── Order confirmation email ───────────────────────────────
export async function sendOrderConfirmationEmail({
  to, customerName, orderCode, items, total,
}: {
  to: string
  customerName: string
  orderCode: string
  items: { name: string; variant?: string; quantity: number; price: number }[]
  total: number
}) {
  const formatPrice = (n: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n)

  await resend.emails.send({
    from: `App Xanh <${FROM}>`,
    to,
    subject: `✅ Đặt hàng thành công #${orderCode} — App Xanh`,
    html: `
<!DOCTYPE html>
<html lang="vi">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#F8FAFC;font-family:'Segoe UI',Arial,sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:white;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#1e40af,#0891b2);padding:36px 40px;text-align:center;">
      <div style="width:52px;height:52px;background:rgba(255,255,255,0.15);border-radius:14px;display:inline-flex;align-items:center;justify-content:center;margin-bottom:16px;">
        <span style="color:white;font-size:22px;font-weight:900;">A</span>
      </div>
      <h1 style="margin:0;color:white;font-size:24px;font-weight:900;">App Xanh</h1>
      <p style="margin:6px 0 0;color:rgba(255,255,255,0.75);font-size:13px;">Xác nhận đơn hàng</p>
    </div>

    <!-- Body -->
    <div style="padding:36px 40px;">
      <div style="display:flex;align-items:center;gap:12px;background:#f0fdf4;border-radius:14px;padding:16px 20px;margin-bottom:24px;">
        <span style="font-size:28px;">✅</span>
        <div>
          <p style="margin:0;font-weight:800;color:#166534;font-size:16px;">Đặt hàng thành công!</p>
          <p style="margin:4px 0 0;color:#16a34a;font-size:13px;">Mã đơn: <strong>#${orderCode}</strong></p>
        </div>
      </div>

      <p style="margin:0 0 20px;color:#475569;line-height:1.7;font-size:15px;">
        Xin chào <strong>${customerName}</strong>! App Xanh đã nhận đơn hàng của bạn.
        Vui lòng hoàn tất thanh toán để nhận tài khoản.
      </p>

      <!-- Order items -->
      <div style="border:1px solid #e2e8f0;border-radius:14px;overflow:hidden;margin-bottom:20px;">
        <div style="background:#f8fafc;padding:12px 16px;border-bottom:1px solid #e2e8f0;">
          <p style="margin:0;font-weight:700;color:#0f172a;font-size:13px;">📦 Sản Phẩm</p>
        </div>
        ${items.map(item => `
        <div style="padding:14px 16px;border-bottom:1px solid #f1f5f9;display:flex;justify-content:space-between;align-items:center;">
          <div>
            <p style="margin:0;font-weight:600;color:#0f172a;font-size:14px;">${item.name}</p>
            ${item.variant ? `<p style="margin:3px 0 0;color:#64748b;font-size:12px;">${item.variant}</p>` : ''}
            <p style="margin:3px 0 0;color:#94a3b8;font-size:12px;">x${item.quantity}</p>
          </div>
          <p style="margin:0;font-weight:700;color:#2563eb;font-size:14px;">${formatPrice(item.price * item.quantity)}</p>
        </div>
        `).join('')}
        <div style="padding:14px 16px;display:flex;justify-content:space-between;align-items:center;background:#eff6ff;">
          <p style="margin:0;font-weight:800;color:#1e40af;font-size:15px;">Tổng cộng</p>
          <p style="margin:0;font-weight:900;color:#2563eb;font-size:18px;">${formatPrice(total)}</p>
        </div>
      </div>

      <!-- Bank info -->
      <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:14px;padding:16px 20px;margin-bottom:24px;">
        <p style="margin:0 0 10px;font-weight:700;color:#92400e;font-size:14px;">💳 Thanh Toán Chuyển Khoản</p>
        <table style="width:100%;font-size:13px;">
          <tr><td style="color:#78350f;padding:3px 0;width:40%;">Ngân hàng</td><td style="font-weight:700;color:#0f172a;">ACB</td></tr>
          <tr><td style="color:#78350f;padding:3px 0;">Số tài khoản</td><td style="font-weight:700;color:#0f172a;font-family:monospace;">62291</td></tr>
          <tr><td style="color:#78350f;padding:3px 0;">Chủ tài khoản</td><td style="font-weight:700;color:#0f172a;">NGUYEN HUU THANG</td></tr>
          <tr><td style="color:#78350f;padding:3px 0;">Số tiền</td><td style="font-weight:800;color:#2563eb;font-size:15px;">${formatPrice(total)}</td></tr>
          <tr><td style="color:#78350f;padding:3px 0;">Nội dung CK</td><td style="font-weight:700;color:#0f172a;font-family:monospace;">APPXANH ${orderCode}</td></tr>
        </table>
      </div>

      <!-- CTA -->
      <div style="text-align:center;margin-bottom:28px;">
        <a href="${SITE}/account/orders/${orderCode}" style="display:inline-block;background:linear-gradient(135deg,#2563eb,#1d4ed8);color:white;font-weight:700;font-size:15px;padding:14px 32px;border-radius:12px;text-decoration:none;box-shadow:0 4px 14px rgba(37,99,235,0.35);">
          📦 Xem Chi Tiết Đơn Hàng →
        </a>
      </div>

      <p style="margin:0;color:#94a3b8;font-size:13px;text-align:center;line-height:1.6;">
        Sau khi chuyển khoản, bấm <strong>"Tôi Đã Chuyển Khoản"</strong> để admin xử lý nhanh hơn.<br/>
        Hỗ trợ: <a href="https://zalo.me/0888993991" style="color:#2563eb;font-weight:600;">Zalo 0888993991</a> · 8:00–22:00
      </p>
    </div>

    <!-- Footer -->
    <div style="background:#f8fafc;padding:20px 40px;border-top:1px solid #e2e8f0;text-align:center;">
      <p style="margin:0;color:#94a3b8;font-size:12px;">
        © 2025 App Xanh · <a href="${SITE}" style="color:#2563eb;">appxanh.com</a>
      </p>
    </div>
  </div>
</body>
</html>`,
  })
}