# Presentation template developer commands.

[windows]
set shell := ["pwsh", "-NoLogo", "-NoProfile", "-Command"]

set default-list

install:
    bun install

dev:
    bun --bun run node_modules/vite/bin/vite.js dev

format:
    bun --bun run node_modules/prettier/bin/prettier.cjs --write .

lint:
    bun --bun run node_modules/prettier/bin/prettier.cjs --check .

check:
    bun --bun run node_modules/@sveltejs/kit/svelte-kit.js sync
    bun --bun run node_modules/svelte-check/bin/svelte-check --tsconfig ./tsconfig.json --tsgo

test:
    bun test

build:
    bun --bun run node_modules/vite/bin/vite.js build

start:
    bun --bun run build/index.js

clean:
    Remove-Item -Recurse -Force -ErrorAction Ignore build, .svelte-kit

ci: lint check build
