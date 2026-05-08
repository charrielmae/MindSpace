# MindSpace - Mental Wellness Platform

A comprehensive mental health and wellness platform built with HTML, CSS, JavaScript, and Supabase for authentication.

## Features

- User registration and authentication
- Daily mood tracking
- Crisis hotline support
- Wellness activities and recommendations
- Mental health resources
- Responsive design

## Setup Instructions

### 1. Supabase Configuration

Before using the registration and authentication features, you need to set up Supabase:

1. **Create a Supabase Account**
   - Go to [supabase.com](https://supabase.com)
   - Sign up for a free account

2. **Create a New Project**
   - Click "New Project"
   - Choose your organization
   - Set a project name (e.g., "mindspace")
   - Set a database password
   - Choose a region close to you
   - Click "Create new project"

3. **Get Your Project Credentials**
   - Go to Project Settings → API
   - Copy your **Project URL** and **anon public key**

4. **Configure Supabase in Your Project**
   - Open `javascript/supabase-config.js`
   - Replace the placeholder values with your actual Supabase credentials:

   ```javascript
   const SUPABASE_URL = 'https://your-project-id.supabase.co'; // Replace with your Project URL
   const SUPABASE_ANON_KEY = 'your-anon-key-here'; // Replace with your anon public key
   ```

### 2. Enable Email Confirmation

1. In your Supabase project, go to **Authentication → Settings**
2. Under "Site URL", enter your website URL (e.g., `http://localhost:3000` for development)
3. Ensure "Enable email confirmations" is turned on
4. Configure your email templates as needed

### 3. Running the Application

1. **Local Development**
   - Use a local server like Live Server in VS Code
   - Open `html/registration.html` to test registration
   - Open `html/login.html` for the login page

2. **Testing Registration**
   - Fill out the registration form
   - Check your email for confirmation
   - Confirm your account to complete registration

## Project Structure

```
MindSpace/
├── html/
│   ├── index.html              # Main landing page
│   ├── registration.html        # User registration
│   ├── dashboard.html           # User dashboard
│   ├── daily-mood.html         # Mood tracking
│   └── crisis-hotline.html     # Crisis support
├── css/
│   ├── register.css            # Registration page styles
│   ├── auth.css                # Authentication styles
│   └── [other CSS files]
├── javascript/
│   ├── supabase-config.js      # Supabase configuration
│   ├── script.js               # Main scripts
│   └── [other JS files]
└── images/
    └── [image assets]
```

## Authentication Features

The registration system includes:

- **Email/Password Registration**: Users can create accounts with email and password
- **Email Verification**: Automatic email confirmation for new accounts
- **Password Validation**: Client-side validation for password strength
- **Error Handling**: Comprehensive error messages for user feedback
- **Loading States**: Visual feedback during registration process

## Security Notes

- Passwords are handled securely by Supabase Auth
- Email verification prevents fake accounts
- Client-side validation complements server-side security
- No sensitive data is stored in localStorage

## Troubleshooting

### Registration Not Working

1. **Check Supabase Configuration**
   - Ensure your SUPABASE_URL and SUPABASE_ANON_KEY are correct
   - Verify your Supabase project is active

2. **Browser Console Errors**
   - Open browser developer tools
   - Check for JavaScript errors in the console
   - Verify the supabase-config.js file is loading correctly

3. **Email Not Received**
   - Check spam/junk folders
   - Verify email configuration in Supabase settings
   - Ensure the email address is valid

4. **Network Issues**
   - Check internet connection
   - Verify CORS settings in Supabase if needed
   - Ensure your local server is running

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Support

For issues or questions:
- Check the troubleshooting section above
- Review Supabase documentation at [docs.supabase.com](https://docs.supabase.com)
- Create an issue in the project repository

---

**Note**: This application requires a working Supabase project for authentication features to function properly.
