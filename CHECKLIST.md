# Hadi AI MVP - Setup & Testing Checklist

## Pre-Setup Checklist

- [ ] Node.js 18+ installed
- [ ] npm installed
- [ ] Git installed
- [ ] Text editor ready (VS Code recommended)
- [ ] Supabase account created

## Supabase Setup Checklist

- [ ] Created new Supabase project
- [ ] Saved database password
- [ ] Ran SQL schema from documentation
- [ ] Verified `user_flashcard_states` table exists
- [ ] Enabled Row Level Security
- [ ] Created RLS policies
- [ ] Copied Project URL
- [ ] Copied anon public key
- [ ] Copied service_role key
- [ ] Enabled email authentication
- [ ] (Optional) Disabled email confirmation for testing

## Backend Setup Checklist

- [ ] Navigated to `/backend/api`
- [ ] Ran `npm install`
- [ ] Created `.env` file from `.env.example`
- [ ] Added SUPABASE_URL to `.env`
- [ ] Added SUPABASE_ANON_KEY to `.env`
- [ ] Added SUPABASE_SERVICE_ROLE_KEY to `.env`
- [ ] Verified PORT is set to 5000
- [ ] Verified FRONTEND_URL is http://localhost:5173
- [ ] Started dev server with `npm run dev`
- [ ] Verified server running on port 5000
- [ ] No error messages in terminal

## Frontend Setup Checklist

- [ ] Navigated to `/frontend`
- [ ] Ran `npm install`
- [ ] Created `.env` file from `.env.example`
- [ ] Added VITE_SUPABASE_URL to `.env`
- [ ] Added VITE_SUPABASE_ANON_KEY to `.env`
- [ ] Set VITE_API_URL to http://localhost:5000/api
- [ ] Started dev server with `npm run dev`
- [ ] Verified server running on port 5173
- [ ] No error messages in terminal
- [ ] Browser opened automatically (or opened manually)

## Authentication Testing Checklist

### Sign Up Flow
- [ ] Opened http://localhost:5173
- [ ] Clicked "Sign Up"
- [ ] Entered valid email address
- [ ] Entered password (6+ characters)
- [ ] Confirmed password matches
- [ ] Clicked "Sign Up" button
- [ ] Redirected to verify email page
- [ ] Email shows in verification page
- [ ] Received verification email
- [ ] Email contains 6-digit code
- [ ] Entered code in verification page
- [ ] Clicked "Verify Email"
- [ ] Success message displayed
- [ ] Redirected to sign in page

### Sign In Flow
- [ ] On sign in page
- [ ] Entered email
- [ ] Entered password
- [ ] Clicked "Sign In"
- [ ] Successfully authenticated
- [ ] Redirected to dashboard
- [ ] No error messages

### Session Management
- [ ] Refreshed page while logged in
- [ ] Still logged in (session persisted)
- [ ] User email visible in header
- [ ] Clicked "Sign Out"
- [ ] Logged out successfully
- [ ] Redirected to sign in page
- [ ] Cannot access dashboard when logged out

## Dashboard Testing Checklist

### Layout
- [ ] "Hadi AI" branding visible in header
- [ ] User email displayed in header
- [ ] Sign out button present
- [ ] Sidebar visible on left
- [ ] Main content area on right
- [ ] Responsive design works

### Sidebar Navigation
- [ ] Flashcards link present
- [ ] Qira'at Corrector present with "Soon" badge
- [ ] Chain-of-Narration present with "Soon" badge
- [ ] Qur'an Expanded present with "Soon" badge
- [ ] Icons visible for each item
- [ ] Active route highlighted
- [ ] Clicking items navigates correctly

### Coming Soon Pages
- [ ] Clicked Qira'at Corrector
- [ ] Shows "Coming soon" message
- [ ] Clicked Chain-of-Narration
- [ ] Shows "Coming soon" message
- [ ] Clicked Qur'an Expanded
- [ ] Shows "Coming soon" message

## Flashcards Testing Checklist

### Flashcards Page
- [ ] Clicked Flashcards in sidebar
- [ ] Page loads successfully
- [ ] Book cover visible (icon/gradient)
- [ ] Book title displayed: "An-Nawawi's Forty Hadiths"
- [ ] Book description visible
- [ ] Total flashcards count shown: 100
- [ ] "Generate flashcards" button visible
- [ ] Button is clickable

### First Time Generation
- [ ] Clicked "Generate flashcards"
- [ ] Loading animation appears
- [ ] Loading message shows
- [ ] "This may take 5-10 seconds" message visible
- [ ] Loading spinner animates
- [ ] Waited 5-10 seconds
- [ ] Automatically navigated to viewer
- [ ] Flashcards loaded successfully

### Return to Flashcards Page
- [ ] Clicked back arrow in viewer
- [ ] Returned to flashcards page
- [ ] Button now says "View Flashcards" or shows generated state
- [ ] Success message about flashcards being generated
- [ ] Clicked button again
- [ ] Immediately navigated to viewer (no delay)

