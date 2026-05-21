'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Upload, X, Clock, DollarSign, Check } from 'lucide-react'

type Service = {
  id: string
  name: string
  description: string | null
  base_price: number | null
  duration_minutes: number
  requires_consultation: boolean
  hair_included: boolean
}

type TimeSlot = { time: string; available: boolean }

const STEP_NAMES = ['Choose Style', 'Date & Time', 'Your Info', 'Inspiration', 'Payment']

export default function BookPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [services, setServices] = useState<Service[]>([])
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [availableDays, setAvailableDays] = useState<Set<string>>(new Set())
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [clientName, setClientName] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [clientPhone, setClientPhone] = useState('')
  const [clientNotes, setClientNotes] = useState('')
  const [inspoFiles, setInspoFiles] = useState<File[]>([])
  const [paymentMethod, setPaymentMethod] = useState<string>('')
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [depositAmount, setDepositAmount] = useState(50)

  useEffect(() => {
    fetch('/api/services')
      .then((r) => r.ok ? r.json() : [])
      .then((data) => setServices(Array.isArray(data) ? data : []))
    fetch('/api/settings')
      .then((r) => r.ok ? r.json() : {})
      .then((data: Record<string, string>) => {
        setSettings(data || {})
        const depositType = data?.deposit_type || 'flat'
        const depositValue = parseFloat(data?.deposit_value || '50')
        if (depositType === 'flat') setDepositAmount(depositValue)
      })
  }, [])

  useEffect(() => {
    if (selectedService && settings.deposit_type) {
      const depositType = settings.deposit_type
      const depositValue = parseFloat(settings.deposit_value || '50')
      if (depositType === 'percentage' && selectedService.base_price) {
        setDepositAmount((selectedService.base_price * depositValue) / 100)
      } else {
        setDepositAmount(depositValue)
      }
    }
  }, [selectedService, settings])

  const fetchAvailableDays = useCallback(async (month: Date) => {
    const monthStr = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}`
    const res = await fetch(`/api/availability?month=${monthStr}`)
    const data = await res.json()
    setAvailableDays(new Set(data.availableDays || []))
  }, [])

  useEffect(() => {
    fetchAvailableDays(currentMonth)
  }, [currentMonth, fetchAvailableDays])

  const fetchTimeSlots = async (date: string) => {
    setLoadingSlots(true)
    const res = await fetch(`/api/availability?date=${date}`)
    const data = await res.json()
    setTimeSlots(data.slots || [])
    setLoadingSlots(false)
  }

  const handleDateSelect = (dateStr: string) => {
    setSelectedDate(dateStr)
    setSelectedTime('')
    fetchTimeSlots(dateStr)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setInspoFiles((prev) => [...prev, ...files].slice(0, 5))
  }

  const removeFile = (index: number) => {
    setInspoFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('service_id', selectedService!.id)
      formData.append('appointment_date', selectedDate)
      formData.append('appointment_time', selectedTime)
      formData.append('client_name', clientName)
      formData.append('client_email', clientEmail)
      formData.append('client_phone', clientPhone)
      formData.append('client_notes', clientNotes)
      formData.append('payment_method', paymentMethod)
      formData.append('deposit_amount', String(depositAmount))
      inspoFiles.forEach((f) => formData.append('images', f))

      const res = await fetch('/api/bookings', { method: 'POST', body: formData })
      const data = await res.json()
      if (data.id) {
        router.push(`/book/confirmed?id=${data.id}&name=${encodeURIComponent(clientName)}&service=${encodeURIComponent(selectedService!.name)}&date=${selectedDate}&time=${encodeURIComponent(selectedTime)}&deposit=${depositAmount}&method=${paymentMethod}`)
      }
    } finally {
      setSubmitting(false)
    }
  }

  const canProceed = () => {
    if (step === 1) return !!selectedService
    if (step === 2) return !!selectedDate && !!selectedTime
    if (step === 3) return clientName && clientEmail && clientPhone
    if (step === 4) return !selectedService?.requires_consultation || inspoFiles.length > 0
    if (step === 5) return !!paymentMethod
    return false
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const days: (number | null)[] = Array(firstDay).fill(null)
    for (let d = 1; d <= daysInMonth; d++) days.push(d)
    return days
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return (
    <div className="min-h-screen bg-[#f7f5f3] font-sans">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 bg-white border-b border-[#ede9e5] px-4 py-3">
        <div className="flex items-center gap-3 max-w-lg mx-auto">
          {step > 1 && (
            <button
              onClick={() => setStep((s) => s - 1)}
              className="p-2 rounded-full hover:bg-[#f7f5f3] transition-colors -ml-2"
            >
              <ChevronLeft size={20} className="text-[#1a1a1a]" />
            </button>
          )}
          <div className="flex-1">
            <p className="font-cormorant text-lg leading-tight text-[#1a1a1a]">
              Braids by <em className="italic text-[#ffabdd]">Brizee Bri</em>
            </p>
            <p className="text-[10px] uppercase tracking-widest text-[#8a7f7a]">{STEP_NAMES[step - 1]}</p>
          </div>
          {step === 1 && (
            <button
              onClick={() => router.push('/')}
              className="text-[#b0a8a4] hover:text-[#1a1a1a] text-sm transition-colors"
            >
              ✕
            </button>
          )}
        </div>
        <div className="flex gap-1.5 mt-3 max-w-lg mx-auto">
          {STEP_NAMES.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                i + 1 < step ? 'bg-[#ffabdd]' : i + 1 === step ? 'bg-[#ffabdd]/60' : 'bg-[#ede9e5]'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Step 1: Choose Style */}
        {step === 1 && (
          <div>
            <h2 className="font-cormorant text-3xl font-semibold text-[#1a1a1a] mb-6">Choose a Style</h2>
            <div className="grid grid-cols-1 gap-3">
              {services.map((svc) => (
                <button
                  key={svc.id}
                  onClick={() => setSelectedService(svc)}
                  className={`text-left p-4 rounded-2xl border transition-all duration-200 ${
                    selectedService?.id === svc.id
                      ? 'border-[#ffabdd] bg-[#fff0f8]'
                      : 'border-[#ede9e5] bg-white hover:border-[#ffabdd]/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <p className="font-semibold text-[#1a1a1a]">{svc.name}</p>
                      {svc.description && (
                        <p className="text-[#8a7f7a] text-sm mt-0.5">{svc.description}</p>
                      )}
                      <div className="flex items-center gap-3 mt-2 text-xs text-[#b0a8a4]">
                        <span className="flex items-center gap-1">
                          <Clock size={11} />
                          {svc.duration_minutes < 60
                            ? `${svc.duration_minutes}m`
                            : `${Math.floor(svc.duration_minutes / 60)}–${Math.floor(svc.duration_minutes / 60) + 1}h`}
                        </span>
                        {svc.hair_included && <span>Hair included</span>}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      {svc.requires_consultation ? (
                        <span className="text-xs px-2 py-1 rounded-full bg-[#f7f5f3] text-[#8a7f7a] border border-[#ede9e5]">
                          Consultation
                        </span>
                      ) : svc.base_price ? (
                        <span className="font-semibold text-[#c4658f] flex items-center gap-0.5">
                          <DollarSign size={13} />{svc.base_price}
                        </span>
                      ) : null}
                    </div>
                  </div>
                  {selectedService?.id === svc.id && (
                    <div className="mt-2 flex justify-end">
                      <Check size={16} className="text-[#ffabdd]" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Date & Time */}
        {step === 2 && (
          <div>
            <h2 className="font-cormorant text-3xl font-semibold text-[#1a1a1a] mb-6">Pick a Date</h2>
            <div className="bg-white border border-[#ede9e5] rounded-2xl p-4 mb-4">
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                  className="p-2 rounded-full hover:bg-[#f7f5f3] transition-colors"
                >
                  <ChevronLeft size={18} className="text-[#1a1a1a]" />
                </button>
                <p className="font-semibold text-[#1a1a1a]">
                  {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </p>
                <button
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                  className="p-2 rounded-full hover:bg-[#f7f5f3] transition-colors rotate-180"
                >
                  <ChevronLeft size={18} className="text-[#1a1a1a]" />
                </button>
              </div>
              <div className="grid grid-cols-7 mb-2">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
                  <div key={d} className="text-center text-xs text-[#b0a8a4] py-1">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {getDaysInMonth(currentMonth).map((day, idx) => {
                  if (!day) return <div key={idx} />
                  const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                  const dayDate = new Date(dateStr + 'T12:00:00')
                  const isPast = dayDate < today
                  const isAvailable = availableDays.has(dateStr)
                  const isSelected = selectedDate === dateStr
                  return (
                    <button
                      key={idx}
                      disabled={isPast || !isAvailable}
                      onClick={() => handleDateSelect(dateStr)}
                      className={`aspect-square rounded-full flex items-center justify-center text-sm transition-all duration-150 ${
                        isSelected
                          ? 'bg-[#ffabdd] text-[#1a1a1a] font-semibold'
                          : isPast || !isAvailable
                          ? 'text-[#d4cdc9] cursor-not-allowed'
                          : 'hover:bg-[#fff0f8] text-[#1a1a1a] cursor-pointer'
                      }`}
                    >
                      {day}
                    </button>
                  )
                })}
              </div>
            </div>
            {selectedDate && (
              <div>
                <p className="font-semibold mb-3 text-sm text-[#8a7f7a] uppercase tracking-wider">Available times</p>
                {loadingSlots ? (
                  <div className="grid grid-cols-3 gap-2">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="h-10 rounded-xl bg-[#ede9e5] animate-pulse" />
                    ))}
                  </div>
                ) : timeSlots.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2">
                    {timeSlots.map((slot) => (
                      <button
                        key={slot.time}
                        disabled={!slot.available}
                        onClick={() => setSelectedTime(slot.time)}
                        className={`py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                          !slot.available
                            ? 'line-through text-[#d4cdc9] cursor-not-allowed bg-[#f7f5f3]'
                            : selectedTime === slot.time
                            ? 'bg-[#ffabdd] text-[#1a1a1a]'
                            : 'border border-[#ffabdd]/50 text-[#c4658f] hover:bg-[#fff0f8] bg-white'
                        }`}
                      >
                        {slot.time}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-[#b0a8a4] text-sm">No available times for this day.</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Step 3: Your Info */}
        {step === 3 && (
          <div>
            <h2 className="font-cormorant text-3xl font-semibold text-[#1a1a1a] mb-6">Your Info</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-[#8a7f7a] mb-1.5 uppercase tracking-wider">Full Name *</label>
                <input className="input-field" placeholder="Your name" value={clientName} onChange={(e) => setClientName(e.target.value)} />
              </div>
              <div>
                <label className="block text-xs text-[#8a7f7a] mb-1.5 uppercase tracking-wider">Email *</label>
                <input className="input-field" type="email" placeholder="your@email.com" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} />
              </div>
              <div>
                <label className="block text-xs text-[#8a7f7a] mb-1.5 uppercase tracking-wider">Phone *</label>
                <input className="input-field" type="tel" placeholder="(555) 000-0000" value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} />
              </div>
              <div>
                <label className="block text-xs text-[#8a7f7a] mb-1.5 uppercase tracking-wider">Notes for Bri (optional)</label>
                <textarea
                  className="input-field min-h-[100px] resize-none"
                  placeholder="Any special requests, hair length, concerns..."
                  value={clientNotes}
                  onChange={(e) => setClientNotes(e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Inspiration */}
        {step === 4 && (
          <div>
            <h2 className="font-cormorant text-3xl font-semibold text-[#1a1a1a] mb-4">Style Inspiration</h2>
            {selectedService?.requires_consultation && (
              <div className="mb-5 px-4 py-3 rounded-xl bg-[#fff0f8] border border-[#ffabdd]/40 text-sm text-[#c4658f]">
                ✦ Bri will review your photos and send a final price quote before your appointment is confirmed.
              </div>
            )}
            <label className="block cursor-pointer">
              <input type="file" accept="image/*" multiple className="hidden" onChange={handleFileUpload} />
              <div className="border-2 border-dashed border-[#ede9e5] rounded-2xl p-8 text-center hover:border-[#ffabdd]/50 bg-white transition-colors">
                <Upload size={28} className="mx-auto mb-3 text-[#c4658f]" />
                <p className="font-medium text-[#1a1a1a]">Tap to upload photos</p>
                <p className="text-xs text-[#b0a8a4] mt-1">Up to 5 images</p>
              </div>
            </label>
            {inspoFiles.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-4">
                {inspoFiles.map((file, idx) => (
                  <div key={idx} className="relative aspect-square rounded-xl overflow-hidden">
                    <Image src={URL.createObjectURL(file)} alt="" fill className="object-cover" />
                    <button
                      onClick={() => removeFile(idx)}
                      className="absolute top-1 right-1 w-6 h-6 rounded-full bg-white/90 flex items-center justify-center hover:bg-white shadow-sm"
                    >
                      <X size={12} className="text-[#1a1a1a]" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {!selectedService?.requires_consultation && inspoFiles.length === 0 && (
              <p className="text-[#b0a8a4] text-sm text-center mt-4">Inspiration photos are optional but encouraged!</p>
            )}
          </div>
        )}

        {/* Step 5: Payment */}
        {step === 5 && (
          <div>
            <h2 className="font-cormorant text-3xl font-semibold text-[#1a1a1a] mb-6">Payment</h2>
            <div className="bg-white border border-[#ede9e5] rounded-2xl p-5 mb-6 text-center">
              <p className="text-xs text-[#8a7f7a] uppercase tracking-wider mb-1">Deposit Required</p>
              <p className="text-4xl font-bold text-[#c4658f]">${depositAmount.toFixed(2)}</p>
              <p className="text-xs text-[#b0a8a4] mt-1">Secures your appointment</p>
            </div>
            <p className="text-sm text-[#8a7f7a] mb-3">Select payment method</p>
            <div className="space-y-2 mb-6">
              {settings.stripe_enabled === 'true' && (
                <button
                  onClick={() => setPaymentMethod('stripe')}
                  className={`w-full text-left p-4 rounded-2xl border transition-all ${
                    paymentMethod === 'stripe' ? 'border-[#ffabdd] bg-[#fff0f8]' : 'border-[#ede9e5] bg-white hover:border-[#ffabdd]/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-[#1a1a1a]">Credit / Debit Card</p>
                      <p className="text-xs text-[#8a7f7a]">Secure payment via Stripe</p>
                    </div>
                    {paymentMethod === 'stripe' && <Check size={16} className="text-[#ffabdd]" />}
                  </div>
                </button>
              )}
              {settings.cashapp_enabled === 'true' && (
                <button
                  onClick={() => setPaymentMethod('cashapp')}
                  className={`w-full text-left p-4 rounded-2xl border transition-all ${
                    paymentMethod === 'cashapp' ? 'border-[#ffabdd] bg-[#fff0f8]' : 'border-[#ede9e5] bg-white hover:border-[#ffabdd]/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-[#1a1a1a]">CashApp</p>
                      <p className="text-xs text-[#8a7f7a]">{settings.cashapp_handle || '$BrizeeBri'}</p>
                    </div>
                    {paymentMethod === 'cashapp' && <Check size={16} className="text-[#ffabdd]" />}
                  </div>
                </button>
              )}
              {settings.zelle_enabled === 'true' && settings.zelle_contact && (
                <button
                  onClick={() => setPaymentMethod('zelle')}
                  className={`w-full text-left p-4 rounded-2xl border transition-all ${
                    paymentMethod === 'zelle' ? 'border-[#ffabdd] bg-[#fff0f8]' : 'border-[#ede9e5] bg-white hover:border-[#ffabdd]/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-[#1a1a1a]">Zelle</p>
                      <p className="text-xs text-[#8a7f7a]">{settings.zelle_contact}</p>
                    </div>
                    {paymentMethod === 'zelle' && <Check size={16} className="text-[#ffabdd]" />}
                  </div>
                </button>
              )}
            </div>
            {['cashapp', 'zelle', 'applepay'].includes(paymentMethod) && (
              <div className="p-4 rounded-xl bg-[#fff0f8] border border-[#ffabdd]/40 text-sm mb-4">
                <p className="font-semibold text-[#c4658f] mb-1">How to pay your deposit</p>
                {paymentMethod === 'cashapp' && (
                  <p className="text-[#6b6460]">
                    Send ${depositAmount.toFixed(2)} to <strong>{settings.cashapp_handle || '$BrizeeBri'}</strong> on CashApp. Bri will confirm once received.
                  </p>
                )}
                {paymentMethod === 'zelle' && (
                  <p className="text-[#6b6460]">
                    Send ${depositAmount.toFixed(2)} to <strong>{settings.zelle_contact}</strong> via Zelle. Bri will confirm once received.
                  </p>
                )}
              </div>
            )}
            <div className="bg-white border border-[#ede9e5] rounded-2xl p-4 text-sm space-y-2">
              <p className="text-[#8a7f7a] text-xs uppercase tracking-wider mb-2">Booking Summary</p>
              <div className="flex justify-between">
                <span className="text-[#8a7f7a]">Service</span>
                <span className="font-medium text-[#1a1a1a]">{selectedService?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8a7f7a]">Date</span>
                <span className="font-medium text-[#1a1a1a]">
                  {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8a7f7a]">Time</span>
                <span className="font-medium text-[#1a1a1a]">{selectedTime}</span>
              </div>
              <div className="flex justify-between border-t border-[#ede9e5] pt-2 mt-2">
                <span className="text-[#8a7f7a]">Deposit</span>
                <span className="font-semibold text-[#c4658f]">${depositAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 pb-8">
          {step < 5 ? (
            <button
              disabled={!canProceed()}
              onClick={() => setStep((s) => s + 1)}
              className="w-full py-4 rounded-full font-semibold transition-all duration-200 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed bg-[#1a1a1a] text-white hover:bg-[#ffabdd] hover:text-[#1a1a1a]"
            >
              Continue →
            </button>
          ) : (
            <button
              disabled={!canProceed() || submitting}
              onClick={handleSubmit}
              className="w-full py-4 rounded-full font-semibold transition-all duration-200 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed bg-[#ffabdd] text-[#1a1a1a] hover:bg-[#c4658f] hover:text-white"
            >
              {submitting ? 'Booking...' : 'Complete booking →'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
