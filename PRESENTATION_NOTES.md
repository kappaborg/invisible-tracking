# Presentation Notes

Target length: **10 minutes**. Aim for ~75–90 seconds per main section. The presenter overlay (`P` to toggle) shows abbreviated notes on stage.

## Two surfaces during the talk

- **Audience wall** (`/wall`) — open this on the projector. A QR code shows in the side panel; the audience scans it. Their tiles light up as they progress through the demo.
- **Per-attendee demo** (`/`) — what the audience runs on their own phones after scanning. You don't drive this; they do.

Open the wall first, then run the 10-minute talk on a *second* screen / browser window pointed at `/?room=<the-room-id-from-the-wall>` so the audience sees you walking through the demo in detail while their own tiles populate behind you.

## Pre-talk setup (do this once, before the audience walks in)

1. Open the wall (`/wall`) on the projector. Note the 6-character room ID.
2. In a separate window (still projected, or on your laptop), open `/?room=<that-id>`.
3. Tell the audience as they're seating: *"You see that QR up top? Scan it. You'll see what websites already know about you — and so will I."*

## Cold open (15 seconds, before pressing Start)

> "I'm going to open a website. It's not going to ask me for anything — no permissions, no logins, no forms. By the time I'm done, it will have built a profile of me detailed enough to sell. And it will throw it all away when I close the tab. The real ones don't."

Press `→` to enter the demo.

---

## Section 0 — Consent splash (~30s)

- Read the line on screen aloud. Emphasise *"nothing leaves your browser except one IP-geolocation call."*
- Click `What will you collect?` if the audience is technical — show them the list. Skip it if you're tight on time.
- Click `Start the demo`.

## Section 1 — Landing (~45s)

- Stand still. Let the cookie banner appear and **auto-accept itself** after 4–5 seconds.
- Point at it. Say: *"I didn't click that. That's the dark pattern. Most consent banners are designed to look like they need a click, and they count you as having given one anyway."*
- Press `→`.

## Section 2 — Live Collection (~90s)

- Read the IP and city aloud.
- Ask: *"Did anyone type their address?"*
- Show the device panel. Call out two specific things: GPU/CPU count and timezone.
- If the map shows the wrong city: *"This is what the website sees. If I were on a VPN, it would see the VPN's city — but not my actual fingerprint."*
- Press `→`.

## Section 3 — Behavioral Tracking (~75s)

- Move your mouse in a circle. Click 3–5 times. Watch the counters update.
- Type a quick word in the typing box.
- Say: *"Tools like Hotjar and Microsoft Clarity record entire sessions — every hesitation, every rage-click. The 2017 Princeton study found this on most of the top 50,000 sites."*
- Press `→`.

## Section 4 — Fingerprint Lab (~90s)

- Point at the canvas hash. *"That's a SHA-256. If I open this in incognito, I get the same hash."*
- Point at the audio hash. *"Same idea, using an inaudible sound wave through your audio stack."*
- Point at the WebGL renderer. *"That's the exact model of my GPU. Not a category — the specific chip."*
- Point at the uniqueness count: *"1 in N people share my fingerprint. The EFF found 84% of browsers were uniquely identifiable back in 2010."*
- Press `→`.

## Section 5 — Profile Reveal (~75s)

- Pause for the glitch animation. Let the audience read.
- Read 2–3 lines from the card out loud. The engagement score and inferred interest are the most striking.
- Optional: press `Show QR`. Audience pulls it up on their phones; they see their own profile.
- Press `→`.

## Section 6 — Educational Panel (~90s)

- Walk down the cards. Cite each reference (Cambridge Analytica is the one most audiences recognise).
- Land hard on the **"What we never asked you for"** card on the right — *"Every one of those is a permission prompt. None of them fired. That's the point."*
- Press `→`.

## Section 7 — Wrap-Up (~60s)

- Read the three takeaways.
- Point at the defenses column. Suggest one concrete action per audience type (students: install uBlock; faculty: enable Brave or Firefox strict; everyone: use a VPN on coffee-shop Wi-Fi).
- Final line, in big type: *"Privacy isn't a default. It's a decision."*
- Press `R` if you want to run it again for Q&A.

---

## If something breaks on stage

1. **IP lookup fails.** Say: *"Even when the geolocation service blocks me, I still got everything else — that's the lesson."* Keep moving.
2. **Brave / Firefox-strict randomises the canvas.** Say: *"Some of you are now seeing a different hash than I am. That's because Brave fuzzes this on purpose. That's the strongest single privacy win you can get from a browser switch."*
3. **No Wi-Fi.** Sections 2 (geo) and 2/5 (map) degrade. Everything else still works. Press `→` past the degraded panels.
4. **Audience wall is empty.** Either the audience hasn't reached Section 2 yet, or `VITE_PARTYKIT_HOST` isn't set on the Vercel build. The wall page tells you which it is — there's a yellow warning banner if the PartyKit host is missing.
5. **Wall shows the wrong city for some people.** That's the lesson, not a bug. Say: *"That tile is on a VPN. The site sees the VPN's location, not theirs. But the fingerprint stayed the same."*

---

## Closing line (memorise)

> "Real trackers persist all of this and sell it. This demo destroys everything when you close the tab. The web doesn't have to feel invisible — but right now, it is."
