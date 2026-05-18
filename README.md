# Invisible Tracking Demo

> What websites can infer about you in seconds — derived live, in the browser, with nothing persisted anywhere.

An educational single-page web app for a ~10-minute university talk on digital privacy. Two views:

- **Audience view** (`/`) — the full sectioned demo. Each visitor sees what the site has inferred about them.
- **Presenter wall** (`/wall`) — a live grid of every audience member's profile as they scan in. Country, city, browser, OS, screen, fingerprint hash, behaviour scores. No IPs, no names, no persistence.

The wall is powered by **PartyKit** (one WebSocket worker, no database). Profiles live in memory on the relay and evaporate when the audience member disconnects.

---

## Quick start (single-device, no audience wall)

Requires **Node 20+** and **pnpm**.

```bash
pnpm install
pnpm dev          # http://localhost:5173
```

You'll have the full demo working immediately — just no live audience wall. To enable the wall, deploy the PartyKit worker (next section).

---

## Quick start with audience wall (local dev)

In one terminal:

```bash
pnpm partykit:dev   # starts the relay on localhost:1999
```

In another terminal, with `.env.local` containing `VITE_PARTYKIT_HOST=localhost:1999`:

```bash
pnpm dev
```

Open `http://localhost:5173/wall` on your laptop, and `http://localhost:5173/?room=XXXXXX` on your phone (use the QR shown on the wall). The phone's profile should appear on the wall within a second.

---

## Deploying for a real presentation

You'll deploy **two things**:

### 1. PartyKit worker (the relay)

```bash
npx partykit deploy
```

The first run will ask you to log in (GitHub OAuth) and pick a name. It'll print a hostname like:

```
invisible-tracking-demo.your-username.partykit.dev
```

Copy that hostname.

### 2. The static site on Vercel

```bash
npx vercel --prod
```

Then go to **Vercel → Project Settings → Environment Variables** and add:

```
VITE_PARTYKIT_HOST = invisible-tracking-demo.your-username.partykit.dev
```

Trigger a redeploy (or just `npx vercel --prod` again) so the env var is baked in.

Your presenter URL is now:

```
https://<your-vercel-project>.vercel.app/wall
```

Open it on the laptop you'll project from. A QR appears top-right; the audience scans it.

---

## Running the talk

1. Open `/wall` on the projector. A 6-character room ID is generated and put in the URL. A QR is shown in the side panel.
2. Audience members scan it. Their phones land on the consent screen with an extra notice: *"A summary of your profile will be broadcast to the presenter's wall."*
3. Once they click `Start the demo` and pass through the data-collection sections, their tile appears on your wall.
4. Each tile shows country flag, city, browser, OS, device, screen, timezone, fingerprint hash, uniqueness, behaviour score.
5. Press `New room` on the wall (top right) between talks to start fresh.
6. Closing the wall tab clears all profiles. The relay holds nothing else.

The wall stays connected even while you click through the per-attendee demo on your phone — they're independent surfaces.

---

## What is and isn't on the wall

**Shown:** country, city, browser, OS, device class, screen, timezone, language, canvas-fingerprint hash (16 chars), behaviour score, behaviour type, inferred interest, uniqueness.

**Not shown / never broadcast:** IP address, raw User-Agent string, mouse trail, keystrokes, click coordinates, scroll positions, anything that ties a tile back to a real person.

The relay holds profiles in memory only. There is no database. Disconnect = forgotten.

---

## Presenter keyboard shortcuts (audience view)

| Key | Action |
|---|---|
| `→` / `Space` | Next section |
| `←` | Previous section |
| `R` | Reset session (full reload) |
| `P` | Toggle presenter overlay |
| `F` | Toggle fullscreen |
| `H` | Toggle mouse heatmap visibility |
| `M` | Toggle reveal sound |

---

## Network calls

**From every audience client:**
- `https://ipapi.co/json/` — primary IP geolocation (or `https://ipwho.is/` as fallback)
- `https://staticmap.openstreetmap.de/staticmap.php` — one static map tile per session
- WebSocket to `wss://<your-partykit-host>/...` — only if `VITE_PARTYKIT_HOST` is set AND the URL contains `?room=...`

**From the wall view:**
- WebSocket to `wss://<your-partykit-host>/...`

That's it. No analytics, no Sentry, no Mixpanel, no third-party cookies, no tracking pixels. Verify in DevTools → Network.

**Nothing is persisted client-side.** No `cookie`, no `localStorage`, no `IndexedDB`. The only sessionStorage entry is a random per-tab client ID used for the PartyKit connection. Verifiable in DevTools → Application.

---

## Browser support

| Browser | Status |
|---|---|
| Chromium (latest) | ✅ Full |
| Firefox (latest) | ✅ Full (canvas may be randomised in strict mode — that's the lesson) |
| Safari 16+ | ✅ Full |
| Brave | ⚠️ Canvas / WebRTC are fuzzed by the browser — show this as a privacy win, not a bug |

---

## Stack

- React 18 + Vite + TypeScript (strict)
- Tailwind CSS + Framer Motion
- Zustand (single in-memory store)
- PartyKit + partysocket (WebSocket relay, free tier on Cloudflare)
- `ua-parser-js`, `qrcode`, `html-to-image`
- `@fontsource/inter` + `@fontsource/jetbrains-mono` (no Google Fonts CDN)

---

## Layout

```
party/server.ts             PartyKit worker (ephemeral profile fan-out)
partykit.json               PartyKit config

src/
  main.tsx                  routes /wall to Wall, everything else to App
  App.tsx
  store.ts                  zustand: session + telemetry
  types.ts
  sections/                 ConsentScreen, Landing, LiveCollection, …
  components/               ProfileCard, HeatmapCanvas, ConfidenceMeter, …
  wall/
    Wall.tsx                presenter view (live grid)
    ProfileTile.tsx         single audience tile
  lib/
    deviceInfo.ts
    geolocation.ts
    fingerprint.ts          canvas + audio + WebGL + font hashing
    webrtc.ts               local-IP leak probe
    scoring.ts              engagement / behaviour / uniqueness / confidence
    room.ts                 room ID generator + URL helpers
    party.ts                PartyKit client wrapper
    tracker.ts
  hooks/                    useMouseTracker, useScrollDepth, useTypingSpeed,
                            useTimeOnPage, useKeyboardNav, useBroadcast
  styles/globals.css
```

---

## See also

`PRESENTATION_NOTES.md` — speaker script with per-section talking points.
