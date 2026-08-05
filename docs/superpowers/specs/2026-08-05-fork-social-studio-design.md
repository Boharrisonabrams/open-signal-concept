# Fork, social graph, and studio — design

Date: 2026-08-05
Status: approved by Bo (brainstorm round two, both design sections)

## Goal

Complete the GitHub-community translation: sounds and profiles carry stars,
forks, and comments; forking a pack lands in a Suno-create-idiom Studio
scene with cloud drafts and visible credit; a comment thread with an
embedded forked-sound reply demonstrates social asynchronous collaboration.
After judges review and Bo approves, publish the source publicly to
boharrisonabrams on GitHub.

## Decisions (from brainstorm)

1. **"Packs"** is the producer-native bundle word. "Reusable components" →
   "Trending packs" everywhere; fork targets are packs.
2. **Studio scene + drafts.** Fork opens a new `studio` scene (reached only
   by forking — NOT in the tab row); Save draft syncs to a Your-drafts
   strip on browse. No audible layer mixing.
3. **Comments live on the featured pack only**, using Bo's dialogue
   verbatim; a real local composer posts your comment into the thread.
4. **Public repo, inline build.** Publish only after judge panel AND Bo's
   test approval. Verify `gh auth status` is boharrisonabrams before any
   push; stop and report if not.

## Voice rule (standing, from 2026-08-05)

Inside the phone: product-voice (what a user needs to want to act) or
viewer-essential disclosure only. No positioning language.

## Unit 1 — Pack tiles with the social graph (browse)

- Section title: "Trending packs" (replaces "Reusable components").
- Tile line 2 becomes stats: star glyph + count · fork count. Featured pack
  (Drum texture): ★ 214 · 41 forks · comment chip (comment icon + 3).
  Tape-warble keys: ★ 58 · 9 forks. Dusted bass one-shots: ★ 31 · 6 forks.
- Reuse language stays where it lives today (profile: "reused in 14
  projects"; sheet header shows the full chain: "★ 214 · 41 forks · 14
  shipped"). Forks exceed shipped reuse by design — GitHub-honest.
- The featured pack tile is the browse scene's second live object: tapping
  it opens the comments sheet. A small Fork button (glyph + "Fork") on the
  featured tile opens the Studio scene directly. Other pack tiles remain
  non-interactive dressing with visible counts.

## Unit 2 — Comments sheet (featured pack)

Slide-up sheet, dark idiom, drag handle, close control, Escape closes.

- Header: "Drum texture" · "Pack by @lowlight" · stats row
  "★ 214 · 41 forks · 14 shipped".
- Thread (verbatim, fictional handles from existing faces):
  - @julesmakes: "I added more snare to this to really bring out the
    offbeat" + embedded playable card: "Offbeat snare flip — Fork of Drum
    texture" (play glyph; plays the existing @lowlight sketch through the
    existing preview engine — a fork audibly kin to its source; no new
    audio engine).
  - @lowlight with a "Creator" chip: "That's genius."
- Composer: input "Add a comment…" + Post button; posting appends your
  comment ("You") to the thread locally. State resets with Reset demo.
- A "Fork" action in the embedded card row opens Studio (same as tile
  Fork).

## Unit 3 — Studio scene (fork destination)

New `studio` scene value (Scene union + PhoneDemo branch). NOT added to the
tab row; entered via Fork actions; header close returns to browse. Reset
returns to browse and clears the draft.

- Eyebrow: "Your studio · Draft". Title: "Fork of Drum texture".
- Provenance chip: "Forked from @lowlight · credit attached" (the visible
  citation/licensing line).
- Layer stack: layer 1 card "Drum texture — @lowlight" with a small lock
  glyph + "Credit locked"; layer 2 card empty-state "Add your sound".
- Prompt box (Suno create idiom): placeholder "Describe what to change…
  e.g. more snare on the offbeat"; method chips Record / Remix with Suno /
  Upload (selection state only).
- Primary lava CTA "Save draft" → saved state: "Saved to your studio ·
  Synced" with a check; the featured pack's fork count reads 42 wherever
  visible; browse gains a "Your drafts" strip (own section title) with one
  card: "Fork of Drum texture · Draft · Synced just now" (non-interactive).
- State lives in OpenSignalExperience alongside existing state
  (forkedDraft: boolean; starred: boolean; comments: array). No
  localStorage for these (session-ephemeral; Reset clears all three).
- Derived counts: featured-pack forks render as 41 + (forkedDraft ? 1 : 0)
  in both the tile and the sheet header; stars render as
  214 + (starred ? 1 : 0). Tapping the ★ on the featured tile toggles
  starred (like the existing like toggle).
- `"studio"` is appended LAST in `SCENES` so existing scene indices (and
  the hero-step `progress >= 2` gate) are untouched; the tab row renders
  `SCENES.filter((s) => s !== "studio")`; `?scene=studio` deep-links work.

## Unit 4 — Profile stars

Reputation stats become four cells: 18 Accepted · ★ 214 · 46 Reuses · 7
Open calls (accepted still increments on acceptance). Verify the four-cell
row fits at 390 (shrink cell typography if needed, measured).

## Motion pass (one token set; transform/opacity only; the global
reduced-motion block already collapses everything)

- Sheets (call, receipt, comments): slide-up entrance 340ms
  cubic-bezier(0.32, 0.72, 0, 1).
- Browse cards: staggered entrance ~30ms per card on scene enter, once.
- Pressed scale on every interactive card/button in the phone (extend the
  live-card pattern, 140ms).
- Fork count tick: 200ms scale pop on change. Star fill (if starred state
  is added to the featured tile): 180ms pop. No layout-shifting animation.

## Docs, tests, records

- Tests pin: "Trending packs", "Save draft", "Saved to your studio",
  "Forked from @lowlight", "That's genius." and keep all existing pins
  green.
- Primer hard question added: "Stars are the popularity contest you said
  you rejected — why add them?" Answer: stars rank packs for discovery;
  reputation stays denominated in accepted work; the profile leads with
  Accepted, and stars never gate acceptance.
- HANDOFF: record the round, the voice-rule reaffirmation, and publish
  state. Evidence transcript updated for future panels.

## Publish sequence (after Bo's approval only)

1. `gh auth status` → require login boharrisonabrams; stop and report
   otherwise.
2. `gh repo create boharrisonabrams/open-signal-concept --public
   --source=. --remote=origin --push` (or `git remote add` + push if the
   repo exists).
3. Verify the repo renders (README present) and report the URL.

## Out of scope (YAGNI)

Real backend or cloud persistence; audible layer mixing in Studio;
comments on takes or calls; stars/forks on calls; new portrait images; new
dependencies; Codex delegation; renaming the demo song.

## Risks

- Two live objects on browse: keep visual hierarchy — the call card stays
  the primary ringed path; the pack's affordances are quieter (counts +
  small Fork button).
- Fiction math: 41 forks > 14 shipped reuse is deliberate; the comments
  sheet header states the chain so no two numbers claim the same thing.
- Studio is a new scene outside the tab row: ensure deep-link
  ?scene=studio works (SCENES includes it) but the tab row renders only
  the original seven (tab list filters studio out).
