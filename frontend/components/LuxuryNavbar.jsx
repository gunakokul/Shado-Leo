import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Link from 'next/link'
import BrandLogo from './BrandLogo'

const navItems = [
  { label: 'Portfolio', href: '#portfolio' },
  { label: 'Booking', href: '#booking' },
  { label: 'Contact', href: '#contact' },
]

export default function LuxuryNavbar() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#090909] backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        <Link href="/" className="flex items-center text-white transition hover:text-[#F5D77A]">
          <BrandLogo compact className="shrink-0" showWordmark={false} />
          <span className="hidden text-xs uppercase tracking-[0.3em] text-zinc-300 sm:inline">Shadow Leo</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-sm text-zinc-200 transition hover:text-[#F5D77A]"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:block">
          <Link
            href="/vault/login"
            className="inline-flex items-center justify-center rounded-full border border-[#D4AF37]/60 bg-[#D4AF37]/10 px-4 py-2 text-sm font-medium text-[#F5D77A] transition hover:bg-[#D4AF37]/20"
          >
            Client Vault
          </Link>
        </div>

        <button
          type="button"
          aria-label="Toggle navigation"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white md:hidden"
          onClick={() => setOpen((value) => !value)}
        >
          <div className="flex flex-col gap-1.5">
            <span className={`h-0.5 w-5 rounded-full bg-white transition ${open ? 'translate-y-2 rotate-45' : ''}`} />
            <span className={`h-0.5 w-5 rounded-full bg-white transition ${open ? 'opacity-0' : 'opacity-100'}`} />
            <span className={`h-0.5 w-5 rounded-full bg-white transition ${open ? '-translate-y-2 -rotate-45' : ''}`} />
          </div>
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-t border-white/10 bg-black/90 md:hidden"
          >
            <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-4">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-3 py-2 text-sm text-zinc-200 transition hover:bg-white/5 hover:text-[#F5D77A]"
                >
                  {item.label}
                </a>
              ))}
              <Link
                href="/vault/login"
                onClick={() => setOpen(false)}
                className="mt-2 inline-flex items-center justify-center rounded-full border border-[#D4AF37]/60 bg-[#D4AF37]/10 px-4 py-2 text-sm font-medium text-[#F5D77A]"
              >
                Client Vault
              </Link>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  )
}
