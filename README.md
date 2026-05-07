# MindSpace - Mental Health Application

## Authentication Setup with Supabase

This application uses Supabase for authentication. Follow these steps to set up authentication:

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Wait for project to be ready

### 2. Configure Environment Variables
1. Open the `.env` file in the root directory
2. Replace the placeholder values with your actual Supabase credentials:
   ```
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_ANON_KEY=your-anon-key-here
   ```
3. Find these values in your Supabase project settings:
   - URL: Project Settings → API → Project URL
   - Anon Key: Project Settings → API → anon/public key

### 3. Authentication Features
The application includes:
- **User Registration**: Create new accounts with email/password
- **User Login**: Sign in existing users
- **Session Management**: Automatic session handling
- **Protected Routes**: Redirect unauthenticated users

### 4. File Structure
```
javascript/
├── supabase-config.js  # Supabase client and auth functions
├── auth.js             # Authentication UI logic
└── [other JS files]

css/
├── auth.css            # Authentication modal styles
└── [other CSS files]

html/
├── landing.html         # Login/Registration page
└── [other HTML files]

.env                   # Environment variables
```

### 5. Authentication Functions
- `auth.signUp(email, password, name)` - Register new user
- `auth.signIn(email, password)` - Login existing user
- `auth.signOut()` - Logout current user
- `auth.getCurrentUser()` - Get current authenticated user

### 6. Usage
1. Open `landing.html` in your browser
2. Click "Sign up" to create a new account
3. Click "Log in" to sign in existing users
4. Successfully authenticated users are redirected to dashboard

### 7. Security Notes
- Passwords are handled securely by Supabase
- Session tokens are managed automatically
- Environment variables keep API keys secure
- Input validation prevents basic attacks

### 8. Development Notes
- For local development, you may need a local server to handle ES modules
- The application uses modern ES6+ JavaScript features
- Responsive design works on mobile and desktop
- Error handling provides user-friendly messages
