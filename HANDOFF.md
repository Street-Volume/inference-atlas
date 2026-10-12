# Handoff: Inference Atlas

Read this before touching anything. The owner, Jalil, is **not a programmer** — he relies entirely on whichever agent is driving this repo to explain things in plain language, to never lose his work, and to keep the live site working. Optimize for reliability over cleverness.

Live site: **https://street-volume.github.io/inference-atlas/**
Repo: **https://github.com/Street-Volume/inference-atlas** (public — see §2 for why)

## 1. Project summary

**What it is:** a personal study guide / interactive textbook covering three courses: M463 Probability I, Mathematical Statistics, and M447/M577 Operations Research (Wackerly/Mendenhall/Scheaffer textbook + Hillier/Lieberman textbook), plus several standalone "study tool" pages (quant finance lab, science workbench, MLE toolkit, MVUE guide, testing vocabulary, midterm roadmap). Originally a single Claude.ai HTML artifact, imported here and heavily extended over many sessions.

**Stack:** zero-build, hand-authored static HTML/CSS/vanilla JS. **No npm, no node, no bundler, no framework** — confirm with `command -v node npm npx` before assuming otherwise; this machine typically has none of them. Math rendering via MathJax (CDN, `tex-svg.js`). Fonts from Google Fonts CDN.

**Current architecture — a 14-page static site:**

| File | Content |
|---|---|
| `index.html` | Home: hero, stats, course cards, full problem map |
| `probability.html` | Part A, M463 Probability (Homework 07: Q1&ndash;Q11 as of this writing; see §7 for in-progress Homeworks 5&ndash;6 / quizzes / worksheets work) |
| `inference.html` | Part B, Mathematical Statistics (9.82, 9.96, 10.5) |
| `operations-research.html` | Part C, Operations Research &mdash; **now 19 problems**: S1&ndash;S7 (Homework 5, simplex method), M1&ndash;M7 (Homework 6, Big M method), OR1&ndash;OR5 (Homework 7, shadow prices/sensitivity), in that pedagogical order |
| `encyclopedia.html` | 16-distribution interactive spotlight + ridgeline canvas |
| `bridge.html` | Concept bridge (Part A ↔ Part B concept links) |
| `workbench.html` | Answer checker + **audit log** (corrections to earlier drafts — see §7, two new entries added there) |
| `quant.html`, `science.html`, `mle-toolkit.html`, `mvue-guide.html`, `testing-vocab.html`, `midterm-guide.html`, `r-lab.html` | Standalone study-tool pages, not part of the numbered problem set |
| `assets/style.css` | All shared CSS (dark-first design system, topic "hue" tokens) |
| `assets/app.js` | Shared JS app shell: nav, search palette, progress tracking (localStorage), quiz mode, keyboard shortcuts, mobile drawer, cross-page problem stepping, **step-through derivation walker** (see §7) |

Every page also has its own inline `<script>` at the bottom for page-specific interactivity (canvas figures, encyclopedia math, bridge diagram, checker).

**The problem registry (important for extending this site):** every numbered problem across every page lives in one array, `P[]`, near the top of `assets/app.js`. Each entry is `{id, n, t, topic, hue, part, page, ans, kw}`. This single array drives: the left-rail nav badges/counts, the search palette, localStorage progress tracking, the "mark understood" footer button injection, and cross-page next/previous stepping (`J`/`K`). **Adding a new problem means two things, not one:** the HTML `<section class="ex" id="..." data-problem>` on the page itself (with `.problem`/`.tools`/`.part.walk`/`.answer` sub-blocks), *and* a matching entry in `P[]` — the page content alone does nothing for nav/search/progress without the registry entry.

**State:** fully built, committed, pushed, and live as of this writing. A Probability expansion (Homeworks 5&ndash;6, quizzes, worksheets, a new interactive page) is **in progress** — see §7.

## 2. GitHub Pages deployment

**There is no build step.**

```bash
git add -A
git commit -m "..."
git push origin main
```

GitHub Pages (Settings → Pages, "Deploy from a branch", `main` / `/` root, no Actions workflow) rebuilds automatically within ~30&ndash;90 seconds of a push. `curl` the live URL and grep for something you just changed to confirm a deploy landed &mdash; don't trust a successful push alone.

**Repo visibility:** deliberately public so GitHub Pages is free (the owner has no paid plan). This was an informed tradeoff by the owner &mdash; the content is a math study guide, nothing sensitive. Don't make it private without asking; that breaks hosting on the free tier.

**No base-path issues:** served from the repo root; all internal links use plain relative paths (`assets/style.css`, `probability.html#q1`). No leading slashes, no `<base>` tag. Keep it that way.

## 3. Git identity and push auth on this VM

**This is a VM that may be wiped without warning.** Everything must live in git, pushed, not just on disk. If you're a fresh agent reading this after a wipe:

