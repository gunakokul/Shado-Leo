import { useState } from 'react'
import { useRouter } from 'next/router'

const DEMO_VAULTS = [
  { vaultId: 'shadowleo', pin: '1234', label: 'Demo Client' },
  { vaultId: 'summer-edit', pin: '2025', label: 'Summer Portraits' },
]

export default function ClientVaultLogin() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [accessCode, setAccessCode] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleDemoAccess = (demoVault) => {
    setEmail('')
    setAccessCode('')
    localStorage.setItem('sl_token', 'demo_token_' + demoVault.vaultId)
    localStorage.setItem('sl_demo_vault', demoVault.vaultId)
    router.push(`/vault/${demoVault.vaultId}`)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const res = await fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000') + '/vault/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, accessCode }),
      })

      const json = await res.json()

      if (!res.ok) {
        throw new Error(json.message || 'Unable to access the vault.')
      }

      localStorage.setItem('sl_token', json.token)
      localStorage.removeItem('sl_demo_vault')
      router.push(`/vault/${json.vaultId}`)
    } catch (err) {
      setError(err.message || 'Unable to access the vault.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(212,175,55,0.2),transparent_40%),linear-gradient(135deg,#090909,#151515)] px-6 py-16 text-white">
      <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-[0_30px_80px_rgba(0,0,0,0.4)] backdrop-blur-sm sm:p-8">
        <div className="text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-[#D4AF37]/60 bg-[#D4AF37]/10 text-xl font-semibold text-[#F5D77A]">
            SL
          </div>
          <p className="text-xs uppercase tracking-[0.32em] text-[#F5D77A]">Private access</p>
          <h1 className="mt-4 text-3xl font-semibold">Client Vault</h1>
            <p className="mt-3 text-sm text-zinc-300">Enter the email and access code shared with you to view private deliverables.</p>
        </div>

        <div className="mt-6 space-y-2">
          {DEMO_VAULTS.map((demo) => (
            <button
              key={demo.vaultId}
              type="button"
              onClick={() => handleDemoAccess(demo)}
              className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-left transition hover:border-[#D4AF37]/50 hover:bg-[#D4AF37]/5"
            >
              <div>
                <div className="text-sm font-medium text-white">{demo.label}</div>
                <div className="text-xs text-zinc-400">{demo.vaultId}</div>
              </div>
              <div className="text-xs uppercase tracking-[0.2em] text-[#F5D77A]">Demo</div>
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <label className="block">
            <span className="mb-2 block text-sm text-zinc-300">Client email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-xl border border-white/10 bg-[#141414] px-4 py-3 text-white outline-none transition focus:border-[#D4AF37]/70"
              required
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm text-zinc-300">Access code</span>
            <input
              type="password"
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
              placeholder="Your private code"
              className="w-full rounded-xl border border-white/10 bg-[#141414] px-4 py-3 text-white outline-none transition focus:border-[#D4AF37]/70"
              required
            />
          </label>

          {error && <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</div>}

          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex w-full items-center justify-center rounded-full bg-[#D4AF37] px-6 py-3 text-sm font-semibold text-black transition hover:bg-[#E7C76A] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isLoading ? 'Unlocking...' : 'Access Vault'}
          </button>
        </form>

        <div className="mt-8 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-zinc-300">
          Existing legacy vault links remain available through their original vault ID and PIN.
        </div>
      </div>
    </main>
  )
}
