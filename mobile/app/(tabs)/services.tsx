import { useState, useCallback } from 'react'
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, Modal,
  TextInput, ScrollView, RefreshControl, ActivityIndicator, Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useFocusEffect } from '@react-navigation/native'
import { Colors } from '@/constants/colors'
import { api } from '@/lib/api'
import { Service } from '@/lib/types'

type SvcForm = {
  name: string
  description: string
  base_price: string
  duration_hours: string
  requires_consultation: boolean
  hair_included: boolean
}

const EMPTY: SvcForm = {
  name: '', description: '', base_price: '', duration_hours: '3',
  requires_consultation: false, hair_included: false,
}

function ServiceModal({
  visible, title, form, setForm, onSave, onClose, saving, error,
}: {
  visible: boolean; title: string; form: SvcForm
  setForm: (f: SvcForm) => void; onSave: () => void; onClose: () => void
  saving: boolean; error: string
}) {
  const set = (k: keyof SvcForm, v: string | boolean) => setForm({ ...form, [k]: v })
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bg }}>
        <View style={modal.header}>
          <TouchableOpacity onPress={onClose}>
            <Text style={modal.cancel}>Cancel</Text>
          </TouchableOpacity>
          <Text style={modal.title}>{title}</Text>
          <TouchableOpacity onPress={onSave} disabled={saving || !form.name}>
            {saving
              ? <ActivityIndicator color={Colors.darkPink} />
              : <Text style={[modal.save, !form.name && { opacity: 0.4 }]}>Save</Text>
            }
          </TouchableOpacity>
        </View>

        <ScrollView style={{ padding: 20 }} keyboardShouldPersistTaps="handled">
          <Text style={modal.label}>Service name *</Text>
          <TextInput style={modal.input} value={form.name} onChangeText={(v) => set('name', v)} placeholder="e.g. Knotless Box Braids" placeholderTextColor={Colors.muted} />

          <Text style={modal.label}>Description</Text>
          <TextInput style={modal.input} value={form.description} onChangeText={(v) => set('description', v)} placeholder="Optional" placeholderTextColor={Colors.muted} />

          <Text style={modal.label}>Duration (hours)</Text>
          <TextInput style={modal.input} value={form.duration_hours} onChangeText={(v) => set('duration_hours', v)} keyboardType="decimal-pad" placeholder="3" placeholderTextColor={Colors.muted} />

          <View style={modal.checkRow}>
            <TouchableOpacity style={modal.check} onPress={() => set('requires_consultation', !form.requires_consultation)}>
              <View style={[modal.checkbox, form.requires_consultation && modal.checkboxChecked]}>
                {form.requires_consultation && <Text style={{ color: Colors.text, fontSize: 12 }}>✓</Text>}
              </View>
              <Text style={modal.checkLabel}>Consultation required</Text>
            </TouchableOpacity>
            <TouchableOpacity style={modal.check} onPress={() => set('hair_included', !form.hair_included)}>
              <View style={[modal.checkbox, form.hair_included && modal.checkboxChecked]}>
                {form.hair_included && <Text style={{ color: Colors.text, fontSize: 12 }}>✓</Text>}
              </View>
              <Text style={modal.checkLabel}>Hair included</Text>
            </TouchableOpacity>
          </View>

          {!form.requires_consultation && (
            <>
              <Text style={modal.label}>Starting price ($)</Text>
              <TextInput style={modal.input} value={form.base_price} onChangeText={(v) => set('base_price', v)} keyboardType="decimal-pad" placeholder="0" placeholderTextColor={Colors.muted} />
            </>
          )}

          {error ? <Text style={modal.error}>{error}</Text> : null}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  )
}

function displayDuration(mins: number) {
  if (!mins) return ''
  if (mins % 60 === 0) return `${mins / 60}hr`
  return `${(mins / 60).toFixed(1)}hr`
}

