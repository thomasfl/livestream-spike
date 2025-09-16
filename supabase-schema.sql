-- Create emails table
CREATE TABLE IF NOT EXISTS emails (
  id VARCHAR(8) PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_emails_email ON emails(email);

-- Create an index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_emails_created_at ON emails(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE emails ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all operations for now (you can restrict this later)
CREATE POLICY "Allow all operations on emails" ON emails
  FOR ALL USING (true);