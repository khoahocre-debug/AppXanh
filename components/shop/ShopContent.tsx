'use client'
import { useState, useEffect, useMemo } from 'react'
import { Search, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatPrice, discountPercent, cn } from '@/lib/utils'
import { useCartStore } from '@/lib/stores/cart'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import type { Product, Category, ProductVariant } from '@/types'

const ICONS: Record<string, React.ReactNode> = {
  'ai-chatbot': (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect width="80" height="80" rx="20" fill="#EFF6FF"/>
      <rect x="18" y="24" width="44" height="32" rx="8" fill="#2563EB"/>
      <circle cx="30" cy="40" r="5" fill="white" fillOpacity="0.9"/>
      <circle cx="50" cy="40" r="5" fill="white" fillOpacity="0.9"/>
      <circle cx="30" cy="40" r="2.5" fill="#2563EB"/>
      <circle cx="50" cy="40" r="2.5" fill="#2563EB"/>
      <path d="M33 49h14" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M32 24v-6M48 24v-6" stroke="#93C5FD" strokeWidth="2.5" strokeLinecap="round"/>
      <circle cx="32" cy="17" r="3" fill="#3B82F6"/>
      <circle cx="48" cy="17" r="3" fill="#3B82F6"/>
      <rect x="12" y="34" width="6" height="12" rx="3" fill="#93C5FD"/>
      <rect x="62" y="34" width="6" height="12" rx="3" fill="#93C5FD"/>
    </svg>
  ),
  'thiet-ke': (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect width="80" height="80" rx="20" fill="#F5F3FF"/>
      <circle cx="40" cy="40" r="20" fill="#7C3AED"/>
      <circle cx="40" cy="40" r="12" fill="white"/>
      <circle cx="40" cy="24" r="5" fill="#A78BFA"/>
      <circle cx="40" cy="56" r="5" fill="#A78BFA"/>
      <circle cx="24" cy="40" r="5" fill="#A78BFA"/>
      <circle cx="56" cy="40" r="5" fill="#A78BFA"/>
      <circle cx="40" cy="40" r="5" fill="#7C3AED"/>
    </svg>
  ),
  'video-am-nhac': (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect width="80" height="80" rx="20" fill="#FFF1F2"/>
      <rect x="12" y="20" width="56" height="40" rx="8" fill="#EF4444"/>
      <rect x="16" y="24" width="48" height="32" rx="5" fill="#FCA5A5" fillOpacity="0.3"/>
      <path d="M34 30l20 10-20 10V30z" fill="white"/>
    </svg>
  ),
  'hoc-tap': (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect width="80" height="80" rx="20" fill="#F0FDF4"/>
      <path d="M40 16L64 28L40 40L16 28L40 16Z" fill="#16A34A"/>
      <path d="M24 34v14c0 4 7 10 16 10s16-6 16-10V34" stroke="#16A34A" strokeWidth="3" strokeLinecap="round"/>
      <line x1="64" y1="28" x2="64" y2="46" stroke="#16A34A" strokeWidth="3" strokeLinecap="round"/>
      <circle cx="64" cy="50" r="4" fill="#16A34A"/>
    </svg>
  ),
  'giai-tri': (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect width="80" height="80" rx="20" fill="#FFFBEB"/>
      <circle cx="40" cy="40" r="22" fill="#D97706"/>
      <circle cx="40" cy="40" r="10" fill="#FEF3C7"/>
      <circle cx="40" cy="40" r="4" fill="#D97706"/>
      <path d="M40 18v6M40 56v6M18 40h6M56 40h6" stroke="#D97706" strokeWidth="3" strokeLinecap="round"/>
      <path d="M26 26l4 4M50 50l4 4M26 54l4-4M50 30l4-4" stroke="#FCD34D" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  ),
  'cong-cu-dev': (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect width="80" height="80" rx="20" fill="#ECFEFF"/>
      <rect x="10" y="22" width="60" height="38" rx="7" fill="#0891B2"/>
      <rect x="15" y="27" width="50" height="24" rx="4" fill="#CFFAFE"/>
      <path d="M24 35l-6 5 6 5" stroke="#0891B2" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M35 35l6 5-6 5" stroke="#0891B2" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M28 62H40M40 62H52M40 60v4" stroke="#0891B2" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  ),
}

const DEFAULT_ICON = (
  <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    <rect width="80" height="80" rx="20" fill="#F1F5F9"/>
    <rect x="20" y="20" width="40" height="40" rx="8" fill="#94A3B8"/>
    <path d="M30 40h20M40 30v20" stroke="white" strokeWidth="3" strokeLinecap="round"/>
  </svg>
)

const BADGE_COLORS: Record<string, { bg: string; text: string }> = {
  'Hot': { bg: '#EF4444', text: 'white' },
  'Mới': { bg: '#22C55E', text: 'white' },
  'Bán Chạy': { bg: '#F97316', text: 'white' },
}

const CAT_EMOJI: Record<string, string> = {
  'ai-chatbot': '🤖', 'thiet-ke': '🎨', 'video-am-nhac': '🎬',
  'hoc-tap': '📚', 'giai-tri': '🎵', 'cong-cu-dev': '💻',
}

function StockBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold" style={{ color: '#16A34A' }}>
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: '#4ADE80' }} />
        <span className="relative inline-flex h-2 w-2 rounded-full" style={{ background: '#22C55E' }} />
      </span>
      Còn hàng
    </span>
  )
}

