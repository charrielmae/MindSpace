// Interests Page JavaScript - MindSpace Medical & Self-diagnosis

class InterestsManager {
  constructor() {
    this.selectedInterests = new Set();
    this.init();
  }

  init() {
    this.bindEvents();
    this.loadSavedInterests();
    console.log('Interests page initialized');
  }

  bindEvents() {
    // Bind interest item clicks
    const interestItems = document.querySelectorAll('.interest-item');
    interestItems.forEach(item => {
      item.addEventListener('click', (e) => this.handleInterestClick(e));
    });

    // Bind navigation buttons
    const backArrow = document.querySelector('.back-arrow');
    const searchIcon = document.querySelector('.search-icon');
    const nextButton = document.querySelector('.next-button .btn');

    if (backArrow) {
      backArrow.addEventListener('click', () => this.goBack());
    }

    if (searchIcon) {
      searchIcon.addEventListener('click', () => this.handleSearch());
    }

    if (nextButton) {
      nextButton.addEventListener('click', () => this.proceedToNext());
    }

    // Add keyboard navigation
    this.addKeyboardNavigation();
  }

  handleInterestClick(event) {
    const item = event.currentTarget;
    const interest = item.dataset.interest;
    
    if (!interest) {
      console.warn('Interest item missing data-interest attribute');
      return;
    }

    // Toggle selection
    if (this.selectedInterests.has(interest)) {
      this.selectedInterests.delete(interest);
      item.classList.remove('selected');
      console.log('Interest deselected:', interest);
    } else {
      this.selectedInterests.add(interest);
      item.classList.add('selected');
      console.log('Interest selected:', interest);
      
      // Add selection animation
      this.addSelectionAnimation(item);
    }

    // Update UI state
    this.updateNextButtonState();
    this.saveInterests();
  }

  addSelectionAnimation(item) {
    item.style.transform = 'scale(0.95)';
    setTimeout(() => {
      item.style.transform = '';
    }, 150);
  }

  updateNextButtonState() {
    const nextButton = document.querySelector('.next-button .btn');
    if (!nextButton) return;

    const hasSelections = this.selectedInterests.size > 0;
    
    if (hasSelections) {
      nextButton.classList.remove('disabled');
      nextButton.disabled = false;
    } else {
      nextButton.classList.add('disabled');
      nextButton.disabled = true;
    }
  }

  handleSearch() {
    // Implement search functionality
    const searchTerm = prompt('Search for a specific topic:');
    if (searchTerm) {
      this.searchInterests(searchTerm);
    }
  }

  searchInterests(searchTerm) {
    const interestItems = document.querySelectorAll('.interest-item');
    const term = searchTerm.toLowerCase();
    
    interestItems.forEach(item => {
      const text = item.textContent.toLowerCase();
      const parent = item.parentElement;
      
      if (text.includes(term)) {
        parent.style.display = '';
        // Highlight matching items
        if (text === term) {
          item.classList.add('highlight');
          setTimeout(() => {
            item.classList.remove('highlight');
          }, 2000);
        }
      } else {
        parent.style.display = 'none';
      }
    });

    // Show message if no results
    const visibleItems = document.querySelectorAll('.interest-item:not([style*="display: none"])');
    if (visibleItems.length === 0) {
      this.showNoResultsMessage(searchTerm);
    }
  }

  showNoResultsMessage(searchTerm) {
    const message = document.createElement('div');
    message.className = 'no-results';
    message.textContent = `No results found for "${searchTerm}"`;
    message.style.cssText = `
      text-align: center;
      color: #718096;
      margin: 20px 0;
      font-style: italic;
    `;
    
    const grid = document.querySelector('.interests-grid');
    if (grid) {
      grid.appendChild(message);
      
      // Auto-remove after 3 seconds
      setTimeout(() => {
        message.remove();
        this.resetSearch();
      }, 3000);
    }
  }

  resetSearch() {
    const interestItems = document.querySelectorAll('.interest-item');
    interestItems.forEach(item => {
      item.parentElement.style.display = '';
    });
  }

  goBack() {
    // Save current state before leaving
    this.saveInterests();
    
    // Navigate back with confirmation if there are selections
    if (this.selectedInterests.size > 0) {
      const confirmLeave = confirm('You have selected interests. Are you sure you want to go back?');
      if (!confirmLeave) return;
    }
    
    window.location.href = 'landing.html';
  }

