// Recommendation Page JavaScript - MindSpace

class RecommendationManager {
  constructor() {
    this.currentPage = "recommendation";
    this.currentQuestionIndex = 0;
    this.answers = [];
    this.therapists = [];
    this.therapyPagination = {
      currentPage: 1,
      itemsPerPage: 3,
      totalItems: 0,
      totalPages: 0,
    };
    this.init();
  }

  init() {
    this.bindEvents();
    this.loadTherapists();
    this.initializeAssessment();
    console.log("Recommendation page initialized");
  }

  bindEvents() {
    // Navigation
    const navLinks = document.querySelectorAll(".nav-link");
    navLinks.forEach((link) => {
      link.addEventListener("click", (e) => this.handleNavigation(e));
    });

    // Assessment controls
    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");
    const submitBtn = document.getElementById("submitBtn");

    if (prevBtn) {
      prevBtn.addEventListener("click", () => this.previousQuestion());
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", () => this.nextQuestion());
    }

    if (submitBtn) {
      submitBtn.addEventListener("click", () => this.submitAssessment());
    }

    // Filters
    const specialtyFilter = document.getElementById("specialtyFilter");
    const typeFilter = document.getElementById("typeFilter");
    const priceFilter = document.getElementById("priceFilter");

    if (specialtyFilter) {
      specialtyFilter.addEventListener("change", () => this.filterTherapists());
    }

    if (typeFilter) {
      typeFilter.addEventListener("change", () => this.filterTherapists());
    }

    if (priceFilter) {
      priceFilter.addEventListener("change", () => this.filterTherapists());
    }

    // Notifications
    const notificationBtn = document.querySelector(".notification-btn");
    if (notificationBtn) {
      notificationBtn.addEventListener("click", () => this.showNotifications());
    }

    // Therapy pagination controls
    const therapyPrevBtn = document.getElementById("therapyPrevBtn");
    const therapyNextBtn = document.getElementById("therapyNextBtn");

    if (therapyPrevBtn) {
      therapyPrevBtn.addEventListener("click", () =>
        this.goToPreviousTherapyPage(),
      );
    }

    if (therapyNextBtn) {
      therapyNextBtn.addEventListener("click", () =>
        this.goToNextTherapyPage(),
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

  initializeAssessment() {
    const questions = [
      {
        id: 1,
        question: "What is your primary concern right now?",
        options: [
          "Anxiety and stress",
          "Depression or low mood",
          "Relationship issues",
          "Trauma or past experiences",
          "Work-life balance",
        ],
      },
      {
        id: 2,
        question: "How long have you been experiencing these concerns?",
        options: [
          "Less than a month",
          "1-3 months",
          "3-6 months",
          "6 months to a year",
          "More than a year",
        ],
      },
      {
        id: 3,
        question: "What type of therapy are you most interested in?",
        options: [
          "Individual therapy",
          "Couples therapy",
          "Family therapy",
          "Group therapy",
          "I'm not sure",
        ],
      },
      {
        id: 4,
        question: "What's your preferred therapy format?",
        options: [
          "In-person sessions",
          "Video calls",
          "Phone calls",
          "Text messaging",
          "Combination of formats",
        ],
      },
      {
        id: 5,
        question: "What's your budget range per session?",
        options: [
          "Under ₱50",
          "₱50-₱100",
          "₱100-₱150",
          "₱150-₱200",
          "Over ₱200",
        ],
      },
    ];

    this.questions = questions;
    this.displayQuestion();
  }

  displayQuestion() {
    const questionContainer = document.getElementById("questionContainer");
    const currentQuestionEl = document.getElementById("currentQuestion");
    const totalQuestionsEl = document.getElementById("totalQuestions");
    const progressFill = document.getElementById("progressFill");
    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");
    const submitBtn = document.getElementById("submitBtn");

    if (!questionContainer) return;

    const question = this.questions[this.currentQuestionIndex];

    // Update progress
    const progress =
      ((this.currentQuestionIndex + 1) / this.questions.length) * 100;
    progressFill.style.width = `${progress}%`;

    if (currentQuestionEl) {
      currentQuestionEl.textContent = this.currentQuestionIndex + 1;
    }

    if (totalQuestionsEl) {
      totalQuestionsEl.textContent = this.questions.length;
    }

    // Display question
    const questionHTML = `
      <div class="question">${question.question}</div>
      <div class="answer-options">
        ${question.options
          .map(
            (option, index) => `
          <div class="answer-option" data-answer="${index}">
            ${option}
          </div>
        `,
          )
          .join("")}
      </div>
    `;

    questionContainer.innerHTML = questionHTML;

    // Add click handlers to options
    const answerOptions = questionContainer.querySelectorAll(".answer-option");
    answerOptions.forEach((option) => {
      option.addEventListener("click", () => {
        // Remove previous selection
        answerOptions.forEach((opt) => opt.classList.remove("selected"));

        // Add selection to clicked option
        option.classList.add("selected");

        // Store answer
        this.answers[this.currentQuestionIndex] = {
          questionId: question.id,
          answer: option.dataset.answer,
          text: option.textContent.trim(),
        };

        // Re-enable next button after selection
        const nextBtn = document.getElementById("nextBtn");
        if (nextBtn && this.currentQuestionIndex < this.questions.length - 1) {
          nextBtn.disabled = false;
        }

        // Enable submit button if on last question
        const submitBtn = document.getElementById("submitBtn");
        if (
          submitBtn &&
          this.currentQuestionIndex === this.questions.length - 1
        ) {
          const allAnswered =
            this.answers.filter((a) => a && a.answer).length ===
            this.questions.length;
          submitBtn.disabled = !allAnswered;
        }
      });
    });

    // Restore previous answer if exists
    if (this.answers[this.currentQuestionIndex]) {
      const savedAnswer = this.answers[this.currentQuestionIndex];
      const savedOption = questionContainer.querySelector(
        `[data-answer="${savedAnswer.answer}"]`,
      );
      if (savedOption) {
        savedOption.classList.add("selected");
      }
    }

    // Update button states
    if (prevBtn) {
      prevBtn.disabled = this.currentQuestionIndex === 0;
    }

    if (nextBtn && submitBtn) {
      const isLastQuestion =
        this.currentQuestionIndex === this.questions.length - 1;
      const hasAnswer =
        this.answers[this.currentQuestionIndex] &&
        this.answers[this.currentQuestionIndex].answer;

      nextBtn.style.display = isLastQuestion ? "none" : "block";
      submitBtn.style.display = isLastQuestion ? "block" : "none";

      if (nextBtn) {
        nextBtn.disabled = !hasAnswer;
      }

      if (submitBtn) {
        submitBtn.disabled =
          !hasAnswer ||
          this.answers.filter((a) => a && a.answer).length <
            this.questions.length;
      }
    }
  }

  previousQuestion() {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
      this.displayQuestion();
    }
  }

  nextQuestion() {
    if (this.currentQuestionIndex < this.questions.length - 1) {
      this.currentQuestionIndex++;
      this.displayQuestion();
    }
  }

  submitAssessment() {
    if (this.answers.length < this.questions.length) {
      this.showNotification("Please answer all questions", "error");
      return;
    }

    // Process assessment results
    this.processAssessmentResults();

    // Show results
    this.showAssessmentResults();
  }

  processAssessmentResults() {
    // Analyze answers to determine recommendations
    const primaryConcern = this.answers[0]?.text || "";
    const duration = this.answers[1]?.text || "";
    const therapyType = this.answers[2]?.text || "";
    const format = this.answers[3]?.text || "";
    const budget = this.answers[4]?.text || "";

    // Store results
    this.assessmentResults = {
      primaryConcern,
      duration,
      therapyType,
      format,
      budget,
      recommendations: this.generateRecommendations(),
    };

    console.log("Assessment results:", this.assessmentResults);
  }

  generateRecommendations() {
    const recommendations = [];
    const primaryConcern = this.answers[0]?.text || "";
    const therapyType = this.answers[2]?.text || "";
    const format = this.answers[3]?.text || "";
    const budget = this.answers[4]?.text || "";

    // Generate therapist recommendations based on assessment answers
    const matchingTherapists = this.therapists.filter((therapist) => {
      let matches = true;

      // Match by specialty based on primary concern
      if (
        primaryConcern.includes("Anxiety") ||
        primaryConcern.includes("stress")
      ) {
        matches =
          matches &&
          therapist.specialties.some(
            (spec) =>
              spec.toLowerCase().includes("anxiety") ||
              spec.toLowerCase().includes("stress") ||
              spec.toLowerCase().includes("cognitive"),
          );
      } else if (
        primaryConcern.includes("Depression") ||
        primaryConcern.includes("mood")
      ) {
        matches =
          matches &&
          therapist.specialties.some(
            (spec) =>
              spec.toLowerCase().includes("depression") ||
              spec.toLowerCase().includes("mood") ||
              spec.toLowerCase().includes("behavioral"),
          );
      } else if (primaryConcern.includes("Relationship")) {
        matches =
          matches &&
          therapist.specialties.some(
            (spec) =>
              spec.toLowerCase().includes("relationship") ||
              spec.toLowerCase().includes("couples") ||
              spec.toLowerCase().includes("family"),
          );
      } else if (primaryConcern.includes("Trauma")) {
        matches =
          matches &&
          therapist.specialties.some(
            (spec) =>
              spec.toLowerCase().includes("trauma") ||
              spec.toLowerCase().includes("ptsd") ||
              spec.toLowerCase().includes("emdr"),
          );
      } else if (
        primaryConcern.includes("Work") ||
        primaryConcern.includes("balance")
      ) {
        matches =
          matches &&
          therapist.specialties.some(
            (spec) =>
              spec.toLowerCase().includes("work") ||
              spec.toLowerCase().includes("career") ||
              spec.toLowerCase().includes("stress"),
          );
      }

      // Match by therapy type
      if (therapyType.includes("Individual")) {
        matches = matches && therapist.therapyType === "individual";
      } else if (therapyType.includes("Couples")) {
        matches = matches && therapist.therapyType === "couples";
      } else if (therapyType.includes("Family")) {
        matches = matches && therapist.therapyType === "family";
      } else if (therapyType.includes("Group")) {
        matches = matches && therapist.therapyType === "group";
      }

      // Match by format
      if (format.includes("In-person")) {
        matches = matches && therapist.format.includes("in-person");
      } else if (format.includes("Video")) {
        matches = matches && therapist.format.includes("video");
      } else if (format.includes("Phone")) {
        matches = matches && therapist.format.includes("phone");
      }

      // Match by budget
      if (budget.includes("Under ₱50")) {
        matches =
          matches &&
          parseInt(therapist.price.replace(/[₱,]/g, "")) <= 50;
      } else if (budget.includes("₱50-₱100")) {
        matches =
          matches &&
          parseInt(therapist.price.replace(/[₱,]/g, "")) > 50 &&
          parseInt(therapist.price.replace(/[₱,]/g, "")) <= 100;
      } else if (budget.includes("₱100-₱150")) {
        matches =
          matches &&
          parseInt(therapist.price.replace(/[₱,]/g, "")) > 100 &&
          parseInt(therapist.price.replace(/[₱,]/g, "")) <= 150;
      } else if (budget.includes("₱150-₱200")) {
        matches =
          matches &&
          parseInt(therapist.price.replace(/[₱,]/g, "")) > 150 &&
          parseInt(therapist.price.replace(/[₱,]/g, "")) <= 200;
      } else if (budget.includes("Over ₱200")) {
        matches =
          matches && parseInt(therapist.price.replace(/[₱,]/g, "")) > 200;
      }

      return matches;
    });

    // If no exact matches, return therapists that match at least one criteria
    if (matchingTherapists.length === 0) {
      const fallbackTherapists = this.therapists.filter((therapist) => {
        // At least match by specialty if possible
        if (
          primaryConcern.includes("Anxiety") ||
          primaryConcern.includes("stress")
        ) {
          return therapist.specialties.some(
            (spec) =>
              spec.toLowerCase().includes("anxiety") ||
              spec.toLowerCase().includes("stress"),
          );
        } else if (
          primaryConcern.includes("Depression") ||
          primaryConcern.includes("mood")
        ) {
          return therapist.specialties.some(
            (spec) =>
              spec.toLowerCase().includes("depression") ||
              spec.toLowerCase().includes("mood"),
          );
        }
        return true; // Return all if no specific concern match
      });
      return fallbackTherapists.slice(0, 3);
    }

    return matchingTherapists.slice(0, 3);
  }

  showAssessmentResults() {
    const results = this.assessmentResults;

    // Update the therapist display with recommended therapists
    this.renderTherapists(results.recommendations);

    // Update filters to reflect assessment preferences
    this.updateFiltersBasedOnAssessment(results);

    const modal = this.createModal(
      "Your Assessment Results",
      `
      <div class="assessment-results">
        <div class="result-summary">
          <h3>Based on your responses, we recommend:</h3>
          <div class="recommendations">
            <div class="recommendation-item">
              <h4>🎯 Primary Focus</h4>
              <p>${results.primaryConcern}</p>
            </div>
            <div class="recommendation-item">
              <h4>💡 Therapy Type</h4>
              <p>${results.therapyType}</p>
            </div>
            <div class="recommendation-item">
              <h4>📱 Preferred Format</h4>
              <p>${results.format}</p>
            </div>
            <div class="recommendation-item">
              <h4>💰 Budget Range</h4>
              <p>${results.budget}</p>
            </div>
          </div>
        </div>
        
        <div class="next-steps">
          <h3>🎉 Perfect Match Found!</h3>
          <p>We found ${results.recommendations.length} therapist(s) that match your preferences. The recommendations below have been updated based on your assessment results.</p>
          <div class="assessment-stats">
            <div class="stat-item">
              <span class="stat-number">${results.recommendations.length}</span>
              <span class="stat-label">Recommended Therapists</span>
            </div>
            <div class="stat-item">
              <span class="stat-number">${Math.round((results.recommendations.length / this.therapists.length) * 100)}%</span>
              <span class="stat-label">Match Rate</span>
            </div>
          </div>
          <button class="close-modal-btn primary">View Your Matches</button>
        </div>
      </div>
    `,
    );

    const closeBtn = modal.querySelector(".close-modal-btn");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => this.closeModal());
    }
  }

