// Dashboard JavaScript - MindSpace
// Initialize Supabase directly
const { createClient } = window.supabase;
const supabase = createClient('https://wknutsngiknvzvajslgo.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndrbnV0c25naWtudnp2YWpzbGdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxNTYyMjUsImV4cCI6MjA5MzczMjIyNX0.vi1FFJ7q-Fv0-mslyd6JD5FgDZtoR7T45wmvl37kJ30');

// Authentication functions
const auth = {
  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) {
        console.error('Supabase get user error:', error);
        return { success: false, error: error.message };
      }
      
      return { success: true, user };
    } catch (error) {
      console.error('Get current user error:', error);
      return { success: false, error: error.message };
    }
  },

  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, error: error.message };
    }
  }
};

class DashboardManager {
  constructor() {
    this.currentUser = null;
    this.selectedMood = null;
    this.notifications = [];
    this.sessions = [];
    this.aiModal = null;
    this.sidebarVisible = false;
    this.init();
  }

  init() {
    this.loadUserData();
    this.bindEvents();
    this.loadDashboardData();
    this.startRealTimeUpdates();
    this.initializeAIModal();
    this.initializeSidebar();
    console.log("Dashboard initialized");
  }

  initializeSidebar() {
    // Show sidebar toggle button on scroll
    window.addEventListener('scroll', () => {
      const sidebarToggle = document.querySelector('.sidebar-toggle');
      const sidebar = document.querySelector('.sidebar');
      
      if (window.scrollY > 50) {
        sidebarToggle.style.display = 'block';
        sidebar.classList.add('visible');
      } else {
        sidebarToggle.style.display = 'none';
        sidebar.classList.remove('visible');
      }
    });
  }

  toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    this.sidebarVisible = !this.sidebarVisible;
    
