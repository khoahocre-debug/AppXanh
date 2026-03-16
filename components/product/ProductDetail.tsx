'use client'
import { useState } from 'react'
import { useCartStore } from '@/lib/stores/cart'
import { formatPrice, discountPercent, cn } from '@/lib/utils'
import { toast } from 'sonner'
import Link from 'next/link'
import { ShoppingCart, Zap, Shield, Phone, Check, Minus, Plus, ChevronRight } from 'lucide-react'
import type { Product, ProductVariant } from '@/types'
import { useRouter } from 'next/navigation'

const ICONS: Record<string, React.ReactNode> = {
  'ai-chatbot': (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect width="120" height="120" rx="28" fill="#EFF6FF"/>
      <rect x="26" y="36" width="68" height="48" rx="12" fill="#2563EB"/>
      <circle cx="44" cy="60" r="8" fill="white" fillOpacity="0.9"/>
      <circle cx="76" cy="60" r="8" fill="white" fillOpacity="0.9"/>
      <circle cx="44" cy="60" r="4" fill="#2563EB"/>
      <circle cx="76" cy="60" r="4" fill="#2563EB"/>
      <path d="M50 73h20" stroke="white" strokeWidth="3.5" strokeLinecap="round"/>
      <path d="M47 36v-9M73 36v-9" stroke="#93C5FD" strokeWidth="3.5" strokeLinecap="round"/>
      <circle cx="47" cy="24" r="5" fill="#3B82F6"/>
      <circle cx="73" cy="24" r="5" fill="#3B82F6"/>
      <rect x="16" y="50" width="10" height="20" rx="5" fill="#93C5FD"/>
      <rect x="94" y="50" width="10" height="20" rx="5" fill="#93C5FD"/>
    </svg>
  ),
  'thiet-ke': (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect width="120" height="120" rx="28" fill="#F5F3FF"/>
      <circle cx="60" cy="60" r="32" fill="#7C3AED"/>
      <circle cx="60" cy="60" r="20" fill="white"/>
      <circle cx="60" cy="32" r="8" fill="#A78BFA"/>
      <circle cx="60" cy="88" r="8" fill="#A78BFA"/>
      <circle cx="32" cy="60" r="8" fill="#A78BFA"/>
      <circle cx="88" cy="60" r="8" fill="#A78BFA"/>
      <circle cx="60" cy="60" r="8" fill="#7C3AED"/>
    </svg>
  ),
  'video-am-nhac': (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect width="120" height="120" rx="28" fill="#FFF1F2"/>
      <rect x="16" y="28" width="88" height="64" rx="14" fill="#EF4444"/>
      <rect x="22" y="34" width="76" height="52" rx="10" fill="#FCA5A5" fillOpacity="0.25"/>
      <path d="M50 44l32 16-32 16V44z" fill="white"/>
    </svg>
  ),
  'hoc-tap': (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect width="120" height="120" rx="28" fill="#F0FDF4"/>
      <path d="M60 22L96 40L60 58L24 40L60 22Z" fill="#16A34A"/>
      <path d="M36 50v22c0 6 10.5 16 24 16s24-10 24-16V50" stroke="#16A34A" strokeWidth="4.5" strokeLinecap="round"/>
      <line x1="96" y1="40" x2="96" y2="68" stroke="#16A34A" strokeWidth="4.5" strokeLinecap="round"/>
      <circle cx="96" cy="74" r="6" fill="#16A34A"/>
    </svg>
  ),
  'giai-tri': (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect width="120" height="120" rx="28" fill="#FFFBEB"/>
      <circle cx="60" cy="60" r="36" fill="#D97706"/>
      <circle cx="60" cy="60" r="16" fill="#FEF3C7"/>
      <circle cx="60" cy="60" r="6" fill="#D97706"/>
      <path d="M60 24v10M60 86v10M24 60h10M86 60h10" stroke="#D97706" strokeWidth="4" strokeLinecap="round"/>
      <path d="M38 38l7 7M75 75l7 7M38 82l7-7M75 45l7-7" stroke="#FCD34D" strokeWidth="3.5" strokeLinecap="round"/>
    </svg>
  ),
  'cong-cu-dev': (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect width="120" height="120" rx="28" fill="#ECFEFF"/>
      <rect x="14" y="32" width="92" height="58" rx="10" fill="#0891B2"/>
      <rect x="22" y="40" width="76" height="36" rx="6" fill="#CFFAFE"/>
      <path d="M36 52l-10 8 10 8" stroke="#0891B2" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M54 52l10 8-10 8" stroke="#0891B2" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M44 96H60M60 96H76M60 90v6" stroke="#0891B2" strokeWidth="3.5" strokeLinecap="round"/>
    </svg>
  ),
}

