'use client'

import { useState, useEffect } from 'react'

interface CalendarProps {
  selectedDate: string | null
  onDateSelect: (date: string) => void
  month: string // YYYY-MM
  onMonthChange: (month: string) => void
}

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

export default function Calendar({ selectedDate, onDateSelect, month, onMonthChange }: CalendarProps) {
  const [availableDays, setAvailableDays] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(true)

  const [year, monthNum] = month.split('-').map(Number)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/availability?month=${month}`)
      .then((r) => r.json())
      .then((data) => {
        setAvailableDays(data.availableDays || {})
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [month])

  const firstDay = new Date(year, monthNum - 1, 1).getDay()
  const daysInMonth = new Date(year, monthNum, 0).getDate()
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const prevMonth = () => {
    const d = new Date(year, monthNum - 2, 1)
    onMonthChange(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
  }

  const nextMonth = () => {
    const d = new Date(year, monthNum, 1)
    onMonthChange(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
  }

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  return (
    <div className="bg-[#222] border border-[#3a3a3a] rounded-2xl p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors text-white/60 hover:text-white"
        >
          ‹
        </button>
        <h3 className="font-cormorant text-lg font-semibold text-white">
          {MONTHS[monthNum - 1]} {year}
        </h3>
        <button
          onClick={nextMonth}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors text-white/60 hover:text-white"
        >
          ›
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-2">
        {DAYS.map((d) => (
          <div key={d} className="text-center text-xs text-white/30 font-medium py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((day, i) => {
          if (!day) return <div key={`empty-${i}`} />

          const dateStr = `${year}-${String(monthNum).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          const date = new Date(year, monthNum - 1, day)
          const isPast = date < today
          const isAvailable = !loading && availableDays[dateStr] === true
          const isSelected = selectedDate === dateStr
          const isToday = date.getTime() === today.getTime()

          return (
            <button
              key={day}
              disabled={isPast || !isAvailable || loading}
              onClick={() => onDateSelect(dateStr)}
              className={`
                h-9 w-full rounded-lg text-sm font-medium transition-all duration-150 flex items-center justify-center relative
                ${isSelected ? 'bg-[#ffabdd] text-[#1a1a1a] shadow-lg shadow-[#ffabdd]/30' : ''}
                ${!isSelected && isAvailable && !isPast ? 'text-white hover:bg-[#ffabdd]/20 hover:text-[#ffabdd] cursor-pointer' : ''}
                ${(!isAvailable || isPast) && !isSelected ? 'text-white/20 cursor-not-allowed' : ''}
                ${loading ? 'animate-pulse' : ''}
              `}
            >
              {day}
              {isToday && !isSelected && (
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#ffabdd]" />
              )}
            </button>
          )
        })}
      </div>

      {loading && (
        <p className="text-center text-white/30 text-xs mt-3">Loading availability...</p>
      )}
    </div>
  )
}
