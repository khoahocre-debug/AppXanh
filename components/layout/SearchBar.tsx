'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { Search, X, ShoppingCart, ArrowRight, Zap } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'

interface SearchResult {
  id: string
  name: string
  slug: string
  price: number
  compare_at_price: number | null
  badge_text: string | null
  short_description: string | null
  categories: any
  product_images: { image_url: string; sort_order: number }[]
}

interface Props {
  open: boolean
  onClose: () => void
}

export function SearchBar({ open, onClose }: Props) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [focused, setFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 80)
      setQuery('')
      setResults([])
    }
  }, [open])

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    if (open) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open, onClose])

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); setLoading(false); return }
    setLoading(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('products')
      .select('id, name, slug, price, compare_at_price, badge_text, short_description, categories(name), product_images(image_url, sort_order)')
      .eq('status', 'active')
      .ilike('name', `%${q}%`)
      .order('created_at', { ascending: false })
      .limit(6)
    setResults((data ?? []) as SearchResult[])
    setLoading(false)
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setQuery(val)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!val.trim()) { setResults([]); setLoading(false); return }
    setLoading(true)
    debounceRef.current = setTimeout(() => doSearch(val), 280)
  }

  const handleResultClick = () => {
    onClose()
    setQuery('')
    setResults([])
  }

  const showDropdown = focused && (query.length > 0 || results.length > 0)

  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        style={{ background: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(2px)' }}
        onClick={onClose}
      />

      {/* Search panel */}
      <div
        ref={containerRef}
        className="fixed top-4 left-1/2 z-50 w-full max-w-xl px-4"
        style={{ transform: 'translateX(-50%)' }}
      >
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200"
          style={{ boxShadow: '0 24px 64px rgba(0,0,0,0.18)' }}>

          {/* Input row */}
          <div className="flex items-center gap-3 px-4 py-3.5">
            <div className="flex-shrink-0" style={{ color: loading ? '#2563EB' : '#94A3B8' }}>
              {loading ? (
                <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Search size={20} />
              )}
            </div>
            <input
              ref={inputRef}
              value={query}
              onChange={handleChange}
              onFocus={() => setFocused(true)}
              onBlur={() => setTimeout(() => setFocused(false), 150)}
              placeholder="Tìm sản phẩm... VD: ChatGPT, Canva, Claude..."
              className="flex-1 text-base text-slate-900 outline-none bg-transparent placeholder:text-slate-400"
            />
            {query && (
              <button onClick={() => { setQuery(''); setResults([]); inputRef.current?.focus() }}
                className="flex-shrink-0 p-1 rounded-lg hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600">
                <X size={16} />
              </button>
            )}
            <button onClick={onClose}
              className="flex-shrink-0 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-colors"
              style={{ background: '#F1F5F9', color: '#64748B' }}>
              Esc
            </button>
          </div>

          {/* Results */}
          {showDropdown && (
            <div className="border-t border-slate-100">
              {results.length === 0 && query.length > 0 && !loading ? (
                <div className="px-5 py-8 text-center">
                  <p className="text-2xl mb-2">🔍</p>
                  <p className="font-semibold text-slate-700 text-sm">Không tìm thấy "{query}"</p>
                  <p className="text-xs text-slate-400 mt-1">Thử từ khóa khác như ChatGPT, Canva, Claude...</p>
                </div>
              ) : results.length > 0 ? (
                <>
                  <div className="px-4 py-2 flex items-center justify-between">
                    <p className="text-xs font-bold uppercase tracking-wider" style={{ color: '#94A3B8' }}>
                      {results.length} kết quả
                    </p>
                    <Link href={`/shop?q=${encodeURIComponent(query)}`}
                      onClick={handleResultClick}
                      className="text-xs font-semibold flex items-center gap-1 hover:underline"
                      style={{ color: '#2563EB' }}>
                      Xem tất cả <ArrowRight size={12} />
                    </Link>
                  </div>

                  <div className="pb-2">
                    {results.map(product => {
                      const cover = product.product_images?.sort((a, b) => a.sort_order - b.sort_order)[0]
                      const discount = product.compare_at_price && product.compare_at_price > product.price
                        ? Math.round((1 - product.price / product.compare_at_price) * 100)
                        : 0

                      return (
                        <Link key={product.id} href={`/product/${product.slug}`}
                          onClick={handleResultClick}
                          className="flex items-center gap-3.5 px-4 py-3 hover:bg-blue-50 transition-all group">

                          {/* Thumbnail */}
                          <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 border border-slate-100"
                            style={{ background: 'linear-gradient(135deg, #EFF6FF, #E0F2FE)' }}>
                            {cover ? (
                              <img src={cover.image_url} alt={product.name}
                                className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-xl">
                                {product.name.includes('ChatGPT') ? '🤖' :
                                 product.name.includes('Claude') ? '✨' :
                                 product.name.includes('Canva') ? '🎨' :
                                 product.name.includes('YouTube') ? '▶️' :
                                 product.name.includes('Coursera') ? '🎓' :
                                 product.name.includes('CapCut') ? '🎬' : '💻'}
                              </div>
                            )}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-slate-900 text-sm leading-snug truncate group-hover:text-blue-700 transition-colors">
                              {product.name}
                            </p>
                            {product.categories && (
                              <p className="text-xs mt-0.5" style={{ color: '#2563EB' }}>{product.categories.name}</p>
                            )}
                          </div>

                          {/* Price */}
                          <div className="flex-shrink-0 text-right">
                            <p className="font-black text-sm" style={{ color: '#2563EB' }}>
                              {formatPrice(product.price)}
                            </p>
                            {discount > 0 && (
                              <span className="text-xs font-bold px-1.5 py-0.5 rounded-lg"
                                style={{ background: '#FEE2E2', color: '#991B1B' }}>
                                -{discount}%
                              </span>
                            )}
                          </div>

                          <ArrowRight size={14} className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: '#2563EB' }} />
                        </Link>
                      )
                    })}
                  </div>
                </>
              ) : null}

              {/* Quick links when no query */}
              {query.length === 0 && (
                <div className="px-4 py-3">
                  <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: '#94A3B8' }}>Tìm kiếm nhanh</p>
                  <div className="flex flex-wrap gap-2">
                    {['ChatGPT Plus', 'Claude Pro', 'Canva Pro', 'Coursera', 'YouTube Premium', 'GitHub Copilot'].map(tag => (
                      <button key={tag}
                        onClick={() => { setQuery(tag); doSearch(tag) }}
                        className="text-xs font-semibold px-3 py-1.5 rounded-xl transition-all hover:-translate-y-0.5"
                        style={{ background: '#EFF6FF', color: '#2563EB', border: '1px solid #BFDBFE' }}>
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Bottom hint */}
          {!showDropdown && (
            <div className="px-4 pb-3 flex items-center gap-4">
              <span className="text-xs flex items-center gap-1.5" style={{ color: '#CBD5E1' }}>
                <Zap size={11} style={{ color: '#2563EB' }} /> Tìm kiếm nhanh 100+ sản phẩm
              </span>
            </div>
          )}
        </div>
      </div>
    </>
  )
}