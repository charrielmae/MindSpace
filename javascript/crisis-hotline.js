// Crisis Hotline Page JavaScript - MindSpace

class CrisisHotlineManager {
  constructor() {
    this.currentPage = 'crisis-hotline';
    this.init();
  }

  init() {
    this.bindEvents();
    this.loadEmergencyContacts();
    console.log('Crisis Hotline page initialized');
  }

  bindEvents() {
    // Navigation
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => this.handleNavigation(e));
    });

    // Logout functionality
    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => this.handleLogout());
    }

    // Notifications
    const notificationBtn = document.querySelector('.notification-btn');
    if (notificationBtn) {
      notificationBtn.addEventListener('click', () => this.showNotifications());
    }

    // Mobile menu toggle
    this.addMobileMenuToggle();
  }

  handleNavigation(event) {
    event.preventDefault();
    const link = event.currentTarget;
    const href = link.getAttribute('href');

    if (href === '#') {
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

  loadEmergencyContacts() {
    // Emergency contacts are already in HTML, but we could load them dynamically here
    console.log('Emergency contacts loaded');
  }

  createSafetyPlan() {
    const modal = this.createModal('Create Your Safety Plan', `
      <div class="safety-plan-form">
        <div class="form-section">
          <h3>Step 1: Warning Signs</h3>
          <textarea id="warningSigns" placeholder="What are your personal warning signs that a crisis may be developing?" rows="3"></textarea>
        </div>

        <div class="form-section">
          <h3>Step 2: Internal Coping Strategies</h3>
          <textarea id="copingStrategies" placeholder="What activities can you do by yourself to take your mind off problems?" rows="3"></textarea>
        </div>

        <div class="form-section">
          <h3>Step 3: Social Contacts</h3>
          <textarea id="socialContacts" placeholder="Who can help distract you? (Friends, family, etc.)" rows="3"></textarea>
        </div>

        <div class="form-section">
          <h3>Step 4: Professionals & Agencies</h3>
          <textarea id="professionals" placeholder="List mental health professionals and crisis hotlines" rows="3"></textarea>
        </div>

        <div class="form-section">
          <h3>Step 5: Secure Environment</h3>
          <textarea id="secureEnvironment" placeholder="How can you make your environment safe?" rows="3"></textarea>
        </div>

        <div class="form-actions">
          <button class="save-plan-btn" onclick="window.crisisHotlineManager.saveSafetyPlan()">Save Plan</button>
          <button class="download-plan-btn" onclick="window.crisisHotlineManager.downloadSafetyPlan()">Download PDF</button>
        </div>
      </div>
    `);

    // Add form styles
    const formStyles = `
      .safety-plan-form {
        max-height: 60vh;
        overflow-y: auto;
      }
      
      .form-section {
        margin-bottom: 25px;
      }
      
      .form-section h3 {
        color: #2d3748;
        margin-bottom: 10px;
        font-size: 1.1rem;
        font-weight: 600;
      }
      
      .form-section textarea {
        width: 100%;
        padding: 12px;
        border: 2px solid rgba(255, 107, 157, 0.3);
        border-radius: 10px;
        font-family: 'Poppins', sans-serif;
        font-size: 0.9rem;
        resize: vertical;
        transition: all 0.3s ease;
      }
      
      .form-section textarea:focus {
        outline: none;
        border-color: #ff6b9d;
        box-shadow: 0 0 0 3px rgba(255, 107, 157, 0.1);
      }
      
      .form-actions {
        display: flex;
        gap: 15px;
        justify-content: center;
        margin-top: 25px;
      }
      
      .save-plan-btn,
      .download-plan-btn {
        padding: 12px 25px;
        border: none;
        border-radius: 25px;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
      }
      
      .save-plan-btn {
        background: linear-gradient(135deg, #ff6b9d, #ff8fa3);
        color: white;
        box-shadow: 0 4px 15px rgba(255, 107, 157, 0.3);
      }
      
      .download-plan-btn {
        background: rgba(255, 255, 255, 0.8);
        color: #ff6b9d;
        border: 2px solid rgba(255, 107, 157, 0.3);
      }
      
      .save-plan-btn:hover,
      .download-plan-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 15px rgba(255, 107, 157, 0.3);
      }
    `;

    // Add styles if not already added
    if (!document.querySelector('#safety-plan-styles')) {
      const styleElement = document.createElement('style');
      styleElement.id = 'safety-plan-styles';
      styleElement.textContent = formStyles;
      document.head.appendChild(styleElement);
    }
  }

  saveSafetyPlan() {
    const safetyPlan = {
      warningSigns: document.getElementById('warningSigns')?.value || '',
      copingStrategies: document.getElementById('copingStrategies')?.value || '',
      socialContacts: document.getElementById('socialContacts')?.value || '',
      professionals: document.getElementById('professionals')?.value || '',
      secureEnvironment: document.getElementById('secureEnvironment')?.value || '',
      createdAt: new Date().toISOString()
    };

    try {
      localStorage.setItem('mindspace_safety_plan', JSON.stringify(safetyPlan));
      this.showNotification('Safety plan saved successfully!', 'success');
      this.closeModal();
    } catch (error) {
      console.error('Error saving safety plan:', error);
      this.showNotification('Error saving safety plan', 'error');
    }
  }

  downloadSafetyPlan() {
    const safetyPlan = {
      warningSigns: document.getElementById('warningSigns')?.value || '',
      copingStrategies: document.getElementById('copingStrategies')?.value || '',
      socialContacts: document.getElementById('socialContacts')?.value || '',
      professionals: document.getElementById('professionals')?.value || '',
      secureEnvironment: document.getElementById('secureEnvironment')?.value || '',
      createdAt: new Date().toLocaleString()
    };

    // Create text content for download
    const content = `
MY SAFETY PLAN
Created: ${safetyPlan.createdAt}

1. WARNING SIGNS
${safetyPlan.warningSigns || 'Not specified'}

2. INTERNAL COPING STRATEGIES
${safetyPlan.copingStrategies || 'Not specified'}

3. SOCIAL CONTACTS
${safetyPlan.socialContacts || 'Not specified'}

4. PROFESSIONALS & AGENCIES
${safetyPlan.professionals || 'Not specified'}

5. SECURE ENVIRONMENT
${safetyPlan.secureEnvironment || 'Not specified'}

EMERGENCY CONTACTS:
- 988 Suicide & Crisis Lifeline: Call or text 988
- Crisis Text Line: Text HOME to 741741
- Emergency Services: Call 911

REMEMBER: You are not alone. Help is available 24/7.
    `.trim();

    // Create and download file
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `safety-plan-${new Date().toISOString().split('T')[0]}.txt`;
    link.click();
    
    URL.revokeObjectURL(url);
    this.showNotification('Safety plan downloaded successfully!', 'success');
  }

  showNotifications() {
    const notifications = [
      { title: 'Emergency Resources Updated', message: 'New crisis hotlines added to your area', time: '2h ago' },
      { title: 'Safety Plan Reminder', message: 'Review and update your safety plan regularly', time: '1d ago' },
      { title: 'Support Available', message: '24/7 crisis support is always available', time: '2d ago' }
    ];

    const notificationList = notifications.map(n => 
      `<div class="notification-item">
        <div class="notification-content">
          <div class="notification-title">${n.title}</div>
          <div class="notification-message">${n.message}</div>
          <div class="notification-time">${n.time}</div>
        </div>
      </div>`
    ).join('');

    this.createModal('Notifications', `
      <div class="notifications-list">
        ${notificationList}
      </div>
    `);
  }

  createModal(title, content) {
    // Remove existing modal
    const existingModal = document.querySelector('.modal-overlay');
    if (existingModal) {
      existingModal.remove();
    }

    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
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
        max-width: 700px;
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
    if (!document.querySelector('#modal-styles')) {
      const styleElement = document.createElement('style');
      styleElement.id = 'modal-styles';
      styleElement.textContent = modalStyles;
      document.head.appendChild(styleElement);
    }

    document.body.appendChild(modal);

    // Close modal functionality
    const closeBtn = modal.querySelector('.modal-close');
    closeBtn.addEventListener('click', () => this.closeModal());

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        this.closeModal();
      }
    });
  }

  closeModal() {
    const modal = document.querySelector('.modal-overlay');
    if (modal) {
      modal.style.animation = 'fadeOut 0.3s ease-out';
      setTimeout(() => {
        modal.remove();
      }, 300);
    }
  }

  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `page-notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#ff6b9d'};
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
      notification.style.animation = 'slideOut 0.3s ease-out';
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, 3000);
  }

  addMobileMenuToggle() {
    const header = document.querySelector('.page-header');
    if (header && window.innerWidth <= 768) {
      const menuToggle = document.createElement('button');
      menuToggle.className = 'mobile-menu-toggle';
      menuToggle.innerHTML = '☰';
      menuToggle.style.cssText = `
        display: none;
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        padding: 8px;
        border-radius: 5px;
      `;
      
      menuToggle.addEventListener('click', () => {
        const sidebar = document.querySelector('.sidebar');
        sidebar.classList.toggle('open');
      });

      header.insertBefore(menuToggle, header.firstChild);

      if (window.innerWidth <= 768) {
        menuToggle.style.display = 'block';
      }

      window.addEventListener('resize', () => {
        menuToggle.style.display = window.innerWidth <= 768 ? 'block' : 'none';
      });
    }
  }

  // Emergency auto-dial functionality
  handleEmergencyCall(phoneNumber) {
    this.showNotification(`Calling emergency services: ${phoneNumber}...`, 'info');
    // In a real app, this might include additional confirmation dialogs
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  window.crisisHotlineManager = new CrisisHotlineManager();
});

// Add fadeOut animation
const style = document.createElement('style');
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
