'use client'
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, Lock, Eye, EyeOff, Upload } from 'lucide-react'
import { Modal } from './Modal'
import { Button } from './Button'
import { Input } from './Input'
import { useSession } from 'next-auth/react'
import toast from 'react-hot-toast'

interface Props {
  open: boolean
  onClose: () => void
  onAvatarChange: (avatar: string | null) => void
}

function resizeToBase64(file: File, size = 256): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = size
        canvas.height = size
        const ctx = canvas.getContext('2d')!
        // Center-crop to square
        const min = Math.min(img.width, img.height)
        const sx = (img.width - min) / 2
        const sy = (img.height - min) / 2
        ctx.drawImage(img, sx, sy, min, min, 0, 0, size, size)
        resolve(canvas.toDataURL('image/jpeg', 0.88))
      }
      img.onerror = reject
      img.src = e.target?.result as string
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export function ProfileModal({ open, onClose, onAvatarChange }: Props) {
  const { data: session } = useSession()
  const [tab, setTab] = useState<'avatar' | 'password'>('avatar')

  // Avatar state
  const [currentAvatar, setCurrentAvatar] = useState<string | null>(null)
  const [pendingAvatar, setPendingAvatar] = useState<string | null>(null)
  const [savingAvatar, setSavingAvatar] = useState(false)
  const [dragging, setDragging] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  // Password state
  const [pass, setPass] = useState({ current: '', next: '', confirm: '' })
  const [showPass, setShowPass] = useState({ current: false, next: false })
  const [savingPass, setSavingPass] = useState(false)

  // Load current avatar when modal opens
  useEffect(() => {
    if (!open) return
    fetch('/api/user/profile')
      .then((r) => r.json())
      .then((d) => setCurrentAvatar(d.avatar ?? null))
  }, [open])

  // Reset pending on close
  useEffect(() => {
    if (!open) {
      setPendingAvatar(null)
      setPass({ current: '', next: '', confirm: '' })
      setTab('avatar')
    }
  }, [open])

  async function processFile(file: File) {
    if (!file.type.startsWith('image/')) {
      toast.error('Selecione uma imagem válida (JPG, PNG, WEBP)')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Imagem muito grande. Máximo 10MB')
      return
    }
    try {
      const b64 = await resizeToBase64(file, 256)
      setPendingAvatar(b64)
    } catch {
      toast.error('Erro ao processar imagem')
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) processFile(file)
    e.target.value = ''
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) processFile(file)
  }

  async function saveAvatar() {
    setSavingAvatar(true)
    try {
      const r = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatar: pendingAvatar }),
      })
      if (!r.ok) { toast.error('Erro ao salvar foto'); return }
      setCurrentAvatar(pendingAvatar)
      onAvatarChange(pendingAvatar)
      setPendingAvatar(null)
      toast.success('Foto atualizada!')
    } finally {
      setSavingAvatar(false)
    }
  }

  async function removeAvatar() {
    setSavingAvatar(true)
    try {
      const r = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatar: null }),
      })
      if (!r.ok) { toast.error('Erro ao remover foto'); return }
      setCurrentAvatar(null)
      setPendingAvatar(null)
      onAvatarChange(null)
      toast.success('Foto removida')
    } finally {
      setSavingAvatar(false)
    }
  }

  async function savePassword(e: React.FormEvent) {
    e.preventDefault()
    if (pass.next !== pass.confirm) { toast.error('As senhas não coincidem'); return }
    if (pass.next.length < 4) { toast.error('A nova senha deve ter pelo menos 4 caracteres'); return }
    setSavingPass(true)
    try {
      const r = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: pass.current, newPassword: pass.next }),
      })
      const data = await r.json()
      if (!r.ok) { toast.error(data.error ?? 'Erro ao alterar senha'); return }
      toast.success('Senha alterada com sucesso!')
      setPass({ current: '', next: '', confirm: '' })
      onClose()
    } finally {
      setSavingPass(false)
    }
  }

  const displayAvatar = pendingAvatar ?? currentAvatar
  const initials = session?.user?.name?.[0]?.toUpperCase() ?? 'U'

  const tabs = [
    { key: 'avatar' as const, label: 'Foto do Perfil', icon: Camera },
    { key: 'password' as const, label: 'Alterar Senha', icon: Lock },
  ]

  return (
    <Modal open={open} onClose={onClose} title="Meu Perfil" maxWidth="max-w-md">
      {/* Header com info do usuário */}
      <div className="flex items-center gap-4 mb-6 pb-5 border-b border-dark-border">
        <div className="relative flex-shrink-0">
          {displayAvatar ? (
            <img
              src={displayAvatar}
              alt="Avatar"
              className="w-16 h-16 rounded-2xl object-cover ring-2 ring-emerald-500/40"
            />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-2xl font-bold text-emerald-400 ring-2 ring-emerald-500/20">
              {initials}
            </div>
          )}
          {pendingAvatar && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-dark-card" />
          )}
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-white truncate">{session?.user?.name}</p>
          <p className="text-sm text-gray-500 truncate">{session?.user?.email}</p>
          {pendingAvatar && (
            <p className="text-xs text-emerald-400 mt-0.5">Nova foto selecionada — salve para confirmar</p>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-dark-bg rounded-xl mb-5">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
              tab === key
                ? 'bg-dark-card text-white shadow border border-dark-border'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* ─── Avatar tab ───────────────────────────────────── */}
        {tab === 'avatar' && (
          <motion.div
            key="avatar"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
          >
            {/* Drop zone */}
            <div
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-8 cursor-pointer transition-all duration-200 ${
                dragging
                  ? 'border-emerald-400 bg-emerald-500/10 scale-[1.01]'
                  : displayAvatar
                  ? 'border-dark-border hover:border-emerald-500/50 hover:bg-emerald-500/5'
                  : 'border-dark-border hover:border-emerald-500/50 hover:bg-emerald-500/5'
              }`}
            >
              {displayAvatar ? (
                <div className="flex flex-col items-center gap-3">
                  <img
                    src={displayAvatar}
                    alt="Preview"
                    className={`w-32 h-32 rounded-2xl object-cover shadow-xl transition-all ${
                      pendingAvatar ? 'ring-4 ring-emerald-400/50' : 'ring-2 ring-dark-border'
                    }`}
                  />
                  <div className="flex items-center gap-1.5 text-sm text-gray-400">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Clique ou arraste para trocar</span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className={`w-20 h-20 rounded-2xl flex items-center justify-center transition-colors ${
                    dragging ? 'bg-emerald-500/20' : 'bg-dark-border'
                  }`}>
                    <Camera className={`w-9 h-9 transition-colors ${dragging ? 'text-emerald-400' : 'text-gray-500'}`} />
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-400">Clique ou arraste uma foto aqui</p>
                    <p className="text-xs text-gray-600 mt-1">JPG, PNG ou WEBP · Max 10MB</p>
                    <p className="text-xs text-gray-600">Será recortada em quadrado 256×256</p>
                  </div>
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

            <div className="flex gap-2 mt-4">
              {currentAvatar && !pendingAvatar && (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={removeAvatar}
                  loading={savingAvatar}
                  className="flex-shrink-0"
                >
                  Remover foto
                </Button>
              )}
              <Button variant="secondary" onClick={onClose} className="flex-1 justify-center">
                Cancelar
              </Button>
              <Button
                onClick={saveAvatar}
                loading={savingAvatar}
                disabled={!pendingAvatar}
                className="flex-1 justify-center"
              >
                Salvar foto
              </Button>
            </div>
          </motion.div>
        )}

        {/* ─── Password tab ─────────────────────────────────── */}
        {tab === 'password' && (
          <motion.div
            key="password"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
          >
            <form onSubmit={savePassword} className="space-y-4">
              {/* Current password */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-300">Senha atual</label>
                <div className="relative">
                  <input
                    type={showPass.current ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={pass.current}
                    onChange={(e) => setPass({ ...pass, current: e.target.value })}
                    required
                    className="w-full bg-dark-input border border-dark-border rounded-xl px-4 py-2.5 pr-11 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(s => ({ ...s, current: !s.current }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    {showPass.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* New password */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-300">Nova senha</label>
                <div className="relative">
                  <input
                    type={showPass.next ? 'text' : 'password'}
                    placeholder="Mínimo 4 caracteres"
                    value={pass.next}
                    onChange={(e) => setPass({ ...pass, next: e.target.value })}
                    required
                    className="w-full bg-dark-input border border-dark-border rounded-xl px-4 py-2.5 pr-11 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(s => ({ ...s, next: !s.next }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    {showPass.next ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {/* Strength indicator */}
                {pass.next.length > 0 && (
                  <div className="flex gap-1 mt-1">
                    {[1, 2, 3, 4].map((n) => (
                      <div
                        key={n}
                        className={`h-1 flex-1 rounded-full transition-colors duration-200 ${
                          pass.next.length >= n * 2
                            ? n <= 1 ? 'bg-red-500'
                              : n <= 2 ? 'bg-yellow-500'
                              : n <= 3 ? 'bg-blue-500'
                              : 'bg-emerald-500'
                            : 'bg-dark-border'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Confirm */}
              <Input
                label="Confirmar nova senha"
                type="password"
                placeholder="Repita a nova senha"
                value={pass.confirm}
                onChange={(e) => setPass({ ...pass, confirm: e.target.value })}
                error={pass.confirm.length > 0 && pass.next !== pass.confirm ? 'Senhas não coincidem' : undefined}
                required
              />

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="secondary" onClick={onClose} className="flex-1 justify-center">
                  Cancelar
                </Button>
                <Button type="submit" loading={savingPass} className="flex-1 justify-center">
                  Alterar senha
                </Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </Modal>
  )
}
