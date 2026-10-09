import PortfolioGallery from '../../components/PortfolioGallery'

export default function PortfolioPage() {
  return (
    <main className="bg-[#111111] min-h-screen">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <p className="text-sm uppercase tracking-[0.3em] text-[#F5D77A]">Portfolio</p>
        <h1 className="mt-4 text-4xl font-semibold text-white sm:text-5xl">Selected frames and stories</h1>
      </div>
      <PortfolioGallery />
    </main>
  )
}
