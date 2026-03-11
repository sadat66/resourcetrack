# ResourceTrack

Minimal web dev progress tracker: add YouTube videos and links, check them off, find everything in one place.

## Setup

1. **Env** – `.env` already has your MongoDB URL and session secret. For production, set a strong `NEXTAUTH_SECRET`.

2. **Run**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000).

## Features

- **Sign up / Log in** – Email + password (stored hashed in MongoDB).
- **Dashboard** – Add resources (title + URL). YouTube URLs are auto-detected and labeled.
- **Check off** – Mark items done; toggle or remove anytime.
- **Protected** – Dashboard requires login; session cookie keeps you signed in.

## Tech

- Next.js 14 (App Router), TypeScript, Tailwind
- MongoDB + Mongoose (connection cached)
- Simple cookie-based auth (signed session, no JWT in localStorage)
