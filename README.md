# mcaholding.com.mx

Public website for MCA Holding. One static page, bilingual (EN/ES), no framework.

- `public/index.html` — the page. Translations live on each element as `data-en` / `data-es`.
- `public/site.js` — language switch, process tabs, legal modal, mobile menu, and the "Practical Wins" feed.
- `src/styles.css` — Tailwind source (brand colours and the few custom rules). Builds to `public/styles.css`, which is git-ignored.
- `vercel.json` — build settings and security headers (including the Content-Security-Policy; if you add a third-party script or image host, add it there).

## Working locally

```bash
npm install
npm run dev        # rebuilds public/styles.css on change
# open public/index.html in a browser, or: npx serve public
```

## Deploying

Vercel project with the defaults from `vercel.json` (build `npm run build`, output `public`). Every push to `main` deploys.

## Content

- **Practical Wins** cards come from the Apps Script web app in `site.js` (`WINS_FEED_URL`). The section and its navigation links stay hidden until the feed answers with at least one item.
- Booking goes to the Google Calendar appointment page linked in the booking section.
