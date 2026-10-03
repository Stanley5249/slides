# Slides

A template for building [Reveal.js](https://revealjs.com/) presentations with
[Animotion](https://animotion.pages.dev/) and [Svelte 5](https://svelte.dev/).

## Requirements

Install [Bun](https://bun.sh/) as the project runtime.

Optionally install [`just`](https://github.com/casey/just) to use the command
recipes below.

## Quickstart

```sh
# Install dependencies.
just install

# Start the development server.
just dev
```

See the [`justfile`](justfile) for more commands.

Template examples live in `src/template/slides/`. On a local
`deck/<group>/<name>` branch, add numbered `src/slides/<number>/slide.svelte`
files, export `title` from `src/slides/deck.ts`, and set `source` to `"deck"` in
`src/lib/deck.ts`. Keep the examples intact; `"template"` selects them. Keep
shared components, styles, and routes on `main`. To update a deck, rebase its
branch on `main`, then run `just ci`.

## Reference

- [Design guidance](docs/design.md)
- [Component reference](docs/components/README.md)
