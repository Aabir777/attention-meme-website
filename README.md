# ATTENTION — The First Asset ($attention)

Community site for **$attention**: homepage, philosophy, **meme generator**, **PFP builder**, free stickers, and an interactive mascot.

**GitHub:** https://github.com/Aabir777/attention-meme-website

## Stack

Next.js 16 · React 19 · Tailwind CSS 4 · Canvas 2D (meme/PFP) · Three.js (3D mascot)

## Run locally

```bash
npm install
cp .env.example .env.local   # optional keys
npm run dev
```

| Page | URL |
|------|-----|
| Home | http://localhost:3000 |
| Meme maker | http://localhost:3000/maker?tab=meme |
| PFP maker | http://localhost:3000/maker?tab=pfp |
| Stickers | http://localhost:3000/stickers |
| About | http://localhost:3000/about |

## Environment

See `.env.example`.

| Variable | Required | Purpose |
|----------|----------|---------|
| `NEXT_PUBLIC_SITE_URL` | Recommended on Vercel | Canonical URL for OG + X share links |
| `NEXT_PUBLIC_CONTRACT_ADDRESS` | When token is live | CA bar + Solscan link |
| `ELEVENLABS_API_KEY` | Optional | Premium mascot voice |
| `ELEVENLABS_VOICE_ID` | Optional | ElevenLabs voice |

Mascot chat is **local personality** (no external AI key required).  
Voice uses **ElevenLabs** when configured; otherwise the UI still works without TTS.

## Deploy (Vercel)

1. Import the GitHub repo at [vercel.com/new](https://vercel.com/new)
2. Framework: **Next.js** (auto-detected)
3. Add env vars from `.env.example` (at least `NEXT_PUBLIC_SITE_URL` after first deploy)
4. Deploy → open the production URL
5. Optional: attach a custom domain

After the first deploy, set:

```text
NEXT_PUBLIC_SITE_URL=https://your-deployment.vercel.app
```

Redeploy so Open Graph and share links use the real domain.

## Product notes

- **Chain:** Solana (Phantom · SOL · Jupiter · Solscan)
- **How to Buy** on the homepage matches that stack
- **CA:** “Coming soon” until `NEXT_PUBLIC_CONTRACT_ADDRESS` is set
- **Share on X:** Chog-style text + maker link (attach PNG manually)
- Large 3D model (`public/models/mascot.glb` ~54MB) loads when the stage is on-screen

## Scripts

```bash
npm run dev      # development
npm run build    # production build
npm run start    # serve production build
npm run lint     # eslint
```

## Brand assets

Mascot art: `public/mascot/` · Catalog: `src/lib/assets.ts`
