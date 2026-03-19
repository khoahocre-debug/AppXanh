import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'sonner'

export const metadata: Metadata = {
  metadataBase: new URL('https://xanhsoft.com'),
  title: {
    default: 'XanhSoft - Shop Tài Khoản Premium Giá Rẻ',
    template: '%s | XanhSoft',
  },
  description: 'Mua tài khoản ChatGPT, Claude, Canva, Coursera và 100+ app premium tại XanhSoft. Tiết kiệm đến 90% so với mua trực tiếp. Giao ngay sau khi thanh toán!',
  keywords: ['tài khoản chatgpt giá rẻ', 'mua claude pro', 'canva pro giá rẻ', 'coursera plus', 'youtube premium giá rẻ', 'tài khoản premium', 'xanhsoft', 'app premium việt nam'],
  authors: [{ name: 'XanhSoft', url: 'https://xanhsoft.com' }],
  creator: 'XanhSoft',
  publisher: 'XanhSoft',
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    url: 'https://xanhsoft.com',
    siteName: 'XanhSoft',
    title: 'XanhSoft - Shop Tài Khoản Premium Giá Rẻ',
    description: 'Mua tài khoản ChatGPT, Claude, Canva, Coursera và 100+ app premium tại XanhSoft. Tiết kiệm đến 90% so với mua trực tiếp. Giao ngay sau khi thanh toán!',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'XanhSoft - Shop Tài Khoản Premium' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'XanhSoft - Shop Tài Khoản Premium Giá Rẻ',
    description: 'Mua tài khoản ChatGPT, Claude, Canva, Coursera và 100+ app premium. Tiết kiệm đến 90%!',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  alternates: { canonical: 'https://xanhsoft.com' },
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