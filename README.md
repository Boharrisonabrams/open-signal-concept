# Open Signal

An interactive product specification for last-mile human music collaboration,
rights-aware creative credit, and creator reputation on Suno. It illustrates a
proposed experience and beta measurement plan; it is not an existing Suno
feature.

Public prototype:
[open-signal-concept.boabrams.workers.dev](https://open-signal-concept.boabrams.workers.dev)

The prototype follows one mobile-first flow:

1. A creator opens a precise section of a song for contribution.
2. A contributor records, remixes with Suno, or uploads a take and confirms
   the rights they control.
3. The creator compares proposals, requests a revision, and accepts the take
   they prefer.
4. Acceptance creates a scoped rights-and-credit receipt.
5. The accepted work becomes visible on the contributor's creator profile and
   in the project's lineage.

Each proposal is auditionable in context using an in-browser sound sketch.
Production Suno renders can replace those sketches without changing the
interaction model.

The intended application-facing framing is:

> Suno already helps creators generate, remix, and compare versions. Open
> Signal explores the missing human layer: ask for one precise take, choose
> what ships, and preserve rights-safe credit for who made it.

The collaboration model borrows the protocol, not the chrome, from open-source
software: request → contribution → review → acceptance → durable lineage.

All people, songs, credits, and metrics shown here are illustrative. This
independent concept is not affiliated with Suno.

## Run locally

Requires Node.js `>=22.13.0`.

```bash
npm install
npm run dev
```

Use `npm test` for the production build and rendered-output checks, and
`npm run lint` for static analysis.

## Deploy

The public artifact is a Cloudflare Worker. After authenticating Wrangler:

```bash
npm run deploy
```
