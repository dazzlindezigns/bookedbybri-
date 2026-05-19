'use client'

import { useEffect, useState } from 'react'

interface TimeSlotsProps {
  date: string
  selectedTime: string | null
  onTimeSelect: (time: string) => void
  serviceDuration: number
}

interface TimeSlot {
  time: string
  available: boolean
  displayTime: string
}

export default function TimeSlots({ date, selectedTime, onTimeSelect, serviceDuration }: TimeSlotsProps) {
  const [slots, setSlots] = useState<TimeSlot[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!date) return
    setLoading(true)
    fetch(`/api/availability?date=${date}&duration=${serviceDuration}`)
      .then((r) => r.json())
      .then((data) => {
        setSlots(data.slots || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [date, serviceDuration])

  if (loading) {
    return (
      <div className="grid grid-cols-3 gap-2">
        {[...Array(9)].map((_, i) => (
          <div key={i} className="h-10 rounded-xl bg-[#2a2a2a] animate-pulse" />
        ))}
      </div>
    )
  }

  if (slots.length === 0) {
    return (
      <div className="text-center py-8 text-white/40 text-sm">
        <p>No available times on this date.</p>
        <p className="text-xs mt-1">Please select a different day.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-3 gap-2">
      {slots.map((slot) => {
        const isSelected = selectedTime === slot.time
        const isUnavailable = !slot.available

        return (
          <button
            key={slot.time}
            disabled={isUnavailable}
            onClick={() => onTimeSelect(slot.time)}
            className={`
              h-10 rounded-xl text-sm font-medium transition-all duration-150 border
              ${isSelected ? 'bg-[#ffabdd] text-[#1a1a1a] border-[#ffabdd] shadow-lg shadow-[#ffabdd]/20' : ''}
              ${!isSelected && !isUnavailable ? 'border-[#ffabdd]/40 text-[#ffabdd] hover:bg-[#ffabdd]/10' : ''}
              ${isUnavailable ? 'border-[#3a3a3a] text-white/20 line-through cursor-not-allowed' : ''}
            `}
          >
            {slot.displayTime}
          </button>
        )
      })}
    </div>
  )
}
