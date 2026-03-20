'use client'
import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Plus, Trash2, ArrowLeft, Save, X, ImagePlus, Star, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'
import { slugify } from '@/lib/utils'
import type { Category } from '@/types'

interface Variant {
  id?: string
  name: string
  option_value: string
  price: string
  compare_at_price: string
  stock: string
  is_default: boolean
  delivery_type: string
}

interface ProductImage {
  id?: string
  image_url: string
  alt_text: string
  sort_order: number
  is_cover?: boolean
  file?: File
  preview?: string
}

interface ReviewRow {
  id: string
  reviewer_name: string
  reviewer_avatar: string | null
  rating: number | null
  content: string
  is_verified_purchase: boolean
  created_at: string
  parent_id: string | null
  status?: string
}

interface ReadyAccount {
  id?: string
  email: string
  password: string
  extra_info: string
  status: 'available' | 'assigned'
  order_id?: string | null
  variant_id?: string | null
  orders?: { order_code: string; customer_name: string } | null
}

interface Props {
  categories: Category[]
  product?: any
}

// ── FakeQaForm với rollback nếu answer fail ──────────────
function FakeQaForm({ productId, onDone }: { productId: string; onDone: () => void }) {
  const [question, setQuestion] = useState({ name: '', content: '' })
  const [answer, setAnswer] = useState({ name: 'XanhSoft', content: '' })
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!question.name.trim() || !question.content.trim()) {
      toast.error('Vui lòng điền tên và câu hỏi')
      return
    }
    setSaving(true)
    const supabase = createClient()

    // Insert câu hỏi
    const { data: insertedQ, error: qErr } = await supabase
      .from('product_reviews')
      .insert({
        product_id: productId,
        reviewer_name: question.name.trim(),
        rating: null,
        content: question.content.trim(),
        status: 'approved',
        is_verified_purchase: false,
        parent_id: null,
        likes_count: 0,
      })
      .select()
      .single()

    if (qErr || !insertedQ) {
      toast.error('Lỗi khi tạo câu hỏi', { description: qErr?.message })
      setSaving(false)
      return
    }

    // Insert câu trả lời nếu có
    if (answer.content.trim()) {
      const { error: aErr } = await supabase.from('product_reviews').insert({
        product_id: productId,
        reviewer_name: answer.name.trim() || 'XanhSoft',
        rating: null,
        content: answer.content.trim(),
        status: 'approved',
        is_verified_purchase: false,
        parent_id: insertedQ.id,
        likes_count: 0,
      })

      if (aErr) {
        // Rollback: xóa câu hỏi vừa tạo
        await supabase.from('product_reviews').delete().eq('id', insertedQ.id)
        toast.error('Lỗi khi tạo câu trả lời — đã rollback câu hỏi', { description: aErr.message })
        setSaving(false)
        return
      }
    }

    toast.success('Đã thêm hỏi đáp!')
    setQuestion({ name: '', content: '' })
    setAnswer({ name: 'XanhSoft', content: '' })
    onDone()
    setSaving(false)
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border p-4 space-y-3" style={{ background: '#F5F3FF', borderColor: '#DDD6FE' }}>
        <p className="text-xs font-bold" style={{ color: '#7C3AED' }}>❓ Câu hỏi</p>
        <input value={question.name} onChange={e => setQuestion(v => ({ ...v, name: e.target.value }))}
          placeholder="Tên người hỏi" className="input text-sm" />
        <textarea value={question.content} onChange={e => setQuestion(v => ({ ...v, content: e.target.value }))}
          rows={3} className="input resize-none text-sm"
          placeholder="VD: Tài khoản này dùng được mấy thiết bị?" />
      </div>

      <div className="rounded-xl border p-4 space-y-3" style={{ background: '#F0FDF4', borderColor: '#BBF7D0' }}>
        <p className="text-xs font-bold" style={{ color: '#16A34A' }}>↩️ Trả lời (không bắt buộc)</p>
        <input value={answer.name} onChange={e => setAnswer(v => ({ ...v, name: e.target.value }))}
          placeholder="Tên người trả lời" className="input text-sm" />
        <textarea value={answer.content} onChange={e => setAnswer(v => ({ ...v, content: e.target.value }))}
          rows={3} className="input resize-none text-sm"
          placeholder="VD: Tài khoản dùng được 1 thiết bị, bảo hành đăng nhập lần đầu..." />
      </div>

      <button onClick={handleSave} disabled={saving || !question.name.trim() || !question.content.trim()}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-60"
        style={{ background: 'linear-gradient(135deg, #7C3AED, #6D28D9)' }}>
        {saving
          ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          : '💬'} Thêm Hỏi Đáp
      </button>
    </div>
  )
}

