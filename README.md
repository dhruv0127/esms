# Kreddo Frontend

Modern React-based frontend for the Kreddo ERP/CRM system.

## Tech Stack

- React 18
- Vite (build tool)
- Redux Toolkit (state management)
- Ant Design (UI components)
- React Router DOM (routing)
- Axios (HTTP client)

## Getting Started

### Prerequisites
- Node.js v20.9.0
- npm v10.2.4

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Environment Variables

Create a `.env` file in the frontend directory:

```
VITE_BACKEND_SERVER=http://localhost:8888/api
```

## Project Structure

```
src/
├── apps/            # Main application components
├── auth/            # Authentication services
├── components/      # Reusable components
├── context/         # React context providers
├── forms/           # Form components
├── locale/          # Internationalization
├── modules/         # Feature modules
├── pages/           # Page components
├── redux/           # Redux store and slices
├── router/          # Routing configuration
├── settings/        # App settings
└── style/           # Global styles
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
