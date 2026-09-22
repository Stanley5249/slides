# Presentation template instructions

## Commands

- Use Bun exclusively for package commands, project commands, and package
  management.
- Manage dependencies with `bun add` and `bun remove`. Keep `package.json` free
  of `scripts`.
- Define standard commands in the root `justfile`. Use `just` recipes and run
  project binaries with `bun run <binary>`.
- Get the user's approval before using CDP or other automation tools. After
  approval, use
  `bunx chrome-devtools --no-usage-statistics --no-performance-crux` for CDP.
- When browser automation is approved for a visual or interaction change,
  capture a targeted screenshot after the relevant interaction.

## Presentation

- Keep Animotion and Reveal.js presentation mechanics, including their
  navigation, presenter, animation, and slide-runtime abstractions.
- Use Svelte 5 components and runes for reactive and interactive content, with
  Tailwind and Catppuccin tokens for styling.
- Keep `main` template-only. Put presentation content on local
  `deck/<group>/<name>` branches and keep those branches local.

## Dependencies

- Choose `svelte-adapter-bun` over `@sveltejs/adapter-bun` for the standalone
  Bun server.
- Prefer Bits UI for accessible interactive primitives and `lucide-svelte` for
  interface icons.

## Convention

- Follow the existing design system.
- Omit redundant defaults.
- Write documentation, comments, and UI copy in American English.
