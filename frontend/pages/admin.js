import { useEffect, useMemo, useState } from 'react'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

const emptyPackageForm = {
  id: '',
  name: '',
  category: 'Photography',
  description: '',
  price: '',
  featured: false,
  isActive: true,
}

const emptyCategoryForm = {
  id: '',
  name: '',
  description: '',
}

const emptyPortfolioForm = {
  id: '',
  title: '',
  description: '',
  category: 'Portrait',
}

const emptyVaultForm = {
  id: '',
  clientName: '',
  clientEmail: '',
  title: '',
  category: 'Deliverable',
  accessCode: '',
}

async function fetchJson(url, options = {}, token) {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  })

  const contentType = response.headers.get('content-type') || ''
  const payload = contentType.includes('application/json') ? await response.json() : await response.text()

  if (!response.ok) {
    const message = typeof payload === 'string' ? payload : payload?.message || payload?.error || 'Request failed.'
    throw new Error(message)
  }

  return payload
}

export default function AdminPortalPage() {
  const [token, setToken] = useState(null)
  const [authForm, setAuthForm] = useState({
    email: 'admin@shadowleo.test',
    password: 'changeme123',
  })
  const [authMessage, setAuthMessage] = useState('')
  const [dashboard, setDashboard] = useState({ packages: [], bookings: [], categories: [], media: [], contacts: [], portfolio: [], vault: [] })
  const [packageForm, setPackageForm] = useState(emptyPackageForm)
  const [categoryForm, setCategoryForm] = useState(emptyCategoryForm)
  const [mediaForm, setMediaForm] = useState({ id: '', title: '', type: 'image', categoryId: '' })
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [portfolioForm, setPortfolioForm] = useState(emptyPortfolioForm)
  const [portfolioFiles, setPortfolioFiles] = useState([])
  const [portfolioPreviews, setPortfolioPreviews] = useState([])
  const [vaultForm, setVaultForm] = useState(emptyVaultForm)
  const [vaultFile, setVaultFile] = useState(null)
  const [vaultPreview, setVaultPreview] = useState('')
  const [vaultSaving, setVaultSaving] = useState(false)
  const [portfolioSaving, setPortfolioSaving] = useState(false)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('shadowleo-admin-token')
      if (saved) {
        setToken(saved)
      }
    }
  }, [])

  useEffect(() => {
    if (!token) return
    loadDashboard()
    const interval = setInterval(loadDashboard, 15000)
    return () => clearInterval(interval)
  }, [token])

  const totalRevenue = useMemo(
    () => dashboard.bookings.reduce((sum, booking) => sum + Number(booking.depositPaid || 0), 0),
    [dashboard.bookings],
  )

  async function loadDashboard() {
    try {
      const data = await fetchJson(`${API_BASE}/admin/dashboard`, {}, token)
      setDashboard(data)
    } catch (error) {
      console.error(error)
      setAuthMessage(error.message)
      setToken(null)
      if (typeof window !== 'undefined') localStorage.removeItem('shadowleo-admin-token')
    }
  }

  function setDashboardRecord(collection, record) {
    setDashboard((current) => ({
      ...current,
      [collection]: [record, ...current[collection].filter((item) => item.id !== record.id)],
    }))
  }

  async function loadPortfolio() {
    const items = await fetchJson(`${API_BASE}/api/admin/portfolio`, {}, token)
    setDashboard((current) => ({
      ...current,
      portfolio: Array.isArray(items) ? items : [],
    }))
  }

  async function handleLogin(event) {
    event.preventDefault()
    setLoading(true)
    setAuthMessage('')

    try {
      const result = await fetchJson(`${API_BASE}/admin/login`, {
        method: 'POST',
        body: JSON.stringify(authForm),
      })

      setToken(result.token)
      if (typeof window !== 'undefined') localStorage.setItem('shadowleo-admin-token', result.token)
      setAuthMessage('Admin login successful.')
    } catch (error) {
      setAuthMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  async function handlePackageSubmit(event) {
    event.preventDefault()
    setSaving(true)

    try {
      const payload = {
        name: packageForm.name,
        category: packageForm.category,
        description: packageForm.description,
        price: Number(packageForm.price || 0),
        featured: Boolean(packageForm.featured),
        isActive: Boolean(packageForm.isActive),
      }

      const savedPackage = packageForm.id
        ? await fetchJson(`${API_BASE}/admin/packages/${packageForm.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        }, token)
        : await fetchJson(`${API_BASE}/admin/packages`, {
          method: 'POST',
          body: JSON.stringify(payload),
        }, token)

      setPackageForm(emptyPackageForm)
      setDashboardRecord('packages', savedPackage)
    } catch (error) {
      setAuthMessage(error.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDeletePackage(id) {
    if (!confirm('Delete this service package?')) return
    try {
      await fetchJson(`${API_BASE}/admin/packages/${id}`, { method: 'DELETE' }, token)
      setDashboard((current) => ({ ...current, packages: current.packages.filter((item) => item.id !== id) }))
    } catch (error) {
      setAuthMessage(error.message)
    }
  }

  async function handleDeleteBooking(id) {
    if (!confirm('Delete this booking lead?')) return
    try {
      await fetchJson(`${API_BASE}/admin/bookings/${id}`, { method: 'DELETE' }, token)
      await loadDashboard()
    } catch (error) {
      setAuthMessage(error.message)
    }
  }

  async function handleBookingStatusUpdate(id, status) {
    try {
      const booking = await fetchJson(`${API_BASE}/admin/bookings/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      }, token)
      setDashboardRecord('bookings', booking)
    } catch (error) {
      setAuthMessage(error.message)
    }
  }

  async function handleCategorySubmit(event) {
    event.preventDefault()
    try {
      const category = categoryForm.id
        ? await fetchJson(`${API_BASE}/admin/gallery/categories/${categoryForm.id}`, {
          method: 'PUT',
          body: JSON.stringify(categoryForm),
        }, token)
        : await fetchJson(`${API_BASE}/admin/gallery/categories`, {
        method: 'POST',
        body: JSON.stringify(categoryForm),
        }, token)
      setCategoryForm(emptyCategoryForm)
      setDashboardRecord('categories', { ...category, media: category.media || [] })
    } catch (error) {
      setAuthMessage(error.message)
    }
  }

  async function handleDeleteCategory(id) {
    if (!confirm('Delete this gallery category?')) return
    try {
      await fetchJson(`${API_BASE}/admin/gallery/categories/${id}`, { method: 'DELETE' }, token)
      setDashboard((current) => ({
        ...current,
        categories: current.categories.filter((item) => item.id !== id),
        media: current.media.map((item) => item.categoryId === id ? { ...item, categoryId: null, category: null } : item),
      }))
    } catch (error) {
      setAuthMessage(error.message)
    }
  }

  async function handleUpload(event) {
    event.preventDefault()
    if (!selectedFile) {
      setAuthMessage('Choose a file to upload first.')
      return
    }

    setUploading(true)
    setAuthMessage('')

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('title', mediaForm.title || selectedFile.name)
      formData.append('type', mediaForm.type)
      formData.append('categoryId', mediaForm.categoryId)

      const endpoint = mediaForm.id
        ? `${API_BASE}/admin/gallery/media/${mediaForm.id}`
        : `${API_BASE}/admin/gallery/upload`
      const savedMedia = await fetch(endpoint, {
        method: mediaForm.id ? 'PUT' : 'POST',
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).then(async (response) => {
        const payload = await response.json().catch(() => ({}))
        if (!response.ok) {
          throw new Error(payload?.message || payload?.error || 'Upload failed.')
        }
        return payload
      })

      setSelectedFile(null)
      setPreviewUrl('')
      setMediaForm({ id: '', title: '', type: 'image', categoryId: '' })
      event.target.reset()
      setDashboardRecord('media', savedMedia)
    } catch (error) {
      setAuthMessage(error.message)
    } finally {
      setUploading(false)
    }
  }

  async function handleDeleteMedia(id) {
    if (!confirm('Remove this media item?')) return
    try {
      await fetchJson(`${API_BASE}/admin/gallery/media/${id}`, { method: 'DELETE' }, token)
      setDashboard((current) => ({ ...current, media: current.media.filter((item) => item.id !== id) }))
    } catch (error) {
      if (error.message === 'Media item not found.') {
        setDashboard((current) => ({ ...current, media: current.media.filter((item) => item.id !== id) }))
        return
      }
      setAuthMessage(error.message)
    }
  }

  function handlePortfolioFileChange(event) {
    const files = Array.from(event.target.files || []).slice(0, 10)
    setPortfolioFiles(files)
    setPortfolioPreviews(files.map((file) => URL.createObjectURL(file)))
  }

  async function handlePortfolioSubmit(event) {
    event.preventDefault()
    if (!portfolioForm.id && !portfolioFiles.length) {
      setAuthMessage('Choose at least one image for the portfolio item.')
      return
    }

    setPortfolioSaving(true)
    setAuthMessage('')
    try {
      const formData = new FormData()
      formData.append('title', portfolioForm.title)
      formData.append('description', portfolioForm.description)
      formData.append('category', portfolioForm.category)
      portfolioFiles.forEach((file) => formData.append('images', file))

      const response = await fetch(
        `${API_BASE}/api/admin/portfolio${portfolioForm.id ? `/${portfolioForm.id}` : ''}`,
        {
          method: portfolioForm.id ? 'PUT' : 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        },
      )
      const item = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(item.message || 'Unable to save portfolio item.')

      await loadPortfolio()
      setPortfolioForm(emptyPortfolioForm)
      setPortfolioFiles([])
      setPortfolioPreviews([])
      event.target.reset()
    } catch (error) {
      setAuthMessage(error.message)
    } finally {
      setPortfolioSaving(false)
    }
  }

  async function handleVaultSubmit(event) {
    event.preventDefault()
    if (!vaultForm.id && !vaultFile) {
      setAuthMessage('Choose a vault document to upload.')
      return
    }
    setVaultSaving(true)
    setAuthMessage('')
    try {
      const formData = new FormData()
      Object.entries(vaultForm).forEach(([key, value]) => {
        if (key !== 'id') formData.append(key, value)
      })
      if (vaultFile) formData.append('file', vaultFile)
      const response = await fetch(`${API_BASE}/api/admin/vault${vaultForm.id ? `/${vaultForm.id}` : ''}`, {
        method: vaultForm.id ? 'PUT' : 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })
      const item = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(item.message || 'Unable to save vault document.')
      setDashboardRecord('vault', item)
      setVaultForm(emptyVaultForm)
      setVaultFile(null)
      setVaultPreview('')
      event.target.reset()
    } catch (error) {
      setAuthMessage(error.message)
    } finally {
      setVaultSaving(false)
    }
  }

  async function handleDeleteVault(id) {
    if (!confirm('Delete this vault document?')) return
    try {
      await fetchJson(`${API_BASE}/api/admin/vault/${id}`, { method: 'DELETE' }, token)
      setDashboard((current) => ({ ...current, vault: current.vault.filter((item) => item.id !== id) }))
    } catch (error) {
      setAuthMessage(error.message)
    }
  }

  async function handleDeletePortfolio(id) {
    if (!confirm('Delete this portfolio item?')) return
    try {
      await fetchJson(`${API_BASE}/api/admin/portfolio/${id}`, { method: 'DELETE' }, token)
      setDashboard((current) => ({ ...current, portfolio: current.portfolio.filter((item) => item.id !== id) }))
    } catch (error) {
      setAuthMessage(error.message)
    }
  }

  function handleFileChange(event) {
    const file = event.target.files?.[0] || null
    setSelectedFile(file)
    setPreviewUrl(file ? URL.createObjectURL(file) : '')
  }

  async function handleContactStatusUpdate(id, status) {
    try {
      const contact = await fetchJson(`${API_BASE}/admin/contacts/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      }, token)
      setDashboardRecord('contacts', contact)
    } catch (error) {
      setAuthMessage(error.message)
    }
  }

  async function handleDeleteContact(id) {
    if (!confirm('Delete this contact message?')) return
    try {
      await fetchJson(`${API_BASE}/admin/contacts/${id}`, { method: 'DELETE' }, token)
      setDashboard((current) => ({ ...current, contacts: current.contacts.filter((item) => item.id !== id) }))
    } catch (error) {
      setAuthMessage(error.message)
    }
  }

  function logout() {
    setToken(null)
    if (typeof window !== 'undefined') localStorage.removeItem('shadowleo-admin-token')
    setDashboard({ packages: [], bookings: [], categories: [], media: [], contacts: [], portfolio: [], vault: [] })
  }

  if (!token) {
    return (
      <main className="min-h-screen bg-[#090909] px-6 py-16 text-white">
        <div className="mx-auto max-w-md rounded-[2rem] border border-[#D4AF37]/25 bg-[#111111] p-8 shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
          <p className="text-xs uppercase tracking-[0.32em] text-[#F5D77A]">Admin portal</p>
          <h1 className="mt-5 text-3xl font-semibold">Shadow Leo</h1>
          <p className="mt-2 text-sm text-zinc-400">Sign in to manage packages, media, and booking leads.</p>

          <form onSubmit={handleLogin} className="mt-8 space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm text-zinc-300">Email</span>
              <input
                type="email"
                value={authForm.email}
                onChange={(event) => setAuthForm((prev) => ({ ...prev, email: event.target.value }))}
                className="w-full rounded-xl border border-white/10 bg-[#161616] px-4 py-3 text-white outline-none transition focus:border-[#D4AF37]/80"
                required
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm text-zinc-300">Password</span>
              <input
                type="password"
                value={authForm.password}
                onChange={(event) => setAuthForm((prev) => ({ ...prev, password: event.target.value }))}
                className="w-full rounded-xl border border-white/10 bg-[#161616] px-4 py-3 text-white outline-none transition focus:border-[#D4AF37]/80"
                required
              />
            </label>

            {authMessage ? <p className="text-sm text-red-400">{authMessage}</p> : null}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-[#D4AF37] px-5 py-3 font-semibold text-black transition hover:bg-[#E8C65B] disabled:opacity-70"
            >
              {loading ? 'Signing in...' : 'Login'}
            </button>
          </form>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#090909] px-6 py-10 text-white lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="sticky top-0 z-40 mb-8 flex flex-col gap-4 border-b border-white/10 bg-[#090909] pb-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-[#F5D77A]">Admin dashboard</p>
            <h1 className="mt-3 text-3xl font-semibold">Shadow Leo control panel</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="rounded-full border border-[#D4AF37]/40 bg-[#D4AF37]/10 px-3 py-1.5 text-xs uppercase tracking-[0.2em] text-[#F5D77A]">
              Admin mode
            </span>
            <button
              type="button"
              onClick={logout}
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-200 transition hover:border-white/20"
            >
              Logout
            </button>
          </div>
        </div>

        {authMessage ? <p className="mb-6 rounded-xl border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-200">{authMessage}</p> : null}

        <section className="grid gap-4 md:grid-cols-4">
          <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
            <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">Packages</div>
            <div className="mt-4 text-3xl font-semibold text-[#F5D77A]">{dashboard.packages.length}</div>
          </div>
          <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
            <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">Bookings</div>
            <div className="mt-4 text-3xl font-semibold text-[#F5D77A]">{dashboard.bookings.length}</div>
          </div>
          <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
            <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">Categories</div>
            <div className="mt-4 text-3xl font-semibold text-[#F5D77A]">{dashboard.categories.length}</div>
          </div>
          <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
            <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">Deposits</div>
            <div className="mt-4 text-3xl font-semibold text-[#F5D77A]">Rs. {totalRevenue.toLocaleString('en-LK')}</div>
          </div>
        </section>

        <section className="mt-10 grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
            <div className="mb-5 flex items-center justify-between gap-4">
              <h2 className="text-xl font-semibold">Service packages</h2>
              <span className="text-xs uppercase tracking-[0.2em] text-zinc-400">CRUD</span>
            </div>

            <form onSubmit={handlePackageSubmit} className="grid gap-4 md:grid-cols-2">
              <label className="block md:col-span-2">
                <span className="mb-2 block text-sm text-zinc-300">Package name</span>
                <input
                  value={packageForm.name}
                  onChange={(event) => setPackageForm((prev) => ({ ...prev, name: event.target.value }))}
                  className="w-full rounded-xl border border-white/10 bg-[#171717] px-4 py-3 text-white outline-none focus:border-[#D4AF37]/80"
                  required
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm text-zinc-300">Category</span>
                <input
                  value={packageForm.category}
                  onChange={(event) => setPackageForm((prev) => ({ ...prev, category: event.target.value }))}
                  className="w-full rounded-xl border border-white/10 bg-[#171717] px-4 py-3 text-white outline-none focus:border-[#D4AF37]/80"
                  required
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm text-zinc-300">Price (LKR)</span>
                <input
                  type="number"
                  value={packageForm.price}
                  onChange={(event) => setPackageForm((prev) => ({ ...prev, price: event.target.value }))}
                  className="w-full rounded-xl border border-white/10 bg-[#171717] px-4 py-3 text-white outline-none focus:border-[#D4AF37]/80"
                  min="0"
                  required
                />
              </label>

              <label className="block md:col-span-2">
                <span className="mb-2 block text-sm text-zinc-300">Description</span>
                <textarea
                  rows="4"
                  value={packageForm.description}
                  onChange={(event) => setPackageForm((prev) => ({ ...prev, description: event.target.value }))}
                  className="w-full rounded-xl border border-white/10 bg-[#171717] px-4 py-3 text-white outline-none focus:border-[#D4AF37]/80"
                />
              </label>

              <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#171717] px-4 py-3 text-sm text-zinc-200">
                <input
                  type="checkbox"
                  checked={packageForm.featured}
                  onChange={(event) => setPackageForm((prev) => ({ ...prev, featured: event.target.checked }))}
                />
                Featured
              </label>

              <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#171717] px-4 py-3 text-sm text-zinc-200">
                <input
                  type="checkbox"
                  checked={packageForm.isActive}
                  onChange={(event) => setPackageForm((prev) => ({ ...prev, isActive: event.target.checked }))}
                />
                Active
              </label>

              <div className="md:col-span-2 flex gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-full bg-[#D4AF37] px-5 py-3 font-semibold text-black transition hover:bg-[#E8C65B] disabled:opacity-60"
                >
                  {saving ? 'Saving...' : packageForm.id ? 'Update package' : 'Create package'}
                </button>

                {packageForm.id ? (
                  <button
                    type="button"
                    onClick={() => setPackageForm(emptyPackageForm)}
                    className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm text-zinc-200"
                  >
                    Clear
                  </button>
                ) : null}
              </div>
            </form>

            <div className="mt-8 space-y-3">
              {dashboard.packages.map((pkg) => (
                <div key={pkg.id} className="rounded-[1.2rem] border border-white/10 bg-[#141414] p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="text-lg font-semibold">{pkg.name}</div>
                      <div className="mt-1 text-sm text-zinc-400">{pkg.category}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[#F5D77A]">Rs. {Number(pkg.price).toLocaleString('en-LK')}</div>
                      <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">{pkg.featured ? 'Featured' : 'Standard'}</div>
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-zinc-300">{pkg.description}</p>
                  <div className="mt-4 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setPackageForm({ ...pkg, price: String(pkg.price) })}
                      className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs uppercase tracking-[0.18em] text-zinc-200"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeletePackage(pkg.id)}
                      className="rounded-full border border-red-400/40 bg-red-500/10 px-3 py-2 text-xs uppercase tracking-[0.18em] text-red-200"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-8">
            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
              <div className="mb-5 flex items-center justify-between gap-4">
                <h2 className="text-xl font-semibold">Gallery categories</h2>
                <span className="text-xs uppercase tracking-[0.2em] text-zinc-400">Organize</span>
              </div>

              <form onSubmit={handleCategorySubmit} className="space-y-4">
                <label className="block">
                  <span className="mb-2 block text-sm text-zinc-300">Category name</span>
                  <input
                    value={categoryForm.name}
                    onChange={(event) => setCategoryForm((prev) => ({ ...prev, name: event.target.value }))}
                    className="w-full rounded-xl border border-white/10 bg-[#171717] px-4 py-3 text-white outline-none focus:border-[#D4AF37]/80"
                    required
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm text-zinc-300">Description</span>
                  <textarea
                    rows="3"
                    value={categoryForm.description}
                    onChange={(event) => setCategoryForm((prev) => ({ ...prev, description: event.target.value }))}
                    className="w-full rounded-xl border border-white/10 bg-[#171717] px-4 py-3 text-white outline-none focus:border-[#D4AF37]/80"
                  />
                </label>

                <div className="flex gap-3">
                  <button type="submit" className="rounded-full bg-[#D4AF37] px-4 py-2.5 font-semibold text-black hover:bg-[#E8C65B]">
                    {categoryForm.id ? 'Save category' : 'Add category'}
                  </button>
                  {categoryForm.id ? (
                    <button type="button" onClick={() => setCategoryForm(emptyCategoryForm)} className="rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-zinc-200">
                      Cancel
                    </button>
                  ) : null}
                </div>
              </form>

              <div className="mt-6 space-y-3">
                {dashboard.categories.map((category) => (
                  <div key={category.id} className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-[#141414] p-3">
                    <div>
                      <div className="font-medium">{category.name}</div>
                      <div className="text-xs text-zinc-400">{category.media?.length || 0} media</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button type="button" onClick={() => setCategoryForm({ id: category.id, name: category.name, description: category.description || '' })} className="text-xs uppercase tracking-[0.18em] text-zinc-200">Edit</button>
                      <button type="button" onClick={() => handleDeleteCategory(category.id)} className="text-xs uppercase tracking-[0.18em] text-red-200">Remove</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
              <div className="mb-5 flex items-center justify-between gap-4">
                <h2 className="text-xl font-semibold">Upload gallery media</h2>
                <span className="text-xs uppercase tracking-[0.2em] text-zinc-400">Local or Cloudinary</span>
              </div>

              <form onSubmit={handleUpload} className="space-y-4">
                <label className="block">
                  <span className="mb-2 block text-sm text-zinc-300">Title</span>
                  <input
                    value={mediaForm.title}
                    onChange={(event) => setMediaForm((prev) => ({ ...prev, title: event.target.value }))}
                    className="w-full rounded-xl border border-white/10 bg-[#171717] px-4 py-3 text-white outline-none focus:border-[#D4AF37]/80"
                    required={!mediaForm.id}
                  />
                </label>

                {previewUrl ? (
                  <div className="overflow-hidden rounded-xl border border-white/10 bg-[#171717] p-2">
                    {mediaForm.type === 'video' ? <video src={previewUrl} controls className="max-h-56 w-full rounded-lg object-contain" /> : <img src={previewUrl} alt="Selected media preview" className="max-h-56 w-full rounded-lg object-contain" />}
                  </div>
                ) : null}

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-sm text-zinc-300">Type</span>
                    <select
                      value={mediaForm.type}
                      onChange={(event) => setMediaForm((prev) => ({ ...prev, type: event.target.value }))}
                      className="w-full rounded-xl border border-white/10 bg-[#171717] px-4 py-3 text-white outline-none focus:border-[#D4AF37]/80"
                    >
                      <option value="image">Image</option>
                      <option value="video">Video</option>
                    </select>
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm text-zinc-300">Category</span>
                    <select
                      value={mediaForm.categoryId}
                      onChange={(event) => setMediaForm((prev) => ({ ...prev, categoryId: event.target.value }))}
                      className="w-full rounded-xl border border-white/10 bg-[#171717] px-4 py-3 text-white outline-none focus:border-[#D4AF37]/80"
                    >
                      <option value="">Uncategorized</option>
                      {dashboard.categories.map((category) => (
                        <option key={category.id} value={category.id}>{category.name}</option>
                      ))}
                    </select>
                  </label>
                </div>

                <label className="block">
                  <span className="mb-2 block text-sm text-zinc-300">Choose file</span>
                  <input
                    type="file"
                    accept={mediaForm.type === 'video' ? 'video/*' : 'image/*'}
                    onChange={handleFileChange}
                    className="block w-full rounded-xl border border-dashed border-white/15 bg-[#171717] p-3 text-sm text-zinc-300"
                    required
                  />
                </label>

                <button
                  type="submit"
                  disabled={uploading}
                  className="w-full rounded-full bg-[#D4AF37] px-5 py-3 font-semibold text-black hover:bg-[#E8C65B] disabled:opacity-60"
                >
                  {uploading ? 'Saving...' : mediaForm.id ? 'Replace media' : 'Upload media'}
                </button>
              </form>
            </div>
          </div>
        </section>

        <section className="mt-10 grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
            <div className="mb-5 flex items-center justify-between gap-4">
              <h2 className="text-xl font-semibold">Booking leads</h2>
              <span className="text-xs uppercase tracking-[0.2em] text-zinc-400">Manage</span>
            </div>

            <div className="space-y-3">
              {dashboard.bookings.map((booking) => (
                <div key={booking.id} className="rounded-[1.2rem] border border-white/10 bg-[#141414] p-4">
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="text-lg font-semibold">{booking.clientName}</div>
                      <div className="text-sm text-zinc-400">{booking.clientEmail}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        value={booking.status}
                        onChange={(event) => handleBookingStatusUpdate(booking.id, event.target.value)}
                        className="rounded-lg border border-white/10 bg-[#171717] px-3 py-2 text-sm text-white outline-none"
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => handleDeleteBooking(booking.id)}
                        className="rounded-lg border border-red-400/40 bg-red-500/10 px-3 py-2 text-xs uppercase tracking-[0.18em] text-red-200"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-3 text-xs text-zinc-400">
                    <span>{booking.location}</span>
                    <span>•</span>
                    <span>{new Date(booking.date).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>Deposit: Rs. {Number(booking.depositPaid).toLocaleString('en-LK')}</span>
                  </div>
                  <p className="mt-3 text-sm text-zinc-300">{booking.notes || booking.packageJson}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
            <div className="mb-5 flex items-center justify-between gap-4">
              <h2 className="text-xl font-semibold">Gallery media</h2>
              <span className="text-xs uppercase tracking-[0.2em] text-zinc-400">Library</span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {dashboard.media.map((item) => (
                <div key={item.id} className="overflow-hidden rounded-[1.2rem] border border-white/10 bg-[#141414]">
                  <img
                    src={item.thumbnailUrl || item.url}
                    alt={item.title}
                    className="h-32 w-full object-cover"
                  />
                  <div className="p-3">
                    <div className="text-sm font-medium">{item.title}</div>
                    <div className="mt-1 text-[10px] uppercase tracking-[0.18em] text-zinc-400">{item.type} • {item.category?.name || 'General'}</div>
                    <div className="mt-3 flex gap-3 text-xs uppercase tracking-[0.18em]">
                      <button type="button" onClick={() => { setMediaForm({ id: item.id, title: item.title, type: item.type, categoryId: item.categoryId || '' }); setPreviewUrl(item.url); setSelectedFile(null) }} className="text-zinc-200">Edit/Replace</button>
                      <button type="button" onClick={() => handleDeleteMedia(item.id)} className="text-red-200">Delete</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-10 rounded-[2rem] border border-white/10 bg-white/5 p-6">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold">My Work / Portfolio</h2>
              <p className="mt-1 text-sm text-zinc-400">Manage the work shown in your portfolio.</p>
            </div>
            <span className="text-xs uppercase tracking-[0.2em] text-zinc-400">Cloudinary</span>
          </div>

          <form onSubmit={handlePortfolioSubmit} className="grid gap-4 lg:grid-cols-[1fr_1fr_1fr_1.2fr_auto] lg:items-end">
            <label className="block">
              <span className="mb-2 block text-sm text-zinc-300">Title</span>
              <input
                value={portfolioForm.title}
                onChange={(event) => setPortfolioForm((current) => ({ ...current, title: event.target.value }))}
                className="w-full rounded-xl border border-white/10 bg-[#171717] px-4 py-3 text-white outline-none focus:border-[#D4AF37]/80"
                required
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm text-zinc-300">Category</span>
              <input
                value={portfolioForm.category}
                onChange={(event) => setPortfolioForm((current) => ({ ...current, category: event.target.value }))}
                className="w-full rounded-xl border border-white/10 bg-[#171717] px-4 py-3 text-white outline-none focus:border-[#D4AF37]/80"
                required
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm text-zinc-300">Description</span>
              <input
                value={portfolioForm.description}
                onChange={(event) => setPortfolioForm((current) => ({ ...current, description: event.target.value }))}
                className="w-full rounded-xl border border-white/10 bg-[#171717] px-4 py-3 text-white outline-none focus:border-[#D4AF37]/80"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm text-zinc-300">Image {portfolioForm.id ? '(optional replacement)' : ''}</span>
              <input
                type="file"
                accept="image/*"
                required={!portfolioForm.id}
                multiple
                onChange={handlePortfolioFileChange}
                className="block w-full rounded-xl border border-dashed border-white/15 bg-[#171717] p-3 text-sm text-zinc-300"
              />
            </label>
            <div className="flex gap-3">
              <button type="submit" disabled={portfolioSaving} className="rounded-full bg-[#D4AF37] px-5 py-3 font-semibold text-black hover:bg-[#E8C65B] disabled:opacity-60">
                {portfolioSaving ? 'Saving...' : portfolioForm.id ? 'Save changes' : 'Add work'}
              </button>
              {portfolioForm.id ? (
                <button type="button" onClick={() => { setPortfolioForm(emptyPortfolioForm); setPortfolioFiles([]); setPortfolioPreviews([]) }} className="rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-200">
                  Cancel
                </button>
              ) : null}
            </div>
          </form>

          {portfolioPreviews.length ? (
            <div className="mt-4 grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4">
              {portfolioPreviews.map((preview, index) => <img key={preview} src={preview} alt={`Portfolio preview ${index + 1}`} className="h-28 w-full rounded-lg border border-white/10 object-cover" />)}
            </div>
          ) : null}

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {dashboard.portfolio.map((item) => (
              <article key={item.id} className="overflow-hidden rounded-[1.2rem] border border-white/10 bg-[#141414]">
                <img src={(item.imageUrls?.[0] || item.imageUrl)} alt={item.title} className="h-44 w-full object-cover" />
                <div className="p-4">
                  <div className="text-lg font-semibold">{item.title}</div>
                  <div className="mt-1 text-xs uppercase tracking-[0.18em] text-[#F5D77A]">{item.category}</div>
                  {item.description ? <p className="mt-2 text-sm text-zinc-400">{item.description}</p> : null}
                  <div className="mt-4 flex gap-3 text-xs uppercase tracking-[0.18em]">
                    <button type="button" onClick={() => { setPortfolioForm({ id: item.id, title: item.title, description: item.description || '', category: item.category }); setPortfolioFiles([]); setPortfolioPreviews([]) }} className="text-zinc-200">Edit</button>
                    <button type="button" onClick={() => handleDeletePortfolio(item.id)} className="text-red-200">Delete</button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-10 rounded-[2rem] border border-white/10 bg-white/5 p-6">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold">Client Vault Management</h2>
              <p className="mt-1 text-sm text-zinc-400">Upload private agreements, invoices, deliverables, and photo vault files.</p>
            </div>
            <span className="text-xs uppercase tracking-[0.2em] text-zinc-400">Cloudinary</span>
          </div>

          <form onSubmit={handleVaultSubmit} className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              ['clientName', 'Client name', 'text'],
              ['clientEmail', 'Client email', 'email'],
              ['title', 'Document title', 'text'],
              ['accessCode', 'Access code (optional)', 'text'],
            ].map(([field, label, type]) => (
              <label key={field} className="block">
                <span className="mb-2 block text-sm text-zinc-300">{label}</span>
                <input
                  type={type}
                  value={vaultForm[field]}
                  onChange={(event) => setVaultForm((current) => ({ ...current, [field]: event.target.value }))}
                  className="w-full rounded-xl border border-white/10 bg-[#171717] px-4 py-3 text-white outline-none focus:border-[#D4AF37]/80"
                  required={field !== 'accessCode'}
                />
              </label>
            ))}
            <label className="block">
              <span className="mb-2 block text-sm text-zinc-300">Category</span>
              <select value={vaultForm.category} onChange={(event) => setVaultForm((current) => ({ ...current, category: event.target.value }))} className="w-full rounded-xl border border-white/10 bg-[#171717] px-4 py-3 text-white outline-none focus:border-[#D4AF37]/80">
                <option>Agreement</option>
                <option>Invoice</option>
                <option>Deliverable</option>
                <option>Photo Vault</option>
              </select>
            </label>
            <label className="block">
              <span className="mb-2 block text-sm text-zinc-300">File {vaultForm.id ? '(optional replacement)' : ''}</span>
              <input type="file" onChange={(event) => { const file = event.target.files?.[0] || null; setVaultFile(file); setVaultPreview(file ? URL.createObjectURL(file) : '') }} required={!vaultForm.id} className="block w-full rounded-xl border border-dashed border-white/15 bg-[#171717] p-3 text-sm text-zinc-300" />
            </label>
            <div className="flex items-end gap-3">
              <button type="submit" disabled={vaultSaving} className="rounded-full bg-[#D4AF37] px-5 py-3 font-semibold text-black hover:bg-[#E8C65B] disabled:opacity-60">{vaultSaving ? 'Saving...' : vaultForm.id ? 'Save changes' : 'Upload document'}</button>
              {vaultForm.id ? <button type="button" onClick={() => { setVaultForm(emptyVaultForm); setVaultFile(null); setVaultPreview('') }} className="rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-200">Cancel</button> : null}
            </div>
          </form>
          {vaultPreview ? <div className="mt-4 text-sm text-zinc-400">Selected file: <span className="text-white">{vaultFile?.name}</span></div> : null}

          <div className="mt-8 overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-white/10 text-xs uppercase tracking-[0.18em] text-zinc-500"><tr><th className="px-3 py-3">Document</th><th className="px-3 py-3">Client</th><th className="px-3 py-3">Category</th><th className="px-3 py-3">Actions</th></tr></thead>
              <tbody>
                {dashboard.vault.map((item) => <tr key={item.id} className="border-b border-white/5"><td className="px-3 py-4"><a href={item.fileUrl} target="_blank" rel="noreferrer" className="font-medium text-white hover:text-[#F5D77A]">{item.title}</a></td><td className="px-3 py-4 text-zinc-300">{item.clientName}<div className="text-xs text-zinc-500">{item.clientEmail}</div></td><td className="px-3 py-4 text-zinc-300">{item.category}</td><td className="px-3 py-4"><div className="flex gap-3 text-xs uppercase tracking-[0.18em]"><button type="button" onClick={() => { setVaultForm({ id: item.id, clientName: item.clientName, clientEmail: item.clientEmail, title: item.title, category: item.category, accessCode: item.accessCode || '' }); setVaultFile(null); setVaultPreview('') }} className="text-zinc-200">Edit</button><button type="button" onClick={() => handleDeleteVault(item.id)} className="text-red-200">Delete</button></div></td></tr>)}
              </tbody>
            </table>
            {!dashboard.vault.length ? <p className="py-6 text-sm text-zinc-400">No vault documents have been uploaded yet.</p> : null}
          </div>
        </section>
      </div>
    </main>
  )
}
