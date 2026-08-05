# Open Signal refinement handoff

Updated: 2026-07-31

## Task

Audit, challenge, and refine the Open Signal interactive product specification
so it more accurately expresses Bo Abrams's intended product thesis for Suno:
translate the useful collaboration protocol of open-source software into a
mobile-first, human-centered music contribution system.

Treat this as both a product-strategy and product-design assignment. Inspect the
working prototype before editing. Identify where the concept, interaction,
language, visual design, or assumptions are unclear or unconvincing, then make
coherent edits in this repository. Preserve what already works. Do not rewrite
the project from scratch.

Do not submit Bo's job application. Do not deploy a revised public build until
Bo explicitly approves that external action.

## Context

Bo is applying for Suno's Staff Product Manager role focused on mobile creation:

- Job description: <https://jobs.ashbyhq.com/suno/8827d2bd-6676-4f4d-8877-bd662353ef9a>
- Current prototype: <https://open-signal-concept.boabrams.workers.dev/>
- Source repository: `/Users/boabrams/personal/jobs/suno-application/open-signal-concept`

The prototype is meant to demonstrate product taste, creative ambition,
technical fluency, mobile judgment, and a credible approach to measurement. It
is not intended to look like a generic GitHub clone or another social feed.

Bo's core intuition is that Suno can become more human and creatively credible
if real creators can build status through specific work that other creators
actually choose, publish, and reuse. A strong producer should be able to
contribute a distinctive bass response, countermelody, vocal texture, or sound
design choice to one unresolved section of someone else's song. The song owner
retains control over what ships. Accepted work creates durable authorship,
lineage, and reputation for the contributor.

The important product delta is a structured third-party contribution loop:

`precise request → contextual contribution → review/revision → owner decision → rights-aware credit and lineage`

Suno already has creation, editing, remixing, sharing, profiles, follows, and
version-related workflows. Do not pitch those existing surfaces as new. The
concept must remain additive and differentiated.

## User intent to preserve

- **Copy voice rule (Bo, 2026-08-05):** inside the phone, every string is
  either product-voice (what a real user needs in order to want to try the
  feature) or viewer-essential disclosure ("Illustrative…"). Positioning and
  reviewer-facing framing live on the editorial page only. This retired
  "A feed of problems, not posts." from the browse scene in favor of
  "Find a section that needs your sound."

- Borrow GitHub's collaboration logic, not its visual chrome.
- Make the product feel native to Suno and musical rather than technical.
- Keep mobile as the primary surface while allowing a polished desktop review.
- Humanize profiles through credible identity, selected credits, collaborators,
  accepted contributions, and downstream reuse.
- Make contribution a status signal based on demonstrated craft, not posting
  volume, generic likes, or AI-generated profile theater.
- Let creators open a precise part of a song to outside creative input without
  giving up ownership or project control.
- Let a contributor record, remix with Suno, or upload a take and hear it in the
  same song context.
- Make rights scope and credit legible at the moment a contribution is accepted.
- Preserve a realistic beta thesis, trust model, and causal success metric.
- Avoid the phrase **"verified human."** Bo found it unnatural. The current UI
  uses **"verified creator"** and distinguishes identity from verified credits.

## Relevant files

- `app/OpenSignalExperience.tsx` — all prototype state, interactions, scenes,
  copy, Web Audio sketches, creator data, receipt, profile, and page narrative.
- `app/globals.css` — responsive visual system, phone frames, mobile breakpoints,
  animations, focus states, lineage diagram, and desktop layout.
- `app/layout.tsx` — title, description, authorship, canonical URL, Open Graph,
  Twitter metadata, fonts, and favicon.
- `app/page.tsx` — renders the interactive experience.
- `public/open-signal-cover.png` — fictional cover image used by the song.
- `public/nia-okafor.png` — fictional contributor portrait.
- `public/adopter-*.jpg` — fictional downstream contributor/reuse portraits.
- `public/og.png` — social preview image.
- `SUBMISSION-PRIMER.md` — product thesis, GitHub-to-Suno mapping, MVP,
  measurement plan, risks, application copy, and 60-second talk track.
- `APPLICATION-LINK-COPY.md` — paste-ready application description and short
  version.
- `README.md` — project overview, flow, local commands, and deployment command.
- `tests/rendered-html.test.mjs` — rendered HTML, copy, metadata, asset, and
  concept-regression checks.
