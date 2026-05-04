// Mental Health Info Page JavaScript - MindSpace

class MentalHealthInfoManager {
  constructor() {
    this.currentPage = 'mental-health-info';
    this.init();
  }

  init() {
    this.bindEvents();
    this.loadContent();
    this.initializeAnimations();
    console.log('Mental Health Info page initialized');
  }

  bindEvents() {
    // Navigation
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => this.handleNavigation(e));
    });

    // Action buttons
    const actionButtons = document.querySelectorAll('.action-btn');
    actionButtons.forEach(btn => {
      btn.addEventListener('click', (e) => this.handleAction(e));
    });

    // Resource buttons
    const resourceButtons = document.querySelectorAll('.resource-btn');
    resourceButtons.forEach(btn => {
      btn.addEventListener('click', (e) => this.handleResource(e));
    });

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
      // Current page - do nothing
      return;
    }

    // Navigate to the page
    window.location.href = href;
  }

  handleAction(event) {
    const button = event.currentTarget;
    const actionText = button.textContent.trim();

    switch (actionText) {
      case 'Find a Therapist':
        this.showNotification('Opening therapist finder...', 'info');
        setTimeout(() => {
          window.location.href = 'recommendation.html';
        }, 1500);
        break;
      case 'Talk to Someone':
        this.showNotification('Opening chat support...', 'info');
        this.openChatSupport();
        break;
      case 'Emergency Resources':
        this.showNotification('Loading emergency resources...', 'info');
        window.location.href = 'crisis-hotline.html';
        break;
      default:
        console.log('Unknown action:', actionText);
    }
  }

  handleResource(event) {
    const button = event.currentTarget;
    const resourceText = button.textContent.trim();

    switch (resourceText) {
      case 'Browse Resources':
        this.showNotification('Opening educational resources...', 'info');
        this.openEducationalResources();
        break;
      case 'Watch Videos':
        this.showNotification('Loading video content...', 'info');
        this.openVideoContent();
        break;
      case 'Listen Now':
        this.showNotification('Opening audio content...', 'info');
        this.openAudioContent();
        break;
      case 'View Apps':
        this.showNotification('Loading recommended apps...', 'info');
        this.openRecommendedApps();
        break;
      default:
        console.log('Unknown resource:', resourceText);
    }
  }

  openChatSupport() {
    // Simulate opening chat support
    const chatModal = this.createModal('Chat Support', `
      <div class="chat-content">
        <p>Connect with a mental health professional now.</p>
        <div class="chat-options">
          <button class="chat-option">Start Live Chat</button>
          <button class="chat-option secondary">Schedule Appointment</button>
        </div>
      </div>
    `);
    
    // Add event listeners to chat options
    chatModal.querySelectorAll('.chat-option').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const option = e.target.textContent;
        this.showNotification(`${option} - Feature coming soon!`, 'info');
        this.closeModal();
      });
    });
  }

  openEducationalResources() {
    const resources = [
      { title: 'Understanding Anxiety', type: 'Article', duration: '5 min read' },
      { title: 'Depression Guide', type: 'PDF', duration: '15 pages' },
      { title: 'Stress Management Techniques', type: 'Article', duration: '8 min read' },
      { title: 'Mental Health 101', type: 'Video', duration: '12 min' }
    ];

    const resourcesList = resources.map(r => `
      <div class="resource-item">
        <div class="resource-info">
          <h4>${r.title}</h4>
          <span class="resource-meta">${r.type} • ${r.duration}</span>
        </div>
        <button class="resource-item-btn">View</button>
      </div>
    `).join('');

    const modal = this.createModal('Educational Resources', `
      <div class="resources-list">
        ${resourcesList}
      </div>
    `);

    modal.querySelectorAll('.resource-item-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const item = e.target.closest('.resource-item');
        const title = item.querySelector('h4').textContent;
        this.showNotification(`Opening: ${title}`, 'info');
      });
    });
  }

  openVideoContent() {
    const videos = [
      { title: 'Meditation for Beginners', duration: '10 min', category: 'Meditation' },
      { title: 'Understanding Your Emotions', duration: '15 min', category: 'Education' },
      { title: 'Daily Mindfulness Practice', duration: '8 min', category: 'Practice' },
      { title: 'Coping with Anxiety', duration: '12 min', category: 'Anxiety' }
    ];

    const videosList = videos.map(v => `
      <div class="video-item">
        <div class="video-thumbnail">🎥</div>
        <div class="video-info">
          <h4>${v.title}</h4>
          <span class="video-meta">${v.duration} • ${v.category}</span>
        </div>
        <button class="video-item-btn">Play</button>
      </div>
    `).join('');

    const modal = this.createModal('Video Library', `
      <div class="videos-list">
        ${videosList}
      </div>
    `);

    modal.querySelectorAll('.video-item-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const item = e.target.closest('.video-item');
        const title = item.querySelector('h4').textContent;
        this.showNotification(`Playing: ${title}`, 'info');
      });
    });
  }

  openAudioContent() {
    const audioContent = [
      { title: 'Guided Meditation', duration: '15 min', type: 'Meditation' },
      { title: 'Sleep Stories', duration: '20 min', type: 'Sleep' },
      { title: 'Breathing Exercises', duration: '5 min', type: 'Exercise' },
      { title: 'Positive Affirmations', duration: '10 min', type: 'Affirmations' }
    ];

    const audioList = audioContent.map(a => `
      <div class="audio-item">
        <div class="audio-thumbnail">🎧</div>
        <div class="audio-info">
          <h4>${a.title}</h4>
          <span class="audio-meta">${a.duration} • ${a.type}</span>
        </div>
        <button class="audio-item-btn">Play</button>
      </div>
    `).join('');

    const modal = this.createModal('Audio Library', `
      <div class="audio-list">
        ${audioList}
      </div>
    `);

    modal.querySelectorAll('.audio-item-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const item = e.target.closest('.audio-item');
        const title = item.querySelector('h4').textContent;
        this.showNotification(`Playing: ${title}`, 'info');
      });
    });
  }

  openRecommendedApps() {
    const apps = [
      { name: 'Calm', category: 'Meditation', rating: '4.8', price: 'Free/Premium' },
      { name: 'Headspace', category: 'Mindfulness', rating: '4.7', price: 'Free/Premium' },
      { name: 'Moodpath', category: 'Mood Tracking', rating: '4.5', price: 'Free' },
      { name: 'Talkspace', category: 'Therapy', rating: '4.6', price: 'Subscription' }
    ];

    const appsList = apps.map(a => `
      <div class="app-item">
        <div class="app-info">
          <h4>${a.name}</h4>
          <span class="app-category">${a.category}</span>
          <div class="app-meta">
            <span class="app-rating">⭐ ${a.rating}</span>
            <span class="app-price">${a.price}</span>
          </div>
        </div>
        <button class="app-item-btn">View</button>
      </div>
    `).join('');

    const modal = this.createModal('Recommended Apps', `
      <div class="apps-list">
        ${appsList}
      </div>
    `);

    modal.querySelectorAll('.app-item-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const item = e.target.closest('.app-item');
        const appName = item.querySelector('h4').textContent;
        this.showNotification(`Viewing details for: ${appName}`, 'info');
      });
    });
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
      
      .resource-item, .video-item, .audio-item, .app-item {
        display: flex;
        align-items: center;
        gap: 15px;
        padding: 15px;
        background: rgba(255, 255, 255, 0.5);
        border-radius: 10px;
        margin-bottom: 10px;
        transition: all 0.3s ease;
      }
      
      .resource-item:hover, .video-item:hover, .audio-item:hover, .app-item:hover {
        background: rgba(255, 107, 157, 0.05);
        transform: translateX(5px);
      }
      
      .resource-thumbnail, .video-thumbnail, .audio-thumbnail {
        font-size: 2rem;
        width: 50px;
        height: 50px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(255, 107, 157, 0.1);
        border-radius: 10px;
      }
      
      .resource-info, .video-info, .audio-info, .app-info {
        flex: 1;
      }
      
      .resource-info h4, .video-info h4, .audio-info h4, .app-info h4 {
        margin: 0 0 5px 0;
        color: #2d3748;
        font-size: 1rem;
        font-weight: 600;
      }
      
      .resource-meta, .video-meta, .audio-meta {
        color: #718096;
        font-size: 0.85rem;
      }
      
      .app-category {
        display: block;
        color: #ff6b9d;
        font-size: 0.85rem;
        margin-bottom: 5px;
      }
      
      .app-meta {
        display: flex;
        gap: 10px;
      }
      
      .app-rating, .app-price {
        background: rgba(255, 107, 157, 0.1);
        color: #ff6b9d;
        padding: 2px 8px;
        border-radius: 10px;
        font-size: 0.75rem;
      }
      
      .resource-item-btn, .video-item-btn, .audio-item-btn, .app-item-btn {
        background: linear-gradient(135deg, #ff6b9d, #ff8fa3);
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 15px;
        font-size: 0.85rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
      }
      
      .resource-item-btn:hover, .video-item-btn:hover, .audio-item-btn:hover, .app-item-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 15px rgba(255, 107, 157, 0.3);
      }
      
      .chat-options {
        display: flex;
        flex-direction: column;
        gap: 10px;
        margin-top: 20px;
      }
      
      .chat-option {
        background: linear-gradient(135deg, #ff6b9d, #ff8fa3);
        color: white;
        border: none;
        padding: 12px 20px;
        border-radius: 10px;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
      }
      
      .chat-option.secondary {
        background: rgba(255, 255, 255, 0.8);
        color: #ff6b9d;
        border: 2px solid rgba(255, 107, 157, 0.3);
      }
      
      .chat-option:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 15px rgba(255, 107, 157, 0.3);
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

    return modal;
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

  showNotifications() {
    const notifications = [
      { title: 'New Mental Health Article', message: 'Understanding anxiety disorders', time: '2h ago' },
      { title: 'Reminder: Daily Check-in', message: 'Don\'t forget to log your mood', time: '5h ago' },
      { title: 'Resource Updated', message: 'New meditation exercises available', time: '1d ago' }
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

    const modal = this.createModal('Notifications', `
      <div class="notifications-list">
        ${notificationList}
      </div>
    `);
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

  loadContent() {
    // Load any dynamic content
    console.log('Loading mental health info content...');
  }

  initializeAnimations() {
    // Add scroll animations for cards
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }
      });
    }, observerOptions);

    // Observe all cards
    document.querySelectorAll('.condition-card, .tip-card, .resource-card').forEach(card => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(20px)';
      card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      observer.observe(card);
    });
  }

  addMobileMenuToggle() {
    // Add mobile menu toggle button
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

      // Show on mobile
      if (window.innerWidth <= 768) {
        menuToggle.style.display = 'block';
      }

      // Handle resize
      window.addEventListener('resize', () => {
        menuToggle.style.display = window.innerWidth <= 768 ? 'block' : 'none';
      });
    }
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  window.mentalHealthInfoManager = new MentalHealthInfoManager();
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
