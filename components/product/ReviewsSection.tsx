'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { ThumbsUp, Reply, CheckCircle2, Clock, Send } from 'lucide-react'

interface Review {
  id: string
  user_id: string | null
  reviewer_name: string
  rating: number | null
  content: string
  status: string
  is_verified_purchase: boolean
  likes_count: number
  parent_id: string | null
  created_at: string
  replies?: Review[]
}

interface Props {
  productId: string
  productName: string
}

function formatDateTime(dateStr: string) {
  return new Date(dateStr).toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex gap-1">
      {[1,2,3,4,5].map(s => (
        <button key={s} type="button"
          onClick={() => onChange(s)}
          onMouseEnter={() => setHover(s)}
          onMouseLeave={() => setHover(0)}
          className="transition-transform hover:scale-110">
          <svg width="28" height="28" viewBox="0 0 24 24"
            fill={(hover || value) >= s ? '#F59E0B' : 'none'}
            stroke="#F59E0B" strokeWidth="1.5">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
        </button>
      ))}
    </div>
  )
}

function ReviewCard({ review, currentUserId, likedIds, onLike, onReply, depth = 0 }: {
  review: Review
  currentUserId: string | null
  likedIds: Set<string>
  onLike: (id: string) => void
  onReply: (id: string, name: string) => void
  depth?: number
}) {
  const isLiked = likedIds.has(review.id)
  return (
    <div className={depth > 0 ? 'ml-8 border-l-2 pl-4' : ''}
      style={{ borderColor: depth > 0 ? '#E2E8F0' : 'transparent' }}>
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-black flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #2563EB, #0891B2)' }}>
            {review.reviewer_name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
              <p className="font-bold text-slate-900 text-sm">{review.reviewer_name}</p>
              {review.is_verified_purchase && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: '#DCFCE7', color: '#166534' }}>
                  <CheckCircle2 size={11} /> Đã mua sản phẩm
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {review.rating && review.rating > 0 && (
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map(s => (
                    <svg key={s} width="12" height="12" viewBox="0 0 24 24"
                      fill={s <= review.rating! ? '#F59E0B' : '#E2E8F0'}>
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                    </svg>
                  ))}
                </div>
              )}
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Clock size={11} /> {formatDateTime(review.created_at)}
              </span>
            </div>
          </div>
        </div>
        <p className="text-slate-700 text-sm leading-relaxed mb-3">{review.content}</p>
        <div className="flex items-center gap-3">
          <button onClick={() => onLike(review.id)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl transition-all"
            style={{
              background: isLiked ? '#EFF6FF' : '#F8FAFC',
              color: isLiked ? '#2563EB' : '#64748B',
              border: '1px solid ' + (isLiked ? '#BFDBFE' : '#E2E8F0'),
            }}>
            <ThumbsUp size={13} fill={isLiked ? '#2563EB' : 'none'} />
            {review.likes_count > 0 && <span>{review.likes_count}</span>}
            Hữu ích
          </button>
          {depth === 0 && (
            <button onClick={() => onReply(review.id, review.reviewer_name)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl transition-all"
              style={{ background: '#F8FAFC', color: '#64748B', border: '1px solid #E2E8F0' }}>
              <Reply size={13} /> Trả lời
            </button>
          )}
        </div>
      </div>
      {review.replies && review.replies.length > 0 && (
        <div className="mt-3 space-y-3">
          {review.replies.map(reply => (
            <ReviewCard key={reply.id} review={reply} currentUserId={currentUserId}
              likedIds={likedIds} onLike={onLike} onReply={onReply} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  )
}

export function ReviewsSection({ productId, productName }: Props) {
  const [allReviews, setAllReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set())
  const [hasPurchased, setHasPurchased] = useState(false)
  const [replyTo, setReplyTo] = useState<{ id: string; name: string } | null>(null)
  const [form, setForm] = useState({ name: '', rating: 0, content: '', submitting: false })
  const [qaForm, setQaForm] = useState({ name: '', content: '', submitting: false })

  useEffect(() => { loadData() }, [productId])

  const loadData = async () => {
    const supabase = createClient()
    const { data: reviewsData } = await supabase
      .from('product_reviews').select('*')
      .eq('product_id', productId).eq('status', 'approved')
      .order('created_at', { ascending: false })

    const map: Record<string, Review> = {}
    const roots: Review[] = []
    ;(reviewsData ?? []).forEach(r => { map[r.id] = { ...r, replies: [] } })
    ;(reviewsData ?? []).forEach(r => {
      if (r.parent_id && map[r.parent_id]) map[r.parent_id].replies!.push(map[r.id])
      else if (!r.parent_id) roots.push(map[r.id])
    })
    setAllReviews(roots)

    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single()
      setCurrentUser(profile)
      const name = profile?.full_name || session.user.email?.split('@')[0] || ''
      setForm(f => ({ ...f, name }))
      setQaForm(f => ({ ...f, name }))

      const { data: orders } = await supabase
        .from('orders').select('id, order_items!inner(product_id)')
        .eq('user_id', session.user.id).eq('order_status', 'completed')
      const purchased = (orders ?? []).some((o: any) =>
        o.order_items?.some((i: any) => i.product_id === productId)
      )
      setHasPurchased(purchased)

      const { data: likes } = await supabase.from('review_likes').select('review_id').eq('user_id', session.user.id)
      setLikedIds(new Set((likes ?? []).map((l: any) => l.review_id)))
    }
    setLoading(false)
  }

  const handleLike = async (reviewId: string) => {
    if (!currentUser) { toast.error('Vui lòng đăng nhập để thích bình luận'); return }
    const supabase = createClient()
    const isLiked = likedIds.has(reviewId)
    const target = allReviews.find(r => r.id === reviewId)
    if (isLiked) {
      await supabase.from('review_likes').delete().eq('review_id', reviewId).eq('user_id', currentUser.id)
      await supabase.from('product_reviews').update({ likes_count: Math.max(0, (target?.likes_count ?? 1) - 1) }).eq('id', reviewId)
      setLikedIds(prev => { const s = new Set(prev); s.delete(reviewId); return s })
    } else {
      await supabase.from('review_likes').insert({ review_id: reviewId, user_id: currentUser.id })
      await supabase.from('product_reviews').update({ likes_count: (target?.likes_count ?? 0) + 1 }).eq('id', reviewId)
      setLikedIds(prev => new Set([...prev, reviewId]))
    }
    loadData()
  }

  const handleReply = (id: string, name: string) => {
    if (!currentUser) { toast.error('Vui lòng đăng nhập để trả lời'); return }
    setReplyTo({ id, name })
    setTimeout(() => document.getElementById('review-form')?.scrollIntoView({ behavior: 'smooth' }), 100)
  }

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) { toast.error('Vui lòng điền tên'); return }
    if (form.content.length < 10) { toast.error('Bình luận tối thiểu 10 ký tự'); return }
    if (!replyTo && form.rating === 0) { toast.error('Vui lòng chọn số sao'); return }
    setForm(f => ({ ...f, submitting: true }))
    const supabase = createClient()
    const { error } = await supabase.from('product_reviews').insert({
      product_id: productId,
      user_id: currentUser?.id ?? null,
      reviewer_name: form.name,
      rating: !replyTo && form.rating > 0 ? form.rating : null,
      content: form.content,
      status: 'pending',
      is_verified_purchase: hasPurchased && !replyTo,
      parent_id: replyTo?.id ?? null,
      likes_count: 0,
    })
    if (error) {
      toast.error('Lỗi khi gửi', { description: error.message })
    } else {
      toast.success('Đã gửi! Đang chờ duyệt.')
      setForm(f => ({ ...f, rating: 0, content: '' }))
      setReplyTo(null)
    }
    setForm(f => ({ ...f, submitting: false }))
  }

  const handleSubmitQa = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!qaForm.name.trim()) { toast.error('Vui lòng điền tên'); return }
    if (qaForm.content.length < 10) { toast.error('Câu hỏi tối thiểu 10 ký tự'); return }
    setQaForm(f => ({ ...f, submitting: true }))
    const supabase = createClient()
    const { error } = await supabase.from('product_reviews').insert({
      product_id: productId,
      user_id: currentUser?.id ?? null,
      reviewer_name: qaForm.name,
      rating: null,
      content: qaForm.content,
      status: 'pending',
      is_verified_purchase: false,
      parent_id: null,
      likes_count: 0,
    })
    if (error) {
      toast.error('Lỗi khi gửi', { description: error.message })
    } else {
      toast.success('Câu hỏi đã được gửi! Chúng tôi sẽ trả lời sớm nhất.')
      setQaForm(f => ({ ...f, content: '' }))
    }
    setQaForm(f => ({ ...f, submitting: false }))
  }

  const ratingReviews = allReviews.filter(r => r.rating && r.rating > 0)
  const qaItems = allReviews.filter(r => !r.rating || r.rating === 0)
  const avgRating = ratingReviews.length > 0
    ? ratingReviews.reduce((s, r) => s + (r.rating ?? 0), 0) / ratingReviews.length : 0

  if (loading) return (
    <div className="flex justify-center py-10">
      <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="space-y-10">

      {/* ── PHẦN 1: ĐÁNH GIÁ ── */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-1 h-7 rounded-full" style={{ background: 'linear-gradient(135deg,#2563EB,#0891B2)' }} />
          <h2 className="text-lg font-black text-slate-900">Đánh Giá Sản Phẩm</h2>
          {ratingReviews.length > 0 && (
            <span className="text-sm font-semibold px-2.5 py-1 rounded-full"
              style={{ background: '#EFF6FF', color: '#2563EB' }}>
              {ratingReviews.length} đánh giá
            </span>
          )}
        </div>

        {/* Rating summary */}
        {ratingReviews.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col sm:flex-row items-center gap-6">
            <div className="text-center flex-shrink-0">
              <p className="text-5xl font-black" style={{ color: '#F59E0B' }}>{avgRating.toFixed(1)}</p>
              <div className="flex justify-center gap-0.5 mt-1">
                {[1,2,3,4,5].map(s => (
                  <svg key={s} width="16" height="16" viewBox="0 0 24 24"
                    fill={s <= Math.round(avgRating) ? '#F59E0B' : '#E2E8F0'}>
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                ))}
              </div>
              <p className="text-xs text-slate-400 mt-1">{ratingReviews.length} đánh giá</p>
            </div>
            <div className="flex-1 w-full space-y-1.5">
              {[5,4,3,2,1].map(star => {
                const count = ratingReviews.filter(r => r.rating === star).length
                const pct = ratingReviews.length > 0 ? (count / ratingReviews.length) * 100 : 0
                return (
                  <div key={star} className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 w-4">{star}</span>
                    <svg width="12" height="12" fill="#F59E0B" viewBox="0 0 24 24">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                    </svg>
                    <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: '#F1F5F9' }}>
                      <div className="h-full rounded-full" style={{ width: pct + '%', background: '#F59E0B' }} />
                    </div>
                    <span className="text-xs text-slate-400 w-5">{count}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Reviews list */}
        {ratingReviews.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-2xl border border-slate-200">
            <div className="text-4xl mb-3">⭐</div>
            <p className="font-semibold text-slate-700 mb-1">Chưa có đánh giá nào</p>
            <p className="text-xs text-slate-400">Hãy là người đầu tiên đánh giá sản phẩm này!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {ratingReviews.map(review => (
              <ReviewCard key={review.id} review={review}
                currentUserId={currentUser?.id ?? null}
                likedIds={likedIds} onLike={handleLike} onReply={handleReply} />
            ))}
          </div>
        )}

        {/* Form đánh giá — chỉ buyer thấy */}
        {hasPurchased && (
          <div id="review-form" className="bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="font-bold text-slate-900 mb-2">
              {replyTo ? '↩️ Trả lời @' + replyTo.name : '✍️ Viết đánh giá'}
            </h3>
            {replyTo && (
              <button onClick={() => setReplyTo(null)}
                className="text-xs text-slate-400 hover:text-slate-600 mb-3 block">
                × Huỷ trả lời
              </button>
            )}
            {!replyTo && (
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full mb-4"
                style={{ background: '#DCFCE7', color: '#166534' }}>
                <CheckCircle2 size={12} /> Bạn đã mua sản phẩm này — có thể đánh giá sao
              </div>
            )}
            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Tên hiển thị *</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Nguyễn Văn A" className="input" required />
              </div>
              {!replyTo && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Đánh giá *</label>
                  <StarPicker value={form.rating} onChange={v => setForm(f => ({ ...f, rating: v }))} />
                  {form.rating > 0 && (
                    <p className="text-xs mt-1" style={{ color: '#F59E0B' }}>
                      {['', 'Rất tệ', 'Tệ', 'Bình thường', 'Tốt', 'Xuất sắc!'][form.rating]}
                    </p>
                  )}
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  {replyTo ? 'Nội dung trả lời *' : 'Nội dung đánh giá *'}
                </label>
                <textarea value={form.content}
                  onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                  rows={4} className="input resize-none"
                  placeholder={replyTo ? 'Trả lời ' + replyTo.name + '...' : 'Chia sẻ trải nghiệm của bạn...'}
                  required minLength={10} />
                <p className="text-xs text-slate-400 mt-1">{form.content.length}/500 ký tự</p>
              </div>
              <button type="submit" disabled={form.submitting}
                className="btn-primary py-3 px-6 disabled:opacity-60">
                {form.submitting ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Đang gửi...
                  </span>
                ) : replyTo ? '↩️ Gửi trả lời' : '⭐ Gửi đánh giá'}
              </button>
            </form>
            <div className="mt-4 p-3 rounded-xl text-xs" style={{ background: '#F8FAFC', color: '#64748B' }}>
              💬 Bình luận sẽ được duyệt trước khi hiển thị.
            </div>
          </div>
        )}
      </div>

      {/* ── PHẦN 2: HỎI ĐÁP ── */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-1 h-7 rounded-full" style={{ background: 'linear-gradient(135deg,#7C3AED,#A855F7)' }} />
          <h2 className="text-lg font-black text-slate-900">Hỏi & Đáp</h2>
          {qaItems.length > 0 && (
            <span className="text-sm font-semibold px-2.5 py-1 rounded-full"
              style={{ background: '#F5F3FF', color: '#7C3AED' }}>
              {qaItems.length} câu hỏi
            </span>
          )}
        </div>

        {/* Q&A list */}
        {qaItems.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-2xl border border-slate-200">
            <div className="text-4xl mb-3">💬</div>
            <p className="font-semibold text-slate-700 mb-1">Chưa có câu hỏi nào</p>
            <p className="text-xs text-slate-400">Bạn có thắc mắc? Đặt câu hỏi bên dưới!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {qaItems.map(qa => (
              <div key={qa.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="p-5">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg, #7C3AED, #A855F7)' }}>
                      {qa.reviewer_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <p className="font-bold text-slate-900 text-sm">{qa.reviewer_name}</p>
                        <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                          style={{ background: '#F5F3FF', color: '#7C3AED' }}>❓ Hỏi</span>
                        <span className="text-xs text-slate-400 flex items-center gap-1 ml-auto">
                          <Clock size={11} /> {formatDateTime(qa.created_at)}
                        </span>
                      </div>
                      <p className="text-sm text-slate-700 leading-relaxed">{qa.content}</p>
                    </div>
                  </div>
                </div>
                {qa.replies && qa.replies.filter(r => r.status === 'approved').length > 0 && (
                  <div className="border-t border-slate-100">
                    {qa.replies.filter(r => r.status === 'approved').map(reply => (
                      <div key={reply.id} className="px-5 py-4 flex items-start gap-3"
                        style={{ background: '#F8FAFC' }}>
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                          style={{ background: 'linear-gradient(135deg, #2563EB, #0891B2)' }}>
                          {reply.reviewer_name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <p className="font-bold text-slate-900 text-xs">{reply.reviewer_name}</p>
                            {['xanhsoft','admin','shop'].some(k => reply.reviewer_name.toLowerCase().includes(k)) ? (
                              <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold"
                                style={{ background: '#EFF6FF', color: '#2563EB' }}>✅ XanhSoft</span>
                            ) : (
                              <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold"
                                style={{ background: '#F0FDF4', color: '#16A34A' }}>↩️ Trả lời</span>
                            )}
                            <span className="text-xs text-slate-400 ml-auto flex items-center gap-1">
                              <Clock size={10} /> {formatDateTime(reply.created_at)}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600 leading-relaxed">{reply.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Form hỏi đáp */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="font-bold text-slate-900 mb-1">💬 Đặt câu hỏi</h3>
          <p className="text-xs text-slate-400 mb-4">Chưa mua sản phẩm? Hỏi ngay, chúng tôi sẽ trả lời sớm nhất!</p>
          <form onSubmit={handleSubmitQa} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Tên hiển thị *</label>
              <input value={qaForm.name} onChange={e => setQaForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Nguyễn Văn A" className="input" required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Câu hỏi của bạn *</label>
              <textarea value={qaForm.content}
                onChange={e => setQaForm(f => ({ ...f, content: e.target.value }))}
                rows={4} className="input resize-none"
                placeholder={'Giao hàng mất bao lâu? Tài khoản dùng được mấy thiết bị?...'}
                required minLength={10} />
              <p className="text-xs text-slate-400 mt-1">{qaForm.content.length}/500 ký tự</p>
            </div>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <p className="text-xs text-slate-400">
                Hoặc{' '}
                <a href="https://zalo.me/0888993991" target="_blank" rel="noopener noreferrer"
                  className="font-semibold hover:underline" style={{ color: '#2563EB' }}>
                  chat Zalo
                </a>{' '}
                để được tư vấn nhanh hơn
              </p>
              <button type="submit" disabled={qaForm.submitting}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50 transition-all"
                style={{ background: 'linear-gradient(135deg, #7C3AED, #6D28D9)' }}>
                {qaForm.submitting
                  ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <Send size={14} />}
                Gửi câu hỏi
              </button>
            </div>
          </form>
          <div className="mt-4 p-3 rounded-xl text-xs" style={{ background: '#F8FAFC', color: '#64748B' }}>
            💬 Câu hỏi sẽ được duyệt trước khi hiển thị. Thường trong vòng vài giờ.
          </div>
        </div>
      </div>
    </div>
  )
}