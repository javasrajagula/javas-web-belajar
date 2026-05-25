# Production Deployment Guide

Academy OS Ω is designed to be fully Vercel-ready and lightweight.

## Deployment Target: Vercel

### Step 1: Deploy with Vercel CLI
1. Log in to Vercel account:
   ```bash
   npm install -g vercel
   vercel login
   ```

2. Initialize deployment within the workspace directory:
   ```bash
   vercel
   ```

### Step 2: Environment Configurations
Set the following environment variables inside Vercel Dashboard settings:
- `NEXT_PUBLIC_APP_URL` = Your deployment domain
- `NEXT_PUBLIC_SUPABASE_URL` = Supabase Project API URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = Supabase public key
- `ANTHROPIC_API_KEY` = Claude API key (if replacing mocks with live service)

### Step 3: Production Build Command
Ensure the build configuration target is:
- **Build Command**: `next build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`
