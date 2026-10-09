import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { siteConfig } from '../lib/siteConfig'

const photographyServices = siteConfig.services.filter(
  (service) => service.id !== 'photo-printing' && service.id !== 'custom-album' && service.id !== 'in-store-pickup',
)

export default function ServicesPricing() {
  const [services, setServices] = useState(photographyServices)
  const [selectedService, setSelectedService] = useState(photographyServices[0].id)
  const [selectedRentalIds, setSelectedRentalIds] = useState(['aputure-300d'])
  const [rentalStatus, setRentalStatus] = useState({ type: '', message: '' })
  const [isSubmittingRental, setIsSubmittingRental] = useState(false)
  const [rentalForm, setRentalForm] = useState({
    name: '',
    email: '',
    project: '',
    date: '',
  })

  useEffect(() => {
    fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000') + '/packages')
      .then((response) => response.ok ? response.json() : Promise.reject(new Error('Unable to load packages.')))
      .then((packages) => {
        if (!packages.length) return
        const nextServices = packages.map((service) => ({
          ...service,
          id: service.id,
          highlights: service.highlights || [service.category, 'Retouched gallery delivery'],
          price: `From Rs. ${Number(service.price).toLocaleString('en-LK')}`,
        }))
        setServices(nextServices)
        setSelectedService((current) => nextServices.some((service) => service.id === current) ? current : nextServices[0].id)
      })
      .catch(() => {})
  }, [])

  const selectedServiceInfo = useMemo(
    () => services.find((service) => service.id === selectedService) || services[0],
    [selectedService, services],
  )

  const selectedRentalItems = useMemo(
    () => siteConfig.rentalItems.filter((item) => selectedRentalIds.includes(item.id)),
    [selectedRentalIds],
  )

  const rentalTotal = selectedRentalItems.reduce((sum, item) => sum + item.rate, 0)

  const handleSelectRental = (id) => {
    setSelectedRentalIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    )
  }

  const handleRentalChange = (event) => {
    const { name, value } = event.target
    setRentalForm((current) => ({ ...current, [name]: value }))
  }

  const handleRentalSubmit = async (event) => {
    event.preventDefault()
    setIsSubmittingRental(true)
    setRentalStatus({ type: '', message: '' })

    try {
      const response = await fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000') + '/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...rentalForm,
          requestType: 'Rental',
          equipment: selectedRentalItems.map((item) => item.name).join(', ') || 'No equipment selected',
          message: `Project/event: ${rentalForm.project || 'Not specified'}\nEstimated daily total: Rs. ${rentalTotal.toLocaleString('en-LK')}`,
        }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.message || 'Unable to send rental request.')
      setRentalStatus({ type: 'success', message: 'Rental request sent. We will be in touch soon.' })
      setRentalForm({ name: '', email: '', project: '', date: '' })
    } catch (error) {
      setRentalStatus({ type: 'error', message: error.message || 'Unable to send rental request.' })
    } finally {
      setIsSubmittingRental(false)
    }
  }

  return (
    <section id="services" className="bg-[#0d0d0d] px-6 py-20 text-white lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 text-center">
          <p className="text-sm uppercase tracking-[0.32em] text-[#F5D77A]">Services & rentals</p>
          <h2 className="mt-4 text-4xl font-semibold sm:text-5xl">Crafted coverage for every moment</h2>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-[0_30px_80px_rgba(0,0,0,0.32)] sm:p-8">
          <div className="mb-8">
            <div className="text-sm uppercase tracking-[0.3em] text-[#F5D77A]">Photography & videography</div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-4">
              {services.map((service) => (
                <motion.button
                  key={service.id}
                  type="button"
                  layout
                  whileHover={{ scale: 1.01 }}
                  onClick={() => setSelectedService(service.id)}
                  className={[
                    'w-full rounded-[1.5rem] border p-5 text-left transition',
                    selectedService === service.id
                      ? 'border-[#D4AF37]/70 bg-[#D4AF37]/10 shadow-[0_0_0_1px_rgba(212,175,55,0.35)]'
                      : 'border-white/10 bg-white/5 hover:border-white/20',
                  ].join(' ')}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-xl font-semibold">{service.name}</div>
                      <p className="mt-2 text-sm text-zinc-300">{service.description}</p>
                    </div>
                    <div className="shrink-0 text-right text-[#F5D77A]">
                      <div className="text-lg font-semibold">{service.price}</div>
                    </div>
                  </div>

                  <ul className="mt-4 flex flex-wrap gap-2">
                    {service.highlights.map((highlight) => (
                      <li
                        key={highlight}
                        className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-zinc-200"
                      >
                        {highlight}
                      </li>
                    ))}
                  </ul>
                </motion.button>
              ))}
            </div>

            <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-6">
              <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.28em] text-[#F5D77A]">Selected package</div>
                  <div className="mt-2 text-2xl font-semibold">{selectedServiceInfo.name}</div>
                </div>
                <div className="text-xl font-semibold text-[#F5D77A]">{selectedServiceInfo.price}</div>
              </div>

              <p className="mt-4 text-sm leading-7 text-zinc-300">{selectedServiceInfo.description}</p>

              <div className="mt-6 space-y-3">
                {selectedServiceInfo.highlights.map((item) => (
                  <div key={item} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-200">
                    <span className="h-2 w-2 rounded-full bg-[#D4AF37]" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 rounded-[2rem] border border-white/10 bg-[#121212] p-6 sm:p-8">
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-[#F5D77A]">Studio equipment</p>
              <h3 className="mt-3 text-3xl font-semibold text-white">Rental catalog</h3>
            </div>
            <div className="text-sm text-zinc-400">Flexible daily rates for shoots, events, and campaigns.</div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="grid gap-5 md:grid-cols-2">
              {siteConfig.rentalItems.map((item) => (
                <motion.button
                  key={item.id}
                  type="button"
                  whileHover={{ y: -4 }}
                  onClick={() => handleSelectRental(item.id)}
                  className={[
                    'rounded-[1.5rem] border p-5 text-left transition',
                    selectedRentalIds.includes(item.id)
                      ? 'border-[#D4AF37]/60 bg-[#D4AF37]/10'
                      : 'border-white/10 bg-white/5 hover:border-white/20',
                  ].join(' ')}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-lg font-semibold text-white">{item.name}</div>
                      <div className="mt-1 text-[10px] uppercase tracking-[0.2em] text-zinc-400">{item.category}</div>
                    </div>
                    <div className="text-right text-[#F5D77A]">
                      <div className="text-lg font-semibold">Rs. {item.rate.toLocaleString('en-LK')}</div>
                      <div className="text-[10px] uppercase tracking-[0.18em] text-zinc-400">/ day</div>
                    </div>
                  </div>

                  <p className="mt-4 text-sm leading-6 text-zinc-300">{item.description}</p>
                </motion.button>
              ))}
            </div>

            <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-5">
              <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.28em] text-[#F5D77A]">Selected gear</div>
                  <div className="mt-2 text-2xl font-semibold text-white">{selectedRentalItems.length} items</div>
                </div>
                <div className="text-lg font-semibold text-[#F5D77A]">Rs. {rentalTotal.toLocaleString('en-LK')}</div>
              </div>

              <div className="mt-4 space-y-3">
                {selectedRentalItems.length > 0 ? (
                  selectedRentalItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-200">
                      <span>{item.name}</span>
                      <span className="text-[#F5D77A]">Rs. {item.rate.toLocaleString('en-LK')}</span>
                    </div>
                  ))
                ) : (
                  <div className="rounded-xl border border-dashed border-white/10 bg-white/5 px-3 py-4 text-sm text-zinc-400">
                    Choose gear to build your rental list.
                  </div>
                )}
              </div>

              <form className="mt-6 space-y-4" onSubmit={handleRentalSubmit}>
                <input
                  name="name"
                  value={rentalForm.name}
                  onChange={handleRentalChange}
                  placeholder="Your name"
                  className="w-full rounded-xl border border-white/10 bg-[#181818] px-4 py-3 text-white outline-none transition focus:border-[#D4AF37]/70"
                />
                <input
                  type="email"
                  name="email"
                  value={rentalForm.email}
                  onChange={handleRentalChange}
                  placeholder="Email address"
                  className="w-full rounded-xl border border-white/10 bg-[#181818] px-4 py-3 text-white outline-none transition focus:border-[#D4AF37]/70"
                />
                <input
                  name="project"
                  value={rentalForm.project}
                  onChange={handleRentalChange}
                  placeholder="Project / event type"
                  className="w-full rounded-xl border border-white/10 bg-[#181818] px-4 py-3 text-white outline-none transition focus:border-[#D4AF37]/70"
                />
                <input
                  type="date"
                  name="date"
                  value={rentalForm.date}
                  onChange={handleRentalChange}
                  className="w-full rounded-xl border border-white/10 bg-[#181818] px-4 py-3 text-white outline-none transition focus:border-[#D4AF37]/70"
                />

                <button
                  type="submit"
                  disabled={isSubmittingRental}
                  className="inline-flex w-full items-center justify-center rounded-full bg-[#D4AF37] px-6 py-3 text-sm font-semibold text-black transition hover:bg-[#E7C76A]"
                >
                  {isSubmittingRental ? 'Sending request...' : 'Request rental quote'}
                </button>
                {rentalStatus.message && (
                  <div className={[`rounded-xl border px-3 py-2 text-sm`, rentalStatus.type === 'success' ? 'border-[#D4AF37]/40 bg-[#D4AF37]/10 text-[#F5D77A]' : 'border-red-500/30 bg-red-500/10 text-red-200'].join(' ')}>
                    {rentalStatus.message}
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
