# Inference Atlas

A single-page study guide for probability & inference, originally built as a Claude.ai artifact.

## What's here

- `index.html` — the whole thing: markup, styles, and scripts all in one file. No build step, no dependencies.

## Previewing locally

Since it's just a static HTML file, open it directly in a browser, or serve it so fonts/MathJax (loaded from CDNs) behave like they would online:

```
python3 -m http.server 8000
```

Then visit http://localhost:8000 in a browser.

## Working on this with Claude Code

Just describe what you want changed — a new section, a fixed bug, a tweaked visual — in plain language. You don't need to know HTML/CSS/JS yourself; that's what I'm here for. Good things to mention:

- Which part of the page you're talking about (a section title, a button, etc.)
- What's wrong or what you want instead
- Whether it's about looks, behavior, or content/wording

Each change gets committed to git so we have a history to fall back on if something goes wrong.
