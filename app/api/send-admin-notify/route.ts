import { Resend } from 'resend'
import { NextResponse } from 'next/server'
import { sendOrderCompletedEmail } from '@/lib/email'

const resend = new Resend(process.env.RESEND_API_KEY)
const ADMIN_EMAIL = 'brakehuu@gmail.com'
const FROM = process.env.RESEND_FROM ?? 'no-reply@xanhsoft.com'

const vnd = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n)

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { type, orderCode, customerName, customerEmail, total, items } = body

    if (!type || !orderCode) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const isNew = type === 'new_order'
    const isComplete = type === 'order_completed'

    if (!isNew && !isComplete) {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }

    // Gửi email cho khách khi đơn hoàn thành
    if (isComplete && customerEmail) {
      sendOrderCompletedEmail({
        to: customerEmail,
        customerName: customerName || 'Khách hàng',
        orderCode,
        items: items ?? [],
        total: total ?? 0,
      }).catch(err => console.error('Order completed customer email failed:', err))
    }

    // Email cho admin
    const itemRows = (items ?? []).map((item: any) => `
      <tr>
        <td style="padding:10px 14px;border-bottom:1px solid #f1f5f9;font-size:14px;color:#0f172a;">
          ${item.name}${item.variant ? `<br/><span style="color:#64748b;font-size:12px;">${item.variant}</span>` : ''}
        </td>
        <td style="padding:10px 14px;border-bottom:1px solid #f1f5f9;font-size:14px;color:#64748b;text-align:center;">×${item.quantity}</td>
        <td style="padding:10px 14px;border-bottom:1px solid #f1f5f9;font-size:14px;color:#2563eb;text-align:right;font-weight:700;">
          ${vnd(item.price * item.quantity)}
        </td>
      </tr>`).join('')

    const badgeColor = isNew ? '#2563eb' : '#16a34a'
    const badgeBg = isNew ? '#eff6ff' : '#dcfce7'
    const headerGrad = isNew
      ? 'linear-gradient(135deg,#0f172a 0%,#1e40af 100%)'
      : 'linear-gradient(135deg,#052e16 0%,#166534 100%)'

    const statusIcon = isNew
      ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" stroke="white" stroke-width="1.8" stroke-linejoin="round"/><line x1="3" y1="6" x2="21" y2="6" stroke="white" stroke-width="1.8"/><path d="M16 10a4 4 0 01-8 0" stroke="white" stroke-width="1.8" stroke-linecap="round"/></svg>`
      : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" stroke="white" stroke-width="1.8"/><path d="M8 12l3 3 5-5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`

    const html = `<!DOCTYPE html>
<html lang="vi">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Inter',system-ui,sans-serif;">
<div style="max-width:600px;margin:32px auto;padding:0 16px 40px;">
<div style="background:white;border-radius:24px;overflow:hidden;box-shadow:0 4px 32px rgba(15,23,42,0.10);border:1px solid #e2e8f0;">

  <!-- Header -->
  <div style="background:${headerGrad};padding:32px 36px;">
    <div style="display:inline-flex;align-items:center;gap:10px;margin-bottom:20px;">
      <div style="width:36px;height:36px;background:rgba(255,255,255,0.15);border-radius:9px;display:flex;align-items:center;justify-content:center;">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L2 7l10 5 10-5-10-5z" fill="white" opacity="0.9"/>
          <path d="M2 17l10 5 10-5" stroke="white" stroke-width="2" stroke-linecap="round"/>
          <path d="M2 12l10 5 10-5" stroke="white" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </div>
      <span style="color:white;font-size:16px;font-weight:900;letter-spacing:-0.3px;">XanhSoft Admin</span>
    </div>
    <div style="display:inline-flex;align-items:center;gap:8px;background:${badgeBg};padding:6px 14px;border-radius:100px;margin-bottom:14px;">
      ${statusIcon}
      <span style="color:${badgeColor};font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:0.16em;">
        ${isNew ? 'Đơn hàng mới' : 'Đơn hoàn thành'}
      </span>
    </div>
    <h1 style="margin:0 0 6px;color:white;font-size:24px;font-weight:900;line-height:1.3;">
      ${isNew ? 'Có đơn hàng mới cần xử lý' : 'Đơn hàng đã hoàn thành'}
    </h1>
    <p style="margin:0;color:rgba(255,255,255,0.7);font-size:14px;">
      ${isNew ? 'Kiểm tra và xác nhận thanh toán ngay.' : 'Đơn đã xác nhận — email giao tài khoản đã gửi cho khách.'}
    </p>
  </div>

  <div style="padding:28px 36px 0;">
    <!-- Order + Customer -->
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px;">
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:14px;padding:14px 16px;">
        <p style="margin:0 0 4px;font-size:10px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:#94a3b8;">Mã đơn</p>
        <p style="margin:0;font-size:17px;font-weight:900;color:#0f172a;font-family:monospace;">#${orderCode}</p>
      </div>
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:14px;padding:14px 16px;">
        <p style="margin:0 0 4px;font-size:10px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:#94a3b8;">Tổng tiền</p>
        <p style="margin:0;font-size:17px;font-weight:900;color:#2563eb;">${vnd(total ?? 0)}</p>
      </div>
    </div>
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:14px;padding:14px 16px;margin-bottom:20px;">
      <p style="margin:0 0 4px;font-size:10px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:#94a3b8;">Khách hàng</p>
      <p style="margin:0;font-size:15px;font-weight:700;color:#0f172a;">${customerName}</p>
      <p style="margin:2px 0 0;font-size:13px;color:#64748b;">${customerEmail}</p>
    </div>

    <!-- Items -->
    ${items?.length ? `
    <p style="margin:0 0 10px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.14em;color:#64748b;">Sản phẩm</p>
    <table style="width:100%;border-collapse:collapse;border:1px solid #e2e8f0;border-radius:14px;overflow:hidden;margin-bottom:20px;">
      <thead>
        <tr style="background:#f1f5f9;">
          <th style="padding:10px 14px;text-align:left;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:#94a3b8;">Sản phẩm</th>
          <th style="padding:10px 14px;text-align:center;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:#94a3b8;">SL</th>
          <th style="padding:10px 14px;text-align:right;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:#94a3b8;">Tiền</th>
        </tr>
      </thead>
      <tbody>${itemRows}</tbody>
    </table>` : ''}
  </div>

  <!-- CTA -->
  <div style="padding:8px 36px 32px;text-align:center;">
    <a href="https://xanhsoft.com/admin/orders"
      style="display:inline-block;background:linear-gradient(135deg,#1d4ed8,#0891b2);color:white;font-size:14px;font-weight:800;text-decoration:none;padding:13px 30px;border-radius:12px;letter-spacing:0.02em;">
      Vào Admin xử lý đơn hàng
    </a>
  </div>

  <!-- Footer -->
  <div style="border-top:1px solid #f1f5f9;padding:18px 36px;text-align:center;">
    <p style="margin:0;font-size:12px;color:#94a3b8;">
      XanhSoft Admin &nbsp;·&nbsp;
      <a href="https://xanhsoft.com/admin" style="color:#2563eb;text-decoration:none;">xanhsoft.com/admin</a>
    </p>
  </div>
</div>
</div>
</body>
</html>`

    const { error } = await resend.emails.send({
      from: `XanhSoft <${FROM}>`,
      to: ADMIN_EMAIL,
      subject: isNew
        ? `Đơn hàng mới #${orderCode} — ${customerName}`
        : `Đơn hoàn thành #${orderCode} — ${customerName}`,
      html,
    })

    if (error) {
      console.error('Admin notify email error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error('Admin notify error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}