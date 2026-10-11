# Salary Management Frontend

This is the React + TypeScript frontend for the Salary Management System.

## Purpose

The application provides a user-friendly HR dashboard and employee management interface for browsing, filtering, and updating salary records.

## Stack

- React 19
- TypeScript
- Vite
- React Router

## Local Setup

```bash
cd web
npm install
npm run dev
```

The app runs at http://localhost:5173 by default.

## API Configuration

The frontend uses the `VITE_API_BASE` environment variable to connect to the Rails backend.

```env
VITE_API_BASE=http://localhost:3000
```

If the backend is running elsewhere, update this value before starting the app.

## Available Scripts

```bash
npm run dev
npm run build
npm run lint
npm run preview
```

## Notes

- The app expects the Rails API to be available on the configured base URL.
- Export URLs are generated dynamically from the active filters.
