import { useState, useCallback, useMemo } from 'react'
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, RefreshControl } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { Ionicons } from '@expo/vector-icons'
import { useFocusEffect } from '@react-navigation/native'
import { useRouter } from 'expo-router'
import { Colors } from '@/constants/colors'
import { api } from '@/lib/api'
import type { PersonRecord } from '@/lib/types'

type Tab = 'all' | 'clients' | 'contacts'

function initials(name: string) {
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
}

function timeAgo(iso: string) {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (mins < 1) return 'Now'
  if (mins < 60) return `${mins}m`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d`
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function ClientsScreen() {
  const [people, setPeople] = useState<PersonRecord[]>([])
  const [tab, setTab] = useState<Tab>('all')
  const [search, setSearch] = useState('')
  const [refreshing, setRefreshing] = useState(false)
  const router = useRouter()

  const load = async () => {
    const res = await api.fetchPeople()
    setPeople(Array.isArray(res) ? res : [])
  }

  useFocusEffect(useCallback(() => { load() }, []))

  const onRefresh = async () => {
    setRefreshing(true)
    await load()
    setRefreshing(false)
  }

  const filtered = useMemo(() => {
    let list = people
    if (tab === 'clients') list = list.filter((p) => p.type === 'booking')
    if (tab === 'contacts') list = list.filter((p) => p.type === 'contact')
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.phone || '').includes(q) ||
          (p.email || '').toLowerCase().includes(q)
      )
    }
    return list
  }, [people, tab, search])

  const counts = {
    all: people.length,
    clients: people.filter((p) => p.type === 'booking').length,
    contacts: people.filter((p) => p.type === 'contact').length,
  }

  const hrefFor = (p: PersonRecord) =>
    p.type === 'booking' ? `/request/${p.id}` : `/contact/${p.id}`

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="light" />

      {/* Dark header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>Clients</Text>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="person-add-outline" size={22} color="rgba(255,255,255,0.7)" />
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={16} color="rgba(255,255,255,0.4)" />
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Search clients..."
            placeholderTextColor="rgba(255,255,255,0.3)"
          />
          {search ? (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={16} color="rgba(255,255,255,0.4)" />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Action buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.primaryBtn}>
            <Ionicons name="add" size={16} color={Colors.text} />
            <Text style={styles.primaryBtnText}>New Message</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.outlineBtn}>
            <Ionicons name="add" size={16} color={Colors.white} />
            <Text style={styles.outlineBtnText}>New Client</Text>
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={styles.tabRow}>
          {(['all', 'clients', 'contacts'] as Tab[]).map((t) => (
            <TouchableOpacity
              key={t}
              style={[styles.tabChip, tab === t && styles.tabChipActive]}
              onPress={() => setTab(t)}
            >
              <Text style={[styles.tabChipText, tab === t && styles.tabChipTextActive]}>
                {t === 'all' ? 'All' : t === 'clients' ? 'Clients' : 'Contacts'} · {counts[t]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* List */}
      <FlatList
        style={styles.list}
        data={filtered}
        keyExtractor={(p) => `${p.type}-${p.id}`}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.pink} />
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={styles.emptyCard}>
            <Ionicons name="people-outline" size={36} color={Colors.border} />
            <Text style={styles.emptyText}>{search ? 'No results' : 'No people yet'}</Text>
          </View>
        }
        renderItem={({ item: p }) => (
          <TouchableOpacity
            style={styles.row}
            onPress={() => router.push(hrefFor(p) as any)}
          >
            <View style={[styles.avatar, p.type === 'booking' ? styles.avatarPink : styles.avatarGray]}>
              <Text
                style={[
                  styles.avatarText,
                  { color: p.type === 'booking' ? Colors.darkPink : Colors.muted },
                ]}
              >
                {initials(p.name)}
              </Text>
            </View>
            <View style={styles.rowInfo}>
              <View style={styles.rowTop}>
                <Text style={styles.rowName} numberOfLines={1}>{p.name}</Text>
                {p.lastMessageAt && (
                  <Text style={styles.rowTime}>{timeAgo(p.lastMessageAt)}</Text>
                )}
              </View>
              <Text style={styles.rowPreview} numberOfLines={1}>
                {p.lastMessage
                  ? (p.lastDirection === 'outbound' ? 'You: ' : '') + p.lastMessage
                  : p.phone || p.email || ''}
              </Text>
            </View>
            {p.lastDirection === 'inbound' && <View style={styles.unreadDot} />}
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.dark },

  header: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 14 },
  headerTop: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14,
  },
  title: { fontSize: 24, fontWeight: '700', color: Colors.white },
  iconBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },

  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12,
    paddingHorizontal: 12, paddingVertical: 10, marginBottom: 12,
  },
  searchInput: { flex: 1, fontSize: 14, color: Colors.white },

  actionRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  primaryBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4,
    backgroundColor: Colors.pink, borderRadius: 50, paddingVertical: 10,
  },
  primaryBtnText: { fontSize: 13, fontWeight: '600', color: Colors.text },
  outlineBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4,
    backgroundColor: 'transparent', borderRadius: 50, paddingVertical: 10,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)',
  },
  outlineBtnText: { fontSize: 13, fontWeight: '600', color: Colors.white },

  tabRow: { flexDirection: 'row', gap: 6 },
  tabChip: {
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
  },
  tabChipActive: { backgroundColor: Colors.white, borderColor: Colors.white },
  tabChipText: { fontSize: 12, fontWeight: '500', color: 'rgba(255,255,255,0.55)' },
  tabChipTextActive: { color: Colors.text },

  list: { flex: 1, backgroundColor: Colors.white },
  separator: { height: 1, backgroundColor: Colors.border, marginLeft: 76 },
  emptyCard: {
    margin: 24, padding: 32, alignItems: 'center', gap: 10,
    backgroundColor: Colors.bg, borderRadius: 16, borderWidth: 1, borderColor: Colors.border,
  },
  emptyText: { color: Colors.muted, fontSize: 14 },

  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 13, backgroundColor: Colors.white,
  },
  avatar: {
    width: 48, height: 48, borderRadius: 24,
    alignItems: 'center', justifyContent: 'center', marginRight: 12, flexShrink: 0,
  },
  avatarPink: { backgroundColor: '#fff0f8' },
  avatarGray: { backgroundColor: Colors.bg },
  avatarText: { fontSize: 15, fontWeight: '700' },
  rowInfo: { flex: 1 },
  rowTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 },
  rowName: { fontSize: 15, fontWeight: '600', color: Colors.text, flex: 1, marginRight: 8 },
  rowTime: { fontSize: 12, color: Colors.section, flexShrink: 0 },
  rowPreview: { fontSize: 13, color: Colors.muted },
  unreadDot: {
    width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.pink, flexShrink: 0, marginLeft: 6,
  },
})
