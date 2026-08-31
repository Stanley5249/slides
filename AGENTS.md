# Presentation template instructions

## Runtime and package management

- Use Bun for every package and project command: `bun`, `bunx`, and `bun --bun run`.
- Do not run `node`, `npm`, `npx`, or `yarn`.
- Use `bun add` and `bun remove` to change dependencies.
- Keep the project free of a Node runtime requirement. Compatibility type packages may remain when SvelteKit tooling requires them.
- Do not add a `scripts` field to `package.json`. Define project commands in the root `justfile` and run JavaScript tool files with `bun --bun run`.

## Presentation architecture

- Use Animotion and Reveal.js for presentation mechanics. Do not create replacement navigation, presenter, animation, or slide-runtime abstractions.
- Use Svelte 5 components and runes for reactive and interactive slide content.
- Use Tailwind and the Catppuccin Macchiato tokens for presentation styling.
- Keep `main` template-only. Real presentation content belongs on `deck/<name>` or `deck/<group>/<name>` branches.

## Preferred libraries

- Prefer Bits UI for accessible interactive primitives before creating custom controls.
- Use `lucide-svelte` for interface icons instead of hand-drawn SVGs, Unicode symbols, or text glyphs.
- Prefer TanStack Table for tabular interactions, Plotly.js for charts, and Papa Parse for CSV fixtures before creating equivalents.
- Add those libraries only in the validation phase that needs them.
- Use `svelte-adapter-bun` for the standalone Bun server because it supports this SvelteKit 2 template. Do not install it alongside `@sveltejs/adapter-bun`.

## Workflow

- Use `just` recipes for standard commands.
- Run `just lint`, `just check`, and `just build` before committing.
- Keep commits small, conventional, and independently reviewable.
