const BASE = process.env.EXPO_PUBLIC_API_URL ?? 'https://brizeebri.com'

export const api = {
  async fetchBookings(status?: string) {
    const url = status ? `${BASE}/api/bookings?status=${status}` : `${BASE}/api/bookings`
    const res = await fetch(url)
    return res.json()
  },

  async fetchBooking(id: string) {
    const res = await fetch(`${BASE}/api/bookings/${id}`)
    return res.json()
  },

  async patchBooking(id: string, body: object) {
    const res = await fetch(`${BASE}/api/bookings/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    return res.json()
  },

  async fetchMessages(bookingId: string) {
    const res = await fetch(`${BASE}/api/bookings/${bookingId}/messages`)
    return res.json()
  },

  async sendMessage(bookingId: string, body: string) {
    const res = await fetch(`${BASE}/api/bookings/${bookingId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body }),
    })
    return res.json()
  },

  async fetchServices() {
    const res = await fetch(`${BASE}/api/services`)
    return res.json()
  },

  async createService(body: object) {
    const res = await fetch(`${BASE}/api/services`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    return res.json()
  },

  async updateService(body: object) {
    const res = await fetch(`${BASE}/api/services`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    return res.json()
  },

  async deleteService(id: string) {
    await fetch(`${BASE}/api/services?id=${id}`, { method: 'DELETE' })
  },

  async fetchSettings() {
    const res = await fetch(`${BASE}/api/settings`)
    return res.json()
  },

  async patchSettings(body: object) {
    const res = await fetch(`${BASE}/api/settings`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    return res.json()
  },

  async fetchPeople() {
    const res = await fetch(`${BASE}/api/people`)
    return res.json()
  },

  async fetchContactMessages(contactId: string) {
    const res = await fetch(`${BASE}/api/contacts/${contactId}/messages`)
    return res.json()
  },

  async sendContactMessage(contactId: string, body: string) {
    const res = await fetch(`${BASE}/api/contacts/${contactId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body }),
    })
    return res.json()
  },
}
