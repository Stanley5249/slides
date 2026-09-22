---
name: animotion
description:
  Build and maintain Animotion presentations with Svelte 5 and Reveal.js. Use for
  slides, presentation mechanics, presenter actions, transitions, and deck
  behavior.
---

## References

Read the Animotion documentation before changing presentation mechanics:

- Animotion: https://animotion.pages.dev/llms.txt

For Svelte questions, start with the smallest sufficient reference and escalate as
needed:

- Small: https://svelte.dev/llms-small.txt
- Medium: https://svelte.dev/llms-medium.txt
- Full: https://svelte.dev/llms-full.txt

Read the SvelteKit reference only for routing or server behavior:

- SvelteKit: https://svelte.dev/docs/kit/llms.txt

## Project

Animotion provides the presentation runtime. Prefer its components instead of
creating parallel abstractions:

- `Presentation` configures Reveal and plugins.
- `Slides` loads file-based slides.
- `Slide` creates explicit slides or vertical stacks.
- `Action` handles presenter-controlled steps and undo behavior.
- `Transition` animates state and layout changes.
- `Code` renders and animates highlighted code.
