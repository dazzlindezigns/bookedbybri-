export async function sendSms(to: string, body: string) {
  const apiKey = process.env.TELNYX_API_KEY
  const from = process.env.TELNYX_PHONE_NUMBER
  if (!apiKey || !from) throw new Error('Telnyx not configured')

  // Normalize to E.164
  const digits = to.replace(/\D/g, '')
  const e164 = digits.length === 10 ? `+1${digits}` : `+${digits}`

  const res = await fetch('https://api.telnyx.com/v2/messages', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from, to: e164, text: body }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Telnyx ${res.status}: ${err}`)
  }

  return res.json()
}
