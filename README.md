# Open Signal

An interactive product specification for directed music collaboration, durable
creative credit, and human reputation on Suno. It illustrates a proposed
experience and community outcomes; it is not an existing Suno feature.

The prototype follows one mobile-first flow:

1. A creator opens a precise section of a song for contribution.
2. Producers submit alternatives against the same musical context.
3. The creator compares proposals and accepts one canonical contribution.
4. The accepted work becomes visible on the contributor's human profile and
   in the project's lineage.

Each proposal is auditionable in context using an in-browser sound sketch.
Production Suno renders can replace those sketches without changing the
interaction model.

The intended application-facing framing is:

> Open Signal is an interactive product specification for directed
> contribution on Suno. It explores whether playable comparison and durable
> credit can help better music ship while making human creativity more
> legible.

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