### State Persistence
- [ ] Signed out
- [ ] Signed in again
- [ ] Navigated to flashcards
- [ ] State persisted (button shows flashcards generated)

## Flashcard Viewer Testing Checklist

### Initial Load
- [ ] Flashcard viewer loads
- [ ] Back arrow visible at top
- [ ] Progress indicator shows "1 of 100"
- [ ] First flashcard displayed
- [ ] Question is visible
- [ ] Type badge visible (definition/principle/etc)
- [ ] "Click to reveal answer" hint visible
- [ ] Previous button disabled (on first card)
- [ ] Next button enabled

### Card Flip Animation
- [ ] Clicked on card
- [ ] Card flips with 3D animation
- [ ] Smooth animation
- [ ] Answer revealed
- [ ] Context shown (if available)
- [ ] Arabic text shown (if available)
- [ ] Transliteration shown (if available)
- [ ] "Click to flip back" hint visible
- [ ] Clicked again
- [ ] Card flips back to question

### Navigation
- [ ] Clicked Next button
- [ ] Moved to card 2
- [ ] Progress updated: "2 of 100"
- [ ] Previous button now enabled
- [ ] Card resets to question side
- [ ] Clicked Previous
- [ ] Moved back to card 1
- [ ] Progress updated: "1 of 100"
- [ ] Previous button disabled again

### Last Card
- [ ] Navigated to last card (100)
- [ ] Progress shows "100 of 100"
- [ ] Next button disabled
- [ ] Previous button enabled
- [ ] Can flip card normally

### Content Types
- [ ] Found a definition flashcard
- [ ] Type badge shows "definition"
- [ ] Found a principle flashcard
- [ ] Type badge shows "principle"
- [ ] Found a context flashcard
- [ ] Type badge shows "context"
- [ ] Found a tarkeeb flashcard (if any)
- [ ] Arabic text displays correctly
- [ ] Found an arabic_term flashcard (if any)
- [ ] Transliteration displays correctly

### Back Navigation
- [ ] Clicked back arrow
- [ ] Returned to flashcards page
- [ ] Position not lost
- [ ] Can return to viewer
- [ ] Resumes from beginning

## Error Handling Testing Checklist

### Authentication Errors
- [ ] Tried signing in with wrong password
- [ ] Error message displayed
- [ ] Tried signing up with existing email
- [ ] Error message displayed
- [ ] Tried short password (< 6 chars)
- [ ] Error message displayed
- [ ] Tried mismatched passwords
- [ ] Error message displayed

### Network Errors
- [ ] Stopped backend server
- [ ] Tried loading flashcards
- [ ] Error message displayed
- [ ] Restarted backend
- [ ] Tried again
- [ ] Works correctly

### Invalid Routes
- [ ] Tried accessing /dashboard without login
- [ ] Redirected to sign in
- [ ] Tried invalid URL
- [ ] Redirected appropriately

## Browser Compatibility Checklist

- [ ] Tested in Chrome
- [ ] Tested in Firefox
- [ ] Tested in Safari
- [ ] Tested in Edge
- [ ] Works on mobile (responsive)
- [ ] Works on tablet

## Performance Checklist

- [ ] Pages load quickly (< 2 seconds)
- [ ] No console errors
- [ ] No console warnings
- [ ] Animations smooth
- [ ] No memory leaks
- [ ] Backend responds quickly (< 500ms)

## Code Quality Checklist

### Backend
- [ ] No TypeScript errors
- [ ] All routes working
- [ ] Authentication middleware functioning
- [ ] Error handling in place
- [ ] Environment variables loaded
- [ ] CORS configured correctly

### Frontend
- [ ] No TypeScript errors
- [ ] No React warnings
- [ ] All routes working
- [ ] Protected routes working
- [ ] Loading states present
- [ ] Error states present

## Documentation Checklist

- [ ] Read README.md
- [ ] Read QUICK_START.md
- [ ] Read SUPABASE_SETUP.md
- [ ] Understand project structure
- [ ] Know how to start servers
- [ ] Know where to find logs
- [ ] Know how to deploy (read DEPLOYMENT.md)

## Production Readiness Checklist

- [ ] All features working
- [ ] No critical bugs
- [ ] Error handling complete
- [ ] Security implemented
- [ ] Documentation complete
- [ ] Environment variables configured
- [ ] Ready for deployment

## Issues Found

Record any issues encountered:

1. _______________________________________________
2. _______________________________________________
3. _______________________________________________

## Notes

Additional observations or suggestions:

_______________________________________________
_______________________________________________
_______________________________________________

## Sign Off

- [ ] All checklist items completed
- [ ] MVP fully functional
- [ ] Ready for next phase of development

**Tested by:** _______________
**Date:** _______________
**Status:** _______________
