# Link

`Link` sets a link with an optional icon before its label. The label carries the
link color and gains an underline only on hover or keyboard focus, because the
color already says it is a link. A web address opens in another tab, so the deck
stays on the slide the presenter was showing.

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
