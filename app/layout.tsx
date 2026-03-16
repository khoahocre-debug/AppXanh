import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'sonner'

export const metadata: Metadata = {
  title: {
    default: 'App Xanh — Tài khoản số giá xanh, giao nhanh, dùng ổn định',
    template: '%s | App Xanh',
  },
  description: 'Mua tài khoản ChatGPT, Claude, Canva, YouTube Premium giá rẻ. Giao nhanh, bảo hành tận tâm.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body>
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  )
}