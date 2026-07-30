'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Upload, X, Clock, DollarSign, Check, Info } from 'lucide-react'

type Service = {
  id: string
  name: string
  description: string | null
  base_price: number | null
  duration_minutes: number
  requires_consultation: boolean
  hair_included: boolean
}

const STEP_NAMES = ['Choose Style', 'Preferred Date & Time', 'Your Info', 'Inspiration', 'Payment Preference']

const BRAID_STYLES = ['Knotless Braids', 'Traditional Box Braids', 'Boho / Goddess Braids', 'Goddess Ends', 'Island Braids', 'Passion Twists']
const PART_SHAPES = ['Square', 'Triangle', 'Diamond']

const PRESET_TIMES = [
  '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM',
  '6:00 PM', '7:00 PM', '8:00 PM',
]

export default function BookPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [services, setServices] = useState<Service[]>([])
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [clientName, setClientName] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [clientPhone, setClientPhone] = useState('')
  const [clientNotes, setClientNotes] = useState('')
  const [inspoFiles, setInspoFiles] = useState<File[]>([])
  const [paymentMethod, setPaymentMethod] = useState<string>('')
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [smsConsent, setSmsConsent] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [depositAmount, setDepositAmount] = useState(50)
  const [pendingService, setPendingService] = useState<Service | null>(null)
  const [braidStyle, setBraidStyle] = useState('')
  const [partShape, setPartShape] = useState('')
  const [modalBraidStyle, setModalBraidStyle] = useState('')
  const [modalPartShape, setModalPartShape] = useState('')

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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setInspoFiles((prev) => [...prev, ...files].slice(0, 5))
  }

  const removeFile = (index: number) => {
    setInspoFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    setSubmitError('')
    try {
      const formData = new FormData()
      formData.append('service_id', selectedService!.id)
      formData.append('appointment_date', selectedDate)
      formData.append('appointment_time', selectedTime)
      formData.append('client_name', clientName)
      formData.append('client_email', clientEmail)
      formData.append('client_phone', clientPhone)
      const styleDetails = [braidStyle && `Braid Style: ${braidStyle}`, partShape && `Part Shape: ${partShape}`].filter(Boolean).join('\n')
      formData.append('client_notes', [styleDetails, clientNotes].filter(Boolean).join('\n\n'))
      formData.append('payment_method', paymentMethod)
      formData.append('deposit_amount', String(depositAmount))
      inspoFiles.forEach((f) => formData.append('images', f))

      const res = await fetch('/api/bookings', { method: 'POST', body: formData })
      const data = await res.json()
      if (data.id) {
        router.push(`/book/confirmed?id=${data.id}&name=${encodeURIComponent(clientName)}&service=${encodeURIComponent(selectedService!.name)}&date=${selectedDate}&time=${encodeURIComponent(selectedTime)}&deposit=${depositAmount}&method=${paymentMethod}`)
      } else {
        setSubmitError(data.error || 'Something went wrong. Please try again.')
      }
    } catch {
      setSubmitError('Network error. Please check your connection and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const canProceed = () => {
    if (step === 1) return !!selectedService
    if (step === 2) return !!selectedDate && !!selectedTime
    if (step === 3) return clientName && clientEmail && clientPhone && smsConsent
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
              Brizee Bri Luxe <em className="italic text-[#ffabdd]">Hair Studio</em>
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

      {/* Request notice banner */}
      <div className="bg-[#fff8e1] border-b border-[#ffe082] px-4 py-2 max-w-lg mx-auto">
        <div className="flex items-start gap-2 max-w-lg mx-auto">
          <Info size={14} className="text-[#f59e0b] mt-0.5 flex-shrink-0" />
          <p className="text-xs text-[#92400e]">
            This is a <strong>booking request</strong> — not a confirmed appointment. Bri will review and reach out within 24 hours.
          </p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 pb-28">
        {/* Step 1: Choose Style */}
        {step === 1 && (
          <div>
            <h2 className="font-cormorant text-3xl font-semibold text-[#1a1a1a] mb-4">Choose a Style</h2>
            <div className="grid grid-cols-2 gap-2">
              {services.map((svc) => {
                const isParts = svc.name.toLowerCase().includes('parts')
                const isSelected = selectedService?.id === svc.id
                return (
                  <button
                    key={svc.id}
                    onClick={() => {
                      if (isParts) {
                        setModalBraidStyle(isSelected ? braidStyle : '')
                        setModalPartShape(isSelected ? partShape : '')
                        setPendingService(svc)
                      } else {
                        setSelectedService(svc)
                        setBraidStyle('')
                        setPartShape('')
                      }
                    }}
                    className={`text-left p-3 rounded-2xl border transition-all duration-200 relative ${
                      isSelected
                        ? 'border-[#ffabdd] bg-[#fff0f8]'
                        : 'border-[#ede9e5] bg-white hover:border-[#ffabdd]/50'
                    }`}
                  >
                    {isSelected && (
                      <Check size={14} className="text-[#ffabdd] absolute top-2.5 right-2.5" />
                    )}
                    <p className="font-semibold text-[#1a1a1a] text-sm leading-tight pr-5">{svc.name}</p>
                    <div className="flex items-center gap-1 mt-1.5 text-[10px] text-[#b0a8a4]">
                      <Clock size={9} />
                      {svc.duration_minutes < 60
                        ? `${svc.duration_minutes}m`
                        : `${Math.floor(svc.duration_minutes / 60)}–${Math.floor(svc.duration_minutes / 60) + 1}h`}
                      {svc.hair_included && <span className="ml-1">· Hair incl.</span>}
                    </div>
                    <div className="mt-1.5">
                      {svc.requires_consultation ? (
                        <span className="text-[10px] text-[#8a7f7a]">Consultation</span>
                      ) : svc.base_price ? (
                        <span className="text-sm font-semibold text-[#c4658f]">${svc.base_price}</span>
                      ) : null}
                    </div>
                    {isSelected && braidStyle && (
                      <p className="text-[10px] text-[#c4658f] mt-1.5 font-medium">
                        {braidStyle}{partShape ? ` · ${partShape}` : ''}
                      </p>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Step 2: Preferred Date & Time */}
        {step === 2 && (
          <div>
            <h2 className="font-cormorant text-3xl font-semibold text-[#1a1a1a] mb-2">Preferred Date</h2>
            <p className="text-sm text-[#8a7f7a] mb-5">
              Pick your ideal date and time. Bri will confirm or suggest alternatives after reviewing your request.
            </p>
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
                  const isPast = dayDate <= today
                  const isSelected = selectedDate === dateStr
                  return (
                    <button
                      key={idx}
                      disabled={isPast}
                      onClick={() => { setSelectedDate(dateStr); setSelectedTime('') }}
                      className={`aspect-square rounded-full flex items-center justify-center text-sm transition-all duration-150 ${
                        isSelected
                          ? 'bg-[#ffabdd] text-[#1a1a1a] font-semibold'
                          : isPast
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
                <p className="font-semibold mb-3 text-sm text-[#8a7f7a] uppercase tracking-wider">Preferred time</p>
                <div className="grid grid-cols-3 gap-2">
                  {PRESET_TIMES.map((time) => (
                    <button
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className={`py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                        selectedTime === time
                          ? 'bg-[#ffabdd] text-[#1a1a1a]'
                          : 'border border-[#ffabdd]/50 text-[#c4658f] hover:bg-[#fff0f8] bg-white'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
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
              <div className="flex items-start gap-3 p-4 bg-[#fff8e1] border border-[#ffe082] rounded-2xl">
                <input
                  type="checkbox"
                  id="smsConsent"
                  checked={smsConsent}
                  onChange={(e) => setSmsConsent(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-[#c4658f] flex-shrink-0 cursor-pointer"
                />
                <label htmlFor="smsConsent" className="text-xs text-[#92400e] leading-relaxed cursor-pointer">
                  By providing my phone number, I agree to receive appointment-related text messages from Brizee Bri Luxe Hair Studio. Reply STOP to opt out. Msg & data rates may apply.{' '}
                  <a href="/privacy" target="_blank" rel="noopener noreferrer" className="underline font-medium">Privacy Policy</a>
                  {' & '}
                  <a href="/terms" target="_blank" rel="noopener noreferrer" className="underline font-medium">Terms</a>.
                </label>
              </div>

              <div>
                <label className="block text-xs text-[#8a7f7a] mb-1.5 uppercase tracking-wider">Notes for Bri (optional)</label>
                <textarea
                  className="input-field min-h-[100px] resize-none"
                  placeholder="Hair length, texture, any special requests or questions..."
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

        {/* Step 5: Payment Preference */}
        {step === 5 && (
          <div>
            <h2 className="font-cormorant text-3xl font-semibold text-[#1a1a1a] mb-2">Payment Preference</h2>
            <p className="text-sm text-[#8a7f7a] mb-5">
              How would you like to pay your deposit once Bri approves your request?
            </p>
            <div className="bg-white border border-[#ede9e5] rounded-2xl p-5 mb-6 text-center">
              <p className="text-xs text-[#8a7f7a] uppercase tracking-wider mb-1">Estimated Deposit</p>
              <p className="text-4xl font-bold text-[#c4658f]">${depositAmount.toFixed(2)}</p>
              <p className="text-xs text-[#b0a8a4] mt-1">Due only after Bri approves your request</p>
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
            <div className="bg-white border border-[#ede9e5] rounded-2xl p-4 text-sm space-y-2">
              <p className="text-[#8a7f7a] text-xs uppercase tracking-wider mb-2">Request Summary</p>
              <div className="flex justify-between">
                <span className="text-[#8a7f7a]">Service</span>
                <span className="font-medium text-[#1a1a1a]">{selectedService?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8a7f7a]">Preferred Date</span>
                <span className="font-medium text-[#1a1a1a]">
                  {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8a7f7a]">Preferred Time</span>
                <span className="font-medium text-[#1a1a1a]">{selectedTime}</span>
              </div>
              <div className="flex justify-between border-t border-[#ede9e5] pt-2 mt-2">
                <span className="text-[#8a7f7a]">Est. Deposit</span>
                <span className="font-semibold text-[#c4658f]">${depositAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Sticky bottom action */}
      <div className="fixed bottom-0 left-0 right-0 z-20 px-4 pb-6 pt-3 bg-gradient-to-t from-[#f7f5f3] via-[#f7f5f3]/95 to-transparent">
        <div className="max-w-lg mx-auto">
          {submitError && (
            <p className="text-red-500 text-sm text-center mb-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              {submitError}
            </p>
          )}
          {step < 5 ? (
            <button
              disabled={!canProceed()}
              onClick={() => setStep((s) => s + 1)}
              className="w-full py-4 rounded-full font-semibold transition-all duration-200 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed bg-[#1a1a1a] text-white hover:bg-[#ffabdd] hover:text-[#1a1a1a] shadow-lg"
            >
              Continue →
            </button>
          ) : (
            <button
              disabled={!canProceed() || submitting}
              onClick={handleSubmit}
              className="w-full py-4 rounded-full font-semibold transition-all duration-200 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed bg-[#ffabdd] text-[#1a1a1a] hover:bg-[#c4658f] hover:text-white shadow-lg"
            >
              {submitting ? 'Submitting...' : 'Submit Request →'}
            </button>
          )}
        </div>
      </div>

      {/* Braid style + part shape modal */}
      {pendingService && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/50" onClick={() => setPendingService(null)}>
          <div
            className="w-full bg-white rounded-t-3xl px-5 pt-4 pb-8 max-w-lg mx-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-[#ede9e5] rounded-full mx-auto mb-5" />
            <p className="font-cormorant text-xl font-semibold text-[#1a1a1a] mb-0.5">{pendingService.name}</p>
            <p className="text-[11px] text-[#b0a8a4] uppercase tracking-widest mb-5">Customize your style</p>

            <p className="text-sm font-semibold text-[#1a1a1a] mb-2.5">Braid Style</p>
            <div className="flex flex-wrap gap-2 mb-5">
              {BRAID_STYLES.map((s) => (
                <button
                  key={s}
                  onClick={() => setModalBraidStyle(s)}
                  className={`px-3 py-2 rounded-full text-sm border transition-all ${
                    modalBraidStyle === s
                      ? 'border-[#ffabdd] bg-[#fff0f8] text-[#c4658f] font-medium'
                      : 'border-[#ede9e5] text-[#1a1a1a]'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            <p className="text-sm font-semibold text-[#1a1a1a] mb-2.5">Part Shape</p>
            <div className="flex gap-2 mb-6">
              {PART_SHAPES.map((shape) => (
                <button
                  key={shape}
                  onClick={() => setModalPartShape(shape)}
                  className={`flex-1 py-3 rounded-xl border text-sm transition-all ${
                    modalPartShape === shape
                      ? 'border-[#ffabdd] bg-[#fff0f8] text-[#c4658f] font-medium'
                      : 'border-[#ede9e5] text-[#1a1a1a]'
                  }`}
                >
                  {shape}
                </button>
              ))}
            </div>

            <button
              disabled={!modalBraidStyle || !modalPartShape}
              onClick={() => {
                setSelectedService(pendingService)
                setBraidStyle(modalBraidStyle)
                setPartShape(modalPartShape)
                setPendingService(null)
              }}
              className="w-full py-4 rounded-full bg-[#1a1a1a] text-white font-semibold disabled:opacity-40 transition-all active:scale-95"
            >
              Select →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
