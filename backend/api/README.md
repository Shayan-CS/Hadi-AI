# Hadi AI Backend API

Node.js/Express backend API with TypeScript and Supabase authentication.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create `.env` file:
   ```bash
   cp .env.example .env
   ```

3. Edit `.env` with your Supabase credentials

4. Start development server:
   ```bash
   npm run dev
   ```

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Run production build

## Project Structure

```
src/
├── config/        # Configuration (Supabase)
├── middleware/    # Express middleware (auth)
├── routes/        # API routes
├── types/         # TypeScript type definitions
└── server.ts      # Main server file
```

## API Routes

### Authentication
- `GET /api/auth/verify` - Verify JWT token

### Books
- `GET /api/books/:bookId` - Get book metadata

### Flashcards
- `GET /api/flashcards/:bookId` - Get flashcards for a book
- `GET /api/flashcards/:bookId/state` - Get user's generation state
- `POST /api/flashcards/:bookId/generate` - Mark flashcards as generated

## Authentication

All protected routes require a Bearer token:

```
Authorization: Bearer <jwt_token>
```

The token is obtained from Supabase authentication on the frontend.

## Environment Variables

```env
PORT=5000
NODE_ENV=development
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
FRONTEND_URL=http://localhost:5173
```

## Error Handling

All errors return JSON:

```json
{
  "error": "Error message"
}
```

Common status codes:
- 200: Success
- 400: Bad request
- 401: Unauthorized
- 404: Not found
- 500: Internal server error

## Development

The server uses:
- Express for routing
- TypeScript for type safety
- Supabase for authentication and database
- CORS for cross-origin requests
- Helmet for security headers
- Morgan for logging
