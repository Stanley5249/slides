# Component reference

Reusable presentation components live in `src/lib/components` and are exported from `src/lib/index.ts`. Slide-specific content stays in `src/slides`.

## Components

- [MermaidZoom](mermaid-zoom.md): render a Mermaid diagram with a modal pan-and-zoom viewer.

## Adding a component

For each component:

1. Add the Svelte file under `src/lib/components`.
2. Export it from `src/lib/index.ts`.
3. Add a reference page here with its purpose, API, example, interactions, and accessibility behavior.
4. Add it to the component list above.
