import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const packages = [
  {
    id: 'signature',
    name: 'Signature Session',
    price: 'Rs. 1,200,000',
    description: 'Perfect for portraits and small brand campaigns.',
    features: ['1 location', '60-minute session', '1 cinematic edit', 'Delivery gallery'],
  },
  {
    id: 'editorial',
    name: 'Editorial Story',
    price: 'Rs. 2,400,000',
    description: 'A deeper narrative with styling and multi-scene coverage.',
    features: ['2 locations', '3-hour coverage', 'Moodboard planning', 'Full gallery + teaser'],
    featured: true,
  },
  {
    id: 'luxury',
    name: 'Luxury Event',
    price: 'Rs. 4,800,000',
    description: 'Full-day event coverage with onsite direction and cinematic highlights.',
    features: ['Full-day coverage', 'Second shooter', 'Priority turnaround', 'Highlight reel'],
  },
]

export default function BookingSection() {
  const [selectedPackage, setSelectedPackage] = useState(packages[1].id)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '',
    email: '',
    date: '',
    notes: '',
  })

  const selectedPackageInfo = useMemo(
    () => packages.find((pkg) => pkg.id === selectedPackage) || packages[0],
    [selectedPackage],
  )

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (submitted) setSubmitted(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitted(false)
    setError('')

    try {
      const response = await fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000') + '/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          requestType: 'Booking',
          service: selectedPackageInfo.name,
          message: form.notes || 'No additional project details provided.',
        }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.message || 'Unable to send booking request.')
      setSubmitted(true)
      setForm({ name: '', email: '', date: '', notes: '' })
    } catch (submitError) {
      setError(submitError.message || 'Unable to send booking request.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section id="booking" className="bg-[#0c0c0c] px-6 py-20 text-white lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 text-center">
          <p className="text-sm uppercase tracking-[0.32em] text-[#F5D77A]">Booking</p>
          <h2 className="mt-4 text-4xl font-semibold sm:text-5xl">Plan your next story</h2>
        </div>

        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-4">
            {packages.map((pkg) => (
              <motion.button
                key={pkg.id}
                type="button"
                layout
                whileHover={{ scale: 1.01 }}
                onClick={() => setSelectedPackage(pkg.id)}
                className={[
                  'w-full rounded-[1.5rem] border p-5 text-left transition',
                  selectedPackage === pkg.id
                    ? 'border-[#D4AF37]/80 bg-[#D4AF37]/10 shadow-[0_0_0_1px_rgba(212,175,55,0.35)]'
                    : 'border-white/10 bg-white/5 hover:border-white/20',
                ].join(' ')}
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-xl font-semibold">{pkg.name}</div>
                    <div className="mt-2 text-sm text-zinc-300">{pkg.description}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-semibold text-[#F5D77A]">{pkg.price}</div>
                    {pkg.featured && (
                      <div className="mt-2 inline-flex rounded-full border border-[#D4AF37]/60 bg-[#D4AF37]/10 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-[#F7D97D]">
                        Most booked
                      </div>
                    )}
                  </div>
                </div>

                <ul className="mt-5 space-y-2 text-sm text-zinc-200">
                  {pkg.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-[#D4AF37]" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </motion.button>
            ))}
          </div>

          <motion.form
            layout
            onSubmit={handleSubmit}
            className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-[0_30px_70px_rgba(0,0,0,0.4)]"
          >
            <div className="mb-6 flex items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div>
                <div className="text-xs uppercase tracking-[0.3em] text-[#F5D77A]">Selected package</div>
                <motion.div
                  key={selectedPackageInfo.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 text-2xl font-semibold"
                >
                  {selectedPackageInfo.name}
                </motion.div>
              </div>
              <div className="text-right text-xl font-semibold text-[#F5D77A]">{selectedPackageInfo.price}</div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm text-zinc-300">Name</span>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-white/10 bg-[#141414] px-4 py-3 text-white outline-none transition focus:border-[#D4AF37]/70"
                  placeholder="Your name"
                  required
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm text-zinc-300">Email</span>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-white/10 bg-[#141414] px-4 py-3 text-white outline-none transition focus:border-[#D4AF37]/70"
                  placeholder="you@example.com"
                  required
                />
              </label>

              <label className="block sm:col-span-2">
                <span className="mb-2 block text-sm text-zinc-300">Preferred date</span>
                <input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-white/10 bg-[#141414] px-4 py-3 text-white outline-none transition focus:border-[#D4AF37]/70"
                  required
                />
              </label>

              <label className="block sm:col-span-2">
                <span className="mb-2 block text-sm text-zinc-300">Project details</span>
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  rows="5"
                  className="w-full rounded-xl border border-white/10 bg-[#141414] px-4 py-3 text-white outline-none transition focus:border-[#D4AF37]/70"
                  placeholder="Tell us about your brief, mood, venue, or deliverables."
                />
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-[#D4AF37] px-6 py-3 text-sm font-semibold text-black transition hover:bg-[#E8C65B] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? 'Sending request...' : 'Request booking'}
            </button>

            {error && <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">{error}</div>}

            <AnimatePresence>
              {submitted && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="mt-4 rounded-xl border border-[#D4AF37]/40 bg-[#D4AF37]/10 p-3 text-sm text-[#F5D77A]"
                >
                  Your inquiry for {selectedPackageInfo.name} on {form.date || 'your preferred date'} has been prepared.
                </motion.div>
              )}
            </AnimatePresence>
          </motion.form>
        </div>
      </div>
    </section>
  )
}
