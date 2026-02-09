# Hadi AI - MVP Documentation

## Overview

Hadi AI is an educational web application for students studying Islamic knowledge. This MVP allows users to:
- Sign up and verify their email
- Log in securely
- Access flashcards generated from Islamic books
- View and study flashcards with flip animations

## Project Structure

```
Islamic-Study-Tools/
├── backend/
│   ├── api/                      # Node.js/Express API
│   │   ├── src/
│   │   │   ├── config/          # Supabase configuration
│   │   │   ├── middleware/      # Authentication middleware
│   │   │   ├── routes/          # API routes
│   │   │   ├── types/           # TypeScript types
│   │   │   └── server.ts        # Main server file
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── .env.example
│   └── flashcard_generation/    # Pre-generated flashcards
│       ├── flashcards.json      # 100 flashcards
│       ├── flashcards.csv
│       ├── flashcards.md
│       └── fortyHadiths.pdf     # Source book
├── frontend/
│   ├── src/
│   │   ├── components/          # React components
│   │   ├── contexts/            # Auth context
│   │   ├── lib/                 # API & Supabase clients
│   │   ├── pages/               # Page components
│   │   ├── types/               # TypeScript types
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── .env.example
└── docs/                        # Documentation
    ├── README.md
    └── SUPABASE_SETUP.md
```

## Technology Stack

### Backend
- **Node.js** with **Express** - REST API
- **TypeScript** - Type safety
- **Supabase** - Authentication and database
- Pre-generated flashcards from JSON files

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Supabase Client** - Authentication

## Features

### 1. Authentication Flow
- Email and password signup
- Email verification with OTP
- Secure login
- Protected routes
- Session management

### 2. Dashboard
- Clean, modern interface
- Sidebar navigation with:
  - Flashcards (functional)
  - Qira'at Corrector (coming soon)
  - Chain-of-Narration (coming soon)
  - Qur'an Expanded (coming soon)
- User information in header
- Sign out functionality

### 3. Flashcards Page
- Book cover display
- Book metadata (title, description)
- "Generate flashcards" button
- Loading animation during generation (5-10 seconds)
- State persistence per user
- Button changes to "View Flashcards" after generation

### 4. Flashcard Viewer
- Card flip animations
- Navigate between flashcards
- Display question, answer, context
- Support for Arabic text and transliteration
- Progress indicator
- Back navigation

## Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- Supabase account
- Git

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Islamic-Study-Tools
```

### 2. Set Up Supabase

Follow the detailed guide in [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)

### 3. Install Backend Dependencies

```bash
cd backend/api
npm install
```

Create `.env` file with your Supabase credentials:

```env
PORT=5000
NODE_ENV=development
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
FRONTEND_URL=http://localhost:5173
```

### 4. Install Frontend Dependencies

```bash
cd ../../frontend
npm install
```

Create `.env` file:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_URL=http://localhost:5000/api
```

### 5. Start Development Servers

**Terminal 1 - Backend:**
```bash
cd backend/api
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### 6. Access the Application

Open [http://localhost:5173](http://localhost:5173) in your browser.

## API Endpoints

### Authentication
- `GET /api/auth/verify` - Verify authentication token

### Books
- `GET /api/books/:bookId` - Get book metadata

### Flashcards
- `GET /api/flashcards/:bookId` - Get flashcards for a book
- `GET /api/flashcards/:bookId/state` - Get user's flashcard generation state
- `POST /api/flashcards/:bookId/generate` - Mark flashcards as generated

## User Flow

1. **Sign Up**
   - User enters email and password
   - Receives verification email with OTP
   - Enters OTP to verify email

2. **Sign In**
   - User enters credentials
   - Authenticated and redirected to dashboard

3. **Access Flashcards**
   - Navigate to Flashcards page
   - See book cover and description
   - Click "Generate flashcards"
   - Wait for loading animation (simulated)
   - Automatically navigate to viewer

4. **Study Flashcards**
   - Click card to flip and reveal answer
   - Navigate with Previous/Next buttons
   - See progress indicator
   - Return to flashcards page when done

## Database Schema

### user_flashcard_states
```sql
- id: UUID (primary key)
- user_id: UUID (foreign key to auth.users)
- book_id: TEXT
- has_generated_flashcards: BOOLEAN
- last_accessed_at: TIMESTAMPTZ
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
```

## Future Enhancements

The codebase is structured to easily add:
- AI-powered flashcard generation
- RAG (Retrieval-Augmented Generation)
- Qira'at correction tools
- Chain-of-narration visualization
- Qur'an study tools
- Multiple book support
- Flashcard progress tracking
- Spaced repetition algorithm
- Mobile app (React Native)

## Development Notes

### Code Organization
- Clean separation of concerns
- Modular component structure
- Reusable API client
- Type-safe throughout
- Easy to extend

### Security
- Row Level Security on database
- JWT authentication
- Protected API routes
- Environment variables for secrets
- CORS configuration

### Performance
- Lazy loading of routes
- Optimized bundle size
- Efficient re-renders
- Indexed database queries

## Troubleshooting

### Backend won't start
- Check `.env` file exists and has correct values
- Verify Supabase credentials
- Check port 5000 is available

### Frontend won't start
- Check `.env` file exists
- Run `npm install` again
- Clear node_modules and reinstall

### Authentication errors
- Verify Supabase configuration
- Check email verification is enabled
- Ensure RLS policies are created

### Flashcards not loading
- Check backend is running
- Verify flashcards.json exists in backend/flashcard_generation/
- Check browser console for errors

## Contributing

When adding new features:
1. Follow existing code structure
2. Add TypeScript types
3. Update documentation
4. Test authentication flow
5. Maintain backward compatibility

## License

[Add your license here]
