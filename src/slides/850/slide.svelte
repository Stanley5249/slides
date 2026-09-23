<script lang="ts">
  import { Tex } from "$lib";
</script>

<h2>Set math the way a paper would</h2>

<div class="row">
  <Tex
    display
    tex={String.raw`s = \min\left(\frac{W}{1280},\ \frac{H}{720}\right)`}
  />

  <p>
    Reveal scales the stage by <Tex tex="s" />, where <Tex tex="W" /> and
    <Tex tex="H" /> are the room the window leaves after its margin. The smaller ratio
    wins, so the whole slide always fits.
  </p>
</div>
