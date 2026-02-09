# Quick Start Guide

Get Hadi AI running in 10 minutes!

## Step 1: Prerequisites Check

Make sure you have:
- [ ] Node.js 18+ installed (`node --version`)
- [ ] npm installed (`npm --version`)
- [ ] Git installed (`git --version`)
- [ ] A text editor (VS Code recommended)

## Step 2: Get the Code

```bash
git clone <repository-url>
cd Islamic-Study-Tools
```

## Step 3: Set Up Supabase (5 minutes)

### Create Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up/login
3. Click "New Project"
4. Fill in:
   - Name: `hadi-ai`
   - Password: (save this!)
   - Region: (closest to you)
5. Click "Create new project"
6. Wait for project to initialize

### Create Database Table

1. Go to SQL Editor in Supabase dashboard
2. Click "New Query"
3. Paste this SQL:

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

-- Create policies
CREATE POLICY "Users can view their own flashcard states"
  ON user_flashcard_states FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own flashcard states"
  ON user_flashcard_states FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own flashcard states"
  ON user_flashcard_states FOR UPDATE
  USING (auth.uid() = user_id);

-- Create indexes
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

4. Click "Run"
5. You should see "Success. No rows returned"

### Get Your Keys

1. Go to Settings > API
2. Copy these values:
   - **Project URL**
   - **anon public** key
   - **service_role** key

## Step 4: Configure Backend (2 minutes)

```bash
cd backend/api
npm install
```

Create `.env` file:

```bash
cp .env.example .env
```

Edit `.env` and add your Supabase keys:

```env
PORT=5000
NODE_ENV=development

SUPABASE_URL=paste_your_project_url_here
SUPABASE_ANON_KEY=paste_your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=paste_your_service_role_key_here

FRONTEND_URL=http://localhost:5173
```

## Step 5: Configure Frontend (2 minutes)

```bash
cd ../../frontend
npm install
```

Create `.env` file:

```bash
cp .env.example .env
```

Edit `.env` and add your Supabase keys:

```env
VITE_SUPABASE_URL=paste_your_project_url_here
VITE_SUPABASE_ANON_KEY=paste_your_anon_key_here
VITE_API_URL=http://localhost:5000/api
```

## Step 6: Start the App (1 minute)

Open TWO terminal windows:

**Terminal 1 - Backend:**
```bash
cd backend/api
npm run dev
```

You should see:
```
Server is running on port 5000
Environment: development
CORS enabled for: http://localhost:5173
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

You should see:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  press h + enter to show help
```

## Step 7: Test the App

1. Open [http://localhost:5173](http://localhost:5173)
2. Click "Sign Up"
3. Enter email and password
4. Check your email for verification code
5. Enter the code
6. Sign in
7. Click "Flashcards"
8. Click "Generate flashcards"
9. Wait for loading animation
10. View and flip flashcards!

## Common Issues

### "Cannot find module" errors
```bash
# Run in the directory with the error
npm install
```

### "Port already in use"
```bash
# Backend (kill process on port 5000)
lsof -ti:5000 | xargs kill -9

# Frontend (kill process on port 5173)
lsof -ti:5173 | xargs kill -9
```

### "Invalid API key"
- Double-check your `.env` files
- Make sure you copied the full keys
- No extra spaces or quotes
- Restart both servers after changing .env

### Email not received
- Check spam folder
- Check Supabase logs: Authentication > Logs
- For testing, disable email confirmation:
  - Go to Authentication > Providers > Email
  - Toggle off "Enable email confirmations"
  - Save (remember to re-enable for production!)

### Flashcards not loading
- Check backend is running
- Check browser console for errors
- Verify `flashcards.json` exists in `backend/flashcard_generation/`

## Next Steps

Congratulations! You now have Hadi AI running locally.

Try these next:
- Explore different flashcard types
- Check the codebase structure
- Read the full documentation in `/docs`
- Plan your next feature

## Need Help?

- Full documentation: [docs/README.md](./README.md)
- Supabase setup: [docs/SUPABASE_SETUP.md](./SUPABASE_SETUP.md)
- Open a GitHub issue
- Check existing issues for solutions

## Development Tips

- Keep both terminals open while developing
- Changes to frontend code hot-reload automatically
- Backend changes require manual restart (or use nodemon)
- Check browser DevTools console for errors
- Check terminal output for server errors
- Use React DevTools browser extension for debugging

## Ready for Production?

When you're ready to deploy:
1. Read [docs/DEPLOYMENT.md](./DEPLOYMENT.md)
2. Set up production Supabase project
3. Deploy backend (Railway/Heroku)
4. Deploy frontend (Vercel/Netlify)
5. Update environment variables
6. Test thoroughly!

Happy coding!
