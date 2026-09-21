# Presentation template developer commands.

[windows]
set shell := ["pwsh", "-NoLogo", "-NoProfile", "-Command"]

set default-list

# Install dependencies
install:
    bun install

# Run the development server
dev:
    bun --bun run node_modules/vite/bin/vite.js dev

# Build the presentation
build:
    bun --bun run node_modules/vite/bin/vite.js build

# Serve the built presentation
prod: build
    bun --bun run build/index.js

# Format every source file
fmt:
    bun --bun run node_modules/prettier/bin/prettier.cjs --write .

# Verify formatting, this justfile included
fmt-check:
    bun --bun run node_modules/prettier/bin/prettier.cjs --check .
    just --fmt --check

# Check types and Svelte diagnostics
check:
    bun --bun run node_modules/@sveltejs/kit/svelte-kit.js sync
    bun --bun run node_modules/svelte-check/bin/svelte-check --tsconfig ./tsconfig.json --tsgo

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
