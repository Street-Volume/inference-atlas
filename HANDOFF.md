# Handoff: Inference Atlas

Read this before touching anything. The owner, Jalil, is **not a programmer** — he relies entirely on whichever agent is driving this repo to explain things in plain language, to never lose his work, and to keep the live site working. Optimize for reliability over cleverness.

Live site: **https://street-volume.github.io/inference-atlas/**
Repo: **https://github.com/Street-Volume/inference-atlas** (public — see §2 for why)

## 1. Project summary

**What it is:** a personal study guide / interactive textbook covering three courses: M463 Probability I, Mathematical Statistics, and M447/M577 Operations Research (Wackerly/Mendenhall/Scheaffer textbook + Hillier/Lieberman textbook), plus several standalone "study tool" pages (quant finance lab, science workbench, MLE toolkit, MVUE guide, testing vocabulary, midterm roadmap). Originally a single Claude.ai HTML artifact, imported here and heavily extended over many sessions.

**Stack:** zero-build, hand-authored static HTML/CSS/vanilla JS. **No npm, no node, no bundler, no framework** — confirm with `command -v node npm npx` before assuming otherwise; this machine typically has none of them. Math rendering via MathJax (CDN, `tex-svg.js`). Fonts from Google Fonts CDN.

**Current architecture — a 13-page static site:**

| File | Content |
|---|---|
| `index.html` | Home: hero, stats, course cards, full problem map |
| `probability.html` | Part A, M463 Probability (Homework 07: Q1&ndash;Q11 as of this writing; see §7 for in-progress Homeworks 5&ndash;6 / quizzes / worksheets work) |
| `inference.html` | Part B, Mathematical Statistics (9.82, 9.96, 10.5) |
| `operations-research.html` | Part C, Operations Research &mdash; **now 19 problems**: S1&ndash;S7 (Homework 5, simplex method), M1&ndash;M7 (Homework 6, Big M method), OR1&ndash;OR5 (Homework 7, shadow prices/sensitivity), in that pedagogical order |
| `encyclopedia.html` | 16-distribution interactive spotlight + ridgeline canvas |
| `bridge.html` | Concept bridge (Part A ↔ Part B concept links) |
| `workbench.html` | Answer checker + **audit log** (corrections to earlier drafts — see §7, two new entries added there) |
| `quant.html`, `science.html`, `mle-toolkit.html`, `mvue-guide.html`, `testing-vocab.html`, `midterm-guide.html` | Standalone study-tool pages, not part of the numbered problem set |
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

## 7. Work completed and in progress (most recent session)

Jalil uploaded a large batch of new course material to `~/Uploads` (M463 Probability Homeworks 5&ndash;7 WebAssign exports, quizzes, worksheets, a theorem reference, an R project, Operations Research Homeworks 5&ndash;7, and two pre-built HTML study-guide drafts) and asked for all of it folded into the site with the same quality bar as the existing content, continuously backed up to GitHub.

**Done (commit `b3d90dd`): Operations Research, Homeworks 5 & 6.** Added S1&ndash;S7 (simplex method, tableau form) and M1&ndash;M7 (Big M method) to `operations-research.html`, ahead of the existing OR1&ndash;OR5 shadow-price problems. Every tableau was independently re-derived rather than trusted from the source PDFs as-is &mdash; this caught two places (S4, S7) where the circulating solution stopped one simplex iteration early despite a non-optimal row 0 remaining (same numeric answer, but the tableau shown wasn't actually the one the stopping rule reaches). Both are logged in the `workbench.html` audit log under `data-src="self"`. Also fixed the dead step-through walker described in §4, added two new topic "hues" (`simplex`, `bigm`) to `style.css`, and updated `index.html`'s hero stats/problem map/filter chips and `app.js`'s `P[]` registry to match.

**In progress: Probability, Homeworks 5 & 6, quizzes, worksheets.** Plan (from the session's approved plan file, now mid-execution):
- `probability.html`: add Homework 5 (11 WebAssign problems, Wackerly 3.3&ndash;3.4 &mdash; **no answer key was provided for this one**, solutions are being derived fresh and should be spot-checked by Jalil against his actual WebAssign scores) and Homework 6 (14 WebAssign problems, Wackerly 3.5&ndash;3.8, full answer key provided and already cross-checked), both positioned *before* the existing Homework 07 (Q1&ndash;Q11) content, same chronological-ordering logic used for Operations Research. New ids prefixed to avoid collision: `h5-1`..`h5-11`, `h6-1`..`h6-14`.
- Quiz 4 (Bayes' theorem, solved, one problem) and Quiz 7 (5 questions, **unsubmitted/unscored on WebAssign, no key provided** &mdash; also being solved fresh, also flagged for spot-check) as new problems.
- Worksheets 13 (geometric MGF + transform, Tchebysheff) and 14 (pdf/cdf construction, percentiles) as additional practice problems, reusing existing MGF/Tchebysheff/pdf-cdf figure patterns rather than inventing new ones.
- Theorems 3.3&ndash;3.6 (expectation linearity) as a compact reference card in the Part A reading list, not a numbered problem.
- A new standalone page, `r-lab.html`, mirroring the uploaded "Project 2" R assignment: an interactive custom discrete-distribution builder (editable pmf bars that renormalize live, a cumsum staircase cdf, overlay against Binomial(10,0.6) and Poisson(6)), same precedent as `quant.html`/`science.html`.
- Enrich the existing Mathematical Statistics problems (9.82/9.96/10.5 on `inference.html`) with extra derivation depth mined from the uploaded `hw7_guide_extended`/`hw7_guide_compact` PDFs and two pre-built HTML artifacts (`applied_math_learning_lab.html`, `Homework 7 Visual Guide.html`, both still sitting in `~/Uploads`, not yet merged in) &mdash; enrich in place, don't duplicate sections.
- Sitewide bookkeeping to do once all of the above lands: update `app.js`'s `P[]` with every new entry, `index.html` hero stats/course-card counts/problem-map tiles/nav badges, `workbench.html`'s checker with new checkable answers, and this file.

If you're picking this up fresh: the uploaded source files are still in `~/Uploads` on this VM (not committed to the repo, since they're Jalil's personal coursework exports, not site assets) &mdash; re-read them there rather than asking him to re-upload, unless the VM has been wiped since.
