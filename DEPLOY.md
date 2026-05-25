# Production Deployment Guide (Upgraded V2)

Academy OS Ω is fully production-grade and ready for deployment to Vercel with a PostgreSQL database (e.g., Supabase, Neon, or AWS RDS).

## 1. Database Provisioning & Schema Migration

1. **Database Setup**: Create a PostgreSQL database instance on Supabase, Neon, or another provider.
2. **Retrieve Connection String**: Copy the transaction/session database connection URI.
3. **Run Schema Migrations**: From your local workspace, push the Prisma schema to the database:
   ```bash
   npx prisma db push
   ```
4. **Seed Database**: Load default SMA/SMK curriculum structures and demo accounts:
   ```bash
   npx prisma db seed
   ```

## 2. Environment Variables Configuration

Configure the following environment variables in your Vercel project settings:

### Database & App Target
- `DATABASE_URL`: Your PostgreSQL database connection URI (e.g. `postgresql://...`)
- `NEXT_PUBLIC_APP_URL`: Your production URL (e.g. `https://your-domain.vercel.app`)
- `NEXT_PUBLIC_APP_NAME`: `Academy OS Ω`

### NextAuth v5 (Auth.js) Security
- `AUTH_SECRET`: Generate a cryptographically secure random secret key (e.g. run `openssl rand -base64 33` or `npx auth secret`).
- `AUTH_GOOGLE_ID` (Optional): Client ID for Google OAuth login.
- `AUTH_GOOGLE_SECRET` (Optional): Client Secret for Google OAuth login.
- `AUTH_GITHUB_ID` (Optional): Client ID for GitHub OAuth login.
- `AUTH_GITHUB_SECRET` (Optional): Client Secret for GitHub OAuth login.

### Vercel AI SDK
- `GEMINI_API_KEY` (Optional): API key for streaming Google Generative AI (replaces client-side streaming mocks with live models).

## 3. Vercel Project Build Command

In your Vercel Project Settings, confirm:
- **Build Command**: `prisma generate && next build`
- **Output Directory**: `.next`
- **Install Command**: `npm install --legacy-peer-deps`

*Note: Pre-pending `prisma generate` before `next build` ensures the Prisma Client is fully generated in the Vercel builder environment prior to compilation.*
