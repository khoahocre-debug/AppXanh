import { Resend } from 'resend'
import { NextResponse } from 'next/server'

const resend = new Resend(process.env.RESEND_API_KEY)
const ADMIN_EMAIL = 'brakehuu@gmail.com'
const FROM = 'no-reply@xanhsoft.com'

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

    const subject = isNew
      ? `🛒 Đơn hàng mới #${orderCode} — ${customerName}`
      : `✅ Đơn hoàn thành #${orderCode} — ${customerName}`

    const itemRows = (items ?? []).map((item: any) => `
      <tr>
        <td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;font-size:14px;color:#0f172a;">
          ${item.name}${item.variant ? ' <span style="color:#64748b;font-size:12px;">— ' + item.variant + '</span>' : ''}
        </td>
        <td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;font-size:14px;color:#64748b;text-align:center;">x${item.quantity}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;font-size:14px;color:#2563eb;text-align:right;font-weight:700;">
          ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price * item.quantity)}
        </td>
      </tr>
    `).join('')

    const totalFormatted = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(total ?? 0)

    const badgeColor = isNew ? '#2563eb' : '#16a34a'
    const badgeBg = isNew ? '#eff6ff' : '#dcfce7'
    const badgeText = isNew ? '🛒 ĐƠN HÀNG MỚI' : '✅ HOÀN THÀNH'

    const html = `
<!DOCTYPE html>
<html lang="vi">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:'Inter',system-ui,sans-serif;">
  <div style="max-width:600px;margin:32px auto;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 4px 24px rgba(15,23,42,0.08);border:1px solid #e2e8f0;">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#0f172a 0%,#1d4ed8 100%);padding:32px 36px;">
      <div style="display:inline-block;background:${badgeBg};color:${badgeColor};font-size:11px;font-weight:800;letter-spacing:0.18em;text-transform:uppercase;padding:6px 14px;border-radius:100px;margin-bottom:16px;">
        ${badgeText}
      </div>
      <h1 style="margin:0;font-size:26px;font-weight:900;color:#ffffff;line-height:1.3;">
        ${isNew ? 'Có đơn hàng mới cần xử lý' : 'Đơn hàng đã hoàn thành'}
      </h1>
      <p style="margin:8px 0 0;font-size:14px;color:#93c5fd;">
        ${isNew ? 'Khách hàng vừa đặt đơn, kiểm tra và xác nhận thanh toán.' : 'Đơn hàng đã được xác nhận và giao thành công.'}
      </p>
    </div>

    <!-- Order info -->
    <div style="padding:28px 36px 0;">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:16px;padding:16px;">
          <p style="margin:0 0 4px;font-size:11px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:#94a3b8;">Mã đơn hàng</p>
          <p style="margin:0;font-size:18px;font-weight:900;color:#0f172a;font-family:monospace;">#${orderCode}</p>
        </div>
        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:16px;padding:16px;">
          <p style="margin:0 0 4px;font-size:11px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:#94a3b8;">Tổng tiền</p>
          <p style="margin:0;font-size:18px;font-weight:900;color:#2563eb;">${totalFormatted}</p>
        </div>
      </div>

      <div style="margin-top:12px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:16px;padding:16px;">
        <p style="margin:0 0 4px;font-size:11px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:#94a3b8;">Khách hàng</p>
        <p style="margin:0;font-size:15px;font-weight:700;color:#0f172a;">${customerName}</p>
        <p style="margin:2px 0 0;font-size:13px;color:#64748b;">${customerEmail}</p>
      </div>
    </div>

    <!-- Items -->
    ${items?.length ? `
    <div style="padding:24px 36px 0;">
      <p style="margin:0 0 12px;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.14em;color:#64748b;">Sản phẩm</p>
      <table style="width:100%;border-collapse:collapse;background:#f8fafc;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;">
        <thead>
          <tr style="background:#f1f5f9;">
            <th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.14em;color:#94a3b8;">Sản phẩm</th>
            <th style="padding:10px 12px;text-align:center;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.14em;color:#94a3b8;">SL</th>
            <th style="padding:10px 12px;text-align:right;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.14em;color:#94a3b8;">Thành tiền</th>
          </tr>
        </thead>
        <tbody>${itemRows}</tbody>
      </table>
    </div>
    ` : ''}

    <!-- CTA -->
    <div style="padding:28px 36px 32px;text-align:center;">
      <a href="https://xanhsoft.com/admin/orders"
        style="display:inline-block;background:linear-gradient(135deg,#1d4ed8,#0891b2);color:#ffffff;font-size:15px;font-weight:800;text-decoration:none;padding:14px 32px;border-radius:14px;letter-spacing:0.02em;">
        Vào Admin Xử Lý Đơn →
      </a>
    </div>

    <!-- Footer -->
    <div style="border-top:1px solid #f1f5f9;padding:20px 36px;text-align:center;">
      <p style="margin:0;font-size:12px;color:#94a3b8;">
        XanhSoft Admin • <a href="https://xanhsoft.com/admin" style="color:#2563eb;text-decoration:none;">xanhsoft.com/admin</a>
      </p>
    </div>
  </div>
</body>
</html>`

    const { error } = await resend.emails.send({
      from: FROM,
      to: ADMIN_EMAIL,
      subject,
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