# Shot

`Shot` puts a picture on a slide, hands it to [Zoom](zoom.md) for the full view,
and draws a labelled slot in its place when the file is not there.

## Usage

```svelte
<script lang="ts">
  import { Shot } from "$lib";
</script>

<Shot
  src="/profiler.png"
  alt="The profiler with the hot path selected"
  caption="Two thirds of the run is in one kernel."
/>
```

Give `height` when the picture should be sized rather than fill its column. The
width follows the picture, so a capped screenshot leaves no empty box beside
itself:

```svelte
<Shot src="/latency.png" alt="Latency over time" height="18rem" />
```

## Properties

The `Props` type in the component carries the signature. Two things it does not
say: `alt` is also the label the viewer is opened with, and `src` takes a URL as
well as a path, though a real deck keeps its pictures in `static/` where they
need no build step.

## The missing state

An `onerror` on the picture swaps it for a dashed slot holding the alt text and
the path that was looked for. The slot fills the width it is given at 16:9, or
the `height` when one is set, so the slide keeps the layout the picture will
have. A screenshot that has not been taken yet is the state a deck spends most
of its drafting life in, and it has to be visible from the back row rather than
a gap nobody notices. The deck still builds.

## Accessibility

`alt` is required, because a picture with nothing to say for itself is either
decoration, which this template does not put on a slide, or evidence that a
screen reader cannot reach. The caption is a `figcaption` and reads as part of
the figure, so it says what the picture shows rather than repeating the alt.