- `worker/index.ts` — Cloudflare Worker entry point.
- `.openai/hosting.json` — hosting metadata; currently contains no Sites project.

Useful final-review screenshots are outside the repository at:

`/Users/boabrams/.codex/visualizations/2026/07/30/019fb55b-96f7-72e3-9e79-96e5a2b3a464/open-signal-final-qa/`

The most useful files there are:

- `20-hosted-desktop-full.png`
- `14-hosted-mobile-player.png`
- `15-hosted-mobile-call.png`
- `16-hosted-mobile-submit.png`
- `17-hosted-mobile-compare.png`
- `18-hosted-mobile-receipt.png`
- `19-hosted-mobile-profile.png`

## Current state

- Branch: `main`
- Submission-build source baseline: commit `9dd6d6e` (Suno-brand + rights-loop
  pass; supersedes `3e405ad`)
- Public Cloudflare Worker version: `15c20b49-5ed9-4fd9-9333-aa271c5f8340`,
  deployed 2026-07-31 with Bo's approval and verified live (HTTP 200, dark
  sheet, lava CTA, rights line, and invite-only copy all confirmed in the
  served build).
- The repository is clean at `9dd6d6e` plus this handoff update.

### Refinement pass 1 (2026-07-31, committed as `c9cc646`)

Audit completed against this handoff; Bo approved all four changes:

- Call sheet: `Invite-only call · 2 hours ago` in the requested-by line
  (assumption 3).
- Player: like counter seeded at 341/342 instead of 0/1.
- Submit: the draft-take subtitle follows the chosen method — `recorded` /
  `Suno remix` / `uploaded`.
- Primer: **Compensation** risk bullet naming credit-first sequencing
  (assumption 6).
- Tests: `Invite-only call` source assertion.

### Refinement pass 2 (2026-07-31, Suno brand + protocol completion)

Bo granted full agency to render the concept in Suno's brand and product
language and to complete the open-source contribution/credit/licensing loop.
Grounded in Suno's current official iOS App Store screenshots (v1.81.0);
Mobbin was unreachable without a login, and the App Store set is the same
primary source.

- Phone scenes now follow the Suno mobile idiom: warm near-black surfaces,
  translucent chips, dark sheets, and the lava-gradient pill reserved for
  primary actions. The editorial spec page around the phone stays light.
  Implemented as a scoped `.phone-frame` token layer at the end of
  `globals.css`, plus inline data-color updates in the TSX.
- Site accent moved from purple to Suno magenta (`--purple: #f2148c`,
  `--violet: #b1126e`) so page and product read as one brand. Contributor
  identity hues moved into the Suno family (bone / magenta / orange).
