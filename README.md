# Weblix Platform

Weblix Platform is a Next.js application for managing business data and generating customizable business websites.

## Architecture

- `apps/web` contains the primary Next.js application and all UI logic.
- `apps/api` remains intentionally untouched as a placeholder for future backend work.
- The app uses App Router, TypeScript, and Tailwind CSS for a simple, maintainable foundation.

## Local setup

```bash
cd apps/web
npm install
npm run dev
```

Open http://localhost:3000 in a browser.

## Available scripts

```bash
npm run dev
npm run lint
npm run typecheck
npm run test
npm run build
```

## Current status

This repository is in the early bootstrap stage. It includes the project foundation, a minimal landing page, automated checks, and CI for pull requests and pushes to `main`.
