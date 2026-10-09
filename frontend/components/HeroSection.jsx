import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import BrandLogo from './BrandLogo'

const stats = [
  { value: '08+', label: 'Years crafting stories' },
  { value: '120+', label: 'Brand campaigns' },
  { value: '4.9/5', label: 'Average client rating' },
]

const marqueeItems = [
  'Wedding Films',
  'Luxury Portraits',
  'Brand Campaigns',
  'Event Coverage',
  'Studio Rentals',
  'Print & Albums',
]

const backgrounds = [
  'radial-gradient(circle at top, rgba(212,175,55,0.3), transparent 38%), linear-gradient(135deg, rgba(15,15,15,0.92), rgba(8,8,8,0.98))',
  'radial-gradient(circle at 20% 20%, rgba(240,190,92,0.28), transparent 25%), linear-gradient(140deg, rgba(12,12,12,0.96), rgba(24,18,12,0.96))',
  'radial-gradient(circle at 80% 15%, rgba(212,175,55,0.22), transparent 30%), linear-gradient(135deg, rgba(16,16,18,0.96), rgba(8,8,8,0.98))',
]

export default function HeroSection() {
  const [backgroundIndex, setBackgroundIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setBackgroundIndex((current) => (current + 1) % backgrounds.length)
    }, 4200)

    return () => clearInterval(interval)
  }, [])

  return (
    <section className="relative isolate overflow-hidden bg-[#090909] text-white">
      <div
        className="absolute inset-0 transition-all duration-1000 ease-out"
        style={{ background: backgrounds[backgroundIndex] }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.04),transparent_56%)]" />

      <div className="relative mx-auto max-w-7xl px-6 py-16 sm:py-20 lg:px-8 lg:py-24">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center rounded-full border border-[#D4AF37]/40 bg-[#D4AF37]/10 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.32em] text-[#F5D77A]"
        >
          Cinematic storytelling
        </motion.div>

        <div className="mt-8 grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-12">
          <div>
            <div className="flex items-center justify-start">
              <BrandLogo className="text-white" showWordmark />
            </div>

            <h1 className="mt-6 max-w-xl text-4xl font-semibold leading-tight tracking-[-0.04em] text-white sm:text-5xl lg:text-6xl">
              Frames with soul, light with intention.
            </h1>

            <p className="mt-6 max-w-xl text-lg text-zinc-300 sm:text-xl">
              Premium photography and videography for unforgettable weddings, intimate portraits, and modern brand stories that deserve a cinematic finish.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/portfolio"
                className="inline-flex items-center justify-center rounded-full bg-[#D4AF37] px-6 py-3 text-sm font-semibold text-black transition hover:bg-[#E7C76A]"
              >
                View portfolio
              </Link>
              <a
                href="#contact"
                className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:border-[#D4AF37]/60 hover:text-[#F5D77A]"
              >
                Book a session
              </a>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="relative mx-auto w-full max-w-xl"
          >
            <div className="absolute -left-8 top-10 h-36 w-36 rounded-full bg-[#D4AF37]/20 blur-3xl" />
            <div className="absolute -right-7 bottom-0 h-40 w-40 rounded-full bg-[#f5d77a]/10 blur-3xl" />

            <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-zinc-900/80 shadow-[0_30px_80px_rgba(0,0,0,0.7)] backdrop-blur">
              <img
                src="/images/hero-child-portrait.jpg"
                alt="Shadow Leo portrait session"
                className="h-[560px] w-full object-cover"
              />

              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/65 to-transparent p-6">
                <div className="inline-flex rounded-full border border-[#D4AF37]/50 bg-[#0d0d0d]/70 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-[#F7D97D]">
                  Featured session
                </div>
                <h2 className="mt-4 text-2xl font-semibold text-white">Golden Hour Editorial</h2>
                <p className="mt-2 text-sm text-zinc-200">Luxury portraits • Galle</p>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="mt-10 overflow-hidden border-y border-white/10 bg-black/15 py-3 backdrop-blur-sm">
          <div className="marquee-track gap-8 text-[11px] uppercase tracking-[0.32em] text-zinc-300">
            {[...marqueeItems, ...marqueeItems].map((item, index) => (
              <span key={`${item}-${index}`} className="whitespace-nowrap">
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-12 grid gap-5 border-t border-white/10 pt-8 sm:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
              <div className="text-3xl font-semibold text-[#F5D77A]">{stat.value}</div>
              <div className="mt-2 text-sm text-zinc-300">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
