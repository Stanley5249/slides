import { title as templateTitle } from "../template/deck";

// Deck branches select their content explicitly and keep the examples intact.
export const source = "template" as "template" | "deck";
const metadata = import.meta.glob<{ title: string } | undefined>(
  "/src/slides/deck.ts",
  {
    eager: true,
  },
);

export const title = (() => {
  if (source === "template") return templateTitle;
  const deckTitle = metadata["/src/slides/deck.ts"]?.title;
  if (!deckTitle) {
    throw new Error("Deck source requires a title in src/slides/deck.ts.");
  }
  return deckTitle;
})();
