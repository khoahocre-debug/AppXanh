'use client'
import { useRef } from 'react'

const reviews = [
  { name: 'Nguyễn Minh Tuấn', role: 'Freelance Designer', color: '#7C3AED',
    text: 'Mua Canva Pro giá rẻ hơn 10 lần. Tài khoản ổn định, dùng 6 tháng chưa có vấn đề gì. Rất recommend cho ae!',
    product: 'Canva Pro 1 Năm' },
  { name: 'Trần Thị Lan', role: 'Content Creator', color: '#10A37F',
    text: 'ChatGPT Plus Business xịn lắm, có đầy đủ GPT-5.2 và DALL-E. Admin hỗ trợ rất nhiệt tình, giao hàng siêu nhanh!',
    product: 'ChatGPT Plus Business' },
  { name: 'Lê Hoàng Nam', role: 'Marketing Manager', color: '#EF4444',
    text: 'Đã mua YouTube Premium và Claude Pro. Cả 2 đều chất lượng, giá rẻ bất ngờ. Sẽ tiếp tục ủng hộ App Xanh!',
    product: 'YouTube Premium' },
  { name: 'Phạm Thị Hoa', role: 'Sinh viên', color: '#2563EB',
    text: 'Sinh viên cần tiết kiệm nên App Xanh là lựa chọn hoàn hảo. Mua ChatGPT Go 200k dùng cả năm, quá ngon luôn!',
    product: 'ChatGPT Go 1 Năm' },
  { name: 'Võ Đình Khoa', role: 'Developer', color: '#0891B2',
    text: 'GitHub Copilot Pro mua ở đây rẻ hơn nhiều. Code xịn hẳn lên, tiết kiệm thời gian cực kỳ. Admin support nhiệt tình.',
    product: 'GitHub Copilot Pro' },
  { name: 'Đặng Thu Hương', role: 'Entrepreneur', color: '#EA580C',
    text: 'Mua nhiều lần rồi, lần nào cũng ổn. Giá tốt, service tốt, tài khoản bền. Đã giới thiệu cho cả team 10 người!',
    product: 'Adobe CC + Canva' },
  { name: 'Bùi Thanh Tùng', role: 'Video Editor', color: '#D97706',
    text: 'Adobe Creative Cloud giá gốc mắc kinh khủng. Mua ở App Xanh tiết kiệm được cả triệu mỗi tháng. Quá ổn!',
    product: 'Adobe Creative Cloud' },
  { name: 'Ngô Thị Mai', role: 'Teacher', color: '#16A34A',
    text: 'Mua Canva Pro để làm giáo án, tài liệu. Giao hàng nhanh, hỗ trợ tận tình. Sẽ mua thêm cho đồng nghiệp!',
    product: 'Canva Pro 1 Năm' },
]

export function ReviewsCarousel() {
  const ref = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)
  const startX = useRef(0)
  const scrollLeft = useRef(0)

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true
    startX.current = e.pageX - (ref.current?.offsetLeft ?? 0)
    scrollLeft.current = ref.current?.scrollLeft ?? 0
    if (ref.current) ref.current.style.cursor = 'grabbing'
  }

  const handleMouseUp = () => {
    isDragging.current = false
    if (ref.current) ref.current.style.cursor = 'grab'
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !ref.current) return
    e.preventDefault()
    const x = e.pageX - ref.current.offsetLeft
    const walk = (x - startX.current) * 1.8
    ref.current.scrollLeft = scrollLeft.current - walk
  }

  return (
    <div
      ref={ref}
      className="overflow-x-auto pb-4 -mx-4 px-4"
      style={{
        cursor: 'grab',
        scrollSnapType: 'x mandatory',
        WebkitOverflowScrolling: 'touch',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
      }}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onMouseMove={handleMouseMove}
    >
      <style>{`
        .reviews-track::-webkit-scrollbar { display: none; }
      `}</style>
      <div className="reviews-track flex gap-4" style={{ width: 'max-content' }}>
        {reviews.map((review, i) => (
          <div key={i}
            className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex-shrink-0 flex flex-col"
            style={{ width: '295px', scrollSnapAlign: 'start', userSelect: 'none' }}>

            {/* Stars */}
            <div className="flex gap-0.5 mb-3">
              {[1,2,3,4,5].map(s => (
                <svg key={s} width="16" height="16" fill="#F59E0B" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
              ))}
            </div>

            {/* Text */}
            <p className="text-slate-600 text-sm leading-relaxed flex-1 mb-4">
              "{review.text}"
            </p>

            {/* Author */}
            <div className="pt-3 border-t border-slate-100">
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-black flex-shrink-0"
                  style={{ background: `linear-gradient(135deg, ${review.color}, #0891B2)` }}>
                  {review.name.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-sm">{review.name}</p>
                  <p className="text-xs text-slate-400">{review.role}</p>
                </div>
              </div>
              <span className="inline-block text-xs px-2.5 py-1 rounded-full font-semibold"
                style={{ background: '#F1F5F9', color: '#64748B' }}>
                {review.product}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}