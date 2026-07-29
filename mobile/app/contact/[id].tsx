import { useState, useCallback, useRef } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  TextInput, KeyboardAvoidingView, Platform, FlatList, Linking,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { Ionicons } from '@expo/vector-icons'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useFocusEffect } from '@react-navigation/native'
import { Colors } from '@/constants/colors'
import { api } from '@/lib/api'

type Contact = {
  id: string
  name: string | null
  phone: string | null
  email: string | null
  notes: string | null
  created_at: string
}
type Message = { id: string; direction: 'inbound' | 'outbound'; body: string; created_at: string }
type Tab = 'overview' | 'messages' | 'notes'

function initials(name: string | null) {
  if (!name) return '?'
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
}

function timeLabel(iso: string) {
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

export default function ContactProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const [contact, setContact] = useState<Contact | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [tab, setTab] = useState<Tab>('overview')
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [notes, setNotes] = useState('')
  const [savingNotes, setSavingNotes] = useState(false)
  const flatListRef = useRef<FlatList>(null)

  const load = async () => {
    const [contactData, msgsData] = await Promise.all([
      api.fetchContact(id),
      api.fetchContactMessages(id),
    ])
    setContact(contactData)
    setMessages(Array.isArray(msgsData) ? msgsData : [])
    setEditName(contactData?.name || '')
    setEditPhone(contactData?.phone || '')
    setEditEmail(contactData?.email || '')
    setNotes(contactData?.notes || '')
  }

  useFocusEffect(useCallback(() => { load() }, [id]))

  const handleSend = async () => {
    if (!newMessage.trim() || sending) return
    setSending(true)
    const body = newMessage.trim()
    setNewMessage('')
    await api.sendContactMessage(id, body)
    await load()
    setSending(false)
  }

  const handleSave = async () => {
    await api.updateContact(id, { name: editName, phone: editPhone, email: editEmail })
    setEditing(false)
    await load()
  }

  const handleSaveNotes = async () => {
    setSavingNotes(true)
    await api.updateContact(id, { notes })
    setSavingNotes(false)
    await load()
  }

  if (!contact) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: Colors.muted }}>Loading...</Text>
        </View>
      </SafeAreaView>
    )
  }

  const displayName = contact.name || contact.phone || 'Unknown'

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="light" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

        {/* Dark header */}
        <View style={styles.header}>
          <View style={styles.headerNav}>
            <TouchableOpacity onPress={() => router.back()} style={styles.navBtn}>
              <Ionicons name="chevron-back" size={22} color="rgba(255,255,255,0.8)" />
            </TouchableOpacity>
            {editing ? (
              <View style={styles.editActions}>
                <TouchableOpacity onPress={handleSave} style={styles.saveBtn}>
                  <Ionicons name="checkmark" size={16} color={Colors.text} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setEditing(false)} style={styles.cancelBtn}>
                  <Ionicons name="close" size={16} color="rgba(255,255,255,0.5)" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity onPress={() => setEditing(true)} style={styles.navBtn}>
                <Ionicons name="pencil-outline" size={18} color="rgba(255,255,255,0.5)" />
              </TouchableOpacity>
            )}
          </View>

          {/* Avatar + name */}
          <View style={styles.profileSection}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials(contact.name)}</Text>
            </View>
            {editing ? (
              <View style={styles.editFields}>
                <TextInput
                  value={editName}
                  onChangeText={setEditName}
                  placeholder="Full name"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  style={styles.editInput}
                />
                <TextInput
                  value={editPhone}
                  onChangeText={setEditPhone}
                  placeholder="Phone"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  style={styles.editInput}
                  keyboardType="phone-pad"
                />
                <TextInput
                  value={editEmail}
                  onChangeText={setEditEmail}
                  placeholder="Email"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  style={styles.editInput}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            ) : (
              <>
                <Text style={styles.profileName}>{displayName}</Text>
                {contact.phone ? <Text style={styles.profilePhone}>{contact.phone}</Text> : null}
              </>
            )}
          </View>

          {/* Action buttons */}
          {!editing && (
            <View style={styles.actions}>
              {contact.phone ? (
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => Linking.openURL(`tel:${contact.phone}`)}
                >
                  <View style={styles.actionIcon}>
                    <Ionicons name="call-outline" size={18} color="white" />
                  </View>
                  <Text style={styles.actionLabel}>Call</Text>
                </TouchableOpacity>
              ) : null}
              <TouchableOpacity style={styles.actionBtn} onPress={() => setTab('messages')}>
                <View style={styles.actionIcon}>
                  <Ionicons name="chatbubble-outline" size={18} color="white" />
                </View>
                <Text style={styles.actionLabel}>Text</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn}>
                <View style={styles.actionIcon}>
                  <Ionicons name="calendar-outline" size={18} color="white" />
                </View>
                <Text style={styles.actionLabel}>Book</Text>
              </TouchableOpacity>
              {contact.email ? (
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => Linking.openURL(`mailto:${contact.email}`)}
                >
                  <View style={styles.actionIcon}>
                    <Ionicons name="mail-outline" size={18} color="white" />
                  </View>
                  <Text style={styles.actionLabel}>Email</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          )}
        </View>

        {/* Tab bar */}
        <View style={styles.tabBar}>
          {(['overview', 'messages', 'notes'] as Tab[]).map((t) => (
            <TouchableOpacity
              key={t}
              style={[styles.tabItem, tab === t && styles.tabItemActive]}
              onPress={() => setTab(t)}
            >
              <Text style={[styles.tabLabel, tab === t && styles.tabLabelActive]}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Content */}
        <View style={styles.content}>

          {tab === 'overview' && (
            <ScrollView contentContainerStyle={styles.overviewInner}>
              <View style={styles.infoCard}>
                {contact.phone ? (
                  <View style={[styles.infoRow, styles.infoRowBorder]}>
                    <Ionicons name="call-outline" size={15} color={Colors.darkPink} />
                    <Text style={styles.infoText}>{contact.phone}</Text>
                  </View>
                ) : null}
                {contact.email ? (
                  <View style={[styles.infoRow, styles.infoRowBorder]}>
                    <Ionicons name="mail-outline" size={15} color={Colors.darkPink} />
                    <Text style={styles.infoText}>{contact.email}</Text>
                  </View>
                ) : null}
                {contact.created_at ? (
                  <View style={styles.infoRow}>
                    <Ionicons name="calendar-outline" size={15} color={Colors.darkPink} />
                    <Text style={[styles.infoText, { color: Colors.muted }]}>
                      Contact since {new Date(contact.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </Text>
                  </View>
                ) : null}
              </View>

              {messages.length > 0 && (
                <View>
                  <Text style={styles.sectionLabel}>LAST MESSAGE</Text>
                  <TouchableOpacity style={styles.previewCard} onPress={() => setTab('messages')}>
                    <Text style={styles.previewText} numberOfLines={2}>
                      {messages[messages.length - 1].body}
                    </Text>
                    <Text style={styles.previewTime}>
                      {timeLabel(messages[messages.length - 1].created_at)}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              <View>
                <Text style={styles.sectionLabel}>NOTES</Text>
                <TouchableOpacity style={styles.previewCard} onPress={() => setTab('notes')}>
                  {contact.notes ? (
                    <Text style={styles.previewText} numberOfLines={3}>{contact.notes}</Text>
                  ) : (
                    <Text style={[styles.previewText, { color: Colors.muted }]}>Tap to add notes...</Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}

          {tab === 'messages' && (
            <View style={{ flex: 1 }}>
              <FlatList
                ref={flatListRef}
                data={messages}
                keyExtractor={(m) => m.id}
                contentContainerStyle={styles.messagesList}
                onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
                ListEmptyComponent={<Text style={styles.emptyMsg}>No messages yet</Text>}
                renderItem={({ item: msg }) => (
                  <View style={[styles.msgRow, msg.direction === 'outbound' ? styles.msgRowOut : styles.msgRowIn]}>
                    <View style={[styles.bubble, msg.direction === 'outbound' ? styles.bubbleOut : styles.bubbleIn]}>
                      <Text style={[styles.bubbleText, { color: msg.direction === 'outbound' ? 'white' : Colors.text }]}>
                        {msg.body}
                      </Text>
                      <Text style={[styles.bubbleTime, { color: msg.direction === 'outbound' ? 'rgba(255,255,255,0.4)' : Colors.muted }]}>
                        {timeLabel(msg.created_at)}
                      </Text>
                    </View>
                  </View>
                )}
              />
              <View style={styles.inputBar}>
                <TextInput
                  value={newMessage}
                  onChangeText={setNewMessage}
                  placeholder="Message..."
                  placeholderTextColor={Colors.muted}
                  style={styles.messageInput}
                  multiline
                />
                <TouchableOpacity
                  style={[styles.sendBtn, (!newMessage.trim() || sending) && { opacity: 0.4 }]}
                  onPress={handleSend}
                  disabled={!newMessage.trim() || sending}
                >
                  <Ionicons name="send" size={16} color={Colors.text} />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {tab === 'notes' && (
            <View style={{ flex: 1, padding: 16 }}>
              <TextInput
                value={notes}
                onChangeText={setNotes}
                placeholder="Add notes about this contact..."
                placeholderTextColor={Colors.muted}
                style={styles.notesInput}
                multiline
                textAlignVertical="top"
              />
              <TouchableOpacity
                style={[styles.saveNotesBtn, savingNotes && { opacity: 0.5 }]}
                onPress={handleSaveNotes}
                disabled={savingNotes}
              >
                <Text style={styles.saveNotesBtnText}>{savingNotes ? 'Saving...' : 'Save Notes'}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.dark },

  header: { backgroundColor: Colors.dark, paddingHorizontal: 16, paddingTop: 8, paddingBottom: 20 },
  headerNav: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  navBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  editActions: { flexDirection: 'row', gap: 8 },
  saveBtn: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.pink,
    alignItems: 'center', justifyContent: 'center',
  },
  cancelBtn: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center', justifyContent: 'center',
  },

  profileSection: { alignItems: 'center', gap: 8, marginBottom: 16 },
  avatar: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: '#fff0f8',
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 24, fontWeight: '700', color: Colors.darkPink },
  profileName: { fontSize: 20, fontWeight: '700', color: 'white' },
  profilePhone: { fontSize: 14, color: Colors.pink },

  editFields: { width: '100%', gap: 8 },
  editInput: {
    backgroundColor: 'rgba(255,255,255,0.1)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, color: 'white', textAlign: 'center',
  },

  actions: { flexDirection: 'row', justifyContent: 'center', gap: 24 },
  actionBtn: { alignItems: 'center', gap: 6 },
  actionIcon: {
    width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center', justifyContent: 'center',
  },
  actionLabel: { fontSize: 10, color: 'rgba(255,255,255,0.5)' },

  tabBar: {
    flexDirection: 'row', backgroundColor: Colors.dark,
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)',
  },
  tabItem: {
    flex: 1, alignItems: 'center', paddingVertical: 12,
    borderBottomWidth: 2, borderBottomColor: 'transparent',
  },
  tabItemActive: { borderBottomColor: Colors.pink },
  tabLabel: { fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.35)' },
  tabLabelActive: { color: Colors.pink },

  content: { flex: 1, backgroundColor: Colors.bg },

  overviewInner: { padding: 16, gap: 16 },
  infoCard: {
    backgroundColor: Colors.white, borderRadius: 16,
    borderWidth: 1, borderColor: Colors.border, overflow: 'hidden',
  },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  infoRowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  infoText: { fontSize: 14, color: Colors.text },

  sectionLabel: {
    fontSize: 11, color: Colors.section, fontWeight: '600', letterSpacing: 1.5, marginBottom: 8, marginLeft: 4,
  },
  previewCard: {
    backgroundColor: Colors.white, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, padding: 16,
  },
  previewText: { fontSize: 14, color: Colors.text, lineHeight: 20 },
  previewTime: { fontSize: 11, color: Colors.muted, marginTop: 4 },

  messagesList: { padding: 16, gap: 8, paddingBottom: 8 },
  emptyMsg: { textAlign: 'center', color: Colors.muted, fontSize: 13, marginTop: 40 },
  msgRow: { flexDirection: 'row' },
  msgRowOut: { justifyContent: 'flex-end' },
  msgRowIn: { justifyContent: 'flex-start' },
  bubble: { maxWidth: '78%', borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10 },
  bubbleOut: { backgroundColor: Colors.dark, borderBottomRightRadius: 4 },
  bubbleIn: { backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.border, borderBottomLeftRadius: 4 },
  bubbleText: { fontSize: 14, lineHeight: 20 },
  bubbleTime: { fontSize: 10, marginTop: 2 },

  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 8,
    backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: Colors.border,
    paddingHorizontal: 16, paddingVertical: 12,
  },
  messageInput: {
    flex: 1, borderWidth: 1, borderColor: Colors.border, borderRadius: 20,
    paddingHorizontal: 16, paddingVertical: 10, fontSize: 14, color: Colors.text, maxHeight: 100,
  },
  sendBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.pink,
    alignItems: 'center', justifyContent: 'center',
  },

  notesInput: {
    flex: 1, backgroundColor: Colors.white, borderRadius: 16, borderWidth: 1, borderColor: Colors.border,
    padding: 16, fontSize: 14, color: Colors.text, marginBottom: 12,
  },
  saveNotesBtn: { backgroundColor: Colors.pink, borderRadius: 50, paddingVertical: 14, alignItems: 'center' },
  saveNotesBtnText: { fontSize: 15, fontWeight: '600', color: Colors.text },
})
