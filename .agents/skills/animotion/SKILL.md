---
name: animotion
description: Build and maintain presentations with Animotion and Svelte.
---

## References

Read the Animotion documentation before changing presentation mechanics:

- Animotion: https://animotion.pages.dev/llms.txt
- Svelte: https://svelte.dev/llms-full.txt
- SvelteKit: https://svelte.dev/docs/kit/llms.txt

Use the smaller Svelte references only when context is limited:

- https://svelte.dev/llms-medium.txt
- https://svelte.dev/llms-small.txt

## Project use

Animotion provides the presentation runtime. Prefer its components instead of
creating parallel abstractions:

- `Presentation` configures Reveal and plugins.
- `Slides` loads file-based slides.
- `Slide` creates explicit slides or vertical stacks.
- `Action` handles presenter-controlled steps and undo behavior.
- `Transition` animates state and layout changes.
- `Code` renders and animates highlighted code.

Use Svelte 5 runes for slide state. Keep real presentation content under
`src/slides` and reusable behavior under `src/lib`.

## Working rules

- Keep Reveal navigation and Animotion's slide lifecycle intact.
- Start motion from presenter input, not from an autonomous timer.
- Restore state when an action is reversed.
- Respect `prefers-reduced-motion`.
- Check the installed package implementation when public documentation does not
  define lifecycle or undo behavior precisely.
- Run the project through Bun and the root `justfile`.
- Take a targeted browser screenshot after a visual or interaction change.
