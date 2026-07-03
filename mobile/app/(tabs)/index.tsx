import { useState, useCallback } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { useFocusEffect } from '@react-navigation/native'
import { Colors } from '@/constants/colors'
import { api } from '@/lib/api'
import { Booking } from '@/lib/types'

export default function DashboardScreen() {
  const [pending, setPending] = useState<Booking[]>([])
  const [todayAppts, setTodayAppts] = useState<Booking[]>([])
  const [refreshing, setRefreshing] = useState(false)
  const router = useRouter()

  const today = new Date().toISOString().split('T')[0]

  const load = async () => {
    const [pendingRes, confirmedRes] = await Promise.all([
      api.fetchBookings('pending'),
      api.fetchBookings('confirmed'),
    ])
    setPending(Array.isArray(pendingRes) ? pendingRes : [])
    const confirmed: Booking[] = Array.isArray(confirmedRes) ? confirmedRes : []
    setTodayAppts(confirmed.filter((b) => b.appointment_date === today))
  }

  useFocusEffect(useCallback(() => { load() }, []))

  const onRefresh = async () => {
    setRefreshing(true)
    await load()
    setRefreshing(false)
  }

  const dayName = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: 32 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.pink} />}
      >
        <View style={styles.header}>
          <Text style={styles.greeting}>Hey Bri! 👋</Text>
          <Text style={styles.date}>{dayName}</Text>
        </View>

        {pending.length > 0 && (
          <TouchableOpacity style={styles.pendingCard} onPress={() => router.push('/(tabs)/requests')}>
            <View>
              <Text style={styles.pendingCount}>{pending.length}</Text>
              <Text style={styles.pendingLabel}>
                {pending.length === 1 ? 'Request waiting' : 'Requests waiting'}
              </Text>
            </View>
            <Text style={styles.arrow}>→</Text>
          </TouchableOpacity>
        )}

        {pending.length === 0 && (
          <View style={styles.allClearCard}>
            <Text style={styles.allClearText}>All caught up ✓</Text>
          </View>
        )}

        <Text style={styles.sectionLabel}>TODAY</Text>
        {todayAppts.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No appointments today</Text>
          </View>
        ) : (
          todayAppts.map((b) => (
            <TouchableOpacity
              key={b.id}
              style={styles.apptCard}
              onPress={() => router.push(`/request/${b.id}`)}
            >
              <Text style={styles.apptTime}>{b.appointment_time}</Text>
              <View style={styles.apptInfo}>
                <Text style={styles.apptName}>{b.client_name}</Text>
                <Text style={styles.apptService}>{b.services?.name}</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  scroll: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20 },
  greeting: { fontSize: 30, fontWeight: '700', color: Colors.text },
  date: { fontSize: 14, color: Colors.muted, marginTop: 2 },
  pendingCard: {
    marginHorizontal: 16, marginBottom: 16,
    backgroundColor: Colors.pink, borderRadius: 20, padding: 22,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  pendingCount: { fontSize: 44, fontWeight: '800', color: Colors.text },
  pendingLabel: { fontSize: 14, color: Colors.text, marginTop: 2 },
  arrow: { fontSize: 28, color: Colors.text },
  allClearCard: {
    marginHorizontal: 16, marginBottom: 16,
    backgroundColor: Colors.white, borderRadius: 20, padding: 20,
    borderWidth: 1, borderColor: Colors.border, alignItems: 'center',
  },
  allClearText: { color: Colors.muted, fontSize: 15 },
  sectionLabel: {
    fontSize: 11, letterSpacing: 2, textTransform: 'uppercase',
    color: Colors.section, paddingHorizontal: 20, marginBottom: 10,
  },
  emptyCard: {
    marginHorizontal: 16,
    backgroundColor: Colors.white, borderRadius: 16, padding: 20,
    borderWidth: 1, borderColor: Colors.border, alignItems: 'center',
  },
  emptyText: { color: Colors.muted, fontSize: 14 },
  apptCard: {
    marginHorizontal: 16, marginBottom: 8,
    backgroundColor: Colors.white, borderRadius: 16, padding: 16,
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: Colors.border,
  },
  apptTime: { fontSize: 14, fontWeight: '600', color: Colors.darkPink, width: 76 },
  apptInfo: { flex: 1 },
  apptName: { fontSize: 15, fontWeight: '600', color: Colors.text },
  apptService: { fontSize: 13, color: Colors.muted, marginTop: 2 },
  chevron: { fontSize: 22, color: Colors.muted },
})
