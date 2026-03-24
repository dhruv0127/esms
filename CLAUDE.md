# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server at http://localhost:3000
npm run dev:remote   # Start dev server proxying to remote backend (requires VITE_BACKEND_SERVER in .env)
npm run build        # Production build
npm run preview      # Preview production build
npm run lint         # ESLint (zero warnings allowed)
```

## Environment Setup

Create a `.env` file (see `temp.env` for template):
```
VITE_BACKEND_SERVER=http://your_backend_url.com/
```

- Local dev defaults backend to `http://localhost:8888/`
- `npm run dev:remote` uses `VITE_BACKEND_SERVER` from `.env` to proxy `/api` requests

## Architecture

This is a React 18 + Vite SPA (Kreddo ERP/CRM frontend). The `@` alias maps to `src/`.

### App Boot Flow

`main.jsx` → `RootApp.jsx` (Redux Provider + BrowserRouter) → `KreddoOs.jsx` (auth gate) → either `AuthRouter` (unauthenticated) or `ErpApp.jsx` (authenticated).

`ErpApp.jsx` fetches settings on mount, then renders the `Navigation` sidebar + `HeaderContent` + `AppRouter`. Routes are defined in `src/router/routes.jsx` and are all lazily loaded.

### State Management

Redux store (`src/redux/`) has five slices combined in `rootReducer.js`:
- `auth` — login state, persisted to localStorage via `storePersist`
- `crud` — generic CRUD state (list, currentItem, create/update/delete loading/result)
- `erp` — ERP-specific state (invoices, quotes, etc.)
- `adavancedCrud` — advanced CRUD variant
- `settings` — app-wide settings loaded from backend on startup

Auth state is rehydrated from localStorage on store init (see `store.js`).

### API / Request Layer

`src/request/request.js` is a centralized Axios wrapper. All methods inject the Bearer token from persisted auth state before each call. Standard methods: `list`, `listAll`, `create`, `read`, `update`, `delete`, `search`, `filter`, `summary`, `mail`, `convert`, `upload`.

`src/config/serverApiConfig.js` controls base URLs — switches between localhost and `VITE_BACKEND_SERVER` based on `import.meta.env.PROD` or `VITE_DEV_REMOTE`.

### CRUD Pattern

Most entity pages follow a standard pattern using `CrudModule` (`src/modules/CrudModule/`):
- A `config` object defines entity name, labels, columns, deleteModalLabels
- `createForm` / `updateForm` JSX elements are passed as props
- `CrudModule` renders a split layout: DataTable on the left, side panel (create/read/update forms) on the right
- The `crud` redux actions handle all API calls generically by `entity` name string

### ERP Panel Pattern

More complex pages (Invoice, Quote, Purchase, ReturnExchange) use `ErpPanelModule` (`src/modules/ErpPanelModule/`) which follows a separate read/create/update page structure rather than the inline side-panel approach.

### Contexts

- `AppContextProvider` (`src/context/appContext`) — tracks current active app/navigation state
- `CrudContextProvider` (`src/context/crud`) — manages open/close state of create/read/edit panels within a CrudModule page
- `ProfileContextProvider` (`src/context/profileContext`) — profile-specific state

### Localization

`src/locale/useLanguage` hook provides a `translate(key)` function. Language files are in `src/locale/translation/`.
