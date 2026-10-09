import HeroSection from '../components/HeroSection'
import PortfolioGallery from '../components/PortfolioGallery'
import BookingSection from '../components/BookingSection'
import ServicesPricing from '../components/ServicesPricing'
import { siteConfig } from '../lib/siteConfig'

export default function Home() {
  return (
    <main>
      <HeroSection />

      <section id="about" className="bg-[#0f0f0f] px-6 py-20 text-white lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 text-center">
            <p className="text-sm uppercase tracking-[0.32em] text-[#F5D77A]">About</p>
            <h2 className="mt-4 text-4xl font-semibold sm:text-5xl">Story-driven visual work</h2>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-6">
              <div className="text-xs uppercase tracking-[0.25em] text-[#F5D77A]">Address</div>
              <p className="mt-4 text-lg text-zinc-200">{siteConfig.address}</p>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-6">
              <div className="text-xs uppercase tracking-[0.25em] text-[#F5D77A]">Service areas</div>
              <p className="mt-4 text-lg text-zinc-200">{siteConfig.serviceAreas.join(', ')}</p>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-6">
              <div className="text-xs uppercase tracking-[0.25em] text-[#F5D77A]">Support</div>
              <p className="mt-4 text-lg text-zinc-200">{siteConfig.hours}</p>
            </div>
          </div>

          <div className="mt-8 rounded-[2rem] border border-[#D4AF37]/30 bg-[#D4AF37]/5 p-6 sm:p-8">
            <p className="text-zinc-200">{siteConfig.about}</p>
            <div className="mt-6 flex flex-wrap gap-3 text-sm text-[#F5D77A]">
              {siteConfig.specialties.map((service) => (
                <span key={service} className="rounded-full border border-[#D4AF37]/40 bg-[#D4AF37]/10 px-3 py-1.5">
                  {service}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <ServicesPricing />
      <PortfolioGallery />
      <BookingSection />
    </main>
  )
}
