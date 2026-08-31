# MermaidZoom

`MermaidZoom` renders Mermaid source as a diagram preview. The preview opens a modal viewer for detailed diagrams.

## Usage

```svelte
<script lang="ts">
	import { MermaidZoom } from '$lib';

	const diagram = `flowchart LR
		Idea --> Build
		Build --> Present`;
</script>

<MermaidZoom code={diagram} label="Presentation workflow" />
```

Write the diagram with standard Mermaid syntax inside a JavaScript template string, then pass it through the `code` property.

## Properties

| Property | Type     | Required | Default                | Purpose                                  |
| -------- | -------- | -------- | ---------------------- | ---------------------------------------- |
| `code`   | `string` | Yes      |                        | Mermaid source to render.                |
| `label`  | `string` | No       | `Open Mermaid diagram` | Accessible label for the preview button. |
| `class`  | `string` | No       | Empty string           | Additional class applied to the preview. |

## Interactions

- Hover over the preview to see the zoom-in cursor.
- Click the preview to open the modal viewer.
- Use the mouse wheel to zoom from 50% to 400% around the pointer.
- Drag with the left mouse button to pan.
- Use the `−`, percentage, and `+` controls to zoom or reset the view.
- Press Escape or use the `×` button to close the viewer.

The component stops pointer and keyboard events at the open dialog so Reveal.js does not change slides while the diagram is being inspected. Mermaid rendering uses strict security mode and is loaded only in the browser.
