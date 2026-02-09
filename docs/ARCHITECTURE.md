# Architecture Documentation

## System Overview

Hadi AI is a full-stack web application built with a modern, scalable architecture designed for educational content delivery.

```
┌─────────────────────────────────────────────────────────────┐
│                         User Browser                         │
│  ┌───────────────────────────────────────────────────────┐  │
│  │           React Frontend (TypeScript + Vite)           │  │
│  │  - Authentication UI                                   │  │
│  │  - Dashboard & Navigation                             │  │
│  │  - Flashcard Viewer                                   │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                          │
                          │ HTTPS/JSON
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend API (Express)                     │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                    Authentication                      │  │
│  │  - JWT Verification Middleware                        │  │
│  │  - Supabase Integration                               │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                    Business Logic                      │  │
│  │  - Book Management                                     │  │
│  │  - Flashcard Retrieval                                │  │
│  │  - State Management                                   │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                          │
                          │
        ┌─────────────────┴─────────────────┐
        │                                   │
        ▼                                   ▼
┌──────────────────┐              ┌──────────────────┐
│  Supabase Auth   │              │  File System     │
│  - User Auth     │              │  - Flashcards    │
│  - Email OTP     │              │  - Book PDFs     │
│  - Sessions      │              │                  │
└──────────────────┘              └──────────────────┘
        │
        ▼
┌──────────────────┐
│  Supabase DB     │
│  - User States   │
│  - RLS Policies  │
└──────────────────┘
```

## Technology Stack

### Frontend

#### Core Framework
- **React 18** - UI library with hooks
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and dev server

#### Routing & State
- **React Router v6** - Client-side routing
- **Context API** - Global state management (Auth)

#### Styling
- **Tailwind CSS** - Utility-first CSS framework
- **PostCSS** - CSS processing
- **Autoprefixer** - Cross-browser compatibility

#### Authentication
- **@supabase/supabase-js** - Supabase client SDK
- JWT token management
- Session persistence

#### Development
- **ESLint** - Code linting
- **TypeScript** - Type checking
- **Vite HMR** - Hot module replacement

### Backend

#### Core Framework
- **Node.js** - Runtime environment
- **Express** - Web application framework
- **TypeScript** - Type safety

#### Authentication & Database
- **Supabase** - BaaS (Backend as a Service)
  - PostgreSQL database
  - Built-in authentication
  - Row Level Security (RLS)
  - Real-time capabilities (future)

#### Security & Middleware
- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing
- **Morgan** - HTTP request logging
- Custom JWT verification middleware

#### Development
- **ts-node-dev** - TypeScript execution with hot reload
- **dotenv** - Environment variables

### Database

#### Supabase PostgreSQL
- **Tables**
  - `user_flashcard_states` - User progress tracking
  - `auth.users` - Managed by Supabase

- **Security**
  - Row Level Security (RLS) enabled
  - User-scoped policies
  - Secure by default

- **Performance**
  - Indexed queries
  - Connection pooling
  - Query optimization

## Architecture Patterns

### Frontend Architecture

#### Component Structure
```
Component Hierarchy:
App
├── AuthProvider (Context)
├── Router
    ├── Public Routes
    │   ├── SignUp
    │   ├── SignIn
    │   └── VerifyEmail
    └── Protected Routes
        └── Dashboard (Layout)
            ├── Header
            ├── Sidebar
            └── Outlet
                ├── Flashcards
                └── FlashcardViewer
```

#### State Management
- **Authentication State**: Context API
  - Global user state
  - Auth methods (signUp, signIn, signOut)
  - Loading states

- **Component State**: useState hooks
  - Local UI state
  - Form inputs
  - Loading/error states

- **Server State**: API calls
  - Fetched on component mount
  - Cached in component state
  - Refetched on user actions

#### Data Flow
```
User Action → Component Handler → API Call → Update State → Re-render
```

### Backend Architecture

#### Layered Architecture
```
┌─────────────────────────────────────┐
│         Routes Layer                 │
│  - Define endpoints                 │
│  - Parse request                    │
│  - Send response                    │
└─────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────┐
│       Middleware Layer               │
│  - Authentication                   │
│  - Validation                       │
│  - Error handling                   │
└─────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────┐
│      Business Logic Layer            │
│  - Data processing                  │
│  - File reading                     │
│  - State management                 │
└─────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────┐
│       Data Access Layer              │
│  - Supabase queries                 │
│  - File system access               │
│  - External APIs                    │
└─────────────────────────────────────┘
```

#### Request Flow
```
Request → CORS → Helmet → Route → Auth Middleware → Handler → Response
```

### Authentication Flow

```
┌──────────────┐
│ 1. Sign Up   │
│   User sends │
│   credentials│
└──────┬───────┘
       │
       ▼
┌──────────────────┐
│ 2. Supabase      │
│   Creates user   │
│   Sends OTP      │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│ 3. Verify OTP    │
│   User enters    │
│   code           │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│ 4. Sign In       │
│   User logs in   │
│   Gets JWT       │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│ 5. Protected     │
│   Route Access   │
│   JWT verified   │
└──────────────────┘
```

