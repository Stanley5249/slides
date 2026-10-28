import type { Handle } from "@sveltejs/kit/hooks";
import { lang } from "#lib/deck.ts";
import { flavor } from "#lib/theme.ts";

/**
 * Writes the deck language and the flavor onto `<html>` as the page is served.
 *
 * Catppuccin declares its palette against `:root`, which is `<html>` and nothing else. A flavor
 * class on `<body>` leaves every custom property that a stylesheet resolves at `:root` on a
 * different flavor from the one the slides are drawn in. The diagram renderer also reads
 * its font from `document.documentElement`, so it would measure labels in the wrong font.
 *
 * Injecting it here rather than hardcoding it in `app.html` keeps `src/lib/theme.ts` the single
 * place a flavor is named, so the stylesheet, the code blocks and the diagrams cannot drift apart.
 * The language comes from the deck metadata the same way, so a deck branch never edits `app.html`.
 */
export const handle: Handle = async ({ event, resolve }) =>
  resolve(event, {
    transformPageChunk: ({ html }) =>
      html.replace("%deck.lang%", lang).replace("%deck.flavor%", flavor),
  });
