'use client'
import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Plus, Trash2, ArrowLeft, Save, Upload, X, ImagePlus, Star } from 'lucide-react'
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

interface Props {
  categories: Category[]
  product?: any
}

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

  // Cover image
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

  // Extra images
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
    })) ?? []
  )

  const [saving, setSaving] = useState(false)
  const [uploadingCover, setUploadingCover] = useState(false)
  const [uploadingExtra, setUploadingExtra] = useState(false)
  const [activeTab, setActiveTab] = useState<'basic' | 'images' | 'content' | 'variants'>('basic')

  const handleNameChange = (name: string) => {
    setForm(f => ({
      ...f,
      name,
      slug: isEdit ? f.slug : slugify(name),
    }))
  }

  // Upload single file to Supabase Storage
  const uploadFile = async (file: File, path: string): Promise<string> => {
    const supabase = createClient()
    const { data, error } = await supabase.storage
      .from('products')
      .upload(path, file, { upsert: true })
    if (error) throw error
    const { data: { publicUrl } } = supabase.storage.from('products').getPublicUrl(path)
    return publicUrl
  }

  // Handle cover image select
  const handleCoverSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { toast.error('Ảnh tối đa 5MB'); return }

    const preview = URL.createObjectURL(file)
    setCoverImage({ image_url: preview, alt_text: form.name, sort_order: 0, is_cover: true, file, preview })
    toast.success('Đã chọn ảnh bìa!')
  }

  // Handle extra images select
  const handleExtraSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (files.length === 0) return

    const newImages: ProductImage[] = files.map((file, i) => ({
      image_url: URL.createObjectURL(file),
      alt_text: form.name,
      sort_order: extraImages.length + i + 1,
      file,
      preview: URL.createObjectURL(file),
    }))

    setExtraImages(prev => [...prev, ...newImages])
    toast.success(`Đã thêm ${files.length} ảnh!`)
  }

  const removeCover = () => setCoverImage(null)

  const removeExtra = (index: number) => {
    setExtraImages(prev => prev.filter((_, i) => i !== index))
  }

  const addVariant = () => {
    setVariants(prev => [...prev, {
      name: 'Thời hạn',
      option_value: '',
      price: '',
      compare_at_price: '',
      stock: '0',
      is_default: prev.length === 0,
    }])
  }

  const removeVariant = (index: number) => {
    setVariants(prev => prev.filter((_, i) => i !== index))
  }

  const updateVariant = (index: number, field: keyof Variant, value: any) => {
    if (field === 'is_default') {
      setVariants(prev => prev.map((v, i) => ({ ...v, is_default: i === index })))
    } else {
      setVariants(prev => prev.map((v, i) => i === index ? { ...v, [field]: value } : v))
    }
  }

  const handleSave = async () => {
    if (!form.name || !form.price) {
      toast.error('Vui lòng điền tên và giá sản phẩm')
      return
    }
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

      // Upload & save cover image
      if (coverImage) {
        let imageUrl = coverImage.image_url
        if (coverImage.file) {
          const ext = coverImage.file.name.split('.').pop()
          imageUrl = await uploadFile(coverImage.file, `${productId}/cover.${ext}`)
        }
        if (coverImage.id) {
          await supabase.from('product_images').update({
            image_url: imageUrl,
            alt_text: form.name,
            sort_order: 0,
          }).eq('id', coverImage.id)
        } else {
          await supabase.from('product_images').insert({
            product_id: productId,
            image_url: imageUrl,
            alt_text: form.name,
            sort_order: 0,
          })
        }
      }

      // Upload & save extra images
      for (let i = 0; i < extraImages.length; i++) {
        const img = extraImages[i]
        let imageUrl = img.image_url
        if (img.file) {
          const ext = img.file.name.split('.').pop()
          imageUrl = await uploadFile(img.file, `${productId}/extra-${i + 1}-${Date.now()}.${ext}`)
        }
        if (img.id) {
          await supabase.from('product_images').update({
            image_url: imageUrl,
            alt_text: img.alt_text || form.name,
            sort_order: i + 1,
          }).eq('id', img.id)
        } else {
          await supabase.from('product_images').insert({
            product_id: productId,
            image_url: imageUrl,
            alt_text: img.alt_text || form.name,
            sort_order: i + 1,
          })
        }
      }

      // Handle variants
      if (variants.length > 0) {
        if (isEdit) {
          const keepIds = variants.filter(v => v.id).map(v => v.id!)
          if (keepIds.length > 0) {
            await supabase.from('product_variants')
              .delete().eq('product_id', productId)
              .not('id', 'in', `(${keepIds.join(',')})`)
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

  const TABS = [
    { id: 'basic', label: '📋 Thông Tin' },
    { id: 'images', label: `🖼️ Hình Ảnh (${(coverImage ? 1 : 0) + extraImages.length})` },
    { id: 'content', label: '📝 Nội Dung' },
    { id: 'variants', label: `🔧 Biến Thể (${variants.length})` },
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
          <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
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
                <select value={form.status}
                  onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                  className="input">
                  <option value="active">✅ Active — Hiển thị</option>
                  <option value="draft">🔒 Draft — Ẩn</option>
                  <option value="out_of_stock">❌ Hết hàng</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Loại giao hàng</label>
                <select value={form.delivery_type}
                  onChange={e => setForm(f => ({ ...f, delivery_type: e.target.value }))}
                  className="input">
                  <option value="ready_account">📦 Cấp sẵn</option>
                  <option value="upgrade_owner">📧 Nâng cấp chính chủ</option>
                  <option value="both">🔀 Cả 2 lựa chọn</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Danh mục</label>
                <select value={form.category_id}
                  onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))}
                  className="input">
                  <option value="">Chọn danh mục</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Badge</label>
                <select value={form.badge_text}
                  onChange={e => setForm(f => ({ ...f, badge_text: e.target.value }))}
                  className="input">
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

          {/* Cover image */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Star size={18} style={{ color: '#D97706' }} />
              <h2 className="font-bold text-slate-900">Ảnh Bìa Sản Phẩm</h2>
              <span className="text-xs text-slate-400">(Hiển thị chính, quan trọng nhất)</span>
            </div>

            {coverImage ? (
              <div className="relative w-48">
                <img
                  src={coverImage.preview || coverImage.image_url}
                  alt="Cover"
                  className="w-48 h-48 object-cover rounded-2xl border-2 border-blue-200"
                />
                <button onClick={removeCover}
                  className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 shadow-md transition-colors">
                  <X size={14} />
                </button>
                <div className="mt-2">
                  <input
                    value={coverImage.alt_text}
                    onChange={e => setCoverImage(prev => prev ? { ...prev, alt_text: e.target.value } : null)}
                    placeholder="Alt text (SEO)"
                    className="input text-xs"
                  />
                </div>
              </div>
            ) : (
              <div
                onClick={() => coverInputRef.current?.click()}
                className="w-48 h-48 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all"
                style={{ borderColor: '#CBD5E1' }}>
                <ImagePlus size={28} className="mb-2 text-slate-400" />
                <p className="text-sm font-semibold text-slate-500">Chọn ảnh bìa</p>
                <p className="text-xs text-slate-400 mt-0.5">PNG, JPG tối đa 5MB</p>
              </div>
            )}

            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleCoverSelect}
            />

            {!coverImage && (
              <button
                onClick={() => coverInputRef.current?.click()}
                className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all"
                style={{ borderColor: '#2563EB', color: '#2563EB' }}>
                <Upload size={16} /> Tải ảnh bìa lên
              </button>
            )}
          </div>

          {/* Extra images */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-bold text-slate-900">Ảnh Phụ Sản Phẩm</h2>
                <p className="text-sm text-slate-400 mt-0.5">Thêm nhiều ảnh để tăng SEO và trải nghiệm khách hàng</p>
              </div>
              <button
                onClick={() => extraInputRef.current?.click()}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all"
                style={{ borderColor: '#2563EB', color: '#2563EB' }}>
                <Plus size={16} /> Thêm ảnh
              </button>
            </div>

            <input
              ref={extraInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleExtraSelect}
            />

            {extraImages.length === 0 ? (
              <div
                onClick={() => extraInputRef.current?.click()}
                className="h-32 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all"
                style={{ borderColor: '#CBD5E1' }}>
                <ImagePlus size={24} className="mb-1.5 text-slate-300" />
                <p className="text-sm text-slate-400">Click để thêm ảnh phụ</p>
                <p className="text-xs text-slate-300">Chọn nhiều ảnh cùng lúc</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {extraImages.map((img, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={img.preview || img.image_url}
                      alt={img.alt_text}
                      className="w-full aspect-square object-cover rounded-xl border border-slate-200"
                    />
                    <button
                      onClick={() => removeExtra(index)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md">
                      <X size={12} />
                    </button>
                    <input
                      value={img.alt_text}
                      onChange={e => {
                        const updated = [...extraImages]
                        updated[index] = { ...updated[index], alt_text: e.target.value }
                        setExtraImages(updated)
                      }}
                      placeholder="Alt text"
                      className="input text-xs mt-1.5 py-1"
                    />
                  </div>
                ))}

                {/* Add more button */}
                <div
                  onClick={() => extraInputRef.current?.click()}
                  className="aspect-square border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all"
                  style={{ borderColor: '#CBD5E1' }}>
                  <Plus size={20} className="text-slate-300" />
                  <p className="text-xs text-slate-300 mt-1">Thêm</p>
                </div>
              </div>
            )}
          </div>

          {/* SEO tip */}
          <div className="rounded-2xl p-4 border" style={{ background: '#EFF6FF', borderColor: '#BFDBFE' }}>
            <p className="text-sm font-bold mb-1" style={{ color: '#1E40AF' }}>💡 Mẹo SEO cho hình ảnh</p>
            <ul className="text-xs space-y-1" style={{ color: '#3B82F6' }}>
              <li>• Điền alt text mô tả rõ nội dung ảnh để Google index tốt hơn</li>
              <li>• Dùng ảnh có kích thước 1:1 hoặc 16:9, tối thiểu 800x800px</li>
              <li>• Tên file ảnh nên có từ khóa (VD: chatgpt-plus-business.jpg)</li>
              <li>• Thêm 3-5 ảnh phụ giúp tăng thời gian ở lại trang</li>
            </ul>
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
            { key: 'faq_html', label: '❓ FAQ (HTML)', placeholder: '<p><strong>Q: Câu hỏi?</strong><br/>A: Trả lời</p>', rows: 8 },
          ].map(({ key, label, placeholder, rows }) => (
            <div key={key} className="bg-white rounded-2xl border border-slate-200 p-6">
              <label className="block text-sm font-bold text-slate-700 mb-3">{label}</label>
              <textarea
                value={(form as any)[key]}
                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                rows={rows}
                className="input resize-y font-mono text-xs leading-relaxed"
                placeholder={placeholder}
              />
              {(form as any)[key] && (
                <details className="mt-3">
                  <summary className="text-xs font-semibold cursor-pointer" style={{ color: '#2563EB' }}>
                    👁️ Preview
                  </summary>
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
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-bold text-slate-900">Biến Thể Sản Phẩm</h2>
                <p className="text-sm text-slate-400 mt-0.5">
                  VD: 1 tháng / 3 tháng / 1 năm — Cấp sẵn / Chính chủ
                </p>
              </div>
              <button onClick={addVariant}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all"
                style={{ borderColor: '#2563EB', color: '#2563EB' }}>
                <Plus size={16} /> Thêm biến thể
              </button>
            </div>

            {variants.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl">
                <p className="text-slate-400 text-sm mb-1">Chưa có biến thể</p>
                <p className="text-xs text-slate-300 mb-4">Không cần biến thể nếu sản phẩm chỉ có 1 lựa chọn</p>
                <button onClick={addVariant}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
                  style={{ background: '#2563EB' }}>
                  <Plus size={15} /> Thêm biến thể đầu tiên
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {variants.map((variant, index) => (
                  <div key={index}
                    className="border-2 rounded-2xl p-5 relative transition-all"
                    style={{ borderColor: variant.is_default ? '#2563EB' : '#E2E8F0' }}>
                    {variant.is_default && (
                      <span className="absolute -top-3 left-4 text-xs font-bold px-2.5 py-1 rounded-full text-white"
                        style={{ background: '#2563EB' }}>
                        ★ Mặc định
                      </span>
                    )}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1.5">Tên biến thể</label>
                        <input value={variant.name}
                          onChange={e => updateVariant(index, 'name', e.target.value)}
                          placeholder="VD: Thời hạn" className="input text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1.5">Giá trị hiển thị</label>
                        <input value={variant.option_value}
                          onChange={e => updateVariant(index, 'option_value', e.target.value)}
                          placeholder="VD: 1 năm, 3 tháng..." className="input text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1.5">Tồn kho</label>
                        <input type="number" value={variant.stock}
                          onChange={e => updateVariant(index, 'stock', e.target.value)}
                          placeholder="0" className="input text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1.5">Giá bán (VND)</label>
                        <input type="number" value={variant.price}
                          onChange={e => updateVariant(index, 'price', e.target.value)}
                          placeholder="Để trống = giá SP" className="input text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1.5">Giá gốc (VND)</label>
                        <input type="number" value={variant.compare_at_price}
                          onChange={e => updateVariant(index, 'compare_at_price', e.target.value)}
                          placeholder="Để trống = giá gốc SP" className="input text-sm" />
                      </div>
                      <div className="flex items-end gap-3 pb-1">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="radio" name="default_variant"
                            checked={variant.is_default}
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
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <button onClick={handleSave} disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-white disabled:opacity-60"
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
      )}
    </div>
  )
}