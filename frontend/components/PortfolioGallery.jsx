import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import GalleryDetailModal from './GalleryDetailModal'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

/* legacy static portfolio data removed */
/*
  {
    id: 'wedding-shoots',
    title: 'Wedding Shoots',
    subtitle: 'Forever in motion',
    description: 'Traditional wedding portraits captured with warmth, detail, and quiet confidence.',
    items: [
      {
        id: 'wedding-portrait',
        title: 'Traditional Groom Portrait',
        category: 'Wedding Shoots',
        description: 'A refined portrait in traditional wedding attire, framed by natural light and architectural detail.',
        image: '/images/traditional-groom-portrait.jpg',
        type: 'image',
        url: '/images/traditional-groom-portrait.jpg',
        location: 'Sri Lanka',
        collection: 'Wedding Stories',
      },
    ],
  },
  {
    id: 'birthday-shoots',
    title: 'Birthday Shoots',
    subtitle: 'Joy, sparkle, celebration',
    description: 'Bold, playful storyboards that highlight personality, movement, and laughter.',
    items: [
      {
        id: 'birthday-1',
        title: 'Confetti Celebration',
        category: 'Birthday Shoots',
        description: 'High-energy portraits with vibrant color and celebratory motion.',
        image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=900&q=80',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1600&q=80',
        location: 'Colombo',
        collection: 'Celebration Stories',
      },
      {
        id: 'birthday-2',
        title: 'Cake & Candle Glow',
        category: 'Birthday Shoots',
        description: 'Warm tones and intimate details designed to feel both personal and elevated.',
        image: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=900&q=80',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=1600&q=80',
        location: 'Batticaloa',
        collection: 'Celebration Stories',
      },
      {
        id: 'birthday-3',
        title: 'Birthday Highlights',
        category: 'Birthday Shoots',
        description: 'A short sequence of candid moments, performances, and joyful surprise.',
        image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=900&q=80',
        type: 'video',
        url: 'https://videos.pexels.com/video-files/853889/853889-hd_1920_1080.mp4',
        location: 'Ella',
        collection: 'Celebration Stories',
      },
    ],
  },
  {
    id: 'portraiture',
    title: 'Portraiture',
    subtitle: 'Quiet luxury',
    description: 'Editorial portraits sculpted around mood, emotion, and personality.',
    items: [
      {
        id: 'portrait-1',
        title: 'City Lights Portrait',
        category: 'Portraiture',
        description: 'A moody urban portrait balancing elegance, contrast, and raw atmosphere.',
        image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1600&q=80',
        location: 'Negombo',
        collection: 'City Portraits',
      },
      {
        id: 'portrait-2',
        title: 'Editorial Profile',
        category: 'Portraiture',
        description: 'Refined posing, rich tones, and timeless styling for modern identity work.',
        image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=900&q=80',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=1600&q=80',
        location: 'Jaffna',
        collection: 'City Portraits',
      },
      {
        id: 'portrait-3',
        title: 'Shadow & Light',
        category: 'Portraiture',
        description: 'Directional light and soft motion create a refined editorial feel interior to exterior.',
        image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=80',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=1600&q=80',
        location: 'Dambulla',
        collection: 'City Portraits',
      },
    ],
  },
  {
    id: 'commercial',
    title: 'Commercial & Lifestyle',
    subtitle: 'Stories with presence',
    description: 'Luxury campaign visuals built around texture, atmosphere, and brand intention.',
    items: [
      {
        id: 'commercial-1',
        title: 'Quiet Luxury',
        category: 'Commercial & Lifestyle',
        description: 'Crisp product storytelling with tasteful styling and premium visual restraint.',
        image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1600&q=80',
        location: 'Hikkaduwa',
        collection: 'Brand Visuals',
      },
      {
        id: 'commercial-2',
        title: 'Coastal Drift',
        category: 'Commercial & Lifestyle',
        description: 'A travel-led lifestyle story that captures rhythm, movement, and atmosphere.',
        image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80',
        location: 'Mirissa',
        collection: 'Travel Journal',
      },
      {
        id: 'commercial-3',
        title: 'Open Horizon',
        category: 'Commercial & Lifestyle',
        description: 'Wide, cinematic frames built for elevated campaigns and aspirational storytelling.',
        image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80',
        location: 'Wilpattu',
        collection: 'Worlds in Motion',
      },
    ],
  },
]
*/

export default function PortfolioGallery() {
  const [works, setWorks] = useState([])
  const [selectedItem, setSelectedItem] = useState(null)

    useEffect(() => {
      fetch(`${API_BASE}/api/portfolio`)
        .then(async (response) => {
          const data = await response.json().catch(() => ({}))
          if (!response.ok) throw new Error(data.message || 'Unable to load portfolio.')
          return data
        })
        .then((data) => setWorks(Array.isArray(data) ? data : []))
        .catch((error) => console.error('Portfolio gallery fetch failed:', error))
    }, [])

  const openWork = (work, index) => {
    const gallery = works.flatMap((item) => (item.imageUrls?.length ? item.imageUrls : [item.imageUrl]).map((url, imageIndex) => ({
      ...item,
      id: `${item.id}-${imageIndex}`,
      image: url,
      url,
      type: 'image',
    })))
    const firstIndex = gallery.findIndex((item) => item.id.startsWith(`${work.id}-`))
    setSelectedItem({ ...gallery[firstIndex], index: firstIndex, gallery })
  }

  return (
    <section id="portfolio" className="bg-[#111111] px-6 py-20 text-white lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-[#F5D77A]">My Work</p>
            <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">Cinematic stories by category</h2>
          </div>
          <p className="max-w-xl text-sm text-zinc-400">
            Curated galleries crafted for weddings, birthdays, portraits, and luxury brand moments.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {works.map((work, index) => (
            <motion.button
              key={work.id}
              type="button"
              whileHover={{ y: -4 }}
              onClick={() => openWork(work, index)}
              className="group overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/5 text-left transition hover:border-[#D4AF37]/60"
            >
              <div className="overflow-hidden">
                <img
                  src={work.imageUrls?.[0] || work.imageUrl}
                  alt={work.title}
                  className="h-72 w-full object-cover transition duration-500 group-hover:scale-105"
                />
              </div>

              {work.imageUrls?.length > 1 ? (
                <div className="grid grid-cols-4 gap-1 border-t border-white/10 bg-black/20 p-1">
                  {work.imageUrls.slice(0, 4).map((url) => <img key={url} src={url} alt="" className="h-12 w-full object-cover opacity-80" />)}
                </div>
              ) : null}

              <div className="p-5">
                <div className="text-[10px] uppercase tracking-[0.24em] text-[#F5D77A]">{work.category}</div>
                <h3 className="mt-3 text-2xl font-semibold text-white">{work.title}</h3>
                {work.description ? <p className="mt-3 text-sm leading-6 text-zinc-300">{work.description}</p> : null}
              </div>
            </motion.button>
          ))}
        </div>
        {!works.length ? <p className="mt-8 text-sm text-zinc-400">No portfolio work has been published yet.</p> : null}
      </div>

      {selectedItem && (
        <GalleryDetailModal
          item={selectedItem}
          items={selectedItem.gallery}
          index={selectedItem.index}
          onClose={() => setSelectedItem(null)}
          onSelect={(newIndex) => setSelectedItem({ ...selectedItem.gallery[newIndex], index: newIndex, gallery: selectedItem.gallery })}
        />
      )}
    </section>
  )
}
