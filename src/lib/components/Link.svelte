<script lang="ts">
  import type { Icon as LucideIcon } from "lucide-svelte";
  import type { Component, Snippet } from "svelte";

  type IconProps = { size?: number | string };

  type Props = {
    href: string;
    /** A Lucide icon or GitHubMark, drawn before the label at the text's size.
     * lucide-svelte still ships class components, so both kinds are taken. */
    icon?: Component<IconProps> | typeof LucideIcon;
    children: Snippet;
  };

  let { href, icon: Icon, children }: Props = $props();

  // A link on a slide is followed in another tab, so the deck stays where the
  // presenter left it.
  const external = $derived(/^https?:/.test(href));
</script>

<!-- The caller owns the address. An in-deck path is resolved where it is
     written, so Link passes the string through untouched. -->
<!-- eslint-disable svelte/no-navigation-without-resolve -->
<a
  class="link"
  class:bare={!Icon}
  {href}
  target={external ? "_blank" : undefined}
  rel={external ? "noreferrer" : undefined}
>
  {#if Icon}<Icon size="1em" />{/if}<span>{@render children()}</span>
</a>

<!-- eslint-enable svelte/no-navigation-without-resolve -->

<style>
  /* The words stay in ink and the icon carries the color, so a link reads as
     text first and names its destination by its mark. The selector repeats
     the deck's so it outweighs the link color overrides.css gives every
     link. */
  :global(.reveal .slides) a.link {
    display: inline-flex;
    gap: 0.35em;
    align-items: center;
    color: var(--deck-ink);
    text-decoration: none;
  }

  .link :global(svg) {
    flex: none;
    color: var(--deck-icon);
  }

  /* Without an icon nothing else marks the link, so the underline stays. */
  .bare span,
  .link:hover span,
  .link:focus-visible span {
    text-decoration: underline;
    text-decoration-color: var(--deck-link);
    text-decoration-thickness: 2px;
    text-underline-offset: 0.2em;
  }

  .link:focus-visible {
    outline: var(--deck-focus-ring) solid var(--deck-focus);
    outline-offset: 2px;
  }
</style>