  loadTherapists() {
    // Generate sample therapist data
    this.therapists = [
      {
        id: 1,
        name: "Dr. Sarah Johnson",
        title: "Licensed Clinical Psychologist",
        credentials: "PhD, PsyD",
        avatar: "SJ",
        specialties: ["Anxiety Disorders", "Depression", "Stress Management"],
        description:
          "Specializing in cognitive behavioral therapy for anxiety and depression. 10+ years of experience helping adults overcome mental health challenges.",
        price: "₱120",
        rating: 4.8,
        reviews: 127,
        therapyType: "cbt",
        format: ["video", "in-person"],
      },
      {
        id: 2,
        name: "Dr. Michael Chen",
        title: "Psychiatrist",
        credentials: "MD",
        avatar: "MC",
        specialties: [
          "Medication Management",
          "Depression",
          "Bipolar Disorder",
        ],
        description:
          "Board-certified psychiatrist specializing in medication management and integrated treatment approaches for mood disorders.",
        price: "₱200",
        rating: 4.9,
        reviews: 89,
        therapyType: "medication",
        format: ["video", "phone"],
      },
      {
        id: 3,
        name: "Emily Rodriguez",
        title: "Licensed Marriage & Family Therapist",
        credentials: "LMFT",
        avatar: "ER",
        specialties: ["Relationships", "Family Therapy", "Couples Counseling"],
        description:
          "Helping individuals and couples improve their relationships and communication. Specialized in family systems therapy.",
        price: "₱95",
        rating: 4.7,
        reviews: 156,
        therapyType: "family",
        format: ["video", "phone", "in-person"],
      },
      {
        id: 4,
        name: "Dr. James Wilson",
        title: "Clinical Psychologist",
        credentials: "PhD",
        avatar: "JW",
        specialties: ["Trauma & PTSD", "Anxiety", "Depression"],
        description:
          "Expert in trauma-informed care and EMDR therapy. Helping individuals heal from past trauma and build resilience.",
        price: "₱150",
        rating: 4.8,
        reviews: 203,
        therapyType: "trauma",
        format: ["video", "in-person"],
      },
      {
        id: 5,
        name: "Lisa Thompson",
        title: "Licensed Clinical Social Worker",
        credentials: "LCSW",
        avatar: "LT",
        specialties: ["Addiction", "Stress Management", "Life Transitions"],
        description:
          "Compassionate therapist specializing in addiction recovery and life coaching. Holistic approach to mental wellness.",
        price: "₱85",
        rating: 4.6,
        reviews: 94,
        therapyType: "addiction",
        format: ["video", "phone", "text"],
      },
      {
        id: 6,
        name: "Dr. Robert Davis",
        title: "Psychologist",
        credentials: "PsyD",
        avatar: "RD",
        specialties: ["Relationships", "Depression", "Anxiety"],
        description:
          "Integrative approach combining cognitive behavioral therapy with mindfulness techniques. Specializing in adult relationships.",
        price: "₱110",
        rating: 4.7,
        reviews: 178,
        therapyType: "humanistic",
        format: ["video", "in-person"],
      },
    ];

    this.renderTherapists(this.therapists);
  }

