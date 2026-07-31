import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

async function render(path = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${path}`, {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the Open Signal concept and social metadata", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Open Signal — An interactive product spec for Suno<\/title>/i);
  assert.match(html, /Hear every version\. Credit what ships\./);
  assert.match(html, /Open Signal adds the human layer/);
  assert.match(html, /Interactive product spec/);
  assert.match(html, /Fictional people, audio, and outcomes/);
  assert.match(html, /rel="canonical" href="http:\/\/localhost:3000\/"/i);
  assert.match(html, /property="og:image"/i);
  assert.doesNotMatch(html, /vinext-starter|Your site is taking shape/i);
});

test("keeps the complete decision, credit, and lineage story in source", async () => {
  const source = await readFile(
    new URL("../app/OpenSignalExperience.tsx", import.meta.url),
    "utf8",
  );

  assert.match(source, /Replace the guitar riff/);
  assert.match(source, /Keep the tension\. Lose the stock indie cadence\./);
  assert.match(source, /Accept contribution/);
  assert.match(source, /Accept instead/);
  assert.doesNotMatch(source, /Choose @lowlight to accept/);
  assert.match(source, /Add your take/);
  assert.match(source, /Send for review/);
  assert.match(source, /Rights \+ credit receipt/);
  assert.match(source, /Separate stem reuse still requires permission/);
  assert.match(source, /Request one revision/);
  assert.match(source, /navigator\.share/);
  assert.match(source, /Verified creator/);
  assert.doesNotMatch(source, /Verified human/);
  assert.match(source, /Credits verified/);
  assert.match(source, /Native reputation/);
  assert.match(source, /Borrow the protocol, not the chrome/);
  assert.match(source, /GitHub logic, Suno language/);
  assert.match(source, /What the beta must prove/);
  assert.match(source, /Incremental 7-day publish or export completion/);
  assert.match(source, /scheduleVersionPreview/);
  assert.match(source, /Tap a version to hear it in context/);
  assert.match(source, /open-signal:accepted-id/);

  await Promise.all([
    access(new URL("../public/open-signal-cover.png", import.meta.url)),
    access(new URL("../public/nia-okafor.png", import.meta.url)),
    access(new URL("../public/og.png", import.meta.url)),
    access(new URL("../public/favicon.svg", import.meta.url)),
    access(new URL("../public/adopter-malik.jpg", import.meta.url)),
    access(new URL("../public/adopter-ana.jpg", import.meta.url)),
    access(new URL("../public/adopter-jules.jpg", import.meta.url)),
    access(new URL("../SUBMISSION-PRIMER.md", import.meta.url)),
  ]);
});
