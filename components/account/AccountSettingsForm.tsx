'use client'
import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Camera, Save, Lock, Eye, EyeOff, User, Phone } from 'lucide-react'

interface Props {
  profile: any
  userEmail: string
}

export function AccountSettingsForm({ profile, userEmail }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile')
  const [saving, setSaving] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(profile?.avatar_url ?? null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)

  const [profileForm, setProfileForm] = useState({
    first_name: profile?.first_name ?? '',
    last_name: profile?.last_name ?? '',
    full_name: profile?.full_name ?? '',
    phone: profile?.phone ?? '',
  })

  const [passForm, setPassForm] = useState({
    current: '',
    newPass: '',
    confirm: '',
  })
  const [showPass, setShowPass] = useState({ current: false, new: false, confirm: false })
  const [savingPass, setSavingPass] = useState(false)

  const passRules = [
    { label: 'Ít nhất 8 ký tự', ok: passForm.newPass.length >= 8 },
    { label: 'Có chữ hoa', ok: /[A-Z]/.test(passForm.newPass) },
    { label: 'Có chữ số', ok: /[0-9]/.test(passForm.newPass) },
    { label: 'Mật khẩu mới khớp', ok: passForm.newPass === passForm.confirm && passForm.confirm.length > 0 },
  ]

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) { toast.error('Ảnh tối đa 2MB'); return }
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  const handleSaveProfile = async () => {
    setSaving(true)
    const supabase = createClient()
    try {
      let avatarUrl = profile?.avatar_url ?? null

      if (avatarFile) {
        const ext = avatarFile.name.split('.').pop()
        const path = `avatars/${profile?.id ?? Date.now()}.${ext}`
        const { error: uploadErr } = await supabase.storage
          .from('products').upload(path, avatarFile, { upsert: true })
        if (uploadErr) throw uploadErr
        const { data: { publicUrl } } = supabase.storage.from('products').getPublicUrl(path)
        avatarUrl = publicUrl
      }

      const fullName = `${profileForm.first_name} ${profileForm.last_name}`.trim() || profileForm.full_name

      const { error } = await supabase.from('profiles').update({
        first_name: profileForm.first_name || null,
        last_name: profileForm.last_name || null,
        full_name: fullName || null,
        phone: profileForm.phone || null,
        avatar_url: avatarUrl,
      }).eq('id', profile?.id)

      if (error) throw error
      toast.success('✅ Đã cập nhật thông tin!')
    } catch (err: any) {
      toast.error('Lỗi', { description: err.message })
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async () => {
    if (!passRules.every(r => r.ok)) { toast.error('Mật khẩu chưa đủ điều kiện'); return }
    setSavingPass(true)
    const supabase = createClient()
    try {
      const { error } = await supabase.auth.updateUser({ password: passForm.newPass })
      if (error) throw error
      toast.success('✅ Đã đổi mật khẩu thành công!')
      setPassForm({ current: '', newPass: '', confirm: '' })
    } catch (err: any) {
      toast.error('Lỗi đổi mật khẩu', { description: err.message })
    } finally {
      setSavingPass(false)
    }
  }

  const TABS = [
    { id: 'profile', label: '👤 Thông Tin Cá Nhân', icon: <User size={15} /> },
    { id: 'security', label: '🔒 Bảo Mật', icon: <Lock size={15} /> },
  ]

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-slate-200 pb-0">
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
            className="flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-all -mb-px"
            style={{
              borderColor: activeTab === tab.id ? '#2563EB' : 'transparent',
              color: activeTab === tab.id ? '#1D4ED8' : '#64748B',
            }}>
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Tab: Profile */}
      {activeTab === 'profile' && (
        <div className="space-y-5">
          {/* Avatar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="font-bold text-slate-900 mb-5">Ảnh Đại Diện</h2>
            <div className="flex items-center gap-5">
              <div className="relative flex-shrink-0">
                <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-slate-200"
                  style={{ background: 'linear-gradient(135deg, #2563EB, #0891B2)' }}>
                  {avatarPreview
                    ? <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-white text-2xl font-black">
                        {(profileForm.first_name || userEmail).charAt(0).toUpperCase()}
                      </div>
                  }
                </div>
                <button onClick={() => fileRef.current?.click()}
                  className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full flex items-center justify-center text-white shadow-md transition-all hover:scale-110"
                  style={{ background: '#2563EB' }}>
                  <Camera size={13} />
                </button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarSelect} />
              </div>
              <div>
                <p className="font-semibold text-slate-900 text-sm">Tải ảnh đại diện mới</p>
                <p className="text-xs text-slate-400 mt-1">JPG, PNG tối đa 2MB</p>
                <button onClick={() => fileRef.current?.click()}
                  className="mt-2 text-xs font-semibold px-3 py-1.5 rounded-lg border-2 transition-all"
                  style={{ borderColor: '#2563EB', color: '#2563EB' }}>
                  Chọn ảnh
                </button>
              </div>
            </div>
          </div>

          {/* Personal info */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
            <h2 className="font-bold text-slate-900">Thông Tin Cá Nhân</h2>

            {/* Email - readonly */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email</label>
              <input value={userEmail} disabled
                className="input bg-slate-50 text-slate-400 cursor-not-allowed" />
              <p className="text-xs text-slate-400 mt-1">Email không thể thay đổi</p>
            </div>

            {/* Name */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Họ</label>
                <input value={profileForm.last_name}
                  onChange={e => setProfileForm(f => ({ ...f, last_name: e.target.value }))}
                  placeholder="Nguyễn" className="input" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Tên</label>
                <input value={profileForm.first_name}
                  onChange={e => setProfileForm(f => ({ ...f, first_name: e.target.value }))}
                  placeholder="Văn A" className="input" />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Phone size={14} /> Số Điện Thoại / Zalo
                </span>
              </label>
              <input value={profileForm.phone}
                onChange={e => setProfileForm(f => ({ ...f, phone: e.target.value }))}
                placeholder="0888 999 111" className="input" type="tel" />
              <p className="text-xs text-slate-400 mt-1">Dùng để liên hệ hỗ trợ và nhận thông báo đơn hàng</p>
            </div>

            <button onClick={handleSaveProfile} disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-white disabled:opacity-60 transition-all"
              style={{ background: 'linear-gradient(135deg, #2563EB, #1d4ed8)' }}>
              {saving ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Đang lưu...
                </span>
              ) : <><Save size={15} /> Lưu Thông Tin</>}
            </button>
          </div>
        </div>
      )}

      {/* Tab: Security */}
      {activeTab === 'security' && (
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
            <div>
              <h2 className="font-bold text-slate-900">Đổi Mật Khẩu</h2>
              <p className="text-xs text-slate-400 mt-0.5">Mật khẩu mới phải đủ mạnh để bảo vệ tài khoản</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Mật khẩu mới</label>
              <div className="relative">
                <input type={showPass.new ? 'text' : 'password'}
                  value={passForm.newPass}
                  onChange={e => setPassForm(f => ({ ...f, newPass: e.target.value }))}
                  placeholder="Nhập mật khẩu mới..." className="input pr-11" />
                <button type="button" onClick={() => setShowPass(s => ({ ...s, new: !s.new }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPass.new ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Xác nhận mật khẩu mới</label>
              <div className="relative">
                <input type={showPass.confirm ? 'text' : 'password'}
                  value={passForm.confirm}
                  onChange={e => setPassForm(f => ({ ...f, confirm: e.target.value }))}
                  placeholder="Nhập lại mật khẩu mới..." className="input pr-11" />
                <button type="button" onClick={() => setShowPass(s => ({ ...s, confirm: !s.confirm }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPass.confirm ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {/* Password strength */}
            {passForm.newPass.length > 0 && (
              <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                {passRules.map(rule => (
                  <div key={rule.label} className="flex items-center gap-2 text-sm">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${
                      rule.ok ? 'bg-green-500' : 'bg-slate-200'
                    }`}>
                      {rule.ok && (
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                          <path d="M20 6L9 17l-5-5"/>
                        </svg>
                      )}
                    </div>
                    <span style={{ color: rule.ok ? '#16A34A' : '#94A3B8' }}>{rule.label}</span>
                  </div>
                ))}
              </div>
            )}

            <button onClick={handleChangePassword}
              disabled={savingPass || !passRules.every(r => r.ok) || !passForm.newPass}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-white disabled:opacity-50 transition-all"
              style={{ background: 'linear-gradient(135deg, #7C3AED, #6D28D9)' }}>
              {savingPass ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Đang đổi...
                </span>
              ) : <><Lock size={15} /> Đổi Mật Khẩu</>}
            </button>
          </div>

          {/* Security info */}
          <div className="rounded-2xl p-4 border" style={{ background: '#EFF6FF', borderColor: '#BFDBFE' }}>
            <p className="text-sm font-bold mb-2" style={{ color: '#1E40AF' }}>🔐 Lời khuyên bảo mật</p>
            <ul className="text-xs space-y-1.5" style={{ color: '#3B82F6' }}>
              <li>• Không chia sẻ mật khẩu với bất kỳ ai kể cả admin XanhSoft</li>
              <li>• Dùng mật khẩu khác với các trang web khác</li>
              <li>• Đổi mật khẩu định kỳ 3-6 tháng một lần</li>
              <li>• Liên hệ Zalo ngay nếu phát hiện tài khoản bị đăng nhập lạ</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}