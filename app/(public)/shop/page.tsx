import { Suspense } from 'react'
import { ShopContent } from '@/components/shop/ShopContent'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Tất Cả Sản Phẩm Premium Giá Rẻ',
  description: 'Khám phá 100+ tài khoản premium giá rẻ tại XanhSoft: ChatGPT Plus, Claude Pro, Canva Pro, Coursera Plus, YouTube Premium. Tiết kiệm đến 90%. Giao ngay sau thanh toán!',
  keywords: ['mua tài khoản chatgpt', 'claude pro giá rẻ', 'canva pro', 'coursera plus', 'youtube premium giá rẻ', 'tài khoản premium việt nam'],
  alternates: { canonical: 'https://xanhsoft.com/shop' },
  openGraph: {
    title: 'Shop Tài Khoản Premium Giá Rẻ | XanhSoft',
    description: '100+ tài khoản premium giá rẻ nhất Việt Nam. Giao ngay sau thanh toán!',
    url: 'https://xanhsoft.com/shop',
    siteName: 'XanhSoft',
    locale: 'vi_VN',
    type: 'website',
  },
}

export default function ShopPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="h-8 w-48 rounded-xl animate-pulse mb-8" style={{ background: '#e2e8f0' }} />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card h-72 animate-pulse" style={{ background: '#f1f5f9' }} />
          ))}
        </div>
      </div>
    }>
      <ShopContent />
    </Suspense>
  )
}