export default function BrandLogo({ className = '', showWordmark = true, compact = false }) {
  return (
    <div className={`flex items-center ${compact ? 'gap-2' : 'gap-3'} ${className}`}>
      <img
        src="/logo.svg"
        alt="Shadow Leo studio logo"
        className={compact ? 'h-10 w-10 object-contain' : 'h-14 w-14 object-contain sm:h-16 sm:w-16'}
      />
      {showWordmark && (
        <span className="text-lg font-medium italic tracking-[0.08em] text-white sm:text-xl md:text-2xl">
          Shadow Leo
        </span>
      )}
    </div>
  )
}
