<script lang="ts">
  import type { Snippet } from "svelte";
  import "../styles/app.css";

  let { children }: { children: Snippet } = $props();
</script>

<svelte:head>
  <title>Animotion</title>
</svelte:head>

{@render children()}
