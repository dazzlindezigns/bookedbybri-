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

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning,'
  if (h < 17) return 'Good afternoon,'
  return 'Good evening,'
}

function initials(name: string) {
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
}

const STATUS_DOT: Record<string, string> = {
  pending: '#f59e0b',
  confirmed: Colors.darkPink,
  completed: Colors.green,
  cancelled: Colors.section,
  declined: Colors.red,
  no_show: '#f97316',
}

export default function HomeScreen() {
  const [pending, setPending] = useState<Booking[]>([])
  const [upcoming, setUpcoming] = useState<Booking[]>([])
  const [todayCount, setTodayCount] = useState(0)
  const [refreshing, setRefreshing] = useState(false)
  const router = useRouter()

  const today = new Date().toISOString().slice(0, 10)

  const load = async () => {
    const [pendingRes, allRes] = await Promise.all([
      api.fetchBookings('pending'),
      api.fetchBookings(),
    ])
    const pendingList: Booking[] = Array.isArray(pendingRes) ? pendingRes : []
    const allList: Booking[] = Array.isArray(allRes) ? allRes : []

    setPending(pendingList)
    setTodayCount(
      allList.filter(
        (b) => b.appointment_date === today && !['cancelled', 'declined'].includes(b.status)
      ).length
    )
    setUpcoming(
      allList
        .filter((b) => b.appointment_date >= today && !['cancelled', 'declined'].includes(b.status))
        .sort(
          (a, b) =>
            a.appointment_date.localeCompare(b.appointment_date) ||
            a.appointment_time.localeCompare(b.appointment_time)
        )
        .slice(0, 10)
    )
  }

  useFocusEffect(useCallback(() => { load() }, []))

  const onRefresh = async () => {
    setRefreshing(true)
    await load()
    setRefreshing(false)
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="light" />

      {/* Dark header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.logo}>BB ✦</Text>
          <View style={styles.headerIcons}>
            <TouchableOpacity style={styles.iconBtn}>
              <Ionicons name="notifications-outline" size={22} color="rgba(255,255,255,0.7)" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('/(tabs)/clients')}>
              <Ionicons name="chatbubble-outline" size={22} color="rgba(255,255,255,0.7)" />
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.greeting}>{getGreeting()}</Text>
        <Text style={styles.name}>
          Brizee Bri <Text style={styles.heart}>♥</Text>
        </Text>
        <Text style={styles.subline}>
          {todayCount > 0
            ? `You have ${todayCount} appointment${todayCount !== 1 ? 's' : ''} today.`
            : 'No appointments scheduled today.'}
        </Text>
      </View>

      {/* Light scrollable content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentInner}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.pink} />
        }
      >
        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{todayCount}</Text>
            <Text style={styles.statLabel}>Today</Text>
          </View>
          <View style={[styles.statBox, styles.statBorder]}>
            <Text style={styles.statNum}>{upcoming.length}</Text>
            <Text style={styles.statLabel}>Upcoming</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statNum, pending.length > 0 && { color: '#f59e0b' }]}>
              {pending.length}
            </Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
        </View>

        {/* New Appointment */}
        <TouchableOpacity style={styles.newBtn}>
          <Ionicons name="add" size={18} color={Colors.text} />
          <Text style={styles.newBtnText}>New Appointment</Text>
        </TouchableOpacity>

        {/* Pending requests */}
        {pending.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>NEEDS REVIEW</Text>
            {pending.slice(0, 3).map((b) => (
              <TouchableOpacity
                key={b.id}
                style={[styles.card, { borderLeftWidth: 3, borderLeftColor: '#f59e0b' }]}
                onPress={() => router.push(`/request/${b.id}`)}
              >
                <View style={[styles.avatar, { backgroundColor: '#fff8e6' }]}>
                  <Text style={[styles.avatarText, { color: '#f59e0b' }]}>{initials(b.client_name)}</Text>
                </View>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardName}>{b.client_name}</Text>
                  <Text style={styles.cardSub}>{b.services?.name}</Text>
                </View>
                <View style={styles.cardRight}>
                  <Text style={styles.cardDate}>
                    {new Date(b.appointment_date + 'T12:00:00').toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </Text>
                  <Text style={styles.reviewLabel}>Review →</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Upcoming */}
        <View style={styles.section}>
          <View style={styles.sectionRow}>
            <Text style={styles.sectionLabel}>UPCOMING APPOINTMENTS</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/calendar')}>
              <Text style={styles.viewAll}>View all</Text>
            </TouchableOpacity>
          </View>
          {upcoming.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No upcoming appointments</Text>
            </View>
          ) : (
            upcoming.map((b) => (
              <TouchableOpacity
                key={b.id}
                style={styles.card}
                onPress={() => router.push(`/request/${b.id}`)}
              >
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{initials(b.client_name)}</Text>
                </View>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardName}>{b.client_name}</Text>
                  <Text style={styles.cardSub}>{b.services?.name}</Text>
                </View>
                <View style={styles.cardRight}>
                  <Text style={styles.cardDate}>
                    {new Date(b.appointment_date + 'T12:00:00').toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </Text>
                  <Text style={styles.cardTime}>{b.appointment_time}</Text>
                  <View
                    style={[styles.statusDot, { backgroundColor: STATUS_DOT[b.status] ?? Colors.muted }]}
                  />
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.dark },

  // Dark header
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 28 },
  headerTop: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20,
  },
  logo: { fontSize: 22, fontWeight: '800', color: Colors.pink, letterSpacing: 1 },
  headerIcons: { flexDirection: 'row' },
  iconBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  greeting: { fontSize: 16, color: 'rgba(255,255,255,0.6)', marginBottom: 4 },
  name: { fontSize: 34, fontWeight: '700', color: Colors.white, marginBottom: 8 },
  heart: { color: Colors.pink },
  subline: { fontSize: 14, color: 'rgba(255,255,255,0.45)' },

  // Light content
  content: { flex: 1, backgroundColor: Colors.bg, borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  contentInner: { paddingBottom: 32 },

  // Stats
  statsRow: {
    flexDirection: 'row', marginHorizontal: 16, marginTop: 20, marginBottom: 16,
    backgroundColor: Colors.white, borderRadius: 16, borderWidth: 1, borderColor: Colors.border,
  },
  statBox: { flex: 1, alignItems: 'center', paddingVertical: 14 },
  statBorder: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: Colors.border },
  statNum: { fontSize: 24, fontWeight: '700', color: Colors.text },
  statLabel: { fontSize: 11, color: Colors.muted, marginTop: 2 },

  // New button
  newBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    marginHorizontal: 16, marginBottom: 24,
    backgroundColor: Colors.pink, borderRadius: 50, paddingVertical: 14,
  },
  newBtnText: { fontSize: 15, fontWeight: '600', color: Colors.text },

  // Sections
  section: { marginBottom: 8 },
  sectionRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, marginBottom: 10,
  },
  sectionLabel: {
    fontSize: 11, letterSpacing: 2, fontWeight: '600', color: Colors.section,
    paddingHorizontal: 20, marginBottom: 10,
  },
  viewAll: { fontSize: 13, color: Colors.darkPink, fontWeight: '500' },

  // Cards
  card: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: 16, marginBottom: 8,
    backgroundColor: Colors.white, borderRadius: 16, padding: 14,
    borderWidth: 1, borderColor: Colors.border,
  },
  avatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#fff0f8', alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  avatarText: { fontSize: 13, fontWeight: '700', color: Colors.darkPink },
  cardInfo: { flex: 1 },
  cardName: { fontSize: 14, fontWeight: '600', color: Colors.text },
  cardSub: { fontSize: 12, color: Colors.muted, marginTop: 2 },
  cardRight: { alignItems: 'flex-end' },
  cardDate: { fontSize: 12, color: Colors.muted },
  cardTime: { fontSize: 11, color: Colors.section, marginTop: 1 },
  statusDot: { width: 6, height: 6, borderRadius: 3, marginTop: 4 },
  reviewLabel: { fontSize: 11, color: '#f59e0b', fontWeight: '600', marginTop: 2 },

  emptyCard: {
    marginHorizontal: 16, backgroundColor: Colors.white, borderRadius: 16, padding: 24,
    borderWidth: 1, borderColor: Colors.border, alignItems: 'center',
  },
  emptyText: { color: Colors.muted, fontSize: 14 },
})
