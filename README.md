# Email Collection System

A full-stack email collection application built with Next.js, TypeScript, Tailwind CSS, and Supabase.

## Features

- ✅ Email input form with validation
- ✅ Unique 8-character alphanumeric ID generation
- ✅ Email list display in a responsive table
- ✅ Real-time data updates
- ✅ Modern, responsive UI with Tailwind CSS
- ✅ TypeScript for type safety
- ✅ Supabase for database management
- ✅ Ready for Vercel deployment

## Tech Stack

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Vercel

## Setup Instructions

### 1. Supabase Setup

1. Go to [Supabase](https://supabase.com) and create a new project
2. In your Supabase project dashboard, go to the SQL Editor
3. Run the SQL schema from `supabase-schema.sql`:

```sql
-- Create emails table
CREATE TABLE IF NOT EXISTS emails (
  id VARCHAR(8) PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_emails_email ON emails(email);
CREATE INDEX IF NOT EXISTS idx_emails_created_at ON emails(created_at);

-- Enable Row Level Security
ALTER TABLE emails ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY "Allow all operations on emails" ON emails
  FOR ALL USING (true);
```

4. Go to Settings > API to get your project URL and anon key
5. Copy `.env.example` to `.env.local` and fill in your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 2. Local Development

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

### 3. Vercel Deployment

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com) and import your GitHub repository
3. Add your environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Deploy!

## API Endpoints

- `GET /api/emails` - Fetch all emails
- `POST /api/emails` - Create a new email

## Database Schema

The `emails` table has the following structure:

- `id` (VARCHAR(8), PRIMARY KEY) - Unique 8-character alphanumeric identifier
- `email` (VARCHAR(255), UNIQUE) - Email address
- `created_at` (TIMESTAMP) - When the email was added

## Features

- **Unique ID Generation**: Each email gets a unique 8-character alphanumeric ID
- **Email Validation**: Client and server-side email format validation
- **Duplicate Prevention**: Prevents duplicate email addresses
- **Responsive Design**: Works on desktop and mobile devices
- **Real-time Updates**: Email list updates immediately after adding new emails
- **Error Handling**: Comprehensive error handling with user-friendly messages

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License