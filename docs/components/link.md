# Link

`Link` sets a link with an optional icon before its label. The label stays in
ink and the icon carries the link color, so the link reads as text first. With
an icon, the label gains an underline only on hover or keyboard focus, because
the icon already marks it. Without one, nothing else marks the link, so the
underline stays. A web address opens in another tab, so the deck stays on the
slide the presenter was showing.

## Usage

```svelte
<script lang="ts">
  import { GitHubMark, Link } from "$lib";
  import BookOpen from "lucide-svelte/icons/book-open";
</script>

<Link href="https://github.com/Stanley5249/slides" icon={GitHubMark}>
  Stanley5249/slides
</Link>

<Link href="https://animotion.pages.dev/docs" icon={BookOpen}>Docs</Link>
```

## Writing

Set a link inside the sentence, as the noun it names. Do not introduce it with a
colon or a label such as "Link:", because the icon already says it is a link.

## Properties

The `Props` type in the component carries the signature. `icon` takes any
component with a `size` prop, which covers every Lucide icon and `GitHubMark`.

## Icons

Lucide has no brand icons, so `GitHubMark` draws the GitHub mark from
simple-icons, which is public domain. Add another brand the same way: one
component holding one path.

## Accessibility

The icon is hidden from screen readers, so the label alone names the link.
Keyboard focus draws the deck's focus ring around the whole link.
