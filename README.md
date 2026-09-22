# Animotion Template

This is an Animotion presentation.

## Setup

Install dependencies:

```sh
just install
```

Run the development server, at the URL Vite prints:

```sh
just dev
```

Check and build the presentation:

```sh
just ci
```

`just` on its own lists every recipe.

## Design

Color, type, layout and the rules a slide is built to are in the
[design reference](docs/design.md). The flavor a deck is presented in is named
in `src/lib/theme.ts`.

## Components

See the [component reference](docs/components/README.md).
