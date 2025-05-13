/**
 * Standalone Modal Implementation
 * This script replaces Bootstrap's modal functionality with a custom implementation
 * that doesn't rely on Bootstrap's JavaScript
 */

// Execute immediately to ensure it runs before page interactions
(function() {
  // Create and apply styles to ensure modals work properly
  const style = document.createElement('style');
  style.textContent = `
    .modal-open {
      overflow: hidden;
    }
    .modal-open .modal {
      overflow-x: hidden;
      overflow-y: auto;
    }
    .modal {
      position: fixed;
      top: 0;
      left: 0;
      z-index: 1050;
      display: none;
      width: 100%;
      height: 100%;
      overflow: hidden;
      outline: 0;
    }
    .modal.fade .modal-dialog {
      transition: transform 0.3s ease-out;
      transform: translate(0, -50px);
    }
    .modal.show .modal-dialog {
      transform: none;
    }
    .modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      z-index: 1040;
      width: 100vw;
      height: 100vh;
      background-color: #000;
    }
    .modal-backdrop.fade {
      opacity: 0;
    }
    .modal-backdrop.show {
      opacity: 0.5;
    }
  `;
  document.head.appendChild(style);
  
  // Function to initialize all modals on the page
  function initModals() {
    // Clean up any existing modal issues
    function cleanupModals() {
      document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
      document.body.classList.remove('modal-open');
      document.body.style.paddingRight = '';
      document.body.style.overflow = '';
    }
    
    // Run cleanup immediately
    cleanupModals();
    
    // Find all modals on the page
    const modals = document.querySelectorAll('.modal');
    
    // Find all modal triggers
    const modalTriggers = document.querySelectorAll('[data-bs-toggle="modal"], [data-toggle="modal"]');
    
    // Function to open a modal
    function openModal(modal) {
      // Clean up any existing modals
      cleanupModals();
      
      // Create backdrop
      const backdrop = document.createElement('div');
      backdrop.className = 'modal-backdrop fade show';
      document.body.appendChild(backdrop);
      
      // Show modal
      modal.style.display = 'block';
      modal.classList.add('show');
      
      // Add body classes
      document.body.classList.add('modal-open');
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = '17px';
      
      // Focus the first input in the modal
      setTimeout(() => {
        const firstInput = modal.querySelector('input, select, textarea');
        if (firstInput) firstInput.focus();
      }, 100);
    }
    
    // Function to close a modal
    function closeModal(modal) {
      modal.style.display = 'none';
      modal.classList.remove('show');
      cleanupModals();
    }
    
    // Set up event listeners for modal triggers
    modalTriggers.forEach(trigger => {
      trigger.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        // Get target modal
        const targetSelector = this.getAttribute('data-bs-target') || 
                              this.getAttribute('data-target') || 
                              this.getAttribute('href');
        if (!targetSelector) return;
        
        const modal = document.querySelector(targetSelector);
        if (!modal) return;
        
        // Open the modal
        openModal(modal);
      });
    });
    
    // Set up event listeners for close buttons
    document.querySelectorAll('[data-bs-dismiss="modal"], [data-dismiss="modal"], .modal .btn-close, .modal .close').forEach(closeBtn => {
      closeBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const modal = this.closest('.modal');
        if (modal) closeModal(modal);
      });
    });
    
    // Close modal when clicking on backdrop
    modals.forEach(modal => {
      modal.addEventListener('click', function(e) {
        if (e.target === this) closeModal(this);
      });
    });
    
    // Close modal with Escape key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' || e.keyCode === 27) {
        const openModal = document.querySelector('.modal.show');
        if (openModal) closeModal(openModal);
      }
    });
  }
  
  // Run when DOM is loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initModals);
  } else {
    // DOM already loaded, run immediately
    initModals();
  }
  
  // Re-initialize modals when new content is loaded via AJAX
  const originalXHR = window.XMLHttpRequest;
  window.XMLHttpRequest = function() {
    const xhr = new originalXHR();
    const originalOnLoad = xhr.onload;
    xhr.onload = function() {
      if (originalOnLoad) originalOnLoad.apply(this, arguments);
      setTimeout(initModals, 100);
    };
    return xhr;
  };
  
  // Make functions available globally
  window.standaloneModal = {
    init: initModals,
    open: function(modalId) {
      const modal = document.getElementById(modalId);
      if (modal) {
        // Clean up any existing modals
        document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
        document.body.classList.remove('modal-open');
        
        // Create backdrop
        const backdrop = document.createElement('div');
        backdrop.className = 'modal-backdrop fade show';
        document.body.appendChild(backdrop);
        
        // Show modal
        modal.style.display = 'block';
        modal.classList.add('show');
        
        // Add body classes
        document.body.classList.add('modal-open');
        document.body.style.overflow = 'hidden';
      }
    },
    close: function(modalId) {
      const modal = document.getElementById(modalId);
      if (modal) {
        modal.style.display = 'none';
        modal.classList.remove('show');
        
        // Remove backdrop and reset body
        document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
        document.body.classList.remove('modal-open');
        document.body.style.overflow = '';
      }
    }
  };
})();
