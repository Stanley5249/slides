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
prod *args: build
    bun run build/index.js {{ args }}

# Format every source file, this justfile included
[parallel]
fmt: _fmt-oxfmt _fmt-just

# Format, then apply the linters' automatic fixes
fix: fmt (lint "--fix")

_fmt-oxfmt *args:
    bun run oxfmt {{ args }}

_fmt-just *args:
    just --fmt {{ args }}

# Check that every embedded site allows a frame
check-embeds *args: build
    bun run scripts/check-embeds.ts {{ args }}

# Check that slide styles take the shared layout values
lint-styles *args:
    bun run stylelint "src/**/slides/**/*.{svelte,css}" {{ args }}

# Synchronize generated SvelteKit types
_sync:
    bun run svelte-kit sync

# Check types and Svelte diagnostics
typecheck *args: _sync
    bun run svelte-check --incremental {{ args }}

# Report bugs and smells, warnings included
lint *args: _sync
    bun run eslint --cache --cache-strategy content --cache-location .svelte-kit/eslint/ --max-warnings 0 {{ args }}

# The fast local gate, format checks included
[parallel]
check: (_fmt-oxfmt "--check") (_fmt-just "--check") typecheck lint lint-styles

# Remove build output
[confirm("Delete build/ and .svelte-kit/?")]
[windows]
clean:
    Remove-Item -Recurse -Force -ErrorAction Ignore build, .svelte-kit

# Install exactly what the lockfile records, and fail if it disagrees
lock-check *args:
    bun install --frozen-lockfile --silent {{ args }}

# The gate a change has to pass
ci: lock-check check check-embeds
