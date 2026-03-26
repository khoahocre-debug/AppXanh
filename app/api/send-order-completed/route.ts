import { NextResponse } from 'next/server'
import { sendOrderCompletedEmail } from '@/lib/email'

export async function POST(req: Request) {
  try {
    const { email, customerName, orderCode, items, total } = await req.json()
    if (!email || !orderCode) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }
    await sendOrderCompletedEmail({
      to: email,
      customerName: customerName || 'Khách hàng',
      orderCode,
      items: items ?? [],
      total: total ?? 0,
    })
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error('send-order-completed error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}