# Hadi AI - Quick Command Reference

## Development Commands

### Backend API

```bash
# Navigate to backend
cd backend/api

# Install dependencies
npm install

# Start development server (with hot reload)
npm run dev

# Build TypeScript to JavaScript
npm run build

# Run production build
npm start

# Check for TypeScript errors
npx tsc --noEmit
```

### Frontend

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint

# Fix linting issues
npm run lint -- --fix
```

### Both Servers

```bash
# In terminal 1
cd backend/api && npm run dev

# In terminal 2
cd frontend && npm run dev
```

## Useful Development Commands

### Check versions
```bash
node --version
npm --version
git --version
```

### Kill processes on ports
```bash
# macOS/Linux
# Kill backend (port 5000)
lsof -ti:5000 | xargs kill -9

# Kill frontend (port 5173)
lsof -ti:5173 | xargs kill -9

# Windows
# Kill backend (port 5000)
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Kill frontend (port 5173)
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

### Clear caches
```bash
# Backend
cd backend/api
rm -rf node_modules
npm install

# Frontend
cd frontend
rm -rf node_modules .vite
npm install
```

### Git commands
```bash
# Check status
git status

# Add all changes
git add .

# Commit changes
git commit -m "Your message"

# Push to remote
git push origin main

# Pull latest changes
git pull origin main

# Create new branch
git checkout -b feature-name

# Switch branches
git checkout branch-name

# View branches
git branch
```

## Environment Variables

### Create from examples
```bash
# Backend
cd backend/api
cp .env.example .env
# Then edit .env with your values

# Frontend
cd frontend
cp .env.example .env
# Then edit .env with your values
```

### Check environment variables loaded
```bash
# Backend (in server.ts or any file)
console.log('Supabase URL:', process.env.SUPABASE_URL);

# Frontend (must start with VITE_)
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
```

## Database Commands

### Using Supabase CLI (optional)
```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to project
supabase link --project-ref your-project-ref

# Pull database schema
supabase db pull

# Run migrations
supabase db push
```

### Direct SQL (in Supabase Dashboard)
```sql
-- View all user states
SELECT * FROM user_flashcard_states;

-- Check user's state for a book
SELECT * FROM user_flashcard_states
WHERE user_id = 'user-id' AND book_id = 'forty-hadiths';

-- Delete all user states (testing)
DELETE FROM user_flashcard_states;

-- Count users
SELECT COUNT(*) FROM auth.users;

-- View recent signups
SELECT email, created_at FROM auth.users
ORDER BY created_at DESC LIMIT 10;
```

## Testing Commands

### Manual API Testing (curl)
```bash
# Health check
curl http://localhost:5000/health

# Get book (requires auth token)
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:5000/api/books/forty-hadiths

# Get flashcards (requires auth token)
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:5000/api/flashcards/forty-hadiths

# Generate flashcards (requires auth token)
curl -X POST \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:5000/api/flashcards/forty-hadiths/generate
```

### Get JWT Token from Browser
```javascript
// Open browser console on http://localhost:5173
// After logging in, run:
const session = await supabase.auth.getSession();
console.log('Token:', session.data.session.access_token);
// Copy the token for curl commands
```

## Troubleshooting Commands

### Check if ports are in use
```bash
# macOS/Linux
lsof -i :5000  # Backend
lsof -i :5173  # Frontend

# Windows
netstat -ano | findstr :5000
netstat -ano | findstr :5173
```

### View running processes
```bash
# macOS/Linux
ps aux | grep node

# Windows
tasklist | findstr node
```

### Check Node.js memory usage
```bash
node --max-old-space-size=4096  # Increase if needed
```

### Clear npm cache
```bash
npm cache clean --force
```

### Reinstall everything
```bash
# Backend
cd backend/api
rm -rf node_modules package-lock.json
npm install

# Frontend
cd frontend
rm -rf node_modules package-lock.json
npm install
```

## Logs and Debugging

### View logs
```bash
# Backend logs in terminal running npm run dev

# Frontend logs in browser console (F12)

# Supabase logs in dashboard:
# Authentication > Logs
# Database > Logs
```

### Enable debug mode
```bash
# Backend .env
DEBUG=*
NODE_ENV=development

# Frontend - open browser console
localStorage.debug = '*'
```

### Check for errors
```bash
# Backend
cd backend/api
npx tsc --noEmit  # Check TypeScript errors

# Frontend
cd frontend
npm run lint  # Check linting errors
npx tsc --noEmit  # Check TypeScript errors
```

