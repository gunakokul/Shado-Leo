import { useState } from 'react'
import { siteConfig } from '../lib/siteConfig'
import BrandLogo from './BrandLogo'

export default function ContactFooter() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    projectType: 'Wedding',
    date: '',
    message: '',
  })
  const [status, setStatus] = useState({ type: '', message: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setStatus({ type: '', message: '' })

    try {
      const res = await fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000') + '/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const json = await res.json()
      if (!res.ok) throw new Error(json.message || 'Unable to send message.')

      setStatus({ type: 'success', message: 'Message sent successfully. We will be in touch soon.' })
      setForm({ name: '', email: '', projectType: 'Wedding', date: '', message: '' })
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Something went wrong.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const contactQuickFacts = [
    { label: 'Phone', value: siteConfig.phone },
    { label: 'Email', value: siteConfig.email },
    { label: 'Hours', value: siteConfig.hours },
    { label: 'Service areas', value: siteConfig.serviceAreas.join(', ') },
  ]

  return (
    <footer id="contact" className="border-t border-white/10 bg-[#070707] px-6 py-16 text-white lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-[#F5D77A]">Studio</p>
            <div className="mt-4 flex items-center gap-4">
              <BrandLogo compact={false} showWordmark={false} className="shrink-0" />
              <h3 className="text-3xl font-semibold">{siteConfig.name}</h3>
            </div>
            <p className="mt-4 max-w-md text-zinc-300">{siteConfig.about}</p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {contactQuickFacts.map((item) => (
                <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-[10px] uppercase tracking-[0.22em] text-[#F5D77A]">{item.label}</div>
                  <div className="mt-2 text-sm text-white">{item.value}</div>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-[1.5rem] border border-[#D4AF37]/30 bg-[#D4AF37]/5 p-4 text-sm text-zinc-200">
              <div className="text-[10px] uppercase tracking-[0.24em] text-[#F5D77A]">Address</div>
              <div className="mt-2">{siteConfig.address}</div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 rounded-[1.75rem] border border-white/10 bg-white/5 p-5 sm:p-6">
            <div className="mb-2 text-sm uppercase tracking-[0.3em] text-[#F5D77A]">Send an inquiry</div>

            <div className="grid gap-4 sm:grid-cols-2">
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Name"
                className="rounded-xl border border-white/10 bg-[#141414] px-4 py-3 text-white outline-none transition focus:border-[#D4AF37]/70"
                required
              />
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Email"
                className="rounded-xl border border-white/10 bg-[#141414] px-4 py-3 text-white outline-none transition focus:border-[#D4AF37]/70"
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <select
                name="projectType"
                value={form.projectType}
                onChange={handleChange}
                className="rounded-xl border border-white/10 bg-[#141414] px-4 py-3 text-white outline-none transition focus:border-[#D4AF37]/70"
              >
                <option>Wedding</option>
                <option>Portrait</option>
                <option>Commercial</option>
                <option>Travel</option>
                <option>Other</option>
              </select>
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                className="rounded-xl border border-white/10 bg-[#141414] px-4 py-3 text-white outline-none transition focus:border-[#D4AF37]/70"
              />
            </div>

            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              rows="5"
              placeholder="Tell us about your brief..."
              className="w-full rounded-xl border border-white/10 bg-[#141414] px-4 py-3 text-white outline-none transition focus:border-[#D4AF37]/70"
              required
            />

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex w-full items-center justify-center rounded-full bg-[#D4AF37] px-6 py-3 text-sm font-semibold text-black transition hover:bg-[#E7C76A] disabled:opacity-70"
            >
              {isSubmitting ? 'Sending...' : 'Send inquiry'}
            </button>

            {status.message && (
              <div
                className={[
                  'rounded-xl border px-3 py-2 text-sm',
                  status.type === 'success'
                    ? 'border-[#D4AF37]/40 bg-[#D4AF37]/10 text-[#F5D77A]'
                    : 'border-red-500/30 bg-red-500/10 text-red-200',
                ].join(' ')}
              >
                {status.message}
              </div>
            )}
          </form>
        </div>

        <div className="mx-auto mt-10 flex max-w-7xl flex-col gap-3 border-t border-white/10 pt-6 text-sm text-zinc-400 sm:flex-row sm:items-center sm:justify-between">
          <div>© 2026 {siteConfig.name}. All rights reserved.</div>
          <div>{siteConfig.specialties.join(' • ')}</div>
        </div>
      </div>
    </footer>
  )
}
