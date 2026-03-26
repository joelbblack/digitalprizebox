# Digital Prize Box

Kids earn it. Parents control it.

## Quick Start

Install dependencies:
npm install

Copy environment variables:
cp .env.example .env.local

Fill in your Supabase URL and anon key, then start the app:
npm start

Opens at http://localhost:3000

## Project Structure

src/
  App.js                  - Router and auth provider
  lib/
    auth.js               - Supabase client and auth context
  screens/
    LoginScreen.jsx       - Login and signup
    DashboardRouter.jsx   - Sends users to right dashboard
    ParentScreen.jsx      - Parent console wrapper
    TeacherScreen.jsx     - Teacher dashboard wrapper
    PrincipalScreen.jsx   - Principal dashboard wrapper
    KidScreen.jsx         - Kid prize box wrapper
    SetupScreen.jsx       - New user onboarding
    RolePicker.jsx        - For parent and teacher accounts
  components/
    ProtectedRoute.jsx    - Auth guard for routes
  dashboards/
    prizebox_parent_v3.jsx
    prizebox_teacher_v2.jsx
    prizebox_principal.jsx
    prizebox_kid_v7.jsx

## Environment Variables

REACT_APP_SUPABASE_URL=https://yourproject.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJ...
REACT_APP_API_URL=https://api.digitalprizebox.com

## Deploy

Push to GitHub and Vercel auto-deploys on every push.
Add environment variables in Vercel project settings.

## Backend

See the backend folder for the Express API in server_v2.js.
Deploy separately to Railway.
