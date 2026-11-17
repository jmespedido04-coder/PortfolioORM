import express from 'express'
import cors from 'cors'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json({ limit: '50kb' }))

const byOrder = { orderBy: { order: 'asc' } }

app.get('/api/portfolio', async (_req, res) => {
  try {
    const [profile, projects, skills, experience, links] = await Promise.all([
      prisma.profile.findFirst(),
      prisma.project.findMany(byOrder),
      prisma.skill.findMany(byOrder),
      prisma.experience.findMany(byOrder),
      prisma.link.findMany(byOrder),
    ])
    res.json({
      profile,
      projects: projects.map((p) => ({
        ...p,
        tags: p.tags.split(',').map((t) => t.trim()).filter(Boolean),
      })),
      skills,
      experience,
      links,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Could not load portfolio data.' })
  }
})

app.post('/api/messages', async (req, res) => {
  const { name, email, body } = req.body ?? {}
  const clean = (v) => (typeof v === 'string' ? v.trim() : '')
  const data = { name: clean(name), email: clean(email), body: clean(body) }

  if (!data.name || !data.body) {
    return res.status(400).json({ error: 'Name and message are required.' })
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    return res.status(400).json({ error: 'Enter a valid email address.' })
  }
  if (data.body.length > 2000) {
    return res.status(400).json({ error: 'Message is too long (2000 characters max).' })
  }

  try {
    const saved = await prisma.message.create({ data })
    res.status(201).json({ id: saved.id })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Could not save your message.' })
  }
})

const server = app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`))

const shutdown = async () => {
  server.close()
  await prisma.$disconnect()
  process.exit(0)
}
process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
