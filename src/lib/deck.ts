import { title as templateTitle } from "../template/deck";

// Deck branches add content without replacing files maintained on main.
const slides = import.meta.glob("/src/slides/*/slide.svelte");
const metadata = import.meta.glob<{ title: string }>("/src/slides/deck.ts", {
  eager: true,
});

export const hasDeck = Object.keys(slides).length > 0;
export const title = hasDeck
  ? (Object.values(metadata).at(0)?.title ?? "Presentation")
  : templateTitle;
