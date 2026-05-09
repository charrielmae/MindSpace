// Supabase configuration and authentication module
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Supabase configuration
const SUPABASE_URL = 'https://wknutsngiknvzvajslgo.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndrbnV0c25naWtudnp2YWpzbGdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxNTYyMjUsImV4cCI6MjA5MzczMjIyNX0.vi1FFJ7q-Fv0-mslyd6JD5FgDZtoR7T45wmvl37kJ30';

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Authentication object with signup and login methods
export const auth = {
    // Initialize authentication system
    async initializeAuth() {
        try {
            const { data: { user }, error } = await supabase.auth.getUser();
            
            if (error) {
                console.error('Auth initialization error:', error);
                return {
                    success: false,
                    error: error.message
                };
            }

            return {
                success: true,
                user: user
            };
        } catch (error) {
            console.error('Unexpected auth initialization error:', error);
            return {
                success: false,
                error: 'Authentication initialization failed'
            };
        }
    },

    // Sign up new user
    async signUp(email, password, name) {
        try {
            const { data, error } = await supabase.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: {
                        full_name: name
                    },
                    emailRedirectTo: undefined // Disable email confirmation
                }
            });

            if (error) {
                console.error('Signup error:', error);
                return {
                    success: false,
                    error: error.message || 'Registration failed'
                };
            }

            // Auto-login after successful signup
            if (data.user && !data.session) {
                // If user created but no session (email confirmation disabled), try to sign in
                const signInResult = await this.signIn(email, password);
                if (signInResult.success) {
                    return {
                        success: true,
                        data: signInResult.data,
                        autoLogin: true
                    };
                }
            }

            return {
                success: true,
                data: data,
                autoLogin: !!data.session
            };
        } catch (error) {
            console.error('Unexpected signup error:', error);
            return {
                success: false,
                error: 'An unexpected error occurred during signup'
            };
        }
    },

    // Sign in existing user
    async signIn(email, password) {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email,
                password: password
            });

            if (error) {
                console.error('Signin error:', error);
                return {
                    success: false,
                    error: error.message || 'Login failed'
                };
            }

            return {
                success: true,
                data: data
            };
        } catch (error) {
            console.error('Unexpected signin error:', error);
            return {
                success: false,
                error: 'An unexpected error occurred during signin'
            };
        }
    },

    // Sign out current user
    async signOut() {
        try {
            const { error } = await supabase.auth.signOut();
            
            if (error) {
                console.error('Signout error:', error);
                return {
                    success: false,
                    error: error.message || 'Sign out failed'
                };
            }

            return {
                success: true
            };
        } catch (error) {
            console.error('Unexpected signout error:', error);
            return {
                success: false,
                error: 'An unexpected error occurred during signout'
            };
        }
    },

    // Get current user
    async getCurrentUser() {
        try {
            const { data: { user }, error } = await supabase.auth.getUser();
            
            if (error) {
                console.error('Get user error:', error);
                return {
                    success: false,
                    error: error.message || 'Failed to get current user'
                };
            }

            return {
                success: true,
                user: user
            };
        } catch (error) {
            console.error('Unexpected get user error:', error);
            return {
                success: false,
                error: 'Failed to get current user'
            };
        }
    },

    // Listen to auth state changes
    onAuthStateChange(callback) {
        return supabase.auth.onAuthStateChange(callback);
    }
};

// Export supabase client for direct access if needed
export { supabase };
