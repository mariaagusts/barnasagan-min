# Barnasagan mín

**[barnasagan.is](https://barnasagan.is)** — Foreldrar skrá sögu barnsins síns með hjálp gervigreindar. Parents answer guided questions about their child's early years, chapter by chapter, and AI turns the answers into a beautifully written storybook (Icelandic or English).

## How it works

1. **12 chapters** (`js/chapters.js`), each with 2–4 core questions plus bonus seed questions.
2. **AI follow-up questions**: after each core answer, Gemini generates a context-aware follow-up (`js/gemini.js` → `gemini-proxy` edge function). Max 10 Q&A per chapter; users can add their own questions ("+") or swap a bad AI question ("↻").
3. **Story generation** (`js/story.js`): a 3-pass pipeline — English draft → Icelandic translation → Icelandic proofread — using one of 5 writing styles (`STORY_STYLES` in `js/chapters.js`).
4. **Export**: client-side PDF via jsPDF (`js/export.js`), with photos and captions.

## Stack

- Static site (no build step), hosted on GitHub Pages with custom domain (`CNAME`).
- **Supabase**: auth, `user_progress` state, photo storage, edge functions (`supabase/functions/`).
- **Google Gemini** via the `gemini-proxy` edge function (API keys live server-side, rotated across up to 5 keys).
- **Payments**: Kling.is + Paddle webhooks → `paid_users` / `gift_codes` tables.
- **Resend** for gift-code emails.

## Repository layout

| Path | What |
|---|---|
| `index.html` | Landing + entire app (screens toggled by JS) |
| `js/` | All app modules (ES modules, no bundler) |
| `styles.css` | Design tokens + shared styles. ⚠️ `index.html` has an inline `:root` that overrides the palette on that page only |
| `supabase/functions/` | Edge functions: `gemini-proxy`, `admin-auth`, `admin-gift-codes`, `admin-stats`, `redeem-gift-code`, `kling-webhook`, `paddle-webhook` |
| `pricing.html`, `privacy.html`, `terms.html`, `gjafabref.html`, `demo.html` | Production pages |
| `design/` | Archived design experiments and mockups (not linked from the site) |
| `tests/` | Playwright smoke tests (run against production) |

## Required Supabase secrets

Set with `supabase secrets set NAME=value`:

- `GEMINI_KEY_1` … `GEMINI_KEY_5` (or single `GEMINI_KEY`)
- `ADMIN_PASSWORD`, `CS_PASSWORD` — verified by the `admin-auth` function (never in client code)
- `ADMIN_SECRET` — bearer token for `admin-stats`
- `KLING_WEBHOOK_SECRET` — **required**; the webhook fails closed without it
- `RESEND_API_KEY` — gift-code emails
- `BARNASAGAN_SUPABASE_URL` / `BARNASAGAN_SERVICE_ROLE_KEY` — for the cross-site admin gift-code console

Deploy functions with `supabase functions deploy <name>`.

## Development

No build step — serve the root with any static server (e.g. `npx serve` or VS Code Live Server on port 5500; the edge functions' origin allowlists include `http://localhost:5500`).

## Tests

```bash
npm install
npm test          # Playwright, runs against https://barnasagan.is
```

CI runs on push/PR to `master` (`.github/workflows/test.yml`).