- **Clone:** `git clone https://github.com/Street-Volume/inference-atlas.git` (the remote is HTTPS, not SSH, as of this writing &mdash; simpler for a non-technical owner than managing SSH keys per VM).
- **Local git identity** (this repo only, not global &mdash; deliberately, to avoid touching global config without asking): `git config --local user.name "Jalil"` and `git config --local user.email "jalilmoad@gmail.com"`.
- **Push auth:** a GitHub Personal Access Token, stored via `git config --local credential.helper store` with a `~/.git-credentials` line of the form `https://<token>:x-oauth-basic@github.com`. Test with `git push origin main --dry-run`. If push fails with "could not read Username," there's no stored credential yet &mdash; walk the owner through generating a new classic PAT with the `repo` scope at github.com/settings/tokens (he is a GitHub beginner; explain each click).
- The repo's own `.claude/settings.json` has a `Stop` hook that auto-commits and pushes after every Claude Code turn (see §5) &mdash; it needs this same push auth to actually work, so set up the credential *before* relying on the hook.
- An older version of this doc described an SSH-key-based recovery flow; a later session switched to the HTTPS+PAT approach above because it needed no local terminal access to github.com for the owner to understand. Two leftover PDF files in `~/Uploads` (`vm-reset-github-ssh-recovery*.pdf`) describe the old SSH flow if you ever prefer it, but it's not what's configured now.

## 4. Known bugs, caveats, and environment quirks

