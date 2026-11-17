# Portfolio: React + Express + Prisma

A one-page personal portfolio. Every piece of content (name, bio, projects, skills, experience, links) lives in a database and is read through **Prisma ORM**. The page is built with **React** (Vite). Nothing is hard-coded in the UI, and every empty image shows a placeholder frame that tells you what goes there, including the **profile photo**.

---

## 1. Quick start

Requirements: Node.js 18.18 or newer.

```bash
npm install          # installs "concurrently" (runs both servers at once)
npm run setup        # installs server + client, creates the DB, seeds placeholder content
npm run dev          # API on :3001, website on :5173
```

Open **http://localhost:5173**. You will see placeholder text and crossed image frames.

Edit your content visually with Prisma Studio:

```bash
npm run studio       # opens http://localhost:5555
```

Refresh the site after saving; there is no rebuild step for content.

---

## 2. How it works

```
 Browser (React, :5173)
   │  fetch('/api/portfolio')            Vite dev proxy forwards /api
   ▼                                     to the Express server
 Express API (:3001)  ── Prisma Client ──▶  SQLite file (server/prisma/dev.db)
   ▲                                         tables: Profile, Project, Skill,
   │  JSON                                   Experience, Link, Message
   └──────────────────────────────────────
```

1. The React app mounts and calls `GET /api/portfolio` once.
2. The Express handler asks Prisma for all five content tables in parallel (`Promise.all`) and returns one JSON object.
3. React stores it in state and renders the sidebar and sections.
4. The contact form sends `POST /api/messages`. The server validates the input and saves it with `prisma.message.create`.

### Folder map

```
portfolio/
├─ package.json              root scripts (setup, dev, studio)
├─ server/
│  ├─ .env                   DATABASE_URL and PORT
│  ├─ prisma/
│  │  ├─ schema.prisma       the data model (single source of truth)
│  │  ├─ seed.js             placeholder content
│  │  └─ dev.db              created by setup (git-ignored)
│  └─ src/index.js           Express API
└─ client/
   ├─ vite.config.js         dev server + /api proxy
   ├─ public/images/         put your photos here
   └─ src/
      ├─ main.jsx            React entry
      ├─ App.jsx             fetches data, builds the layout
      ├─ styles.css          design tokens + all styling
      └─ components/
         ├─ ImageSlot.jsx    photo or placeholder frame
         └─ Sections.jsx     About, Projects, Skills, Experience, Contact
```

---

## 3. Prisma, step by step

**Schema (`server/prisma/schema.prisma`)** describes tables as `model` blocks. Prisma turns it into a typed client and into the database tables.

| Model | Purpose | Notable fields |
|---|---|---|
| `Profile` | One row about you | `avatarUrl` (null → photo placeholder) |
| `Project` | Portfolio items | `tags` (comma-separated), `imageUrl` (null → image placeholder), `order` |
| `Skill` | Skills with a 1 to 5 level | `category`, `level`, `order` |
| `Experience` | Timeline entries | `startDate`, `endDate` (null → "Present") |
| `Link` | Sidebar links | `label`, `url`, `order` |
| `Message` | Contact form submissions | `createdAt` is filled automatically |

**Commands** (run from `server/`, or through the root scripts):

| Command | What it does |
|---|---|
| `prisma generate` | Builds the `@prisma/client` code from the schema. Re-run after every schema change. |
| `prisma db push` | Creates or updates the SQLite tables to match the schema. |
| `node prisma/seed.js` | Wipes content tables and inserts the placeholder data. **It deletes existing content**, so do not re-run it after you have entered real data (the `Message` table is left alone). |
| `prisma studio` | Visual editor for your rows. |

`npm run setup` runs the first three in order.

**Using the client** (`server/src/index.js`):

```js
const prisma = new PrismaClient()
await prisma.project.findMany({ orderBy: { order: 'asc' } })   // read
await prisma.message.create({ data: { name, email, body } })   // write
```

The `order` column on Project, Skill, Experience and Link controls display order: lower numbers come first.

---

## 4. API reference

### `GET /api/portfolio`
Returns:

