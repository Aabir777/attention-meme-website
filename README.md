# ATTENTION — The First Asset ($attention)

Memecoin community site with **PFP maker** and **Meme maker**, powered by the official Attention mascot.

## Run

```bash
npm install
npm run dev
```

- Home: http://localhost:3000 (Talking Tom + **AI mascot chat**)
- PFP: http://localhost:3000/maker?tab=pfp  
- Meme: http://localhost:3000/maker?tab=meme  
- Stickers: http://localhost:3000/stickers  

### AI mascot (Grok / xAI)

1. Get a key at https://console.x.ai  
2. Copy `.env.example` → `.env.local`  
3. Set `XAI_API_KEY=your_key`  
4. Restart `npm run dev`  

Without a key, Chat mode uses a local personality fallback so the site still works.

### Mascot voice

Uses the **browser’s built-in speech synthesis** (no API key). Emotion adjusts pitch/rate (`happy`, `angry`, `wild`, etc.). Best in Chrome/Edge.  


## Brand assets

Mascot art lives in `public/mascot/`:

| File | Use |
|------|-----|
| `main.png` | Signature mascot |
| `classic.png` | Studio toy render |
| `pay-attention.png` | Coffee + sign pose |
| `scout.png` | Green beret variant |
| `sketch.png` | Pencil concept |
| `logo-mark.png` | Eye reticle logo |
| `wordmark.png` / heroes / manifesto | Marketing |

Catalog: `src/lib/assets.ts`

## Stack

Next.js · React · Tailwind · Canvas 2D export