    if (this.sidebarVisible) {
      sidebar.classList.add('visible');
    } else {
      sidebar.classList.remove('visible');
    }
  }

  async handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
      // Sign out from Supabase
      const result = await auth.signOut();
      if (result.success) {
        // Redirect to landing page
        window.location.href = 'landing.html';
      } else {
        this.showNotification('Logout failed. Please try again.', 'error');
      }
    }
  }

  async loadUserData() {
    try {
      const result = await auth.getCurrentUser();
      if (result.success && result.user) {
        // Get user metadata from Supabase
        const userMetadata = result.user.user_metadata || {};
        this.currentUser = {
          id: result.user.id,
          name: userMetadata.full_name || userMetadata.name || 'User',
          email: result.user.email,
          initials: this.getInitials(userMetadata.full_name || userMetadata.name || 'User'),
          status: "Active",
          avatar: null,
        };
        this.updateUserInterface();
        
        // Trigger automatic AI analysis on load
        setTimeout(() => {
          this.updateAIInsights();
        }, 2000);
      } else {
        // Redirect to login if no user found
        window.location.href = 'landing.html';
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      // Redirect to login on error
      window.location.href = 'landing.html';
    }
  }

  getInitials(name) {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .slice(0, 2);
  }

  updateUserInterface() {
    if (!this.currentUser) return;

    // Update user name
    const userNameElement = document.getElementById("userName");
    if (userNameElement) {
      userNameElement.textContent = this.currentUser.name;
    }

    // Update welcome message
    const welcomeElement = document.getElementById("welcomeMessage");
    if (welcomeElement) {
      const firstName = this.currentUser.name.split(' ')[0];
      welcomeElement.textContent = `Welcome back, ${firstName}!`;
    }

    // Update avatar placeholder with initials
    const avatarPlaceholder = document.getElementById("userAvatarPlaceholder");
    if (avatarPlaceholder) {
      avatarPlaceholder.textContent = this.currentUser.initials;
    }
  }

  bindEvents() {
    // Mood tracking
    const moodButtons = document.querySelectorAll(".mood-btn");
    moodButtons.forEach((btn) => {
      btn.addEventListener("click", (e) => this.handleMoodSelection(e));
    });

    // Navigation
    const navLinks = document.querySelectorAll(".nav-link");
    navLinks.forEach((link) => {
      link.addEventListener("click", (e) => this.handleNavigation(e));
    });

    // Quick actions
    const actionCards = document.querySelectorAll(".action-card");
    actionCards.forEach((card) => {
      card.addEventListener("click", (e) => this.handleQuickAction(e));
    });

    // Session buttons
    const sessionButtons = document.querySelectorAll(".session-btn");
    sessionButtons.forEach((btn) => {
      btn.addEventListener("click", (e) => this.handleSessionAction(e));
    });

    // Notifications
    const notificationBtn = document.querySelector(".notification-btn");
    if (notificationBtn) {
      notificationBtn.addEventListener("click", () => this.showNotifications());
    }

    // Mobile menu toggle
    this.addMobileMenuToggle();
  }

  handleMoodSelection(event) {
    const button = event.currentTarget;
    const mood = button.dataset.mood;

    // Remove previous selection
    document.querySelectorAll(".mood-btn").forEach((btn) => {
      btn.classList.remove("selected");
    });

    // Add selection to clicked button
    button.classList.add("selected");
    this.selectedMood = mood;

    // Save mood entry
    this.saveMoodEntry(mood);

    // Show feedback
    this.showMoodFeedback(mood);
  }

  async saveMoodEntry(mood) {
    try {
      const moodEntry = {
        user_id: this.currentUser.id,
        mood: mood,
        notes: `Mood recorded: ${mood}`,
        date: new Date().toISOString().split('T')[0], // Format as YYYY-MM-DD
      };

      // Save to Supabase daily_moods table
      const { data, error } = await supabase
        .from('daily_moods')
        .insert([moodEntry]);

      if (error) {
        console.error('Error saving mood entry:', error);
        this.showNotification('Failed to save mood entry', 'error');
      } else {
        console.log('Mood entry saved:', moodEntry);
        this.showNotification('Mood saved successfully!', 'success');
        
        // Trigger automatic AI insight update after mood save
        setTimeout(() => {
          this.updateAIInsights();
        }, 1000);
      }
    } catch (error) {
      console.error('Error saving mood entry:', error);
      this.showNotification('Failed to save mood entry', 'error');
    }
  }

  showMoodFeedback(mood) {
    const messages = {
      great: "That's wonderful! Keep up the positive energy!",
      good: "Nice to hear you're doing well!",
      okay: "It's okay to have okay days. Take care of yourself.",
      bad: "I'm sorry to hear that. Consider reaching out for support.",
      terrible: "That sounds really tough. Please consider talking to someone.",
    };

    const feedback = messages[mood] || "Thank you for checking in.";
    this.showNotification(feedback, "info");
  }

  handleNavigation(event) {
    const link = event.currentTarget;
    const target = link.getAttribute("href");

    // Update active state
    document.querySelectorAll(".nav-item").forEach((item) => {
      item.classList.remove("active");
    });
    link.closest(".nav-item").classList.add("active");

    // Handle actual navigation
    if (target && target !== "#") {
      // Navigate to the actual page
      window.location.href = target;
    } else {
      // For dashboard (href="#"), just show notification
      console.log("Already on dashboard");
    }
  }

  handleQuickAction(event) {
    const card = event.currentTarget;
    const action = card.querySelector(".action-text").textContent;

    switch (action) {
      case "Start Meditation":
        this.startMeditation();
        break;
      case "Write Journal":
        this.openJournal();
        break;
      case "Daily Check-in":
        this.openDailyCheckin();
        break;
      case "Chat with AI":
        this.openAIChat();
        break;
      default:
        console.log("Unknown action:", action);
    }
  }

  startMeditation() {
    this.showNotification("Starting meditation session...", "info");
    // In a real app, this would open a meditation interface
    setTimeout(() => {
      this.showNotification(
        "Meditation session started! Take a deep breath.",
        "success",
      );
    }, 1500);
  }

  openJournal() {
    this.showNotification("Opening journal...", "info");
    // In a real app, this would open a journal interface
  }

  openDailyCheckin() {
    this.showNotification("Loading daily check-in...", "info");
    // In a real app, this would open a check-in form
  }

  openAIChat() {
    this.showNotification("Connecting to AI assistant...", "info");
    // In a real app, this would open a chat interface
  }

  handleSessionAction(event) {
    const button = event.currentTarget;
    const sessionCard = button.closest(".session-card");
    const sessionTitle =
      sessionCard.querySelector(".session-title").textContent;

    if (button.classList.contains("secondary")) {
      this.showNotification(`Viewing details for: ${sessionTitle}`, "info");
    } else {
      this.showNotification(`Joining session: ${sessionTitle}`, "success");
      // In a real app, this would join the video session
    }
  }

  showNotifications() {
    const notifications = [
      {
        title: "Reminder: Therapy Session",
        message: "Your session is in 1 hour",
        time: "1h ago",
      },
      {
        title: "New Journal Entry",
        message: "You have a new reflection to read",
        time: "2h ago",
      },
      {
        title: "Achievement Unlocked",
        message: "7-day streak! Keep it up!",
        time: "1d ago",
      },
    ];

    // Create notification dropdown (in a real app, this would be a proper dropdown)
    const notificationList = notifications
      .map((n) => `${n.title}: ${n.message} (${n.time})`)
      .join("\n");

    alert("Notifications:\n\n" + notificationList);
  }

  loadDashboardData() {
    this.loadStats();
    this.loadRecentActivity();
    this.loadUpcomingSessions();
    this.updateNotificationBadge();
  }

  loadStats() {
    // Simulate loading stats (in a real app, this would come from an API)
    const stats = {
      sessionsCompleted: this.getRandomNumber(8, 15),
      moodImprovement: this.getRandomNumber(75, 95),
      dayStreak: this.getRandomNumber(3, 14),
      goalsAchieved: this.getRandomNumber(2, 8),
    };

    // Update stat cards
    const statCards = document.querySelectorAll(".stat-card");
    const statValues = Object.values(stats);

    statCards.forEach((card, index) => {
      const numberElement = card.querySelector(".stat-number");
      if (numberElement && statValues[index]) {
        const value = statValues[index];
        const suffix = index === 1 ? "%" : "";
        numberElement.textContent = value + suffix;
      }
    });
  }

  loadRecentActivity() {
    // Activities are already in HTML, but in a real app, this would load from API
    console.log("Recent activity loaded");
  }

  loadUpcomingSessions() {
    // Sessions are already in HTML, but in a real app, this would load from API
    console.log("Upcoming sessions loaded");
  }

  updateNotificationBadge() {
    const badge = document.querySelector(".notification-badge");
    if (badge) {
      const count = this.getRandomNumber(1, 5);
      badge.textContent = count;
      badge.style.display = count > 0 ? "block" : "none";
    }
  }

  startRealTimeUpdates() {
    // Simulate real-time updates
    setInterval(() => {
      this.updateRandomStat();
    }, 30000); // Update every 30 seconds
  }

  updateRandomStat() {
    const statCards = document.querySelectorAll(".stat-card");
    if (statCards.length > 0) {
      const randomCard =
        statCards[Math.floor(Math.random() * statCards.length)];
      const numberElement = randomCard.querySelector(".stat-number");

      if (numberElement) {
        const currentValue = parseInt(numberElement.textContent) || 0;
        const change = Math.random() > 0.5 ? 1 : -1;
        const newValue = Math.max(0, currentValue + change);

        // Add animation
        numberElement.style.transform = "scale(1.2)";
        numberElement.style.color = "#ff6b9d";

        setTimeout(() => {
          const suffix = numberElement.textContent.includes("%") ? "%" : "";
          numberElement.textContent = newValue + suffix;
          numberElement.style.transform = "scale(1)";
          numberElement.style.color = "";
        }, 300);
      }
    }
  }

  showNotification(message, type = "info") {
    // Create notification element
    const notification = document.createElement("div");
    notification.className = `dashboard-notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === "success" ? "#10b981" : type === "error" ? "#ef4444" : "#ff6b9d"};
      color: white;
      padding: 15px 20px;
      border-radius: 10px;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
      z-index: 10000;
      animation: slideIn 0.3s ease-out;
      max-width: 300px;
      font-weight: 500;
    `;

    document.body.appendChild(notification);

    // Auto-remove after 3 seconds
    setTimeout(() => {
      notification.style.animation = "slideOut 0.3s ease-out";
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, 3000);
  }

  addMobileMenuToggle() {
    // Add mobile menu toggle button
    const header = document.querySelector(".dashboard-header");
    if (header && window.innerWidth <= 768) {
      const menuToggle = document.createElement("button");
      menuToggle.className = "mobile-menu-toggle";
      menuToggle.innerHTML = "☰";
      menuToggle.style.cssText = `
        display: none;
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        padding: 8px;
        border-radius: 5px;
      `;

      menuToggle.addEventListener("click", () => {
        const sidebar = document.querySelector(".sidebar");
        sidebar.classList.toggle("open");
      });

      header.insertBefore(menuToggle, header.firstChild);

      // Show on mobile
      if (window.innerWidth <= 768) {
        menuToggle.style.display = "block";
      }

      // Handle resize
      window.addEventListener("resize", () => {
        menuToggle.style.display = window.innerWidth <= 768 ? "block" : "none";
      });
    }
  }

  getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // Public methods
  refreshDashboard() {
    this.loadDashboardData();
    this.showNotification("Dashboard refreshed", "success");
  }

  async logout() {
    const result = await auth.signOut();
    if (result.success) {
      window.location.href = "landing.html";
    } else {
      this.showNotification('Logout failed. Please try again.', 'error');
    }
  }

  initializeAIModal() {
    this.aiModal = document.getElementById('aiInsightModal');
    const openBtn = document.getElementById('openAiInsightModal');
    const closeBtn = document.querySelector('.close-button');
    const analyzeBtn = document.getElementById('analyzeHealthButton');

    if (openBtn) openBtn.addEventListener('click', () => this.openAIModal());
    if (closeBtn) closeBtn.addEventListener('click', () => this.closeAIModal());
    if (analyzeBtn) analyzeBtn.addEventListener('click', () => this.analyzeHealth());
    
    if (this.aiModal) {
      this.aiModal.addEventListener('click', (e) => {
        if (e.target === this.aiModal) this.closeAIModal();
      });
    }
  }

  openAIModal() {
    if (this.aiModal) {
      this.aiModal.style.display = 'block';
      this.getAIRecommendation();
    }
  }

  closeAIModal() {
    if (this.aiModal) {
      this.aiModal.style.display = 'none';
    }
  }

  async analyzeHealth() {
    const analyzeBtn = document.getElementById('analyzeHealthButton');
    const recommendationEl = document.getElementById('aiInsightRecommendation');
    
    if (analyzeBtn) {
      analyzeBtn.disabled = true;
      analyzeBtn.textContent = 'Analyzing...';
    }

    try {
      const recommendation = await this.getAIRecommendation();
      if (recommendationEl) {
        this.updateAIInsightDisplay(recommendation);
      }
    } catch (error) {
      console.error('AI analysis failed:', error);
      if (recommendationEl) {
        recommendationEl.innerHTML = 'Sorry, I encountered an error. Please try again later.';
      }
    } finally {
      if (analyzeBtn) {
        analyzeBtn.disabled = false;
        analyzeBtn.textContent = 'Analyze Health';
      }
    }
  }

  async getAIRecommendation() {
    const recommendationEl = document.getElementById('aiInsightRecommendation');
    if (recommendationEl) {
      recommendationEl.classList.add('loading');
      recommendationEl.textContent = 'Analyzing your mood patterns...';
    }

    try {
      const moodData = this.getRecentMoodData();
      const prompt = this.buildAIPrompt(moodData);
      
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=YOUR_GEMINI_API_KEY_HERE', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            topK: 1,
            topP: 1,
            maxOutputTokens: 300,
          }
        })
      });

      if (!response.ok) throw new Error('API request failed');
      
      const data = await response.json();
      const formattedResponse = this.formatAIResponse(data.candidates[0].content.parts[0].text);
      return formattedResponse;
      
    } catch (error) {
      console.error('Gemini AI API error:', error);
      return this.getFallbackRecommendation(moodData);
    } finally {
      if (recommendationEl) {
        recommendationEl.classList.remove('loading');
      }
    }
  }

  async getRecentMoodData() {
    try {
      const { data, error } = await supabase
        .from('daily_moods')
        .select('*')
        .eq('user_id', this.currentUser.id)
        .order('date', { ascending: false })
        .limit(30); // Get last 30 days for better AI analysis

      if (error) {
        console.error('Error fetching mood data:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching mood data:', error);
      return [];
    }
  }

  buildAIPrompt(moodData) {
    if (!moodData || moodData.length === 0) {
      return "I'm new to mood tracking. Please provide general mental health recommendations for someone starting their wellness journey.";
    }

    const moodSummary = moodData.map(m => `${m.mood} on ${new Date(m.date).toLocaleDateString()}`).join(', ');
    const moodScores = moodData.map(m => m.mood_score || this.getMoodScore(m.mood));
    const avgScore = moodScores.reduce((a, b) => a + b, 0) / moodScores.length;
    const trend = this.calculateMoodTrend(moodScores);
    
    return `Based on my recent mood entries over the last ${moodData.length} days: ${moodSummary}. 
    My average mood score is ${avgScore.toFixed(1)}/5 and my trend is ${trend}. 
    Please provide personalized mental health recommendations in a paragraph followed by 3-4 bullet points with specific actionable suggestions. 
    Consider my mood patterns and provide targeted advice. Keep it encouraging and supportive.`;
  }

  getMoodScore(mood) {
    const scores = {
      'great': 5,
      'good': 4,
      'okay': 3,
      'bad': 2,
      'terrible': 1
    };
    return scores[mood] || 3;
  }

  calculateMoodTrend(scores) {
    if (scores.length < 2) return 'stable';
    
    const recent = scores.slice(0, Math.floor(scores.length / 2));
    const older = scores.slice(Math.floor(scores.length / 2));
    
    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
    
    if (recentAvg > olderAvg + 0.3) return 'improving';
    if (recentAvg < olderAvg - 0.3) return 'declining';
    return 'stable';
  }

  async updateAIInsights() {
    if (!this.currentUser) return;
    
    try {
      const moodData = await this.getRecentMoodData();
      const prompt = this.buildAIPrompt(moodData);
      
      // Cache the insight
      const { data, error } = await supabase
        .from('ai_insights')
        .insert([{
          user_id: this.currentUser.id,
          insight_text: prompt,
          insight_type: 'mood_analysis',
          mood_data: moodData
        }]);
        
      if (error) {
        console.error('Error caching AI insight:', error);
      }
    } catch (error) {
      console.error('Error updating AI insights:', error);
    }
  }

  formatAIResponse(response) {
    const lines = response.split('\n').filter(line => line.trim());
    let formatted = '';
    
    lines.forEach(line => {
      if (line.startsWith('-') || line.startsWith('*') || line.startsWith('•')) {
        formatted += `<li>${line.replace(/^[-*•]\s*/, '')}</li>`;
      } else if (line.trim()) {
        formatted += `<p>${line}</p>`;
      }
    });
    
    return formatted || response;
  }

  updateAIInsightDisplay(formattedText) {
    const recommendationEl = document.getElementById('aiInsightRecommendation');
    if (recommendationEl) {
      recommendationEl.innerHTML = formattedText;
      recommendationEl.classList.remove('loading');
      
      // Make sure modal is visible
      const modal = document.getElementById('aiInsightModal');
      if (modal) {
        modal.style.display = 'block';
      }
    }
  }

  getFallbackRecommendation(moodData) {
    return `<p>Based on your recent mood patterns, here are some personalized recommendations:</p>
    <ul>
      <li>Try a 5-minute mindfulness meditation when feeling overwhelmed</li>
      <li>Take regular breaks and stretch throughout the day</li>
      <li>Connect with a friend or loved one for support</li>
      <li>Engage in a creative activity you enjoy</li>
    </ul>`;
  }
}

