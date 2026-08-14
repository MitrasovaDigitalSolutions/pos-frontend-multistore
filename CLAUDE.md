# POS Frontend Agent Guidance & Enterprise Architecture Guidelines

## Core Principles & Engineering Standards

### 1. Package Manager & Runtime Standard
- **ALWAYS use `bun`** as the default package manager and runtime runner for all commands.
  - Development: `bun dev`
  - Build: `bun run build`
  - Linting: `bun run lint`
  - Seeding: `bun run seed`
  - Type Checking: `bun x tsc --noEmit`
  - Executing CLI tools: `bun x <tool>`
  - Package Management: `bun add <package>` / `bun add -d <package>`

### 2. SOLID & DRY Principles
- **Single Responsibility Principle (SRP)**: Each file, hook, or component MUST have a single, clearly defined function.
- **Open/Closed Principle (OCP)**: Build flexible, extensible components using props composition and reusable wrappers.
- **Liskov Substitution & Interface Segregation (LSP & ISP)**: Define small, specific, and type-safe interfaces/props. Avoid bloated multi-purpose props.
- **Dependency Inversion Principle (DIP)**: Decouple UI logic from data fetching using custom React Query hooks and Zustand stores.
- **Don't Repeat Yourself (DRY)**: Re-use shared UI primitives (`src/components/ui`, `src/components/shared`), design system tokens, and utility functions instead of duplicating code.

### 3. Anti-God Component Policy & Feature Decomposition
- **STRICTLY NO GOD COMPONENTS**: Do NOT write monolithic, multi-hundred-line components.
- Break down complex views into focused, modular sub-components.
- Extract complex component logic (form handlers, calculations, state orchestration) into dedicated custom hooks (`hooks/use-*.ts`).
- Keep UI components clean, readable, and presentation-focused.

### 4. Folder Structure & Feature Organization
Follow a strict feature-based architecture under `src/features/<feature_name>/`:
- `api/`: API client calls, React Query queries, and mutations (`<feature>-api.ts`).
- `components/`: Single-responsibility UI sub-components.
- `hooks/`: Feature-specific state and logic hooks (`use-<feature>.ts`).
- `schemas/`: Zod validation schemas (`<feature>-schema.ts`).
- `types/`: Dedicated TypeScript type definition files (`<feature>.d.ts` or `types/index.ts`).
- `constants/`: Feature-specific constants and configuration settings (`<feature>-constants.ts` or `constants/index.ts`).

### 5. Type Safety & Constants Standard
- Maintain strict TypeScript type safety. **`any` is strictly prohibited**.
- Always define explicit types in dedicated `.d.ts` or `types/index.ts` files.
- Move magic numbers, status strings, and configuration values to dedicated `constants/` files.

### 6. Enterprise Long-Term Quality & Bug Prevention
- Write code designed for enterprise-scale maintainability, performance, and long-term durability.
- Include proper error boundaries, loading states, toasts, and fallback states for all async interactions.
- Always run `bun x tsc --noEmit` and `bun run lint` to verify code correctness before completion.

### 7. Clean Code & React Compiler Standards
- **Zero Unused Variables/Imports**: Clean up all unused variables, parameters, and imports (`@typescript-eslint/no-unused-vars`). Do NOT declare variables or imports that are never read.
- **No Synchronous `setState` Inside `useEffect`**: Strictly avoid calling `setState` or `dispatch` synchronously inside `useEffect` bodies (`react-hooks/set-state-in-effect`). Derive state during render, use key-based resets, or handle state updates in event handlers/callbacks.

### 8. Mobile-First & Responsive UI/UX Standards
- **Mandatory Mobile Responsiveness**: All UI pages, components, dialogs, charts, and tables MUST be 100% responsive and ergonomic across mobile (<640px), tablet (640-1024px), and desktop (>1024px).
- **Dynamic Viewport Height (`100dvh`)**: Use `h-[100dvh]` and `max-h-[100dvh]` on full-screen containers instead of raw `100vh` to prevent bottom content clipping under mobile browser URL/navigation toolbars.
- **Bottom Scroll Clearance**: Preserve generous bottom padding (`pb-28 sm:pb-8`) on scrollable main views so bottom-most cards, submit buttons, and statistics are never obstructed by mobile browser chrome or device gesture bars.
- **Horizontal Overflow Protection**: Always wrap wide tables, charts, matrix grids, and data rows with `overflow-x-auto` to prevent horizontal page blowout on mobile screens.
- **Adaptive Stacking**: Use `flex-col sm:flex-row`, `w-full sm:w-auto`, and responsive grids (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-...`) for toolbars, headers, filter forms, button groups, and KPI tiles.
- **Touch-Friendly Hit Targets**: Ensure all buttons, selectors, tabs, and interactive controls have comfortable touch dimensions (minimum height 36px–44px) on mobile viewports.
