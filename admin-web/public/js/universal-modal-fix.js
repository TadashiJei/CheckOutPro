/**
 * Universal Modal Fix
 * This script fixes all modal issues in the application by directly manipulating the DOM
 */

// Execute immediately to ensure it runs before page interactions
(function() {
  // Function to fix all modals on the page
  function fixAllModals() {
    console.log('Universal Modal Fix: Fixing all modals');
    
    // Clean up any existing modal issues
    function cleanupModalBackdrops() {
      document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
      document.body.classList.remove('modal-open');
      document.body.style.paddingRight = '';
      document.body.style.overflow = '';
    }
    
    // Run cleanup immediately
    cleanupModalBackdrops();
    
    // Fix all modal triggers
    document.querySelectorAll('[data-bs-toggle="modal"], [data-toggle="modal"]').forEach(trigger => {
      // Skip if already processed
      if (trigger.getAttribute('data-modal-fixed')) return;
      
      // Mark as processed
      trigger.setAttribute('data-modal-fixed', 'true');
      
      // Get target modal
      const targetSelector = trigger.getAttribute('data-bs-target') || 
                           trigger.getAttribute('data-target') || 
                           trigger.getAttribute('href');
      if (!targetSelector) return;
      
      const modal = document.querySelector(targetSelector);
      if (!modal) return;
      
      // Replace click handler
      const originalClick = trigger.onclick;
      trigger.onclick = function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        console.log('Universal Modal Fix: Opening modal', targetSelector);
        
        // Clean up any existing modals
        cleanupModalBackdrops();
        
        // Create backdrop
        const backdrop = document.createElement('div');
        backdrop.className = 'modal-backdrop fade show';
        document.body.appendChild(backdrop);
        
        // Show modal
        modal.style.display = 'block';
        modal.classList.add('show');
        modal.setAttribute('aria-modal', 'true');
        modal.setAttribute('role', 'dialog');
        modal.removeAttribute('aria-hidden');
        
        // Add body classes
        document.body.classList.add('modal-open');
        document.body.style.overflow = 'hidden';
        document.body.style.paddingRight = '17px';
        
        // Make sure form inputs are clickable
        const inputs = modal.querySelectorAll('input, select, textarea, button');
        inputs.forEach(input => {
          input.style.zIndex = '1052';
          input.style.position = 'relative';
        });
        
        // Call original handler if it exists
        if (originalClick && typeof originalClick === 'function') {
          originalClick.call(this, e);
        }
        
        return false;
      };
    });
    
    // Fix all modals
    document.querySelectorAll('.modal').forEach(modal => {
      // Skip if already processed
      if (modal.getAttribute('data-modal-fixed')) return;
      
      // Mark as processed
      modal.setAttribute('data-modal-fixed', 'true');
      
      // Fix close buttons
      modal.querySelectorAll('[data-bs-dismiss="modal"], [data-dismiss="modal"], .btn-close, .close, .cancel, button.btn-secondary').forEach(closeBtn => {
        const originalClick = closeBtn.onclick;
        closeBtn.onclick = function(e) {
          e.preventDefault();
          e.stopPropagation();
          
          console.log('Universal Modal Fix: Closing modal');
          
          // Hide modal
          modal.style.display = 'none';
          modal.classList.remove('show');
          modal.setAttribute('aria-hidden', 'true');
          modal.removeAttribute('aria-modal');
          modal.removeAttribute('role');
          
          // Clean up
          cleanupModalBackdrops();
          
          // Call original handler if it exists
          if (originalClick && typeof originalClick === 'function') {
            originalClick.call(this, e);
          }
          
          return false;
        };
      });
      
      // Close when clicking outside the modal
      modal.addEventListener('click', function(e) {
        if (e.target === this) {
          console.log('Universal Modal Fix: Closing modal (clicked outside)');
          
          // Hide modal
          modal.style.display = 'none';
          modal.classList.remove('show');
          modal.setAttribute('aria-hidden', 'true');
          modal.removeAttribute('aria-modal');
          modal.removeAttribute('role');
          
          // Clean up
          cleanupModalBackdrops();
        }
      });
    });
    
    // Close modal on escape key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' || e.keyCode === 27) {
        const openModal = document.querySelector('.modal.show');
        if (openModal) {
          console.log('Universal Modal Fix: Closing modal (escape key)');
          
          // Hide modal
          openModal.style.display = 'none';
          openModal.classList.remove('show');
          openModal.setAttribute('aria-hidden', 'true');
          openModal.removeAttribute('aria-modal');
          openModal.removeAttribute('role');
          
          // Clean up
          cleanupModalBackdrops();
        }
      }
    });
  }
  
  // Fix direct links that should navigate to pages
  function fixDirectLinks() {
    // Fix draft order creation link
    document.querySelectorAll('a[href="/drafts/create"]').forEach(link => {
      const originalClick = link.onclick;
      link.onclick = function(e) {
        console.log('Universal Modal Fix: Navigating to /drafts/create');
        window.location.href = '/drafts/create';
        return false;
      };
    });
    
    // Fix loyalty program link
    document.querySelectorAll('a[href="/loyalty"]').forEach(link => {
      const originalClick = link.onclick;
      link.onclick = function(e) {
        console.log('Universal Modal Fix: Navigating to /loyalty');
        window.location.href = '/loyalty';
        return false;
      };
    });
  }
  
  // Run when DOM is loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      fixAllModals();
      fixDirectLinks();
    });
  } else {
    // DOM already loaded, run immediately
    fixAllModals();
    fixDirectLinks();
  }
  
  // Run periodically to catch dynamically added elements
  setInterval(fixAllModals, 1000);
  
  // Run after AJAX requests
  const originalXHR = window.XMLHttpRequest;
  window.XMLHttpRequest = function() {
    const xhr = new originalXHR();
    const originalOnLoad = xhr.onload;
    xhr.onload = function() {
      if (originalOnLoad) originalOnLoad.apply(this, arguments);
      setTimeout(fixAllModals, 100);
      setTimeout(fixDirectLinks, 100);
    };
    return xhr;
  };
  
  // Make functions available globally
  window.universalModalFix = {
    fixAllModals: fixAllModals,
    fixDirectLinks: fixDirectLinks
  };
})();
