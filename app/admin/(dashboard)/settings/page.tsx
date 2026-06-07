'use client'

import { useState, useEffect } from 'react'
import { Check } from 'lucide-react'

type Settings = Record<string, string>

type Policy = { id?: string; icon: string; title: string; body: string; display_order: number; active: boolean }

export default function SettingsPage() {
  const [s, setS] = useState<Settings>({})
  const [policies, setPolicies] = useState<Policy[]>([])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [policyError, setPolicyError] = useState('')
  const [editPolicy, setEditPolicy] = useState<Policy | null>(null)
  const [showAddPolicy, setShowAddPolicy] = useState(false)
  const [newPolicy, setNewPolicy] = useState<Policy>({ icon: '📋', title: '', body: '', display_order: 0, active: true })

  const load = async () => {
    const [setRes, polRes] = await Promise.all([
      fetch('/api/settings').then((r) => r.json()),
      fetch('/api/policies').then((r) => r.json()),
    ])
    setS(setRes)
    setPolicies(polRes)
  }

  useEffect(() => { load() }, [])

  const handleSave = async () => {
    setSaving(true)
    await fetch('/api/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(s),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const field = (key: string, value: string) => setS((p) => ({ ...p, [key]: value }))
  const toggle = (key: string) => setS((p) => ({ ...p, [key]: p[key] === 'true' ? 'false' : 'true' }))

  const handleSavePolicy = async () => {
    if (!editPolicy) return
    setSaving(true)
    if (editPolicy.id) {
      await fetch(`/api/policies?id=${editPolicy.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editPolicy),
      })
    } else {
      await fetch('/api/policies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editPolicy),
      })
    }
    await load()
    setEditPolicy(null)
    setSaving(false)
  }

  const handleAddPolicy = async () => {
    setSaving(true)
    setPolicyError('')
    const res = await fetch('/api/policies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newPolicy, display_order: policies.length + 1 }),
    })
    const data = await res.json()
    if (!res.ok || data?.error) {
      setPolicyError(data?.error || 'Failed to save policy')
      setSaving(false)
      return
    }
    await load()
    setShowAddPolicy(false)
    setNewPolicy({ icon: '📋', title: '', body: '', display_order: 0, active: true })
    setSaving(false)
  }

  const [notifStatus, setNotifStatus] = useState<'idle' | 'loading' | 'enabled' | 'denied' | 'error'>('idle')

  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4)
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
    const rawData = window.atob(base64)
    return new Uint8Array([...rawData].map((c) => c.charCodeAt(0)))
  }

  const enableNotifications = async () => {
    setNotifStatus('loading')
    try {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        setNotifStatus('error'); return
      }
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') { setNotifStatus('denied'); return }

      const reg = await navigator.serviceWorker.register('/sw-custom.js')
      await navigator.serviceWorker.ready

      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      if (!vapidKey) { setNotifStatus('error'); return }

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      })

      const res = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sub),
      })
      setNotifStatus(res.ok ? 'enabled' : 'error')
    } catch { setNotifStatus('error') }
  }

  const Section = ({ title }: { title: string }) => (
    <p className="text-xs uppercase tracking-widest text-[#b0a8a4] mb-3 mt-6 first:mt-0">{title}</p>
  )

  const Field = ({ label, k, type = 'text', placeholder = '' }: { label: string; k: string; type?: string; placeholder?: string }) => (
    <div className="mb-4">
      <label className="text-xs text-[#8a7f7a] block mb-1.5">{label}</label>
      {type === 'textarea' ? (
        <textarea
          className="input-field min-h-[80px] resize-none text-sm"
          value={s[k] || ''}
          onChange={(e) => field(k, e.target.value)}
          placeholder={placeholder}
        />
      ) : (
        <input
          className="input-field text-sm"
          value={s[k] || ''}
          onChange={(e) => field(k, e.target.value)}
          placeholder={placeholder}
        />
      )}
    </div>
  )

  const Toggle = ({ label, k }: { label: string; k: string }) => (
    <div className="flex items-center justify-between py-3 border-b border-[#ede9e5] last:border-0">
      <span className="text-sm text-[#1a1a1a]">{label}</span>
      <button
        onClick={() => toggle(k)}
        className={`relative w-11 h-6 rounded-full transition-colors ${s[k] === 'true' ? 'bg-[#ffabdd]' : 'bg-[#ede9e5]'}`}
      >
        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${s[k] === 'true' ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    </div>
  )

  return (
    <div className="px-4 py-6">
      <h1 className="font-cormorant text-3xl font-semibold text-[#1a1a1a] mb-6">Settings</h1>

      <Section title="Business Info" />
      <Field label="Business name" k="business_name" />
      <Field label="Location" k="location" placeholder="City, State" />
      <Field label="Phone" k="phone" placeholder="+1 (555) 000-0000" />
      <Field label="Bio" k="bio" type="textarea" />

      <Section title="Social Handles" />
      <Field label="Instagram" k="instagram" placeholder="@handle" />
      <Field label="Facebook" k="facebook" placeholder="@handle" />

      <Section title="Payment Methods" />
      <Field label="CashApp handle" k="cashapp_handle" placeholder="$handle" />
      <Field label="CashApp link" k="cashapp_url" placeholder="https://cash.app/$handle" />
      <Field label="Zelle number/email" k="zelle_contact" />
      <Field label="Zelle link" k="zelle_url" placeholder="https://enroll.zellepay.com/..." />
      <Field label="Apple Pay link" k="applepay_url" placeholder="https://..." />
      <div className="bg-white border border-[#ede9e5] rounded-2xl px-4 mb-4">
        <Toggle label="Stripe (card payments)" k="stripe_enabled" />
        <Toggle label="CashApp" k="cashapp_enabled" />
        <Toggle label="Zelle" k="zelle_enabled" />
        <Toggle label="Apple Pay" k="applepay_enabled" />
      </div>

      <Section title="Booking Policies" />
      <div className="space-y-2 mb-4">
        {policies.map((policy) => (
          <button
            key={policy.id}
            onClick={() => setEditPolicy(policy)}
            className="w-full text-left flex items-start gap-3 bg-white border border-[#ede9e5] rounded-xl p-3 hover:border-[#ffabdd]/50 transition-colors"
          >
            <span className="text-xl">{policy.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-[#1a1a1a]">{policy.title}</p>
              <p className="text-[#8a7f7a] text-xs truncate">{policy.body}</p>
            </div>
          </button>
        ))}
        <button
          onClick={() => setShowAddPolicy(true)}
          className="w-full py-3 rounded-xl border border-dashed border-[#ffabdd]/50 text-[#c4658f] text-sm hover:bg-[#fff0f8] transition-colors"
        >
          + Add policy
        </button>
      </div>

      <Section title="Integrations" />
      <div className="space-y-2 mb-6">
        <a
          href="/api/auth/google"
          className="flex items-center justify-between bg-white border border-[#ede9e5] rounded-xl px-4 py-3 hover:border-[#ffabdd]/50 transition-colors"
        >
          <div>
            <p className="text-sm font-medium text-[#1a1a1a]">Google Calendar + Gmail</p>
            <p className="text-xs text-[#8a7f7a]">Connect your Google account</p>
          </div>
          <span className="text-xs text-[#c4658f]">Connect →</span>
        </a>
        <div className="flex items-center justify-between bg-white border border-[#ede9e5] rounded-xl px-4 py-3">
          <div>
            <p className="text-sm font-medium text-[#1a1a1a]">Push Notifications</p>
            <p className="text-xs text-[#8a7f7a]">
              {notifStatus === 'enabled' ? 'Notifications enabled on this device ✓'
                : notifStatus === 'denied' ? 'Permission denied — enable in browser settings'
                : notifStatus === 'error' ? 'Something went wrong — try again'
                : 'Get notified on new bookings'}
            </p>
          </div>
          <button
            onClick={enableNotifications}
            disabled={notifStatus === 'loading' || notifStatus === 'enabled'}
            className="text-xs font-medium text-[#c4658f] disabled:text-[#b0a8a4] whitespace-nowrap"
          >
            {notifStatus === 'loading' ? 'Enabling…' : notifStatus === 'enabled' ? 'Enabled ✓' : 'Enable →'}
          </button>
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full py-4 rounded-full bg-[#ffabdd] text-[#1a1a1a] font-semibold hover:bg-[#c4658f] hover:text-white transition-all disabled:opacity-50"
      >
        {saved ? '✓ Saved!' : saving ? 'Saving...' : 'Save all settings'}
      </button>

      {editPolicy && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-50 p-4" onClick={() => setEditPolicy(null)}>
          <div className="w-full max-w-sm mx-auto bg-white rounded-2xl p-5 space-y-3" onClick={(e) => e.stopPropagation()}>
            <p className="font-semibold text-[#1a1a1a]">Edit Policy</p>
            <div className="flex items-center gap-2">
              <input className="input-field w-16 text-center text-xl" value={editPolicy.icon} onChange={(e) => setEditPolicy((p) => p && ({ ...p, icon: e.target.value }))} />
              <input className="input-field flex-1" placeholder="Title" value={editPolicy.title} onChange={(e) => setEditPolicy((p) => p && ({ ...p, title: e.target.value }))} />
            </div>
            <textarea className="input-field min-h-[80px] resize-none text-sm" placeholder="Policy body" value={editPolicy.body} onChange={(e) => setEditPolicy((p) => p && ({ ...p, body: e.target.value }))} />
            <div className="flex gap-2">
              <button onClick={() => setEditPolicy(null)} className="flex-1 py-3 rounded-full border border-[#ede9e5] text-sm text-[#1a1a1a]">Cancel</button>
              <button onClick={handleSavePolicy} disabled={saving} className="flex-1 py-3 rounded-full bg-[#ffabdd] text-[#1a1a1a] font-semibold text-sm">
                <Check size={14} className="inline mr-1" /> Save
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddPolicy && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-50 p-4" onClick={() => setShowAddPolicy(false)}>
          <div className="w-full max-w-sm mx-auto bg-white rounded-2xl p-5 space-y-3" onClick={(e) => e.stopPropagation()}>
            <p className="font-semibold text-[#1a1a1a]">Add Policy</p>
            <div className="flex items-center gap-2">
              <input className="input-field w-16 text-center text-xl" value={newPolicy.icon} onChange={(e) => setNewPolicy((p) => ({ ...p, icon: e.target.value }))} />
              <input className="input-field flex-1" placeholder="Title" value={newPolicy.title} onChange={(e) => setNewPolicy((p) => ({ ...p, title: e.target.value }))} />
            </div>
            <textarea className="input-field min-h-[80px] resize-none text-sm" placeholder="Policy body" value={newPolicy.body} onChange={(e) => setNewPolicy((p) => ({ ...p, body: e.target.value }))} />
            {policyError && (
              <p className="text-red-500 text-xs bg-red-50 border border-red-200 rounded-xl px-3 py-2">{policyError}</p>
            )}
            <div className="flex gap-2">
              <button onClick={() => setShowAddPolicy(false)} className="flex-1 py-3 rounded-full border border-[#ede9e5] text-sm text-[#1a1a1a]">Cancel</button>
              <button onClick={handleAddPolicy} disabled={saving || !newPolicy.title} className="flex-1 py-3 rounded-full bg-[#ffabdd] text-[#1a1a1a] font-semibold text-sm">{saving ? 'Saving...' : 'Add'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
