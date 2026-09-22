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

# Check types and Svelte diagnostics
typecheck:
    bun run svelte-kit sync
    bun run svelte-check

# Report bugs and smells, warnings included
lint:
    bun run eslint --max-warnings 0

# The fast local gate
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

# The gate a change has to pass
ci: fmt-check check build
