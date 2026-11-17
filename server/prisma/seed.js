import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  await prisma.$transaction([
    prisma.profile.deleteMany(),
    prisma.project.deleteMany(),
    prisma.skill.deleteMany(),
    prisma.experience.deleteMany(),
    prisma.link.deleteMany(),
  ])

  await prisma.profile.create({
    data: {
      id: 1,
      name: 'Your Name',
      headline: 'Your role or one-line headline goes here',
      bio: 'Write two or three sentences about yourself here: what you do, what you care about, and what you are looking for. This text is stored in the Profile table.',
      location: 'Your city, Country',
      email: 'you@example.com',
      avatarUrl: null,
    },
  })

  await prisma.link.create({
    data: [
      { label: 'GitHub', url: 'https://github.com/', order: 1 },
      { label: 'LinkedIn', url: 'https://linkedin.com/in/', order: 2 },
      { label: 'Resume', url: '#', order: 3 },
    ],
  })

  await prisma.project.create({
    data: {
      title: 'JAMA REPAIR SHOP WEBSITE',
      summary: 'A website developed for JAMA Repair Shop to showcase its services and provide customers with information about the business.',
      tags: 'HTML, CSS, JavaScript',
      url: '#',
      repoUrl: '#',
      imageUrl: '/images/jama.png',
      order: 1,
    },
  })

  await prisma.skill.create({
    data: [
      { name: 'Skill one', category: 'Category A', level: 5, order: 1 },
    ],
  })

  await prisma.experience.create({
    data: [
      { role: 'Your most recent role', company: 'Company name', startDate: '2023', endDate: null, description: 'One or two lines about what you owned and achieved.', order: 1 }
    ],
  })

  console.log('Seeded placeholder portfolio.')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