export default function ServicesScreen() {
  const [services, setServices] = useState<Service[]>([])
  const [refreshing, setRefreshing] = useState(false)
  const [showAdd, setShowAdd] = useState(false)
  const [addForm, setAddForm] = useState<SvcForm>(EMPTY)
  const [editSvc, setEditSvc] = useState<Service | null>(null)
  const [editForm, setEditForm] = useState<SvcForm>(EMPTY)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  const load = async () => {
    const data = await api.fetchServices()
    setServices(Array.isArray(data) ? data : [])
  }

  useFocusEffect(useCallback(() => { load() }, []))

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false) }

  const buildBody = (form: SvcForm, extra?: object) => ({
    name: form.name,
    description: form.description || null,
    base_price: form.requires_consultation ? null : parseFloat(form.base_price) || null,
    duration_minutes: Math.round(parseFloat(form.duration_hours) * 60),
    requires_consultation: form.requires_consultation,
    hair_included: form.hair_included,
    active: true,
    ...extra,
  })

  const handleAdd = async () => {
    setSaving(true); setSaveError('')
    const res = await api.createService(buildBody(addForm, { display_order: services.length + 1 }))
    if (res?.error) { setSaveError(res.error); setSaving(false); return }
    await load()
    setShowAdd(false); setAddForm(EMPTY)
    setSaving(false)
  }

  const handleEdit = async () => {
    if (!editSvc) return
    setSaving(true); setSaveError('')
    const res = await api.updateService({ id: editSvc.id, ...buildBody(editForm) })
    if (res?.error) { setSaveError(res.error); setSaving(false); return }
    await load()
    setEditSvc(null)
    setSaving(false)
  }

  const handleDelete = (id: string, name: string) => {
    Alert.alert(`Delete "${name}"?`, 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await api.deleteService(id); setServices((p) => p.filter((s) => s.id !== id)) } },
    ])
  }

  const openEdit = (svc: Service) => {
    setEditSvc(svc)
    setEditForm({
      name: svc.name,
      description: svc.description ?? '',
      base_price: svc.base_price?.toString() ?? '',
      duration_hours: (svc.duration_minutes / 60).toString(),
      requires_consultation: svc.requires_consultation,
      hair_included: svc.hair_included,
    })
    setSaveError('')
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Services</Text>
      </View>

      <FlatList
        data={services}
        keyExtractor={(s) => s.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.pink} />}
        ListEmptyComponent={<View style={styles.emptyCard}><Text style={styles.emptyText}>No services yet</Text></View>}
        renderItem={({ item: svc }) => (
          <View style={styles.row}>
            <View style={styles.rowInfo}>
              <Text style={styles.rowName}>{svc.name}</Text>
              <Text style={styles.rowMeta}>
                {displayDuration(svc.duration_minutes)}
                {svc.base_price ? ` · $${svc.base_price}` : svc.requires_consultation ? ' · Consultation' : ''}
              </Text>
            </View>
            <TouchableOpacity onPress={() => openEdit(svc)} style={styles.iconBtn}>
              <Text style={{ fontSize: 16 }}>✏️</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDelete(svc.id, svc.name)} style={styles.iconBtn}>
              <Text style={{ fontSize: 16 }}>🗑️</Text>
            </TouchableOpacity>
          </View>
        )}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        ListFooterComponent={
          <TouchableOpacity style={styles.addBtn} onPress={() => { setShowAdd(true); setSaveError('') }}>
            <Text style={styles.addBtnText}>+ Add service</Text>
          </TouchableOpacity>
        }
      />

      <ServiceModal
        visible={showAdd} title="Add Service" form={addForm} setForm={setAddForm}
        onSave={handleAdd} onClose={() => setShowAdd(false)} saving={saving} error={saveError}
      />
      {editSvc && (
        <ServiceModal
          visible={!!editSvc} title={`Edit: ${editSvc.name}`} form={editForm} setForm={setEditForm}
          onSave={handleEdit} onClose={() => setEditSvc(null)} saving={saving} error={saveError}
        />
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  title: { fontSize: 30, fontWeight: '700', color: Colors.text },
  emptyCard: { backgroundColor: Colors.white, borderRadius: 16, padding: 32, alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  emptyText: { color: Colors.muted, fontSize: 15 },
  row: {
    backgroundColor: Colors.white, borderRadius: 16, padding: 14,
    flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: Colors.border,
  },
  rowInfo: { flex: 1 },
  rowName: { fontSize: 15, fontWeight: '600', color: Colors.text },
  rowMeta: { fontSize: 13, color: Colors.muted, marginTop: 2 },
  iconBtn: { padding: 6 },
  addBtn: {
    marginTop: 12, paddingVertical: 16, borderRadius: 100,
    borderWidth: 1.5, borderStyle: 'dashed', borderColor: Colors.pink + '88',
    alignItems: 'center',
  },
  addBtnText: { color: Colors.darkPink, fontSize: 15, fontWeight: '500' },
})

const modal = StyleSheet.create({
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  cancel: { fontSize: 16, color: Colors.muted },
  title: { fontSize: 17, fontWeight: '600', color: Colors.text },
  save: { fontSize: 16, fontWeight: '700', color: Colors.darkPink },
  label: { fontSize: 12, color: Colors.muted, marginBottom: 6, marginTop: 16 },
  input: {
    backgroundColor: Colors.white, borderRadius: 14, padding: 14,
    fontSize: 15, color: Colors.text, borderWidth: 1, borderColor: Colors.border,
  },
  checkRow: { flexDirection: 'row', gap: 16, marginTop: 20 },
  check: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  checkbox: {
    width: 22, height: 22, borderRadius: 6, borderWidth: 1.5, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  checkboxChecked: { backgroundColor: Colors.pink, borderColor: Colors.pink },
  checkLabel: { fontSize: 14, color: Colors.text },
  error: { color: Colors.red, fontSize: 13, marginTop: 12 },
})
