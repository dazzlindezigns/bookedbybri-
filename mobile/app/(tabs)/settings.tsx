import { useState, useCallback } from 'react'
import {
  View, Text, ScrollView, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useFocusEffect } from '@react-navigation/native'
import { supabase } from '@/lib/supabase'
import { api } from '@/lib/api'
import { Colors } from '@/constants/colors'

type Settings = Record<string, string>

export default function SettingsScreen() {
  const [s, setS] = useState<Settings>({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useFocusEffect(useCallback(() => {
    api.fetchSettings().then(setS)
  }, []))

  const field = (key: string, value: string) => setS((p) => ({ ...p, [key]: value }))

  const handleSave = async () => {
    setSaving(true)
    await api.patchSettings(s)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleSignOut = () => {
    Alert.alert('Sign out?', '', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: () => supabase.auth.signOut() },
    ])
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
        </View>

        <Text style={styles.section}>BUSINESS INFO</Text>
        <Field label="Business name" value={s.business_name} onChangeText={(v) => field('business_name', v)} />
        <Field label="Location" value={s.location} onChangeText={(v) => field('location', v)} placeholder="City, State" />
        <Field label="Phone" value={s.phone} onChangeText={(v) => field('phone', v)} placeholder="+1 (555) 000-0000" keyboardType="phone-pad" />
        <Field label="Bio" value={s.bio} onChangeText={(v) => field('bio', v)} multiline />

        <Text style={styles.section}>SOCIAL</Text>
        <Field label="Instagram" value={s.instagram} onChangeText={(v) => field('instagram', v)} placeholder="@handle" />
        <Field label="Facebook" value={s.facebook} onChangeText={(v) => field('facebook', v)} placeholder="@handle" />

        <Text style={styles.section}>PAYMENT HANDLES</Text>
        <Field label="CashApp" value={s.cashapp_handle} onChangeText={(v) => field('cashapp_handle', v)} placeholder="$handle" />
        <Field label="Zelle" value={s.zelle_contact} onChangeText={(v) => field('zelle_contact', v)} />

        <TouchableOpacity
          style={[styles.saveBtn, saving && { opacity: 0.6 }]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving
            ? <ActivityIndicator color={Colors.text} />
            : <Text style={styles.saveBtnText}>{saved ? '✓ Saved!' : 'Save settings'}</Text>
          }
        </TouchableOpacity>

        <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Sign out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

function Field({
  label, value, onChangeText, placeholder, multiline, keyboardType,
}: {
  label: string
  value?: string
  onChangeText: (v: string) => void
  placeholder?: string
  multiline?: boolean
  keyboardType?: 'default' | 'phone-pad' | 'email-address'
}) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={[styles.fieldInput, multiline && { minHeight: 80, textAlignVertical: 'top' }]}
        value={value ?? ''}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.muted}
        multiline={multiline}
        keyboardType={keyboardType}
        autoCapitalize="none"
      />
    </View>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  scroll: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 4 },
  title: { fontSize: 30, fontWeight: '700', color: Colors.text },
  section: {
    fontSize: 11, letterSpacing: 2, textTransform: 'uppercase',
    color: Colors.section, paddingHorizontal: 20, marginTop: 20, marginBottom: 8,
  },
  fieldWrap: { paddingHorizontal: 16, marginBottom: 10 },
  fieldLabel: { fontSize: 12, color: Colors.muted, marginBottom: 6 },
  fieldInput: {
    backgroundColor: Colors.white, borderRadius: 14, padding: 14,
    fontSize: 15, color: Colors.text, borderWidth: 1, borderColor: Colors.border,
  },
  saveBtn: {
    marginHorizontal: 16, marginTop: 24, paddingVertical: 16,
    borderRadius: 100, backgroundColor: Colors.pink, alignItems: 'center',
  },
  saveBtnText: { fontSize: 16, fontWeight: '700', color: Colors.text },
  signOutBtn: {
    marginHorizontal: 16, marginTop: 12, paddingVertical: 16,
    borderRadius: 100, borderWidth: 1, borderColor: Colors.border, alignItems: 'center',
  },
  signOutText: { fontSize: 15, color: Colors.red, fontWeight: '500' },
})
