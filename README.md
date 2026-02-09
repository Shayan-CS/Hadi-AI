# Hadi AI - Islamic Study Tools

An educational web application for students studying Islamic knowledge, featuring flashcards generated from Islamic texts.

## Features

- User authentication with email verification
- Protected dashboard with sidebar navigation
- Flashcard generation and viewing
- Card flip animations
- State persistence per user
- Responsive design

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Supabase account

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Islamic-Study-Tools
   ```

2. **Set up Supabase**

   Follow the detailed guide: [docs/SUPABASE_SETUP.md](./docs/SUPABASE_SETUP.md)

3. **Install and configure backend**
   ```bash
   cd backend/api
   npm install
   cp .env.example .env
   # Edit .env with your Supabase credentials
   ```

4. **Install and configure frontend**
   ```bash
   cd ../../frontend
   npm install
   cp .env.example .env
   # Edit .env with your Supabase credentials
   ```

5. **Start development servers**

   Terminal 1 (Backend):
   ```bash
   cd backend/api
   npm run dev
   ```

   Terminal 2 (Frontend):
   ```bash
   cd frontend
   npm run dev
   ```

6. **Open the application**

   Visit [http://localhost:5173](http://localhost:5173)

## Project Structure

```
Islamic-Study-Tools/
├── backend/
│   ├── api/                    # Node.js/Express API
│   └── flashcard_generation/   # Pre-generated flashcards
├── frontend/                   # React TypeScript application
└── docs/                       # Documentation
```

## Technology Stack

**Backend:**
- Node.js + Express
- TypeScript
- Supabase (Auth & Database)

**Frontend:**
- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Router

## Documentation

- [Complete Documentation](./docs/README.md)
- [Supabase Setup Guide](./docs/SUPABASE_SETUP.md)
- [Deployment Guide](./docs/DEPLOYMENT.md)

## User Flow

1. Sign up with email and password
2. Verify email with OTP code
3. Sign in to dashboard
4. Navigate to Flashcards
5. Generate flashcards (simulated 5-10s delay)
6. Study flashcards with flip animations

## Development

### Backend API

```bash
cd backend/api
npm run dev        # Start development server
npm run build      # Build for production
npm start          # Run production build
```

### Frontend

```bash
cd frontend
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
```

## API Endpoints

- `GET /api/books/:bookId` - Get book metadata
- `GET /api/flashcards/:bookId` - Get flashcards
- `GET /api/flashcards/:bookId/state` - Get user state
- `POST /api/flashcards/:bookId/generate` - Generate flashcards

## Environment Variables

### Backend

```env
PORT=5000
NODE_ENV=development
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
FRONTEND_URL=http://localhost:5173
```

### Frontend

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_URL=http://localhost:5000/api
```

## Future Features

- AI-powered flashcard generation
- Qira'at Corrector
- Chain-of-Narration visualization
- Qur'an Expanded tools
- Multiple book support
- Progress tracking
- Spaced repetition

## License

[Add your license here]

## Contributing

[Add contribution guidelines]

## Support

For issues and questions, please open a GitHub issue.