// Global functions for dropdown
function toggleUserDropdown() {
  console.log('toggleUserDropdown called');
  const dropdown = document.getElementById("userDropdown");
  console.log('Dropdown element:', dropdown);
  
  if (dropdown) {
    const isVisible = dropdown.classList.contains("show");
    console.log('Dropdown currently visible:', isVisible);
    
    if (isVisible) {
      dropdown.classList.remove("show");
      console.log('Dropdown hidden');
    } else {
      dropdown.classList.add("show");
      console.log('Dropdown shown');
    }
  } else {
    console.error('Dropdown element not found!');
  }
}

function handleLogout() {
  if (window.dashboardManager) {
    window.dashboardManager.handleLogout();
  }
}

// Close dropdown when clicking outside
document.addEventListener('click', function(event) {
  const dropdown = document.getElementById("userDropdown");
  const avatar = document.querySelector(".user-avatar");
  
  if (dropdown && !avatar.contains(event.target) && !dropdown.contains(event.target)) {
    dropdown.classList.remove("show");
  }
});

// Initialize dashboard when DOM is ready
document.addEventListener("DOMContentLoaded", function () {
  window.dashboardManager = new DashboardManager();
});

// Add CSS animations
const style = document.createElement("style");
style.textContent = `
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateX(100%);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes slideOut {
    from {
      opacity: 1;
      transform: translateX(0);
    }
    to {
      opacity: 0;
      transform: translateX(100%);
    }
  }

  .mobile-menu-toggle:hover {
    background: rgba(255, 107, 157, 0.1) !important;
  }

  @media (max-width: 768px) {
    .mobile-menu-toggle {
      display: block !important;
    }
  }
`;
document.head.appendChild(style);
