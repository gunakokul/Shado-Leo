import ServicesPricing from '../components/ServicesPricing'

export default function EquipmentRentalPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <p className="text-sm uppercase tracking-[0.32em] text-[#F5D77A]">Equipment rental</p>
        <h1 className="mt-4 text-4xl font-semibold sm:text-5xl">Studio gear for your next shoot</h1>
        <p className="mt-4 max-w-2xl text-zinc-300">
          Rent premium studio lights, modifiers, and support equipment for commercial projects, wedding coverage, portraits, and creative production work.
        </p>
      </div>
      <ServicesPricing />
    </main>
  )
}
