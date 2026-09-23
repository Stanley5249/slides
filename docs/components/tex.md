# Tex

`Tex` sets TeX source as math with KaTeX. It renders on the server too, so a
prerendered deck carries its formulas, and the fonts ship in the bundle rather
than from a CDN that a venue's network may block.

## Usage

```svelte
<script lang="ts">
  import { Tex } from "$lib";
</script>

<Tex display tex={String.raw`e^{i\pi} + 1 = 0`} />

<p>The ratio <Tex tex="W / H" /> sets the aspect.</p>
```

`String.raw` keeps TeX's backslashes from being read as escapes.

## Properties

The `Props` type in the component carries the signature. Without `display`, the
formula runs inline with the text around it.

## Appearance

A display formula takes the heading size and starts on the content edge like
every other block. Inline math is set slightly larger than the body so its
capitals match the body face's.

## Errors

A formula that does not parse shows its source in the error role, where it would
have been, instead of throwing and blanking the slide.
