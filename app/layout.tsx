import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'sonner'

export const metadata: Metadata = {
  title: 'App Xanh — Tài Khoản Số Giá Rẻ',
  description: 'Mua tài khoản ChatGPT, Claude, Canva, YouTube Premium giá rẻ hơn 90%. Giao hàng tự động 24/7, bảo hành đăng nhập.',
  keywords: 'tài khoản chatgpt giá rẻ, claude pro, canva pro, youtube premium việt nam',
  openGraph: {
    title: 'App Xanh — Tài Khoản Số Giá Rẻ',
    description: 'Mua tài khoản premium giá rẻ hơn 90%. Giao tự động 24/7.',
    url: 'https://appxanh.com',
    siteName: 'App Xanh',
    locale: 'vi_VN',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body>
        <Toaster position="top-right" richColors />
        {children}
      </body>
    </html>
  )
}