const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create admin user (if not exists)
  const adminEmail = 'admin@shadowleo.test'
  const adminPass = 'changeme123'
  const adminHash = await bcrypt.hash(adminPass, 10)
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { name: 'Admin', password: adminHash },
    create: { name: 'Admin', email: adminEmail, password: adminHash, role: 'admin' }
  })

  const dummyUsers = [
    { name: 'Maya Carter', email: 'maya.carter@shadowleo.test', password: 'demo1234', role: 'client' },
    { name: 'Jordan Lee', email: 'jordan.lee@shadowleo.test', password: 'demo1234', role: 'client' },
    { name: 'Taylor Morgan', email: 'taylor.morgan@shadowleo.test', password: 'demo1234', role: 'client' }
  ]

  for (const user of dummyUsers) {
    const password = await bcrypt.hash(user.password, 10)
    await prisma.user.upsert({
      where: { email: user.email },
      update: { name: user.name, password, role: user.role },
      create: { name: user.name, email: user.email, password, role: user.role }
    })
  }

  // Create a test client vault with PIN '1234'
  const vaultId = 'vault_TEST123'
  const pin = '1234'
  const pinHash = await bcrypt.hash(pin, 10)

  await prisma.clientVault.upsert({
    where: { id: vaultId },
    update: { pinHash, clientId: 'client_test_1' },
    create: { id: vaultId, clientId: 'client_test_1', pinHash }
  })

  // Create sample media - one public, two in the vault
  const publicMedia = {
    title: 'Cinematic Sample Image',
    type: 'image',
    url: 'https://placehold.co/1600x900/111111/ffffff.png?text=Shadow+Leo+Sample',
    thumbnailUrl: 'https://placehold.co/800x450/111111/ffffff.png?text=Thumb',
  }

  const vaultMedia1 = {
    vaultId,
    title: 'Client Proof Image 1',
    type: 'image',
    url: 'https://placehold.co/1600x900/222222/ffffff.png?text=Vault+1',
    thumbnailUrl: 'https://placehold.co/800x450/222222/ffffff.png?text=Vault+Thumb1',
  }

  const vaultMedia2 = {
    vaultId,
    title: 'Client Proof Video',
    type: 'video',
    url: 'https://www.w3schools.com/html/mov_bbb.mp4',
    thumbnailUrl: 'https://placehold.co/800x450/333333/ffffff.png?text=Vault+Video',
  }

  await prisma.media.createMany({
    data: [publicMedia, vaultMedia1, vaultMedia2]
  })

  console.log('Seed complete.')
  console.log('Vault ID:', vaultId, 'PIN:', pin)
  console.log('Admin:', adminEmail, 'password:', adminPass)
  console.log('Dummy users:', dummyUsers.map(user => `${user.email} / ${user.password}`).join(', '))
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
