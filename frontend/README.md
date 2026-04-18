# Frontend - Kidney Stone AI Analyzer

React + TypeScript frontend with Vite, Tailwind CSS, and shadcn/ui components.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Start development server:

```bash
npm run dev
```

The app will be available at `http://localhost:8080`

## API Configuration

By default, the app calls `http://localhost:5000` for predictions.

To override this value, create `frontend/.env.local` with:

```bash
VITE_API_BASE_URL=http://localhost:5000
```

## Build

```bash
npm run build
```

## Project Structure

- `src/components/` - Reusable React components
- `src/pages/` - Page components
- `src/App.tsx` - Main app component with routing
- `src/main.tsx` - Entry point
