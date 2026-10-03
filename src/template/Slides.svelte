<script lang="ts">
  import { Slide } from "@animotion/core";
  import type { Component, ComponentProps } from "svelte";

  // Animotion's file loader is fixed to src/slides. Keep its Slide runtime
  // for examples too, without placing template files in the deck's namespace.
  const slides = Object.entries(
    import.meta.glob<{
      default: Component;
      component?: Component;
      props?: ComponentProps<typeof Slide>;
    }>("/src/template/slides/*/slide.svelte", { eager: true }),
  ).sort(
    ([a], [b]) => Number(a.split("/").at(-2)) - Number(b.split("/").at(-2)),
  );
</script>

{#each slides as [path, slide] (path)}
  {@const Wrapper = slide.component ?? Slide}
  <Wrapper {...slide.props}>
    <slide.default />
  </Wrapper>
{/each}
