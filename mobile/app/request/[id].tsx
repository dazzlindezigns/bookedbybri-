import { useState, useEffect, useRef, useCallback } from 'react'
import {
  View, Text, ScrollView, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator,
  Alert, Image,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Colors } from '@/constants/colors'
import { api } from '@/lib/api'
import { supabase } from '@/lib/supabase'
import { Booking, Message, BookingStatus } from '@/lib/types'

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? ''

const STATUS_COLOR: Record<BookingStatus, string> = {
  pending: Colors.pink,
  confirmed: Colors.green,
  declined: Colors.red,
  completed: Colors.muted,
  cancelled: Colors.muted,
  no_show: '#f97316',
}

function formatDate(dateStr: string) {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  })
}

export default function RequestDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const [booking, setBooking] = useState<Booking | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const [declining, setDeclining] = useState(false)
  const [declineReason, setDeclineReason] = useState('')
  const [acting, setActing] = useState(false)
  const scrollRef = useRef<ScrollView>(null)

  const scrollToBottom = (animated = true) =>
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated }), 80)

  const load = useCallback(async () => {
    if (!id) return
    const [b, msgs] = await Promise.all([api.fetchBooking(id), api.fetchMessages(id)])
    setBooking(b)
    setMessages(Array.isArray(msgs) ? msgs : [])
    setLoading(false)
    scrollToBottom(false)
  }, [id])

  useEffect(() => { load() }, [load])

  // Realtime: new inbound messages
  useEffect(() => {
    if (!id) return
    const channel = supabase
      .channel(`messages:${id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'braids',
        table: 'booking_messages',
        filter: `booking_id=eq.${id}`,
      }, (payload) => {
        setMessages((prev) => {
          if (prev.some((m) => m.id === (payload.new as Message).id)) return prev
          return [...prev, payload.new as Message]
        })
        scrollToBottom()
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [id])

  const handleSend = async () => {
    if (!input.trim() || !id) return
    setSending(true)
    const text = input.trim()
    setInput('')
    const msg = await api.sendMessage(id, text)
    if (msg && !msg.error) {
      setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]))
      scrollToBottom()
    }
    setSending(false)
  }

  const handleAccept = async () => {
    if (!id) return
    Alert.alert('Accept request?', 'This will confirm the appointment and email the client.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Accept', onPress: async () => {
          setActing(true)
          const res = await api.patchBooking(id, { status: 'confirmed' })
          if (!res.error) setBooking((b) => b ? { ...b, status: 'confirmed' } : b)
          setActing(false)
        },
      },
    ])
  }

  const handleDeclineConfirm = async () => {
    if (!declineReason.trim() || !id) return
    setActing(true)
    const res = await api.patchBooking(id, { status: 'declined', declineReason: declineReason.trim() })
    if (!res.error) {
      setBooking((b) => b ? { ...b, status: 'declined' } : b)
      setDeclining(false)
      setDeclineReason('')
    }
    setActing(false)
  }

  const handleMarkDepositPaid = () => {
    Alert.alert('Mark deposit as received?', 'This will add the appointment to your calendar and send the client a confirmation.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Confirm', onPress: async () => {
          setActing(true)
          const res = await api.patchBooking(id!, { payment_status: 'deposit_paid' })
          if (!res.error) setBooking((b) => b ? { ...b, payment_status: 'deposit_paid' } : b)
          setActing(false)
        },
      },
    ])
  }

  const handleMarkComplete = () => {
    Alert.alert('Mark as completed?', 'This will send a Google review request email to the client.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Mark Complete', onPress: async () => {
          setActing(true)
          const res = await api.patchBooking(id!, { status: 'completed' })
          if (!res.error) setBooking((b) => b ? { ...b, status: 'completed' } : b)
          setActing(false)
        },
      },
    ])
  }

  const handleMarkNoShow = () => {
    Alert.alert('Mark as no-show?', 'The client will not be notified.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'No Show', style: 'destructive', onPress: async () => {
          setActing(true)
          const res = await api.patchBooking(id!, { status: 'no_show' })
          if (!res.error) setBooking((b) => b ? { ...b, status: 'no_show' } : b)
          setActing(false)
        },
      },
    ])
  }

  const handleCancelBooking = () => {
    Alert.alert('Cancel appointment?', 'The client will be notified. Deposits are non-refundable.', [
      { text: 'Keep', style: 'cancel' },
      {
        text: 'Cancel Appointment', style: 'destructive', onPress: async () => {
          setActing(true)
          const res = await api.patchBooking(id!, { status: 'cancelled' })
          if (!res.error) {
            setBooking((b) => b ? { ...b, status: 'cancelled' } : b)
            router.back()
          }
          setActing(false)
        },
      },
    ])
  }

  if (loading) {
    return (
      <View style={[styles.safe, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator color={Colors.pink} size="large" />
      </View>
    )
  }

  if (!booking) {
    return (
      <View style={[styles.safe, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: Colors.muted }}>Booking not found</Text>
      </View>
    )
  }

  const isPending = booking.status === 'pending'
  const isConfirmed = booking.status === 'confirmed'
  const isAwaitingDeposit = isConfirmed && booking.payment_status !== 'deposit_paid'
  const statusColor = STATUS_COLOR[booking.status]
  const images = booking.booking_images ?? []

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerName} numberOfLines={1}>{booking.client_name}</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: statusColor + '22' }]}>
          <Text style={[styles.badgeText, { color: statusColor }]}>{booking.status}</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          ref={scrollRef}
          style={styles.scroll}
          contentContainerStyle={{ padding: 16, paddingBottom: 8 }}
        >
          {/* Booking info */}
          <View style={styles.card}>
            <Text style={styles.serviceName}>{booking.services?.name}</Text>
            <Text style={styles.dateTime}>{formatDate(booking.appointment_date)}</Text>
            <Text style={styles.dateTime}>{booking.appointment_time}</Text>
            {booking.deposit_amount ? (
              <Text style={styles.deposit}>Deposit: ${booking.deposit_amount}</Text>
            ) : null}
          </View>

          {/* Client info */}
          <View style={styles.card}>
            <Text style={styles.sectionLabel}>CLIENT</Text>
            <Text style={styles.clientPhone}>{booking.client_phone}</Text>
            <Text style={styles.clientEmail}>{booking.client_email}</Text>
            {booking.client_notes ? (
              <View style={styles.notesBox}>
                <Text style={styles.notesLabel}>Notes</Text>
                <Text style={styles.notesText}>{booking.client_notes}</Text>
              </View>
            ) : null}
          </View>

          {/* Inspiration images */}
          {images.length > 0 && (
            <View style={styles.card}>
              <Text style={styles.sectionLabel}>INSPIRATION</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
                {images.map((img) => (
                  <Image
                    key={img.id}
                    source={{ uri: `${SUPABASE_URL}/storage/v1/object/public/booking-images/${img.storage_path}` }}
                    style={styles.inspoImage}
                  />
                ))}
              </ScrollView>
            </View>
          )}

          {/* Chat messages */}
          {messages.length > 0 && (
            <View style={{ marginBottom: 8 }}>
              <Text style={[styles.sectionLabel, { marginBottom: 10 }]}>MESSAGES</Text>
              {messages.map((m) => (
                <View
                  key={m.id}
                  style={[styles.bubble, m.direction === 'outbound' ? styles.bubbleOut : styles.bubbleIn]}
                >
                  <Text style={[styles.bubbleText, m.direction === 'outbound' && styles.bubbleTextOut]}>
                    {m.body}
                  </Text>
                  <Text style={styles.bubbleTime}>
                    {new Date(m.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </ScrollView>

        {/* Decline reason input */}
        {declining && (
          <View style={styles.declinePanel}>
            <TextInput
              style={styles.declineInput}
              placeholder="Reason for declining…"
              placeholderTextColor={Colors.muted}
              value={declineReason}
              onChangeText={setDeclineReason}
              autoFocus
              multiline
            />
            <View style={styles.declineActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => { setDeclining(false); setDeclineReason('') }}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.sendDeclineBtn, !declineReason.trim() && { opacity: 0.4 }]}
                onPress={handleDeclineConfirm}
                disabled={!declineReason.trim() || acting}
              >
                {acting
                  ? <ActivityIndicator color={Colors.white} size="small" />
                  : <Text style={styles.sendDeclineBtnText}>Send & Decline</Text>
                }
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Mark deposit paid */}
        {isAwaitingDeposit && !declining && (
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.depositBtn} onPress={handleMarkDepositPaid} disabled={acting}>
              {acting
                ? <ActivityIndicator color={Colors.white} size="small" />
                : <Text style={styles.depositBtnText}>💰 Mark deposit received</Text>
              }
            </TouchableOpacity>
          </View>
        )}

        {/* Accept / Decline */}
        {isPending && !declining && (
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.declineBtn} onPress={() => setDeclining(true)}>
              <Text style={styles.declineBtnText}>Decline</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.acceptBtn} onPress={handleAccept} disabled={acting}>
              {acting
                ? <ActivityIndicator color={Colors.text} size="small" />
                : <Text style={styles.acceptBtnText}>Accept ✓</Text>
              }
            </TouchableOpacity>
          </View>
        )}

        {/* Confirmed actions — complete / no-show / cancel */}
        {isConfirmed && !declining && (
          <View style={styles.confirmedActions}>
            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.completeBtn} onPress={handleMarkComplete} disabled={acting}>
                <Text style={styles.completeBtnText}>Mark Complete ✓</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.noShowBtn} onPress={handleMarkNoShow} disabled={acting}>
                <Text style={styles.noShowBtnText}>No-show</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.cancelApptBtn} onPress={handleCancelBooking} disabled={acting}>
              <Text style={styles.cancelApptBtnText}>Cancel appointment</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Message input */}
        {!declining && (
          <View style={styles.inputRow}>
            <TextInput
              style={styles.messageInput}
              placeholder="Message client…"
              placeholderTextColor={Colors.muted}
              value={input}
              onChangeText={setInput}
              returnKeyType="send"
              onSubmitEditing={handleSend}
            />
            <TouchableOpacity
              style={[styles.sendBtn, (!input.trim() || sending) && { opacity: 0.4 }]}
              onPress={handleSend}
              disabled={!input.trim() || sending}
            >
              {sending
                ? <ActivityIndicator color={Colors.text} size="small" />
                : <Text style={styles.sendBtnText}>↑</Text>
              }
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  backBtn: { paddingRight: 12, paddingVertical: 4 },
  backText: { fontSize: 24, color: Colors.text },
  headerCenter: { flex: 1 },
  headerName: { fontSize: 17, fontWeight: '600', color: Colors.text },
  badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 100 },
  badgeText: { fontSize: 12, fontWeight: '600', textTransform: 'capitalize' },
  scroll: { flex: 1 },
  card: {
    backgroundColor: Colors.white, borderRadius: 18, padding: 16,
    borderWidth: 1, borderColor: Colors.border, marginBottom: 10,
  },
  serviceName: { fontSize: 18, fontWeight: '700', color: Colors.text, marginBottom: 4 },
  dateTime: { fontSize: 14, color: Colors.muted },
  deposit: { fontSize: 14, color: Colors.darkPink, marginTop: 6, fontWeight: '600' },
  sectionLabel: { fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: Colors.section, marginBottom: 6 },
  clientPhone: { fontSize: 16, color: Colors.text, fontWeight: '500', marginBottom: 2 },
  clientEmail: { fontSize: 14, color: Colors.muted },
  notesBox: { marginTop: 12, backgroundColor: Colors.bg, borderRadius: 10, padding: 12 },
  notesLabel: { fontSize: 11, color: Colors.section, marginBottom: 4 },
  notesText: { fontSize: 14, color: Colors.text },
  inspoImage: { width: 100, height: 100, borderRadius: 12, marginRight: 8 },
  bubble: {
    maxWidth: '80%', padding: 12, borderRadius: 18, marginBottom: 8,
    backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.border,
    alignSelf: 'flex-start',
  },
  bubbleOut: {
    backgroundColor: Colors.pink, borderColor: Colors.pink, alignSelf: 'flex-end',
  },
  bubbleText: { fontSize: 15, color: Colors.text },
  bubbleTextOut: { color: Colors.text },
  bubbleTime: { fontSize: 11, color: Colors.muted, marginTop: 4, textAlign: 'right' },
  actionRow: {
    flexDirection: 'row', gap: 10, paddingHorizontal: 16, paddingVertical: 10,
    backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: Colors.border,
  },
  depositBtn: {
    flex: 1, paddingVertical: 14, borderRadius: 100,
    backgroundColor: Colors.green, alignItems: 'center',
  },
  depositBtnText: { fontSize: 15, fontWeight: '700', color: Colors.white },
  declineBtn: {
    flex: 1, paddingVertical: 14, borderRadius: 100,
    borderWidth: 1, borderColor: Colors.border, alignItems: 'center',
  },
  declineBtnText: { fontSize: 15, fontWeight: '600', color: Colors.red },
  acceptBtn: {
    flex: 1, paddingVertical: 14, borderRadius: 100,
    backgroundColor: Colors.pink, alignItems: 'center',
  },
  acceptBtnText: { fontSize: 15, fontWeight: '700', color: Colors.text },
  declinePanel: {
    backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: Colors.border,
    padding: 16,
  },
  declineInput: {
    backgroundColor: Colors.bg, borderRadius: 14, padding: 12,
    fontSize: 15, color: Colors.text, minHeight: 72, borderWidth: 1, borderColor: Colors.border,
    marginBottom: 10,
  },
  declineActions: { flexDirection: 'row', gap: 10 },
  cancelBtn: {
    flex: 1, paddingVertical: 13, borderRadius: 100,
    borderWidth: 1, borderColor: Colors.border, alignItems: 'center',
  },
  cancelBtnText: { fontSize: 14, color: Colors.text },
  sendDeclineBtn: {
    flex: 2, paddingVertical: 13, borderRadius: 100,
    backgroundColor: Colors.red, alignItems: 'center',
  },
  sendDeclineBtnText: { fontSize: 14, fontWeight: '600', color: Colors.white },
  inputRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 16, paddingVertical: 10,
    backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: Colors.border,
  },
  messageInput: {
    flex: 1, backgroundColor: Colors.bg, borderRadius: 100,
    paddingHorizontal: 16, paddingVertical: 10,
    fontSize: 15, color: Colors.text,
    borderWidth: 1, borderColor: Colors.border,
  },
  sendBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.pink, alignItems: 'center', justifyContent: 'center',
  },
  sendBtnText: { fontSize: 18, fontWeight: '700', color: Colors.text },
  confirmedActions: {
    backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: Colors.border, paddingBottom: 8,
  },
  completeBtn: {
    flex: 2, paddingVertical: 14, borderRadius: 100,
    backgroundColor: Colors.green, alignItems: 'center',
  },
  completeBtnText: { fontSize: 14, fontWeight: '700', color: Colors.white },
  noShowBtn: {
    flex: 1, paddingVertical: 14, borderRadius: 100,
    borderWidth: 1, borderColor: '#fed7aa', alignItems: 'center',
  },
  noShowBtnText: { fontSize: 14, fontWeight: '600', color: '#f97316' },
  cancelApptBtn: {
    marginHorizontal: 16, marginBottom: 6, paddingVertical: 10, borderRadius: 100,
    borderWidth: 1, borderColor: '#fecaca', alignItems: 'center',
  },
  cancelApptBtnText: { fontSize: 13, color: Colors.red },
})
