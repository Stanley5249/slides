# Mermaid

`Mermaid` renders Mermaid source as a diagram. A diagram that renders is zoomable through [Zoom](zoom.md).
A diagram that does not render shows the Mermaid message in place, in a monospace panel with a copy button.

## Usage

```svelte
<script lang="ts">
	import { Mermaid } from '$lib';

	const diagram = `flowchart LR
		Idea --> Build
		Build --> Present`;
</script>

<Mermaid code={diagram} label="Presentation workflow" />
```

The source is an ordinary `const`: nothing in the deck edits a diagram at runtime.

## Properties

| Property | Type     | Required | Default                | Purpose                                    |
| -------- | -------- | -------- | ---------------------- | ------------------------------------------ |
| `code`   | `string` | Yes      |                        | Mermaid source to render.                  |
| `label`  | `string` | No       | `Open Mermaid diagram` | Accessible label for the zoom trigger.     |
| `class`  | `string` | No       | Empty string           | Additional class applied to the outer box. |

## Notes

Mermaid is loaded only in the browser, renders under strict security mode, and its renders are serialized.
The configuration is read from the live Catppuccin custom properties.

One render feeds both copies, so the enlarged copy is rewritten into its own ID namespace before it is
inserted. Mermaid prefixes every internal ID with the diagram ID, references and the scoped `<style>` block
included, so a single replace is enough. Without it both copies would define the same marker IDs.

When rendering settles, the component calls Animotion's Reveal instance `layout()` so a freshly sized slide
is measured again.
