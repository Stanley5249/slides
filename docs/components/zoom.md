# Zoom

`Zoom` shows any content as a preview on the slide and opens it in a modal pan-and-zoom viewer. It never
inspects what it is given, so a diagram, an image, or a plain block all work the same way.

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

- Hover the preview to see the zoom-in cursor. Click anywhere on it to open the viewer.
- The viewer opens fitted to the window, up to 200%.
- Use the mouse wheel to zoom from 10% to 400% around the pointer.
- Drag with the left mouse button to pan, from the content as well as from blank canvas. A press that
  lands on a button, link, or field is left alone, so controls inside the plate keep working.
- Use the `−`, percentage, and `+` controls to zoom or reset the view.
- With the viewer focused, arrow keys pan, `+` and `-` zoom, and `0` resets.
- Press Escape, click the translucent background, or use the close button to exit.

The component stops pointer and keyboard events at the open dialog so Reveal.js does not change slides while
the content is being inspected.

## Content contract

The trigger is a transparent button layered over the preview rather than a wrapper around it, so preview
content may contain its own buttons and links without nesting interactive elements.

The enlarged copy is mounted only while the dialog is open, so a preview nobody opens costs nothing.

The camera is the only thing that scales in the viewer, so the plate measures the content at its natural
layout size. Content that fits itself to the preview box should express that cap through two inherited
custom properties, which the plate sets to `none`:

```css
.thing {
	max-width: var(--zoom-max-width, 100%);
	max-height: var(--zoom-max-height, 24rem);
}
```

Custom properties rather than a descendant rule in `Zoom`, because they inherit instead of competing on
specificity with the content component's own scoped styles.

## Accessibility

The trigger carries `label` as its accessible name. The viewport is a focusable `application` region with a
label naming its keys, since it is a real pan-and-zoom surface rather than decoration. `user-select` is
suppressed only while a drag is in progress, so text inside the plate stays selectable.
