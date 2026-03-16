'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Plus, Edit, Trash2, Save, X, GripVertical } from 'lucide-react'

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  color: string | null
  is_active: boolean
  sort_order: number
}

const emptyForm = {
  name: '', slug: '', description: '', icon: '', color: '#2563EB', is_active: true, sort_order: 0
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  async function load() {
    const supabase = createClient()
    const { data } = await supabase.from('categories').select('*').order('sort_order')
    setCategories(data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const openNew = () => {
    setEditId(null)
    setForm({ ...emptyForm, sort_order: categories.length })
    setShowForm(true)
  }

  const openEdit = (cat: Category) => {
    setEditId(cat.id)
    setForm({
      name: cat.name,
      slug: cat.slug,
      description: cat.description ?? '',
      icon: cat.icon ?? '',
      color: cat.color ?? '#2563EB',
      is_active: cat.is_active,
      sort_order: cat.sort_order,
    })
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!form.name || !form.slug) { toast.error('Vui lòng điền tên và slug'); return }
    setSaving(true)
    const supabase = createClient()
    try {
      if (editId) {
        await supabase.from('categories').update(form).eq('id', editId)
        toast.success('Đã cập nhật danh mục!')
      } else {
        await supabase.from('categories').insert(form)
        toast.success('Đã thêm danh mục!')
      }
      setShowForm(false)
      setEditId(null)
      setForm(emptyForm)
      await load()
    } catch (err: any) {
      toast.error('Lỗi', { description: err.message })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Xóa danh mục "${name}"?`)) return
    const supabase = createClient()
    await supabase.from('categories').delete().eq('id', id)
    toast.success('Đã xóa danh mục')
    await load()
  }

  const handleToggle = async (id: string, current: boolean) => {
    const supabase = createClient()
    await supabase.from('categories').update({ is_active: !current }).eq('id', id)
    await load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="text-2xl font-black text-slate-900" style={{ fontFamily: 'Sora, sans-serif' }}>
            Quản Lý Danh Mục
          </h1>
          <p className="text-slate-500 text-sm mt-1">{categories.length} danh mục</p>
        </div>
        <button onClick={openNew}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white"
          style={{ background: 'linear-gradient(135deg, #2563EB, #1d4ed8)' }}>
          <Plus size={18} /> Thêm Danh Mục
        </button>
      </div>

      {/* Form modal */}
      {showForm && (
        <>
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            onClick={() => setShowForm(false)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl p-7">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-black text-slate-900" style={{ fontFamily: 'Sora, sans-serif' }}>
                  {editId ? 'Sửa Danh Mục' : 'Thêm Danh Mục'}
                </h2>
                <button onClick={() => setShowForm(false)}
                  className="p-2 rounded-xl hover:bg-slate-100 transition-colors">
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                      Tên danh mục *
                    </label>
                    <input value={form.name}
                      onChange={e => {
                        const name = e.target.value
                        setForm(f => ({
                          ...f, name,
                          slug: editId ? f.slug : name.toLowerCase()
                            .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
                            .replace(/[đĐ]/g, 'd').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
                        }))
                      }}
                      placeholder="AI Chatbot" className="input" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                      Slug *
                    </label>
                    <input value={form.slug}
                      onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
                      placeholder="ai-chatbot" className="input font-mono text-sm" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    Mô tả
                  </label>
                  <input value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="Mô tả ngắn về danh mục" className="input" />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                      Icon (emoji)
                    </label>
                    <input value={form.icon}
                      onChange={e => setForm(f => ({ ...f, icon: e.target.value }))}
                      placeholder="🤖" className="input text-center text-xl" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                      Màu sắc
                    </label>
                    <div className="flex gap-2">
                      <input type="color" value={form.color}
                        onChange={e => setForm(f => ({ ...f, color: e.target.value }))}
                        className="w-12 h-11 rounded-xl border border-slate-200 cursor-pointer p-1" />
                      <input value={form.color}
                        onChange={e => setForm(f => ({ ...f, color: e.target.value }))}
                        className="input font-mono text-xs flex-1" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                      Thứ tự
                    </label>
                    <input type="number" value={form.sort_order}
                      onChange={e => setForm(f => ({ ...f, sort_order: parseInt(e.target.value) || 0 }))}
                      className="input" />
                  </div>
                </div>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={form.is_active}
                    onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))}
                    className="w-4 h-4 rounded" style={{ accentColor: '#2563EB' }} />
                  <span className="text-sm font-medium text-slate-700">Hiển thị danh mục</span>
                </label>
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowForm(false)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all">
                  Hủy
                </button>
                <button onClick={handleSave} disabled={saving}
                  className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-60"
                  style={{ background: 'linear-gradient(135deg, #2563EB, #1d4ed8)' }}>
                  {saving ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : <><Save size={15} /> {editId ? 'Lưu Thay Đổi' : 'Thêm Danh Mục'}</>}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Categories table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: '#F8FAFC' }}>
                {['', 'Danh Mục', 'Slug', 'Icon', 'Thứ Tự', 'Trạng Thái', ''].map(h => (
                  <th key={h} className="text-left px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {categories.map(cat => (
                <tr key={cat.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-4 text-slate-300">
                    <GripVertical size={16} />
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      {cat.color && (
                        <div className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ background: cat.color }} />
                      )}
                      <p className="font-semibold text-slate-900">{cat.name}</p>
                    </div>
                    {cat.description && (
                      <p className="text-xs text-slate-400 mt-0.5 ml-6">{cat.description}</p>
                    )}
                  </td>
                  <td className="px-5 py-4 font-mono text-xs text-slate-500">{cat.slug}</td>
                  <td className="px-5 py-4 text-2xl">{cat.icon || '—'}</td>
                  <td className="px-5 py-4 text-slate-600">{cat.sort_order}</td>
                  <td className="px-5 py-4">
                    <button onClick={() => handleToggle(cat.id, cat.is_active)}
                      className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold transition-all"
                      style={{
                        background: cat.is_active ? '#DCFCE7' : '#F1F5F9',
                        color: cat.is_active ? '#166534' : '#475569',
                      }}>
                      {cat.is_active ? '● Active' : '● Ẩn'}
                    </button>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(cat)}
                        className="p-2 rounded-xl hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors">
                        <Edit size={15} />
                      </button>
                      <button onClick={() => handleDelete(cat.id, cat.name)}
                        className="p-2 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {categories.length === 0 && !loading && (
            <div className="text-center py-16">
              <div className="text-4xl mb-3">📂</div>
              <p className="text-slate-400 mb-4">Chưa có danh mục nào</p>
              <button onClick={openNew}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
                style={{ background: '#2563EB' }}>
                <Plus size={16} /> Thêm danh mục đầu tiên
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}