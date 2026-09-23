# Component reference

Reusable presentation components live in `src/lib/components` and are exported
from `src/lib/index.ts`. Slide-specific content stays in `src/slides`.

## Components

- [Link](link.md): set a link with an optional icon, such as the GitHub mark.
- [Mermaid](mermaid.md): render a Mermaid diagram, zoomable, with the parse
  error shown in place.
- [Shot](shot.md): put a screenshot on a slide, zoomable, with a labelled slot
  when the file is missing.
- [Tex](tex.md): set TeX source as math, rendered at build time with the fonts
  bundled.
- [Zoom](zoom.md): show any content as a preview that opens in a modal
  pan-and-zoom viewer.

## Adding a component

For each component:

1. Add the Svelte file under `src/lib/components`.
2. Export it from `src/lib/index.ts`.
3. Add a reference page here with its purpose, an example, its interactions and
   its accessibility behavior. Leave the signature to the component's own type
   and record only what that type cannot say.
4. Add it to the component list above.
