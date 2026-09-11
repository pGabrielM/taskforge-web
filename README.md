# Taskforge Web

![CI](https://github.com/pGabrielM/taskforge-web/actions/workflows/ci.yml/badge.svg)
![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square)
![Auth.js](https://img.shields.io/badge/Auth.js-NextAuth-purple?style=flat-square)

Modern task workspace for [Taskforge API](https://github.com/pGabrielM/taskforge-api): a
community task feed for visitors, and a private task list for signed-in users — built as a
Next.js App Router client with Auth.js and shadcn/ui.

## Architecture

The client never talks to the Laravel API directly from the browser. Instead:

```
Browser → Next.js Route Handler (src/app/api/**) → getToken() → Taskforge API
```

- **`/api/auth/[...nextauth]`**: Auth.js credentials provider that logs in against Taskforge
  API and stores its Sanctum token inside the Next.js session (JWT strategy).
- **`/api/task`**, **`/api/user/task`**, **`/api/user/task/[id]`**: server-side route handlers
  that read the session token with `getToken()` and forward the request to the Laravel API with
  the `Authorization` header attached — the token never reaches client-side JavaScript.
- **`middleware.ts`** guards the authenticated routes at the edge before a page even renders.
- UI is composed from [shadcn/ui](https://ui.shadcn.com) primitives (`src/components/ui`) on top
  of Radix + Tailwind, with `react-hook-form` for the task/auth forms.

## Running locally

```bash
cp .env.local.example .env.local   # NEXTAUTH_SECRET, NEXT_PUBLIC_API_URL -> your taskforge-api
npm install
npm run dev
```

Requires a running [Taskforge API](https://github.com/pGabrielM/taskforge-api) instance at
`NEXT_PUBLIC_API_URL`.

## CI

Every push/PR to `main` lints and builds the app via
[GitHub Actions](.github/workflows/ci.yml).

## Stack

Next.js 14 (App Router), TypeScript, Auth.js (NextAuth), Tailwind CSS, shadcn/ui,
react-hook-form.
