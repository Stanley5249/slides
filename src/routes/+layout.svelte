<script lang="ts">
  import type { Snippet } from "svelte";
  import { title } from "../slides/deck";
  import "../styles/app.css";

  let { children }: { children: Snippet } = $props();
</script>

<svelte:head>
  <title>{title}</title>
</svelte:head>

{@render children()}
