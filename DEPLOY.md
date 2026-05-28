# Production Deployment Guide

Academy OS Omega is a Next.js app with Prisma/PostgreSQL, Auth.js, AI SDK routes, and local PDF processing.

## Local Run

```bash
npm install
npx prisma generate
npx prisma db push
npx prisma db seed
npm run dev -- --hostname 127.0.0.1 --port 3000
```

Open `http://127.0.0.1:3000`.

Demo account after seeding:

```text
Email: alex@academy.os
Password: academy123
```

## Required Environment Variables

Copy `.env.example` to `.env.local` for local development and set these values in your hosting provider:

```text
DATABASE_URL
AUTH_SECRET
NEXT_PUBLIC_APP_URL
NEXT_PUBLIC_APP_NAME
```

For live AI features, set at least one:

```text
GEMINI_API_KEY
GOOGLE_GENERATIVE_AI_API_KEY
ANTHROPIC_API_KEY
```

Optional:

```text
UPSTASH_REDIS_REST_URL
UPSTASH_REDIS_REST_TOKEN
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
GITHUB_CLIENT_ID
GITHUB_CLIENT_SECRET
```

## Database

Use PostgreSQL from Neon, Supabase, RDS, or a compatible provider.

```bash
npx prisma db push
npx prisma db seed
```

The seed creates SMK jurusan, mata pelajaran, bab, materi, bank soal, and a demo student.

## Vercel Settings

Recommended:

```text
Install Command: npm install
Build Command: npx prisma generate && npm run build
Output Directory: .next
```

Add all required environment variables in Vercel Project Settings. Never commit `.env`, `.env.local`, or real API keys.

## Production Notes

- `/api/ai/*` and `/api/pdf/process` read AI keys only server-side.
- If AI keys are missing, tutor/question/PDF routes return a clear server error in production. Development fallback responses are only used outside production.
- PDF uploads reject unsupported binary files and files larger than 10 MB.
- Portfolio uploads currently write to `public/uploads/portfolio` locally. For serverless production, replace this with object storage such as Vercel Blob, S3, Supabase Storage, or Cloudinary.

## Final Checks Before Deploy

```bash
npx tsc --noEmit --pretty false
npm run lint
npm run build
```
