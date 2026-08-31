# Installation

> Local modification: this project runs Chrome DevTools through Bunx, not a global npm installation.

No global installation is needed. Bunx downloads and caches the package as needed.

```sh
bunx chrome-devtools --help
```

Start the service once per browser session with telemetry and CrUX requests disabled:

```sh
bunx chrome-devtools start --no-usage-statistics --no-performance-crux
```

Then invoke commands through the same Bunx prefix, for example:

```sh
bunx chrome-devtools list_pages
```

## Troubleshooting

- **Bunx download error:** retry the command after confirming Bun can access the package registry.
- **Old service running:** use `bunx chrome-devtools stop`, then run the start command again.
