import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { Colors } from '@/constants/colors'
import { supabase } from '@/lib/supabase'

type MenuItem = {
  label: string
  sub?: string
  icon: React.ComponentProps<typeof Ionicons>['name']
  href?: string
  onPress?: () => void
  danger?: boolean
}

export default function MoreScreen() {
  const router = useRouter()

  const handleSignOut = () => {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: () => supabase.auth.signOut() },
    ])
  }

  const sections: { title: string; items: MenuItem[] }[] = [
    {
      title: 'Business',
      items: [
        { label: 'Services', sub: 'Manage your service menu', icon: 'cut-outline', href: '/(tabs)/services' },
        { label: 'Gallery', sub: 'Portfolio & inspiration', icon: 'images-outline', href: '/(tabs)/services' },
        { label: 'Broadcast', sub: 'Message all clients at once', icon: 'megaphone-outline', href: '/(tabs)/services' },
      ],
    },
    {
      title: 'Account',
      items: [
        { label: 'Settings', sub: 'Business info & socials', icon: 'settings-outline', href: '/(tabs)/settings' },
      ],
    },
  ]

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="light" />

      <View style={styles.header}>
        <Text style={styles.title}>More</Text>
      </View>

      <View style={styles.content}>
        {sections.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionLabel}>{section.title.toUpperCase()}</Text>
            <View style={styles.card}>
              {section.items.map((item, i) => (
                <TouchableOpacity
                  key={item.label}
                  style={[styles.row, i < section.items.length - 1 && styles.rowBorder]}
                  onPress={() => item.href ? router.push(item.href as any) : item.onPress?.()}
                >
                  <View style={styles.iconWrap}>
                    <Ionicons name={item.icon} size={19} color={Colors.darkPink} />
                  </View>
                  <View style={styles.rowText}>
                    <Text style={styles.rowLabel}>{item.label}</Text>
                    {item.sub && <Text style={styles.rowSub}>{item.sub}</Text>}
                  </View>
                  <Ionicons name="chevron-forward" size={17} color={Colors.section} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={18} color={Colors.red} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.dark },

  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 28 },
  title: { fontSize: 24, fontWeight: '700', color: Colors.white },

  content: {
    flex: 1, backgroundColor: Colors.bg,
    borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20,
  },

  section: { marginBottom: 20 },
  sectionLabel: {
    fontSize: 11, letterSpacing: 2, fontWeight: '600', color: Colors.section, marginBottom: 8,
  },
  card: {
    backgroundColor: Colors.white, borderRadius: 16,
    borderWidth: 1, borderColor: Colors.border, overflow: 'hidden',
  },
  row: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  iconWrap: {
    width: 38, height: 38, borderRadius: 10,
    backgroundColor: '#fff0f8', alignItems: 'center', justifyContent: 'center',
  },
  rowText: { flex: 1 },
  rowLabel: { fontSize: 15, fontWeight: '500', color: Colors.text },
  rowSub: { fontSize: 12, color: Colors.muted, marginTop: 1 },

  signOutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: Colors.white, borderRadius: 16,
    borderWidth: 1, borderColor: '#ffe4e4', paddingVertical: 16,
  },
  signOutText: { fontSize: 15, fontWeight: '600', color: Colors.red },
})
