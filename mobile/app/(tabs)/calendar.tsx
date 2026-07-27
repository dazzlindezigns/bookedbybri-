import { useState, useCallback } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { Ionicons } from '@expo/vector-icons'
import { useFocusEffect } from '@react-navigation/native'
import { useRouter } from 'expo-router'
import { Colors } from '@/constants/colors'
import { api } from '@/lib/api'
import type { Booking } from '@/lib/types'

const DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

function getWeekDates(offset = 0): Date[] {
  const now = new Date()
  const sunday = new Date(now)
  sunday.setDate(now.getDate() - now.getDay() + offset * 7)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(sunday)
    d.setDate(sunday.getDate() + i)
    return d
  })
}

function toKey(d: Date) {
  return d.toISOString().slice(0, 10)
}

function initials(name: string) {
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
}

const STATUS_STYLE: Record<string, { bg: string; text: string }> = {
  pending:   { bg: '#fff8e6', text: '#f59e0b' },
  confirmed: { bg: '#fff0f8', text: Colors.darkPink },
  completed: { bg: '#f0fdf4', text: Colors.green },
  cancelled: { bg: '#f5f2f0', text: Colors.section },
  declined:  { bg: '#fef2f2', text: Colors.red },
  no_show:   { bg: '#fff7ed', text: '#f97316' },
}

export default function CalendarScreen() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [weekOffset, setWeekOffset] = useState(0)
  const [selectedDate, setSelectedDate] = useState(toKey(new Date()))
  const [refreshing, setRefreshing] = useState(false)
  const router = useRouter()

  const load = async () => {
    const res = await api.fetchBookings()
    setBookings(Array.isArray(res) ? res : [])
  }

  useFocusEffect(useCallback(() => { load() }, []))

  const onRefresh = async () => {
    setRefreshing(true)
    await load()
    setRefreshing(false)
  }

  const weekDates = getWeekDates(weekOffset)
  const today = toKey(new Date())
  const bookedDates = new Set(bookings.map((b) => b.appointment_date))

  const dayAppts = bookings
    .filter((b) => b.appointment_date === selectedDate && !['cancelled', 'declined'].includes(b.status))
    .sort((a, b) => a.appointment_time.localeCompare(b.appointment_time))

  const monthLabel = weekDates[0].toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="light" />

      {/* Dark header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.navBtn} onPress={() => setWeekOffset((w) => w - 1)}>
            <Ionicons name="chevron-back" size={22} color="rgba(255,255,255,0.8)" />
          </TouchableOpacity>
          <Text style={styles.monthLabel}>{monthLabel}</Text>
          <TouchableOpacity style={styles.navBtn} onPress={() => setWeekOffset((w) => w + 1)}>
            <Ionicons name="chevron-forward" size={22} color="rgba(255,255,255,0.8)" />
          </TouchableOpacity>
        </View>

        {/* Day selector */}
        <View style={styles.dayRow}>
          {weekDates.map((date, i) => {
            const key = toKey(date)
            const isSelected = key === selectedDate
            const isToday = key === today
            const hasAppts = bookedDates.has(key)
            return (
              <TouchableOpacity key={key} style={styles.dayCol} onPress={() => setSelectedDate(key)}>
                <Text style={[styles.dayLabel, isSelected && { color: Colors.pink }]}>
                  {DAY_LABELS[i]}
                </Text>
                <View style={[
                  styles.dayNum,
                  isSelected && { backgroundColor: Colors.pink },
                  !isSelected && isToday && { borderWidth: 1.5, borderColor: Colors.pink },
                ]}>
                  <Text style={[styles.dayNumText, isSelected && { color: Colors.text }]}>
                    {date.getDate()}
                  </Text>
                </View>
                {hasAppts && !isSelected && <View style={styles.dot} />}
                {!hasAppts && <View style={{ height: 5 }} />}
              </TouchableOpacity>
            )
          })}
        </View>
      </View>

      {/* Appointments list */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentInner}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.pink} />}
      >
        <Text style={styles.dateHeading}>
          {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', {
            weekday: 'long', month: 'long', day: 'numeric',
          })}
        </Text>

        {dayAppts.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="calendar-outline" size={32} color={Colors.border} />
            <Text style={styles.emptyText}>No appointments</Text>
          </View>
        ) : (
          dayAppts.map((b) => {
            const sc = STATUS_STYLE[b.status] ?? STATUS_STYLE.pending
            return (
              <TouchableOpacity
                key={b.id}
                style={styles.apptCard}
                onPress={() => router.push(`/request/${b.id}`)}
              >
                <Text style={styles.time}>{b.appointment_time}</Text>
                <View style={styles.divider} />
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{initials(b.client_name)}</Text>
                </View>
                <View style={styles.apptInfo}>
                  <Text style={styles.apptName}>{b.client_name}</Text>
                  <Text style={styles.apptService}>{b.services?.name}</Text>
                </View>
                <View style={[styles.badge, { backgroundColor: sc.bg }]}>
                  <Text style={[styles.badgeText, { color: sc.text }]}>
                    {b.status.charAt(0).toUpperCase() + b.status.slice(1).replace('_', ' ')}
                  </Text>
                </View>
              </TouchableOpacity>
            )
          })
        )}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity style={styles.fab}>
        <Ionicons name="add" size={28} color={Colors.text} />
      </TouchableOpacity>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.dark },

  header: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 20 },
  headerTop: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20,
  },
  navBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  monthLabel: { fontSize: 18, fontWeight: '700', color: Colors.white },

  dayRow: { flexDirection: 'row', justifyContent: 'space-between' },
  dayCol: { alignItems: 'center', gap: 4 },
  dayLabel: { fontSize: 11, color: 'rgba(255,255,255,0.45)', fontWeight: '500' },
  dayNum: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  dayNumText: { fontSize: 15, fontWeight: '600', color: 'rgba(255,255,255,0.9)' },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: Colors.pink },

  content: { flex: 1, backgroundColor: Colors.bg, borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  contentInner: { paddingBottom: 100 },

  dateHeading: {
    fontSize: 14, fontWeight: '600', color: Colors.muted,
    paddingHorizontal: 20, paddingTop: 20, paddingBottom: 14,
  },

  emptyCard: {
    marginHorizontal: 16, backgroundColor: Colors.white, borderRadius: 16,
    padding: 32, alignItems: 'center', gap: 10,
    borderWidth: 1, borderColor: Colors.border,
  },
  emptyText: { color: Colors.muted, fontSize: 14 },

  apptCard: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: 16, marginBottom: 8,
    backgroundColor: Colors.white, borderRadius: 16, padding: 14,
    borderWidth: 1, borderColor: Colors.border, gap: 10,
  },
  time: { fontSize: 12, fontWeight: '600', color: Colors.darkPink, width: 54 },
  divider: { width: 1, height: 36, backgroundColor: Colors.border },
  avatar: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#fff0f8', alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 12, fontWeight: '700', color: Colors.darkPink },
  apptInfo: { flex: 1 },
  apptName: { fontSize: 14, fontWeight: '600', color: Colors.text },
  apptService: { fontSize: 12, color: Colors.muted, marginTop: 1 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 10, fontWeight: '600' },

  fab: {
    position: 'absolute', bottom: 20, right: 20,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: Colors.pink, alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.darkPink, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35, shadowRadius: 8, elevation: 8,
  },
})
