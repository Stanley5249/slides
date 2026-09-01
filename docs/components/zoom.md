# Zoom

`Zoom` shows any content as a preview and opens it in a modal pan-and-zoom viewer. It never inspects what
it is given, so a diagram, an image, or a plain block all work the same way.

## Usage

```svelte
<script lang="ts">
	import { Zoom } from '$lib';
</script>

<Zoom label="Site map" class="mx-auto mt-16">
	<img src="/site-map.png" alt="Site map" />
</Zoom>
```

Pass a `zoomed` snippet when the enlarged copy should differ from the preview:

```svelte
<Zoom label="Site map">
	<img src="/site-map-small.png" alt="Site map" />
	{#snippet zoomed()}<img src="/site-map-full.png" alt="Site map" />{/snippet}
</Zoom>
```

## Properties

| Property   | Type      | Required | Default            | Purpose                                      |
| ---------- | --------- | -------- | ------------------ | -------------------------------------------- |
| `children` | `Snippet` | Yes      |                    | Preview content, taken from the tag body.    |
| `zoomed`   | `Snippet` | No       | `children`         | Enlarged content, when it differs.           |
| `label`    | `string`  | No       | `Open zoomed view` | Accessible label for the trigger.            |
| `class`    | `string`  | No       | Empty string       | Additional class applied to the preview box. |

## Interactions

- Click the preview to open the viewer, fitted to the window up to 200%.
- Wheel or pinch to zoom between 10% and 400% around the pointer.
- Drag to pan. A press on a control or on text selects instead, and the cursor follows the same rule.
- Arrow keys move the content, `Ctrl` with up or down zooms, `+` and `-` zoom, `0` resets.
- Escape, the backdrop, or the close button exits.

The enlarged copy is mounted only while the dialog is open, and the plate lays content out at its natural
size, so content that fits itself to the preview box must lift that cap in its zoomed copy.
