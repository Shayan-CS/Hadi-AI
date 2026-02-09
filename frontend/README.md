# Hadi AI Frontend

React + TypeScript frontend application built with Vite.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create `.env` file:
   ```bash
   cp .env.example .env
   ```

3. Edit `.env` with your configuration

4. Start development server:
   ```bash
   npm run dev
   ```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── components/    # Reusable components
├── contexts/      # React contexts (Auth)
├── lib/           # Utilities (API client, Supabase)
├── pages/         # Page components
├── types/         # TypeScript types
├── App.tsx        # Main app component
├── main.tsx       # Entry point
└── index.css      # Global styles
```

## Routes

- `/signup` - User registration
- `/signin` - User login
- `/verify-email` - Email verification
- `/dashboard` - Protected dashboard (redirects)
- `/dashboard/flashcards` - Flashcards page
- `/dashboard/flashcards/viewer` - Flashcard viewer
- `/dashboard/qiraat-corrector` - Coming soon
- `/dashboard/chain-narration` - Coming soon
- `/dashboard/quran-expanded` - Coming soon

## Authentication

The app uses Supabase for authentication:
- Email/password signup with email verification
- JWT-based sessions
- Protected routes with authentication check
- Automatic token refresh

## Components

### ProtectedRoute
Wraps protected pages, redirects to signin if not authenticated.

### Sidebar
Dashboard navigation with active state.

### Header
Top navigation with user info and sign out.

## Pages

### SignUp
- Email and password registration
- Password confirmation
- Email verification redirect

### SignIn
- Email and password login
- Error handling
- Redirect to dashboard

### VerifyEmail
- OTP code input
- Resend code functionality
- Success/error feedback

### Dashboard
- Layout with header and sidebar
- Nested routes

### Flashcards
- Book information display
- Generate flashcards button
- Loading animation
- State persistence

### FlashcardViewer
- Card flip animation
- Previous/Next navigation
- Progress indicator
- Arabic text support

## Styling

The app uses Tailwind CSS for styling:
- Utility-first approach
- Custom color scheme
- Responsive design
- Component variants

## Environment Variables

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_URL=http://localhost:5000/api
```

## Building for Production

```bash
npm run build
```

Output will be in the `dist/` directory.

## Development Tips

- Hot module replacement is enabled
- TypeScript errors show in console
- Tailwind classes are auto-completed in VS Code
- Use React DevTools for debugging
