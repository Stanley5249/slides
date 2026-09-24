/// <reference types="bun-types" />

// Checks that every site the deck embeds agrees to be framed.
//
// A site refuses a frame with an `X-Frame-Options` header or a CSP
// `frame-ancestors` directive, and the browser then draws its own error page
// inside the slide. The load event still fires, so the deck cannot tell. The
// prerendered pages hold every embedded address, so this reads them from the
// build and asks each site before the talk does.

import { Glob } from "bun";

const embedded =
  /data-background-iframe="(?<frame>[^"]+)"|<iframe\b[^>]*\bsrc="(?<source>[^"]+)"/g;

async function findEmbeds() {
  const urls = new Set<string>();
  for await (const file of new Glob("build/**/*.html").scan()) {
    const html = await Bun.file(file).text();
    for (const match of html.matchAll(embedded)) {
      const url = match.groups?.frame ?? match.groups?.source;
      if (url && /^https?:/.test(url)) urls.add(url);
    }
  }
  return urls;
}

// Returns why a site refuses a frame, or nothing when it allows one.
function refusal(headers: Headers) {
  const options = headers.get("x-frame-options")?.trim().toUpperCase();
  if (options === "DENY" || options === "SAMEORIGIN") {
    return `X-Frame-Options: ${options}`;
  }

  const ancestors = headers
    .get("content-security-policy")
    ?.split(";")
    .map((directive) => directive.trim())
    .find((directive) => directive.startsWith("frame-ancestors"));
  if (ancestors && !ancestors.split(/\s+/).includes("*")) {
    return `Content-Security-Policy: ${ancestors}`;
  }

  return undefined;
}

// Only the headers are read, so the body is dropped unread. A HEAD request
// would skip it too, but some sites answer HEAD with other headers.
async function check(url: string) {
  try {
    const response = await fetch(url);
    await response.body?.cancel();
    const reason = response.ok
      ? refusal(response.headers)
      : `HTTP ${response.status}`;
    return {
      failed: Boolean(reason),
      line: `${reason ? "refused" : "ok     "}  ${url}${reason ? `  (${reason})` : ""}`,
    };
  } catch (error) {
    return { failed: true, line: `failed   ${url}  (${String(error)})` };
  }
}

const urls = await findEmbeds();
if (urls.size === 0) console.log("No embedded sites in build/.");

const results = await Promise.all(Array.from(urls, check));
for (const { line } of results) console.log(line);

process.exit(results.some((result) => result.failed) ? 1 : 0);
