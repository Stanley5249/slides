<script lang="ts">
  import { onMount, type Snippet } from "svelte";
  import { title } from "$lib/deck";
  import "../styles/app.css";

  let { children }: { children: Snippet } = $props();

  onMount(() => {
    function setLinkTargets() {
      for (const link of document.querySelectorAll<HTMLAnchorElement>(
        ".reveal .slides a[href]:not([target]):not([download])",
      )) {
        const url = new URL(link.href);
        if (
          (url.protocol === "https:" || url.protocol === "http:") &&
          url.origin !== location.origin
        ) {
          link.target = "_blank";
          link.relList.add("noopener");
        }
      }
    }

    // File-based slides and viewers can add links after the layout mounts.
    const observer = new MutationObserver(setLinkTargets);
    observer.observe(document.body, { childList: true, subtree: true });
    setLinkTargets();
    return () => observer.disconnect();
  });
</script>

<svelte:head>
  <title>{title}</title>
</svelte:head>

{@render children()}
