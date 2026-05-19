'use client'

import { useState, useEffect } from 'react'
import { Trash2, Plus } from 'lucide-react'

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

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [depositType, setDepositType] = useState<'flat' | 'percentage'>('flat')
  const [depositValue, setDepositValue] = useState('50')
  const [showAdd, setShowAdd] = useState(false)
  const [saving, setSaving] = useState(false)
  const [newSvc, setNewSvc] = useState({
    name: '',
    description: '',
    base_price: '',
    duration_minutes: '60',
    requires_consultation: false,
    hair_included: true,
  })

  const load = async () => {
    const [svcRes, setRes] = await Promise.all([
      fetch('/api/services').then((r) => r.json()),
      fetch('/api/settings').then((r) => r.json()),
    ])
    setServices(svcRes)
    setSettings(setRes)
    setDepositType(setRes.deposit_type || 'flat')
    setDepositValue(setRes.deposit_value || '50')
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

  const handleAddService = async () => {
    setSaving(true)
    const res = await fetch('/api/services', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...newSvc,
        base_price: newSvc.requires_consultation ? null : parseFloat(newSvc.base_price) || null,
        duration_minutes: parseInt(newSvc.duration_minutes),
        display_order: services.length + 1,
        active: true,
      }),
    })
    const created = await res.json()
    setServices((prev) => [...prev, created])
    setShowAdd(false)
    setNewSvc({ name: '', description: '', base_price: '', duration_minutes: '60', requires_consultation: false, hair_included: true })
    setSaving(false)
  }

  const depositPreview =
    depositType === 'flat'
      ? `Clients will pay a $${depositValue} flat deposit`
      : `Clients will pay ${depositValue}% of the service price`

  return (
    <div className="px-4 py-6">
      <h1 className="font-cormorant text-3xl font-semibold mb-6">Services</h1>

      {/* Deposit configurator */}
      <div className="bg-[#222] border border-[#ffabdd]/30 rounded-2xl p-5 mb-6">
        <p className="font-semibold mb-4">Deposit Settings</p>
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setDepositType('flat')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-colors ${depositType === 'flat' ? 'border-[#ffabdd] bg-[#ffabdd]/10 text-[#ffabdd]' : 'border-[#3a3a3a] text-white/50'}`}
          >
            Flat amount ($)
          </button>
          <button
            onClick={() => setDepositType('percentage')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-colors ${depositType === 'percentage' ? 'border-[#ffabdd] bg-[#ffabdd]/10 text-[#ffabdd]' : 'border-[#3a3a3a] text-white/50'}`}
          >
            Percentage (%)
          </button>
        </div>
        <input
          type="number"
          min="0"
          className="input-field text-xl font-bold mb-3"
          value={depositValue}
          onChange={(e) => setDepositValue(e.target.value)}
        />
        <p className="text-white/50 text-xs mb-4">{depositPreview}</p>
        <button
          onClick={handleSaveDeposit}
          disabled={saving}
          className="w-full py-3 rounded-full bg-[#ffabdd] text-[#1a1a1a] font-semibold text-sm hover:bg-[#c4658f] hover:text-white transition-all disabled:opacity-50"
        >
          Save deposit settings
        </button>
      </div>

      {/* Service list */}
      <div className="space-y-2 mb-4">
        {services.map((svc) => (
          <div key={svc.id} className="bg-[#222] border border-[#3a3a3a] rounded-2xl p-4 flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm">{svc.name}</p>
              <p className="text-white/50 text-xs mt-0.5">
                {svc.duration_minutes}min ·{' '}
                {svc.requires_consultation ? (
                  <span className="text-[#ffabdd]">Consultation</span>
                ) : svc.base_price ? (
                  `$${svc.base_price}`
                ) : 'TBD'}
              </p>
            </div>
            <button
              onClick={() => handleDelete(svc.id)}
              className="p-2 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-400/10 transition-colors"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={() => setShowAdd(true)}
        className="flex items-center gap-2 w-full py-3 rounded-full border border-dashed border-[#ffabdd]/40 text-[#ffabdd] text-sm justify-center hover:bg-[#ffabdd]/5 transition-colors"
      >
        <Plus size={16} /> Add service
      </button>

      {/* Add service sheet */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/80 flex items-end z-50 p-4" onClick={() => setShowAdd(false)}>
          <div
            className="w-full max-w-sm mx-auto bg-[#222] rounded-2xl p-5 space-y-4 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="font-semibold">Add New Service</p>

            <div>
              <label className="text-xs text-white/60 block mb-1">Service name *</label>
              <input className="input-field" value={newSvc.name} onChange={(e) => setNewSvc((p) => ({ ...p, name: e.target.value }))} placeholder="e.g. Knotless Box Braids" />
            </div>
            <div>
              <label className="text-xs text-white/60 block mb-1">Description</label>
              <input className="input-field" value={newSvc.description} onChange={(e) => setNewSvc((p) => ({ ...p, description: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs text-white/60 block mb-1">Duration (minutes)</label>
              <input type="number" className="input-field" value={newSvc.duration_minutes} onChange={(e) => setNewSvc((p) => ({ ...p, duration_minutes: e.target.value }))} />
            </div>
            <div className="flex gap-3">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={newSvc.requires_consultation}
                  onChange={(e) => setNewSvc((p) => ({ ...p, requires_consultation: e.target.checked }))}
                  className="accent-[#ffabdd]"
                />
                Consultation required
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={newSvc.hair_included}
                  onChange={(e) => setNewSvc((p) => ({ ...p, hair_included: e.target.checked }))}
                  className="accent-[#ffabdd]"
                />
                Hair included
              </label>
            </div>
            {!newSvc.requires_consultation && (
              <div>
                <label className="text-xs text-white/60 block mb-1">Starting price ($)</label>
                <input type="number" className="input-field" value={newSvc.base_price} onChange={(e) => setNewSvc((p) => ({ ...p, base_price: e.target.value }))} placeholder="0" />
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button onClick={() => setShowAdd(false)} className="flex-1 py-3 rounded-full border border-[#3a3a3a] text-sm">Cancel</button>
              <button
                onClick={handleAddService}
                disabled={saving || !newSvc.name}
                className="flex-1 py-3 rounded-full bg-[#ffabdd] text-[#1a1a1a] font-semibold text-sm disabled:opacity-50"
              >
                Add service
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
