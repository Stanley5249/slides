# Presentation template developer commands.

[windows]
set shell := ["pwsh", "-NoLogo", "-NoProfile", "-Command"]

set default-list

# Install dependencies
install:
    bun install

# Run the development server
dev:
    bun run vite dev

# Build the presentation
build:
    bun run vite build

# Serve the built presentation
prod: build
    bun run build/index.js

# Format every source file, this justfile included
fmt:
    bun run oxfmt
    just --fmt

# Verify formatting, this justfile included
fmt-check:
    bun run oxfmt --check
    just --fmt --check

# Synchronize generated SvelteKit types
_sync:
    bun run svelte-kit sync

# Check types and Svelte diagnostics
typecheck: _sync
    bun run svelte-check --incremental

# Report bugs and smells, warnings included
lint: _sync
    bun run eslint --cache --cache-strategy content --cache-location .svelte-kit/eslint/ --max-warnings 0

# The fast local gate
[parallel]
check: typecheck lint

# Run the tests
test:
    bun test

# Remove build output
[unix]
clean:
    rm -rf build .svelte-kit

# Remove build output
[windows]
clean:
    Remove-Item -Recurse -Force -ErrorAction Ignore build, .svelte-kit

# Install exactly what the lockfile records, and fail if it disagrees
lock-check:
    bun install --frozen-lockfile

# Run independent CI checks concurrently
[parallel]
_ci-check: fmt-check typecheck lint

# The gate a change has to pass
ci: lock-check _ci-check build
