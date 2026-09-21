# Animotion Template

This is an Animotion presentation.

## Setup

Install dependencies:

```sh
just install
```

Run the development server at http://localhost:5173/:

```sh
just dev
```

Check and build the presentation:

```sh
just ci
```

## Design

Colour, type, layout and the rules a slide is built to are in the
[design reference](docs/design.md). The flavour a deck is presented in is named
in `src/lib/theme.ts`.

## Components

Reusable presentation components live in `src/lib/components` and are exported
from `$lib`. See the [component reference](docs/components/README.md) for usage
and API details.
