import { AnimatePresence, motion } from 'framer-motion'

export default function GalleryDetailModal({ item, items, index, onClose, onSelect }) {
  if (!item) return null

  const itemIndex = typeof index === 'number' ? index : items.findIndex((entry) => entry.id === item.id)
  const total = items.length
  const nextItem = () => onSelect((itemIndex + 1 + total) % total)
  const prevItem = () => onSelect((itemIndex - 1 + total) % total)

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 18 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative w-full max-w-6xl overflow-hidden rounded-[2rem] border border-white/10 bg-[#101010] shadow-[0_40px_120px_rgba(0,0,0,0.8)]"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute right-4 top-4 z-10 rounded-full border border-white/15 bg-black/40 px-3 py-1.5 text-sm text-white/90 transition hover:border-[#D4AF37]/60 hover:text-[#F5D77A]"
          >
            Close
          </button>

          <div className="grid lg:grid-cols-[1.35fr_0.65fr]">
            <div className="relative overflow-hidden bg-black">
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="flex min-h-[360px] items-center justify-center bg-black"
              >
                {item.type === 'video' ? (
                  <video src={item.url} controls autoPlay className="h-full max-h-[72vh] w-full object-cover" />
                ) : (
                  <img src={item.url || item.image} alt={item.title} className="h-full max-h-[72vh] w-full object-cover" />
                )}
              </motion.div>

              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black via-black/70 to-transparent p-4">
                <button
                  onClick={prevItem}
                  className="rounded-full border border-white/20 bg-black/30 px-3 py-1.5 text-sm text-white hover:border-[#D4AF37]/60 hover:text-[#F5D77A]"
                >
                  Prev
                </button>
                <div className="text-xs uppercase tracking-[0.25em] text-zinc-200">
                  {itemIndex + 1} / {total}
                </div>
                <button
                  onClick={nextItem}
                  className="rounded-full border border-white/20 bg-black/30 px-3 py-1.5 text-sm text-white hover:border-[#D4AF37]/60 hover:text-[#F5D77A]"
                >
                  Next
                </button>
              </div>
            </div>

            <div className="flex flex-col justify-between bg-[#0d0d0d] p-6">
              <div>
                <div className="text-xs uppercase tracking-[0.25em] text-[#F5D77A]">{item.category}</div>
                <h3 className="mt-3 text-3xl font-semibold text-white">{item.title}</h3>
                <p className="mt-4 text-sm leading-7 text-zinc-300">{item.description}</p>
              </div>

              <div className="mt-8 space-y-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between text-sm text-zinc-300">
                  <span>Format</span>
                  <span className="font-medium text-white">{item.type === 'video' ? 'Video' : 'Still'} </span>
                </div>
                <div className="flex items-center justify-between text-sm text-zinc-300">
                  <span>Location</span>
                  <span className="font-medium text-white">{item.location || 'Editorial shoot'}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-zinc-300">
                  <span>Collection</span>
                  <span className="font-medium text-white">{item.collection || 'Shadow Leo'}</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
