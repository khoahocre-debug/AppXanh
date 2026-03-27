import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendOrderCompletedEmail } from '@/lib/email'
import { Resend } from 'resend'

const CRON_SECRET = process.env.CRON_SECRET ?? ''
const ADMIN_EMAIL = 'brakehuu@gmail.com'
const FROM = process.env.RESEND_FROM ?? 'no-reply@xanhsoft.com'

// Supabase service role — bypass RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const resend = new Resend(process.env.RESEND_API_KEY)

const vnd = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n)

// Retry backoff theo số lần thử
function nextRetryAt(attempts: number): Date {
  const minutes = [1, 5, 15, 60, 360][Math.min(attempts, 4)]
  return new Date(Date.now() + minutes * 60 * 1000)
}

export async function POST(req: Request) {
  // Xác thực CRON_SECRET
  const auth = req.headers.get('authorization')
  if (!CRON_SECRET || auth !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Lấy pending jobs
  const { data: jobs, error: fetchError } = await supabase
    .from('mail_jobs')
    .select(`
      id, order_id, type, attempts,
      orders (
        order_code, customer_name, customer_email, total,
        order_items (product_name, variant_name, quantity, unit_price)
      )
    `)
    .eq('status', 'pending')
    .lte('next_retry_at', new Date().toISOString())
    .lt('attempts', 5)
    .limit(20)

  if (fetchError) {
    console.error('Fetch mail_jobs error:', fetchError)
    return NextResponse.json({ error: fetchError.message }, { status: 500 })
  }

  if (!jobs?.length) {
    return NextResponse.json({ processed: 0 })
  }

  let sent = 0
  let failed = 0

  for (const job of jobs) {
    const order = job.orders as any
    if (!order) continue

    const items = (order.order_items ?? []).map((i: any) => ({
      name: i.product_name,
      variant: i.variant_name ?? null,
      quantity: i.quantity,
      price: i.unit_price,
    }))

    try {
      if (job.type === 'customer_paid' && order.customer_email) {
        await sendOrderCompletedEmail({
          to: order.customer_email,
          customerName: order.customer_name || 'Khách hàng',
          orderCode: order.order_code,
          items,
          total: order.total ?? 0,
        })

        // Ghi nhận đã gửi
        await supabase
          .from('orders')
          .update({ paid_email_customer_sent_at: new Date().toISOString() })
          .eq('order_code', order.order_code)
      }

      if (job.type === 'admin_paid') {
        const itemRows = items.map((item: any) => `
          <tr>
            <td style="padding:10px 14px;border-bottom:1px solid #f1f5f9;font-size:14px;color:#0f172a;">
              ${item.name}${item.variant ? `<br/><span style="color:#64748b;font-size:12px;">${item.variant}</span>` : ''}
            </td>
            <td style="padding:10px 14px;border-bottom:1px solid #f1f5f9;font-size:14px;color:#64748b;text-align:center;">×${item.quantity}</td>
            <td style="padding:10px 14px;border-bottom:1px solid #f1f5f9;font-size:14px;color:#2563eb;text-align:right;font-weight:700;">
              ${vnd(item.price * item.quantity)}
            </td>
          </tr>`).join('')

        await resend.emails.send({
          from: `XanhSoft <${FROM}>`,
          to: ADMIN_EMAIL,
          subject: `Đơn đã thanh toán #${order.order_code} — ${order.customer_name}`,
          html: `<!DOCTYPE html>
<html lang="vi">
<head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Inter',system-ui,sans-serif;">
<div style="max-width:600px;margin:32px auto;padding:0 16px 40px;">
<div style="background:white;border-radius:24px;overflow:hidden;box-shadow:0 4px 32px rgba(15,23,42,0.10);border:1px solid #e2e8f0;">

  <div style="background:linear-gradient(135deg,#052e16 0%,#166534 100%);padding:32px 36px;">
    <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
      <tr>
        <td style="width:36px;height:36px;background:rgba(255,255,255,0.15);border-radius:9px;text-align:center;vertical-align:middle;">
          <span style="color:white;font-size:16px;font-weight:900;display:block;line-height:36px;">X</span>
        </td>
        <td style="padding-left:10px;vertical-align:middle;">
          <span style="color:white;font-size:16px;font-weight:900;">XanhSoft Admin</span>
        </td>
      </tr>
    </table>
    <div style="display:inline-block;background:#dcfce7;color:#16a34a;font-size:11px;font-weight:800;letter-spacing:0.16em;text-transform:uppercase;padding:6px 14px;border-radius:100px;margin-bottom:14px;">
      ✓ Đơn đã thanh toán
    </div>
    <h1 style="margin:0 0 6px;color:white;font-size:24px;font-weight:900;">Cần giao tài khoản cho khách</h1>
    <p style="margin:0;color:rgba(255,255,255,0.7);font-size:14px;">Khách đã thanh toán thành công. Vào admin để xử lý đơn.</p>
  </div>

  <div style="padding:28px 36px 0;">
    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom:12px;">
      <tr>
        <td style="width:50%;padding-right:6px;">
          <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:14px;padding:14px 16px;">
            <p style="margin:0 0 4px;font-size:10px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:#94a3b8;">Mã đơn</p>
            <p style="margin:0;font-size:17px;font-weight:900;color:#0f172a;font-family:monospace;">#${order.order_code}</p>
          </div>
        </td>
        <td style="width:50%;padding-left:6px;">
          <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:14px;padding:14px 16px;">
            <p style="margin:0 0 4px;font-size:10px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:#94a3b8;">Tổng tiền</p>
            <p style="margin:0;font-size:17px;font-weight:900;color:#16a34a;">${vnd(order.total ?? 0)}</p>
          </div>
        </td>
      </tr>
    </table>
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:14px;padding:14px 16px;margin-bottom:20px;">
      <p style="margin:0 0 4px;font-size:10px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:#94a3b8;">Khách hàng</p>
      <p style="margin:0;font-size:15px;font-weight:700;color:#0f172a;">${order.customer_name}</p>
      <p style="margin:2px 0 0;font-size:13px;color:#64748b;">${order.customer_email}</p>
    </div>

    ${items.length ? `
    <p style="margin:0 0 10px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.14em;color:#64748b;">Sản phẩm</p>
    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border:1px solid #e2e8f0;border-radius:14px;overflow:hidden;margin-bottom:20px;">
      <thead>
        <tr style="background:#f1f5f9;">
          <th style="padding:10px 14px;text-align:left;font-size:11px;font-weight:700;text-transform:uppercase;color:#94a3b8;">Sản phẩm</th>
          <th style="padding:10px 14px;text-align:center;font-size:11px;font-weight:700;text-transform:uppercase;color:#94a3b8;">SL</th>
          <th style="padding:10px 14px;text-align:right;font-size:11px;font-weight:700;text-transform:uppercase;color:#94a3b8;">Tiền</th>
        </tr>
      </thead>
      <tbody>${itemRows}</tbody>
    </table>` : ''}
  </div>

  <div style="padding:8px 36px 32px;text-align:center;">
    <a href="https://xanhsoft.com/admin/orders/${order.order_code}"
      style="display:inline-block;background:linear-gradient(135deg,#16a34a,#059669);color:white;font-size:14px;font-weight:800;text-decoration:none;padding:13px 30px;border-radius:12px;">
      Vào Admin Giao Tài Khoản →
    </a>
  </div>

  <div style="border-top:1px solid #f1f5f9;padding:18px 36px;text-align:center;">
    <p style="margin:0;font-size:12px;color:#94a3b8;">XanhSoft Admin · xanhsoft.com/admin</p>
  </div>
</div>
</div>
</body>
</html>`,
        })

        await supabase
          .from('orders')
          .update({ paid_email_admin_sent_at: new Date().toISOString() })
          .eq('order_code', order.order_code)
      }

      // Mark sent
      await supabase
        .from('mail_jobs')
        .update({
          status: 'sent',
          attempts: job.attempts + 1,
          updated_at: new Date().toISOString(),
        })
        .eq('id', job.id)

      sent++
    } catch (err: any) {
      console.error(`Mail job ${job.id} failed:`, err.message)

      const newAttempts = job.attempts + 1
      await supabase
        .from('mail_jobs')
        .update({
          status: newAttempts >= 5 ? 'failed' : 'pending',
          attempts: newAttempts,
          last_error: err.message,
          next_retry_at: nextRetryAt(newAttempts).toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', job.id)

      failed++
    }
  }

  return NextResponse.json({ processed: jobs.length, sent, failed })
}

// GET để Vercel Cron gọi được
export async function GET(req: Request) {
  return POST(req)
}