function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCartStore()
  const [showPicker, setShowPicker] = useState(false)

  const discount = discountPercent(product.price, product.compare_at_price ?? 0)
  const isOutOfStock = product.stock === 0
  const icon = ICONS[product.categories?.slug ?? ''] ?? DEFAULT_ICON
  const badge = product.badge_text ? BADGE_COLORS[product.badge_text] : null
  const variants = product.product_variants ?? []
  const hasMultipleVariants = variants.length > 1

  const coverImage = product.product_images?.find((img: any) => img.sort_order === 0)
    ?? product.product_images?.[0]
    ?? null

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (isOutOfStock) return
    if (hasMultipleVariants) {
      setShowPicker(true)
    } else {
      addItem(product, variants[0] ?? null, 1)
      toast.success('Đã thêm vào giỏ!', { description: product.name })
    }
  }

  const handlePickVariant = (e: React.MouseEvent, variant: ProductVariant) => {
    e.preventDefault()
    e.stopPropagation()
    addItem(product, variant, 1)
    setShowPicker(false)
    toast.success('Đã thêm vào giỏ!', { description: `${product.name} — ${variant.option_value}` })
  }

  const closePicker = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setShowPicker(false)
  }

  return (
    <Link href={`/product/${product.slug}`}>
      <div className={cn(
        'group relative flex flex-col overflow-visible cursor-pointer h-full',
        'bg-white rounded-2xl border transition-all duration-300',
        'hover:-translate-y-1 hover:shadow-[0_16px_48px_rgba(37,99,235,0.12)] hover:border-blue-200',
        isOutOfStock ? 'opacity-60 border-slate-200' : 'border-slate-200/80',
      )}>

        {/* Image area 16:9 */}
        <div className="relative w-full overflow-hidden rounded-t-2xl" style={{ paddingTop: '56.25%' }}>
          <div className="absolute inset-0 flex items-center justify-center"
            style={{ background: 'linear-gradient(145deg, #f0f9ff 0%, #e0f2fe 55%, #f0fdf4 100%)' }}>

            {/* Blobs */}
            <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full opacity-25 pointer-events-none"
              style={{ background: 'radial-gradient(circle, #3B82F6, transparent)' }} />
            <div className="absolute -bottom-6 -left-6 w-20 h-20 rounded-full opacity-20 pointer-events-none"
              style={{ background: 'radial-gradient(circle, #06B6D4, transparent)' }} />

            {/* Image or icon */}
            {coverImage ? (
              <img
                src={coverImage.image_url}
                alt={coverImage.alt_text || product.name}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-16 h-16 md:w-20 md:h-20 group-hover:scale-110 transition-transform duration-300 drop-shadow-sm relative z-10">
                {icon}
              </div>
            )}

            {/* Badge */}
            {badge && (
              <div className="absolute top-2.5 left-2.5 z-20">
                <span className="text-xs font-bold px-2 py-1 rounded-lg shadow-sm"
                  style={{ background: badge.bg, color: badge.text }}>
                  {product.badge_text}
                </span>
              </div>
            )}

            {/* Discount */}
            {discount >= 10 && (
              <div className="absolute top-2.5 right-2.5 z-20">
                <span className="text-xs font-black px-2 py-1 rounded-lg shadow-sm"
                  style={{ background: '#FEF9C3', color: '#854D0E' }}>
                  -{discount}%
                </span>
              </div>
            )}

            {/* Out of stock */}
            {isOutOfStock && (
              <div className="absolute inset-0 z-20 flex items-center justify-center rounded-t-2xl"
                style={{ background: 'rgba(255,255,255,0.75)' }}>
                <span className="text-xs font-bold px-3 py-1.5 rounded-full shadow"
                  style={{ background: '#1E293B', color: 'white' }}>
                  Hết hàng
                </span>
              </div>
            )}

            {/* Quick add */}
            {!isOutOfStock && (
              <button onClick={handleQuickAdd}
                className="absolute bottom-2.5 right-2.5 z-20 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-1.5 group-hover:translate-y-0">
                <div className="w-8 h-8 md:w-9 md:h-9 rounded-xl flex items-center justify-center shadow-lg"
                  style={{ background: 'linear-gradient(135deg, #2563EB, #0891B2)' }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                  </svg>
                </div>
              </button>
            )}
          </div>
        </div>

        {/* Variant picker */}
        {showPicker && (
          <>
            <div className="fixed inset-0 z-30" onClick={closePicker} />
            <div className="absolute left-0 right-0 z-40" style={{ bottom: 'calc(100% + 8px)' }}
              onClick={e => { e.preventDefault(); e.stopPropagation() }}>
              <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">Chọn biến thể</p>
                  <button onClick={closePicker} className="text-slate-400 hover:text-slate-600">
                    <X size={14} />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {variants.map(variant => (
                    <button key={variant.id}
                      onClick={e => handlePickVariant(e, variant)}
                      disabled={variant.stock === 0}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold border-2 transition-all disabled:opacity-40"
                      style={{ borderColor: '#2563EB', color: '#2563EB', background: 'white' }}
                      onMouseEnter={e => { if (variant.stock > 0) (e.currentTarget as HTMLElement).style.background = '#EFF6FF' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'white' }}>
                      {variant.option_value}
                      {variant.price && variant.price !== product.price && (
                        <span className="ml-1 opacity-70">({formatPrice(variant.price)})</span>
                      )}
                      {variant.stock === 0 && <span className="ml-1 text-red-400">(hết)</span>}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Content */}
        <div className="flex flex-col flex-1 p-3.5 md:p-4 gap-1.5">
          {product.categories && (
            <span className="text-xs font-bold" style={{ color: '#2563EB' }}>
              {product.categories.name}
            </span>
          )}
          <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2 group-hover:text-blue-700 transition-colors"
            style={{ fontFamily: 'Sora, sans-serif' }}>
            {product.name}
          </h3>
          {product.short_description && (
            <p className="hidden sm:block text-xs text-slate-500 line-clamp-2 leading-relaxed flex-1">
              {product.short_description}
            </p>
          )}
          <div className="flex items-center justify-between pt-2.5 mt-auto border-t" style={{ borderColor: '#F1F5F9' }}>
            <div className="flex flex-col leading-tight">
              <span className="text-base md:text-lg font-black" style={{ color: '#2563EB' }}>
                {formatPrice(product.price)}
              </span>
              {product.compare_at_price && product.compare_at_price > product.price && (
                <span className="text-xs text-slate-400 line-through">{formatPrice(product.compare_at_price)}</span>
              )}
            </div>
            {!isOutOfStock ? <StockBadge /> : (
              <span className="text-xs font-semibold" style={{ color: '#EF4444' }}>Hết hàng</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}

export function ShopContent() {
  const searchParams = useSearchParams()
  const initCategory = searchParams.get('category') ?? 'all'

  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(initCategory)
  const [sort, setSort] = useState<'newest' | 'price_asc' | 'price_desc' | 'name_asc'>('newest')

  useEffect(() => {
    async function fetchData() {
      try {
        const supabase = createClient()
        const { data: productsData, error: pErr } = await supabase
          .from('products')
          .select(`*, categories(*), product_variants(*), product_images(*)`)
          .eq('status', 'active')
        if (pErr) { setError(pErr.message); setLoading(false); return }
        const { data: categoriesData } = await supabase
          .from('categories').select('*').eq('is_active', true).order('sort_order')
        setProducts(productsData ?? [])
        setCategories(categoriesData ?? [])
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const filtered = useMemo(() => {
    let list = [...products]
    if (search) list = list.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
    if (selectedCategory !== 'all') list = list.filter(p => p.categories?.slug === selectedCategory)
    switch (sort) {
      case 'price_asc': list.sort((a, b) => a.price - b.price); break
      case 'price_desc': list.sort((a, b) => b.price - a.price); break
      case 'name_asc': list.sort((a, b) => a.name.localeCompare(b.name, 'vi')); break
      default: list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    }
    return list
  }, [products, search, selectedCategory, sort])

  if (error) return (
    <div className="max-w-7xl mx-auto px-4 py-20 text-center">
      <div className="text-5xl mb-4">⚠️</div>
      <p className="font-bold text-slate-900 mb-2">Lỗi kết nối</p>
      <p className="text-sm" style={{ color: '#EF4444' }}>{error}</p>
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">
      <div className="mb-7">
        <p className="text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: '#2563EB' }}>Cửa Hàng</p>
        <h1 className="text-2xl md:text-3xl font-black text-slate-900" style={{ fontFamily: 'Sora, sans-serif' }}>
          Tất Cả Sản Phẩm
        </h1>
        <p className="text-sm mt-1" style={{ color: '#64748B' }}>
          {loading ? 'Đang tải...' : `${products.length} sản phẩm premium giá tốt nhất`}
        </p>
      </div>

      <div className="flex gap-2.5 mb-6">
        <div className="relative flex-1">
          <Search size={15} className="absolute top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ left: '14px', color: '#94A3B8' }} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Tìm sản phẩm... (ChatGPT, Canva, YouTube...)"
            className="input h-11 text-sm" style={{ paddingLeft: '40px' }} />
          {search && (
            <button onClick={() => setSearch('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2" style={{ color: '#94A3B8' }}>
              <X size={15} />
            </button>
          )}
        </div>
        <select value={sort} onChange={e => setSort(e.target.value as any)}
          className="input h-11 text-sm flex-shrink-0" style={{ width: '155px' }}>
          <option value="newest">Mới nhất</option>
          <option value="price_asc">Giá thấp → cao</option>
          <option value="price_desc">Giá cao → thấp</option>
          <option value="name_asc">Tên A → Z</option>
        </select>
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <aside className="hidden md:block w-56 flex-shrink-0">
          <div className="sticky top-24 rounded-2xl overflow-hidden border"
            style={{ borderColor: '#E2E8F0', background: 'white' }}>
            <div className="px-4 py-3.5 border-b" style={{ borderColor: '#F1F5F9' }}>
              <p className="text-xs font-bold uppercase tracking-wider" style={{ color: '#94A3B8' }}>Danh Mục</p>
            </div>
            <ul className="p-2 space-y-0.5">
              {[
                { slug: 'all', name: 'Tất cả', emoji: '🏪', count: products.length },
                ...categories.map(c => ({ slug: c.slug, name: c.name, emoji: CAT_EMOJI[c.slug] ?? '📦', count: products.filter(p => p.categories?.slug === c.slug).length }))
              ].map(item => {
                const isActive = selectedCategory === item.slug
                return (
                  <li key={item.slug}>
                    <button onClick={() => setSelectedCategory(item.slug)}
                      className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-between"
                      style={{ background: isActive ? '#EFF6FF' : 'transparent', color: isActive ? '#1D4ED8' : '#475569', fontWeight: isActive ? 600 : 500 }}>
                      <span className="flex items-center gap-2 truncate">
                        <span className="text-base flex-shrink-0">{item.emoji}</span>
                        <span className="truncate">{item.name}</span>
                      </span>
                      <span className="text-xs px-1.5 py-0.5 rounded-md font-semibold flex-shrink-0"
                        style={{ background: isActive ? '#DBEAFE' : '#F1F5F9', color: isActive ? '#1D4ED8' : '#64748B' }}>
                        {item.count}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        </aside>

        {/* Main */}
        <div className="flex-1 min-w-0">
          {/* Mobile chips */}
          <div className="md:hidden -mx-1 px-1 mb-4 overflow-x-auto">
            <div className="flex gap-2 pb-1.5" style={{ width: 'max-content' }}>
              {[{ slug: 'all', name: 'Tất cả' }, ...categories.map(c => ({ slug: c.slug, name: c.name }))].map(cat => (
                <button key={cat.slug} onClick={() => setSelectedCategory(cat.slug)}
                  className="flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-bold border-2 transition-all"
                  style={selectedCategory === cat.slug
                    ? { background: '#2563EB', color: 'white', borderColor: '#2563EB' }
                    : { background: 'white', color: '#475569', borderColor: '#E2E8F0' }}>
                  {CAT_EMOJI[cat.slug] ?? ''} {cat.name}
                </button>
              ))}
            </div>
          </div>

          {!loading && (
            <p className="text-sm mb-4 flex items-center gap-2" style={{ color: '#64748B' }}>
              {search
                ? <>Kết quả cho "<strong className="text-slate-800">{search}</strong>": <strong className="text-slate-800">{filtered.length}</strong> sản phẩm</>
                : <>Hiển thị <strong className="text-slate-800">{filtered.length}</strong> sản phẩm</>
              }
              {(search || selectedCategory !== 'all') && (
                <button onClick={() => { setSearch(''); setSelectedCategory('all') }}
                  className="text-xs font-semibold underline" style={{ color: '#2563EB' }}>
                  Xóa bộ lọc
                </button>
              )}
            </p>
          )}

          {loading && (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-2xl overflow-hidden border border-slate-200 animate-pulse bg-white">
                  <div className="w-full" style={{ paddingTop: '56.25%', background: 'linear-gradient(135deg, #F0F9FF, #E0F2FE)' }} />
                  <div className="p-3.5 space-y-2">
                    <div className="h-2.5 rounded-full" style={{ background: '#E2E8F0', width: '35%' }} />
                    <div className="h-3.5 rounded-full" style={{ background: '#E2E8F0' }} />
                    <div className="h-3.5 rounded-full" style={{ background: '#E2E8F0', width: '75%' }} />
                    <div className="h-5 rounded-full mt-3" style={{ background: '#DBEAFE', width: '45%' }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <div className="text-center py-20 px-4">
              <div className="w-20 h-20 mx-auto mb-5 rounded-full flex items-center justify-center text-4xl" style={{ background: '#F1F5F9' }}>🔍</div>
              <p className="text-lg font-bold text-slate-700 mb-1.5">Không tìm thấy sản phẩm</p>
              <p className="text-sm mb-6 max-w-xs mx-auto" style={{ color: '#94A3B8' }}>Thử từ khóa khác hoặc chọn danh mục khác nhé</p>
              <button onClick={() => { setSearch(''); setSelectedCategory('all') }} className="btn-secondary text-sm px-6 py-2.5">
                Xem tất cả sản phẩm
              </button>
            </div>
          )}

          {!loading && filtered.length > 0 && (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-5">
              {filtered.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}