  proceedToNext() {
    if (this.selectedInterests.size === 0) {
      this.showErrorMessage('Please select at least one interest to continue.');
      return;
    }

    // Add loading state
    const nextButton = document.querySelector('.next-button .btn');
    if (nextButton) {
      nextButton.classList.add('loading');
      nextButton.textContent = 'Saving...';
    }

    // Simulate saving process
    setTimeout(() => {
      this.saveInterests();
      console.log('Selected interests:', Array.from(this.selectedInterests));
      
      // Navigate to next page
      window.location.href = 'dashboard.html';
    }, 1000);
  }

  saveInterests() {
    try {
      const interestsData = {
        interests: Array.from(this.selectedInterests),
        timestamp: new Date().toISOString(),
        page: 'interests'
      };
      
      localStorage.setItem('mindspace_interests', JSON.stringify(interestsData));
      console.log('Interests saved to localStorage');
    } catch (error) {
      console.error('Error saving interests:', error);
      this.showErrorMessage('Unable to save your selections. Please try again.');
    }
  }

  loadSavedInterests() {
    try {
      const savedData = localStorage.getItem('mindspace_interests');
      if (savedData) {
        const data = JSON.parse(savedData);
        const interests = data.interests || [];
        
        interests.forEach(interest => {
          const item = document.querySelector(`[data-interest="${interest}"]`);
          if (item) {
            item.classList.add('selected');
            this.selectedInterests.add(interest);
          }
        });
        
        this.updateNextButtonState();
        console.log('Loaded saved interests:', interests);
      }
    } catch (error) {
      console.error('Error loading saved interests:', error);
    }
  }

  showErrorMessage(message) {
    // Remove existing error messages
    const existingError = document.querySelector('.error-message');
    if (existingError) {
      existingError.remove();
    }

    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    errorDiv.style.cssText = `
      background: #ff6b9d;
      color: white;
      padding: 15px 20px;
      border-radius: 8px;
      margin: 20px auto;
      max-width: 400px;
      text-align: center;
      font-weight: 500;
      box-shadow: 0 4px 15px rgba(255, 107, 157, 0.3);
      animation: slideDown 0.3s ease-out;
    `;

    const content = document.querySelector('.interests-content');
    if (content) {
      content.insertBefore(errorDiv, content.querySelector('.interests-grid'));
      
      // Auto-remove after 5 seconds
      setTimeout(() => {
        errorDiv.remove();
      }, 5000);
    }
  }

  addKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
      // Escape key to go back
      if (e.key === 'Escape') {
        this.goBack();
      }
      
      // Enter key to proceed if next button is focused
      if (e.key === 'Enter' && document.activeElement.classList.contains('btn')) {
        this.proceedToNext();
      }
      
      // Arrow keys for interest navigation
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || 
          e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        this.navigateWithArrows(e);
      }
    });
  }

  navigateWithArrows(event) {
    const items = Array.from(document.querySelectorAll('.interest-item'));
    const currentIndex = items.findIndex(item => item === document.activeElement);
    
    let nextIndex;
    
    switch(event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        nextIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
        break;
    }
    
    if (nextIndex !== undefined && items[nextIndex]) {
      event.preventDefault();
      items[nextIndex].focus();
    }
  }

  // Public methods for external access
  getSelectedInterests() {
    return Array.from(this.selectedInterests);
  }

  clearSelections() {
    this.selectedInterests.clear();
    document.querySelectorAll('.interest-item.selected').forEach(item => {
      item.classList.remove('selected');
    });
    this.updateNextButtonState();
    this.saveInterests();
  }
}

// Initialize the interests manager when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  window.interestsManager = new InterestsManager();
});

// Add CSS animation for error messages
const style = document.createElement('style');
style.textContent = `
  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .interest-item.highlight {
    animation: highlight 2s ease-in-out;
  }
  
  @keyframes highlight {
    0%, 100% { 
      background: rgba(255, 107, 157, 0.1); 
      border-color: rgba(255, 107, 157, 0.5);
    }
    50% { 
      background: rgba(255, 107, 157, 0.3); 
      border-color: #ff6b9d;
    }
  }
  
  .btn.disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none !important;
  }
  
  .btn.loading {
    pointer-events: none;
    opacity: 0.7;
  }
  
  .btn.loading::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 16px;
    height: 16px;
    margin: -8px 0 0 -8px;
    border: 2px solid #ffffff;
    border-radius: 50%;
    border-top-color: transparent;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;
document.head.appendChild(style);
