<h2>Three files decide how a deck looks</h2>

<div class="row">
  <table>
    <thead>
      <tr>
        <th>File</th>
        <th>What it decides</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><code>src/lib/theme.ts</code></td>
        <td>The flavor this deck is presented in. Latte by default.</td>
      </tr>
      <tr>
        <td><code>src/styles/theme.css</code></td>
        <td>What each color role is for, in that flavor.</td>
      </tr>
      <tr>
        <td><code>src/styles/overrides.css</code></td>
        <td>The slide surface: frame, type, tables, columns.</td>
      </tr>
    </tbody>
  </table>

  <p>
    The reasoning behind all three is in <code>docs/design.md</code>, and the
    mechanics are the
    <a href="https://animotion.pages.dev/docs">Animotion documentation</a>.
  </p>
</div>