### Data Flow

#### Reading Flashcards
```
Frontend Request
    │
    ▼
API Endpoint (/api/flashcards/:bookId)
    │
    ▼
Auth Middleware (verify JWT)
    │
    ▼
Read flashcards.json from file system
    │
    ▼
Parse JSON
    │
    ▼
Return to frontend
    │
    ▼
Display in FlashcardViewer
```

#### Managing User State
```
Frontend Request (Generate Flashcards)
    │
    ▼
API Endpoint (/api/flashcards/:bookId/generate)
    │
    ▼
Auth Middleware (get user ID)
    │
    ▼
Supabase Query (upsert user_flashcard_states)
    │
    ▼
Return success + state
    │
    ▼
Navigate to viewer
```

## Security Architecture

### Authentication Security

#### Token-Based Auth
- JWT tokens issued by Supabase
- Short expiration (default 1 hour)
- Automatic refresh
- Secure storage (httpOnly cookies in production)

#### Password Security
- Bcrypt hashing (managed by Supabase)
- Minimum 6 characters (configurable)
- No password stored in frontend
- Reset password flow (future)

### API Security

#### Request Validation
- JWT verification on all protected routes
- User ID extraction from token
- Authorization checks per request

#### CORS Configuration
- Whitelist frontend origin
- Credentials allowed
- Secure headers

#### Headers Security
- Helmet middleware
- XSS protection
- CSRF protection (future)
- Content Security Policy

### Database Security

#### Row Level Security (RLS)
```sql
-- Users can only access their own data
CREATE POLICY "Users can view their own flashcard states"
  ON user_flashcard_states FOR SELECT
  USING (auth.uid() = user_id);
```

#### Connection Security
- Environment-based credentials
- Service role key kept server-side only
- Anon key used in frontend (limited permissions)

### Environment Security
- `.env` files gitignored
- `.env.example` for reference
- Different keys for dev/prod
- Secrets never committed

## Scalability Considerations

### Frontend Scalability

#### Code Splitting
- React lazy loading ready
- Route-based splitting possible
- Component-level splitting when needed

#### Performance Optimization
- Vite production builds
- Tree shaking
- Minification
- Gzip compression

#### Caching Strategy
- Browser caching for static assets
- API response caching (future)
- Service worker (future)

### Backend Scalability

#### Horizontal Scaling
- Stateless API design
- Can run multiple instances
- Load balancer ready

#### Database Scaling
- Supabase handles connection pooling
- Read replicas available
- Automatic backups
- Point-in-time recovery

#### Caching Layer (Future)
- Redis for session storage
- API response caching
- Rate limiting data

### File System
- Pre-generated flashcards
- Can move to database or S3
- CDN for static assets

## Monitoring & Observability

### Logging
- Morgan for HTTP logs
- Console logging for errors
- Structured logging (future)

### Error Tracking
- Try-catch blocks throughout
- Error boundaries in React
- Sentry integration ready

### Performance Monitoring
- Response time tracking ready
- Database query monitoring
- Frontend performance metrics

## Future Architecture Enhancements

### Phase 1: Real-time Features
- Supabase real-time subscriptions
- Live updates for shared decks
- Collaborative studying

### Phase 2: Microservices
- AI service for flashcard generation
- Audio processing service
- Image processing service

### Phase 3: Caching Layer
- Redis for sessions
- Cache frequently accessed data
- Rate limiting

### Phase 4: Message Queue
- Background job processing
- Email sending queue
- Flashcard generation queue

### Phase 5: CDN & Storage
- S3 for user uploads
- CloudFront for global distribution
- Optimized asset delivery

### Phase 6: Advanced Database
- Vector database for AI features
- Search optimization
- Full-text search

### Phase 7: Mobile Apps
- React Native apps
- Shared API
- Native features

## Development Workflow

### Local Development
```
1. Clone repository
2. Set up Supabase project
3. Configure environment variables
4. Install dependencies
5. Start backend (port 5000)
6. Start frontend (port 5173)
7. Develop with hot reload
```

### Testing Strategy
- Unit tests for utilities
- Component tests for UI
- Integration tests for API
- E2E tests for user flows
- Manual testing checklist

### Deployment Pipeline
```
Code → Git Push → CI/CD → Build → Test → Deploy → Verify
```

## Best Practices Implemented

### Code Quality
- TypeScript for type safety
- ESLint for code quality
- Consistent naming conventions
- Component composition
- DRY principles

### Security
- Environment variables
- JWT authentication
- RLS on database
- Input validation
- Error handling

### Performance
- Efficient re-renders
- Optimized queries
- Indexed database
- Fast build times
- Small bundle size

### Maintainability
- Modular structure
- Clear documentation
- Separation of concerns
- Reusable components
- Type definitions

### User Experience
- Loading states
- Error messages
- Success feedback
- Responsive design
- Smooth animations
