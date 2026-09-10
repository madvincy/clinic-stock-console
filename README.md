# Clinic Stock Console

A modern React + TypeScript application for managing stock inventory in a clinical setting.

## Setup & Scripts

### Installation

```bash
npm install
```

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start the development server (Vite) |
| `npm run build` | Build the application for production |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint to check code quality |
| `npm run lint:fix` | Fix ESLint issues automatically |
| `npm run format` | Format code with Prettier |
| `npm run format:check` | Check if code is formatted correctly |
| `npm run typecheck` | Run TypeScript type checking |
| `npm run test` | Run tests with Vitest |
| `npm run test:ui` | Run tests with Vitest UI |

### Technology Stack

- **Frontend Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Component Library**: shadcn/ui
- **Routing**: React Router v6
- **State Management**: Redux Toolkit + RTK Query
- **Testing**: Vitest + React Testing Library
- **Code Quality**:
  - ESLint with TypeScript support
  - Prettier for code formatting
  - husky + commitlint for commit message validation
- **CI/CD**: GitHub Actions

### Project Structure

```
src/
├── app/              # Redux store, hooks, and configuration
├── components/       # React components
│   ├── ui/          # shadcn/ui components
│   └── layout/      # Layout components
├── features/        # Redux feature slices (future)
├── lib/             # Utility functions
├── pages/           # Page components for routes
├── tests/           # Test files
├── types/           # TypeScript type definitions
├── router.tsx       # React Router configuration
├── App.tsx          # Root component
└── main.tsx         # Application entry point
```

### Commit Message Convention

This project uses Conventional Commits enforced via commitlint. Commit messages must follow this format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Valid types**: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `ci`, `revert`

Example:
```
feat(auth): add login page

Implemented login form with email and password validation.

Fixes #123
```

---

## Configuration Files

- `.editorconfig` - Editor settings for consistent code style
- `.eslintrc.json` - ESLint configuration
- `.prettierrc` - Prettier formatting rules
- `commitlint.config.js` - Conventional Commits configuration
- `tsconfig.json` - TypeScript compiler options (strict mode enabled)
- `tailwind.config.js` - Tailwind CSS theme customization
- `vitest.config.ts` - Vitest testing configuration
- `.github/workflows/ci.yml` - GitHub Actions CI pipeline