- Licensing loop completed upstream and downstream: the call sheet now states
  rights before contribution ("If accepted, the take ships in this song.
  Stems stay yours.") and the owner decision set is complete —
  accept / request one revision / **Pass on this take**. Passing marks the
  row `PASSED` and states that the contributor keeps the take and its rights;
  accepting a previously passed take clears it. Reset clears passes.
- Tests pin `Stems stay yours`, `Pass on this take`, and the passed-note copy.
- Call sheet height raised (66% desktop, 76% mobile) so both primary actions
  stay inside the frame with the new rights line at 390×844, 1024×768, and
  1440×900 (measured, not eyeballed).
- Full battery green: lint, `tsc --noEmit`, `npm test` 2/2,
  `git diff --check`; discrete-step functional walk verified rights gate,
  revision, pass, accept, auto-receipt (focus moves into the dialog, Escape
  closes and restores focus), profile, follow, and reset on the final build.
- Known cosmetic quirk (pre-existing): the widened desktop compare phone
  overlaps the right rail by design; unchanged.
- `public/og.png` regenerated in the new brand system (`497ff5a`).

### Judge panel + fixes (2026-08-01)

A three-judge blind panel (recruiter, CPO, skeptic lenses) evaluated the
deployed build with a neutral evidence pack. Verdict: unanimous
strengthen/forward/interview, zero unanimous submission blockers. Converged
findings were fixed and shipped:

- Header lockup no longer leads with the Suno mark: neutral waveform glyph +
  "Open Signal — Independent concept for Suno"; the gradient-squircle orb
  (Suno app-icon-adjacent, per the skeptic) is gone from site chrome. In-fiction
  avatar orbs stay.
- Compensation gap closed on-page: "Credit-first by design. Compensation and
  splits enter once accepted takes prove they help songs ship." in the
  measurement section.
- Mantra de-dup: "Borrow the protocol, not the chrome." appears exactly once
  on the page; both application blurbs rewrote the twin em-dash negations.
- Primer gained "Hard questions to carry": Replace-Section-vs-human-take
  counterfactual, uncleared-sample liability walk, compensation stance,
  pass-then-regenerate dark pattern, invite-only-to-discovery bridge.
- `robots: noindex, nofollow` added (direct links unaffected).
- Tests pin "Independent concept" and "Credit-first by design".

Panel transcripts are in the session; CPO interview-prep priorities (holdout
design, contributor economics) are primer material, deliberately not page
copy.

Implemented scenes:

1. **Player** — song context, playable sound sketch, like, share, and entry to an
   Open Call.
2. **Open Call** — exact section, creative ask, musical constraints, existing
   proposals, and visible mobile actions to contribute or compare.
3. **Submit** — contributor-side record/remix/upload choice, in-context preview,
   draft take, rights confirmation, and submission success.
4. **Compare** — switch among original and two alternatives, hear generated
   sound sketches, inspect contributors, request a revision, and accept either
   proposal.
5. **Accepted receipt** — exact asset, song-use permission, excluded stem reuse,
   attribution, and confirmation state.
6. **Profile** — creator identity, selected credits, accepted contributions,
   reuse, followers, follow, share, and playback.
7. **Page narrative** — lineage diagram, four design principles, GitHub-to-Suno
   protocol line, and beta measurement framework.

Validated behavior:

- `npm run lint` passes.
- `npm test` passes.
- `npx tsc --noEmit` passes.
- Hosted QA passed at 390×844, 1024×768, and 1440×900.
- All six scenes had zero body or phone-frame horizontal overflow at 390px.
- Hosted browser console had zero errors and zero warnings.
- Automated baseline checks found no unnamed buttons, missing `alt` attributes,
  or duplicate IDs. This is not a claim of full WCAG conformance.
- Reduced-motion mode collapses animation duration to `0.01ms`.
- The complete hosted flow passed:
  `player → call → submit → review → feedback → accept → receipt → profile`.
- Like, follow, share-status, reset, dialog focus, and Escape-close behavior work.

## What was tried

- An early framing leaned more heavily on GitHub vocabulary, stars, forks,
  trending repositories, and community mechanics. This was narrowed because it
  read as a generic platform metaphor before proving the core creation outcome.
  Stars, trending, public forks, and broader discovery now appear only as future
  possibilities in the primer.
- The profile originally used **"verified human."** Bo rejected that wording.
  It was replaced with **"verified creator,"** while **"credits verified"** is a
  separate signal.
- Reviewers found that the concept risked duplicating functionality Suno already
  supports. The public framing was sharpened around the missing third-party
  contribution, review, owner-choice, rights, and portable-credit loop.
- Reviewers also found that the first build did not prove the contributor side.
  The Submit scene, rights gate, success state, revision request, and acceptance
  receipt were added to make the system genuinely two-sided.
- The mobile Open Call initially hid its core actions below the first viewport.
  The sheet and action layout were adjusted so **Add your take** and **Compare**
  are both visible at 390×844.
- The mobile GitHub-to-Suno flow clipped **Accept + credit**. It now wraps and
  fits without horizontal scrolling.
- Motion was kept restrained: scene entrance, audition sweep, acceptance glow,
  and receipt-sheet entrance. Ambient or decorative animation was deliberately
  avoided.
- Real Suno audio was not embedded. The prototype uses generated Web Audio sound
  sketches to make the comparison interaction functional without presenting
  them as production music.

## Decisions

- **Protocol, not chrome.** Use the sequence and governance logic of open source,
  but speak in sections, takes, listening, revisions, acceptance, and credit.
- **Directed collaboration before marketplace discovery.** First prove that a
  precise request helps an unfinished song ship. Do not begin with a public feed,
  trending page, or contributor marketplace.
- **Owner-controlled acceptance.** Contributors can propose; they cannot
  overwrite the project or vote a take into the song.
- **Rights are asset-scoped.** Acceptance permits the exact take in the named
  song. Reusing the stem elsewhere requires separate permission.
- **Reputation follows accepted work.** The valuable status signal is that other
  creators selected and retained the contribution, not that the contributor
  generated or posted a large volume of content.
- **Causal primary metric.** The beta should measure incremental seven-day
  publish/export completion against comparable editing sessions, not generic
  engagement alone.
- **Fiction is disclosed.** The people, audio, and outcomes are fictional and
  the public artifact states that it is independent and not affiliated with
  Suno.
- **Mobile is the product; desktop is the explanation surface.** The phone flow
  should remain usable by itself, while the desktop page exposes the strategy,
  lineage, and measurement logic to an application reviewer.

## Assumptions to challenge explicitly

Do not treat these as settled merely because the current build encodes them:

1. **Are the fictional, AI-produced-looking portraits self-defeating?** The
   thesis criticizes low-trust or artificial profiles, yet the spec necessarily
   uses fictional people. Consider whether credited stock photography, abstract
   identity treatments, or a clearer fictional-case-study frame would better
   support the argument.
2. **Is "verified creator" the right signal?** Define what is verified:
   government identity, professional identity, external credits, ownership of a
   Suno account, or some combination. Identity and credit verification should
   not blur together.
3. **Is the Open Call public, invite-only, or reputation-gated?** The UI is
   currently ambiguous. The primer recommends an invite-only beta, but the
   product could eventually support different visibility modes.
4. **Does the GitHub metaphor clarify or burden the pitch?** A reviewer should
   understand the product even if they never notice the software analogy.
5. **Is one section and one revision the right mobile unit?** This is a deliberate
   MVP constraint, not a proven universal workflow.
6. **Is the rights receipt credible enough?** It is product framing, not a legal
   instrument. Challenge whether compensation, royalty splits, revocation,
   derivative works, model-training use, or territory/duration need treatment.
7. **Does accepted-work reputation create healthy incentives?** It may favor
   already-visible producers, encourage unpaid speculative labor, or reproduce
   popularity bias. Suggest product guardrails, not just policy language.
8. **Is publish/export completion the right north star?** It is causal and
   outcome-oriented, but it may miss creative quality, contributor value, or
   long-term collaboration formation.
9. **Should the mobile website show a phone frame inside a phone browser?** The
   current approach makes the artifact legible as a spec, but a full-bleed mobile
   mode could feel more like a real app.
10. **Is "Open Signal" the strongest name?** Preserve it unless there is a
    clearly better name supported by the product idea, not wordplay alone.
11. **Should the prototype include a real Suno song?** A song could make the
    application more memorable, but it introduces authorship, rights, link
    durability, and presentation-quality questions. Do not substitute a weak or
    gimmicky track for clear product thinking.
12. **Is the page still too long?** Determine whether an application reviewer
    understands the thesis and discovers the interactive path within 15 seconds,
    especially on mobile.

## Acceptance criteria

- [ ] Begin with a blind first-impression review of the hosted URL at 390×844
      and 1440×900 before changing code.
- [ ] State the product thesis back in one sentence and identify any place the
      interface contradicts it.
- [ ] Separate current Suno capabilities from the proposed Open Signal delta.
- [ ] Challenge the assumptions above and document which should change now,
      later, or not at all.
- [ ] Preserve the two-sided flow: request, contribution, rights consent,
      review/revision, acceptance, receipt, and contributor reputation.
- [ ] Keep both primary Open Call actions visible on a 390px-wide viewport.
- [ ] Keep all main controls functional; do not replace the interactive build
      with static mockups.
- [ ] Keep the experience coherent on 390×844, 1024×768, and 1440×900.
- [ ] Preserve or improve keyboard labels, focus visibility, reduced-motion
      behavior, dialog handling, metadata, and fictional-content disclosure.
- [ ] Update `SUBMISSION-PRIMER.md`, `APPLICATION-LINK-COPY.md`, README, tests,
      and metadata if product framing or public copy changes.
- [ ] Run `npm run lint`, `npm test`, `npx tsc --noEmit`, and `git diff --check`.
- [ ] Report any remaining uncertainty honestly. Do not claim full accessibility
      or legal sufficiency from a prototype review.
- [ ] Stop before deployment and ask Bo to approve the revised public build.

## Constraints

- Work only inside
  `/Users/boabrams/personal/jobs/suno-application/open-signal-concept` unless Bo
  explicitly expands scope.
- Do not edit the resume, cover note, LinkedIn copy, Ashby answers, or other job
  application package files from this task.
- Do not submit the application, send messages, contact Suno, or publish music.
- Do not deploy or change the public Worker without explicit approval.
- Do not expose secrets or print Cloudflare credentials.
- Do not invent current Suno capabilities. Recheck official Suno sources and, if
  changing visual fidelity, inspect current Suno screens through Mobbin.
- Preserve Suno's trademark boundary: keep **Concept** branding, fictional
  disclosure, and **not affiliated with Suno** language.
- Preserve the user's existing changes and inspect `git status` before editing.
- Use `apply_patch` for source-file edits.
- Avoid new dependencies unless the change clearly requires one.
- Do not create an open marketplace, public graph, or complex licensing system
  merely because the GitHub analogy suggests it.

## Suggested first pass

1. Read this handoff, `SUBMISSION-PRIMER.md`, `APPLICATION-LINK-COPY.md`,
   `README.md`, `app/OpenSignalExperience.tsx`, and `app/globals.css`.
2. Inspect the hosted URL without reading the implementation and record the
   first 15-second takeaway, the perceived user, the perceived value, and the
   first confusing element.
3. Walk the mobile flow as both song owner and contributor. Verify which controls
   actually work.
4. Compare the current experience with the Staff PM job description and current
   official Suno/Mobbin references.
5. Produce a short ranked critique before editing: submission blockers, strong
   opportunities, and ideas to defer.
6. Make the smallest coherent set of changes that strengthens the thesis.
7. Run all validation commands and return screenshots at the three required
   viewports.
8. Present the changes and tradeoffs to Bo. Ask before redeploying.

## Commands

```bash
cd /Users/boabrams/personal/jobs/suno-application/open-signal-concept
npm run dev
npm run lint
npm test
npx tsc --noEmit
git diff --check
```

The existing deployment command is:

```bash
npm run deploy
```

Do not run the deployment command until Bo approves the revised public build.

### Project closed (2026-08-02)

Bo filed the application with this link on 2026-08-02 and marked the project
complete. The Worker stays live for reviewers and interviews; no further
changes without a new mandate. Interview prep lives in SUBMISSION-PRIMER.md
("Hard questions to carry").

### Reopened same day: browse discovery surface (2026-08-02, shipped)

Bo reopened with a new mandate: make the mobile-first browsing behavior the
demo's entry — GitHub-trending for music. Designed via brainstorm
(spec: `docs/superpowers/specs/2026-08-02-browse-discovery-design.md`),
planned (`docs/superpowers/plans/2026-08-02-browse-discovery.md`), executed
inline with ui-ux-pro-max + frontend-design guidance.

Shipped: `browse` is the demo's opening scene — "Open work / A feed of
problems, not posts." with trending open calls (live Open Signal card routes
into the existing flow), reusable components, top contributors, and active
collaborations; all dressing content is non-interactive by design. Bare URL
and Reset land on browse; every prior deep link still works; hero step
gating adjusted for the new scene index. Page right-rail now opens
"Producers find open work in the feed;…"; primer's discovery-bridge answer
and the link-copy 60-second path (Browse → …) updated.

