import { useState, useCallback } from 'react'
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { useFocusEffect } from '@react-navigation/native'
import { Colors } from '@/constants/colors'
import { api } from '@/lib/api'
import { Booking, BookingStatus } from '@/lib/types'

const STATUS_COLORS: Record<BookingStatus, string> = {
  pending: Colors.pink,
  confirmed: Colors.green,
  declined: Colors.red,
  completed: Colors.muted,
  cancelled: Colors.muted,
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

function formatDate(dateStr: string): string {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function RequestsScreen() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [filter, setFilter] = useState<'pending' | 'all'>('pending')
  const [refreshing, setRefreshing] = useState(false)
  const router = useRouter()

  const load = async (f = filter) => {
    const data = await api.fetchBookings(f === 'pending' ? 'pending' : undefined)
    setBookings(Array.isArray(data) ? data : [])
  }

  useFocusEffect(useCallback(() => { load() }, [filter]))

  const onRefresh = async () => {
    setRefreshing(true)
    await load()
    setRefreshing(false)
  }

  const switchFilter = (f: 'pending' | 'all') => {
    setFilter(f)
    load(f)
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Requests</Text>
        <View style={styles.filterRow}>
          {(['pending', 'all'] as const).map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.filterBtn, filter === f && styles.filterBtnActive]}
              onPress={() => switchFilter(f)}
            >
              <Text style={[styles.filterBtnText, filter === f && styles.filterBtnTextActive]}>
                {f === 'pending' ? 'Pending' : 'All'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <FlatList
        data={bookings}
        keyExtractor={(b) => b.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.pink} />}
        ListEmptyComponent={
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>
              {filter === 'pending' ? 'No pending requests' : 'No bookings yet'}
            </Text>
          </View>
        }
        renderItem={({ item: b }) => (
          <TouchableOpacity style={styles.card} onPress={() => router.push(`/request/${b.id}`)}>
            <View style={styles.cardTop}>
              <Text style={styles.clientName}>{b.client_name}</Text>
              <View style={[styles.badge, { backgroundColor: STATUS_COLORS[b.status] + '22' }]}>
                <Text style={[styles.badgeText, { color: STATUS_COLORS[b.status] }]}>{b.status}</Text>
              </View>
            </View>
            <Text style={styles.service}>{b.services?.name}</Text>
            <View style={styles.cardBottom}>
              <Text style={styles.dateTime}>{formatDate(b.appointment_date)} · {b.appointment_time}</Text>
              <Text style={styles.timeAgo}>{timeAgo(b.created_at)}</Text>
            </View>
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  title: { fontSize: 30, fontWeight: '700', color: Colors.text, marginBottom: 14 },
  filterRow: { flexDirection: 'row', gap: 8 },
  filterBtn: {
    paddingHorizontal: 18, paddingVertical: 8, borderRadius: 100,
    backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.border,
  },
  filterBtnActive: { backgroundColor: Colors.pink, borderColor: Colors.pink },
  filterBtnText: { fontSize: 14, color: Colors.muted, fontWeight: '500' },
  filterBtnTextActive: { color: Colors.text },
  emptyCard: {
    backgroundColor: Colors.white, borderRadius: 16, padding: 32,
    alignItems: 'center', borderWidth: 1, borderColor: Colors.border,
  },
  emptyText: { color: Colors.muted, fontSize: 15 },
  card: {
    backgroundColor: Colors.white, borderRadius: 18, padding: 16,
    borderWidth: 1, borderColor: Colors.border,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  clientName: { fontSize: 16, fontWeight: '600', color: Colors.text },
  badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 100 },
  badgeText: { fontSize: 12, fontWeight: '600', textTransform: 'capitalize' },
  service: { fontSize: 14, color: Colors.muted, marginBottom: 10 },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between' },
  dateTime: { fontSize: 13, color: Colors.text, fontWeight: '500' },
  timeAgo: { fontSize: 12, color: Colors.section },
})
