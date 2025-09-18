# Deployment Guide

This guide will walk you through deploying the Email Collection System to Supabase and Vercel.

## Step 1: Deploy to Supabase

### 1.1 Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in to your account
3. Click "New Project"
4. Choose your organization
5. Enter project details:
   - **Name**: `email-collector` (or your preferred name)
   - **Database Password**: Choose a strong password
   - **Region**: Choose the region closest to your users
6. Click "Create new project"
7. Wait for the project to be created (this may take a few minutes)

### 1.2 Set up Database Schema

1. In your Supabase project dashboard, go to the **SQL Editor**
2. Click "New Query"
3. Copy and paste the contents of `supabase-schema.sql`:

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

4. Click "Run" to execute the SQL
5. You should see "Success. No rows returned" message

### 1.3 Get API Keys

1. In your Supabase project dashboard, go to **Settings** > **API**
2. Copy the following values:
   - **Project URL** (looks like: `https://your-project-id.supabase.co`)
   - **anon public** key (starts with `eyJ...`)
   - **service_role** key (starts with `eyJ...`)

## Step 2: Deploy to Vercel

### 2.1 Prepare Repository

1. Initialize git repository (if not already done):
```bash
git init
git add .
git commit -m "Initial commit: Email Collection System"
```

2. Push to GitHub:
   - Create a new repository on GitHub
   - Add the remote and push:
```bash
git remote add origin https://github.com/yourusername/email-collector.git
git branch -M main
git push -u origin main
```

### 2.2 Deploy to Vercel

1. Go to [https://vercel.com](https://vercel.com)
2. Sign up or log in (preferably with your GitHub account)
3. Click "New Project"
4. Import your GitHub repository
5. Configure the project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)
   - **Install Command**: `npm install` (default)

### 2.3 Add Environment Variables

1. In your Vercel project dashboard, go to **Settings** > **Environment Variables**
2. Add the following variables:

| Name | Value | Environment |
|------|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase Project URL | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key | Production, Preview, Development |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service_role key | Production, Preview, Development |

3. Click "Save" for each variable

### 2.4 Deploy

1. Go to the **Deployments** tab
2. Click "Redeploy" on the latest deployment
3. Wait for the deployment to complete
4. Click on the deployment URL to test your application

## Step 3: Test Your Application

1. Open your deployed application URL
2. Try adding an email address using the form
3. Verify that:
   - The email appears in the table
   - A unique 8-character ID is generated
   - The date/time is displayed correctly
   - Duplicate emails are rejected

## Troubleshooting

### Common Issues

1. **"supabaseUrl is required" error**:
   - This means environment variables are not set in Vercel
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Make sure all three variables are added: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
   - Set them for **Production**, **Preview**, AND **Development** environments
   - After adding variables, go to Deployments tab and click "Redeploy"

2. **"Invalid supabaseUrl" error**:
   - Make sure your environment variables are set correctly in Vercel
   - Check that the Supabase URL doesn't have trailing slashes

3. **Database connection errors**:
   - Verify your Supabase project is active
   - Check that the database schema was created successfully
   - Ensure your API keys are correct

4. **Build failures**:
   - Check the Vercel build logs for specific error messages
   - Make sure all dependencies are listed in `package.json`

### Getting Help

- Check the [Supabase Documentation](https://supabase.com/docs)
- Check the [Vercel Documentation](https://vercel.com/docs)
- Check the [Next.js Documentation](https://nextjs.org/docs)

## Security Considerations

- The current setup allows all operations on the emails table
- For production use, consider implementing proper authentication
- Review Supabase Row Level Security policies
- Consider rate limiting for the API endpoints

## Next Steps

- Set up custom domain (optional)
- Implement email verification
- Add user authentication
- Set up monitoring and analytics
- Implement data export functionality