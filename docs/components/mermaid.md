# Mermaid

`Mermaid` renders Mermaid source as a diagram. A diagram that renders is
zoomable through [Zoom](zoom.md). A diagram that does not render shows the
Mermaid message in place, in a monospace panel with a copy button.

## Usage

```svelte
<script lang="ts">
  import { Mermaid } from "$lib";

  const diagram = `flowchart LR
		Idea --> Build
		Build --> Present`;
</script>

<Mermaid code={diagram} label="Presentation workflow" />
```

The source is an ordinary `const`: nothing in the deck edits a diagram at
runtime.

## Properties

The `Props` type in the component carries the signature. `class` lands on the
outer box, which is the zoom preview when the diagram renders and the error
panel when it does not.

## Notes

Mermaid is loaded only in the browser, renders under strict security mode, and
its renders are serialized. It is themed from the deck's role tokens, read live
from the document, so a diagram is drawn in the deck's own colours.

One render feeds both the preview and the enlarged copy.
