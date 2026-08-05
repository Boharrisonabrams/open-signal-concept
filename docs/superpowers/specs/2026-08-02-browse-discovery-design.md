# Browse discovery surface — design

Date: 2026-08-02
Status: approved by Bo (brainstorm Q&A, both design sections)

## Goal

Add a mobile-first discovery surface to the Open Signal demo that shows the
GitHub-trending behavior for music: a producer on their phone browses open
work — calls, reusable components, active people — and gets pulled into
contributing. This answers the CPO judge's "no bridge to discovery" critique
and the role's mobile-first mandate inside the product itself.

## Decisions (from brainstorm)

1. **Browse-first entry.** `browse` is a new scene and the demo's default:
   the bare URL and Reset land on it. The reviewer arrives as the browsing
   producer, taps the Open Signal call, and the existing loop continues.
2. **Four modules, trending calls anchor.** Trending open calls, reusable
   components, top contributors, active collaborations — in that order.
3. **One live path.** Only the Open Signal call card is interactive; all
   other browse content is believable set dressing rendered as
   non-interactive elements (no dead buttons).

## Browse scene

Dark Suno-Explore idiom inside the existing phone frame; scrolls internally;
light status bar; uses the established `.phone-frame` token layer.

- **Header:** `Open work` (serif, white) with subline
  `A feed of problems, not posts.` — reconciles the surface with the page's
  "Less feed. More authorship." principle.
- **Module 1 — Trending open calls (anchor):** three cards. Card anatomy:
  cover tile, genre · key · BPM line, the ask in serif, activity line.
  - Live card: Open Signal — Mara Venn · art-pop · E minor · 106 BPM ·
    "Replace the guitar riff" · `2 takes in review · Invite-only` →
    `onClick` routes to the existing `call` scene.
  - Dressing cards (fictional, CSS gradient art tiles, no new portraits):
    an ambient call ("Granular pad under the bridge") and an alt-R&B call
    ("Vocal texture for the outro"), each with plausible key/BPM and
    activity lines.
- **Module 2 — Reusable components:** horizontal tile row anchored by
  existing fiction: "Drum texture · @lowlight · Reused in 12 projects"
  (number already exists in profile + lineage), plus 2–3 fictional tiles
  (e.g. tape-warble keys, granular bass one-shots) with reuse counts.
- **Module 3 — Top contributors:** avatar strip reusing existing images
  only (Nia leading with `18 accepted`, adopter portraits following).
- **Module 4 — Active collaborations:** two slim activity rows
  ("Open Signal · take accepted 2h ago", one fictional).

## Integration

- **State:** add `"browse"` first in `SCENES`; label `Browse`; default
  `useState<Scene>("browse")`; Reset navigates to browse; bare URL = browse;
  `?scene=…` deep links unchanged; Accepted-tab gating unchanged.
- **Tabs:** seven tabs at 390px — row already hides scrollbars; verify
  scroll/fit by measurement.
- **Page copy (single sentence):** right-rail body becomes "Producers find
  open work in the feed; a precise request becomes a contribution, a review,
  a decision, and durable credit — all in Suno's musical language." Hero
  lede, steps, principles, and measurement stay as panel-validated.
- **Primer:** discovery-bridge hard-question answer gains a clause pointing
  at the Browse surface as the sketched invite-only → discovery bridge.
- **Application link copy:** 60-second path becomes
  `Browse → Open call → Add your take → Compare → Accept → Profile`.
  The already-filed Ashby text keeps the old path; it still works (browse
  precedes it). Updated file serves interviews and future sends.

## Verification

- Source-test pins: `Open work`, `A feed of problems, not posts`,
  `Trending open calls`.
- Confirm SSR assertions still hold with browse as the default scene.
- Full battery: lint, `tsc --noEmit`, `npm test`, `git diff --check`.
- Functional walk: browse → call → submit (rights gate) → compare →
  pass → accept → receipt → profile → reset-to-browse.
- Overflow measurements at 390×844, 1024×768, 1440×900, including the
  seven-tab row and browse-card widths.
- Deploy to the existing Worker; verify live URL serves browse-first with
  the new copy.

## Out of scope (YAGNI)

No new portraits. No second live path (components/profiles from browse).
No filters, search, or genre tabs. No changes to the accept/rights flow.
No og.png regeneration. No new dependencies.

## Risks

- Bare-URL behavior changes post-filing: intended — reviewers land on the
  producer's-eye view. Every previously shared deep link still resolves.
- Seven tabs on narrow phones: mitigated by existing scrollable tab row;
  measured before ship.
- Fiction sprawl: new dressing entities are art-tile-only and numerically
  consistent with existing fiction (12 projects, 18 accepted).
