# Fork, Social Graph, and Studio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Packs carry stars/forks/comments; forking opens a Suno-create-idiom Studio scene with a cloud-draft loop and visible credit; a comment thread with an embedded forked-sound reply demonstrates async collaboration; one motion token set; then judge panel and Bo's gate before GitHub publish.

**Architecture:** All UI in the existing single-file experience component + the phone-frame dark CSS layer. Three new state atoms (`starred`, `forkedDraft`, `comments`) in the root component, session-ephemeral, cleared by Reset. One new scene (`studio`, appended LAST in SCENES, filtered out of the tab row), one new overlay (CommentsSheet, mirroring AcceptanceReceipt's dialog pattern), pack-tile upgrades on browse, four-cell profile stats, CSS-only motion tokens.

**Tech Stack:** React (vinext SSR), plain CSS, node:test pins, Cloudflare Worker deploy, gh CLI (publish step, gated).

## Global Constraints

- Spec: `docs/superpowers/specs/2026-08-05-fork-social-studio-design.md` — copy verbatim from it.
- Voice rule: inside the phone, product-voice or essential disclosure only.
- No new dependencies, no new images, no new AI faces, no audible layer mixing.
- Featured-pack derived counts: forks `41 + (forkedDraft ? 1 : 0)`, stars `214 + (starred ? 1 : 0)` — same derivation in tile, sheet header, and profile ★ cell.
- All motion transform/opacity only; the existing `prefers-reduced-motion` block collapses it.
- ui-ux-pro-max + frontend-design guidance already loaded this session — apply (44pt targets, pressed feedback, one primary path per surface, 150–300ms micro-interactions, spring-feel sheet easing).
- Every task ends green: `npm run lint && npx tsc --noEmit && npm test`.
- GitHub publish happens ONLY after the judge panel and Bo's explicit test approval, and ONLY if `gh auth status` shows boharrisonabrams.

---

### Task 1: State atoms, star icon, pack-tile social graph + failing pins

**Files:**
- Modify: `app/OpenSignalExperience.tsx`
- Test: `tests/rendered-html.test.mjs`

**Interfaces:**
- Produces: `Icon` supports `name="star"`; root state `starred/forkedDraft/comments` with setters; `BrowseScene` props gain `{ starred, onToggleStar, forkedDraft, onFork, onOpenComments }`; browse section renamed "Trending packs"; featured tile shows derived counts + comment chip + Fork button.

- [ ] **Step 1: Add failing pins** — in the source test after the `Trending open calls` pin:

```js
  assert.match(source, /Trending packs/);
  assert.match(source, /Save draft/);
  assert.match(source, /Saved to your studio/);
  assert.match(source, /Forked from @lowlight/);
  assert.match(source, /That's genius\./);
```

- [ ] **Step 2: Run `npm test` — expect FAIL on `/Trending packs/`.**

- [ ] **Step 3: Add the star icon.** Read the `Icon` component; add `"star"` to the `IconName` union and a case following the existing pattern:

```tsx
star: <path d="M12 2.6l2.7 5.8 6.3.8-4.6 4.4 1.2 6.2-5.6-3.1-5.6 3.1 1.2-6.2L3 9.2l6.3-.8L12 2.6z" />
```

(Match the component's actual fill/stroke conventions when adding.)

- [ ] **Step 4: Root state + handlers** in `OpenSignalExperience`:

```tsx
const [starred, setStarred] = useState(false);
const [forkedDraft, setForkedDraft] = useState(false);
const [comments, setComments] = useState<string[]>([]);
```

Reset (`resetDemo`) additionally: `setStarred(false); setForkedDraft(false); setComments([]);`

- [ ] **Step 5: Rename + upgrade the packs row in `BrowseScene`.** New signature:

```tsx
function BrowseScene({
  onOpenCall,
  acceptedId,
  starred,
  onToggleStar,
  forkedDraft,
  onFork,
  onOpenComments,
}: {
  onOpenCall: () => void;
  acceptedId: CreatorContributionId | null;
  starred: boolean;
  onToggleStar: () => void;
  forkedDraft: boolean;
  onFork: () => void;
  onOpenComments: () => void;
}) {
```

Section title "Reusable components" → "Trending packs". Featured tile becomes:

```tsx
<div className="browse-comp-tile browse-comp-tile--live">
  <button className="browse-pack-open" type="button" onClick={onOpenComments} aria-label="Open Drum texture pack comments">
    <span className="texture-art" aria-hidden="true" />
    <strong>Drum texture</strong>
    <small>@lowlight</small>
  </button>
  <span className="browse-pack-stats">
    <button className={`browse-star${starred ? " is-starred" : ""}`} type="button" onClick={onToggleStar} aria-pressed={starred} aria-label="Star this pack">
      <Icon name="star" size={13} />
      <span key={`s${starred ? 1 : 0}`} className="count-pop">{214 + (starred ? 1 : 0)}</span>
    </button>
    <span className="browse-forks"><Icon name="remix" size={13} /><span key={`f${forkedDraft ? 1 : 0}`} className="count-pop">{41 + (forkedDraft ? 1 : 0)}</span></span>
    <button className="browse-pack-comments" type="button" onClick={onOpenComments} aria-label="3 comments"><Icon name="comment" size={13} />3</button>
  </span>
  <button className="browse-fork-btn" type="button" onClick={onFork}><Icon name="remix" size={14} />Fork</button>
</div>
```

Other two tiles keep their layout, adding a quiet stats line (plain spans, not buttons): Tape-warble keys `★ 58 · 9 forks`; Dusted bass one-shots `★ 31 · 6 forks` (render star glyph + number, dot, fork count as text; keep "Reused in N projects" line dropped in favor of the stats line — the reuse fact lives on in the sheet/profile).

Note: spec keeps "reused in 14 projects" ON THE PROFILE only; the featured tile's stats replace its reuse line.

- [ ] **Step 6: Your-drafts strip** (renders only after a fork):

```tsx
{forkedDraft ? (
  <>
    <h3 className="browse-section-title">Your drafts</h3>
    <div className="browse-draft">
      <span className="texture-art" aria-hidden="true" />
      <span className="browse-draft__body">
        <strong>Fork of Drum texture</strong>
        <small>Draft · Synced just now</small>
      </span>
      <Icon name="check" size={15} />
    </div>
  </>
) : null}
```

Place after the Trending packs row, before Top contributors.

- [ ] **Step 7: Wire PhoneDemo.** Pass through new props from root: `starred={starred} onToggleStar={() => setStarred(s => !s)} forkedDraft={forkedDraft} onFork={() => navigate("studio")} onOpenComments={() => setCommentsOpen(true)}` — `commentsOpen` state and the sheet arrive in Task 2; for THIS task stub `onOpenComments={() => {}}` and add `commentsOpen` in Task 2. `navigate("studio")` compiles after Task 3 adds the scene value — for THIS task, point `onFork` at a no-op and switch it in Task 3. (Keep each task green.)

- [ ] **Step 8: CSS** — append to the dark layer (before its media block):

```css
.phone-frame .browse-comp-tile--live {
  position: relative;
  border-color: rgba(255, 45, 146, 0.35);
}

.phone-frame .browse-pack-open {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--p-text);
  text-align: left;
  cursor: pointer;
}

.phone-frame .browse-pack-stats {
  display: flex;
  align-items: center;
  gap: 9px;
  margin-top: 5px;
  color: var(--p-muted);
  font-size: 10.5px;
}

.phone-frame .browse-pack-stats > * {
  display: inline-flex;
  align-items: center;
  gap: 3px;
}

.phone-frame .browse-star,
.phone-frame .browse-pack-comments {
  padding: 2px 4px;
  border: 0;
  border-radius: 7px;
  background: transparent;
  color: var(--p-muted);
  cursor: pointer;
}

.phone-frame .browse-star.is-starred {
  color: var(--p-amber);
}

.phone-frame .browse-star.is-starred svg {
  animation: star-pop 180ms ease-out;
}

.phone-frame .browse-fork-btn {
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  min-height: 30px;
  margin-top: 7px;
  padding: 0 11px;
  border: 1px solid rgba(255, 45, 146, 0.45);
  border-radius: 999px;
  background: rgba(255, 45, 146, 0.1);
  color: var(--p-text);
  font-size: 11.5px;
  font-weight: 640;
  cursor: pointer;
}

.phone-frame .browse-draft {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 9px 11px;
  border: 1px solid var(--p-line);
  border-radius: 14px;
  background: var(--p-card);
}

.phone-frame .browse-draft .texture-art {
  width: 38px;
  height: 38px;
  border-radius: 9px;
}

.phone-frame .browse-draft__body {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}

.phone-frame .browse-draft__body strong { font-size: 12.5px; font-weight: 640; }
.phone-frame .browse-draft__body small { color: var(--p-muted); font-size: 10.5px; }
.phone-frame .browse-draft > svg { color: #8ce39a; }

.count-pop { animation: count-pop 200ms ease-out; }

@keyframes count-pop {
  0% { transform: scale(1.35); }
  100% { transform: scale(1); }
}

@keyframes star-pop {
  0% { transform: scale(1.4); }
  100% { transform: scale(1); }
}
```

Featured tile width: widen `.browse-comp-tile--live` if the Fork button crowds (e.g. `width: 148px`); measure at 390.

- [ ] **Step 9: Battery green; commit** `Give packs the social graph: stars, forks, comments, drafts`.

---

### Task 2: Comments sheet

**Files:** Modify `app/OpenSignalExperience.tsx`, `app/globals.css`.

**Interfaces:**
- Consumes: `togglePreview` (existing), `comments` state.
- Produces: `CommentsSheet({ open, comments, onAddComment, onFork, onPlaySnippet, snippetPlaying, onClose })` rendered from `PhoneDemo` like the receipt; `commentsOpen` root state.

- [ ] **Step 1: Root state** `const [commentsOpen, setCommentsOpen] = useState(false);` — closed by `navigate()` (add `setCommentsOpen(false)` beside `setReceiptOpen(false)`) and by Reset.

- [ ] **Step 2: Component** (sibling of AcceptanceReceipt, same dialog conventions — focus close button on mount, Escape closes, focus restore, backdrop button):

```tsx
function CommentsSheet({
  comments,
  onAddComment,
  onFork,
  onPlaySnippet,
  snippetPlaying,
  onClose,
}: {
  comments: string[];
  onAddComment: (text: string) => void;
  onFork: () => void;
  onPlaySnippet: () => void;
  snippetPlaying: boolean;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState("");
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    closeButtonRef.current?.focus();
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      previouslyFocused?.focus();
    };
  }, [onClose]);

  return (
    <div className="receipt-overlay" role="dialog" aria-modal="true" aria-labelledby="comments-title">
      <button className="receipt-overlay__backdrop" type="button" onClick={onClose} aria-label="Close comments" tabIndex={-1} />
      <section className="receipt-sheet comments-sheet">
        <span className="sheet-handle" aria-hidden="true" />
        <header>
          <div>
            <span>Pack by @lowlight</span>
            <h2 id="comments-title">Drum texture</h2>
          </div>
          <button ref={closeButtonRef} className="round-control" type="button" onClick={onClose} aria-label="Close comments"><Icon name="close" /></button>
        </header>
        <p className="comments-stats"><Icon name="star" size={14} /> 214 · 41 forks · 14 shipped</p>
        <div className="comments-thread">
          <div className="comment">
            <img src="/adopter-jules.jpg" alt="" />
            <div className="comment__body">
              <strong>@julesmakes</strong>
              <p>I added more snare to this to really bring out the offbeat</p>
              <div className="comment__snippet">
                <button type="button" onClick={onPlaySnippet} aria-label={`${snippetPlaying ? "Pause" : "Play"} Offbeat snare flip`}>
                  <Icon name={snippetPlaying ? "pause" : "play"} size={14} />
                </button>
                <span><strong>Offbeat snare flip</strong><small>Fork of Drum texture</small></span>
                <button className="comment__snippet-fork" type="button" onClick={onFork}><Icon name="remix" size={13} />Fork</button>
              </div>
            </div>
          </div>
          <div className="comment">
            <img src="/nia-okafor.png" alt="" />
            <div className="comment__body">
              <strong>@lowlight <em className="comment__creator">Creator</em></strong>
              <p>That's genius.</p>
            </div>
          </div>
          {comments.map((text, index) => (
            <div className="comment" key={index}>
              <span className="comment__you" aria-hidden="true">You</span>
              <div className="comment__body">
                <strong>You</strong>
                <p>{text}</p>
              </div>
            </div>
          ))}
        </div>
        <form
          className="comments-composer"
          onSubmit={(event) => {
            event.preventDefault();
            if (!draft.trim()) return;
            onAddComment(draft.trim());
            setDraft("");
          }}
        >
          <label htmlFor="pack-comment" className="visually-hidden-label">Add a comment</label>
          <input id="pack-comment" value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Add a comment…" />
          <button type="submit">Post</button>
        </form>
      </section>
    </div>
  );
}
```

- [ ] **Step 3: Render from PhoneDemo** after the receipt line:

```tsx
{commentsOpen ? (
  <CommentsSheet
    comments={comments}
    onAddComment={onAddComment}
    onFork={onFork}
    onPlaySnippet={onPlaySnippet}
    snippetPlaying={snippetPlaying}
    onClose={onCloseComments}
  />
) : null}
```

Thread the props root→PhoneDemo: `commentsOpen`, `onAddComment={(t) => setComments(c => [...c, t])}`, `onCloseComments={() => setCommentsOpen(false)}`, `onPlaySnippet={() => void togglePreview("lowlight")}`, `snippetPlaying={playingId === "lowlight"}`, and Task 1's `onOpenComments` stub becomes `() => setCommentsOpen(true)`.

- [ ] **Step 4: CSS** (dark layer; the sheet inherits receipt-sheet styling):

```css
.phone-frame .comments-sheet .comments-stats {
  display: flex;
  align-items: center;
  gap: 5px;
  margin: 0 0 13px;
  color: var(--p-muted);
  font-size: 12px;
}

.phone-frame .comments-thread {
  display: grid;
  gap: 13px;
  max-height: 46%;
  overflow-y: auto;
}

.phone-frame .comment {
  display: flex;
  gap: 10px;
}

.phone-frame .comment > img,
.phone-frame .comment__you {
  flex: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}

.phone-frame .comment__you {
  display: grid;
  place-items: center;
  background: var(--p-chip);
  color: var(--p-muted);
  font-size: 9px;
  font-weight: 650;
}

.phone-frame .comment__body { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
.phone-frame .comment__body strong { font-size: 12px; font-weight: 650; }
.phone-frame .comment__body p { margin: 0; font-size: 12.5px; line-height: 1.4; }

.phone-frame .comment__creator {
  margin-left: 5px;
  padding: 1px 6px;
  border: 1px solid rgba(255, 45, 146, 0.4);
  border-radius: 999px;
  color: var(--p-accent);
  font-size: 8.5px;
  font-style: normal;
  font-weight: 650;
  text-transform: uppercase;
}

.phone-frame .comment__snippet {
  display: flex;
  align-items: center;
  gap: 9px;
  margin-top: 4px;
  padding: 8px 10px;
  border: 1px solid var(--p-line);
  border-radius: 12px;
  background: var(--p-card);
}

.phone-frame .comment__snippet > button:first-child {
  width: 30px;
  height: 30px;
  padding: 0;
  display: grid;
  place-items: center;
  border: 0;
  border-radius: 50%;
  background: var(--p-chip);
  color: var(--p-text);
  cursor: pointer;
}

.phone-frame .comment__snippet > span { display: flex; flex-direction: column; flex: 1; min-width: 0; }
.phone-frame .comment__snippet strong { font-size: 11.5px; font-weight: 640; }
.phone-frame .comment__snippet small { color: var(--p-muted); font-size: 10px; }

.phone-frame .comment__snippet-fork {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 9px;
  border: 1px solid var(--p-line);
  border-radius: 999px;
  background: transparent;
  color: var(--p-text);
  font-size: 10.5px;
  cursor: pointer;
}

.phone-frame .comments-composer {
  display: flex;
  gap: 8px;
  margin-top: 13px;
}

.phone-frame .comments-composer input {
  flex: 1;
  min-height: 38px;
  padding: 0 12px;
  border: 1px solid var(--p-line);
  border-radius: 999px;
  background: #141110;
  color: var(--p-text);
  font-size: 12.5px;
}

.phone-frame .comments-composer button {
  min-height: 38px;
  padding: 0 15px;
  border: 0;
  border-radius: 999px;
  background: var(--p-lava);
  color: white;
  font-size: 12px;
  font-weight: 650;
  cursor: pointer;
}

.visually-hidden-label {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
}
```

- [ ] **Step 5: Battery; verify sheet opens/closes/Escape/post; commit** `Add pack comments with an embedded forked-sound reply`.

---

### Task 3: Studio scene

**Files:** Modify `app/OpenSignalExperience.tsx`, `app/globals.css`.

- [ ] **Step 1: Scene value.** `type Scene` gains `"studio"`; append `"studio"` LAST in `SCENES`; `SCENE_LABELS.studio = "Studio"`; tab row: `{SCENES.filter((item) => item !== "studio").map(...)}`. Deep link works automatically via syncFromLocation.

- [ ] **Step 2: Component:**

```tsx
function StudioScene({
  saved,
  onSave,
  onClose,
}: {
  saved: boolean;
  onSave: () => void;
  onClose: () => void;
}) {
  return (
    <section className="studio-scene scene" aria-label="Your studio draft">
      <div className="status-bar status-bar--light" aria-hidden="true">
        <strong>9:41</strong>
        <StatusIcons />
      </div>
      <button className="round-control studio-scene__close" type="button" onClick={onClose} aria-label="Back to browse">
        <Icon name="close" />
      </button>
      <header className="studio-header">
        <span><Icon name="studio" size={14} /> Your studio · Draft</span>
        <h2>Fork of Drum texture</h2>
        <p className="studio-provenance"><Icon name="verified" size={14} /> Forked from @lowlight · credit attached</p>
      </header>
      <div className="studio-layers">
        <div className="studio-layer">
          <span className="texture-art" aria-hidden="true" />
          <span className="studio-layer__body">
            <strong>Drum texture</strong>
            <small>@lowlight · Credit locked</small>
          </span>
          <Icon name="check" size={15} />
        </div>
        <div className="studio-layer studio-layer--empty">
          <span className="studio-layer__add" aria-hidden="true">+</span>
          <span className="studio-layer__body">
            <strong>Add your sound</strong>
            <small>Layer it over the fork</small>
          </span>
        </div>
      </div>
      <div className="studio-prompt">
        <label htmlFor="studio-prompt-input">What should change?</label>
        <textarea id="studio-prompt-input" placeholder="Describe what to change… e.g. more snare on the offbeat" />
        <div className="studio-methods">
          <span><Icon name="record" size={13} /> Record</span>
          <span><Icon name="remix" size={13} /> Remix with Suno</span>
          <span><Icon name="upload" size={13} /> Upload</span>
        </div>
      </div>
      {saved ? (
        <div className="studio-saved" role="status">
          <Icon name="check" size={16} />
          <span><strong>Saved to your studio</strong><small>Synced · in your drafts on Browse</small></span>
        </div>
      ) : (
        <button className="gradient-button studio-save" type="button" onClick={onSave}>
          <Icon name="spark" />
          Save draft
        </button>
      )}
    </section>
  );
}
```

- [ ] **Step 3: Wire.** PhoneDemo branch before the receipt:

```tsx
{scene === "studio" ? (
  <StudioScene saved={forkedDraft} onSave={onSaveDraft} onClose={() => onScene("browse")} />
) : null}
```

Root: `onFork` (Task 1 stub) becomes `() => { setCommentsOpen(false); navigate("studio"); }`; `onSaveDraft={() => setForkedDraft(true)}`. Reset already clears `forkedDraft`.

- [ ] **Step 4: CSS:**

```css
.phone-frame .studio-scene {
  padding: 58px 20px 24px;
  overflow-y: auto;
  background: var(--p-bg);
}

.phone-frame .studio-scene__close {
  position: absolute;
  top: 56px;
  right: 18px;
  z-index: 4;
}

.phone-frame .studio-header span {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--p-accent);
  font-size: 10.5px;
  font-weight: 650;
  letter-spacing: 0.09em;
  text-transform: uppercase;
}

.phone-frame .studio-header h2 {
  margin: 7px 0 4px;
  font-family: var(--font-display), Georgia, serif;
  font-size: 28px;
  font-weight: 470;
  letter-spacing: -0.02em;
}

.phone-frame .studio-provenance {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0 0 16px;
  color: var(--p-muted);
  font-size: 11.5px;
}

.phone-frame .studio-provenance svg { color: var(--p-accent); }

.phone-frame .studio-layers { display: grid; gap: 8px; margin-bottom: 14px; }

.phone-frame .studio-layer {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 10px 12px;
  border: 1px solid var(--p-line);
  border-radius: 14px;
  background: var(--p-card);
}

.phone-frame .studio-layer .texture-art { width: 40px; height: 40px; border-radius: 9px; }
.phone-frame .studio-layer > svg { color: #8ce39a; }
.phone-frame .studio-layer__body { display: flex; flex-direction: column; gap: 2px; flex: 1; }
.phone-frame .studio-layer__body strong { font-size: 13px; font-weight: 640; }
.phone-frame .studio-layer__body small { color: var(--p-muted); font-size: 10.5px; }

.phone-frame .studio-layer--empty { border-style: dashed; background: transparent; }

.phone-frame .studio-layer__add {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border-radius: 9px;
  background: var(--p-chip);
  color: var(--p-muted);
  font-size: 20px;
}

.phone-frame .studio-prompt label {
  display: block;
  margin-bottom: 7px;
  color: var(--p-muted);
  font-size: 11px;
  font-weight: 650;
  letter-spacing: 0.09em;
  text-transform: uppercase;
}

.phone-frame .studio-prompt textarea {
  width: 100%;
  min-height: 74px;
  padding: 11px 13px;
  border: 1px solid var(--p-line);
  border-radius: 14px;
  background: #141110;
  color: var(--p-text);
  font: inherit;
  font-size: 13px;
  resize: none;
}

.phone-frame .studio-methods {
  display: flex;
  gap: 7px;
  margin: 9px 0 16px;
}

.phone-frame .studio-methods span {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 11px;
  border: 1px solid var(--p-line);
  border-radius: 999px;
  color: var(--p-muted);
  font-size: 10.5px;
}

.phone-frame .studio-save { width: 100%; }

.phone-frame .studio-saved {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  border-radius: 14px;
  background: rgba(96, 214, 121, 0.14);
  color: #8ce39a;
}

.phone-frame .studio-saved span { display: flex; flex-direction: column; gap: 1px; }
.phone-frame .studio-saved strong { font-size: 13px; }
.phone-frame .studio-saved small { color: rgba(140, 227, 154, 0.75); font-size: 10.5px; }
```

- [ ] **Step 5: Battery; verify fork→studio→save→drafts strip→reset; commit** `Add the studio scene: fork lands in Suno's create idiom`.

---

### Task 4: Profile stars + motion tokens

**Files:** Modify `app/OpenSignalExperience.tsx`, `app/globals.css`.

- [ ] **Step 1: Four-cell stats.** `ProfileScene` gains `starred: boolean` prop (thread from root). Stats row becomes:

```tsx
<div className="reputation-stats" aria-label="Suno reputation">
  <div><strong>{creator.acceptedCount + (accepted ? 1 : 0)}</strong><span>Accepted</span></div>
  <div><strong>{214 + (starred ? 1 : 0)}</strong><span>Stars</span></div>
  <div><strong>{creator.reuses}</strong><span>Reuses</span></div>
  <div><strong>{creator.openCalls}</strong><span>Open calls</span></div>
</div>
```

(Stars cell renders for the lowlight profile; for circuitromance use a static plausible 76.) Implement as `{contributionId === "lowlight" ? 214 + (starred ? 1 : 0) : 76}`. Measure the 4-cell row at 390; if tight, drop `.reputation-stats strong` font-size a step in a scoped rule.

- [ ] **Step 2: Motion tokens** (dark layer additions):

```css
.phone-frame .call-sheet,
.phone-frame .receipt-sheet {
  animation: sheet-rise 340ms cubic-bezier(0.32, 0.72, 0, 1);
}

@keyframes sheet-rise {
  from { transform: translateY(26px); opacity: 0.4; }
  to { transform: translateY(0); opacity: 1; }
}

.phone-frame .browse-scene > * {
  animation: browse-in 300ms ease-out backwards;
}

.phone-frame .browse-scene > *:nth-child(3) { animation-delay: 30ms; }
.phone-frame .browse-scene > *:nth-child(4) { animation-delay: 60ms; }
.phone-frame .browse-scene > *:nth-child(5) { animation-delay: 90ms; }
.phone-frame .browse-scene > *:nth-child(6) { animation-delay: 120ms; }
.phone-frame .browse-scene > *:nth-child(7) { animation-delay: 150ms; }
.phone-frame .browse-scene > *:nth-child(8) { animation-delay: 180ms; }
.phone-frame .browse-scene > *:nth-child(9) { animation-delay: 210ms; }

@keyframes browse-in {
  from { transform: translateY(9px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.phone-frame .browse-call-card--live:active,
.phone-frame .browse-fork-btn:active,
.phone-frame .browse-pack-open:active,
.phone-frame .gradient-button:active,
.phone-frame .comment__snippet-fork:active {
  transform: scale(0.985);
}
```

(The comments sheet already reuses `.receipt-sheet`, so it inherits sheet-rise.)

- [ ] **Step 3: Battery; visual check stagger + sheet rise + pressed states; commit** `Add profile stars and the motion token set`.

---

### Task 5: Docs, QA, deploy

**Files:** `SUBMISSION-PRIMER.md`, `HANDOFF.md`, judge-evidence transcript; QA fixes if found.

- [ ] **Step 1: Primer hard question** (append in Hard questions):

```markdown
**"Stars are the popularity contest you said you rejected. Why add them?"**
Stars rank packs for discovery; they never touch reputation or acceptance.
The profile leads with accepted work, acceptance stays owner-controlled,
and a thousand stars will not merge a take. Attention finds the work;
craft still decides what ships.
```

- [ ] **Step 2: Full e2e walk** (discrete steps, 390): browse → star pack (215, pop) → open comments → play snippet → post a comment ("You" appears) → Fork from snippet → studio → Save draft → saved state → close → drafts strip + fork count 42 → call → submit gate → compare → accept → receipt → profile (Stars cell, 19 accepted) → Reset (18/214/41, drafts gone, comments cleared). Screenshots: browse, comments sheet, studio, studio-saved.

- [ ] **Step 3: Viewports** 390/1024/1440 overflow + 4-cell stats fit + comments sheet fit.

- [ ] **Step 4: HANDOFF + evidence transcript** updated for all new surfaces.

- [ ] **Step 5: Final battery + `git diff --check`; commit** `Document the social loop and record QA`; **deploy**; live-verify SSR pins ("Trending packs", "Save draft" NOT in SSR — studio/sheet are client-rendered; verify browse SSR strings + client walk on production).

---

### Task 6: Judge panel, Bo gate, publish

- [ ] **Step 1: Evidence pack v4** — discrete state-verified captures (browse with stats, comments sheet, studio, studio-saved, drafts strip + all prior scenes), md5-unique check, updated transcript.

- [ ] **Step 2: Launch the three blind judges** (recruiter/CPO/skeptic), prompts extended with the social loop; skeptic explicitly probes: stars-vs-anti-popularity tension, fork-count math (41/14/42), comment thread authenticity, studio overclaim risk ("cloud sync" fiction).

- [ ] **Step 3: Synthesize; present to Bo; STOP.** Bo tests the demo for "intended energy" and approves.

- [ ] **Step 4 (only after Bo's approval): Publish.**

```bash
gh auth status   # REQUIRE login: boharrisonabrams — stop and report otherwise
gh repo create boharrisonabrams/open-signal-concept --public --source=. --remote=origin --push
```

Verify the repo URL renders; report it.
