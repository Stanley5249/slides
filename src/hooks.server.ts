import type { Handle } from '@sveltejs/kit';
import { flavor } from '$lib/theme';

/**
 * Writes the flavour onto `<html>` as the page is served.
 *
 * Catppuccin declares its palette against `:root`, which is `<html>` and nothing else. A flavour
 * class on `<body>` leaves every custom property that a stylesheet resolves at `:root` on a
 * different flavour from the one the slides are drawn in, and leaves anything reading
 * `document.documentElement` — the Mermaid theme, for one — reading the wrong palette.
 *
 * Injecting it here rather than hardcoding it in `app.html` keeps `src/lib/theme.ts` the single
 * place a flavour is named, so the stylesheet, the code blocks and the diagrams cannot drift apart.
 */
export const handle: Handle = async ({ event, resolve }) =>
	resolve(event, { transformPageChunk: ({ html }) => html.replace('%deck.flavor%', flavor) });
