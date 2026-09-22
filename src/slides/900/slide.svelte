<h2>Shared decisions make the next slide easier</h2>

<div class="row">
  <table>
    <thead>
      <tr>
        <th>File</th>
        <th>Shared responsibility</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><code>src/lib/theme.ts</code></td>
        <td>Selects the deck’s Catppuccin flavor.</td>
      </tr>
      <tr>
        <td><code>src/styles/theme.css</code></td>
        <td>Maps semantic color roles to that flavor.</td>
      </tr>
      <tr>
        <td><code>src/styles/overrides.css</code></td>
        <td>Defines the stage, type scale, tables, and columns.</td>
      </tr>
    </tbody>
  </table>

  <p>
    Change a shared decision once instead of correcting every slide. Before
    presenting, run <code>just ci</code> and review the deck at projection size.
    The rationale lives in <code>docs/design.md</code>.
  </p>
</div>
