# Handoff: Inference Atlas

Read this before touching anything. The person who owns this project is **not a programmer** — they rely entirely on whichever agent is driving this repo to explain things in plain language, to never lose their work, and to keep the live site working. Optimize for reliability over cleverness.

Live site: **https://street-volume.github.io/inference-atlas/**
Repo: **https://github.com/Street-Volume/inference-atlas** (public — see §2 for why)

## 1. Project summary

**What it is:** a personal study guide / interactive textbook covering three courses: M463 Probability I, Mathematical Statistics, and M447/M577 Operations Research (Wackerly/Mendenhall/Scheaffer textbook + Hillier/Lieberman textbook). 19 homework problems with full worked derivations, 20 interactive canvas-based "live figures," a 16-distribution interactive encyclopedia, a cross-topic "concept bridge," an answer checker, and an audit log of corrections made to earlier drafts of this content. Originally built as a single Claude.ai HTML artifact, then imported here and heavily extended.

**Stack:** zero-build, hand-authored static HTML/CSS/vanilla JS. **No npm, no node, no bundler, no framework** — and this machine has none of those installed (`node`/`npm`/`npx` all absent; confirm with `command -v node npm npx` before assuming otherwise). Math rendering via MathJax (loaded from a CDN, `tex-svg.js`). Fonts from Google Fonts CDN. Everything else is hand-written.

**Current architecture (as of the last commit):** a **7-page static site**, split from an original single 4,100-line `index.html` monolith:

| File | Content |
|---|---|
| `index.html` | Home: hero, stats, course cards, full problem map (19 tiles) |
| `probability.html` | Part A: reading list + Q1–Q11 (MGFs, Tchebysheff, discrete/continuous) |
| `inference.html` | Part B: reading list + 9.82, 9.96, 10.5 (estimation, testing) |
| `operations-research.html` | Part C: reading list + OR1–OR5 (LP shadow prices, sensitivity) |
| `encyclopedia.html` | 16-distribution interactive spotlight + ridgeline canvas |
| `bridge.html` | Concept bridge (Part A ↔ Part B concept links) |
| `workbench.html` | Answer checker (49 checkable answers) + audit log |
| `assets/style.css` | **All shared CSS** (~1,900 lines, dark-first design system) |
| `assets/app.js` | **Shared JS app shell**: nav, search palette, progress tracking (localStorage), quiz mode, keyboard shortcuts, mobile drawer, cross-page stepping |