// ── VariantAccountsManager ───────────────────────────────
function VariantAccountsManager({ variantId, productId }: { variantId: string; productId?: string }) {
  const [accounts, setAccounts] = useState<any[]>([])
  const [bulkText, setBulkText] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showList, setShowList] = useState(false)
  const [showPass, setShowPass] = useState<Record<number, boolean>>({})

  const load = async () => {
    setLoading(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('product_ready_accounts')
      .select('*, orders(order_code)')
      .eq('variant_id', variantId)
      .order('created_at', { ascending: true })
    setAccounts(data ?? [])
    setLoading(false)
  }

  useEffect(() => { if (showList) load() }, [showList, variantId])

  const handleSave = async () => {
    if (!bulkText.trim() || !productId) return
    setSaving(true)
    const supabase = createClient()
    const records = bulkText.trim().split('\n')
      .filter(l => l.trim() && l.includes('|'))
      .map(line => {
        const parts = line.split('|')
        return {
          product_id: productId,
          variant_id: variantId,
          email: parts[0]?.trim() ?? '',
          password: parts[1]?.trim() ?? '',
          extra_info: parts[2]?.trim() ?? '',
          status: 'available' as const,
        }
      }).filter(r => r.email && r.password)

    if (!records.length) { toast.error('Không có dòng hợp lệ'); setSaving(false); return }
    const { error } = await supabase.from('product_ready_accounts').insert(records)
    if (error) toast.error('Lỗi', { description: error.message })
    else {
      toast.success('✅ Thêm ' + records.length + ' tài khoản!')
      setBulkText('')
      if (showList) load()
    }
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Xóa tài khoản này?')) return
    const supabase = createClient()
    await supabase.from('product_ready_accounts').delete().eq('id', id)
    setAccounts(prev => prev.filter(a => a.id !== id))
    toast.success('Đã xóa')
  }

  const available = accounts.filter(a => a.status === 'available').length
  const assigned = accounts.filter(a => a.status === 'assigned').length

  return (
    <div className="rounded-xl border p-4 mt-3" style={{ background: '#F0FDF4', borderColor: '#BBF7D0' }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-bold text-slate-700">🔐 Pool tài khoản biến thể này</span>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: '#DCFCE7', color: '#16A34A' }}>
            {available} còn trống
          </span>
          {assigned > 0 && (
            <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: '#FFFBEB', color: '#D97706' }}>
              {assigned} đã giao
            </span>
          )}
        </div>
        <button onClick={() => setShowList(v => !v)}
          className="text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-all"
          style={{ background: '#EFF6FF', color: '#2563EB' }}>
          {showList ? 'Ẩn danh sách' : 'Xem danh sách (' + accounts.length + ')'}
        </button>
      </div>

      <p className="text-xs text-slate-500 mb-2">
        Format: <code className="bg-white px-1.5 py-0.5 rounded font-mono text-xs">email|password|thông tin thêm</code>
      </p>
      <textarea value={bulkText} onChange={e => setBulkText(e.target.value)} rows={3}
        className="input font-mono text-xs resize-none mb-2"
        placeholder={'brake1@gmail.com|pass123|acc clean\nbrake2@gmail.com|pass456|team US'} />
      <div className="flex justify-between items-center">
        <p className="text-xs text-slate-400">
          {bulkText.trim() ? bulkText.trim().split('\n').filter(l => l.includes('|')).length + ' dòng hợp lệ' : ''}
        </p>
        <button onClick={handleSave} disabled={saving || !bulkText.trim()}
          className="text-xs font-bold px-4 py-2 rounded-xl text-white disabled:opacity-50 transition-all"
          style={{ background: 'linear-gradient(135deg, #16A34A, #059669)' }}>
          {saving ? '⏳ Đang lưu...' : '💾 Lưu vào pool'}
        </button>
      </div>

      {showList && (
        <div className="mt-3 border-t border-green-200 pt-3">
          {loading ? (
            <div className="flex justify-center py-4">
              <div className="w-5 h-5 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : accounts.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-3">Chưa có tài khoản nào trong pool này</p>
          ) : (
            <div className="space-y-1.5 max-h-52 overflow-y-auto">
              {accounts.map((acc, i) => (
                <div key={acc.id} className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs"
                  style={{ background: acc.status === 'assigned' ? '#FFFBEB' : 'white', border: '1px solid #E2E8F0' }}>
                  <span className={'flex-shrink-0 font-bold px-1.5 py-0.5 rounded-full text-[10px] ' +
                    (acc.status === 'available' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700')}>
                    {acc.status === 'available' ? '✅' : '📦'}
                  </span>
                  <span className="font-mono flex-1 truncate text-slate-700 min-w-0">{acc.email}</span>
                  <span className="font-mono text-slate-400 flex-shrink-0">
                    {showPass[i] ? acc.password : '••••••'}
                  </span>
                  <button onClick={() => setShowPass(p => ({ ...p, [i]: !p[i] }))}
                    className="flex-shrink-0 text-slate-400 hover:text-slate-600">
                    {showPass[i] ? <EyeOff size={11} /> : <Eye size={11} />}
                  </button>
                  {acc.extra_info && (
                    <span className="text-slate-400 truncate max-w-[80px] flex-shrink-0">{acc.extra_info}</span>
                  )}
                  {acc.status === 'assigned' && acc.orders && (
                    <span className="text-amber-600 font-bold text-[10px] flex-shrink-0">#{acc.orders.order_code}</span>
                  )}
                  {acc.status === 'available' && (
                    <button onClick={() => handleDelete(acc.id)}
                      className="flex-shrink-0 text-red-400 hover:text-red-600 transition-colors">
                      <Trash2 size={11} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
          <button onClick={load}
            className="mt-2 text-xs font-semibold px-3 py-1 rounded-lg hover:bg-green-100 transition-colors"
            style={{ color: '#16A34A' }}>
            🔄 Refresh
          </button>
        </div>
      )}
    </div>
  )
}

// ── Main ProductForm ─────────────────────────────────────
export function ProductForm({ categories, product }: Props) {
  const isEdit = !!product
  const coverInputRef = useRef<HTMLInputElement>(null)
  const extraInputRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    name: product?.name ?? '',
    slug: product?.slug ?? '',
    short_description: product?.short_description ?? '',
    price: product?.price?.toString() ?? '',
    compare_at_price: product?.compare_at_price?.toString() ?? '',
    stock: product?.stock?.toString() ?? '0',
    status: product?.status ?? 'active',
    delivery_type: product?.delivery_type ?? 'ready_account',
    category_id: product?.category_id ?? '',
    badge_text: product?.badge_text ?? '',
    featured: product?.featured ?? false,
    description_html: product?.description_html ?? '',
    usage_guide_html: product?.usage_guide_html ?? '',
    warranty_html: product?.warranty_html ?? '',
    faq_html: product?.faq_html ?? '',
  })

  const [coverImage, setCoverImage] = useState<ProductImage | null>(
    product?.product_images?.find((img: any) => img.sort_order === 0)
      ? {
          id: product.product_images.find((img: any) => img.sort_order === 0).id,
          image_url: product.product_images.find((img: any) => img.sort_order === 0).image_url,
          alt_text: product.product_images.find((img: any) => img.sort_order === 0).alt_text ?? '',
          sort_order: 0,
          is_cover: true,
        }
      : null
  )

  const [extraImages, setExtraImages] = useState<ProductImage[]>(
    product?.product_images
      ?.filter((img: any) => img.sort_order > 0)
      ?.map((img: any) => ({
        id: img.id,
        image_url: img.image_url,
        alt_text: img.alt_text ?? '',
        sort_order: img.sort_order,
      })) ?? []
  )

  const [variants, setVariants] = useState<Variant[]>(
    product?.product_variants?.map((v: any) => ({
      id: v.id,
      name: v.name,
      option_value: v.option_value,
      price: v.price?.toString() ?? '',
      compare_at_price: v.compare_at_price?.toString() ?? '',
      stock: v.stock?.toString() ?? '0',
      is_default: v.is_default,
      delivery_type: v.delivery_type ?? 'ready_account',
    })) ?? []
  )

  const [reviews, setReviews] = useState<ReviewRow[]>([])
  const [newReview, setNewReview] = useState({ reviewer_name: '', rating: 5, content: '', reviewer_avatar: '' })
  const [savingReview, setSavingReview] = useState(false)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'basic' | 'images' | 'content' | 'variants' | 'accounts' | 'reviews'>('basic')

  const [accounts, setAccounts] = useState<ReadyAccount[]>([])
  const [accLoading, setAccLoading] = useState(false)
  const [accSaving, setAccSaving] = useState(false)
  const [bulkText, setBulkText] = useState('')
  const [showAccPass, setShowAccPass] = useState<Record<number, boolean>>({})

  useEffect(() => {
    if (!product?.id) return
    if (activeTab === 'accounts') loadAccounts()
    if (activeTab === 'reviews') loadReviews()
  }, [activeTab, product?.id])

  const loadAccounts = async () => {
    if (!product?.id) return
    setAccLoading(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('product_ready_accounts')
      .select('*, orders(order_code, customer_name)')
      .eq('product_id', product.id)
      .is('variant_id', null)
      .order('created_at', { ascending: true })
    setAccounts((data ?? []) as ReadyAccount[])
    setAccLoading(false)
  }

  // loadReviews không có guard — luôn fetch lại khi gọi
  const loadReviews = async () => {
    if (!product?.id) return
    const supabase = createClient()
    const { data, error } = await supabase.from('product_reviews').select('*')
      .eq('product_id', product.id).order('created_at', { ascending: true })
    if (error) {
      toast.error('Lỗi tải đánh giá', { description: error.message })
      return
    }
    setReviews(data ?? [])
  }

  const handleSaveAccounts = async () => {
    if (!bulkText.trim() || !product?.id) return
    setAccSaving(true)
    const supabase = createClient()
    const records = bulkText.trim().split('\n').filter(l => l.trim())
      .map(line => {
        const parts = line.split('|')
        return {
          product_id: product.id,
          variant_id: null,
          email: parts[0]?.trim() ?? '',
          password: parts[1]?.trim() ?? '',
          extra_info: parts[2]?.trim() ?? '',
          status: 'available' as const,
        }
      }).filter(r => r.email && r.password)

    if (!records.length) { toast.error('Không có dòng hợp lệ. Format: email|password|thông tin thêm'); setAccSaving(false); return }
    const { error } = await supabase.from('product_ready_accounts').insert(records)
    if (error) toast.error('Lỗi lưu tài khoản', { description: error.message })
    else { toast.success('✅ Đã thêm ' + records.length + ' tài khoản!'); setBulkText(''); loadAccounts() }
    setAccSaving(false)
  }

  const handleDeleteAccount = async (id: string) => {
    if (!confirm('Xóa tài khoản này?')) return
    const supabase = createClient()
    await supabase.from('product_ready_accounts').delete().eq('id', id)
    setAccounts(prev => prev.filter(a => a.id !== id))
    toast.success('Đã xóa')
  }

  const handleNameChange = (name: string) => {
    setForm(f => ({ ...f, name, slug: isEdit ? f.slug : slugify(name) }))
  }

  const uploadFile = async (file: File, path: string): Promise<string> => {
    const supabase = createClient()
    const { error } = await supabase.storage.from('products').upload(path, file, { upsert: true })
    if (error) throw error
    const { data: { publicUrl } } = supabase.storage.from('products').getPublicUrl(path)
    return publicUrl
  }

  const handleCoverSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { toast.error('Ảnh tối đa 5MB'); return }
    const preview = URL.createObjectURL(file)
    setCoverImage({ image_url: preview, alt_text: form.name, sort_order: 0, is_cover: true, file, preview })
    toast.success('Đã chọn ảnh bìa!')
  }

  const handleExtraSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    const newImages: ProductImage[] = files.map((file, i) => ({
      image_url: URL.createObjectURL(file),
      alt_text: form.name,
      sort_order: extraImages.length + i + 1,
      file,
      preview: URL.createObjectURL(file),
    }))
    setExtraImages(prev => [...prev, ...newImages])
    toast.success('Đã thêm ' + files.length + ' ảnh!')
  }

  const addVariant = () => {
    setVariants(prev => [...prev, {
      name: 'Thời hạn', option_value: '', price: '',
      compare_at_price: '', stock: '0',
      is_default: prev.length === 0,
      delivery_type: 'ready_account',
    }])
  }

  const removeVariant = (index: number) => setVariants(prev => prev.filter((_, i) => i !== index))

  const updateVariant = (index: number, field: keyof Variant, value: any) => {
    if (field === 'is_default') {
      setVariants(prev => prev.map((v, i) => ({ ...v, is_default: i === index })))
    } else {
      setVariants(prev => prev.map((v, i) => i === index ? { ...v, [field]: value } : v))
    }
  }

  // handleAddReview với error handling đầy đủ
  const handleAddReview = async () => {
    if (!newReview.reviewer_name || !newReview.content) { toast.error('Vui lòng điền tên và nội dung'); return }
    setSavingReview(true)
    const supabase = createClient()
    const { data, error } = await supabase.from('product_reviews').insert({
      product_id: product.id,
      reviewer_name: newReview.reviewer_name,
      rating: newReview.rating,
      content: newReview.content,
      reviewer_avatar: newReview.reviewer_avatar || null,
      status: 'approved',
      is_verified_purchase: true,
      parent_id: null,
      likes_count: 0,
    }).select().single()
    if (error) {
      toast.error('Lỗi khi thêm đánh giá', { description: error.message })
    } else if (data) {
      setNewReview({ reviewer_name: '', rating: 5, content: '', reviewer_avatar: '' })
      toast.success('Đã thêm đánh giá!')
      loadReviews()
    }
    setSavingReview(false)
  }

  // handleDeleteReview xóa cascade reply con bằng 1 query
  const handleDeleteReview = async (id: string) => {
    if (!confirm('Xóa mục này? Reply con cũng sẽ bị xóa.')) return
    const supabase = createClient()
    // Tìm tất cả reply con
    const childIds = reviews.filter(r => r.parent_id === id).map(r => r.id)
    const allIds = [id, ...childIds]
    const { error } = await supabase.from('product_reviews').delete().in('id', allIds)
    if (error) {
      toast.error('Lỗi khi xóa', { description: error.message })
    } else {
      setReviews(prev => prev.filter(r => !allIds.includes(r.id)))
      toast.success('Đã xóa!')
    }
  }

  const handleSave = async () => {
    if (!form.name || !form.price) { toast.error('Vui lòng điền tên và giá sản phẩm'); return }
    setSaving(true)
    const supabase = createClient()
    try {
      const productData = {
        name: form.name,
        slug: form.slug || slugify(form.name),
        short_description: form.short_description || null,
        price: parseInt(form.price) || 0,
        compare_at_price: parseInt(form.compare_at_price) || null,
        stock: parseInt(form.stock) || 0,
        status: form.status,
        delivery_type: form.delivery_type,
        category_id: form.category_id || null,
        badge_text: form.badge_text || null,
        featured: form.featured,
        description_html: form.description_html || null,
        usage_guide_html: form.usage_guide_html || null,
        warranty_html: form.warranty_html || null,
        faq_html: form.faq_html || null,
      }

      let productId = product?.id
      if (isEdit) {
        const { error } = await supabase.from('products').update(productData).eq('id', productId)
        if (error) throw error
      } else {
        const { data, error } = await supabase.from('products').insert(productData).select().single()
        if (error) throw error
        productId = data.id
      }

      if (coverImage) {
        let imageUrl = coverImage.image_url
        if (coverImage.file) {
          const ext = coverImage.file.name.split('.').pop()
          imageUrl = await uploadFile(coverImage.file, productId + '/cover.' + ext)
        }
        if (coverImage.id) {
          await supabase.from('product_images').update({ image_url: imageUrl, alt_text: form.name, sort_order: 0 }).eq('id', coverImage.id)
        } else {
          await supabase.from('product_images').insert({ product_id: productId, image_url: imageUrl, alt_text: form.name, sort_order: 0 })
        }
      }

      for (let i = 0; i < extraImages.length; i++) {
        const img = extraImages[i]
        let imageUrl = img.image_url
        if (img.file) {
          const ext = img.file.name.split('.').pop()
          imageUrl = await uploadFile(img.file, productId + '/extra-' + (i + 1) + '-' + Date.now() + '.' + ext)
        }
        if (img.id) {
          await supabase.from('product_images').update({ image_url: imageUrl, alt_text: img.alt_text || form.name, sort_order: i + 1 }).eq('id', img.id)
        } else {
          await supabase.from('product_images').insert({ product_id: productId, image_url: imageUrl, alt_text: img.alt_text || form.name, sort_order: i + 1 })
        }
      }

      if (variants.length > 0) {
        if (isEdit) {
          const keepIds = variants.filter(v => v.id).map(v => v.id!)
          if (keepIds.length > 0) {
            await supabase.from('product_variants').delete().eq('product_id', productId).not('id', 'in', '(' + keepIds.join(',') + ')')
          } else {
            await supabase.from('product_variants').delete().eq('product_id', productId)
          }
        }
        for (let i = 0; i < variants.length; i++) {
          const v = variants[i]
          const variantData = {
            product_id: productId,
            name: v.name,
            option_value: v.option_value,
            price: v.price ? parseInt(v.price) : null,
            compare_at_price: v.compare_at_price ? parseInt(v.compare_at_price) : null,
            stock: parseInt(v.stock) || 0,
            is_default: v.is_default,
            sort_order: i,
            delivery_type: v.delivery_type ?? 'ready_account',
          }
          if (v.id) {
            await supabase.from('product_variants').update(variantData).eq('id', v.id)
          } else {
            await supabase.from('product_variants').insert(variantData)
          }
        }
      }

      toast.success(isEdit ? 'Đã cập nhật sản phẩm!' : 'Đã thêm sản phẩm!')
      window.location.href = '/admin/products'
    } catch (err: any) {
      toast.error('Lỗi khi lưu', { description: err.message })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Xóa sản phẩm này? Không thể hoàn tác!')) return
    const supabase = createClient()
    await supabase.from('products').delete().eq('id', product.id)
    toast.success('Đã xóa sản phẩm')
    window.location.href = '/admin/products'
  }

  const isReadyAccount = form.delivery_type === 'ready_account' || form.delivery_type === 'both'
  const availableCount = accounts.filter(a => a.status === 'available').length
  const assignedCount = accounts.filter(a => a.status === 'assigned').length

  // Tách review entries và Q&A entries để render threaded
  const reviewEntries = reviews.filter(r => r.rating && r.rating > 0 && !r.parent_id)
  const qaRoots = reviews.filter(r => (!r.rating || r.rating === 0) && !r.parent_id)
  const qaRepliesByParent: Record<string, ReviewRow[]> = {}
  reviews.filter(r => r.parent_id).forEach(r => {
    if (!qaRepliesByParent[r.parent_id!]) qaRepliesByParent[r.parent_id!] = []
    qaRepliesByParent[r.parent_id!].push(r)
  })

  const TABS = [
    { id: 'basic', label: '📋 Thông Tin' },
    { id: 'images', label: '🖼️ Hình Ảnh (' + ((coverImage ? 1 : 0) + extraImages.length) + ')' },
    { id: 'content', label: '📝 Nội Dung' },
    { id: 'variants', label: '🔧 Biến Thể (' + variants.length + ')' },
    { id: 'accounts', label: '🔐 Tài Khoản Cấp Sẵn' + (accounts.length > 0 ? ' (' + availableCount + ' còn)' : '') },
    { id: 'reviews', label: '⭐ Đánh Giá & Hỏi Đáp (' + reviews.length + ')' },
  ]

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Link href="/admin/products"
          className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors">
          <ArrowLeft size={16} /> Quay lại
        </Link>
        <div className="flex items-center gap-3">
          {isEdit && (
            <button onClick={handleDelete}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-red-600 border-2 border-red-200 hover:bg-red-50 transition-all">
              Xóa
            </button>
          )}
          <button onClick={handleSave} disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, #2563EB, #1d4ed8)' }}>
            {saving ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Đang lưu...
              </span>
            ) : <><Save size={16} /> {isEdit ? 'Lưu Thay Đổi' : 'Thêm Sản Phẩm'}</>}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 mb-6 gap-1 overflow-x-auto">
        {TABS.map(tab => (
          <button key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className="flex-shrink-0 px-5 py-3 text-sm font-semibold border-b-2 transition-all whitespace-nowrap"
            style={{
              borderColor: activeTab === tab.id ? '#2563EB' : 'transparent',
              color: activeTab === tab.id ? '#1D4ED8' : '#64748B',
            }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Tab 1: Basic ── */}
      {activeTab === 'basic' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
              <h2 className="font-bold text-slate-900">Thông Tin Chính</h2>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Tên sản phẩm *</label>
                <input value={form.name} onChange={e => handleNameChange(e.target.value)}
                  placeholder="VD: Tài Khoản ChatGPT Plus Business" className="input" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Slug (URL)</label>
                <input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
                  placeholder="chatgpt-plus-business" className="input font-mono text-sm" />
                <p className="text-xs text-slate-400 mt-1">URL: /product/{form.slug || 'slug-san-pham'}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Mô tả ngắn</label>
                <textarea value={form.short_description}
                  onChange={e => setForm(f => ({ ...f, short_description: e.target.value }))}
                  rows={3} className="input resize-none"
                  placeholder="Mô tả ngắn hiển thị trên card sản phẩm..." />
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
              <h2 className="font-bold text-slate-900">Giá & Tồn Kho</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Giá bán (VND) *</label>
                  <input type="number" value={form.price}
                    onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                    placeholder="99000" className="input" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Giá gốc (VND)</label>
                  <input type="number" value={form.compare_at_price}
                    onChange={e => setForm(f => ({ ...f, compare_at_price: e.target.value }))}
                    placeholder="620000" className="input" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Tồn kho</label>
                <input type="number" value={form.stock}
                  onChange={e => setForm(f => ({ ...f, stock: e.target.value }))}
                  placeholder="50" className="input" />
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
              <h2 className="font-bold text-slate-900">Cài Đặt</h2>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Trạng thái</label>
                <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="input">
                  <option value="active">✅ Active — Hiển thị</option>
                  <option value="draft">🔒 Draft — Ẩn</option>
                  <option value="out_of_stock">❌ Hết hàng</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Loại giao hàng (mặc định)</label>
                <select value={form.delivery_type} onChange={e => setForm(f => ({ ...f, delivery_type: e.target.value }))} className="input">
                  <option value="ready_account">📦 Cấp sẵn</option>
                  <option value="upgrade_owner">📧 Nâng cấp chính chủ</option>
                  <option value="both">🔀 Cả 2 lựa chọn</option>
                </select>
                <p className="text-xs text-slate-400 mt-1">Mỗi biến thể có thể ghi đè loại riêng trong tab Biến Thể</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Danh mục</label>
                <select value={form.category_id} onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))} className="input">
                  <option value="">Chọn danh mục</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Badge</label>
                <select value={form.badge_text} onChange={e => setForm(f => ({ ...f, badge_text: e.target.value }))} className="input">
                  <option value="">Không có badge</option>
                  <option value="Hot">🔥 Hot</option>
                  <option value="Mới">✨ Mới</option>
                  <option value="Bán Chạy">🏆 Bán Chạy</option>
                </select>
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={form.featured}
                  onChange={e => setForm(f => ({ ...f, featured: e.target.checked }))}
                  className="w-4 h-4 rounded" style={{ accentColor: '#2563EB' }} />
                <span className="text-sm font-medium text-slate-700">Hiển thị trang chủ</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab 2: Images ── */}
      {activeTab === 'images' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Star size={18} style={{ color: '#D97706' }} />
              <h2 className="font-bold text-slate-900">Ảnh Bìa Sản Phẩm</h2>
            </div>
            {coverImage ? (
              <div className="relative w-48">
                <img src={coverImage.preview || coverImage.image_url} alt="Cover"
                  className="w-48 h-48 object-cover rounded-2xl border-2 border-blue-200" />
                <button onClick={() => setCoverImage(null)}
                  className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 shadow-md">
                  <X size={14} />
                </button>
                <input value={coverImage.alt_text}
                  onChange={e => setCoverImage(prev => prev ? { ...prev, alt_text: e.target.value } : null)}
                  placeholder="Alt text (SEO)" className="input text-xs mt-2" />
              </div>
            ) : (
              <div onClick={() => coverInputRef.current?.click()}
                className="w-48 h-48 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all"
                style={{ borderColor: '#CBD5E1' }}>
                <ImagePlus size={28} className="mb-2 text-slate-400" />
                <p className="text-sm font-semibold text-slate-500">Chọn ảnh bìa</p>
                <p className="text-xs text-slate-400 mt-0.5">PNG, JPG tối đa 5MB</p>
              </div>
            )}
            <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={handleCoverSelect} />
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-bold text-slate-900">Ảnh Phụ Sản Phẩm</h2>
                <p className="text-sm text-slate-400 mt-0.5">Thêm nhiều ảnh để tăng SEO</p>
              </div>
              <button onClick={() => extraInputRef.current?.click()}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all"
                style={{ borderColor: '#2563EB', color: '#2563EB' }}>
                <Plus size={16} /> Thêm ảnh
              </button>
            </div>
            <input ref={extraInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleExtraSelect} />
            {extraImages.length === 0 ? (
              <div onClick={() => extraInputRef.current?.click()}
                className="h-32 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all"
                style={{ borderColor: '#CBD5E1' }}>
                <ImagePlus size={24} className="mb-1.5 text-slate-300" />
                <p className="text-sm text-slate-400">Click để thêm ảnh phụ</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {extraImages.map((img, index) => (
                  <div key={index} className="relative group">
                    <img src={img.preview || img.image_url} alt={img.alt_text}
                      className="w-full aspect-square object-cover rounded-xl border border-slate-200" />
                    <button onClick={() => setExtraImages(prev => prev.filter((_, i) => i !== index))}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md">
                      <X size={12} />
                    </button>
                    <input value={img.alt_text}
                      onChange={e => {
                        const updated = [...extraImages]
                        updated[index] = { ...updated[index], alt_text: e.target.value }
                        setExtraImages(updated)
                      }}
                      placeholder="Alt text" className="input text-xs mt-1.5 py-1" />
                  </div>
                ))}
                <div onClick={() => extraInputRef.current?.click()}
                  className="aspect-square border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 transition-all"
                  style={{ borderColor: '#CBD5E1' }}>
                  <Plus size={20} className="text-slate-300" />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Tab 3: Content ── */}
      {activeTab === 'content' && (
        <div className="space-y-5">
          {[
            { key: 'description_html', label: '📋 Mô Tả Chi Tiết (HTML)', placeholder: '<h2>Tiêu đề</h2><p>Nội dung...</p>', rows: 12 },
            { key: 'usage_guide_html', label: '📖 Hướng Dẫn Sử Dụng (HTML)', placeholder: '<ol><li>Bước 1...</li></ol>', rows: 10 },
            { key: 'warranty_html', label: '🛡️ Chính Sách Bảo Hành (HTML)', placeholder: '<ul><li>Bảo hành đăng nhập lần đầu</li></ul>', rows: 8 },
            { key: 'faq_html', label: '❓ FAQ (HTML)', placeholder: '<p><strong>Q: Câu hỏi?</strong></p>', rows: 8 },
          ].map(({ key, label, placeholder, rows }) => (
            <div key={key} className="bg-white rounded-2xl border border-slate-200 p-6">
              <label className="block text-sm font-bold text-slate-700 mb-3">{label}</label>
              <textarea value={(form as any)[key]}
                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                rows={rows} className="input resize-y font-mono text-xs leading-relaxed"
                placeholder={placeholder} />
              {(form as any)[key] && (
                <details className="mt-3">
                  <summary className="text-xs font-semibold cursor-pointer" style={{ color: '#2563EB' }}>👁️ Preview</summary>
                  <div className="mt-2 p-4 rounded-xl border border-slate-200 product-content text-sm"
                    style={{ background: '#F8FAFC' }}
                    dangerouslySetInnerHTML={{ __html: (form as any)[key] }} />
                </details>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Tab 4: Variants ── */}
      {activeTab === 'variants' && (
        <div className="space-y-5">
          <div className="rounded-2xl p-4 border" style={{ background: '#EFF6FF', borderColor: '#BFDBFE' }}>
            <p className="text-sm font-bold mb-1" style={{ color: '#1E40AF' }}>💡 Mỗi biến thể có thể set loại giao hàng riêng</p>
            <p className="text-xs" style={{ color: '#3B82F6' }}>
              Biến thể <strong>Cấp sẵn</strong> → pool tài khoản riêng.
              Biến thể <strong>Nâng cấp chính chủ</strong> → khách phải nhập email khi mua.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-bold text-slate-900">Biến Thể Sản Phẩm</h2>
                <p className="text-sm text-slate-400 mt-0.5">VD: 1 tháng / 3 tháng / 1 năm</p>
              </div>
              <button onClick={addVariant}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all"
                style={{ borderColor: '#2563EB', color: '#2563EB' }}>
                <Plus size={16} /> Thêm biến thể
              </button>
            </div>

            {variants.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl">
                <p className="text-slate-400 text-sm mb-4">Chưa có biến thể</p>
                <button onClick={addVariant}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
                  style={{ background: '#2563EB' }}>
                  <Plus size={15} /> Thêm biến thể đầu tiên
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {variants.map((variant, index) => (
                  <div key={index} className="border-2 rounded-2xl p-5 relative transition-all"
                    style={{ borderColor: variant.is_default ? '#2563EB' : '#E2E8F0' }}>
                    {variant.is_default && (
                      <span className="absolute -top-3 left-4 text-xs font-bold px-2.5 py-1 rounded-full text-white"
                        style={{ background: '#2563EB' }}>★ Mặc định</span>
                    )}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1.5">Tên biến thể</label>
                        <input value={variant.name} onChange={e => updateVariant(index, 'name', e.target.value)}
                          placeholder="VD: Thời hạn" className="input text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1.5">Giá trị hiển thị</label>
                        <input value={variant.option_value} onChange={e => updateVariant(index, 'option_value', e.target.value)}
                          placeholder="VD: 1 năm, 3 tháng..." className="input text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1.5">Tồn kho</label>
                        <input type="number" value={variant.stock} onChange={e => updateVariant(index, 'stock', e.target.value)}
                          placeholder="0" className="input text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1.5">Giá bán (VND)</label>
                        <input type="number" value={variant.price} onChange={e => updateVariant(index, 'price', e.target.value)}
                          placeholder="Để trống = giá SP" className="input text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1.5">Giá gốc (VND)</label>
                        <input type="number" value={variant.compare_at_price} onChange={e => updateVariant(index, 'compare_at_price', e.target.value)}
                          placeholder="Để trống = giá gốc SP" className="input text-sm" />
                      </div>
                      <div className="flex items-end gap-3 pb-1">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="radio" name="default_variant" checked={variant.is_default}
                            onChange={() => updateVariant(index, 'is_default', true)}
                            style={{ accentColor: '#2563EB' }} />
                          <span className="text-xs font-medium text-slate-600">Mặc định</span>
                        </label>
                        <button onClick={() => removeVariant(index)}
                          className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors ml-auto">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    <div className="mt-4">
                      <label className="block text-xs font-bold text-slate-600 mb-2">Loại giao hàng biến thể này</label>
                      <div className="flex gap-3">
                        {[
                          { value: 'ready_account', label: '📦 Cấp sẵn', desc: 'Tự động giao từ pool' },
                          { value: 'upgrade_owner', label: '📧 Chính chủ', desc: 'Khách nhập email nâng cấp' },
                        ].map(opt => (
                          <label key={opt.value}
                            className="flex items-start gap-2.5 flex-1 p-3 rounded-xl border-2 cursor-pointer transition-all"
                            style={{
                              borderColor: variant.delivery_type === opt.value ? '#2563EB' : '#E2E8F0',
                              background: variant.delivery_type === opt.value ? '#EFF6FF' : '#F8FAFC',
                            }}>
                            <input type="radio"
                              name={'dt_' + index}
                              checked={variant.delivery_type === opt.value}
                              onChange={() => updateVariant(index, 'delivery_type', opt.value)}
                              style={{ accentColor: '#2563EB', marginTop: '2px', flexShrink: 0 }} />
                            <div>
                              <p className="text-xs font-bold text-slate-800">{opt.label}</p>
                              <p className="text-xs text-slate-400 mt-0.5">{opt.desc}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    {variant.delivery_type === 'ready_account' && variant.id && product?.id && (
                      <VariantAccountsManager variantId={variant.id} productId={product.id} />
                    )}
                    {variant.delivery_type === 'ready_account' && !variant.id && (
                      <div className="mt-3 p-3 rounded-xl text-xs font-semibold" style={{ background: '#FFFBEB', color: '#D97706' }}>
                        ⚠️ Lưu sản phẩm trước để thêm tài khoản vào pool biến thể này
                      </div>
                    )}
                    {variant.delivery_type === 'upgrade_owner' && (
                      <div className="mt-3 p-3 rounded-xl text-xs font-semibold" style={{ background: '#EFF6FF', color: '#1D4ED8' }}>
                        📧 Khách chọn biến thể này sẽ thấy ô nhập email chính chủ khi mua hàng
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <button onClick={handleSave} disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-white disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #2563EB, #1d4ed8)' }}>
              {saving
                ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <><Save size={16} /> {isEdit ? 'Lưu Thay Đổi' : 'Thêm Sản Phẩm'}</>}
            </button>
          </div>
        </div>
      )}

      {/* ── Tab 5: Ready Accounts ── */}
      {activeTab === 'accounts' && (
        <div className="space-y-6">
          {!isReadyAccount ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
              <div className="text-4xl mb-3">🔐</div>
              <p className="font-semibold text-slate-700 mb-1">Chỉ áp dụng cho loại "Cấp sẵn"</p>
              <p className="text-sm text-slate-400">Vào tab Thông Tin → đổi Loại Giao Hàng thành "Cấp sẵn" hoặc "Cả hai"</p>
            </div>
          ) : !product?.id ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
              <div className="text-4xl mb-3">💾</div>
              <p className="font-semibold text-slate-700">Lưu sản phẩm trước khi thêm tài khoản</p>
            </div>
          ) : (
            <>
              <div className="rounded-2xl p-4 border" style={{ background: '#FFFBEB', borderColor: '#FDE68A' }}>
                <p className="text-sm font-bold mb-1" style={{ color: '#D97706' }}>💡 Tab này là pool chung (không theo biến thể)</p>
                <p className="text-xs" style={{ color: '#D97706' }}>
                  Nếu sản phẩm có biến thể, hãy thêm tài khoản trong từng biến thể ở tab <strong>Biến Thể</strong>.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl border border-slate-200 p-5 text-center">
                  <p className="text-3xl font-black text-slate-900">{accounts.length}</p>
                  <p className="text-xs font-semibold text-slate-500 mt-1">Tổng</p>
                </div>
                <div className="rounded-2xl p-5 text-center" style={{ background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
                  <p className="text-3xl font-black" style={{ color: '#16A34A' }}>{availableCount}</p>
                  <p className="text-xs font-semibold mt-1" style={{ color: '#16A34A' }}>✅ Còn trống</p>
                </div>
                <div className="rounded-2xl p-5 text-center" style={{ background: '#FFFBEB', border: '1px solid #FDE68A' }}>
                  <p className="text-3xl font-black" style={{ color: '#D97706' }}>{assignedCount}</p>
                  <p className="text-xs font-semibold mt-1" style={{ color: '#D97706' }}>📦 Đã giao</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <h2 className="font-bold text-slate-900 mb-1">Thêm Tài Khoản Hàng Loạt</h2>
                <p className="text-xs text-slate-400 mb-4">
                  Mỗi dòng 1 tài khoản · Format:{' '}
                  <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono">email|mật_khẩu|thông_tin_thêm</code>
                </p>
                <textarea value={bulkText} onChange={e => setBulkText(e.target.value)} rows={6}
                  className="input font-mono text-sm resize-none"
                  placeholder={'brake1@gmail.com|matkhau123|acc clean\nbrake2@gmail.com|matkhau456|team US'} />
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-slate-400">
                    {bulkText.trim()
                      ? bulkText.trim().split('\n').filter(l => l.trim() && l.includes('|')).length + ' dòng hợp lệ'
                      : 'Chưa có dữ liệu'}
                  </p>
                  <button onClick={handleSaveAccounts} disabled={accSaving || !bulkText.trim()}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
                    style={{ background: 'linear-gradient(135deg, #16A34A, #059669)' }}>
                    {accSaving ? (
                      <span className="flex items-center gap-2">
                        <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Đang lưu...
                      </span>
                    ) : '💾 Lưu Danh Sách'}
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                  <h2 className="font-bold text-slate-900">Danh Sách ({accounts.length})</h2>
                  <button onClick={loadAccounts}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                    style={{ color: '#2563EB' }}>
                    🔄 Refresh
                  </button>
                </div>
                {accLoading ? (
                  <div className="flex justify-center py-10">
                    <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : accounts.length === 0 ? (
                  <div className="text-center py-12 text-slate-400">Chưa có tài khoản nào</div>
                ) : (
                  <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
                    {accounts.map((acc, i) => (
                      <div key={acc.id ?? i}
                        className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 transition-colors"
                        style={{ background: acc.status === 'assigned' ? '#FFFBEB' : 'white' }}>
                        <span className={'flex-shrink-0 text-xs font-bold px-2.5 py-1 rounded-full ' +
                          (acc.status === 'available' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700')}>
                          {acc.status === 'available' ? '✅ Trống' : '📦 Đã giao'}
                        </span>
                        <div className="flex-1 grid grid-cols-3 gap-3 min-w-0">
                          <div className="min-w-0">
                            <p className="text-xs text-slate-400 mb-0.5">Email</p>
                            <p className="text-sm font-mono font-semibold text-slate-800 truncate">{acc.email}</p>
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs text-slate-400 mb-0.5">Mật khẩu</p>
                            <div className="flex items-center gap-1">
                              <p className="text-sm font-mono font-semibold text-slate-800 truncate">
                                {showAccPass[i] ? acc.password : '••••••••'}
                              </p>
                              <button onClick={() => setShowAccPass(p => ({ ...p, [i]: !p[i] }))}
                                className="flex-shrink-0 text-slate-400 hover:text-slate-600">
                                {showAccPass[i] ? <EyeOff size={12} /> : <Eye size={12} />}
                              </button>
                            </div>
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs text-slate-400 mb-0.5">Thông tin thêm</p>
                            <p className="text-sm text-slate-600 truncate">{acc.extra_info || '—'}</p>
                          </div>
                        </div>
                        {acc.status === 'assigned' && acc.orders && (
                          <div className="flex-shrink-0 text-right">
                            <p className="text-xs text-slate-400">Đơn</p>
                            <p className="text-xs font-bold text-amber-700">#{acc.orders.order_code}</p>
                          </div>
                        )}
                        {acc.status === 'available' && acc.id && (
                          <button onClick={() => handleDeleteAccount(acc.id!)}
                            className="flex-shrink-0 p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors">
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Tab 6: Đánh Giá & Hỏi Đáp ── */}
      {activeTab === 'reviews' && (
        <div className="space-y-5">
          {!product?.id ? (
            <div className="text-center py-16 text-slate-400">
              <div className="text-4xl mb-3">⭐</div>
              <p>Lưu sản phẩm trước khi thêm đánh giá</p>
            </div>
          ) : (
            <>
              {/* Form thêm đánh giá */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <h2 className="font-bold text-slate-900 mb-4">⭐ Thêm Đánh Giá</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Tên người đánh giá</label>
                      <input value={newReview.reviewer_name}
                        onChange={e => setNewReview(r => ({ ...r, reviewer_name: e.target.value }))}
                        placeholder="Nguyễn Văn A" className="input text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Số sao</label>
                      <select value={newReview.rating}
                        onChange={e => setNewReview(r => ({ ...r, rating: parseInt(e.target.value) }))}
                        className="input text-sm">
                        {[5,4,3,2,1].map(s => (
                          <option key={s} value={s}>{'⭐'.repeat(s)} {s} sao</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Nội dung</label>
                    <textarea value={newReview.content}
                      onChange={e => setNewReview(r => ({ ...r, content: e.target.value }))}
                      rows={3} className="input resize-none text-sm"
                      placeholder="Sản phẩm rất tốt, giao hàng nhanh..." />
                  </div>
                  <div className="p-3 rounded-xl text-xs font-semibold flex items-center gap-2"
                    style={{ background: '#DCFCE7', color: '#166534' }}>
                    ✅ Đánh giá admin tạo sẽ tự động có tick "Đã mua sản phẩm"
                  </div>
                  <button onClick={handleAddReview} disabled={savingReview}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-60"
                    style={{ background: '#2563EB' }}>
                    {savingReview
                      ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      : '➕'} Thêm Đánh Giá
                  </button>
                </div>
              </div>

              {/* Form thêm hỏi đáp ảo */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <h2 className="font-bold text-slate-900 mb-1">💬 Thêm Hỏi & Đáp</h2>
                <p className="text-xs text-slate-400 mb-4">Tạo câu hỏi + trả lời ảo hiển thị trong phần Hỏi Đáp ngoài trang sản phẩm</p>
                <FakeQaForm productId={product.id} onDone={loadReviews} />
              </div>

              {/* Danh sách Đánh Giá — threaded */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                  <h2 className="font-bold text-slate-900">
                    Đánh Giá ({reviewEntries.length}) · Hỏi Đáp ({qaRoots.length} câu hỏi)
                  </h2>
                  <button onClick={loadReviews}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                    style={{ color: '#2563EB' }}>
                    🔄 Refresh
                  </button>
                </div>

                {reviews.length === 0 ? (
                  <div className="text-center py-10 text-slate-400">Chưa có đánh giá hoặc hỏi đáp nào</div>
                ) : (
                  <div className="divide-y divide-slate-100">

                    {/* Đánh giá */}
                    {reviewEntries.length > 0 && (
                      <div>
                        <div className="px-6 py-2 text-xs font-bold uppercase tracking-wider"
                          style={{ background: '#F8FAFC', color: '#2563EB' }}>
                          ⭐ Đánh Giá ({reviewEntries.length})
                        </div>
                        {reviewEntries.map(review => (
                          <div key={review.id} className="p-4 flex items-start gap-3 hover:bg-slate-50 border-t border-slate-100">
                            <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                              style={{ background: 'linear-gradient(135deg, #2563EB, #0891B2)' }}>
                              {review.reviewer_name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <p className="font-semibold text-sm text-slate-900">{review.reviewer_name}</p>
                                {review.is_verified_purchase && (
                                  <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                                    style={{ background: '#DCFCE7', color: '#16A34A' }}>✅ Đã mua</span>
                                )}
                                {review.rating && <span className="text-xs">{'⭐'.repeat(review.rating)}</span>}
                              </div>
                              <p className="text-sm text-slate-600">{review.content}</p>
                              <p className="text-xs text-slate-400 mt-1">{new Date(review.created_at).toLocaleDateString('vi-VN')}</p>
                            </div>
                            <button onClick={() => handleDeleteReview(review.id)}
                              className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition-colors flex-shrink-0">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Hỏi Đáp — threaded */}
                    {qaRoots.length > 0 && (
                      <div>
                        <div className="px-6 py-2 text-xs font-bold uppercase tracking-wider"
                          style={{ background: '#F8FAFC', color: '#7C3AED' }}>
                          💬 Hỏi & Đáp ({qaRoots.length} câu hỏi)
                        </div>
                        {qaRoots.map(qa => (
                          <div key={qa.id} className="border-t border-slate-100">
                            {/* Câu hỏi */}
                            <div className="p-4 flex items-start gap-3 hover:bg-slate-50">
                              <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                                style={{ background: 'linear-gradient(135deg, #7C3AED, #A855F7)' }}>
                                {qa.reviewer_name.charAt(0).toUpperCase()}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                  <p className="font-semibold text-sm text-slate-900">{qa.reviewer_name}</p>
                                  <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                                    style={{ background: '#F5F3FF', color: '#7C3AED' }}>❓ Hỏi</span>
                                </div>
                                <p className="text-sm text-slate-600">{qa.content}</p>
                                <p className="text-xs text-slate-400 mt-1">{new Date(qa.created_at).toLocaleDateString('vi-VN')}</p>
                              </div>
                              <button onClick={() => handleDeleteReview(qa.id)}
                                className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition-colors flex-shrink-0">
                                <Trash2 size={14} />
                              </button>
                            </div>

                            {/* Replies của câu hỏi này */}
                            {(qaRepliesByParent[qa.id] ?? []).map(reply => (
                              <div key={reply.id} className="pl-14 pr-4 py-3 flex items-start gap-3 hover:bg-slate-50"
                                style={{ background: '#F8FAFC', borderTop: '1px solid #F1F5F9' }}>
                                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                                  style={{ background: 'linear-gradient(135deg, #2563EB, #0891B2)' }}>
                                  {reply.reviewer_name.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 flex-wrap mb-1">
                                    <p className="font-semibold text-xs text-slate-900">{reply.reviewer_name}</p>
                                    <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold"
                                      style={{ background: '#EFF6FF', color: '#2563EB' }}>↩️ Trả lời</span>
                                  </div>
                                  <p className="text-sm text-slate-600">{reply.content}</p>
                                </div>
                                <button onClick={() => handleDeleteReview(reply.id)}
                                  className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition-colors flex-shrink-0">
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}