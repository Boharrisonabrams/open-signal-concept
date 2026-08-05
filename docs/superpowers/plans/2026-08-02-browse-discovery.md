# Browse Discovery Surface Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a browse-first "Open work" discovery scene to the Open Signal demo so the reviewer lands as a producer browsing trending calls, components, and contributors, and taps into the existing contribution flow.

**Architecture:** One new scene component (`BrowseScene`) inside the existing single-file experience component, wired as the first entry in the scene state machine and the demo default. Styling extends the existing `.phone-frame` dark token layer. No new dependencies, no new routes, no new assets beyond CSS gradient tiles.

**Tech Stack:** React (vinext SSR), plain CSS in `app/globals.css`, node:test source/SSR pins, Cloudflare Worker deploy via `npm run deploy`.

## Global Constraints

- Spec: `docs/superpowers/specs/2026-08-02-browse-discovery-design.md` — follow its copy verbatim.
- No new npm dependencies; no new image files (reuse `open-signal-cover.png`, `nia-okafor.png`, `adopter-*.jpg`; new tiles are CSS gradients).
- No new AI-face portraits anywhere.
- Only the Open Signal call card is interactive on the browse scene; all dressing content renders as `div`/`span`, never disabled buttons.
- Existing deep links (`?scene=player` etc.) must keep working; Accepted-tab gating unchanged.
- Copy voice: musical, concrete, no em-dash chains, no "not X but Y" stacks.
- Before Task 2 (visual build), load skills `ui-ux-pro-max:ui-ux-pro-max` and `frontend-design:frontend-design` (Bo's explicit instruction).
- Every task ends with lint + typecheck + tests green: `npm run lint && npx tsc --noEmit && npm test`.

---

### Task 1: Scene wiring + failing copy pins

**Files:**
- Modify: `app/OpenSignalExperience.tsx` (SCENES/labels/default/reset/URL-sync/hero-step logic/PhoneDemo branch)
- Test: `tests/rendered-html.test.mjs`

**Interfaces:**
- Produces: `Scene` union includes `"browse"`; `BrowseScene({ onOpenCall }: { onOpenCall: () => void })` stub rendered when `scene === "browse"`; bare URL and Reset land on browse.

- [ ] **Step 1: Add failing source pins**

In `tests/rendered-html.test.mjs`, inside the source test after the `Invite-only call` assertion, add:

```js
  assert.match(source, /Open work/);
  assert.match(source, /A feed of problems, not posts/);
  assert.match(source, /Trending open calls/);
```

- [ ] **Step 2: Run tests to verify the new pins fail**

Run: `npm test`
Expected: FAIL on `/Open work/` (source has no such string yet).

- [ ] **Step 3: Wire the scene machine**

In `app/OpenSignalExperience.tsx` (read the top-of-file declarations first and match their exact form):

1. Add `"browse"` as the FIRST element of the `SCENES` array and `Browse` to the scene-label mapping.
2. Change the initial state to `useState<Scene>("browse")`.
3. In `navigate()`, the bare-URL scene becomes browse: delete the `scene` search param when `next === "browse"` (not `"player"`); all other scenes keep `url.searchParams.set("scene", next)`.
4. In `syncFromLocation()`, the fallback scene becomes `"browse"` (was `"player"`).
5. In `resetDemo()`, navigate to `"browse"`.
6. Hero steps: the step-1 active check is `progress >= 1` today because `call` sits at index 1; with browse prepended, `call` moves to index 2, so change the check to `progress >= 2`. Steps 2 and 3 use scene-name/acceptedId checks and need no change.
7. In `PhoneDemo`, render the new scene:

```tsx
      {scene === "browse" ? (
        <BrowseScene onOpenCall={() => onScene("call")} />
      ) : null}
```

8. Add the stub component (full content arrives in Task 2), placed alongside the other scene components:

```tsx
function BrowseScene({ onOpenCall }: { onOpenCall: () => void }) {
  return (
    <section className="browse-scene scene" aria-label="Browse open work">
      <div className="status-bar status-bar--light" aria-hidden="true">
        <strong>9:41</strong>
        <StatusIcons />
      </div>
      <header className="browse-header">
        <h2>Open work</h2>
        <p>A feed of problems, not posts.</p>
      </header>
      <h3 className="browse-section-title">Trending open calls</h3>
      <button className="browse-call-card browse-call-card--live" type="button" onClick={onOpenCall}>
        Replace the guitar riff
      </button>
    </section>
  );
}
```

- [ ] **Step 4: Run lint, typecheck, tests to verify green**

Run: `npm run lint && npx tsc --noEmit && npm test`
Expected: all pass (pins now match the stub's copy).

- [ ] **Step 5: Smoke the wiring**

Run: `npm run dev` in background; verify with agent-browser (viewport 390×844):
- Bare `http://localhost:3000/` renders "Open work" inside the phone.
- Clicking the stub card lands on the Open call scene.
- `http://localhost:3000/?scene=player` still lands on the player.
- Reset demo returns to browse.
Kill the dev server.

- [ ] **Step 6: Commit**

```bash
git add app/OpenSignalExperience.tsx tests/rendered-html.test.mjs
git commit -m "Wire browse as the demo's opening scene"
```

---

### Task 2: BrowseScene content + browse styling

**Files:**
- Modify: `app/OpenSignalExperience.tsx` (replace the Task 1 stub body)
- Modify: `app/globals.css` (append a Browse block inside the phone-frame dark layer region, before its `@media` block)

**Interfaces:**
- Consumes: `BrowseScene({ onOpenCall })` from Task 1; existing `contributions` map (use `contributions.circuitromance.acceptedCount` verbatim for Malik's chip); existing images.
- Produces: final browse markup and classes listed below; no API changes.

- [ ] **Step 0: Load design skills**

Invoke `ui-ux-pro-max:ui-ux-pro-max` and `frontend-design:frontend-design`; apply their guidance to spacing, hierarchy, and touch-target decisions in this task.

- [ ] **Step 1: Replace the stub body with the full scene**

```tsx
function BrowseScene({ onOpenCall }: { onOpenCall: () => void }) {
  const malik = contributions.circuitromance;

  return (
    <section className="browse-scene scene" aria-label="Browse open work">
      <div className="status-bar status-bar--light" aria-hidden="true">
        <strong>9:41</strong>
        <StatusIcons />
      </div>
      <header className="browse-header">
        <h2>Open work</h2>
        <p>A feed of problems, not posts.</p>
      </header>

      <h3 className="browse-section-title">Trending open calls</h3>
      <div className="browse-calls">
        <button className="browse-call-card browse-call-card--live" type="button" onClick={onOpenCall}>
          <img src="/open-signal-cover.png" alt="" />
          <span className="browse-call-card__body">
            <small>art-pop · E minor · 106 BPM</small>
            <strong>Replace the guitar riff</strong>
            <span>2 takes in review · Invite-only</span>
          </span>
          <span className="browse-call-card__by">Mara Venn</span>
          <Icon name="arrow" size={17} />
        </button>
        <div className="browse-call-card">
          <span className="browse-tile browse-tile--dusk" aria-hidden="true" />
          <span className="browse-call-card__body">
            <small>ambient · C♯ minor · 74 BPM</small>
            <strong>Granular pad under the bridge</strong>
            <span>4 takes in review · Open pool</span>
          </span>
          <span className="browse-call-card__by">@riverchapel</span>
        </div>
        <div className="browse-call-card">
          <span className="browse-tile browse-tile--ember" aria-hidden="true" />
          <span className="browse-call-card__body">
            <small>alt-R&B · F major · 92 BPM</small>
            <strong>Vocal texture for the outro</strong>
            <span>1 take in review · Invited</span>
          </span>
          <span className="browse-call-card__by">@juneaux</span>
        </div>
      </div>

      <h3 className="browse-section-title">Reusable components</h3>
      <div className="browse-components">
        <div className="browse-comp-tile">
          <span className="texture-art" aria-hidden="true" />
          <strong>Drum texture</strong>
          <small>@lowlight · Reused in 12 projects</small>
        </div>
        <div className="browse-comp-tile">
          <span className="browse-tile browse-tile--haze" aria-hidden="true" />
          <strong>Tape-warble keys</strong>
          <small>@circuitromance · Reused in 4 projects</small>
        </div>
        <div className="browse-comp-tile">
          <span className="browse-tile browse-tile--dusk" aria-hidden="true" />
          <strong>Granular bass one-shots</strong>
          <small>@riverchapel · Reused in 3 projects</small>
        </div>
      </div>

      <h3 className="browse-section-title">Top contributors</h3>
      <div className="browse-people">
        <div className="browse-person">
          <img src="/nia-okafor.png" alt="Nia Okafor" />
          <strong>@lowlight</strong>
          <small>18 accepted</small>
        </div>
        <div className="browse-person">
          <img src="/adopter-malik.jpg" alt="Malik Chen" />
          <strong>@circuitromance</strong>
          <small>{malik.acceptedCount} accepted</small>
        </div>
        <div className="browse-person">
          <img src="/adopter-ana.jpg" alt="" />
          <strong>@anaverse</strong>
        </div>
        <div className="browse-person">
          <img src="/adopter-jules.jpg" alt="" />
          <strong>@julesmakes</strong>
        </div>
      </div>

      <h3 className="browse-section-title">Active collaborations</h3>
      <div className="browse-activity">
        <div><strong>Open Signal</strong><span>New take submitted 2h ago</span></div>
        <div><strong>Hollow City</strong><span>Take accepted 1d ago</span></div>
      </div>
    </section>
  );
}
```

Note: if `contributions.circuitromance` lacks `acceptedCount`, read the map and use its actual field; if none exists, hardcode `9 accepted` and keep the map untouched.

- [ ] **Step 2: Append browse CSS to the phone-frame dark layer**

Append before the layer's `@media (max-width: 680px)` block in `app/globals.css`:

```css
/* Browse scene */

.phone-frame .browse-scene {
  padding: 58px 20px 24px;
  overflow-y: auto;
  background: var(--p-bg);
}

.phone-frame .browse-header h2 {
  margin: 0 0 3px;
  font-family: var(--font-display), Georgia, serif;
  font-size: 34px;
  font-weight: 460;
  letter-spacing: -0.03em;
}

.phone-frame .browse-header p {
  margin: 0 0 18px;
  color: var(--p-muted);
  font-size: 13px;
}

.phone-frame .browse-section-title {
  margin: 18px 0 9px;
  color: var(--p-muted);
  font-size: 11px;
  font-weight: 650;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.phone-frame .browse-calls {
  display: grid;
  gap: 8px;
}

.phone-frame .browse-call-card {
  display: flex;
  align-items: center;
  gap: 11px;
  min-height: 64px;
  padding: 9px 11px;
  border: 1px solid var(--p-line);
  border-radius: 16px;
  background: var(--p-card);
  color: var(--p-text);
  text-align: left;
}

.phone-frame .browse-call-card--live {
  border-color: rgba(255, 45, 146, 0.45);
  cursor: pointer;
}

.phone-frame .browse-call-card > img,
.phone-frame .browse-tile {
  flex: none;
  width: 44px;
  height: 44px;
  border-radius: 10px;
  object-fit: cover;
}

.phone-frame .browse-tile--dusk {
  background: linear-gradient(140deg, #2c1f4a, #713a8e 55%, #ff5ca8);
}

.phone-frame .browse-tile--ember {
  background: linear-gradient(140deg, #3a1208, #b1330f 55%, #ffb02e);
}

.phone-frame .browse-tile--haze {
  background: linear-gradient(140deg, #10303a, #1d6f6a 55%, #9be8c5);
}

.phone-frame .browse-call-card__body {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  flex: 1;
}

.phone-frame .browse-call-card__body small {
  color: var(--p-muted);
  font-size: 10.5px;
}

.phone-frame .browse-call-card__body strong {
  font-family: var(--font-display), Georgia, serif;
  font-size: 16.5px;
  font-weight: 500;
  letter-spacing: -0.01em;
}

.phone-frame .browse-call-card__body > span {
  color: var(--p-muted);
  font-size: 11px;
}

.phone-frame .browse-call-card__by {
  color: var(--p-muted);
  font-size: 10.5px;
  white-space: nowrap;
}

.phone-frame .browse-call-card--live .browse-call-card__by {
  color: var(--p-accent);
}

.phone-frame .browse-components {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  scrollbar-width: none;
  padding-bottom: 2px;
}

.phone-frame .browse-components::-webkit-scrollbar {
  display: none;
}

.phone-frame .browse-comp-tile {
  flex: none;
  width: 128px;
  padding: 10px;
  border: 1px solid var(--p-line);
  border-radius: 14px;
  background: var(--p-card);
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.phone-frame .browse-comp-tile .texture-art,
.phone-frame .browse-comp-tile .browse-tile {
  width: 100%;
  height: 44px;
  border-radius: 9px;
  margin-bottom: 4px;
}

.phone-frame .browse-comp-tile strong {
  font-size: 12.5px;
  font-weight: 640;
}

.phone-frame .browse-comp-tile small {
  color: var(--p-muted);
  font-size: 10px;
  line-height: 1.35;
}

.phone-frame .browse-people {
  display: flex;
  gap: 14px;
  overflow-x: auto;
  scrollbar-width: none;
}

.phone-frame .browse-people::-webkit-scrollbar {
  display: none;
}

.phone-frame .browse-person {
  flex: none;
  width: 64px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  text-align: center;
}

.phone-frame .browse-person img {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
}

.phone-frame .browse-person strong {
  font-size: 10px;
  font-weight: 640;
  white-space: nowrap;
}

.phone-frame .browse-person small {
  color: var(--p-muted);
  font-size: 9.5px;
}

.phone-frame .browse-activity {
  display: grid;
  gap: 7px;
  margin-bottom: 6px;
}

.phone-frame .browse-activity > div {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
  padding: 9px 11px;
  border: 1px solid var(--p-line);
  border-radius: 12px;
  background: var(--p-card);
}

.phone-frame .browse-activity strong {
  font-size: 12.5px;
  font-weight: 640;
}

.phone-frame .browse-activity span {
  color: var(--p-muted);
  font-size: 11px;
  white-space: nowrap;
}
```

- [ ] **Step 3: Run lint, typecheck, tests**

Run: `npm run lint && npx tsc --noEmit && npm test`
Expected: all pass.

- [ ] **Step 4: Visual verification at 390×844**

Dev server + agent-browser screenshots: full browse scene renders dark, all four modules visible by scrolling inside the phone, live card shows the magenta ring, no horizontal overflow (`document.documentElement.scrollWidth <= clientWidth`, same check inside `.phone-frame` and `.browse-scene`).

- [ ] **Step 5: Commit**

```bash
git add app/OpenSignalExperience.tsx app/globals.css
git commit -m "Fill the browse scene: calls, components, people, activity"
```

---

### Task 3: Page narrative + docs

**Files:**
- Modify: `app/OpenSignalExperience.tsx` (right-rail paragraph)
- Modify: `SUBMISSION-PRIMER.md` (discovery-bridge answer)
- Modify: `APPLICATION-LINK-COPY.md` (60-second path)

**Interfaces:**
- Consumes: nothing new. Produces: copy only.

- [ ] **Step 1: Right-rail sentence**

In the `proof-column__copy` paragraph, replace:

```
A precise request becomes a contribution, a review, a decision, and durable credit—all in Suno's musical language.
```

with:

```
Producers find open work in the feed; a precise request becomes a contribution, a review, a decision, and durable credit—all in Suno's musical language.
```

- [ ] **Step 2: Primer discovery-bridge clause**

In `SUBMISSION-PRIMER.md`, in the invite-only hard-question answer, after "before any public feed exists." append:

```
The demo's Browse surface sketches that bridge: open calls, reusable
components, and contributor activity, ranked by work rather than plays.
```

- [ ] **Step 3: Link-copy path**

In `APPLICATION-LINK-COPY.md`, replace:

```
Try the 60-second path: **Open call → Add your take → Compare → Accept → Profile**.
```

with:

```
Try the 60-second path: **Browse → Open call → Add your take → Compare → Accept → Profile**.
```

- [ ] **Step 4: Run lint, typecheck, tests**

Run: `npm run lint && npx tsc --noEmit && npm test`
Expected: all pass (SSR pin `Open Signal adds the human layer` and source pins unaffected).

- [ ] **Step 5: Commit**

```bash
git add app/OpenSignalExperience.tsx SUBMISSION-PRIMER.md APPLICATION-LINK-COPY.md
git commit -m "Thread the discovery funnel through page copy and docs"
```

---

### Task 4: End-to-end experience QA (mobile + web)

**Files:**
- Possibly modify: `app/globals.css` / `app/OpenSignalExperience.tsx` (fixes found by QA)

**Interfaces:** none new.

- [ ] **Step 1: Full interactive walk at 390×844**

Dev server + browser: browse → tap live call → call sheet (both CTAs visible) → Add your take → rights gate (disabled until checked) → Send → Review the decision flow → switch takes → Pass on this take → accept @lowlight → receipt (Escape closes) → profile → follow → Reset returns to browse with passes cleared. Screenshot browse, call, compare states.

- [ ] **Step 2: Seven-tab row measurement at 390**

Measure `.scene-tabs` for overflow/clipping; confirm Browse and Profile tabs are both reachable (scroll the row if scrollable). If clipped without scroll, add `overflow-x: auto;` to `.scene-tabs` and re-verify.

- [ ] **Step 3: Desktop 1440×900 and 1024×768 passes**

Bare URL shows browse in the phone with the editorial page intact; right-rail sentence reads correctly; no body overflow at either width; hero step 1 lights only from the call scene onward; screenshot desktop hero.

- [ ] **Step 4: Friendliness pass (ui-ux-pro-max lens)**

Judge the browse scene as a first-time visitor: is the tappable card obvious (live ring + arrow), does dressing content invite dead taps, is text legible at arm's length (≥10px effective), do section titles scan? Fix anything failing; re-screenshot.

- [ ] **Step 5: Commit QA fixes (if any)**

```bash
git add -A
git commit -m "QA fixes from end-to-end browse walk"
```

---

### Task 5: Ship + live verification + records

**Files:**
- Modify: `HANDOFF.md` (append shipped note)
- Modify: `~/.claude/projects/-Users-boabrams-personal-jobs-suno-application/memory/project-complete-filed.md` (reopened-and-shipped note)

- [ ] **Step 1: Final battery**

Run: `npm run lint && npx tsc --noEmit && npm test && git diff --check`
Expected: all pass, no whitespace errors.

- [ ] **Step 2: Deploy**

Run: `npm run deploy`
Expected: new Worker version ID printed; note it.

- [ ] **Step 3: Live verification**

- `curl -s -o /dev/null -w "%{http_code}" https://open-signal-concept.boabrams.workers.dev/` → 200.
- Served HTML contains `Open work`, `A feed of problems, not posts`, and `Producers find open work` (browse is the SSR default scene).
- Browser tap-through on the live URL at 390: browse → call → submit gate works.

- [ ] **Step 4: Update records**

Append to `HANDOFF.md`: browse surface shipped per spec + plan paths, new Worker version, date. Update the project memory note: project reopened 2026-08-02 by Bo for the browse discovery surface; shipped; live link unchanged.

- [ ] **Step 5: Commit**

```bash
git add HANDOFF.md
git commit -m "Ship browse discovery surface and record deployment"
```
