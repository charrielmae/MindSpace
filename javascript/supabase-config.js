// Supabase Configuration
// Using CDN import for better compatibility
const { createClient } = window.supabase;

// Load environment variables from .env file
const supabaseUrl = 'https://wknutsngiknvzvajslgo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndrbnV0c25naWtudnp2YWpzbGdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxNTYyMjUsImV4cCI6MjA5MzczMjIyNX0.vi1FFJ7q-Fv0-mslyd6JD5FgDZtoR7T45wmvl37kJ30';

// Create Supabase client with enhanced configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

// Authentication functions
export const auth = {
  // Register new user
  async signUp(email, password, name) {
    try {
      console.log('Attempting registration with:', { email, name });
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            name: name,
          },
          emailRedirectTo: window.location.origin + '/html/dashboard.html'
        }
      });

      console.log('Registration response:', { data, error });

      if (error) {
        console.error('Supabase registration error:', error);
        throw error;
      }
      
      // Check if user needs email confirmation
      if (data && !data.session) {
        return { 
          success: true, 
          data: data,
          needsConfirmation: true,
          message: 'Please check your email to confirm your account.'
        };
      }
      
      return { success: true, data };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: error.message };
    }
  },

  // Login user
  async signIn(email, password) {
    try {
      console.log('Attempting login with:', { email });
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log('Login response:', { data, error });

      if (error) {
        console.error('Supabase login error:', error);
        throw error;
      }
      
      return { success: true, data };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  },

  // Logout user
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, error: error.message };
    }
  },

  // Get current user
  async getCurrentUser() {
    try {
      // First try to get user from session
      const { data: { user }, error } = await supabase.auth.getUser();
      
      console.log('Get current user response:', { user, error });
      
      if (error) {
        console.error('Supabase get user error:', error);
        
        // If session expired, try to get session from localStorage
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Supabase get session error:', sessionError);
          return { success: false, error: sessionError.message };
        }
        
        if (sessionData?.user) {
          console.log('Found valid session:', sessionData.user);
          return { success: true, user: sessionData.user };
        }
        
        return { success: false, error: 'No active session found' };
      }
      
      return { success: true, user };
    } catch (error) {
      console.error('Get current user error:', error);
      return { success: false, error: error.message };
    }
  },

  // Listen to auth state changes
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', { event, session });
      callback(event, session);
    });
  },

  // Initialize auth system
  async initializeAuth() {
    try {
      console.log('Initializing Supabase auth...');
      
      // Check for existing session
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Session check error:', error);
        return { success: false, error: error.message };
      }
      
      if (session) {
        console.log('Found existing session:', session.user?.email);
        return { success: true, user: session.user };
      }
      
      console.log('No existing session found');
      return { success: true, user: null };
    } catch (error) {
      console.error('Auth initialization error:', error);
      return { success: false, error: error.message };
    }
  }
};

export default auth;
