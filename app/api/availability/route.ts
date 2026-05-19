import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase'
import { getCalendarEvents } from '@/lib/google'

function generateSlots(start: string, end: string, intervalMinutes = 60): string[] {
  const slots: string[] = []
  const [startH, startM] = start.split(':').map(Number)
  const [endH, endM] = end.split(':').map(Number)
  let current = startH * 60 + startM
  const endTotal = endH * 60 + endM

  while (current + intervalMinutes <= endTotal) {
    const h = Math.floor(current / 60)
    const m = current % 60
    const ampm = h < 12 ? 'AM' : 'PM'
    const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h
    slots.push(`${hour12}:${String(m).padStart(2, '0')} ${ampm}`)
    current += intervalMinutes
  }
  return slots
}

function timeToMinutes(t: string): number {
  const lower = t.toLowerCase()
  const isPm = lower.includes('pm')
  const isAm = lower.includes('am')
  const cleaned = lower.replace(/[apm\s]/g, '')
  const [h, m] = cleaned.split(':').map(Number)
  let hours = h
  if (isPm && h !== 12) hours += 12
  if (isAm && h === 12) hours = 0
  return hours * 60 + (m || 0)
}

export async function GET(req: NextRequest) {
  const sb = createSupabaseAdminClient()
  const { searchParams } = req.nextUrl
  const date = searchParams.get('date')
  const month = searchParams.get('month')

  if (month) {
    const [year, mon] = month.split('-').map(Number)
    const daysInMonth = new Date(year, mon, 0).getDate()
    const availableDays: string[] = []

    const { data: blocks } = await sb
      .from('availability_blocks')
      .select('*')
      .not('day_of_week', 'is', null)
      .eq('is_available', true)

    const { data: specificBlocks } = await sb
      .from('availability_blocks')
      .select('*')
      .not('specific_date', 'is', null)

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(mon).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      const dayDate = new Date(dateStr + 'T12:00:00')
      if (dayDate <= today) continue

      const dow = dayDate.getDay()
      const isWeeklyAvailable = blocks?.some((b) => b.day_of_week === dow)
      const isSpecificallyBlocked = specificBlocks?.some((b) => b.specific_date === dateStr && !b.is_available)

      if (isWeeklyAvailable && !isSpecificallyBlocked) {
        availableDays.push(dateStr)
      }
    }

    return NextResponse.json({ availableDays })
  }

  if (date) {
    const dayDate = new Date(date + 'T12:00:00')
    const dow = dayDate.getDay()

    const { data: block } = await sb
      .from('availability_blocks')
      .select('*')
      .eq('day_of_week', dow)
      .eq('is_available', true)
      .maybeSingle()

    if (!block) return NextResponse.json({ slots: [] })

    const allSlots = generateSlots(block.start_time, block.end_time)

    const { data: existingBookings } = await sb
      .from('bookings')
      .select('appointment_time')
      .eq('appointment_date', date)
      .not('status', 'in', '("cancelled","declined")')

    const bookedTimes = new Set(existingBookings?.map((b) => b.appointment_time) || [])

    let gcalBlockedMinutes: Array<{ start: number; end: number }> = []

    try {
      const { data: settings } = await sb
        .from('admin_settings')
        .select('value')
        .eq('key', 'google_refresh_token')
        .maybeSingle()

      if (settings?.value) {
        const events = await getCalendarEvents(settings.value, date)
        gcalBlockedMinutes = events
          .filter((e) => e.start?.dateTime)
          .map((e) => {
            const start = new Date(e.start!.dateTime!)
            const end = new Date(e.end!.dateTime!)
            return {
              start: start.getHours() * 60 + start.getMinutes(),
              end: end.getHours() * 60 + end.getMinutes(),
            }
          })
      }
    } catch {
      // Google Calendar not configured — skip
    }

    const slots = allSlots.map((time) => {
      const slotMinutes = timeToMinutes(time)
      const isBookingConflict = bookedTimes.has(time)
      const isGcalConflict = gcalBlockedMinutes.some(
        (b) => slotMinutes >= b.start && slotMinutes < b.end
      )
      return { time, available: !isBookingConflict && !isGcalConflict }
    })

    return NextResponse.json({ slots })
  }

  return NextResponse.json({ error: 'Missing date or month param' }, { status: 400 })
}