  renderTherapists(therapists) {
    const therapyGrid = document.getElementById("therapyGrid");
    if (!therapyGrid) return;

    // Update pagination info
    this.therapyPagination.totalItems = therapists.length;
    this.therapyPagination.totalPages = Math.ceil(
      this.therapyPagination.totalItems / this.therapyPagination.itemsPerPage,
    );

    // Reset to page 1 if current page is out of bounds
    if (
      this.therapyPagination.currentPage > this.therapyPagination.totalPages
    ) {
      this.therapyPagination.currentPage = 1;
    }

    if (therapists.length === 0) {
      therapyGrid.innerHTML = `
        <div class="no-therapists">
          <p>No therapists found matching your criteria. Try adjusting your filters.</p>
        </div>
      `;
      this.updateTherapyPaginationControls();
      return;
    }

    // Get paginated data
    const startIndex =
      (this.therapyPagination.currentPage - 1) *
      this.therapyPagination.itemsPerPage;
    const endIndex = startIndex + this.therapyPagination.itemsPerPage;
    const paginatedTherapists = therapists.slice(startIndex, endIndex);

    const therapistHTML = paginatedTherapists
      .map(
        (therapist) => `
      <div class="therapist-card">
        <div class="therapist-header">
          <div class="therapist-avatar">${therapist.avatar}</div>
          <div class="therapist-info">
            <h3>${therapist.name}</h3>
            <div class="title">${therapist.title}</div>
            <div class="credentials">${therapist.credentials}</div>
          </div>
        </div>
        
        <div class="therapist-details">
          <div class="therapist-specialties">
            ${therapist.specialties.map((spec) => `<span class="specialty-tag">${spec}</span>`).join("")}
          </div>
          
          <div class="therapist-description">${therapist.description}</div>
          
          <div class="therapist-meta">
            <div class="therapist-price">${therapist.price}/session</div>
            <div class="therapist-rating">
              ⭐ ${therapist.rating} (${therapist.reviews} reviews)
            </div>
          </div>
        </div>
        
        <div class="therapist-actions">
          <button class="therapist-btn primary" onclick="window.recommendationManager.contactTherapist(${therapist.id})">Contact</button>
          <button class="therapist-btn secondary" onclick="window.recommendationManager.viewTherapist(${therapist.id})">View Profile</button>
        </div>
      </div>
    `,
      )
      .join("");

    therapyGrid.innerHTML = therapistHTML;
    this.updateTherapyPaginationControls();
  }

