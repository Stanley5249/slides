# Presentation template developer commands.

[windows]
set shell := ["pwsh", "-NoLogo", "-NoProfile", "-Command"]

set default-list

# Install dependencies
install *args:
    bun install {{ args }}

# Run the development server
dev *args:
    bun run vite dev {{ args }}

# Build the presentation
build *args:
    bun run vite build {{ args }}

# Serve the built presentation
prod: build
    bun run build/index.js

# Format every source file, this justfile included
[parallel]
fmt: _fmt-oxfmt _fmt-just

# Verify formatting, this justfile included
[parallel]
fmt-check: (_fmt-oxfmt "--check") (_fmt-just "--check")

_fmt-oxfmt *args:
    bun run oxfmt {{ args }}

_fmt-just *args:
    just --fmt {{ args }}

# Check that every embedded site allows a frame
embeds: build
    bun run scripts/check-embeds.ts

# Synchronize generated SvelteKit types
_sync:
    bun run svelte-kit sync

# Check types and Svelte diagnostics
typecheck *args: _sync
    bun run svelte-check --incremental {{ args }}

# Report bugs and smells, warnings included
lint *args: _sync
    bun run eslint --cache --cache-strategy content --cache-location .svelte-kit/eslint/ --max-warnings 0 {{ args }}

# The fast local gate
[parallel]
check: typecheck lint

# Remove build output
[confirm("Delete build/ and .svelte-kit/?")]
[windows]
clean:
    Remove-Item -Recurse -Force -ErrorAction Ignore build, .svelte-kit

# Install exactly what the lockfile records, and fail if it disagrees
lock-check:
    bun install --frozen-lockfile --silent

# Run independent CI checks concurrently
[parallel]
_ci-check: fmt-check typecheck lint

# `embeds` depends on `build` as well, and just runs a recipe once per call.
# The gate a change has to pass
ci: lock-check _ci-check build embeds
