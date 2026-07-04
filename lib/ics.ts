function parseTime(date: string, time: string, durationMinutes: number) {
  // time format: "10:00 AM" or "2:30 PM"
  const [timePart, period] = time.split(' ')
  const [h, m] = timePart.split(':').map(Number)
  let hour = h
  if (period === 'PM' && h !== 12) hour += 12
  if (period === 'AM' && h === 12) hour = 0

  const pad = (n: number) => String(n).padStart(2, '0')
  const endTotalMins = hour * 60 + m + durationMinutes
  const endHour = Math.floor(endTotalMins / 60) % 24
  const endMin = endTotalMins % 60

  const d = date.replace(/-/g, '')
  return {
    // Local time strings for Google Calendar (no timezone suffix — pass tz separately)
    startLocal: `${date}T${pad(hour)}:${pad(m)}:00`,
    endLocal: `${date}T${pad(endHour)}:${pad(endMin)}:00`,
    // Compact format for ICS DTSTART/DTEND
    startIcs: `${d}T${pad(hour)}${pad(m)}00`,
    endIcs: `${d}T${pad(endHour)}${pad(endMin)}00`,
  }
}

export function calendarTimes(date: string, time: string, durationMinutes: number) {
  const { startLocal, endLocal } = parseTime(date, time, durationMinutes)
  return { startDateTime: startLocal, endDateTime: endLocal }
}

export function generateIcs({
  uid,
  summary,
  description,
  date,
  time,
  durationMinutes,
  organizerEmail,
  attendeeEmail,
  attendeeName,
}: {
  uid: string
  summary: string
  description: string
  date: string
  time: string
  durationMinutes: number
  organizerEmail: string
  attendeeEmail: string
  attendeeName: string
}): string {
  const { startIcs, endIcs } = parseTime(date, time, durationMinutes)
  const stamp = new Date().toISOString().replace(/[-:.]/g, '').slice(0, 15) + 'Z'

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//BrizeeBri//Booking//EN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `UID:${uid}@brizeebri.com`,
    `DTSTAMP:${stamp}`,
    `DTSTART;TZID=America/Chicago:${startIcs}`,
    `DTEND;TZID=America/Chicago:${endIcs}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description}`,
    `ORGANIZER;CN=Brizee Bri Luxe Hair Studio:mailto:${organizerEmail}`,
    `ATTENDEE;CN=${attendeeName};RSVP=TRUE:mailto:${attendeeEmail}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')
}
