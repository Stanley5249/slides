<script lang="ts">
  import type { Snippet } from "svelte";
  import { title } from "$lib/deck";
  import "../styles/app.css";

  let { children }: { children: Snippet } = $props();
</script>

<svelte:head>
  <title>{title}</title>
</svelte:head>

{@render children()}
