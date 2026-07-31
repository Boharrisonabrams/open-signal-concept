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
  assert.match(html, /<title>Open Signal — Make human contribution legible<\/title>/i);
  assert.match(html, /Make human contribution legible\./);
  assert.match(html, /Open Calls turn a promising song section into an invitation/);
  assert.match(html, /Concept prototype/);
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
  assert.match(source, /Verified human/);
  assert.match(source, /Credits verified/);
  assert.match(source, /Native reputation/);
  assert.match(source, /Open Sound Registry/);
  assert.match(source, /open-signal:accepted/);

  await Promise.all([
    access(new URL("../public/open-signal-cover.png", import.meta.url)),
    access(new URL("../public/nia-okafor.png", import.meta.url)),
    access(new URL("../public/og.png", import.meta.url)),
    access(new URL("../public/favicon.svg", import.meta.url)),
  ]);
});