const DEFAULT_ICON = (
  <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    <rect width="120" height="120" rx="28" fill="#F1F5F9"/>
    <rect x="30" y="30" width="60" height="60" rx="12" fill="#94A3B8"/>
    <path d="M45 60h30M60 45v30" stroke="white" strokeWidth="4" strokeLinecap="round"/>
  </svg>
)

const TABS = [
  { id: 'description', label: '📋 Mô Tả' },
  { id: 'guide', label: '📖 Hướng Dẫn' },
  { id: 'warranty', label: '🛡️ Bảo Hành' },
  { id: 'faq', label: '❓ FAQ' },
]

export function ProductDetail({ product }: { product: Product }) {
  const router = useRouter()
  const { addItem } = useCartStore()
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    product.product_variants?.find(v => v.is_default) ?? product.product_variants?.[0] ?? null
  )
  const [quantity, setQuantity] = useState(1)
  const [upgradeEmail, setUpgradeEmail] = useState('')
  const [activeTab, setActiveTab] = useState('description')

  const price = selectedVariant?.price ?? product.price
  const compareAt = selectedVariant?.compare_at_price ?? product.compare_at_price
  const discount = discountPercent(price, compareAt ?? 0)
  const isOutOfStock = product.stock === 0 || (selectedVariant ? selectedVariant.stock === 0 : false)
  const needsEmail = product.delivery_type === 'upgrade_owner' || product.delivery_type === 'both'
  const icon = ICONS[product.categories?.slug ?? ''] ?? DEFAULT_ICON

  const tabContent: Record<string, string | null | undefined> = {
    description: product.description_html,
    guide: product.usage_guide_html,
    warranty: product.warranty_html,
    faq: product.faq_html,
  }

  const handleAddToCart = () => {
    if (isOutOfStock) return
    addItem(product, selectedVariant, quantity, upgradeEmail)
    toast.success('Đã thêm vào giỏ hàng!', { description: product.name })
  }

  const handleBuyNow = () => {
    if (isOutOfStock) return
    addItem(product, selectedVariant, quantity, upgradeEmail)
    router.push('/checkout')
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm mb-8 flex-wrap" style={{ color: '#94A3B8' }}>
        <Link href="/" className="hover:text-blue-600 transition-colors">Trang chủ</Link>
        <ChevronRight size={14} />
        <Link href="/shop" className="hover:text-blue-600 transition-colors">Sản phẩm</Link>
        {product.categories && (
          <>
            <ChevronRight size={14} />
            <Link href={`/shop?category=${product.categories.slug}`} className="hover:text-blue-600 transition-colors">
              {product.categories.name}
            </Link>
          </>
        )}
        <ChevronRight size={14} />
        <span className="text-slate-700 font-medium line-clamp-1">{product.name}</span>
      </nav>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-12">

        {/* Left: Product visual */}
        <div className="space-y-4">
          {/* Main image */}
          <div
            className="relative w-full rounded-3xl overflow-hidden"
            style={{
              background: 'linear-gradient(145deg, #EFF6FF 0%, #E0F2FE 50%, #F0FDF4 100%)',
              paddingTop: '75%',
            }}
          >
            {/* Decorative blobs */}
            <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full opacity-30 pointer-events-none"
              style={{ background: 'radial-gradient(circle, #3B82F6, transparent)' }} />
            <div className="absolute -bottom-12 -left-12 w-44 h-44 rounded-full opacity-20 pointer-events-none"
              style={{ background: 'radial-gradient(circle, #06B6D4, transparent)' }} />

            {/* Product image hoặc icon fallback */}
<div className="absolute inset-0 flex items-center justify-center">
  {product.product_images && product.product_images.length > 0 ? (
    <img
      src={product.product_images.find((img: any) => img.sort_order === 0)?.image_url
        || product.product_images[0]?.image_url}
      alt={product.product_images[0]?.alt_text || product.name}
      className="w-full h-full object-cover"
    />
  ) : (
    <div className="w-40 h-40 md:w-48 md:h-48 drop-shadow-xl">
      {icon}
    </div>
  )}
</div>

            {/* Badges */}
            {product.badge_text && (
              <div className="absolute top-5 left-5">
                <span className="text-sm font-bold px-3 py-1.5 rounded-xl shadow-sm text-white"
                  style={{
                    background: product.badge_text === 'Hot' ? '#EF4444' : product.badge_text === 'Mới' ? '#22C55E' : '#F97316'
                  }}>
                  {product.badge_text}
                </span>
              </div>
            )}
            {discount >= 10 && (
              <div className="absolute top-5 right-5">
                <span className="text-sm font-black px-3 py-1.5 rounded-xl shadow-sm"
                  style={{ background: '#FEF9C3', color: '#854D0E' }}>
                  -{discount}%
                </span>
              </div>
            )}
          </div>

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: <Zap size={18} className="text-blue-600" />, label: 'Giao tức thì', sub: 'Sau thanh toán' },
              { icon: <Shield size={18} className="text-green-600" />, label: 'Bảo hành', sub: 'Đăng nhập lần đầu' },
              { icon: <Phone size={18} className="text-purple-600" />, label: 'Hỗ trợ', sub: 'Zalo 8:00–22:00' },
            ].map(item => (
              <div key={item.label}
                className="flex flex-col items-center text-center p-3 rounded-2xl border"
                style={{ borderColor: '#E2E8F0', background: 'white' }}>
                {item.icon}
                <p className="text-xs font-bold text-slate-800 mt-1.5">{item.label}</p>
                <p className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>{item.sub}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Info + Purchase */}
        <div className="flex flex-col gap-5">
          {/* Category */}
          {product.categories && (
            <Link href={`/shop?category=${product.categories.slug}`}
              className="inline-flex items-center gap-1.5 text-sm font-bold w-fit px-3 py-1.5 rounded-full transition-all"
              style={{ background: '#EFF6FF', color: '#2563EB' }}>
              {product.categories.name} →
            </Link>
          )}

          {/* Title */}
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight"
            style={{ fontFamily: 'Sora, sans-serif' }}>
            {product.name}
          </h1>

          {/* Short desc */}
          {product.short_description && (
            <p className="text-slate-500 leading-relaxed">{product.short_description}</p>
          )}

          {/* Price */}
          <div className="flex items-end gap-3 flex-wrap">
            <span className="text-4xl font-black" style={{ color: '#2563EB' }}>
              {formatPrice(price)}
            </span>
            {compareAt && compareAt > price && (
              <>
                <span className="text-xl text-slate-400 line-through mb-1">{formatPrice(compareAt)}</span>
                <span className="mb-1 text-sm font-bold px-2.5 py-1 rounded-xl"
                  style={{ background: '#FEE2E2', color: '#991B1B' }}>
                  Tiết kiệm {formatPrice(compareAt - price)}
                </span>
              </>
            )}
          </div>

          {/* Variants */}
          {product.product_variants && product.product_variants.length > 0 && (
            <div>
              <p className="text-sm font-bold text-slate-700 mb-2.5">
                {product.product_variants[0]?.name ?? 'Biến thể'}:
              </p>
              <div className="flex flex-wrap gap-2">
                {product.product_variants.map(variant => (
                  <button
                    key={variant.id}
                    onClick={() => setSelectedVariant(variant)}
                    disabled={variant.stock === 0}
                    className={cn(
                      'px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all',
                      variant.stock === 0 && 'opacity-40 cursor-not-allowed line-through'
                    )}
                    style={{
                      borderColor: selectedVariant?.id === variant.id ? '#2563EB' : '#E2E8F0',
                      background: selectedVariant?.id === variant.id ? '#EFF6FF' : 'white',
                      color: selectedVariant?.id === variant.id ? '#1D4ED8' : '#374151',
                    }}
                  >
                    {variant.option_value}
                    {variant.price && variant.price !== product.price && (
                      <span className="ml-1.5 text-xs opacity-70">— {formatPrice(variant.price)}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div>
            <p className="text-sm font-bold text-slate-700 mb-2.5">Số lượng:</p>
            <div className="flex items-center gap-4">
              <div className="flex items-center rounded-xl border-2 overflow-hidden" style={{ borderColor: '#E2E8F0' }}>
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="px-3 py-2.5 hover:bg-slate-50 transition-colors"
                >
                  <Minus size={16} className="text-slate-600" />
                </button>
                <span className="w-12 text-center font-bold text-slate-900">{quantity}</span>
                <button
                  onClick={() => setQuantity(q => q + 1)}
                  className="px-3 py-2.5 hover:bg-slate-50 transition-colors"
                >
                  <Plus size={16} className="text-slate-600" />
                </button>
              </div>
              <span className={cn('text-sm font-semibold flex items-center gap-1.5',
                isOutOfStock ? 'text-red-500' : 'text-green-600')}>
                {isOutOfStock ? (
                  '❌ Hết hàng'
                ) : (
                  <>
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
                    </span>
                    Còn {selectedVariant ? selectedVariant.stock : product.stock} sản phẩm
                  </>
                )}
              </span>
            </div>
          </div>

          {/* Upgrade email */}
          {needsEmail && (
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                📧 Email nâng cấp chính chủ
              </label>
              <input
                type="email"
                value={upgradeEmail}
                onChange={e => setUpgradeEmail(e.target.value)}
                placeholder="Nhập email bạn muốn nâng cấp..."
                className="input"
              />
              <p className="text-xs mt-1.5" style={{ color: '#94A3B8' }}>
                💡 Bỏ qua nếu bạn chọn gói cấp sẵn — tài khoản sẽ được gửi sau thanh toán
              </p>
            </div>
          )}

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-1">
            <button
              onClick={handleBuyNow}
              disabled={isOutOfStock}
              className="btn-primary py-3.5 text-base flex-1 justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Zap size={18} /> Mua Ngay
            </button>
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className="btn-secondary py-3.5 text-base flex-1 justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShoppingCart size={18} /> Thêm Vào Giỏ
            </button>
          </div>

          {/* Features */}
          <div className="grid grid-cols-2 gap-2 p-4 rounded-2xl" style={{ background: '#F8FAFC' }}>
            {[
              'Giao hàng tự động', 'Bảo hành đăng nhập',
              'Tài khoản riêng tư', 'Hỗ trợ Zalo 24/7',
            ].map(f => (
              <div key={f} className="flex items-center gap-2 text-sm text-slate-600">
                <Check size={14} className="text-green-500 flex-shrink-0" />
                {f}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="rounded-3xl border overflow-hidden" style={{ borderColor: '#E2E8F0', background: 'white' }}>
        {/* Tab headers */}
        <div className="flex overflow-x-auto border-b" style={{ borderColor: '#F1F5F9' }}>
          {TABS.map(tab => {
            const hasContent = !!tabContent[tab.id]
            if (!hasContent) return null
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex-shrink-0 px-6 py-4 text-sm font-semibold border-b-2 transition-all whitespace-nowrap"
                style={{
                  borderColor: activeTab === tab.id ? '#2563EB' : 'transparent',
                  color: activeTab === tab.id ? '#1D4ED8' : '#64748B',
                  background: activeTab === tab.id ? '#F8FAFC' : 'transparent',
                }}
              >
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Tab content */}
        <div className="p-6 md:p-8">
          {tabContent[activeTab] ? (
            <div
              className="product-content max-w-3xl"
              dangerouslySetInnerHTML={{ __html: tabContent[activeTab]! }}
            />
          ) : (
            <p className="text-sm" style={{ color: '#94A3B8' }}>Chưa có nội dung</p>
          )}
        </div>
      </div>
    </div>
  )
}