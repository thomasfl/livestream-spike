# Vercel Deployment Guide

## Error: "supabaseUrl is required"

This error occurs because the required Supabase environment variables are not configured in Vercel.

## Required Environment Variables

Your app needs these environment variables to connect to Supabase:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key  
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## Step-by-Step Deployment Fix

### 1. Get Your Supabase Credentials

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** → **API**
4. Copy the following values:
   - **Project URL** (for `NEXT_PUBLIC_SUPABASE_URL`)
   - **anon public** key (for `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
   - **service_role secret** key (for `SUPABASE_SERVICE_ROLE_KEY`)

### 2. Configure Environment Variables in Vercel

#### Option A: Via Vercel Dashboard
1. Go to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add each variable:

| Name | Value | Environment |
|------|--------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://your-project-id.supabase.co` | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIs...` | Production, Preview, Development |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGciOiJIUzI1NiIs...` | Production, Preview, Development |

#### Option B: Via Vercel CLI
```bash
# Install Vercel CLI if you haven't
npm i -g vercel

# Set environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY  
vercel env add SUPABASE_SERVICE_ROLE_KEY
```

### 3. Redeploy Your Application

After adding the environment variables:

1. **Via Dashboard**: Go to **Deployments** → Click **Redeploy** on latest deployment
2. **Via CLI**: Run `vercel --prod` in your project directory
3. **Via Git**: Push a new commit to trigger automatic deployment

### 4. Verify Database Schema

Make sure your Supabase database has the required schema. Run this SQL in your Supabase SQL Editor:

```sql
-- Create emails table with all required columns
CREATE TABLE IF NOT EXISTS emails (
  id VARCHAR(8) PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  ip_address INET,
  last_viewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_emails_email ON emails(email);
CREATE INDEX IF NOT EXISTS idx_emails_created_at ON emails(created_at);
CREATE INDEX IF NOT EXISTS idx_emails_ip_address ON emails(ip_address);
CREATE INDEX IF NOT EXISTS idx_emails_last_viewed_at ON emails(last_viewed_at);

-- Enable Row Level Security
ALTER TABLE emails ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY "Allow all operations on emails" ON emails
  FOR ALL USING (true);
```

## Troubleshooting

### Still Getting "supabaseUrl is required"?

1. **Check Variable Names**: Ensure exact spelling and case
2. **Check All Environments**: Set variables for Production, Preview, AND Development
3. **Redeploy**: Always redeploy after adding environment variables
4. **Check Logs**: Go to **Functions** → **View Function Logs** in Vercel dashboard

### Environment Variable Format Examples

```bash
# Correct format:
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYzNTc3Mjk5NCwiZXhwIjoxOTUxMzQ4OTk0fQ.example
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNjM1NzcyOTk0LCJleHAiOjE5NTEzNDg5OTR9.example
```

### Testing Locally

Create a `.env.local` file in your project root:

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

Then run:
```bash
npm run dev
```

## Success Indicators

✅ **Deployment succeeds without errors**  
✅ **App loads without "supabaseUrl is required" error**  
✅ **Can add new users via the form**  
✅ **Can view livestream pages**  
✅ **IP addresses are captured and displayed**  

## Need Help?

If you're still having issues:

1. Check the **Function Logs** in your Vercel dashboard
2. Verify your Supabase project is active and accessible
3. Test the environment variables locally first
4. Make sure all three environment variables are set correctly

