import { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { Ionicons } from '@expo/vector-icons'
import { Colors } from '@/constants/colors'

type PhoneTab = 'keypad' | 'recents' | 'contacts' | 'voicemail'

const KEYS: [string, string][][] = [
  [['1', ''], ['2', 'ABC'], ['3', 'DEF']],
  [['4', 'GHI'], ['5', 'JKL'], ['6', 'MNO']],
  [['7', 'PQRS'], ['8', 'TUV'], ['9', 'WXYZ']],
  [['*', ''], ['0', '+'], ['#', '']],
]

const SUB_TABS: { key: PhoneTab; icon: React.ComponentProps<typeof Ionicons>['name']; label: string }[] = [
  { key: 'keypad', icon: 'keypad-outline', label: 'Keypad' },
  { key: 'recents', icon: 'time-outline', label: 'Recents' },
  { key: 'contacts', icon: 'people-outline', label: 'Contacts' },
  { key: 'voicemail', icon: 'recording-outline', label: 'Voicemail' },
]

export default function PhoneScreen() {
  const [activeTab, setActiveTab] = useState<PhoneTab>('keypad')
  const [number, setNumber] = useState('')

  const pressKey = (digit: string) => {
    if (!digit) return
    setNumber((n) => n + digit)
  }

  const handleCall = () => {
    if (!number) return
    Alert.alert(
      'Coming Soon',
      'Calling will be available once your Telnyx number is connected.',
      [{ text: 'OK' }]
    )
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }} />
        <Text style={styles.title}>Phone</Text>
        <View style={{ flex: 1, alignItems: 'flex-end' }}>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="settings-outline" size={22} color="rgba(255,255,255,0.6)" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Sub-tabs */}
      <View style={styles.subTabBar}>
        {SUB_TABS.map((t) => (
          <TouchableOpacity
            key={t.key}
            style={[styles.subTab, activeTab === t.key && styles.subTabActive]}
            onPress={() => setActiveTab(t.key)}
          >
            <Ionicons
              name={t.icon}
              size={20}
              color={activeTab === t.key ? Colors.pink : 'rgba(255,255,255,0.35)'}
            />
            <Text style={[styles.subTabLabel, activeTab === t.key && { color: Colors.pink }]}>
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <View style={styles.content}>
        {activeTab === 'keypad' && (
          <View style={styles.keypad}>
            <Text style={styles.myNumberLabel}>My Number</Text>
            <Text style={styles.myNumber}>Telnyx number goes here</Text>

            {/* Number display */}
            <View style={styles.displayRow}>
              <Text style={styles.displayNumber} numberOfLines={1} adjustsFontSizeToFit>
                {number || ' '}
              </Text>
              {number.length > 0 && (
                <TouchableOpacity
                  style={styles.backspace}
                  onPress={() => setNumber((n) => n.slice(0, -1))}
                  onLongPress={() => setNumber('')}
                >
                  <Ionicons name="backspace-outline" size={24} color={Colors.muted} />
                </TouchableOpacity>
              )}
            </View>

            {/* Grid */}
            <View style={styles.grid}>
              {KEYS.map((row, ri) => (
                <View key={ri} style={styles.gridRow}>
                  {row.map(([digit, letters]) => (
                    <TouchableOpacity
                      key={digit}
                      style={styles.key}
                      onPress={() => pressKey(digit)}
                    >
                      <Text style={styles.keyDigit}>{digit}</Text>
                      {letters ? <Text style={styles.keyLetters}>{letters}</Text> : null}
                    </TouchableOpacity>
                  ))}
                </View>
              ))}
            </View>

            {/* Call button */}
            <TouchableOpacity
              style={[styles.callBtn, !number && { opacity: 0.45 }]}
              onPress={handleCall}
              disabled={!number}
            >
              <Ionicons name="call" size={30} color={Colors.text} />
            </TouchableOpacity>
          </View>
        )}

        {activeTab === 'recents' && (
          <View style={styles.emptyState}>
            <Ionicons name="time-outline" size={52} color={Colors.border} />
            <Text style={styles.emptyTitle}>No recent calls</Text>
            <Text style={styles.emptySub}>Call history will appear here once Telnyx is connected</Text>
          </View>
        )}

        {activeTab === 'contacts' && (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={52} color={Colors.border} />
            <Text style={styles.emptyTitle}>Find contacts in the Clients tab</Text>
          </View>
        )}

        {activeTab === 'voicemail' && (
          <View style={styles.emptyState}>
            <Ionicons name="recording-outline" size={52} color={Colors.border} />
            <Text style={styles.emptyTitle}>No voicemails</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.dark },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12,
  },
  title: { fontSize: 20, fontWeight: '700', color: Colors.white },
  iconBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },

  subTabBar: {
    flexDirection: 'row',
    borderTopWidth: 1, borderBottomWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  subTab: { flex: 1, alignItems: 'center', paddingVertical: 10, gap: 3 },
  subTabActive: { borderBottomWidth: 2, borderBottomColor: Colors.pink },
  subTabLabel: { fontSize: 10, color: 'rgba(255,255,255,0.35)', fontWeight: '500' },

  content: { flex: 1, backgroundColor: Colors.bg },

  keypad: { flex: 1, paddingHorizontal: 28, paddingTop: 24, alignItems: 'center' },
  myNumberLabel: { fontSize: 11, color: Colors.section, letterSpacing: 1, marginBottom: 4 },
  myNumber: { fontSize: 15, fontWeight: '500', color: Colors.muted, marginBottom: 20 },

  displayRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 12, minHeight: 52, marginBottom: 24, width: '100%',
  },
  displayNumber: {
    fontSize: 38, fontWeight: '300', color: Colors.text, letterSpacing: 3, flex: 1, textAlign: 'center',
  },
  backspace: { position: 'absolute', right: 0 },

  grid: { width: '100%', gap: 10 },
  gridRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  key: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingVertical: 14, backgroundColor: Colors.white,
    borderRadius: 50, borderWidth: 1, borderColor: Colors.border,
  },
  keyDigit: { fontSize: 26, fontWeight: '300', color: Colors.text },
  keyLetters: { fontSize: 9, color: Colors.muted, letterSpacing: 1.5, marginTop: 1 },

  callBtn: {
    marginTop: 28, width: 72, height: 72, borderRadius: 36,
    backgroundColor: Colors.pink, alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.darkPink, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 10, elevation: 8,
  },

  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingHorizontal: 40 },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: Colors.muted, textAlign: 'center' },
  emptySub: { fontSize: 13, color: Colors.section, textAlign: 'center', lineHeight: 20 },
})
