/**
 * CheckOutPro Application Fixes
 * This script fixes various issues in the application
 */

// Execute immediately to fix any existing issues
(function() {
  // Fix modal backdrop issues
  function fixModals() {
    // Remove all modal backdrops
    document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
    
    // Reset body styles
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
    
    // Make modals clickable
    document.querySelectorAll('.modal').forEach(modal => {
      modal.style.pointerEvents = 'auto';
      // If modal is visible but not interactive, hide it properly
      if (window.getComputedStyle(modal).display === 'block' && !modal.classList.contains('show')) {
        modal.style.display = 'none';
      }
    });
  }
  
  // Fix draft order creation
  function fixDraftOrders() {
    // Find the "Create Draft Order" button and ensure it works
    const draftOrderButtons = document.querySelectorAll('a[href="/drafts/create"], a[href="#"][data-target="#createDraftModal"]');
    draftOrderButtons.forEach(button => {
      button.onclick = function(e) {
        // If it's a modal trigger, make sure the modal works
        if (button.getAttribute('data-target') || button.getAttribute('data-bs-target')) {
          fixModals();
        } else {
          // If it's a direct link, make sure it navigates properly
          window.location.href = '/drafts/create';
          e.preventDefault();
        }
      };
    });
  }
  
  // Fix customer modal
  function fixCustomerModal() {
    const addCustomerButtons = document.querySelectorAll('button[data-bs-toggle="modal"][data-bs-target="#addCustomerModal"], a[data-bs-toggle="modal"][data-bs-target="#addCustomerModal"]');
    addCustomerButtons.forEach(button => {
      button.onclick = function(e) {
        fixModals();
        
        // Force show the modal properly
        setTimeout(() => {
          const modal = document.querySelector('#addCustomerModal');
          if (modal) {
            modal.classList.add('show');
            modal.style.display = 'block';
            modal.setAttribute('aria-modal', 'true');
            modal.setAttribute('role', 'dialog');
            modal.removeAttribute('aria-hidden');
            
            // Make sure form fields are clickable
            modal.querySelectorAll('input, select, textarea').forEach(field => {
              field.style.pointerEvents = 'auto';
              field.style.zIndex = '1050';
            });
          }
        }, 100);
      };
    });
  }
  
  // Run fixes immediately
  fixModals();
  
  // Run fixes when DOM is loaded
  document.addEventListener('DOMContentLoaded', function() {
    fixModals();
    fixDraftOrders();
    fixCustomerModal();
    
    // Fix all modal triggers
    document.querySelectorAll('[data-bs-toggle="modal"]').forEach(trigger => {
      const originalClick = trigger.onclick;
      trigger.onclick = function(e) {
        fixModals();
        if (originalClick) originalClick.call(this, e);
      };
    });
    
    // Fix all modal close buttons
    document.querySelectorAll('[data-bs-dismiss="modal"], .modal .btn-close').forEach(closeBtn => {
      closeBtn.addEventListener('click', function() {
        setTimeout(fixModals, 300);
      });
    });
    
    // Run fixes periodically
    setInterval(fixModals, 2000);
  });
})();
