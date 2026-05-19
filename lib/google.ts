import { google } from 'googleapis'

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
)

export function getAuthUrl() {
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: [
      'https://www.googleapis.com/auth/calendar.events',
      'https://www.googleapis.com/auth/gmail.send',
    ],
  })
}

export async function getAuthenticatedClient(refreshToken: string) {
  oauth2Client.setCredentials({ refresh_token: refreshToken })
  return oauth2Client
}

export async function createCalendarEvent(
  refreshToken: string,
  event: {
    summary: string
    description: string
    startDateTime: string
    endDateTime: string
    attendeeEmail?: string
  }
) {
  const auth = await getAuthenticatedClient(refreshToken)
  const calendar = google.calendar({ version: 'v3', auth })

  const res = await calendar.events.insert({
    calendarId: 'primary',
    requestBody: {
      summary: event.summary,
      description: event.description,
      start: { dateTime: event.startDateTime, timeZone: 'America/Chicago' },
      end: { dateTime: event.endDateTime, timeZone: 'America/Chicago' },
      attendees: event.attendeeEmail ? [{ email: event.attendeeEmail }] : [],
    },
  })
  return res.data
}

export async function getCalendarEvents(refreshToken: string, date: string) {
  const auth = await getAuthenticatedClient(refreshToken)
  const calendar = google.calendar({ version: 'v3', auth })

  const startOfDay = new Date(`${date}T00:00:00-05:00`).toISOString()
  const endOfDay = new Date(`${date}T23:59:59-05:00`).toISOString()

  const res = await calendar.events.list({
    calendarId: 'primary',
    timeMin: startOfDay,
    timeMax: endOfDay,
    singleEvents: true,
    orderBy: 'startTime',
  })
  return res.data.items || []
}

export async function sendGmail(
  refreshToken: string,
  to: string,
  subject: string,
  htmlBody: string
) {
  const auth = await getAuthenticatedClient(refreshToken)
  const gmail = google.gmail({ version: 'v1', auth })

  const message = [
    `To: ${to}`,
    'Content-Type: text/html; charset=utf-8',
    'MIME-Version: 1.0',
    `Subject: ${subject}`,
    '',
    htmlBody,
  ].join('\n')

  const encodedMessage = Buffer.from(message)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')

  await gmail.users.messages.send({
    userId: 'me',
    requestBody: { raw: encodedMessage },
  })
}
