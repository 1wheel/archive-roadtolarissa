# Podcast Tour Detector — data notes

`episodes.json` — one record per episode: `s` show key, `d` date, `t` title, `g` guests, `x` excerpt, `u` link, `r`=1 rerun, `p`=1 text interview.
9,186 episodes across 18 shows / 11 hosts, 2014-06 → 2026-08 (chart shows 2016+). Built Aug 22, 2026.

## Sources per show
- **Ezra Klein Show (NYT), Hard Fork** — Apple Podcasts catalog via `amp-api.podcasts.apple.com` (public RSS is paywall-truncated to ~4 episodes).
- **Ezra Klein Show (Vox era)** — the Gray Area feed (`feeds.megaphone.fm/theezrakleinshow`), cut at Jan 2021. **Impeachment, Explained** — megaphone feed, first run only.
- **Plain English, Crazy/Genius, Decoder, Dwarkesh, Conversations with Tyler, Odd Lots, Risky Business, Search Engine (+ Crypto Island, same feed), Reply All (PJ era ≤ Feb 2021)** — full RSS feeds.
- **538 Politics** — Wayback union of feed snapshots (Nov 2018 → Apr 2023, Nate's exit) + Wayback `fivethirtyeight.com/podcasts/page/N` listings (Jan 2016 → Nov 2018).
- **Fresh Air** — NPR feed (last year) + Apple (2021+) + Wayback feed snapshots (2020+) + `npr.org/programs/fresh-air/archive?date=` (2014–2019).
- **This American Life** — `thisamericanlife.org/archive?year=` (authoritative; Apple/feed are rerun drops).
- **Silver Bulletin text interviews** — Substack archive API, hand-curated to 8 Q&As.

## Guests
Regex over titles/descriptions → Haiku pass → Sonnet sweep of every remaining guest-less episode (audit showed ~2/3 still had guests) → add-only union. Reruns ("Best Of", duplicate titles, "Remembering X") are tagged and excluded from appearances and runs. Hosts count as guests on other hosts' shows. ~75% of non-rerun episodes have a named guest (92–99% on the interview shows). Known gaps: 538 Politics 2016–18 guests depend on Wayback descriptions; Hard Fork is mostly host-only.

Raw caches and pipeline scripts were kept outside the repo and were lost in a session restart; `~/Desktop/podcast-tour-data/` holds the post-hoc fixes.
