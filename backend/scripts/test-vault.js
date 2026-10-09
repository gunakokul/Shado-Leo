// Simple test script to validate vault auth flow
// Usage: node scripts/test-vault.js [vaultId] [pin] [baseUrl]

async function main() {
  if (typeof fetch !== 'function') {
    console.error('This script requires Node 18+ (global fetch).')
    process.exit(1)
  }

  const vaultId = process.argv[2] || 'vault_TEST123'
  const pin = process.argv[3] || '1234'
  const baseUrl = process.argv[4] || process.env.API_URL || 'http://localhost:4000'

  console.log('Testing vault auth', { vaultId, baseUrl })

  try {
    const loginRes = await fetch(`${baseUrl}/vault/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vaultId, pin })
    })

    const loginJson = await loginRes.json()
    if (!loginRes.ok) {
      console.error('Login failed:', loginJson)
      process.exit(2)
    }

    const token = loginJson.token
    console.log('Login OK — token received (truncated):', token && token.slice(0, 24) + '...')

    const vaultRes = await fetch(`${baseUrl}/vault/${vaultId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    const vaultJson = await vaultRes.json()
    if (!vaultRes.ok) {
      console.error('Fetching vault failed:', vaultJson)
      process.exit(3)
    }

    const media = vaultJson.media || []
    console.log('Vault media count:', media.length)
    if (media.length) {
      console.log('First media item:', { id: media[0].id, title: media[0].title, type: media[0].type, url: media[0].url })
    }

    console.log('Vault auth flow test passed.')
  } catch (err) {
    console.error('Error during test:', err)
    process.exit(99)
  }
}

main()
