'use client'
import { useState } from 'react'
import { useCartStore } from '@/lib/stores/cart'
import { formatPrice, discountPercent } from '@/lib/utils'
import { ShoppingCart, Zap, Shield, Clock, Star, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { ReviewsSection } from '@/components/product/ReviewsSection'
import type { Product } from '@/types'

export function ProductDetail({ product }: { product: Product & { product_reviews?: any[] } }) {
  const { addItem } = useCartStore()
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    product.product_variants?.find(v => v.is_default)?.id ?? product.product_variants?.[0]?.id ?? null
  )
  const [quantity, setQuantity] = useState(1)
  const [upgradeEmail, setUpgradeEmail] = useState('')
  const [activeTab, setActiveTab] = useState<'description' | 'reviews'>('description')
  const [activeImage, setActiveImage] = useState(0)

  const selectedVariant = product.product_variants?.find(v => v.id === selectedVariantId) ?? null

  const price = selectedVariant?.price ?? product.price
  const compareAt = selectedVariant?.compare_at_price ?? product.compare_at_price
  const discount = discountPercent(price, compareAt ?? 0)
  const stock = selectedVariant?.stock ?? product.stock
  const isOutOfStock = stock === 0

  // ── Delivery type logic: ưu tiên variant, fallback về product ──
  const effectiveDeliveryType = selectedVariant?.delivery_type ?? product.delivery_type
  const needsUpgradeEmail = effectiveDeliveryType === 'upgrade_owner'
  const isReadyAccount = effectiveDeliveryType === 'ready_account'

  const images = product.product_images?.sort((a: any, b: any) => a.sort_order - b.sort_order) ?? []
  const coverImage = images[0] ?? null

  const reviews = product.product_reviews?.filter((r: any) => r.status === 'approved' && !r.parent_id) ?? []
  const ratedReviews = reviews.filter((r: any) => r.rating)
  const avgRating = ratedReviews.length > 0
    ? ratedReviews.reduce((s: number, r: any) => s + r.rating, 0) / ratedReviews.length
    : 0

  const handleSelectVariant = (variantId: string) => {
    setSelectedVariantId(variantId)
    // Reset email khi chuyển sang biến thể cấp sẵn
    const v = product.product_variants?.find(v => v.id === variantId)
    if (v?.delivery_type === 'ready_account') setUpgradeEmail('')
  }

  const handleAddToCart = () => {
    if (isOutOfStock) return
    if (needsUpgradeEmail && !upgradeEmail.trim()) {
      toast.error('Vui lòng nhập email cần nâng cấp')
      return
    }
    addItem(product, selectedVariant, quantity, upgradeEmail)
    toast.success('Đã thêm vào giỏ hàng!', { description: product.name })
  }

  const handleBuyNow = () => {
    if (isOutOfStock) return
    if (needsUpgradeEmail && !upgradeEmail.trim()) {
      toast.error('Vui lòng nhập email cần nâng cấp')
      return
    }
    addItem(product, selectedVariant, quantity, upgradeEmail)
    window.location.href = '/checkout'
  }

  const TABS = [
    { id: 'description', label: '📋 Mô Tả & Hướng Dẫn' },
    { id: 'reviews', label: `⭐ Đánh Giá (${reviews.length})` },
  ]

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-400 mb-6">
        <Link href="/" className="hover:text-blue-600 transition-colors">Trang chủ</Link>
        <ChevronRight size={12} />
        <Link href="/shop" className="hover:text-blue-600 transition-colors">Sản phẩm</Link>
        <ChevronRight size={12} />
        {product.categories && (
          <>
            <Link href={`/shop?category=${product.categories.slug}`}
              className="hover:text-blue-600 transition-colors">{product.categories.name}</Link>
            <ChevronRight size={12} />
          </>
        )}
        <span className="text-slate-600 font-medium truncate max-w-[200px]">{product.name}</span>
      </nav>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-12">

        {/* LEFT: Images */}
        <div className="space-y-3">
          {/* Cover 16:9 */}
          <div className="relative w-full rounded-2xl overflow-hidden border border-slate-200"
            style={{ paddingTop: '56.25%', background: 'linear-gradient(145deg, #f0f9ff, #e0f2fe, #f0fdf4)' }}>
            <div className="absolute inset-0">
              {coverImage ? (
                <img
                  src={images[activeImage]?.image_url ?? coverImage.image_url}
                  alt={images[activeImage]?.alt_text ?? product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-8xl opacity-30">🤖</div>
                </div>
              )}
              {product.badge_text && (
                <div className="absolute top-3 left-3">
                  <span className="text-xs font-bold px-3 py-1.5 rounded-xl shadow text-white"
                    style={{ background: product.badge_text === 'Hot' ? '#EF4444' : product.badge_text === 'Mới' ? '#22C55E' : '#F97316' }}>
                    {product.badge_text}
                  </span>
                </div>
              )}
              {discount >= 10 && (
                <div className="absolute top-3 right-3">
                  <span className="text-sm font-black px-3 py-1.5 rounded-xl shadow"
                    style={{ background: '#FEF9C3', color: '#854D0E' }}>
                    -{discount}%
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((img: any, i: number) => (
                <button key={img.id} onClick={() => setActiveImage(i)}
                  className="flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all"
                  style={{ borderColor: activeImage === i ? '#2563EB' : '#E2E8F0' }}>
                  <img src={img.image_url} alt={img.alt_text ?? product.name}
                    className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { icon: <Zap size={16} />, title: 'Giao tức thì', sub: 'Sau thanh toán', color: '#2563EB', bg: '#EFF6FF' },
              { icon: <Shield size={16} />, title: 'Bảo hành', sub: 'Đăng nhập lần đầu', color: '#16A34A', bg: '#F0FDF4' },
              { icon: <Clock size={16} />, title: 'Hỗ trợ', sub: 'Zalo 8:00–22:00', color: '#D97706', bg: '#FFFBEB' },
            ].map(item => (
              <div key={item.title} className="flex flex-col items-center gap-1.5 p-3 rounded-2xl border text-center"
                style={{ background: item.bg, borderColor: item.bg }}>
                <div style={{ color: item.color }}>{item.icon}</div>
                <p className="text-xs font-bold" style={{ color: item.color }}>{item.title}</p>
                <p className="text-xs text-slate-500">{item.sub}</p>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: Info */}
        <div className="space-y-5">
          {product.categories && (
            <Link href={`/shop?category=${product.categories.slug}`}
              className="inline-flex items-center text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full transition-all"
              style={{ background: '#EFF6FF', color: '#2563EB' }}>
              {product.categories.name}
            </Link>
          )}

          <h1 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight">
            {product.name}
          </h1>

          {/* Rating summary */}
          {ratedReviews.length > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex">
                {[1,2,3,4,5].map(s => (
                  <Star key={s} size={16} fill={s <= Math.round(avgRating) ? '#F59E0B' : 'none'}
                    style={{ color: '#F59E0B' }} />
                ))}
              </div>
              <span className="text-sm font-semibold text-slate-700">{avgRating.toFixed(1)}</span>
              <span className="text-sm text-slate-400">({ratedReviews.length} đánh giá)</span>
              <button onClick={() => setActiveTab('reviews')}
                className="text-xs font-semibold hover:underline" style={{ color: '#2563EB' }}>
                Xem tất cả →
              </button>
            </div>
          )}

          {/* Price */}
          <div className="flex items-end gap-3 py-4 border-y border-slate-100">
            <span className="text-3xl md:text-4xl font-black" style={{ color: '#2563EB' }}>
              {formatPrice(price)}
            </span>
            {compareAt && compareAt > price && (
              <>
                <span className="text-lg text-slate-400 line-through mb-1">{formatPrice(compareAt)}</span>
                <span className="mb-1 px-2.5 py-1 rounded-lg text-sm font-bold"
                  style={{ background: '#FEE2E2', color: '#991B1B' }}>
                  Tiết kiệm {formatPrice(compareAt - price)}
                </span>
              </>
            )}
          </div>

          {/* Short desc */}
          {product.short_description && (
            <p className="text-slate-600 leading-relaxed">{product.short_description}</p>
          )}

          {/* Variants */}
          {product.product_variants && product.product_variants.length > 0 && (
            <div>
              <p className="text-sm font-bold text-slate-700 mb-2">Chọn gói:</p>
              <div className="flex flex-wrap gap-2">
                {product.product_variants.map((v: any) => {
                  const vDelivery = v.delivery_type ?? product.delivery_type
                  const isSelected = selectedVariantId === v.id
                  return (
                    <button key={v.id} onClick={() => handleSelectVariant(v.id)}
                      disabled={v.stock === 0}
                      className="px-4 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all disabled:opacity-40 relative"
                      style={{
                        borderColor: isSelected ? '#2563EB' : '#E2E8F0',
                        background: isSelected ? '#EFF6FF' : 'white',
                        color: isSelected ? '#1D4ED8' : '#475569',
                      }}>
                      <span>{v.option_value}</span>
                      {/* Badge loại giao hàng */}
                      <span className="ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                        style={{
                          background: vDelivery === 'upgrade_owner' ? '#F5F3FF' : '#F0FDF4',
                          color: vDelivery === 'upgrade_owner' ? '#7C3AED' : '#16A34A',
                        }}>
                        {vDelivery === 'upgrade_owner' ? '📧' : '📦'}
                      </span>
                      {v.stock === 0 && <span className="ml-1 text-red-400 text-xs">(hết)</span>}
                    </button>
                  )
                })}
              </div>

              {/* Mô tả loại biến thể đang chọn */}
              {selectedVariant && (
                <div className="mt-2 px-3 py-2 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5"
                  style={{
                    background: needsUpgradeEmail ? '#F5F3FF' : '#F0FDF4',
                    color: needsUpgradeEmail ? '#7C3AED' : '#16A34A',
                  }}>
                  {needsUpgradeEmail
                    ? '📧 Gói này yêu cầu nhập email nâng cấp chính chủ'
                    : '📦 Gói này giao tài khoản cấp sẵn tự động'}
                </div>
              )}
            </div>
          )}

          {/* Upgrade email — chỉ hiện khi variant là upgrade_owner */}
          {needsUpgradeEmail && (
            <div className="rounded-2xl border-2 p-4 space-y-2"
              style={{ background: '#FAF5FF', borderColor: '#DDD6FE' }}>
              <label className="block text-sm font-bold mb-1"
                style={{ color: '#5B21B6' }}>
                📧 Email nâng cấp chính chủ <span className="text-red-500">*</span>
              </label>
              <input type="email" value={upgradeEmail}
                onChange={e => setUpgradeEmail(e.target.value)}
                placeholder="Nhập email Coursera / ChatGPT / Canva... của bạn"
                className="input"
                style={{ borderColor: upgradeEmail ? '#7C3AED' : undefined }} />
              <p className="text-xs" style={{ color: '#7C3AED' }}>
                💡 Nhập đúng email tài khoản bạn muốn shop nâng cấp lên gói premium
              </p>
            </div>
          )}

        
          {/* Quantity */}
          <div className="flex items-center gap-3">
            <p className="text-sm font-bold text-slate-700">Số lượng:</p>
            <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden">
              <button onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="w-10 h-10 flex items-center justify-center hover:bg-slate-50 transition-colors text-slate-600 font-bold">
                −
              </button>
              <span className="w-12 text-center font-bold text-slate-900">{quantity}</span>
              <button onClick={() => setQuantity(q => Math.min(stock, q + 1))}
                className="w-10 h-10 flex items-center justify-center hover:bg-slate-50 transition-colors text-slate-600 font-bold">
                +
              </button>
            </div>
            <span className="text-sm font-semibold"
              style={{ color: stock > 5 ? '#16A34A' : stock > 0 ? '#D97706' : '#EF4444' }}>
              {isOutOfStock ? '● Hết hàng' : stock > 5 ? `● Còn ${stock} sản phẩm` : `● Chỉ còn ${stock}`}
            </span>
          </div>

          {/* CTA */}
          <div className="flex gap-3">
            <button onClick={handleBuyNow} disabled={isOutOfStock}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-base text-white disabled:opacity-50 transition-all active:scale-95"
              style={{ background: isOutOfStock ? '#94A3B8' : 'linear-gradient(135deg, #2563EB, #1d4ed8)', boxShadow: '0 4px 16px rgba(37,99,235,0.3)' }}>
              <Zap size={18} /> Mua Ngay
            </button>
            <button onClick={handleAddToCart} disabled={isOutOfStock}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-base border-2 disabled:opacity-50 transition-all hover:bg-blue-50 active:scale-95"
              style={{ borderColor: '#2563EB', color: '#2563EB' }}>
              <ShoppingCart size={18} /> Thêm Vào Giỏ
            </button>
          </div>

          {quantity > 1 && (
            <div className="p-3 rounded-xl text-sm font-semibold text-center"
              style={{ background: '#EFF6FF', color: '#1D4ED8' }}>
              Tổng: {formatPrice(price * quantity)}
            </div>
          )}

        </div>
      </div>

      {/* TABS */}
      <div className="border-b border-slate-200 mb-8 flex gap-1 overflow-x-auto">
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
            className="flex-shrink-0 px-6 py-3.5 text-sm font-semibold border-b-2 transition-all whitespace-nowrap"
            style={{
              borderColor: activeTab === tab.id ? '#2563EB' : 'transparent',
              color: activeTab === tab.id ? '#1D4ED8' : '#64748B',
            }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab: Mô Tả */}
      {activeTab === 'description' && (
        <div className="space-y-8">
          {product.description_html && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8">
              <h2 className="text-lg font-black text-slate-900 mb-5 flex items-center gap-2">
                <span className="text-xl">📋</span> Mô Tả Chi Tiết
              </h2>
              <div className="product-content" dangerouslySetInnerHTML={{ __html: product.description_html }} />
            </div>
          )}

          {product.usage_guide_html && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8">
              <h2 className="text-lg font-black text-slate-900 mb-5 flex items-center gap-2">
                <span className="text-xl">📖</span> Hướng Dẫn Sử Dụng
              </h2>
              <div className="product-content" dangerouslySetInnerHTML={{ __html: product.usage_guide_html }} />
            </div>
          )}

          {product.warranty_html && (
            <div className="rounded-2xl border p-6 md:p-8"
              style={{ background: '#F0FDF4', borderColor: '#BBF7D0' }}>
              <h2 className="text-lg font-black mb-5 flex items-center gap-2" style={{ color: '#166534' }}>
                <span className="text-xl">🛡️</span> Chính Sách Bảo Hành
              </h2>
              <div className="product-content" dangerouslySetInnerHTML={{ __html: product.warranty_html }} />
            </div>
          )}

          {product.faq_html && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8">
              <h2 className="text-lg font-black text-slate-900 mb-5 flex items-center gap-2">
                <span className="text-xl">❓</span> Câu Hỏi Thường Gặp
              </h2>
              <div className="product-content" dangerouslySetInnerHTML={{ __html: product.faq_html }} />
            </div>
          )}

          {!product.description_html && !product.usage_guide_html && !product.warranty_html && !product.faq_html && (
            <div className="text-center py-16 text-slate-400">Chưa có nội dung mô tả</div>
          )}
        </div>
      )}

      {/* Tab: Đánh Giá */}
      {activeTab === 'reviews' && (
        <ReviewsSection productId={product.id} productName={product.name} />
      )}
    </div>
  )
}