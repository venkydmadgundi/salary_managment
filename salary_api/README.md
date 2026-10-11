# Salary API

This directory contains the Rails API backend for the Salary Management System.

## Purpose

The API exposes employee records, filtering and pagination endpoints, dashboard summaries, and soft-delete restore operations used by the frontend.

## Stack

- Ruby on Rails 8
- SQLite database
- Pagy for pagination
- Discard for soft deletes
- Rack CORS for cross-origin requests

## Local Setup

```bash
cd salary_api
bundle install
bin/rails db:prepare
bin/rails server -p 3000
```

The API runs on http://localhost:3000.

## Database Commands

```bash
bin/rails db:create
bin/rails db:migrate
bin/rails db:seed
```

## Testing

```bash
bin/rspec
```

## Notes

- This app is configured as an API-only Rails application.
- The frontend expects this service to be running on the configured base URL before use.
- Seed data can be used to generate realistic employee records for local development and testing.