## Build Commands

### Production build
```bash
# Backend
cd backend/api
npm run build
# Output in dist/

# Frontend
cd frontend
npm run build
# Output in dist/

# Preview frontend production build
npm run preview
```

### Check bundle size
```bash
cd frontend
npm run build
# Shows size of each bundle
```

## Database Backup

### Export data from Supabase
```sql
-- In Supabase SQL Editor
COPY (SELECT * FROM user_flashcard_states)
TO '/path/to/backup.csv' CSV HEADER;
```

### Backup using Supabase Dashboard
1. Go to Database > Backups
2. Click "Create Backup"
3. Download when ready

## Useful Scripts

### Create new component (manual)
```bash
cd frontend/src/components
touch NewComponent.tsx

# Template:
# import React from 'react';
#
# const NewComponent = () => {
#   return <div>NewComponent</div>;
# };
#
# export default NewComponent;
```

### Create new API route (manual)
```bash
cd backend/api/src/routes
touch newroute.ts

# Template:
# import { Router } from 'express';
# import { authenticate } from '../middleware/auth';
#
# const router = Router();
#
# router.get('/', authenticate, (req, res) => {
#   res.json({ message: 'Hello' });
# });
#
# export default router;
```

## Quick Fixes

### "Module not found" error
```bash
npm install
# or
npm install --legacy-peer-deps
```

### "Port already in use"
```bash
# Change port in .env or kill process
lsof -ti:5000 | xargs kill -9  # macOS/Linux
```

### "Cannot find module 'typescript'"
```bash
npm install -D typescript
```

### "Unexpected token" in TypeScript
```bash
# Install ts-node
npm install -D ts-node ts-node-dev
```

### Vite not starting
```bash
# Clear Vite cache
rm -rf node_modules/.vite
npm run dev
```

### React not updating
```bash
# Hard refresh browser
Ctrl + Shift + R  (Windows/Linux)
Cmd + Shift + R   (macOS)

# Or clear cache
rm -rf node_modules/.vite
```

## Performance Monitoring

### Measure frontend build time
```bash
cd frontend
time npm run build
```

### Check bundle size
```bash
cd frontend
npm run build
# Look at dist/ folder size
du -sh dist/
```

### Profile Node.js backend
```bash
node --prof src/server.ts
# Creates isolate-*-v8.log
# Process with:
node --prof-process isolate-*-v8.log > processed.txt
```

## Useful Links

- Supabase Dashboard: https://app.supabase.com
- React DevTools: Chrome/Firefox extension
- Node.js Docs: https://nodejs.org/docs
- React Docs: https://react.dev
- TypeScript Docs: https://www.typescriptlang.org/docs
- Tailwind CSS Docs: https://tailwindcss.com/docs
- Vite Docs: https://vitejs.dev

## Daily Development Workflow

```bash
# Morning - Start development
cd Islamic-Study-Tools

# Terminal 1 - Backend
cd backend/api
git pull origin main
npm install  # If package.json changed
npm run dev

# Terminal 2 - Frontend
cd frontend
git pull origin main
npm install  # If package.json changed
npm run dev

# During development
# - Make changes
# - Frontend auto-reloads
# - Backend may need restart
# - Test in browser
# - Check console for errors

# End of day - Commit changes
git status
git add .
git commit -m "Description of changes"
git push origin main
```

## Emergency Commands

### Full reset
```bash
# Kill all processes
pkill -f node

# Remove all node_modules
cd backend/api && rm -rf node_modules
cd ../../frontend && rm -rf node_modules

# Reinstall everything
cd backend/api && npm install
cd ../../frontend && npm install

# Restart servers
cd backend/api && npm run dev  # Terminal 1
cd frontend && npm run dev      # Terminal 2
```

### Database reset (dangerous!)
```sql
-- In Supabase SQL Editor
-- WARNING: This deletes all data!
DROP TABLE user_flashcard_states CASCADE;

-- Then re-run schema from docs/SUPABASE_SETUP.md
```

### Git reset (dangerous!)
```bash
# Discard all local changes
git reset --hard HEAD

# Pull latest from remote
git pull origin main
```

## Help Commands

```bash
# Node.js help
node --help

# npm help
npm --help
npm help <command>

# Git help
git --help
git help <command>

# TypeScript compiler options
npx tsc --help
```

Remember: Most issues can be solved by:
1. Restarting the servers
2. Clearing caches
3. Reinstalling node_modules
4. Checking environment variables
5. Reading error messages carefully
