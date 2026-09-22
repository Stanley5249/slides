import type { Handle } from "@sveltejs/kit";
import { flavor } from "$lib/theme";

/**
 * Writes the flavor onto `<html>` as the page is served.
 *
 * Catppuccin declares its palette against `:root`, which is `<html>` and nothing else. A flavor
 * class on `<body>` leaves every custom property that a stylesheet resolves at `:root` on a
 * different flavor from the one the slides are drawn in. The Mermaid theme also reads
 * `document.documentElement`, so it would receive the wrong palette.
 *
 * Injecting it here rather than hardcoding it in `app.html` keeps `src/lib/theme.ts` the single
 * place a flavor is named, so the stylesheet, the code blocks and the diagrams cannot drift apart.
 */
export const handle: Handle = async ({ event, resolve }) =>
  resolve(event, {
    transformPageChunk: ({ html }) => html.replace("%deck.flavor%", flavor),
  });
