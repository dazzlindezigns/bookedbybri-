'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { X, Upload, Instagram } from 'lucide-react'

type Photo = { id: string; storage_path: string; caption: string | null; display_order: number }

export default function GalleryPage() {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [uploading, setUploading] = useState(false)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''

  const load = async () => {
    const res = await fetch('/api/gallery')
    setPhotos(await res.json())
  }

  useEffect(() => { load() }, [])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    setUploading(true)
    for (const file of files) {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('display_order', String(photos.length + 1))
      await fetch('/api/gallery', { method: 'POST', body: formData })
    }
    await load()
    setUploading(false)
  }

  const handleDelete = async (id: string, path: string) => {
    if (!confirm('Delete this photo?')) return
    await fetch(`/api/gallery?id=${id}&path=${encodeURIComponent(path)}`, { method: 'DELETE' })
    setPhotos((prev) => prev.filter((p) => p.id !== id))
  }

  return (
    <div className="px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-cormorant text-3xl font-semibold">Gallery</h1>
        <label className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#ffabdd] text-[#1a1a1a] font-semibold text-sm cursor-pointer hover:bg-[#c4658f] hover:text-white transition-all">
          <Upload size={15} />
          {uploading ? 'Uploading...' : 'Add photos'}
          <input type="file" accept="image/*" multiple className="hidden" onChange={handleUpload} disabled={uploading} />
        </label>
      </div>

      {photos.length > 0 ? (
        <div className="grid grid-cols-3 gap-1.5 mb-6">
          {photos.map((photo) => (
            <div key={photo.id} className="relative aspect-square rounded-lg overflow-hidden group">
              <Image
                src={`${supabaseUrl}/storage/v1/object/public/gallery/${photo.storage_path}`}
                alt={photo.caption || ''}
                fill
                className="object-cover"
              />
              <button
                onClick={() => handleDelete(photo.id, photo.storage_path)}
                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-[#222] border border-dashed border-[#3a3a3a] rounded-2xl p-10 text-center mb-6">
          <p className="text-white/30 text-sm">No photos yet. Upload your first photo!</p>
        </div>
      )}

      <div className="bg-[#1a1a1a] border border-[#3a3a3a] rounded-2xl p-4 flex items-center gap-3">
        <Instagram size={18} className="text-[#ffabdd] flex-shrink-0" />
        <p className="text-xs text-white/50">
          Tip: Share your work on Instagram and sync photos here to keep your gallery fresh.
        </p>
      </div>
    </div>
  )
}
