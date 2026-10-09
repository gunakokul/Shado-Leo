import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/router'

const DEMO_GALLERY = [
  {
    id: 'demo-1',
    title: 'Quiet Luxury Session',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'demo-2',
    title: 'Golden Hour Film',
    type: 'video',
    url: 'https://www.w3schools.com/html/mov_bbb.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'demo-3',
    title: 'Editorial Portrait',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=1200&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=900&q=80',
  },
]

export default function VaultPage() {
  const router = useRouter()
  const { id } = router.query
  const [items, setItems] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('sl_token')
    const demoVault = localStorage.getItem('sl_demo_vault')

    if (!token) {
      router.push('/vault/login')
      return
    }

    if (!id) return

    if (token === 'demo_token_' + id || demoVault === id) {
      setItems(DEMO_GALLERY)
      setLoading(false)
      return
    }

    fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000') + `/vault/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response) => response.json())
      .then((json) => {
        if (json.error) {
          setError(json.error)
          return
        }
        setItems(json.documents?.length ? json.documents.map((document) => ({
          ...document,
          type: 'document',
          url: document.fileUrl,
        })) : (json.media || []))
      })
      .catch(() => setError('Unable to load the vault.'))
      .finally(() => setLoading(false))
  }, [id, router])

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0b0b0b] px-6 py-16 text-white">
        <div className="rounded-[2rem] border border-red-500/30 bg-red-500/10 px-6 py-8 text-center">
          <div className="text-sm uppercase tracking-[0.28em] text-red-200">Vault access</div>
          <h1 className="mt-3 text-2xl font-semibold">{error}</h1>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#0b0b0b] px-6 py-16 text-white lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.32em] text-[#F5D77A]">Protected gallery</p>
            <h1 className="mt-4 text-4xl font-semibold">Client Vault {id}</h1>
          </div>
          <button
            type="button"
            onClick={() => {
              localStorage.removeItem('sl_token')
              localStorage.removeItem('sl_demo_vault')
              router.push('/vault/login')
            }}
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-200 transition hover:border-[#D4AF37]/60 hover:text-[#F5D77A]"
          >
            Log out
          </button>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={loading ? 'loading' : 'content'}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
          >
            {loading ? (
              <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-8 text-zinc-300">
                Loading protected files...
              </div>
            ) : items.length === 0 ? (
              <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-8 text-zinc-300">
                No protected media is available in this vault yet.
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {items.map((media) => (
                  <motion.div
                    key={media.id}
                    layout
                    whileHover={{ y: -4 }}
                    className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/5 shadow-[0_20px_60px_rgba(0,0,0,0.25)]"
                  >
                    {media.type === 'video' ? (
                      <video src={media.url} controls className="h-72 w-full object-cover" />
                    ) : media.type === 'document' ? (
                      <div className="flex h-72 items-center justify-center bg-[#151515] px-6 text-center">
                        <div><div className="text-xs uppercase tracking-[0.22em] text-[#F5D77A]">{media.category}</div><div className="mt-3 text-lg font-semibold">Private document</div></div>
                      </div>
                    ) : (
                      <img src={media.url} alt={media.title} className="h-72 w-full object-cover" />
                    )}
                    <div className="p-4">
                      <div className="text-xs uppercase tracking-[0.22em] text-[#F5D77A]">{media.type}</div>
                      <h2 className="mt-3 text-xl font-semibold">{media.title}</h2>
                      {media.type === 'document' ? <a href={media.url} target="_blank" rel="noreferrer" download className="mt-4 inline-flex rounded-full bg-[#D4AF37] px-4 py-2 text-sm font-semibold text-black">Download document</a> : null}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </main>
  )
}

