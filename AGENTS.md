<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

# POS Frontend agent guidance

## Project shape

- This repository is a Next.js 16 App Router project for a POS system.
- Application code lives primarily under src/app, src/components, src/features, src/lib, src/providers, and src/stores.
- Use the @/\* path alias for imports and keep new code aligned with the existing feature-based structure.

## Conventions to follow

- Prefer server components by default; add "use client" only when interactivity, hooks, or browser APIs are required.
- Keep route-specific UI under the appropriate route group in src/app/(auth) or src/app/(protected).
- Reuse shared primitives from src/components/ui and src/components/shared instead of creating one-off UI patterns.
- Use React Query for server-backed data and Zustand stores for local client state such as cart and checkout flows.
- Follow strict TypeScript and existing lint rules; avoid introducing explicit any unless there is a clear, temporary reason.

## Common commands

- npm run dev
- npm run build
- npm run lint
- npm run seed

## When making changes

- Check [README.md](README.md) and the docs under [docs](docs) for product-specific behavior before assuming patterns.
- Favor small, focused changes that fit the existing architecture and reuse current hooks, utilities, and components.
- If a change affects auth, route access, or shared UI, inspect the related provider or layout files first.
