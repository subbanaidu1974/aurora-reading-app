# Aurora Reading App — Copilot Instructions

## Project Overview
- This is an Angular 20+ application scaffolded for reading support and study organization tools.
- Major features are organized under `src/app/` as Angular components and services. Key areas:
  - **Landing, About, Login, Signup, Settings, User Profile**: Top-level user flows
  - **Tools**: Reading support, study organization, writing assistance, and accessibility tools
  - **Services**: Auth, font settings, login overlay, tasks, user registry

## Architecture & Patterns
- **Component Structure**: Each feature/tool is a self-contained Angular component (HTML, CSS/SCSS, TS) under its own folder.
- **Service Layer**: Shared logic (auth, tasks, font settings) is in `src/app/services/` and injected via Angular DI.
- **Routing**: Navigation is handled by Angular Router (see `app.module.ts` for route config).
- **Assets**: Images/icons are in `src/assets/`.
- **Types**: Custom TypeScript types (e.g., for PDF.js) are in `src/types/`.

## Developer Workflows
- **Install**: `npm install`
- **Run/Dev**: `npm start` or `ng serve` (default port 4200)
- **Build**: `ng build`
- **Lint**: `ng lint`
- **Test**: No test setup detected; add tests in `src/app/` as needed.
- **Style**: Use SCSS for new stylesheets when possible; legacy CSS is present in some components.

## Conventions & Patterns
- **Component Naming**: Use kebab-case for folders, PascalCase for TypeScript classes.
- **Service Usage**: Inject services via constructor; do not instantiate directly.
- **Feature Organization**: Place new tools/features in their respective subfolders under `src/app/tools/`.
- **Cross-Component Communication**: Use Angular services for shared state and events.
- **Experimental Angular**: If dependency issues arise, downgrade Angular version in `package.json`.

## Integration Points
- **PDF.js**: Type definitions in `src/types/pdfjs.d.ts` (for future PDF features).
- **Assets**: Reference images/icons from `src/assets/images/` and `src/assets/icons/`.

## Examples
- To add a new study tool: Create a folder under `src/app/tools/study-organization-tools/`, add `.component.ts`, `.component.html`, and `.component.scss` files, and register in the module.
- To add a service: Place in `src/app/services/`, use Angular `@Injectable`, and provide in `app.module.ts`.

## Key Files
- `src/app/app.module.ts`: Main module, routing, service providers
- `src/app/services/`: Shared logic/services
- `src/app/tools/`: Feature/tool components
- `src/assets/`: Images and icons
- `README.md`: Basic setup and run instructions

---
_If any conventions or workflows are unclear, please ask for clarification or provide feedback to improve these instructions._
