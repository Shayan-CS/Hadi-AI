# Supabase Setup Guide

This guide will help you set up Supabase for the Hadi AI application.

## Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Fill in the project details:
   - Project name: `hadi-ai`
   - Database password: (save this securely)
   - Region: Choose closest to your location
4. Click "Create new project"

## Step 2: Create Database Tables

Once your project is created, go to the SQL Editor and run the following SQL:

```sql
-- Create user_flashcard_states table
CREATE TABLE user_flashcard_states (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  book_id TEXT NOT NULL,
  has_generated_flashcards BOOLEAN DEFAULT false,
  last_accessed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, book_id)
);

-- Enable Row Level Security
ALTER TABLE user_flashcard_states ENABLE ROW LEVEL SECURITY;

-- Create policies for user_flashcard_states
CREATE POLICY "Users can view their own flashcard states"
  ON user_flashcard_states
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own flashcard states"
  ON user_flashcard_states
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own flashcard states"
  ON user_flashcard_states
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_user_flashcard_states_user_id ON user_flashcard_states(user_id);
CREATE INDEX idx_user_flashcard_states_book_id ON user_flashcard_states(book_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_flashcard_states_updated_at
  BEFORE UPDATE ON user_flashcard_states
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

## Step 3: Configure Email Authentication

1. Go to **Authentication** > **Providers** in your Supabase dashboard
2. Enable **Email** provider
3. Configure Email Templates (optional but recommended):
   - Go to **Authentication** > **Email Templates**
   - Customize the "Confirm signup" template if desired
4. Configure Email Settings:
   - For production, configure a custom SMTP provider
   - For development, the default Supabase email service works fine

## Step 4: Get Your Credentials

1. Go to **Settings** > **API** in your Supabase dashboard
2. Copy the following values:
   - **Project URL** (SUPABASE_URL)
   - **anon public** key (SUPABASE_ANON_KEY)
   - **service_role** key (SUPABASE_SERVICE_ROLE_KEY) - Keep this secret!

## Step 5: Configure Environment Variables

### Backend (.env)

Create a `.env` file in `/backend/api/`:

```env
PORT=5000
NODE_ENV=development

# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# CORS
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)

Create a `.env` file in `/frontend/`:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_URL=http://localhost:5000/api
```

## Step 6: Test the Setup

1. Start the backend server:
   ```bash
   cd backend/api
   npm install
   npm run dev
   ```

2. Start the frontend:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. Open [http://localhost:5173](http://localhost:5173)
4. Try signing up with a test email
5. Check your email for the verification code
6. Verify and sign in

## Optional: Disable Email Confirmation (Development Only)

For easier development testing, you can disable email confirmation:

1. Go to **Authentication** > **Providers** > **Email**
2. Turn off "Enable email confirmations"
3. Save changes

**Note:** Re-enable this for production!

## Security Notes

- Never commit your `.env` files to version control
- Keep your `service_role` key secret - it bypasses Row Level Security
- Always use the `anon` key in frontend code
- Enable Row Level Security on all tables
- Use HTTPS in production

## Troubleshooting

### "Invalid API key" error
- Check that your environment variables are correct
- Make sure you're using the `anon` key in frontend and both keys in backend
- Restart your dev servers after changing .env files

### Email not received
- Check your spam folder
- Check Supabase logs: Authentication > Logs
- Verify email provider settings

### "User already registered" error
- The email is already in the database
- Use a different email or delete the user from Supabase dashboard
- Go to Authentication > Users to manage users

## Next Steps

Once Supabase is set up:
1. Test user registration and email verification
2. Test sign in functionality
3. Test flashcard generation and viewing
4. Deploy to production with proper environment variables
