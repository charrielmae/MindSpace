// Authentication Manager for MindSpace
import { auth } from './supabase-config.js';

class AuthManager {
  constructor() {
    this.init();
  }

  async init() {
    // Initialize Supabase auth system
    console.log('Initializing authentication system...');
    
    try {
      const initResult = await auth.initializeAuth();
      if (initResult.success) {
        console.log('Auth system initialized successfully');
        if (initResult.user) {
          console.log('User already logged in:', initResult.user.email);
          
          // Only redirect to dashboard if not on login/registration pages
          const currentPage = window.location.pathname;
          const isAuthPage = currentPage.includes('login.html') || currentPage.includes('registration.html');
          
          if (!isAuthPage) {
            console.log('Redirecting to dashboard (not on auth page)');
            window.location.href = 'dashboard.html';
            return;
          }
        }
      } else {
        console.error('Auth initialization failed:', initResult.error);
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
    }
    
    this.setupEventListeners();
    this.checkAuthState();
  }

  setupEventListeners() {
    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleLogin();
      });
    }

    // Register form
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
      registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleRegister();
      });
    }

    // Modal toggles
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const closeModals = document.querySelectorAll('.close-modal');
    const switchToRegister = document.getElementById('switchToRegister');
    const switchToLogin = document.getElementById('switchToLogin');

    if (loginBtn) {
      loginBtn.addEventListener('click', () => this.showModal('loginModal'));
    }

    if (registerBtn) {
      registerBtn.addEventListener('click', () => this.showModal('registerModal'));
    }

    closeModals.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.target.closest('.modal').classList.remove('active');
      });
    });

    // Get Started button
    const getStartedBtn = document.getElementById('getStartedBtn');
    if (getStartedBtn) {
      getStartedBtn.addEventListener('click', () => this.showModal('registerModal'));
    }

    // Modal switching
    if (switchToRegister) {
      switchToRegister.addEventListener('click', (e) => {
        e.preventDefault();
        this.hideModal('loginModal');
        this.showModal('registerModal');
      });
    }

    if (switchToLogin) {
      switchToLogin.addEventListener('click', (e) => {
        e.preventDefault();
        this.hideModal('registerModal');
        this.showModal('loginModal');
      });
    }
  }

  async handleLogin() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const submitBtn = document.getElementById('loginSubmit');
    
    console.log('Login form data:', { email, passwordLength: password.length });

    // Validation
    if (!email || !password) {
      console.log('Email or password validation failed');
      this.showNotification('Please fill in all fields', 'error');
      return;
    }

    // Show loading state
    submitBtn.textContent = 'Logging in...';
    submitBtn.disabled = true;

    try {
      console.log('Calling auth.signIn...');
      const result = await auth.signIn(email, password);
      console.log('Login result:', result);
      
      if (result.success) {
        console.log('Login successful');
        this.showNotification('Login successful!', 'success');
        setTimeout(() => {
          window.location.href = 'dashboard.html';
        }, 1500);
      } else {
        console.log('Login failed:', result.error);
        this.showNotification(result.error, 'error');
      }
    } catch (error) {
      console.error('Login exception:', error);
      this.showNotification('Login failed. Please try again.', 'error');
    } finally {
      submitBtn.textContent = 'Log in';
      submitBtn.disabled = false;
    }
  }

  async handleRegister() {
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerConfirmPassword').value;
    const submitBtn = document.getElementById('registerSubmit');

    console.log('Registration form data:', { name, email, passwordLength: password.length });

    // Validation
    if (password !== confirmPassword) {
      console.log('Password validation failed');
      this.showNotification('Passwords do not match', 'error');
      return;
    }

    if (password.length < 6) {
      console.log('Password length validation failed');
      this.showNotification('Password must be at least 6 characters', 'error');
      return;
    }

    if (!email || !name) {
      console.log('Email or name validation failed');
      this.showNotification('Please fill in all fields', 'error');
      return;
    }

    // Show loading state
    submitBtn.textContent = 'Creating account...';
    submitBtn.disabled = true;

    try {
      console.log('Calling auth.signUp...');
      const result = await auth.signUp(email, password, name);
      console.log('Registration result:', result);
      
      if (result.success) {
        console.log('Registration successful');
        
        if (result.autoLogin) {
          // Auto-login successful, redirect to dashboard
          this.showNotification('Account created successfully! Redirecting to dashboard...', 'success');
          setTimeout(() => {
            window.location.href = 'dashboard.html';
          }, 1500);
        } else {
          // Manual login required
          this.showNotification('Account created successfully! You can now log in.', 'success');
          // Clear form
          document.getElementById('registerForm').reset();
          setTimeout(() => {
            this.showModal('loginModal');
          }, 2000);
        }
      } else {
        console.log('Registration failed:', result.error);
        this.showNotification(result.error, 'error');
      }
    } catch (error) {
      console.error('Registration exception:', error);
      this.showNotification('Registration failed. Please try again.', 'error');
    } finally {
      submitBtn.textContent = 'Sign up';
      submitBtn.disabled = false;
    }
  }

  async checkAuthState() {
    const result = await auth.getCurrentUser();
    
    if (result.success && result.user) {
      // Only redirect to dashboard if not on login/registration pages
      const currentPage = window.location.pathname;
      const isAuthPage = currentPage.includes('login.html') || currentPage.includes('registration.html');
      
      if (!isAuthPage) {
        console.log('User logged in, redirecting to dashboard');
        window.location.href = 'dashboard.html';
      }
    }
  }

  showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('active');
      // Clear any previous error messages
      this.clearFormErrors(modalId);
    }
  }

  hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('active');
    }
  }

  showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  clearFormErrors(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      const inputs = modal.querySelectorAll('input');
      inputs.forEach(input => {
        input.classList.remove('error');
      });
    }
  }
}

// Initialize auth manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new AuthManager();
});

export default AuthManager;
