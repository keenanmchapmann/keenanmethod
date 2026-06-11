# Keenan Method — The Leaderboard

Custom public leaderboard page. Charcoal / brass / Italiana, ticking month
countdown, ranked rows with the #1 spot highlighted in gold, and a live
"Most points this week" stat. Data comes from the Airtable base; the page
only ever shows names + points.

## Files
- `index.html` — the public page (what clients see)
- `api/leaderboard.js` — secure proxy that reads Airtable. The token lives
  here as a hidden environment variable; it is never sent to the browser.

## The "Most points this week" box
Reads the existing `This Week's Points` field on each active client and
features whoever is highest. No extra Airtable setup — that field already exists.

## Deploy (free, ~10 min)
1. Read-only Airtable token — DONE (scope `data.records:read`, this base only).
2. Put `index.html` + the `api` folder on GitHub (keep the folder structure).
3. Import the repo to Vercel → Deploy.
4. In Vercel → Settings → Environment Variables, add `AIRTABLE_TOKEN` = your token → Redeploy.
5. Live at `your-project.vercel.app`. Custom domain later.

## Notes
- Shows sample names if it can't reach the data yet, so it always looks right.
- Month label + countdown update themselves — no monthly editing.
- True "biggest climber" (rank movement) is a v2 upgrade; it needs weekly rank snapshots.
