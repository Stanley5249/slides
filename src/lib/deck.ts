import * as template from "../template/deck";

// Deck branches select their content explicitly and keep the examples intact.
export const source = "template" as "template" | "deck";
const metadata = import.meta.glob<
  { title?: string; lang?: string } | undefined
>("/src/slides/deck.ts", {
  eager: true,
});

function field(name: "title" | "lang"): string {
  if (source === "template") return template[name];
  const value = metadata["/src/slides/deck.ts"]?.[name];
  if (!value) {
    throw new Error(`Deck source requires a ${name} in src/slides/deck.ts.`);
  }
  return value;
}

export const title = field("title");
export const lang = field("lang");
