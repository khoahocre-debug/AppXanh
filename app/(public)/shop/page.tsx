import { Suspense } from 'react'
import { ShopContent } from '@/components/shop/ShopContent'

export const metadata = {
  title: 'Sản Phẩm',
  description: 'Mua tài khoản ChatGPT, Claude, Canva, YouTube Premium giá rẻ nhất',
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