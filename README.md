# Salary Management System

This repository contains the full-stack Salary Management application for ACME's HR team. It includes a Rails API backend for employee and payroll data and a React + Vite frontend for searching, filtering, editing, and viewing salary records.

## Overview

The application is designed to manage a large employee dataset while keeping the HR workflow simple and fast. The system supports employee listing, advanced filtering, soft-delete and restore flows, dashboard analytics, and export/import operations.

## Tech Stack

- Backend: Ruby on Rails API
- Database: SQLite
- Frontend: React, TypeScript, Vite
- UI routing: React Router
- API pagination/search: Pagy
- Soft delete: Discard gem

## Project Structure

- `salary_api/` — Rails API backend
- `web/` — React frontend application
- `REQUIREMENTS.md` — product requirements and scope

## Features

- Browse and search employees by name and email
- Filter employees by country, department, employment status, and salary range
- Sort employee records and paginate results
- Create, view, update, and soft-delete employees
- Restore soft-deleted employees from the deleted-records list
- Dashboard showing headcount, average salary, median salary, and distribution charts
- CSV export for filtered employee listings
- Seed data generation for large employee sets

## Prerequisites

- Ruby 3.4.8
- Bundler
- Node.js 20+
- npm
- SQLite3 development libraries

## Getting Started

### 1. Start the Rails API

```bash
cd salary_api
bundle install
bin/rails db:prepare
bin/rails server -p 3000
```

The API runs on http://localhost:3000.

### 2. Start the frontend

```bash
cd web
npm install
npm run dev
```

The frontend runs on http://localhost:5173 by default.

The frontend reads the API base URL from `VITE_API_BASE`. In the default setup, this is configured as:

```env
VITE_API_BASE=http://localhost:3000
```

### 3. Seed the database

```bash
cd salary_api
bin/rails db:seed
```

This loads demo employee records and dashboard data.

## Useful Commands

### Backend

```bash
cd salary_api
bin/rails console
bin/rails db:migrate
bin/rails db:seed
bin/rspec
```

### Frontend

```bash
cd web
npm run build
npm run lint
npm run preview
```

## Notes

- Salary values are treated as annual gross compensation.
- Deleted employees are soft-deleted rather than permanently removed.
- The project currently focuses on a single-currency salary model, as described in `REQUIREMENTS.md`.
