// Daily Mood Page JavaScript - MindSpace
import { auth, supabase } from './supabase-config.js';

class DailyMoodManager {
  constructor() {
    this.currentPage = "daily-mood";
    this.selectedMood = null;
    this.selectedInfluences = new Set();
    this.selectedActivities = new Set();
    this.moodHistory = [];
    this.pagination = {
      currentPage: 1,
      itemsPerPage: 2,
      totalItems: 0,
      totalPages: 0,
    };
    this.init();
  }

  init() {
    this.bindEvents();
    this.loadMoodData();
    this.updateTodayDate();
    this.renderMoodHistory();
    this.renderPastMoodLog();
    this.updateStatistics();
    this.initializeChart();
    console.log("Daily Mood page initialized");
  }

  bindEvents() {
    // Navigation
    const navLinks = document.querySelectorAll(".nav-link");
    navLinks.forEach((link) => {
      link.addEventListener("click", (e) => this.handleNavigation(e));
    });

    // Mood selection
    const moodButtons = document.querySelectorAll(".mood-btn");
    moodButtons.forEach((btn) => {
      btn.addEventListener("click", (e) => this.handleMoodSelection(e));
    });

    // Influence tags
    const influenceTags = document.querySelectorAll(".influence-tag");
    influenceTags.forEach((tag) => {
      tag.addEventListener("click", (e) => this.handleInfluenceSelection(e));
    });

    // Activity tags
    const activityTags = document.querySelectorAll(".activity-tag");
    activityTags.forEach((tag) => {
      tag.addEventListener("click", (e) => this.handleActivitySelection(e));
    });

    // Save and skip buttons
    const saveBtn = document.getElementById("saveMoodBtn");
    const skipBtn = document.getElementById("skipMoodBtn");

    if (saveBtn) {
      saveBtn.addEventListener("click", () => this.saveTodayMood());
    }

    if (skipBtn) {
      skipBtn.addEventListener("click", () => this.skipToday());
    }

    // Chart period controls
    const chartPeriods = document.querySelectorAll(".chart-period");
    chartPeriods.forEach((btn) => {
      btn.addEventListener("click", (e) => this.handleChartPeriodChange(e));
    });

    // Filters
    const monthFilter = document.getElementById("monthFilter");
    const yearFilter = document.getElementById("yearFilter");

    if (monthFilter) {
      monthFilter.addEventListener("change", () => this.filterHistory());
    }

    if (yearFilter) {
      yearFilter.addEventListener("change", () => this.filterHistory());
    }

    // Export button
    const exportBtn = document.getElementById("exportBtn");
    if (exportBtn) {
      exportBtn.addEventListener("click", () => this.exportMoodData());
    }

    // Past mood log filters and export
    const logMonthFilter = document.getElementById("logMonthFilter");
    const logYearFilter = document.getElementById("logYearFilter");
    const exportLogBtn = document.getElementById("exportLogBtn");

    if (logMonthFilter) {
      logMonthFilter.addEventListener("change", () => this.filterPastMoodLog());
    }

    if (logYearFilter) {
      logYearFilter.addEventListener("change", () => this.filterPastMoodLog());
    }

    if (exportLogBtn) {
      exportLogBtn.addEventListener("click", () => this.exportMoodLog());
    }

    // Pagination controls
    const prevPageBtn = document.getElementById("prevPageBtn");
    const nextPageBtn = document.getElementById("nextPageBtn");

    if (prevPageBtn) {
      prevPageBtn.addEventListener("click", () => this.goToPreviousPage());
    }

    if (nextPageBtn) {
      nextPageBtn.addEventListener("click", () => this.goToNextPage());
    }

    // Notifications
    const notificationBtn = document.querySelector(".notification-btn");
    if (notificationBtn) {
      notificationBtn.addEventListener("click", () => this.showNotifications());
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

  handleMoodSelection(event) {
    const button = event.currentTarget;
    const mood = button.dataset.mood;
    const value = parseInt(button.dataset.value);

    // Remove previous selection
    document.querySelectorAll(".mood-btn").forEach((btn) => {
      btn.classList.remove("selected");
    });

    // Add selection to clicked button
    button.classList.add("selected");
    this.selectedMood = { mood, value };

    // Enable save button
    const saveBtn = document.getElementById("saveMoodBtn");
    if (saveBtn) {
      saveBtn.disabled = false;
    }
  }

  handleInfluenceSelection(event) {
    const tag = event.currentTarget;
    const influence = tag.dataset.influence;

    if (this.selectedInfluences.has(influence)) {
      this.selectedInfluences.delete(influence);
      tag.classList.remove("selected");
    } else {
      this.selectedInfluences.add(influence);
      tag.classList.add("selected");
    }
  }

  handleActivitySelection(event) {
    const tag = event.currentTarget;
    const activity = tag.dataset.activity;

    if (this.selectedActivities.has(activity)) {
      this.selectedActivities.delete(activity);
      tag.classList.remove("selected");
    } else {
      this.selectedActivities.add(activity);
      tag.classList.add("selected");
    }
  }

  async saveTodayMood() {
    if (!this.selectedMood) {
      this.showNotification("Please select your mood first", "error");
      return;
    }

    try {
      const userResult = await auth.getCurrentUser();
      if (!userResult.success || !userResult.user) {
        this.showNotification('Please log in to save mood', 'error');
        return;
      }

      const notes = document.getElementById("moodNotes").value;
      const today = new Date().toISOString().split("T")[0];

      const moodEntry = {
        user_id: userResult.user.id,
        date: today,
        mood: this.selectedMood.mood,
        value: this.selectedMood.value,
        notes: notes,
        influences: Array.from(this.selectedInfluences),
        activities: Array.from(this.selectedActivities),
        timestamp: new Date().toISOString(),
      };

      // Check if mood already exists for today
      const { data: existingEntry, error: fetchError } = await supabase
        .from('mood_entries')
        .select('*')
        .eq('user_id', userResult.user.id)
        .eq('date', today)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error checking existing mood:', fetchError);
        this.showNotification('Error saving mood', 'error');
        return;
      }

      let result;
      if (existingEntry) {
        // Update existing entry
        const { error: updateError } = await supabase
          .from('mood_entries')
          .update(moodEntry)
          .eq('id', existingEntry.id);
        result = { error: updateError };
      } else {
        // Insert new entry
        const { error: insertError } = await supabase
          .from('mood_entries')
          .insert([moodEntry]);
        result = { error: insertError };
      }

      if (result.error) {
        console.error('Error saving mood:', result.error);
        this.showNotification('Failed to save mood', 'error');
      } else {
        // Update local array for UI
        const existingIndex = this.moodHistory.findIndex(
          (entry) => entry.date === today,
        );
        
        const localEntry = { ...moodEntry, id: existingEntry?.id };
        if (existingIndex !== -1) {
          this.moodHistory[existingIndex] = localEntry;
        } else {
          this.moodHistory.push(localEntry);
        }

        // Update UI
        this.renderMoodHistory();
        this.updateStatistics();
        this.updateChart();

        this.showNotification("Mood saved successfully!", "success");
        this.resetForm();
      }
    } catch (error) {
      console.error('Error saving mood:', error);
      this.showNotification('Failed to save mood', 'error');
    }
  }

  async skipToday() {
    try {
      const userResult = await auth.getCurrentUser();
      if (!userResult.success || !userResult.user) {
        this.showNotification('Please log in to skip mood', 'error');
        return;
      }

      const today = new Date().toISOString().split("T")[0];

      const skipEntry = {
        user_id: userResult.user.id,
        date: today,
        mood: "skipped",
        value: 0,
        notes: "Skipped mood entry",
        influences: [],
        activities: [],
        timestamp: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('mood_entries')
        .insert([skipEntry]);

      if (error) {
        console.error('Error skipping mood:', error);
        this.showNotification('Failed to skip mood', 'error');
      } else {
        this.moodHistory.push(skipEntry);
        this.renderMoodHistory();
        this.updateStatistics();
        this.showNotification("Mood entry skipped for today", "info");
        this.resetForm();
      }
    } catch (error) {
      console.error('Error skipping mood:', error);
      this.showNotification('Failed to skip mood', 'error');
    }
  }

  resetForm() {
    // Reset mood selection
    document.querySelectorAll(".mood-btn").forEach((btn) => {
      btn.classList.remove("selected");
    });

    // Reset tags
    document
      .querySelectorAll(".influence-tag, .activity-tag")
      .forEach((tag) => {
        tag.classList.remove("selected");
      });

    // Reset notes
    document.getElementById("moodNotes").value = "";

    // Reset selections
    this.selectedMood = null;
    this.selectedInfluences.clear();
    this.selectedActivities.clear();

    // Disable save button
    const saveBtn = document.getElementById("saveMoodBtn");
    if (saveBtn) {
      saveBtn.disabled = true;
    }
  }

  async loadMoodData() {
    try {
      const userResult = await auth.getCurrentUser();
      if (userResult.success && userResult.user) {
        const { data, error } = await supabase
          .from('mood_entries')
          .select('*')
          .eq('user_id', userResult.user.id)
          .order('date', { ascending: false });

        if (error) {
          console.error('Error loading mood data:', error);
          this.generateSampleData();
        } else {
          this.moodHistory = data || [];
        }
      } else {
        // Generate sample data for demonstration
        this.generateSampleData();
      }
    } catch (error) {
      console.error("Error loading mood data:", error);
      this.generateSampleData();
    }
  }

  saveMoodData() {
    // This function is no longer needed as data is saved directly to Supabase
    // Keeping for backward compatibility
    console.log('Mood data is now saved directly to Supabase');
  }

  generateSampleData() {
    const moods = ["excellent", "good", "okay", "bad", "terrible"];
    const influences = [
      "work",
      "family",
      "friends",
      "health",
      "sleep",
      "exercise",
      "weather",
      "stress",
    ];
    const activities = [
      "meditation",
      "exercise",
      "social",
      "work",
      "hobby",
      "rest",
      "nature",
      "creative",
    ];

    this.moodHistory = [];

    for (let i = 30; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);

      if (Math.random() > 0.1) {
        // 90% chance of having an entry
        const mood = moods[Math.floor(Math.random() * moods.length)];
        const value = moods.indexOf(mood) + 1;

        const entry = {
          date: date.toISOString().split("T")[0],
          mood: mood,
          value: value,
          notes: `Sample mood entry for ${date.toLocaleDateString()}`,
          influences: this.getRandomItems(
            influences,
            Math.floor(Math.random() * 3) + 1,
          ),
          activities: this.getRandomItems(
            activities,
            Math.floor(Math.random() * 3) + 1,
          ),
          timestamp: date.toISOString(),
        };

        this.moodHistory.push(entry);
      }
    }

    this.saveMoodData();
  }

  getRandomItems(array, count) {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  updateTodayDate() {
    const todayElement = document.getElementById("todayDate");
    if (todayElement) {
      const today = new Date();
      todayElement.textContent = today.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
  }

  renderMoodHistory() {
    const historyList = document.getElementById("moodHistoryList");
    if (!historyList) return;

    const filteredHistory = this.getFilteredHistory();

    if (filteredHistory.length === 0) {
      historyList.innerHTML = `
        <div class="no-entries">
          <p>No mood entries found for the selected filters.</p>
        </div>
      `;
      return;
    }

    const moodEmojis = {
      excellent: "😄",
      good: "😊",
      okay: "😐",
      bad: "😔",
      terrible: "😢",
      skipped: "⏭️",
    };

    const historyHTML = filteredHistory
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .map(
        (entry) => `
        <div class="mood-entry">
          <div class="mood-entry-header">
            <div class="mood-entry-date">
              ${new Date(entry.date).toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}
            </div>
            <div class="mood-entry-mood">
              <span class="mood-entry-emoji">${moodEmojis[entry.mood] || "❓"}</span>
              <span>${entry.mood.charAt(0).toUpperCase() + entry.mood.slice(1)}</span>
            </div>
          </div>
          ${entry.notes ? `<div class="mood-entry-notes">${entry.notes}</div>` : ""}
          <div class="mood-entry-tags">
            ${entry.influences.map((inf) => `<span class="mood-tag">${inf}</span>`).join("")}
            ${entry.activities.map((act) => `<span class="mood-tag">${act}</span>`).join("")}
          </div>
        </div>
      `,
      )
      .join("");

    historyList.innerHTML = historyHTML;
  }

  renderPastMoodLog() {
    const moodLogList = document.getElementById("moodLogList");
    if (!moodLogList) return;

    const filteredLog = this.getFilteredPastMoodLog();

    // Update pagination info
    this.pagination.totalItems = filteredLog.length;
    this.pagination.totalPages = Math.ceil(
      this.pagination.totalItems / this.pagination.itemsPerPage,
    );

    // Reset to page 1 if current page is out of bounds
    if (this.pagination.currentPage > this.pagination.totalPages) {
      this.pagination.currentPage = 1;
    }

    if (filteredLog.length === 0) {
      moodLogList.innerHTML = `
        <div class="no-log-entries">
          <p>No past mood entries found. Start tracking your mood to see your history here!</p>
        </div>
      `;
      this.updatePaginationControls();
      return;
    }

    // Get paginated data
    const startIndex =
      (this.pagination.currentPage - 1) * this.pagination.itemsPerPage;
    const endIndex = startIndex + this.pagination.itemsPerPage;
    const paginatedLog = filteredLog
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(startIndex, endIndex);

    const moodEmojis = {
      excellent: "😄",
      good: "😊",
      okay: "😐",
      bad: "😔",
      terrible: "😢",
      skipped: "⏭️",
    };

    const logHTML = paginatedLog
      .map(
        (entry) => `
        <div class="mood-log-entry" data-id="${entry.date}">
          <div class="mood-log-header">
            <div class="mood-log-date">
              ${new Date(entry.date).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
            <div class="mood-log-mood">
              <span class="mood-log-emoji">${moodEmojis[entry.mood] || "❓"}</span>
              <span>${entry.mood.charAt(0).toUpperCase() + entry.mood.slice(1)}</span>
            </div>
          </div>
          ${entry.notes ? `<div class="mood-log-content">${entry.notes}</div>` : ""}
          <div class="mood-log-tags">
            ${
              entry.influences && entry.influences.length > 0
                ? entry.influences
                    .map(
                      (inf) =>
                        `<span class="mood-log-tag influence">Influence: ${inf}</span>`,
                    )
                    .join("")
                : ""
            }
            ${
              entry.activities && entry.activities.length > 0
                ? entry.activities
                    .map(
                      (act) =>
                        `<span class="mood-log-tag activity">Activity: ${act}</span>`,
                    )
                    .join("")
                : ""
            }
          </div>
          <div class="mood-log-actions">
            <button class="mood-log-btn edit" onclick="window.dailyMoodManager.editMoodEntry('${entry.date}')">Edit</button>
            <button class="mood-log-btn delete" onclick="window.dailyMoodManager.deleteMoodEntry('${entry.date}')">Delete</button>
          </div>
        </div>
      `,
      )
      .join("");

    moodLogList.innerHTML = logHTML;
    this.updatePaginationControls();
  }

  getFilteredPastMoodLog() {
    const logMonthFilter = document.getElementById("logMonthFilter").value;
    const logYearFilter = document.getElementById("logYearFilter").value;

    return this.moodHistory.filter((entry) => {
      const entryDate = new Date(entry.date);
      const entryMonth = (entryDate.getMonth() + 1).toString();
      const entryYear = entryDate.getFullYear().toString();

      if (logMonthFilter && entryMonth !== logMonthFilter) return false;
      if (logYearFilter && entryYear !== logYearFilter) return false;

      return true;
    });
  }

  filterPastMoodLog() {
    this.renderPastMoodLog();
  }

  editMoodEntry(date) {
    const entry = this.moodHistory.find((e) => e.date === date);
    if (!entry) return;

    // Create edit modal
    const modal = this.createModal(
      "Edit Mood Entry",
      `
      <div class="edit-mood-form">
        <div class="form-section">
          <h4>Mood for ${new Date(date).toLocaleDateString()}</h4>
          <div class="mood-options">
            ${["excellent", "good", "okay", "bad", "terrible"]
              .map(
                (mood) => `
              <button class="mood-btn ${entry.mood === mood ? "selected" : ""}" data-mood="${mood}">
                <span class="mood-emoji">${this.getMoodEmoji(mood)}</span>
                <span class="mood-label">${mood.charAt(0).toUpperCase() + mood.slice(1)}</span>
              </button>
            `,
              )
              .join("")}
          </div>
        </div>
        
        <div class="form-section">
          <label for="editNotes">Notes:</label>
          <textarea id="editNotes" rows="3">${entry.notes || ""}</textarea>
        </div>
        
        <div class="form-actions">
          <button class="save-edit-btn" onclick="window.dailyMoodManager.saveMoodEdit('${date}')">Save Changes</button>
          <button class="cancel-edit-btn" onclick="window.dailyMoodManager.closeModal()">Cancel</button>
        </div>
      </div>
    `,
    );
  }

  saveMoodEdit(date) {
    const selectedMood = document.querySelector(
      ".edit-mood-form .mood-btn.selected",
    );
    const notes = document.getElementById("editNotes").value;

    if (!selectedMood) {
      this.showNotification("Please select a mood", "error");
      return;
    }

    const mood = selectedMood.dataset.mood;
    const entryIndex = this.moodHistory.findIndex((e) => e.date === date);

    if (entryIndex !== -1) {
      this.moodHistory[entryIndex].mood = mood;
      this.moodHistory[entryIndex].notes = notes;
      this.moodHistory[entryIndex].value = this.getMoodValue(mood);
      this.moodHistory[entryIndex].timestamp = new Date().toISOString();

      this.saveMoodData();
      this.renderPastMoodLog();
      this.updateStatistics();

      this.showNotification("Mood entry updated successfully!", "success");
      this.closeModal();
    }
  }

  deleteMoodEntry(date) {
    if (confirm("Are you sure you want to delete this mood entry?")) {
      const entryIndex = this.moodHistory.findIndex((e) => e.date === date);

      if (entryIndex !== -1) {
        this.moodHistory.splice(entryIndex, 1);
        this.saveMoodData();
        this.renderPastMoodLog();
        this.updateStatistics();

        this.showNotification("Mood entry deleted", "info");
      }
    }
  }

  exportMoodLog() {
    const filteredLog = this.getFilteredPastMoodLog();

    if (filteredLog.length === 0) {
      this.showNotification("No mood entries to export", "error");
      return;
    }

    const csvContent = this.generateMoodLogCSV(filteredLog);
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `mood-log-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();

    URL.revokeObjectURL(url);
    this.showNotification("Mood log exported successfully!", "success");
  }

  generateMoodLogCSV(entries) {
    const headers = ["Date", "Mood", "Notes", "Influences", "Activities"];
    const csvRows = [headers.join(",")];

    entries.forEach((entry) => {
      const row = [
        entry.date,
        entry.mood,
        `"${(entry.notes || "").replace(/"/g, '""')}"`,
        `"${(entry.influences || []).join("; ")}"`,
        `"${(entry.activities || []).join("; ")}"`,
      ];
      csvRows.push(row.join(","));
    });

    return csvRows.join("\n");
  }

  getMoodEmoji(mood) {
    const emojis = {
      excellent: "😄",
      good: "😊",
      okay: "😐",
      bad: "😔",
      terrible: "😢",
    };
    return emojis[mood] || "❓";
  }

  getMoodValue(mood) {
    const values = {
      excellent: 5,
      good: 4,
      okay: 3,
      bad: 2,
      terrible: 1,
    };
    return values[mood] || 0;
  }

  updatePaginationControls() {
    const paginationInfo = document.getElementById("paginationInfo");
    const prevPageBtn = document.getElementById("prevPageBtn");
    const nextPageBtn = document.getElementById("nextPageBtn");
    const pageNumbers = document.getElementById("pageNumbers");

    if (!paginationInfo || !prevPageBtn || !nextPageBtn || !pageNumbers) return;

    // Update info text
    const startItem =
      this.pagination.totalItems === 0
        ? 0
        : (this.pagination.currentPage - 1) * this.pagination.itemsPerPage + 1;
    const endItem = Math.min(
      this.pagination.currentPage * this.pagination.itemsPerPage,
      this.pagination.totalItems,
    );
    paginationInfo.textContent = `Showing ${startItem}-${endItem} of ${this.pagination.totalItems} entries`;

    // Update button states
    prevPageBtn.disabled = this.pagination.currentPage === 1;
    nextPageBtn.disabled =
      this.pagination.currentPage === this.pagination.totalPages ||
      this.pagination.totalPages === 0;

    // Update page numbers
    pageNumbers.innerHTML = "";

    // Show page numbers (max 5 pages)
    const maxVisiblePages = 5;
    let startPage = Math.max(
      1,
      this.pagination.currentPage - Math.floor(maxVisiblePages / 2),
    );
    let endPage = Math.min(
      this.pagination.totalPages,
      startPage + maxVisiblePages - 1,
    );

    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      const pageBtn = document.createElement("button");
      pageBtn.className = `page-number ${i === this.pagination.currentPage ? "active" : ""}`;
      pageBtn.textContent = i;
      pageBtn.onclick = () => this.goToPage(i);
      pageNumbers.appendChild(pageBtn);
    }
  }

  goToPage(pageNumber) {
    if (pageNumber >= 1 && pageNumber <= this.pagination.totalPages) {
      this.pagination.currentPage = pageNumber;
      this.renderPastMoodLog();
    }
  }

  goToPreviousPage() {
    if (this.pagination.currentPage > 1) {
      this.pagination.currentPage--;
      this.renderPastMoodLog();
    }
  }

  goToNextPage() {
    if (this.pagination.currentPage < this.pagination.totalPages) {
      this.pagination.currentPage++;
      this.renderPastMoodLog();
    }
  }

  getFilteredHistory() {
    const monthFilter = document.getElementById("monthFilter").value;
    const yearFilter = document.getElementById("yearFilter").value;

    return this.moodHistory.filter((entry) => {
      const entryDate = new Date(entry.date);
      const entryMonth = (entryDate.getMonth() + 1).toString();
      const entryYear = entryDate.getFullYear().toString();

      if (monthFilter && entryMonth !== monthFilter) return false;
      if (yearFilter && entryYear !== yearFilter) return false;

      return true;
    });
  }

  filterHistory() {
    this.renderMoodHistory();
  }

  updateStatistics() {
    const validEntries = this.moodHistory.filter((entry) => entry.value > 0);

    // Current streak
    const currentStreak = this.calculateCurrentStreak();
    const streakElement = document.getElementById("currentStreak");
    if (streakElement) {
      streakElement.textContent = currentStreak;
    }

    // Average mood
    const avgMood =
      validEntries.length > 0
        ? (
            validEntries.reduce((sum, entry) => sum + entry.value, 0) /
            validEntries.length
          ).toFixed(1)
        : "0";
    const avgElement = document.getElementById("avgMood");
    if (avgElement) {
      avgElement.textContent = avgMood;
    }

    // Total entries
    const totalElement = document.getElementById("totalEntries");
    if (totalElement) {
      totalElement.textContent = validEntries.length;
    }

    // Best day
    const bestDay = this.calculateBestDay();
    const bestDayElement = document.getElementById("bestDay");
    if (bestDayElement) {
      bestDayElement.textContent = bestDay;
    }
  }

  calculateCurrentStreak() {
    const today = new Date();
    let streak = 0;

    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      const dateStr = checkDate.toISOString().split("T")[0];

      const entry = this.moodHistory.find((e) => e.date === dateStr);

      if (entry && entry.value > 0) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }

    return streak;
  }

  calculateBestDay() {
    const dayMoods = {
      Monday: [],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: [],
      Saturday: [],
      Sunday: [],
    };

    this.moodHistory.forEach((entry) => {
      if (entry.value > 0) {
        const day = new Date(entry.date).toLocaleDateString("en-US", {
          weekday: "long",
        });
        dayMoods[day].push(entry.value);
      }
    });

    let bestDay = "N/A";
    let bestAvg = 0;

    Object.entries(dayMoods).forEach(([day, moods]) => {
      if (moods.length > 0) {
        const avg = moods.reduce((sum, mood) => sum + mood, 0) / moods.length;
        if (avg > bestAvg) {
          bestAvg = avg;
          bestDay = day;
        }
      }
    });

    return bestDay;
  }

  initializeChart() {
    this.updateChart();
  }

  handleChartPeriodChange(event) {
    const button = event.currentTarget;
    const period = button.dataset.period;

    // Update active state
    document.querySelectorAll(".chart-period").forEach((btn) => {
      btn.classList.remove("active");
    });
    button.classList.add("active");

    this.updateChart(period);
  }

  updateChart(period = "week") {
    const canvas = document.getElementById("moodChart");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const data = this.getChartData(period);

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Simple line chart implementation
    this.drawLineChart(ctx, data, canvas.width, canvas.height);
  }

  getChartData(period) {
    const today = new Date();
    const data = [];
    let days = 7;

    switch (period) {
      case "week":
        days = 7;
        break;
      case "month":
        days = 30;
        break;
      case "year":
        days = 365;
        break;
    }

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];

      const entry = this.moodHistory.find((e) => e.date === dateStr);
      data.push({
        date: dateStr,
        value: entry ? entry.value : null,
        label: date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
      });
    }

    return data;
  }

  drawLineChart(ctx, data, width, height) {
    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    // Draw axes
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.stroke();

    // Draw data points and lines
    ctx.strokeStyle = "#ff6b9d";
    ctx.fillStyle = "#ff6b9d";
    ctx.lineWidth = 2;

    const validData = data.filter((d) => d.value !== null);
    if (validData.length === 0) return;

    const xStep = chartWidth / (data.length - 1);
    const yScale = chartHeight / 5; // Mood values 1-5

    ctx.beginPath();
    validData.forEach((point, index) => {
      const x = padding + data.indexOf(point) * xStep;
      const y = height - padding - point.value * yScale;

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();

    // Draw points
    validData.forEach((point) => {
      const x = padding + data.indexOf(point) * xStep;
      const y = height - padding - point.value * yScale;

      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw labels
    ctx.fillStyle = "#718096";
    ctx.font = "12px Poppins";
    ctx.textAlign = "center";

    // X-axis labels (show every nth label to avoid crowding)
    const labelStep = Math.ceil(data.length / 10);
    data.forEach((point, index) => {
      if (index % labelStep === 0) {
        const x = padding + index * xStep;
        ctx.fillText(point.label, x, height - padding + 20);
      }
    });

    // Y-axis labels
    ctx.textAlign = "right";
    for (let i = 1; i <= 5; i++) {
      const y = height - padding - i * yScale;
      ctx.fillText(i.toString(), padding - 10, y + 4);
    }
  }

  exportMoodData() {
    const dataStr = JSON.stringify(this.moodHistory, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `mood-data-${new Date().toISOString().split("T")[0]}.json`;
    link.click();

    URL.revokeObjectURL(url);
    this.showNotification("Mood data exported successfully!", "success");
  }

  showNotifications() {
    const notifications = [
      {
        title: "Daily Reminder",
        message: "Don't forget to log your mood today!",
        time: "2h ago",
      },
      {
        title: "Streak Achievement",
        message: "You're on a 7-day mood tracking streak!",
        time: "1d ago",
      },
      {
        title: "Insight Available",
        message: "New mood insights are ready to view",
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
        max-width: 500px;
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
}

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", function () {
  window.dailyMoodManager = new DailyMoodManager();
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
