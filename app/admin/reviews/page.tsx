'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { CheckCircle2, XCircle, Clock, Star } from 'lucide-react'

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected'>('pending')

  const load = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('product_reviews')
      .select(`*, products(name)`)
      .eq('status', filter)
      .is('parent_id', null)
      .order('created_at', { ascending: false })
    setReviews(data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [filter])

  const updateStatus = async (id: string, status: 'approved' | 'rejected') => {
    const supabase = createClient()
    await supabase.from('product_reviews').update({ status }).eq('id', id)
    toast.success(status === 'approved' ? 'Đã duyệt!' : 'Đã từ chối!')
    load()
  }

  const TABS = [
    { id: 'pending', label: '⏳ Chờ duyệt', color: '#D97706' },
    { id: 'approved', label: '✅ Đã duyệt', color: '#16A34A' },
    { id: 'rejected', label: '❌ Đã từ chối', color: '#EF4444' },
  ]

  return (
    <div>
      <div className="mb-7">
        <h1 className="text-2xl font-black text-slate-900" style={{ fontFamily: 'Sora, sans-serif' }}>
          Quản Lý Đánh Giá
        </h1>
        <p className="text-slate-500 text-sm mt-1">Duyệt bình luận từ khách hàng</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setFilter(tab.id as any)}
            className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
            style={filter === tab.id
              ? { background: tab.color, color: 'white' }
              : { background: '#F1F5F9', color: '#64748B' }}>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
            <div className="text-4xl mb-3">📭</div>
            <p className="text-slate-400">Không có đánh giá nào</p>
          </div>
        ) : (
          reviews.map(review => (
            <div key={review.id} className="bg-white rounded-2xl border border-slate-200 p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  {/* Product name */}
                  <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#2563EB' }}>
                    📦 {review.products?.name}
                  </p>

                  {/* Reviewer */}
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                      style={{ background: 'linear-gradient(135deg, #2563EB, #0891B2)' }}>
                      {review.reviewer_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="font-bold text-slate-900 text-sm">{review.reviewer_name}</p>
                        {review.is_verified_purchase && (
                          <span className="inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-full font-semibold"
                            style={{ background: '#DCFCE7', color: '#166534' }}>
                            <CheckCircle2 size={10} /> Đã mua
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 mt-0.5">
                        {review.rating && (
                          <div className="flex gap-0.5">
                            {[1,2,3,4,5].map(s => (
                              <svg key={s} width="12" height="12" viewBox="0 0 24 24"
                                fill={s <= review.rating ? '#F59E0B' : '#E2E8F0'}>
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                              </svg>
                            ))}
                          </div>
                        )}
                        <span className="text-xs text-slate-400">
                          {new Date(review.created_at).toLocaleString('vi-VN')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <p className="text-slate-700 text-sm leading-relaxed bg-slate-50 rounded-xl p-3">
                    {review.content}
                  </p>
                </div>

                {/* Actions */}
                {filter === 'pending' && (
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <button onClick={() => updateStatus(review.id, 'approved')}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold text-white transition-all"
                      style={{ background: '#16A34A' }}>
                      <CheckCircle2 size={15} /> Duyệt
                    </button>
                    <button onClick={() => updateStatus(review.id, 'rejected')}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold text-white transition-all"
                      style={{ background: '#EF4444' }}>
                      <XCircle size={15} /> Từ chối
                    </button>
                  </div>
                )}
                {filter === 'approved' && (
                  <button onClick={() => updateStatus(review.id, 'rejected')}
                    className="text-xs font-semibold px-3 py-2 rounded-xl transition-all flex-shrink-0"
                    style={{ background: '#FEE2E2', color: '#EF4444' }}>
                    Ẩn
                  </button>
                )}
                {filter === 'rejected' && (
                  <button onClick={() => updateStatus(review.id, 'approved')}
                    className="text-xs font-semibold px-3 py-2 rounded-xl transition-all flex-shrink-0"
                    style={{ background: '#DCFCE7', color: '#16A34A' }}>
                    Duyệt lại
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}