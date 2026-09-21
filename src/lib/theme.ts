/**
 * The four Catppuccin flavours. All four ship in the stylesheet whichever one is imported, so the
 * choice below is the only thing that decides what a deck looks like.
 */
export type Flavor = "latte" | "frappe" | "macchiato" | "mocha";

/**
 * The flavour this deck is presented in.
 *
 * Changed in code and committed with the deck, never offered to the audience as a switch and never
 * left to `prefers-color-scheme`: a talk is projected into a room whose lighting the speaker knows
 * and the presenting machine does not.
 */
export const flavor: Flavor = "latte";

/** The Shiki theme that matches the flavour, for `<Code theme={codeTheme}>`. */
export const codeTheme = `catppuccin-${flavor}` as const;