Each page additionally has its **own inline `<script>`** at the bottom for page-specific interactivity (canvas figures, the encyclopedia's distribution math, the bridge diagram, the checker). These were extracted verbatim from the original monolith's separate `<script>` blocks — they were already self-contained IIFEs, which is what made the split tractable. See §4 for exactly how cross-page references were patched.

**State:** fully built, committed, pushed, and live. Last session did a full static verification pass (described in §5) but **no real browser testing was ever done** — see §5, this is the single biggest caveat.

## 2. GitHub Pages deployment

**There is no build step.** This is the entire deployment process:

```bash
git add -A
git commit -m "..."
git push origin main
```

GitHub Pages is configured (in the repo's Settings → Pages, done manually via the web UI, not via a workflow file) as:
- **Source:** "Deploy from a branch"
- **Branch:** `main`, folder `/` (root)

There is **no GitHub Actions workflow** in this repo (no `.github/workflows/`). Pages rebuilds automatically within ~30–60 seconds of any push to `main`. To check whether a deploy has landed, `curl` the live URL and grep for something you just changed — don't just trust that "git push succeeded" means the site updated yet.

**Repo visibility:** GitHub Pages on a private repo requires a paid GitHub plan. The owner does not have one, so **the repo was deliberately made public** to get free Pages hosting. This was an explicit, informed tradeoff the owner chose (the content is a math study guide, nothing sensitive) — don't "fix" this by making it private again without asking, since that would break the live site on the free tier.

**No base-path issues:** the site is served from the repo's root at `https://street-volume.github.io/inference-atlas/`, and all internal links/assets use plain relative paths (`assets/style.css`, `probability.html#q1`, etc.) — no leading slash, no `<base>` tag, no router. This works correctly both locally (via `python3 -m http.server`) and on Pages without any path rewriting. Keep it that way — don't introduce absolute paths like `/assets/style.css`, which would break if the site were ever moved to a different subpath.

## 3. Work completed this session

Branch: `main` (the only branch; no feature branches in use). Working tree is clean — everything below is committed and pushed. Commit history, newest first:

1. `528be9c` Add mobile app-like meta tags (theme-color light/dark, web-app-capable) for the phone/home-screen use case
2. `0bb7980` Add a favicon (inline SVG data URI, reuses the brand gradient + ∑ glyph)
3. `2e672b4` Fix labeling inconsistencies (lang="en" added everywhere, capitalization, home page H1 still said old retired terms, Workbench tab title didn't match its own heading, stale "Tools" breadcrumb string)
4. `7424a46` Fix sidebar "Part B · Inference"/"Part C · Optimization" → "Part B · Mathematical Statistics"/"Part C · Operations Research" (now consistent with hero cards and page titles); renamed nav group "Tools" → "Study Tools"; added live per-part progress badges (e.g. "3/11") to the sidebar, driven by `localStorage`
5. `f671040` **The big one**: split the single-page monolith into the current 7-page site (see §1)
6. `fb5b5c1`, `c73b64e`, `5b0c324`, `dcfe2d3`, `6037e3b` — earlier content work: added quant-finance "real world" callouts to every problem and every encyclopedia entry, added two new distributions (Student's t, Log-normal), fixed a stale problem-count string, added a scroll-reveal animation fix
7. `b365eb9` Added the autosave hook (see §5 — this is important, read it)
8. `713698f` Initial import of the original single-page Claude.ai artifact

## 4. Immediate next steps, in priority order

1. **Get the owner to click-test the live site in a real browser.** This was never done — the agent that built the 7-page split (previous session) had no browser or JS runtime available, only `curl`/`grep`-based static checks (verified: every cross-page link resolves to a real anchor, every inline `<script>` block has balanced braces/parens/brackets). That is NOT proof the JS actually runs correctly. Specifically ask the owner to check, in order of risk:
   - Does the sidebar nav work on every page, including the mobile hamburger drawer?
   - Does search (`/` key or the search button) find things and navigate to the right page when the result lives on a different page than the one you searched from?
   - Mark a problem "understood" on one page — does the progress ring (topbar) AND the new per-part sidebar badge (e.g. "3/11") update correctly, including when you reload or visit a different page (localStorage persistence)?
   - Press `J` (next problem) on the LAST problem of a page (Q11, or 10.5, or OR5) — does it correctly navigate to the first problem of the NEXT page, or does it error/do nothing? This cross-page stepping logic (`step()` in `assets/app.js`) is hand-written and never executed once.
   - Open `encyclopedia.html` — do the parameter sliders, the ridgeline canvas, and clicking a distribution all work?
   - Open `bridge.html` — does the bridge diagram render and respond to clicks? Does navigating there via a search-palette "Bridge" result pre-select the right link (`bridge.html#link2` etc. — see the hash-check code at the bottom of `bridge.html`'s inline script)?
   - Open `workbench.html` — type an answer into a checker card and press Enter; does it grade correctly and does the "open ↗" link on each card go to the right page?
2. **Fix whatever #1 finds.** This is almost certainly where real bugs are hiding — the split touched ~530 lines of intricate, single-page-assuming JS (scroll-spy, context rail, search palette, progress tracking) that had to be adapted to multi-page without ever being run.
3. Nothing else is currently planned or in progress. There is no open task list, no partially-done feature, no TODO comments. If the owner asks for something new, it's a fresh request, not a continuation.

## 5. Known bugs, caveats, and environment quirks

- **No real browser/JS testing has EVER been done on the 7-page site.** This is the most important caveat in this document. Everything was verified by regex/static analysis only. Treat the multi-page interactivity as "should work, unverified" until a human confirms it in an actual browser.
- **This machine has no `node`/`npm`/`npx`.** Don't suggest npm-based tooling (linters, bundlers, the `modern-web-guidance` skill's own `npx` command) without first checking `command -v node`. If you need a local preview server, use `python3 -m http.server 8000` from the repo root (Python 3 is present). Note: this sandbox has an `http_proxy` env var that breaks `curl localhost:...` unless you pass `--noproxy '*'`.
- **This is a VM that may be wiped without warning** (the owner's own words: "local VM machine that will reset totally and be wiped"). This is *why* the autosave hook exists (below) and why everything must live in git, pushed, not just on disk. If you're a fresh agent reading this after a wipe: the repo is fully recoverable via `git clone git@github.com:Street-Volume/inference-atlas.git`, but you'll need a fresh SSH key (`ssh-keygen -t ed25519`) added to the owner's GitHub account (https://github.com/settings/ssh/new) before you can push — the old key dies with the VM.
- **Autosave hook is active**: `.claude/settings.json` (project-scoped, committed to the repo) has a `Stop` hook that runs after every Claude Code turn: `git add -A && git commit (if changes) && git push origin main`. This means **the working tree should essentially never have uncommitted changes** between sessions. If you find uncommitted changes, something is unusual — investigate rather than assuming it's fine to discard them. This hook only fires inside Claude Code sessions; it does nothing if the owner edits files some other way.
- **No git identity was configured globally** — `user.name`/`user.email` were set *locally to this repo only* (`Jalil` / `jalilmoad@gmail.com`), specifically to avoid touching global git config without asking. If you clone this repo fresh on a new machine, you'll need to set these again (locally, in this repo) before any commit will succeed.
- **The old single-page `index.html` is gone from the working tree** but fully recoverable from git history (`git show f671040^:index.html` or `git log --follow -- index.html`) if ever needed as a reference. The split commit's message explains the mapping from old sections to new files in detail.
- **Hand-extraction risk**: the per-page inline scripts were extracted from the old monolith via `sed` line-range slicing (documented with exact line numbers in that session's reasoning, not preserved in any file) plus manual `sed`/`Edit` fixes to rewrite same-page anchors (`#q1`) into cross-page links (`probability.html#q1`) wherever content moved to a different file. If something looks like it's missing a link or jumps to the wrong place, suspect an incomplete rewrite in that pass — search for any remaining bare `href="#id"` where `id` doesn't exist on that page as the first debugging step.
- **No automated tests exist.** Verification has only ever been: (a) `curl` + regex checks for link/anchor validity and bracket balance (described above), and (b) the owner manually loading pages. There is no CI, no linter config, no test runner.
- **Styling quirks**: the design is dark-first (`color-scheme: dark` by default) with light-mode overrides gated on `prefers-color-scheme` and an optional `data-theme="light"` attribute override — but **there is currently no UI control to toggle this manually**, it only follows the OS/browser setting. If asked to add a theme toggle, the CSS already supports `data-theme="dark"|"light"` on `<html>`; you'd just need to add a button that sets it and a `MutationObserver`-driven repaint hook already exists in `assets/app.js` (`window.Atlas.onRetheme`) for canvases that need to redraw on theme change — wire new toggle logic through that, don't duplicate it.
- **GitHub Pages caching**: after pushing, allow 30–90 seconds before the live URL reflects changes. Don't conclude a push "didn't work" if `curl`ing immediately after shows stale content.

## 6. Commit & push

Working tree was clean at the time this document was written (nothing to stage beyond this file itself). This file is being added and pushed now:

```bash
git add HANDOFF.md
git commit -m "Add HANDOFF.md for session/agent transfer"
git push origin main
```
