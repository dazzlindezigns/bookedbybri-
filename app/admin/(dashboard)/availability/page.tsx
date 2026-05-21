'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2 } from 'lucide-react'

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

type DaySchedule = {
  enabled: boolean
  start_time: string
  end_time: string
  blockId?: string
}

type SpecificBlock = {
  id?: string
  specific_date: string
  start_time: string
  end_time: string
  note: string
}

const DEFAULT_SCHEDULE: DaySchedule = { enabled: false, start_time: '09:00', end_time: '18:00' }

export default function AvailabilityPage() {
  const [schedule, setSchedule] = useState<DaySchedule[]>(DAYS.map(() => ({ ...DEFAULT_SCHEDULE })))
  const [specificBlocks, setSpecificBlocks] = useState<SpecificBlock[]>([])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch('/api/availability/blocks').then((r) => r.json()).then((data) => {
      if (data.weekly) {
        const updated = DAYS.map((_, dow) => {
          const block = data.weekly.find((b: { day_of_week: number }) => b.day_of_week === dow)
          if (block) {
            return { enabled: block.is_available, start_time: block.start_time, end_time: block.end_time, blockId: block.id }
          }
          return { ...DEFAULT_SCHEDULE }
        })
        setSchedule(updated)
      }
      if (data.specific) setSpecificBlocks(data.specific)
    }).catch(() => {})
  }, [])

  const handleSave = async () => {
    setSaving(true)
    const blocks = schedule.map((day, dow) => ({
      day_of_week: dow,
      start_time: day.start_time,
      end_time: day.end_time,
      is_available: day.enabled,
      specific_date: null,
    }))

    await fetch('/api/availability/blocks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ weekly: blocks, specific: specificBlocks }),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const addSpecificBlock = () => {
    setSpecificBlocks((prev) => [...prev, { specific_date: '', start_time: '00:00', end_time: '23:59', note: '' }])
  }

  const removeSpecificBlock = (idx: number) => {
    setSpecificBlocks((prev) => prev.filter((_, i) => i !== idx))
  }

  return (
    <div className="px-4 py-6">
      <h1 className="font-cormorant text-3xl font-semibold text-[#1a1a1a] mb-6">Availability</h1>

      <div className="space-y-2 mb-6">
        {DAYS.map((day, dow) => (
          <div key={day} className="bg-white border border-[#ede9e5] rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="font-medium text-sm text-[#1a1a1a]">{day}</span>
              <button
                onClick={() => setSchedule((prev) => {
                  const next = [...prev]
                  next[dow] = { ...next[dow], enabled: !next[dow].enabled }
                  return next
                })}
                className={`relative w-11 h-6 rounded-full transition-colors ${schedule[dow].enabled ? 'bg-[#ffabdd]' : 'bg-[#ede9e5]'}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${schedule[dow].enabled ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
            {schedule[dow].enabled && (
              <div className="flex items-center gap-2 text-sm">
                <input
                  type="time"
                  value={schedule[dow].start_time}
                  onChange={(e) => setSchedule((prev) => {
                    const next = [...prev]
                    next[dow] = { ...next[dow], start_time: e.target.value }
                    return next
                  })}
                  className="flex-1 bg-[#f7f5f3] border border-[#ede9e5] rounded-lg px-3 py-2 text-[#1a1a1a] focus:outline-none focus:border-[#ffabdd]"
                />
                <span className="text-[#b0a8a4]">to</span>
                <input
                  type="time"
                  value={schedule[dow].end_time}
                  onChange={(e) => setSchedule((prev) => {
                    const next = [...prev]
                    next[dow] = { ...next[dow], end_time: e.target.value }
                    return next
                  })}
                  className="flex-1 bg-[#f7f5f3] border border-[#ede9e5] rounded-lg px-3 py-2 text-[#1a1a1a] focus:outline-none focus:border-[#ffabdd]"
                />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <p className="font-semibold text-sm text-[#1a1a1a]">Blocked Dates</p>
          <button onClick={addSpecificBlock} className="flex items-center gap-1 text-[#c4658f] text-xs hover:underline">
            <Plus size={13} /> Add date
          </button>
        </div>
        {specificBlocks.length > 0 ? (
          <div className="space-y-2">
            {specificBlocks.map((block, idx) => (
              <div key={idx} className="bg-white border border-[#ede9e5] rounded-xl p-3 flex items-start gap-2">
                <div className="flex-1 space-y-2">
                  <input
                    type="date"
                    value={block.specific_date}
                    onChange={(e) => setSpecificBlocks((prev) => {
                      const next = [...prev]
                      next[idx] = { ...next[idx], specific_date: e.target.value }
                      return next
                    })}
                    className="input-field text-sm py-2"
                  />
                  <input
                    type="text"
                    placeholder="Note (optional)"
                    value={block.note}
                    onChange={(e) => setSpecificBlocks((prev) => {
                      const next = [...prev]
                      next[idx] = { ...next[idx], note: e.target.value }
                      return next
                    })}
                    className="input-field text-sm py-2"
                  />
                </div>
                <button onClick={() => removeSpecificBlock(idx)} className="p-1.5 text-[#b0a8a4] hover:text-red-500 mt-1">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[#b0a8a4] text-sm text-center py-4">No blocked dates</p>
        )}
      </div>

      <div className="bg-white border border-[#ede9e5] rounded-xl px-4 py-3 flex items-center justify-between mb-6">
        <div>
          <p className="text-sm font-medium text-[#1a1a1a]">Google Calendar</p>
          <p className="text-xs text-[#8a7f7a]">Sync your calendar to block booked times</p>
        </div>
        <span className="text-xs px-2 py-1 rounded-full bg-amber-50 text-amber-600 border border-amber-200">Configure in Settings</span>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full py-4 rounded-full bg-[#ffabdd] text-[#1a1a1a] font-semibold hover:bg-[#c4658f] hover:text-white transition-all disabled:opacity-50"
      >
        {saved ? '✓ Saved!' : saving ? 'Saving...' : 'Save availability'}
      </button>
    </div>
  )
}