  filterTherapists() {
    // Reset to page 1 when filters change
    this.therapyPagination.currentPage = 1;
    this.renderTherapists(this.getFilteredTherapists());
  }

  contactTherapist(therapistId) {
    const therapist = this.therapists.find((t) => t.id === therapistId);
    if (!therapist) return;

    this.showNotification(`Contacting ${therapist.name}...`, "info");

    // In a real app, this would open a contact form or messaging interface
    setTimeout(() => {
      this.showNotification(
        `Contact request sent to ${therapist.name}`,
        "success",
      );
    }, 1500);
  }

  viewTherapist(therapistId) {
    const therapist = this.therapists.find((t) => t.id === therapistId);
    if (!therapist) return;

    const modal = this.createModal(
      `${therapist.name}`,
      `
      <div class="therapist-profile">
        <div class="profile-header">
          <div class="profile-avatar">${therapist.avatar}</div>
          <div class="profile-info">
            <h3>${therapist.name}</h3>
            <div class="profile-title">${therapist.title}</div>
            <div class="profile-credentials">${therapist.credentials}</div>
            <div class="profile-rating">⭐ ${therapist.rating} (${therapist.reviews} reviews)</div>
          </div>
        </div>
        
        <div class="profile-details">
          <h4>About</h4>
          <p>${therapist.description}</p>
          
          <h4>Specialties</h4>
          <div class="specialties-list">
            ${therapist.specialties.map((spec) => `<span class="specialty-tag">${spec}</span>`).join("")}
          </div>
          
          <h4>Session Details</h4>
          <div class="session-details">
            <div class="detail-item">
              <span class="detail-label">Price:</span>
              <span class="detail-value">${therapist.price}/session</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Format:</span>
              <span class="detail-value">${therapist.format.join(", ")}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Therapy Type:</span>
              <span class="detail-value">${therapist.therapyType}</span>
            </div>
          </div>
        </div>
        
        <div class="profile-actions">
          <button class="profile-btn primary" onclick="window.recommendationManager.contactTherapist(${therapist.id})">Contact Therapist</button>
          <button class="profile-btn secondary" onclick="window.recommendationManager.scheduleSession(${therapist.id})">Schedule Session</button>
        </div>
      </div>
    `,
    );
  }