- **No `node`/`npm`/`npx` on this machine, confirmed repeatedly.** Don't suggest npm-based tooling. For a local preview, `python3 -m http.server 8000` from the repo root (Python 3 is present). This sandbox's `http_proxy` env var breaks `curl localhost:...` unless you pass `--noproxy '*'`.
- **No browser automation tool was available in the sessions that built this content.** Everything has been verified by static analysis only: duplicate-id checks, tag-balance checks, MathJax delimiter balance, and a full internal-link/anchor resolution pass across every page (`href="#x"` and `href="page.html#x"` both checked against real `id="x"` attributes). That is NOT the same as a human clicking around in a real browser. **Get the owner to click-test the live site** &mdash; sidebar nav incl. mobile drawer, search (`/` or Ctrl/Cmd-K), marking a problem understood and watching the progress ring + per-part sidebar badges update (incl. after reload, since it's `localStorage`), `J`/`K` stepping across a page boundary, the encyclopedia sliders, the bridge diagram, the answer checker &mdash; before trusting any of it fully.
- **The step-through derivation walker was dead code until this session fixed it.** Every `.part.walk` block (the "Back / Step through / Show all" buttons under a derivation) had matching CSS and markup but *zero* JavaScript behind it &mdash; confirmed by grepping all of `app.js` and every page's inline script. Fixed in `app.js` (search for "step-through derivation walker"): clicking the buttons now toggles `li.dim`/`li.cur` on the `ol.steps` and updates the `.pos` counter. This fix is shared by every page that uses the pattern, old and new content alike.
- **Styling quirks**: dark-first (`color-scheme: dark` default), light overrides gated on `prefers-color-scheme` and an optional `data-theme="light"|"dark"` attribute override, but there is still no UI control to toggle it &mdash; it only follows the OS/browser setting. `window.Atlas.onRetheme` exists for canvases that need to repaint on a theme change; wire new toggle logic through that if ever asked to add one, don't duplicate it.
- **GitHub Pages caching**: allow 30&ndash;90 seconds after a push before the live URL reflects changes.
- **A second, unrelated repo exists**: `https://github.com/Street-Volume/quantitative-finance-personal-website` &mdash; Jalil's simple personal portfolio site (single `index.html`, React/Tailwind via CDN, 2 commits, no HANDOFF, far less actively maintained than this one). Don't confuse the two if the owner mentions "my site" ambiguously &mdash; ask which one.

## 5. Autosave hook

`.claude/settings.json` (project-scoped, committed to the repo) has a `Stop` hook that runs after every Claude Code turn: `git add -A && git commit (if changes) && git push origin main`. The working tree should essentially never have uncommitted changes between sessions. If you find uncommitted changes, something is unusual &mdash; investigate rather than discarding them. This hook only fires inside Claude Code sessions and only works once push auth is configured (§3).

## 6. No automated tests

Verification has only ever been: (a) `curl`/regex/Python static checks for link, anchor, and tag-balance validity (described in §4), and (b) the owner manually loading pages (not yet confirmed done &mdash; see §4). There is no CI, no linter config, no test runner.

## 7. Work completed (most recent session) &mdash; the big content expansion

Jalil uploaded a large batch of new course material to `~/Uploads` (M463 Probability Homeworks 5&ndash;7 WebAssign exports, quizzes, worksheets, a theorem reference, an R project, Operations Research Homeworks 5&ndash;7, and two pre-built HTML study-guide drafts) and asked for all of it folded into the site with the same quality bar as the existing content, continuously backed up to GitHub. **All four planned phases are done.** The site went from 19 problems to **71**, plus a new interactive page.

**Phase 1 (commit `b3d90dd`): Operations Research, Homeworks 5 & 6.** Added S1&ndash;S7 (simplex method, tableau form) and M1&ndash;M7 (Big M method) to `operations-research.html`, ahead of the existing OR1&ndash;OR5 shadow-price problems (Part C: 5 → 19 problems). Every tableau was independently re-derived rather than trusted from the source PDFs as-is &mdash; caught two places (S4, S7) where the circulating solution stopped one simplex iteration early despite a non-optimal row 0 remaining (same numeric answer, but not the tableau the stopping rule actually reaches). Both logged in the `workbench.html` audit log under `data-src="self"`. Also fixed the dead step-through walker described in §4 (shared by every page), added two new hues (`simplex`, `bigm`) to `style.css`.

**Phase 2 (commit `174e82f`): Probability, Homeworks 5 & 6, Quizzes 4 & 7, Worksheets 13&ndash;14.** Added 38 problems to `probability.html` (Part A: 11 → 49), positioned chronologically: Quiz 4 (Bayes' theorem, law of total probability, counting) first, then Homework 5 (`h5-1`..`h5-11`), Homework 6 (`h6-1`..`h6-14`), Worksheet 13 before the existing MGF problems, Worksheet 14 before the existing continuous-RV problems, Quiz 7 at the end. HW06 and Quiz 4 had answer keys &mdash; every number re-verified with exact Python arithmetic regardless. **HW05 and Quiz 7 had no solutions provided at all**; both were solved from scratch this session and verified the same way &mdash; worth a spot-check against Jalil's actual WebAssign scores if he ever wants full certainty. Theorems 3.3&ndash;3.6 added as a non-problem reference card. New figure: a static natural-frequency tree (CSS flexbox, no new JS) for the Bayes' diagnostic-test problem.

**Phase 3 (commit `2db3684`): R Lab.** New standalone page `r-lab.html`, reimplementing the uploaded Project 2 R assignment directly in-browser (no R on this machine, no build step): 11 sliders build a custom pmf, live-renormalized, with a cumsum staircase cdf and toggleable Binomial(10,0.6)/Poisson(6) overlays. Caught and fixed one bug before pushing: a link to `encyclopedia.html#binom` that looked like a deep link but wasn't &mdash; that page ignores its URL hash and always opens on a hardcoded default, so every real cross-link on the site uses `encyclopedia.html#ency` instead. Registered in `app.js`'s `SECTIONS`/`names` (search + breadcrumb); not a numbered problem, so no `P[]` entry.

**Phase 4: Mathematical Statistics enrichment &mdash; investigated, found already done.** The plan called for mining `hw7_guide_extended`/`hw7_guide_compact` (the two uploaded Gemini LaTeX guides, 1,592 lines) and the two pre-built HTML artifacts for derivation depth to add to 9.82/9.96/10.5 on `inference.html`. Reading both the guides and the *existing* `inference.html` + `mle-toolkit.html` + `mvue-guide.html` content side by side showed they'd already been fully mined: the existing 9.82(c) "Note" flag about Rao&ndash;Blackwell vs. completeness, and the audit log's `data-src="a"`/`data-src="b"`/`data-src="lab"` rows, correspond line-for-line to specific issues in these exact uploaded files (the `\newtcolorbox` LaTeX bug, the Tchebysheff section-numbering flag, "all 14 problems' answers match"). **No changes were made** &mdash; adding more would have duplicated content, not enriched it. If a future session is asked to revisit this, check here first before re-reading those PDFs; they're already fully absorbed.

**Sitewide bookkeeping, done across all phases:** `app.js`'s `P[]` got all 52 new problem entries (OR's 14 inserted before `or1`; Probability's 38 split across two insertion points to preserve chronological next/previous stepping); `index.html` hero stats (19→71 problems, 109→263 derivation steps, 49→132 checkable answers), course-card text, problem-map tiles, and filter chips; the Part A/C nav-badge fallback text across all pages; and &mdash; the one piece that was genuinely still open after Phases 1&ndash;3 &mdash; `workbench.html`'s interactive checker got 83 new entries (all numeric answers already verified during Phases 1&ndash;2, so this was data entry, not new derivation), bringing it to 132. The static "Answer key" table below the checker was *not* extended to the new 52 problems (each already has its own visible Answer box on its own page; extending that table too would have been low-value duplication for the effort).

If you're picking this up fresh: the uploaded source files are still in `~/Uploads` on this VM (not committed to the repo, since they're Jalil's personal coursework exports, not site assets) &mdash; re-read them there rather than asking him to re-upload, unless the VM has been wiped since. As of this writing there is no new work queued; the next thing to do is **get a real browser click-test** (§4's long-standing top caveat, now even more pressing with 71 problems' worth of untested nav/search/progress-tracking state) before adding anything else.
