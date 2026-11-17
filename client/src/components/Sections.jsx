import { useState } from 'react'
import ImageSlot from './ImageSlot.jsx'

export function About({ profile }) {
  return (
    <section id="about">
      <h2>About</h2>
      <p className="lede">{profile.bio}</p>
    </section>
  )
}


export function Projects({ projects }) {
  const project = projects[0]

  return (
    <section id="projects">
      <h2>Projects</h2>

      {!project ? (
        <p className="empty">
          No projects yet. Add rows to the Project table.
        </p>
      ) : (
        <article className="project" key={project.id}>
          <ImageSlot
            src="/images/jama.png"
            alt="jama repair shop landing page"
            ratio="16 / 10"
          />

          <div>
            <h3>JAMA REPAIR SHOP WEBSITE</h3>
            <p>
              A website created for a local phone repair shop in
              Sinioan, Laguna.
            </p>

            <ul className="tags">
              {project.tags.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>

        <div className="project">
          <ImageSlot
            src="/images/project-busilak.png"
            alt="project busilak logo"
            ratio="16 / 10"
          />

          <div>
            <h3>Project Busilak</h3>
            <p>
              A logo create for extension project in LSPU
            </p>

            <ul className="tags">
              {project.tags.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>
        </div>
        </article>
      )}
    </section>


  )
}


export function Skills({ skills }) {
  const groups = skills.reduce((acc, s) => {
    ;(acc[s.category] ||= []).push(s)
    return acc
  }, {})
  return (
    <section id="skills">
      <h2>Skills</h2>
      <div className="skill-groups">
        {Object.entries(groups).map(([category, list]) => (
          <div key={category}>
            <h3>{category}</h3>
            <ul className="skills">
              {list.map((s) => (
                <li key={s.id}>
                  <span>{s.name}</span>
                  <span className="meter" role="img" aria-label={`${s.level} out of 5`}>
                    {[1, 2, 3, 4, 5].map((i) => <i key={i} className={i <= s.level ? 'on' : ''} />)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}

export function Experience({ items }) {
  return (
    <section id="experience">
      <h2>Experience</h2>
      <ol className="timeline">
        {items.map((e) => (
          <li key={e.id}>
            <h3>Frontend</h3>
            <p>Frontend for group project</p>
          </li>
        ))}
      </ol>
    </section>
  )
}

export function Contact({ email }) {
  const [form, setForm] = useState({ name: '', email: '', body: '' })
  const [status, setStatus] = useState({ state: 'idle', message: '' })
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  async function submit(e) {
    e.preventDefault()
    setStatus({ state: 'sending', message: '' })
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Something went wrong.')
      setForm({ name: '', email: '', body: '' })
      setStatus({ state: 'sent', message: 'Message sent. Thank you!' })
    } catch (err) {
      setStatus({ state: 'error', message: err.message })
    }
  }

  return (
    <section id="contact">
      <h2>Contact</h2>
      <p className="lede">Send a message here or write to <a href={`mailto:${email}`}>{email}</a>.</p>
      <form className="form" onSubmit={submit}>
        <label>Name<input value={form.name} onChange={set('name')} required autoComplete="name" /></label>
        <label>Email<input type="email" value={form.email} onChange={set('email')} required autoComplete="email" /></label>
        <label>Message<textarea rows="5" value={form.body} onChange={set('body')} required maxLength={2000} /></label>
        <button type="submit" disabled={status.state === 'sending'}>
          {status.state === 'sending' ? 'Sending…' : 'Send message'}
        </button>
        <p className={`status ${status.state}`} role="status">{status.message}</p>
      </form>
    </section>
  )
}
