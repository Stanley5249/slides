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

const urls = await findEmbeds();
if (urls.size === 0) {
  console.log("No embedded sites in build/. Run `just build` first.");
}

let failed = false;
for (const url of urls) {
  try {
    const response = await fetch(url, { redirect: "follow" });
    const reason = response.ok
      ? refusal(response.headers)
      : `HTTP ${response.status}`;
    if (reason) failed = true;
    console.log(
      `${reason ? "refused" : "ok     "}  ${url}${reason ? `  (${reason})` : ""}`,
    );
  } catch (error) {
    failed = true;
    console.log(`failed   ${url}  (${String(error)})`);
  }
}

process.exit(failed ? 1 : 0);
