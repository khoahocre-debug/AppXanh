import { NextRequest, NextResponse } from 'next/server'
import { sendOrderConfirmationEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const { email, customerName, orderCode, items, total } = await req.json()
    if (!email || !orderCode) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    await sendOrderConfirmationEmail({ to: email, customerName, orderCode, items, total })
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}