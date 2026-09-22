# Zoom

`Zoom` shows any content as a preview and opens it in a modal pan-and-zoom
viewer. It never inspects what it is given, so a diagram, an image, or a plain
block all work the same way.

## Usage

```svelte
<script lang="ts">
  import { Zoom } from "$lib";
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

The `Props` type in the component carries the signature. Two things it does not
say: `zoomed` falls back to `children`, and `class` lands on the preview box
rather than on the dialog.

## Interactions

- Click the preview to open the viewer, fitted to the window.
- Wheel or pinch to zoom around the pointer.
- Drag anywhere to pan. Nothing inside the viewer takes a press of its own, so
  the grab cursor never promises a pan that will not happen.
- Arrow keys move the content, `Ctrl` with up or down zooms, `+` and `-` zoom,
  `0` resets.
- Escape, the backdrop, or the close button exits.

The enlarged copy is mounted only while the dialog is open, and the plate lays
content out at its natural size, so content that fits itself to the preview box
must lift that cap in its zoomed copy.