```json
{
  "profile":    { "id": 1, "name": "...", "headline": "...", "bio": "...", "location": "...", "email": "...", "avatarUrl": null },
  "projects":   [{ "id": 1, "title": "...", "summary": "...", "tags": ["a", "b"], "url": "#", "repoUrl": "#", "imageUrl": null, "order": 1 }],
  "skills":     [{ "id": 1, "name": "...", "category": "...", "level": 5, "order": 1 }],
  "experience": [{ "id": 1, "role": "...", "company": "...", "startDate": "2023", "endDate": null, "description": "...", "order": 1 }],
  "links":      [{ "id": 1, "label": "GitHub", "url": "...", "order": 1 }]
}
```
`tags` is converted from the stored `"a, b, c"` string into an array before sending.

### `POST /api/messages`
Body: `{ "name": string, "email": string, "body": string }`

| Status | Meaning |
|---|---|
| `201` | Saved. Returns `{ "id": number }` |
| `400` | Missing name or message, invalid email, or message over 2000 characters. Returns `{ "error": "..." }` |
| `500` | Database error |

Read the saved messages in Prisma Studio (`Message` table).

---

## 5. Frontend, step by step

| File | Responsibility |
|---|---|
| `App.jsx` | Loads data (`useEffect` + `fetch`), shows loading, error and "no profile" states, renders the sticky sidebar and the main column. |
| `ImageSlot.jsx` | If `src` is set, shows the `<img>`. If not, shows a dashed frame crossed by diagonal lines with a yellow label such as **"Profile photo goes here"**. Props: `src`, `alt`, `ratio`, `label`, `hint`. |
| `Sections.jsx` | One component per section. `Skills` groups rows by `category`. `Contact` owns the form state and has four states: idle, sending, sent, error. |
| `styles.css` | All styling. The colors and fonts are CSS variables at the top. |

---

## 6. Replace the placeholders

**Text:** open `npm run studio` and edit the rows, or change `server/prisma/seed.js` and run `npm --prefix server run db:seed` (before you have real data only).

**Profile photo:**
1. Copy your image to `client/public/images/me.jpg` (a 4:5 portrait crops best).
2. In Prisma Studio, set `Profile.avatarUrl` to `/images/me.jpg`.
3. Refresh. The placeholder frame is replaced by your photo.

**Project images:** same steps, using `Project.imageUrl` (16:10 works best).

**Add or remove sections:** add a model in `schema.prisma`, run `npx prisma db push` in `server/`, add a query to the `Promise.all` in `index.js`, then add a component in `Sections.jsx`.

**Re-theme:** edit the variables under `:root` in `styles.css` (`--paper`, `--ink`, `--signal`, `--display`, `--body`). The page title is in `client/index.html`.

---

## 7. Going to production

1. Build the site: `npm --prefix client run build` (output in `client/dist`).
2. Host `client/dist` on any static host (Netlify, Vercel, GitHub Pages) and host `server/` on a Node host (Render, Railway, Fly.io).
3. In production there is no Vite proxy, so either serve `client/dist` from Express, or change the two `fetch('/api/...')` calls to use your API's full URL and restrict CORS in `index.js` (`cors({ origin: 'https://your-site.com' })`).
4. SQLite is a single file, so it needs a persistent disk. Most hosts are easier with PostgreSQL: change `provider = "sqlite"` to `"postgresql"` in `schema.prisma`, set `DATABASE_URL` to your connection string, run `npx prisma db push`, then seed. With PostgreSQL you can also change `tags` to `String[]` and remove the split in `index.js`.
5. Add rate limiting and a spam check to `POST /api/messages` before publishing the form.

---

## 8. Troubleshooting

| Symptom | Fix |
|---|---|
| "Couldn’t load the portfolio" | The API is not running. Use `npm run dev`, and check port 3001 is free. |
| "No profile found" | The database is empty. Run `npm run setup`. |
| `@prisma/client did not initialize yet` | Run `npx prisma generate` in `server/`. |
| `Environment variable not found: DATABASE_URL` | `server/.env` is missing. Restore it from this repo's version. |
| Changed the schema but nothing changed | Run `npx prisma generate` and `npx prisma db push` in `server/`, then restart. |
| Photo does not appear | Check the path starts with `/images/` and the file is in `client/public/images/`. |
