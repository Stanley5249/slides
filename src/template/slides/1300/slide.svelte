<script lang="ts">
  import { Code } from "@animotion/core";
  import { codeTheme } from "$lib/theme";

  // Written apart so the Svelte parser does not end this script at the string.
  const close = "</" + "script>";

  const source = `<script lang="ts" module>
  import { defineProps } from "@animotion/core";

  export const props = defineProps({ class: "statement" });
${close}

<p>Give one sentence the whole slide.</p>
<p>Use a statement for a thesis or a quote.</p>`;
</script>

<h2>Show a block of code</h2>

<div class="row">
  <p>
    The code below is a whole slide: a <code>slide.svelte</code> in a numbered
    folder under
    <code>src/slides</code>. The deck plays them in numeric order, so leave gaps
    for the slides you add later.
  </p>

  <Code
    lang="svelte"
    theme={codeTheme}
    code={source}
    autoIndent={false}
    options={{ containerStyle: false }}
  />
</div>
