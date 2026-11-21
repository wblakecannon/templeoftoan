# Contributing

Temple of Toan is a small, curated publication. Contributions are
welcome in two different forms depending on whether you're contributing
a sermon or contributing code.

## Contributing a relic, rig, sermon, or disciple profile

Editorial contributions do not happen through this repository. Once the
public submission form is live (Phase 5), you'll be able to submit
directly through the site at `/submit`. Every submission is reviewed
privately before anything is published — nothing goes live
automatically.

Until the submission form ships, do not open GitHub issues or pull
requests with story pitches or photographs.

## Contributing code

This is primarily a personal editorial project, but small, focused pull
requests are welcome — bug fixes, accessibility improvements, and
performance fixes in particular.

Before opening a pull request:

```bash
pnpm install
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

All of the above must pass. Keep pull requests narrowly scoped to one
change. Do not introduce new dependencies, a CMS, a database, or
authentication without discussing it first — see the project's
architectural principles in `README.md`.

## Code style

Formatting is enforced with Prettier and linting with ESLint:

```bash
pnpm format
pnpm lint
```
