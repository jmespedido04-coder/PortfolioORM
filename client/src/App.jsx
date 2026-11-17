import { useEffect, useState } from 'react'
import ImageSlot from './components/ImageSlot.jsx'
import { About, Projects, Skills, Experience, Contact } from './components/Sections.jsx'

export default function App() {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch('/api/portfolio')
      .then((r) => {
        if (!r.ok) throw new Error(`Server responded with ${r.status}`)
        return r.json()
      })
      .then(setData)
      .catch((e) => setError(e.message))
  }, [])

  if (error) {
    return <p className="state">Couldn’t load the portfolio: {error}. Check that the API is running on port 3001.</p>
  }
  if (!data) return <p className="state">Loading…</p>
  if (!data.profile) {
    return <p className="state">No profile found. Run <code>npm run setup</code> to seed the database.</p>
  }

  const { profile, projects, skills, experience, links } = data

  return (
    <div className="shell">
      <aside className="side">
        {}
        <ImageSlot
          src= "images/profile.png"
          alt={`Image of John Michael Espedido`}
          ratio="4 / 5"
          label="Profile photo goes here"
          hint="4:5 portrait. Set avatarUrl in the Profile table."
        />
        <div>
          <h1 className="name">John Michael Espedido</h1>
          <p className="headline">An aspiring web developer</p>
          <p className="where">Real Quezon, Phillipines</p>
        </div>
        <nav aria-label="Sections" className="jump">
          <a href="#about">About</a>
          <a href="#projects">Projects</a>
          <a href="#skills">Skills</a>
          <a href="#experience">Experience</a>
          <a href="#contact">Contact</a>
        </nav>
        <ul className="links">
          {links.map((l) => (
            <li key={l.id}><a href={l.url} target="_blank" rel="noreferrer">{l.label}</a></li>
          ))}
        </ul>
      </aside>

      <main className="main">
        <About profile={profile} />
        <Projects projects={projects} />
        <Skills skills={skills} />
        <Experience items={experience} />
        <Contact email={profile.email} />
      </main>
    </div>
  )
}
