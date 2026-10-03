<script lang="ts">
  import { Notes, Slide } from "@animotion/core";
</script>

<Slide>
  <h2>Start a deck from here</h2>

  <div class="row">
    <ul>
      <li><code>docs/design.md</code> gives each rule and its reason.</li>
      <li>
        <code>docs/components</code> documents Link, Mermaid, Shot, Tex, and Zoom.
      </li>
      <li><code>just ci</code> checks the deck before a talk.</li>
    </ul>

    <p>Press the down arrow for a backup slide.</p>
  </div>
</Slide>

<Slide>
  <h2>Keep backup slides below the closing slide</h2>

  <p>
    A vertical stack holds answers to likely questions. The main path skips it,
    and the down arrow reaches it when someone asks.
  </p>

  <Notes>
    Backup slides are part of the deck but not the talk. Stack them under the
    last slide so the right arrow never lands on one by accident.
  </Notes>
</Slide>
