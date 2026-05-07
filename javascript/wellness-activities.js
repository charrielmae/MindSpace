// Wellness Activities Page JavaScript - MindSpace

class WellnessActivitiesManager {
  constructor() {
    this.currentPage = "wellness-activities";
    this.selectedCategory = "all";
    this.activities = [];
    this.userProgress = {
      streak: 12,
      totalMinutes: 245,
      activitiesCompleted: 18,
      favoriteCategory: "Meditation",
    };
    this.activitiesPagination = {
      currentPage: 1,
      itemsPerPage: 4,
      totalItems: 0,
      totalPages: 0,
    };
    this.init();
  }

  init() {
    this.bindEvents();
    this.loadActivities();
    this.renderActivities();
    this.updateProgressStats();
    this.initializeChart();
    console.log("Wellness Activities page initialized");
  }

  bindEvents() {
    // Navigation
    const navLinks = document.querySelectorAll(".nav-link");
    navLinks.forEach((link) => {
      link.addEventListener("click", (e) => this.handleNavigation(e));
    });

    // Logout functionality
    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => this.handleLogout());
    }

    // Category selection
    const categoryCards = document.querySelectorAll(".category-card");
    categoryCards.forEach((card) => {
      card.addEventListener("click", (e) => this.handleCategorySelection(e));
    });

    // Search and filters
    const searchInput = document.getElementById("searchInput");
    const durationFilter = document.getElementById("durationFilter");
    const difficultyFilter = document.getElementById("difficultyFilter");
    const searchBtn = document.querySelector(".search-btn");

    if (searchInput) {
      searchInput.addEventListener("input", () => this.filterActivities());
    }

    if (durationFilter) {
      durationFilter.addEventListener("change", () => this.filterActivities());
    }

    if (difficultyFilter) {
      difficultyFilter.addEventListener("change", () =>
        this.filterActivities(),
      );
    }

    if (searchBtn) {
      searchBtn.addEventListener("click", () => this.filterActivities());
    }

    // Notifications
    const notificationBtn = document.querySelector(".notification-btn");
    if (notificationBtn) {
      notificationBtn.addEventListener("click", () => this.showNotifications());
    }

    // Activities pagination controls
    const activitiesPrevBtn = document.getElementById("activitiesPrevBtn");
    const activitiesNextBtn = document.getElementById("activitiesNextBtn");

    if (activitiesPrevBtn) {
      activitiesPrevBtn.addEventListener("click", () =>
        this.goToPreviousActivitiesPage(),
      );
    }

    if (activitiesNextBtn) {
      activitiesNextBtn.addEventListener("click", () =>
        this.goToNextActivitiesPage(),
      );
    }

    // Mobile menu toggle
    this.addMobileMenuToggle();
  }

  handleNavigation(event) {
    event.preventDefault();
    const link = event.currentTarget;
    const href = link.getAttribute("href");

    if (href === "#") {
      return;
    }

    window.location.href = href;
  }

  handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('mindspace_user');
      window.location.href = 'landing.html';
    }
  }

  handleCategorySelection(event) {
    const card = event.currentTarget;
    const category = card.dataset.category;

    // Update active state
    document.querySelectorAll(".category-card").forEach((c) => {
      c.classList.remove("active");
    });
    card.classList.add("active");

    this.selectedCategory = category;
    this.filterActivities();
  }

  loadActivities() {
    // Generate sample wellness activities
    this.activities = [
      {
        id: 1,
        title: "5-Minute Mindfulness Meditation",
        description:
          "Quick guided meditation to reduce stress and improve focus. Perfect for busy schedules.",
        category: "meditation",
        duration: 5,
        difficulty: "Beginner",
        icon: "🧘‍♀️",
        featured: true,
        badge: "Featured",
      },
      {
        id: 2,
        title: "Morning Yoga Flow",
        description:
          "Gentle yoga sequence to energize your body and mind for the day ahead.",
        category: "physical",
        duration: 15,
        difficulty: "Beginner",
        icon: "🏃‍♀️",
        featured: true,
        badge: "Popular",
      },
      {
        id: 3,
        title: "Expressive Art Journaling",
        description:
          "Use art to express emotions and process thoughts. No artistic experience required.",
        category: "creative",
        duration: 20,
        difficulty: "All Levels",
        icon: "🎨",
        featured: true,
        badge: "New",
      },
      {
        id: 4,
        title: "Progressive Muscle Relaxation",
        description:
          "Systematic relaxation technique to release tension and promote deep relaxation.",
        category: "meditation",
        duration: 10,
        difficulty: "Beginner",
        icon: "😌",
      },
      {
        id: 5,
        title: "Nature Walk Meditation",
        description:
          "Mindful walking exercise connecting with nature and your surroundings.",
        category: "physical",
        duration: 30,
        difficulty: "Beginner",
        icon: "🌳",
      },
      {
        id: 6,
        title: "Gratitude Journaling",
        description:
          "Practice gratitude to shift focus to positive aspects of your life.",
        category: "creative",
        duration: 15,
        difficulty: "Beginner",
        icon: "🙏",
      },
      {
        id: 7,
        title: "Breathing Exercises for Anxiety",
        description:
          "Specific breathing techniques to calm anxiety and panic symptoms.",
        category: "meditation",
        duration: 8,
        difficulty: "Beginner",
        icon: "🫁",
      },
      {
        id: 8,
        title: "Dance Therapy",
        description:
          "Express yourself through movement and music to release emotions.",
        category: "physical",
        duration: 25,
        difficulty: "Intermediate",
        icon: "💃",
      },
      {
        id: 9,
        title: "Creative Writing Prompts",
        description:
          "Use writing prompts to explore thoughts and feelings in a structured way.",
        category: "creative",
        duration: 20,
        difficulty: "All Levels",
        icon: "✍️",
      },
      {
        id: 10,
        title: "Group Meditation Circle",
        description:
          "Join others in a guided group meditation session for shared energy.",
        category: "social",
        duration: 30,
        difficulty: "Beginner",
        icon: "👥",
      },
      {
        id: 11,
        title: "Support Group Discussion",
        description:
          "Connect with others facing similar challenges in a supportive environment.",
        category: "social",
        duration: 45,
        difficulty: "All Levels",
        icon: "💬",
      },
      {
        id: 12,
        title: "Mental Health Education",
        description: "Learn about mental health topics and coping strategies.",
        category: "educational",
        duration: 20,
        difficulty: "Beginner",
        icon: "📚",
      },
      {
        id: 13,
        title: "Stress Management Workshop",
        description:
          "Comprehensive workshop on identifying and managing stress triggers.",
        category: "educational",
        duration: 60,
        difficulty: "Intermediate",
        icon: "🎯",
      },
      {
        id: 14,
        title: "Body Scan Meditation",
        description:
          "Systematic awareness of bodily sensations for deep relaxation.",
        category: "meditation",
        duration: 20,
        difficulty: "Beginner",
        icon: "🧘",
      },
      {
        id: 15,
        title: "HIIT Workout for Mental Health",
        description:
          "High-intensity interval training to boost mood and energy.",
        category: "physical",
        duration: 20,
        difficulty: "Advanced",
        icon: "💪",
      },
      {
        id: 16,
        title: "Music Therapy Session",
        description: "Use music to explore emotions and promote healing.",
        category: "creative",
        duration: 30,
        difficulty: "All Levels",
        icon: "🎵",
      },
      {
        id: 17,
        title: "Community Service Project",
        description:
          "Volunteer for a cause that matters to you and build connections.",
        category: "social",
        duration: 120,
        difficulty: "Intermediate",
        icon: "🤝",
      },
      {
        id: 18,
        title: "Mindfulness-Based Cognitive Therapy",
        description: "Learn MBCT techniques to manage depression and anxiety.",
        category: "educational",
        duration: 45,
        difficulty: "Intermediate",
        icon: "🧠",
      },
    ];
  }

  renderActivities(activities = this.activities) {
    const activitiesGrid = document.getElementById("activitiesGrid");
    if (!activitiesGrid) return;

    // Update pagination info
    this.activitiesPagination.totalItems = activities.length;
    this.activitiesPagination.totalPages = Math.ceil(
      this.activitiesPagination.totalItems /
        this.activitiesPagination.itemsPerPage,
    );

    // Reset to page 1 if current page is out of bounds
    if (
      this.activitiesPagination.currentPage >
      this.activitiesPagination.totalPages
    ) {
      this.activitiesPagination.currentPage = 1;
    }

    if (activities.length === 0) {
      activitiesGrid.innerHTML = `
        <div class="no-activities">
          <p>No activities found matching your criteria. Try adjusting your filters.</p>
        </div>
      `;
      this.updateActivitiesPaginationControls();
      return;
    }

    // Get paginated data
    const startIndex =
      (this.activitiesPagination.currentPage - 1) *
      this.activitiesPagination.itemsPerPage;
    const endIndex = startIndex + this.activitiesPagination.itemsPerPage;
    const paginatedActivities = activities.slice(startIndex, endIndex);

    const activitiesHTML = paginatedActivities
      .map(
        (activity) => `
      <div class="activity-card ${activity.featured ? "featured" : ""}">
        <div class="activity-header">
          <div class="activity-icon">${activity.icon}</div>
          ${activity.badge ? `<div class="activity-badge">${activity.badge}</div>` : ""}
        </div>
        <div class="activity-content">
          <h3>${activity.title}</h3>
          <p>${activity.description}</p>
          <div class="activity-meta">
            <span class="duration">${activity.duration} min</span>
            <span class="difficulty">${activity.difficulty}</span>
            <span class="category">${activity.category}</span>
          </div>
          <button class="activity-btn" onclick="window.wellnessActivitiesManager.startActivity(${activity.id})">Start Activity</button>
        </div>
      </div>
    `,
      )
      .join("");

    activitiesGrid.innerHTML = activitiesHTML;
    this.updateActivitiesPaginationControls();
  }

  filterActivities() {
    const searchTerm =
      document.getElementById("searchInput")?.value.toLowerCase() || "";
    const durationFilter =
      document.getElementById("durationFilter")?.value || "";
    const difficultyFilter =
      document.getElementById("difficultyFilter")?.value || "";

    let filteredActivities = this.activities;

    // Filter by category
    if (this.selectedCategory !== "all") {
      filteredActivities = filteredActivities.filter(
        (activity) => activity.category === this.selectedCategory,
      );
    }

    // Filter by search term
    if (searchTerm) {
      filteredActivities = filteredActivities.filter(
        (activity) =>
          activity.title.toLowerCase().includes(searchTerm) ||
          activity.description.toLowerCase().includes(searchTerm),
      );
    }

    // Filter by duration
    if (durationFilter) {
      filteredActivities = filteredActivities.filter((activity) => {
        switch (durationFilter) {
          case "short":
            return activity.duration < 10;
          case "medium":
            return activity.duration >= 10 && activity.duration <= 20;
          case "long":
            return activity.duration > 20;
          default:
            return true;
        }
      });
    }

    // Filter by difficulty
    if (difficultyFilter) {
      filteredActivities = filteredActivities.filter(
        (activity) =>
          activity.difficulty.toLowerCase() === difficultyFilter.toLowerCase(),
      );
    }

    // Reset to page 1 when filters change
    this.activitiesPagination.currentPage = 1;
    this.renderActivities(filteredActivities);
  }

  startActivity(activityId) {
    const activity = this.activities.find((a) => a.id === activityId);
    if (!activity) return;

    this.showNotification(`Starting ${activity.title}...`, "info");

    // In a real app, this would launch the activity
    setTimeout(() => {
      this.showActivityModal(activity);
    }, 1000);
  }

  showActivityModal(activity) {
    const modal = this.createModal(
      activity.title,
      `
      <div class="activity-modal">
        <div class="activity-preview">
          <div class="activity-icon-large">${activity.icon}</div>
          <div class="activity-info">
            <div class="activity-meta">
              <span class="duration">${activity.duration} min</span>
              <span class="difficulty">${activity.difficulty}</span>
              <span class="category">${activity.category}</span>
            </div>
            <p class="activity-description">${activity.description}</p>
          </div>
        </div>
        
        <div class="activity-instructions">
          <h4>Instructions</h4>
          <p>Find a comfortable space where you won't be disturbed. Set aside ${activity.duration} minutes for this activity. Have any materials ready (journal, pen, etc.) if needed.</p>
        </div>
        
        <div class="activity-actions">
          <button class="start-activity-btn" onclick="window.wellnessActivitiesManager.launchActivity(${activity.id})">Start Now</button>
          <button class="schedule-activity-btn" onclick="window.wellnessActivitiesManager.scheduleActivity(${activity.id})">Schedule Later</button>
        </div>
      </div>
    `,
    );
  }

  launchActivity(activityId) {
    const activity = this.activities.find((a) => a.id === activityId);
    if (!activity) return;

    // Update user progress
    this.userProgress.activitiesCompleted++;
    this.userProgress.totalMinutes += activity.duration;
    this.updateProgressStats();

    this.showNotification(
      `Activity started! Timer set for ${activity.duration} minutes.`,
      "success",
    );
    this.closeModal();

    // In a real app, this would start a timer and launch the activity content
    this.startActivityTimer(activity);
  }

  scheduleActivity(activityId) {
    const activity = this.activities.find((a) => a.id === activityId);
    if (!activity) return;

    this.showNotification(`Scheduling ${activity.title}...`, "info");
    // In a real app, this would open a scheduling interface
    setTimeout(() => {
      this.showNotification("Activity scheduled successfully!", "success");
      this.closeModal();
    }, 1500);
  }

  startActivityTimer(activity) {
    // Create a simple timer notification
    let timeRemaining = activity.duration * 60; // Convert to seconds

    const timerInterval = setInterval(() => {
      timeRemaining--;

      if (timeRemaining <= 0) {
        clearInterval(timerInterval);
        this.showNotification(
          `Activity completed! Great job on ${activity.title}`,
          "success",
        );
        this.completeActivity(activity.id);
      }
    }, 1000);

    // Store timer reference
    this.currentTimer = timerInterval;
  }

  completeActivity(activityId) {
    const activity = this.activities.find((a) => a.id === activityId);
    if (!activity) return;

    // Update streak (simplified logic)
    const today = new Date().toDateString();
    const lastActivity = localStorage.getItem("lastActivityDate");

    if (lastActivity !== today) {
      this.userProgress.streak++;
      localStorage.setItem("lastActivityDate", today);
    }

    this.updateProgressStats();
    this.saveProgress();
  }

  updateProgressStats() {
    const stats = this.userProgress;

    // Update stat cards
    const statElements = {
      "stat-number": [
        stats.streak,
        stats.totalMinutes,
        stats.activitiesCompleted,
        stats.favoriteCategory,
      ],
    };

    const statCards = document.querySelectorAll(".stat-card");
    statCards.forEach((card, index) => {
      const numberElement = card.querySelector(".stat-number");
      if (numberElement && statElements["stat-number"][index] !== undefined) {
        numberElement.textContent = statElements["stat-number"][index];
      }
    });
  }

  saveProgress() {
    try {
      localStorage.setItem(
        "mindspace_wellness_progress",
        JSON.stringify(this.userProgress),
      );
    } catch (error) {
      console.error("Error saving progress:", error);
    }
  }

  loadProgress() {
    try {
      const savedProgress = localStorage.getItem("mindspace_wellness_progress");
      if (savedProgress) {
        this.userProgress = JSON.parse(savedProgress);
      }
    } catch (error) {
      console.error("Error loading progress:", error);
    }
  }

  initializeChart() {
    const canvas = document.getElementById("progressChart");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    // Generate sample weekly data
    const weekData = [45, 30, 60, 25, 40, 55, 35]; // Minutes per day
    const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    this.drawProgressChart(
      ctx,
      weekData,
      weekDays,
      canvas.width,
      canvas.height,
    );
  }

  drawProgressChart(ctx, data, labels, width, height) {
    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw axes
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.stroke();

    // Calculate scales
    const maxValue = Math.max(...data);
    const xStep = chartWidth / (data.length - 1);
    const yScale = chartHeight / maxValue;

    // Draw data
    ctx.strokeStyle = "#ff6b9d";
    ctx.fillStyle = "rgba(255, 107, 157, 0.1)";
    ctx.lineWidth = 2;

    // Draw filled area
    ctx.beginPath();
    data.forEach((value, index) => {
      const x = padding + index * xStep;
      const y = height - padding - value * yScale;

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    // Complete the area
    ctx.lineTo(width - padding, height - padding);
    ctx.lineTo(padding, height - padding);
    ctx.closePath();
    ctx.fill();

    // Draw line
    ctx.beginPath();
    data.forEach((value, index) => {
      const x = padding + index * xStep;
      const y = height - padding - value * yScale;

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();

    // Draw points
    data.forEach((value, index) => {
      const x = padding + index * xStep;
      const y = height - padding - value * yScale;

      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = "#ff6b9d";
      ctx.fill();
    });

    // Draw labels
    ctx.fillStyle = "#718096";
    ctx.font = "12px Poppins";
    ctx.textAlign = "center";

    labels.forEach((label, index) => {
      const x = padding + index * xStep;
      ctx.fillText(label, x, height - padding + 20);
    });

    // Y-axis labels
    ctx.textAlign = "right";
    for (let i = 0; i <= maxValue; i += 15) {
      const y = height - padding - i * yScale;
      ctx.fillText(i.toString(), padding - 10, y + 4);
    }
  }

  showNotifications() {
    const notifications = [
      {
        title: "New Activity Available",
        message: "Try our new mindfulness breathing exercise",
        time: "2h ago",
      },
      {
        title: "Streak Milestone",
        message: "Congratulations on 12-day streak!",
        time: "1d ago",
      },
      {
        title: "Activity Reminder",
        message: "Don't forget your daily wellness practice",
        time: "2d ago",
      },
    ];

    const notificationList = notifications
      .map(
        (n) =>
          `<div class="notification-item">
        <div class="notification-content">
          <div class="notification-title">${n.title}</div>
          <div class="notification-message">${n.message}</div>
          <div class="notification-time">${n.time}</div>
        </div>
      </div>`,
      )
      .join("");

    this.createModal(
      "Notifications",
      `
      <div class="notifications-list">
        ${notificationList}
      </div>
    `,
    );
  }

  createModal(title, content) {
    // Remove existing modal
    const existingModal = document.querySelector(".modal-overlay");
    if (existingModal) {
      existingModal.remove();
    }

    const modal = document.createElement("div");
    modal.className = "modal-overlay";
    modal.innerHTML = `
      <div class="modal">
        <div class="modal-header">
          <h3>${title}</h3>
          <button class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
          ${content}
        </div>
      </div>
    `;

    // Add modal styles
    const modalStyles = `
      .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        animation: fadeIn 0.3s ease-out;
      }
      
      .modal {
        background: white;
        border-radius: 20px;
        max-width: 600px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
        animation: slideUp 0.3s ease-out;
      }
      
      .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px 25px;
        border-bottom: 1px solid rgba(255, 107, 157, 0.1);
      }
      
      .modal-header h3 {
        margin: 0;
        color: #2d3748;
        font-size: 1.5rem;
        font-weight: 600;
      }
      
      .modal-close {
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        color: #718096;
        padding: 5px;
        border-radius: 50%;
        transition: all 0.3s ease;
      }
      
      .modal-close:hover {
        background: rgba(255, 107, 157, 0.1);
        color: #ff6b9d;
      }
      
      .modal-body {
        padding: 25px;
      }
      
      .activity-modal {
        text-align: center;
      }
      
      .activity-preview {
        display: flex;
        gap: 20px;
        align-items: center;
        margin-bottom: 30px;
        justify-content: center;
      }
      
      .activity-icon-large {
        font-size: 4rem;
        width: 100px;
        height: 100px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(255, 107, 157, 0.1);
        border-radius: 20px;
      }
      
      .activity-info {
        text-align: left;
      }
      
      .activity-description {
        color: #718096;
        line-height: 1.6;
        margin-top: 15px;
      }
      
      .activity-instructions {
        background: rgba(255, 107, 157, 0.05);
        border-radius: 15px;
        padding: 20px;
        margin-bottom: 30px;
        text-align: left;
      }
      
      .activity-instructions h4 {
        color: #2d3748;
        margin-bottom: 10px;
      }
      
      .activity-actions {
        display: flex;
        gap: 15px;
        justify-content: center;
      }
      
      .start-activity-btn {
        background: linear-gradient(135deg, #ff6b9d, #ff8fa3);
        color: white;
        border: none;
        padding: 15px 30px;
        border-radius: 25px;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
      }
      
      .schedule-activity-btn {
        background: rgba(255, 255, 255, 0.8);
        color: #ff6b9d;
        border: 2px solid rgba(255, 107, 157, 0.3);
        padding: 15px 30px;
        border-radius: 25px;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
      }
      
      .start-activity-btn:hover,
      .schedule-activity-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 15px rgba(255, 107, 157, 0.3);
      }
      
      .notification-item {
        padding: 15px;
        background: rgba(255, 255, 255, 0.5);
        border-radius: 10px;
        margin-bottom: 10px;
        transition: all 0.3s ease;
      }
      
      .notification-item:hover {
        background: rgba(255, 107, 157, 0.05);
      }
      
      .notification-title {
        font-weight: 600;
        color: #2d3748;
        margin-bottom: 5px;
      }
      
      .notification-message {
        color: #718096;
        margin-bottom: 5px;
      }
      
      .notification-time {
        color: #a0aec0;
        font-size: 0.85rem;
      }
      
      @keyframes slideUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `;

    // Add styles if not already added
    if (!document.querySelector("#modal-styles")) {
      const styleElement = document.createElement("style");
      styleElement.id = "modal-styles";
      styleElement.textContent = modalStyles;
      document.head.appendChild(styleElement);
    }

    document.body.appendChild(modal);

    // Close modal functionality
    const closeBtn = modal.querySelector(".modal-close");
    closeBtn.addEventListener("click", () => this.closeModal());

    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        this.closeModal();
      }
    });
  }

  closeModal() {
    const modal = document.querySelector(".modal-overlay");
    if (modal) {
      modal.style.animation = "fadeOut 0.3s ease-out";
      setTimeout(() => {
        modal.remove();
      }, 300);
    }
  }

  showNotification(message, type = "info") {
    const notification = document.createElement("div");
    notification.className = `page-notification ${type}`;
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

    setTimeout(() => {
      notification.style.animation = "slideOut 0.3s ease-out";
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, 3000);
  }

  addMobileMenuToggle() {
    const header = document.querySelector(".page-header");
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

      if (window.innerWidth <= 768) {
        menuToggle.style.display = "block";
      }

      window.addEventListener("resize", () => {
        menuToggle.style.display = window.innerWidth <= 768 ? "block" : "none";
      });
    }
  }

  updateActivitiesPaginationControls() {
    const paginationInfo = document.getElementById("activitiesPaginationInfo");
    const prevBtn = document.getElementById("activitiesPrevBtn");
    const nextBtn = document.getElementById("activitiesNextBtn");
    const pageNumbers = document.getElementById("activitiesPageNumbers");

    if (!paginationInfo || !prevBtn || !nextBtn || !pageNumbers) return;

    // Update info text
    const startItem =
      this.activitiesPagination.totalItems === 0
        ? 0
        : (this.activitiesPagination.currentPage - 1) *
            this.activitiesPagination.itemsPerPage +
          1;
    const endItem = Math.min(
      this.activitiesPagination.currentPage *
        this.activitiesPagination.itemsPerPage,
      this.activitiesPagination.totalItems,
    );
    paginationInfo.textContent = `Showing ${startItem}-${endItem} of ${this.activitiesPagination.totalItems} activities`;

    // Update button states
    prevBtn.disabled = this.activitiesPagination.currentPage === 1;
    nextBtn.disabled =
      this.activitiesPagination.currentPage ===
        this.activitiesPagination.totalPages ||
      this.activitiesPagination.totalPages === 0;

    // Update page numbers
    pageNumbers.innerHTML = "";

    // Show page numbers (max 5 pages)
    const maxVisiblePages = 5;
    let startPage = Math.max(
      1,
      this.activitiesPagination.currentPage - Math.floor(maxVisiblePages / 2),
    );
    let endPage = Math.min(
      this.activitiesPagination.totalPages,
      startPage + maxVisiblePages - 1,
    );

    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      const pageBtn = document.createElement("button");
      pageBtn.className = `page-number ${i === this.activitiesPagination.currentPage ? "active" : ""}`;
      pageBtn.textContent = i;
      pageBtn.onclick = () => this.goToActivitiesPage(i);
      pageNumbers.appendChild(pageBtn);
    }
  }

  goToActivitiesPage(pageNumber) {
    if (pageNumber >= 1 && pageNumber <= this.activitiesPagination.totalPages) {
      this.activitiesPagination.currentPage = pageNumber;
      this.renderActivities(this.getFilteredActivities());
    }
  }

  goToPreviousActivitiesPage() {
    if (this.activitiesPagination.currentPage > 1) {
      this.activitiesPagination.currentPage--;
      this.renderActivities(this.getFilteredActivities());
    }
  }

  goToNextActivitiesPage() {
    if (
      this.activitiesPagination.currentPage <
      this.activitiesPagination.totalPages
    ) {
      this.activitiesPagination.currentPage++;
      this.renderActivities(this.getFilteredActivities());
    }
  }

  getFilteredActivities() {
    const searchTerm =
      document.getElementById("searchInput")?.value.toLowerCase() || "";
    const durationFilter =
      document.getElementById("durationFilter")?.value || "";
    const difficultyFilter =
      document.getElementById("difficultyFilter")?.value || "";

    let filteredActivities = this.activities;

    // Filter by category
    if (this.selectedCategory !== "all") {
      filteredActivities = filteredActivities.filter(
        (activity) => activity.category === this.selectedCategory,
      );
    }

    // Filter by search term
    if (searchTerm) {
      filteredActivities = filteredActivities.filter(
        (activity) =>
          activity.title.toLowerCase().includes(searchTerm) ||
          activity.description.toLowerCase().includes(searchTerm),
      );
    }

    // Filter by duration
    if (durationFilter) {
      filteredActivities = filteredActivities.filter((activity) => {
        switch (durationFilter) {
          case "0-15":
            return activity.duration <= 15;
          case "15-30":
            return activity.duration > 15 && activity.duration <= 30;
          case "30-60":
            return activity.duration > 30 && activity.duration <= 60;
          case "60+":
            return activity.duration > 60;
          default:
            return true;
        }
      });
    }

    // Filter by difficulty
    if (difficultyFilter) {
      filteredActivities = filteredActivities.filter(
        (activity) =>
          activity.difficulty.toLowerCase() === difficultyFilter.toLowerCase(),
      );
    }

    return filteredActivities;
  }
}

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", function () {
  window.wellnessActivitiesManager = new WellnessActivitiesManager();
});

// Add fadeOut animation
const style = document.createElement("style");
style.textContent = `
  @keyframes fadeOut {
    from { opacity: 1; }
    to { opacity: 0; }
  }
  
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
