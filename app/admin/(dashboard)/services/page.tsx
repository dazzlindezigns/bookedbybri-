'use client'

import { useState, useEffect } from 'react'
import { Trash2, Plus, Pencil } from 'lucide-react'

type Service = {
  id: string
  name: string
  description: string | null
  base_price: number | null
  duration_minutes: number
  requires_consultation: boolean
  hair_included: boolean
  active: boolean
  display_order: number
}

type SvcForm = {
  name: string
  description: string
  base_price: string
  duration_minutes: string
  requires_consultation: boolean
  hair_included: boolean
}

const EMPTY_FORM: SvcForm = {
  name: '', description: '', base_price: '', duration_minutes: '3',
  requires_consultation: false, hair_included: false,
}

function ServiceModal({
  title, form, setForm, onSave, onClose, saving, error,
}: {
  title: string
  form: SvcForm
  setForm: (f: SvcForm) => void
  onSave: () => void
  onClose: () => void
  saving: boolean
  error: string
}) {
  const set = (k: keyof SvcForm, v: string | boolean) => setForm({ ...form, [k]: v })
  return (
    <div className="fixed inset-0 bg-black/50 flex items-end z-50 p-4" onClick={onClose}>
      <div className="w-full max-w-sm mx-auto bg-white rounded-2xl p-5 space-y-4 max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <p className="font-semibold text-[#1a1a1a]">{title}</p>
        <div>
          <label className="text-xs text-[#8a7f7a] block mb-1">Service name *</label>
          <input className="input-field" value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. Knotless Box Braids" />
        </div>
        <div>
          <label className="text-xs text-[#8a7f7a] block mb-1">Description</label>
          <input className="input-field" value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="e.g. Add Fulani for +$10" />
        </div>
        <div>
          <label className="text-xs text-[#8a7f7a] block mb-1">Duration (hours)</label>
          <input type="number" step="0.5" min="0.5" className="input-field" value={form.duration_minutes} onChange={(e) => set('duration_minutes', e.target.value)} placeholder="e.g. 3" />
        </div>
        <div className="flex gap-3">
          <label className="flex items-center gap-2 text-sm cursor-pointer text-[#1a1a1a]">
            <input type="checkbox" checked={form.requires_consultation} onChange={(e) => set('requires_consultation', e.target.checked)} className="accent-[#ffabdd]" />
            Consultation required
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer text-[#1a1a1a]">
            <input type="checkbox" checked={form.hair_included} onChange={(e) => set('hair_included', e.target.checked)} className="accent-[#ffabdd]" />
            Hair included
          </label>
        </div>
        {!form.requires_consultation && (
          <div>
            <label className="text-xs text-[#8a7f7a] block mb-1">Starting price ($)</label>
            <input type="number" className="input-field" value={form.base_price} onChange={(e) => set('base_price', e.target.value)} placeholder="0" />
          </div>
        )}
        {error && <p className="text-red-500 text-xs bg-red-50 border border-red-200 rounded-xl px-3 py-2">{error}</p>}
        <div className="flex gap-2 pt-2">
          <button onClick={onClose} className="flex-1 py-3 rounded-full border border-[#ede9e5] text-[#1a1a1a] text-sm">Cancel</button>
          <button onClick={onSave} disabled={saving || !form.name} className="flex-1 py-3 rounded-full bg-[#ffabdd] text-[#1a1a1a] font-semibold text-sm disabled:opacity-50">
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}

function displayDuration(mins: number) {
  if (!mins) return ''
  if (mins % 60 === 0) return `${mins / 60}hr`
  return `${(mins / 60).toFixed(1)}hr`
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [depositType, setDepositType] = useState<'flat' | 'percentage'>('flat')
  const [depositValue, setDepositValue] = useState('50')
  const [loadError, setLoadError] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  const [showAdd, setShowAdd] = useState(false)
  const [addForm, setAddForm] = useState<SvcForm>(EMPTY_FORM)

  const [editSvc, setEditSvc] = useState<Service | null>(null)
  const [editForm, setEditForm] = useState<SvcForm>(EMPTY_FORM)

  const load = async () => {
    try {
      const [svcRes, setRes] = await Promise.all([
        fetch('/api/services').then((r) => r.json()),
        fetch('/api/settings').then((r) => r.json()),
      ])
      if (!Array.isArray(svcRes)) {
        setLoadError(svcRes?.error || 'Failed to load services')
        return
      }
      setServices(svcRes)
      setDepositType(setRes.deposit_type || 'flat')
      setDepositValue(setRes.deposit_value || '50')
    } catch (e) { setLoadError(String(e)) }
  }

  useEffect(() => { load() }, [])

  const handleSaveDeposit = async () => {
    setSaving(true)
    await fetch('/api/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deposit_type: depositType, deposit_value: depositValue }),
    })
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this service?')) return
    await fetch(`/api/services?id=${id}`, { method: 'DELETE' })
    setServices((prev) => prev.filter((s) => s.id !== id))
  }

  const buildBody = (form: SvcForm, extra?: object) => ({
    name: form.name,
    description: form.description || null,
    base_price: form.requires_consultation ? null : parseFloat(form.base_price) || null,
    duration_minutes: Math.round(parseFloat(form.duration_minutes) * 60),
    requires_consultation: form.requires_consultation,
    hair_included: form.hair_included,
    active: true,
    ...extra,
  })

  const handleAdd = async () => {
    setSaving(true); setSaveError('')
    try {
      const res = await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildBody(addForm, { display_order: services.length + 1 })),
      })
      const data = await res.json()
      if (!res.ok || data?.error) { setSaveError(data?.error || 'Failed to save'); setSaving(false); return }
      setServices((prev) => [...prev, data])
      setShowAdd(false); setAddForm(EMPTY_FORM)
    } catch (e) { setSaveError(String(e)) }
    setSaving(false)
  }

  const openEdit = (svc: Service) => {
    setEditSvc(svc)
    setEditForm({
      name: svc.name,
      description: svc.description || '',
      base_price: svc.base_price?.toString() || '',
      duration_minutes: (svc.duration_minutes / 60).toString(),
      requires_consultation: svc.requires_consultation,
      hair_included: svc.hair_included,
    })
    setSaveError('')
  }

  const handleEdit = async () => {
    if (!editSvc) return
    setSaving(true); setSaveError('')
    try {
      const res = await fetch('/api/services', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editSvc.id, ...buildBody(editForm) }),
      })
      const data = await res.json()
      if (!res.ok || data?.error) { setSaveError(data?.error || 'Failed to save'); setSaving(false); return }
      setServices((prev) => prev.map((s) => s.id === data.id ? data : s))
      setEditSvc(null)
    } catch (e) { setSaveError(String(e)) }
    setSaving(false)
  }

  const depositPreview = depositType === 'flat'
    ? `Clients will pay a $${depositValue} flat deposit`
    : `Clients will pay ${depositValue}% of the service price`

  return (
    <div className="px-4 py-6">
      <h1 className="font-cormorant text-3xl font-semibold text-[#1a1a1a] mb-6">Services</h1>
      {loadError && <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">{loadError}</div>}

      <div className="bg-white border border-[#ffabdd]/40 rounded-2xl p-5 mb-6">
        <p className="font-semibold text-[#1a1a1a] mb-4">Deposit Settings</p>
        <div className="flex gap-2 mb-4">
          {(['flat', 'percentage'] as const).map((t) => (
            <button key={t} onClick={() => setDepositType(t)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-colors ${depositType === t ? 'border-[#ffabdd] bg-[#fff0f8] text-[#c4658f]' : 'border-[#ede9e5] text-[#8a7f7a] bg-white'}`}>
              {t === 'flat' ? 'Flat amount ($)' : 'Percentage (%)'}
            </button>
          ))}
        </div>
        <input type="number" min="0" className="input-field text-xl font-bold mb-3" value={depositValue} onChange={(e) => setDepositValue(e.target.value)} />
        <p className="text-[#8a7f7a] text-xs mb-4">{depositPreview}</p>
        <button onClick={handleSaveDeposit} disabled={saving} className="w-full py-3 rounded-full bg-[#ffabdd] text-[#1a1a1a] font-semibold text-sm hover:bg-[#c4658f] hover:text-white transition-all disabled:opacity-50">
          Save deposit settings
        </button>
      </div>

      <div className="space-y-2 mb-4">
        {services.map((svc) => (
          <div key={svc.id} className="bg-white border border-[#ede9e5] rounded-2xl p-4 flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-[#1a1a1a]">{svc.name}</p>
              <p className="text-[#8a7f7a] text-xs mt-0.5">
                {displayDuration(svc.duration_minutes)} ·{' '}
                {svc.requires_consultation ? <span className="text-[#c4658f]">Consultation</span> : svc.base_price ? `$${svc.base_price}` : 'TBD'}
              </p>
              {svc.description && <p className="text-[#b0a8a4] text-xs mt-0.5 truncate">{svc.description}</p>}
            </div>
            <button onClick={() => openEdit(svc)} className="p-2 rounded-lg text-[#b0a8a4] hover:text-[#c4658f] hover:bg-[#fff0f8] transition-colors">
              <Pencil size={15} />
            </button>
            <button onClick={() => handleDelete(svc.id)} className="p-2 rounded-lg text-[#b0a8a4] hover:text-red-500 hover:bg-red-50 transition-colors">
              <Trash2 size={15} />
            </button>
          </div>
        ))}
      </div>

      <button onClick={() => { setShowAdd(true); setSaveError('') }}
        className="flex items-center gap-2 w-full py-3 rounded-full border border-dashed border-[#ffabdd]/50 text-[#c4658f] text-sm justify-center hover:bg-[#fff0f8] transition-colors">
        <Plus size={16} /> Add service
      </button>

      {showAdd && (
        <ServiceModal title="Add New Service" form={addForm} setForm={setAddForm}
          onSave={handleAdd} onClose={() => setShowAdd(false)} saving={saving} error={saveError} />
      )}
      {editSvc && (
        <ServiceModal title={`Edit: ${editSvc.name}`} form={editForm} setForm={setEditForm}
          onSave={handleEdit} onClose={() => setEditSvc(null)} saving={saving} error={saveError} />
      )}
    </div>
  )
}