Verified: full battery green; end-to-end walk (browse → call → rights gate →
submit → compare → pass → accept → receipt focus/Escape → profile → follow →
reset-to-browse) on the final build; seven-tab row scrolls and every tab is
reachable at 390; no horizontal overflow at 390/1024/1440; hero step 1
lights only from the call scene onward. Deployed as Worker version
`cc809beb-bb9a-4447-9e8c-41d842c4bfc6` and verified live (SSR serves the
browse scene; tap-through and rights gate confirmed on production). Known
harness-only artifact: agent-browser long composite evals can drop a
trailing reset click; discrete clicks and real flows are unaffected.

### Judge panel 2 + fixes (2026-08-02, on the browse build)

Second three-judge blind panel (fresh agents, rebuilt production evidence):
unanimous strengthen/forward/interview, zero blockers. Panel-1 fixes
confirmed landed (recruiter brand fit 7→9, "near best-practice nominative
use"; compensation and Explore-duplication probes "defended on-page"; CPO:
"fork-to-merge is the correct structural read"). Browse judged ~60% real
differentiator. Shipped from converged findings:

- Browse taxonomy collapsed to one axis: Invite-only / Open pool (third
  card's "Invited" removed).
- World consistency: drum texture reuse 12→14 (kills the double-12 with
  lineage), "Granular bass one-shots" → "Dusted bass one-shots", all four
  top contributors now carry accepted counts.
- Principles subtitle "Less feed. More authorship." → "When re-rolling
  stops helping, you ask a person." — thins the antithesis stack the
  skeptic flagged AND answers the regeneration counterfactual on-page.
- Primer hard questions extended: compensation trigger/mechanism at
  open-pool scale, remix-derivative rights chain, randomized-holdout +
  listener-side causal design, visibility-vs-submission taxonomy.

Deliberately skipped (recorded): song/product name collision (self-titling
defense stands; renaming touches ~15 validated strings pre-interview) and
the post-pass profile "In review" seam (edge path). Evidence-pack note:
four capture files in the session scratchpad were byte-identical duplicates
(harness artifact, deleted); judges verified those states on the live build
directly.

### Judge panel 3 + voice pass (2026-08-05)

Third blind panel on the browse build with a state-verified, md5-unique
evidence pack including the OG unfurl card: unanimous
strengthen/forward/interview for the third round (recruiter: "top 1–2% of
work samples"; CPO craft 9; skeptic probe-resilience up to 7). Panel-two
fixes held under attack (taxonomy "the labels carry it"; subtitle
"correctly names generation's retention ceiling"; counts "non-round and
plausible"). Shipped from converged findings + Bo's copy-voice rule:

- Browse subline → user-voice "Find a section that needs your sound."
  (test pin updated; the retired slogan also left the OG card, which now
  uses the same user-voice headline).
- Submit eyebrow → "Contributor view · @lowlight, invited" (kills the
  skeptic's role-play hole and circular-timeline catch).
- Nia's note de-echoed → "More tension, fewer safe choices." (removes the
  generated-echo "stock cadence" repeat).
- Accepted counts increment on acceptance (18→19 on profile and browse;
  reset restores) — the skeptic's off-by-one.
- Measurement section gained the why-now/cold-start line: "Supply starts
  with the same stuck editors flipped around…"
- APPLICATION-LINK-COPY gained a ~55-word short recommended blurb; primer
  gained the prior-art/why-now hard question (BandLab/Kompoz/Blend) and the
  passed-take derivation-chain cap.

Remaining known probes are primer-armed, not page-fixed: derivative
provenance depth, experiment design, browse-at-beta-scale.

### Round 4: fork, social graph, studio (2026-08-05, Bo-directed)

Spec: `docs/superpowers/specs/2026-08-05-fork-social-studio-design.md`.
Plan: `docs/superpowers/plans/2026-08-05-fork-social-studio.md`. Shipped:

- "Trending packs" (Bo picked the producer word) with the full graph on the
  featured pack: derived ★ 214/215, 41/42 forks, comment chip, Fork button;
  quiet static stats on dressing packs (★58/9, ★31/6).
- Comments sheet on the featured pack: Bo's dialogue verbatim
  (@julesmakes' snare comment with the embedded playable "Offbeat snare
  flip" fork + Fork action; @lowlight replies "That's genius." wearing a
  Creator chip), plus a live composer that posts locally as "You".
- Studio scene (outside the tab row, fork-entry only): "Your studio ·
  Draft", "Forked from @lowlight · credit attached", credit-locked layer +
  empty layer, create prompt, method chips, "Save draft" → "Saved to your
  studio · Synced" → drafts strip on Browse; fork count ticks 42.
- Profile: four-cell stats with Stars (derived 214/215; 76 for Malik).
- Motion tokens: sheet-rise 340ms, staggered browse entrance, pressed
  scale, count/star pops; all under the reduced-motion collapse.
- Primer: stars-vs-popularity hard question.
- Counts derive from one source everywhere (tile, sheet, profile);
  Reset restores 214/41/18 and clears drafts and comments.

Pipeline per Bo: deploy → judge panel → Bo's energy test → only then
publish source to github.com/boharrisonabrams/open-signal-concept
(public), gated on gh auth being boharrisonabrams.