  scheduleSession(therapistId) {
    const therapist = this.therapists.find((t) => t.id === therapistId);
    if (!therapist) return;

    this.showNotification(
      `Opening scheduling for ${therapist.name}...`,
      "info",
    );

    // In a real app, this would open a scheduling interface
    setTimeout(() => {
      this.showNotification("Scheduling feature coming soon!", "info");
    }, 1500);
  }

  showNotifications() {
    const notifications = [
      {
        title: "New Therapist Match",
        message: "3 new therapists match your preferences",
        time: "2h ago",
      },
      {
        title: "Session Reminder",
        message: "Your consultation is tomorrow at 2:00 PM",
        time: "1d ago",
      },
      {
        title: "Assessment Complete",
        message: "Your assessment results are ready",
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
      
      .assessment-results {
        text-align: center;
      }
      
      .result-summary h3 {
        color: #2d3748;
        margin-bottom: 20px;
      }
      
      .recommendations {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 15px;
        margin-bottom: 30px;
      }
      
      .recommendation-item {
        background: rgba(255, 107, 157, 0.1);
        border-radius: 15px;
        padding: 15px;
      }
      
      .recommendation-item h4 {
        color: #2d3748;
        margin-bottom: 8px;
        font-size: 1rem;
      }
      
      .recommendation-item p {
        color: #718096;
        margin: 0;
        font-size: 0.9rem;
      }
      
      .next-steps h3 {
        color: #2d3748;
        margin-bottom: 15px;
      }
      
      .next-steps p {
        color: #718096;
        margin-bottom: 20px;
        line-height: 1.6;
      }
      
      .close-modal-btn {
        background: linear-gradient(135deg, #ff6b9d, #ff8fa3);
        color: white;
        border: none;
        padding: 12px 25px;
        border-radius: 25px;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
      }
      
      .close-modal-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 15px rgba(255, 107, 157, 0.3);
      }
      
      .therapist-profile {
        text-align: left;
      }
      
      .profile-header {
        display: flex;
        gap: 20px;
        margin-bottom: 25px;
        align-items: center;
      }
      
      .profile-avatar {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        background: linear-gradient(135deg, #ff6b9d, #ff8fa3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 2rem;
        font-weight: 600;
        flex-shrink: 0;
      }
      
      .profile-info h3 {
        margin: 0 0 5px 0;
        color: #2d3748;
        font-size: 1.5rem;
        font-weight: 600;
      }
      
      .profile-title {
        color: #718096;
        margin-bottom: 5px;
      }
      
      .profile-credentials {
        color: #ff6b9d;
        font-weight: 500;
        margin-bottom: 5px;
      }
      
      .profile-rating {
        color: #f59e0b;
        font-size: 0.9rem;
      }
      
      .profile-details h4 {
        color: #2d3748;
        margin: 25px 0 10px 0;
        font-size: 1.1rem;
        font-weight: 600;
      }
      
      .specialties-list {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-bottom: 20px;
      }
      
      .session-details {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      
      .detail-item {
        display: flex;
        justify-content: space-between;
        padding: 8px 0;
        border-bottom: 1px solid rgba(255, 107, 157, 0.1);
      }
      
      .detail-label {
        color: #718096;
        font-weight: 500;
      }
      
      .detail-value {
        color: #2d3748;
        font-weight: 600;
      }
      
      .profile-actions {
        display: flex;
        gap: 15px;
        margin-top: 25px;
      }
      
      .profile-btn {
        flex: 1;
        padding: 12px 20px;
        border: none;
        border-radius: 15px;
        font-size: 0.9rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
      }
      
      .profile-btn.primary {
        background: linear-gradient(135deg, #ff6b9d, #ff8fa3);
        color: white;
      }
      
      .profile-btn.secondary {
        background: rgba(255, 255, 255, 0.8);
        color: #ff6b9d;
        border: 2px solid rgba(255, 107, 157, 0.3);
      }
      
      .profile-btn:hover {
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

  updateTherapyPaginationControls() {
    const paginationInfo = document.getElementById("therapyPaginationInfo");
    const prevBtn = document.getElementById("therapyPrevBtn");
    const nextBtn = document.getElementById("therapyNextBtn");
    const pageNumbers = document.getElementById("therapyPageNumbers");

    if (!paginationInfo || !prevBtn || !nextBtn || !pageNumbers) return;

    // Update info text
    const startItem =
      this.therapyPagination.totalItems === 0
        ? 0
        : (this.therapyPagination.currentPage - 1) *
            this.therapyPagination.itemsPerPage +
          1;
    const endItem = Math.min(
      this.therapyPagination.currentPage * this.therapyPagination.itemsPerPage,
      this.therapyPagination.totalItems,
    );
    paginationInfo.textContent = `Showing ${startItem}-${endItem} of ${this.therapyPagination.totalItems} therapists`;

    // Update button states
    prevBtn.disabled = this.therapyPagination.currentPage === 1;
    nextBtn.disabled =
      this.therapyPagination.currentPage ===
        this.therapyPagination.totalPages ||
      this.therapyPagination.totalPages === 0;

    // Update page numbers
    pageNumbers.innerHTML = "";

    // Show page numbers (max 5 pages)
    const maxVisiblePages = 5;
    let startPage = Math.max(
      1,
      this.therapyPagination.currentPage - Math.floor(maxVisiblePages / 2),
    );
    let endPage = Math.min(
      this.therapyPagination.totalPages,
      startPage + maxVisiblePages - 1,
    );

    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      const pageBtn = document.createElement("button");
      pageBtn.className = `page-number ${i === this.therapyPagination.currentPage ? "active" : ""}`;
      pageBtn.textContent = i;
      pageBtn.onclick = () => this.goToTherapyPage(i);
      pageNumbers.appendChild(pageBtn);
    }
  }

  goToTherapyPage(pageNumber) {
    if (pageNumber >= 1 && pageNumber <= this.therapyPagination.totalPages) {
      this.therapyPagination.currentPage = pageNumber;
      this.renderTherapists(this.getFilteredTherapists());
    }
  }

  goToPreviousTherapyPage() {
    if (this.therapyPagination.currentPage > 1) {
      this.therapyPagination.currentPage--;
      this.renderTherapists(this.getFilteredTherapists());
    }
  }

  goToNextTherapyPage() {
    if (
      this.therapyPagination.currentPage < this.therapyPagination.totalPages
    ) {
      this.therapyPagination.currentPage++;
      this.renderTherapists(this.getFilteredTherapists());
    }
  }

  getFilteredTherapists() {
    const specialtyFilter = document.getElementById("specialtyFilter").value;
    const typeFilter = document.getElementById("typeFilter").value;
    const priceFilter = document.getElementById("priceFilter").value;

    let filteredTherapists = this.therapists;

    if (specialtyFilter) {
      filteredTherapists = filteredTherapists.filter((therapist) =>
        therapist.specialties.some((spec) =>
          spec.toLowerCase().includes(specialtyFilter.toLowerCase()),
        ),
      );
    }

    if (typeFilter) {
      filteredTherapists = filteredTherapists.filter(
        (therapist) => therapist.therapyType === typeFilter,
      );
    }

    if (priceFilter) {
      filteredTherapists = filteredTherapists.filter((therapist) => {
        const price = parseInt(therapist.price.replace(/[$,]/g, ""));

        switch (priceFilter) {
          case "0-50":
            return price <= 50;
          case "50-100":
            return price > 50 && price <= 100;
          case "100-150":
            return price > 100 && price <= 150;
          case "150+":
            return price > 150;
          default:
            return true;
        }
      });
    }

    return filteredTherapists;
  }

  updateFiltersBasedOnAssessment(results) {
    // Update specialty filter based on primary concern
    const specialtyFilter = document.getElementById("specialtyFilter");
    if (specialtyFilter && results.primaryConcern) {
      if (
        results.primaryConcern.includes("Anxiety") ||
        results.primaryConcern.includes("stress")
      ) {
        specialtyFilter.value = "anxiety";
      } else if (
        results.primaryConcern.includes("Depression") ||
        results.primaryConcern.includes("mood")
      ) {
        specialtyFilter.value = "depression";
      } else if (results.primaryConcern.includes("Relationship")) {
        specialtyFilter.value = "relationships";
      } else if (results.primaryConcern.includes("Trauma")) {
        specialtyFilter.value = "trauma";
      } else if (
        results.primaryConcern.includes("Work") ||
        results.primaryConcern.includes("balance")
      ) {
        specialtyFilter.value = "career";
      }
    }

    // Update therapy type filter
    const typeFilter = document.getElementById("typeFilter");
    if (typeFilter && results.therapyType) {
      if (results.therapyType.includes("Individual")) {
        typeFilter.value = "individual";
      } else if (results.therapyType.includes("Couples")) {
        typeFilter.value = "couples";
      } else if (results.therapyType.includes("Family")) {
        typeFilter.value = "family";
      } else if (results.therapyType.includes("Group")) {
        typeFilter.value = "group";
      }
    }

    // Update price filter
    const priceFilter = document.getElementById("priceFilter");
    if (priceFilter && results.budget) {
      if (results.budget.includes("Under $50")) {
        priceFilter.value = "0-50";
      } else if (results.budget.includes("$50-$100")) {
        priceFilter.value = "50-100";
      } else if (results.budget.includes("$100-$150")) {
        priceFilter.value = "100-150";
      } else if (results.budget.includes("$150-$200")) {
        priceFilter.value = "100-150"; // Use closest available option
      } else if (results.budget.includes("Over $200")) {
        priceFilter.value = "150+";
      }
    }
  }
}

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", function () {
  window.recommendationManager = new RecommendationManager();
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
