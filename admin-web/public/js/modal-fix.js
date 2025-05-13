/**
 * Modal backdrop fix for Bootstrap
 * This script fixes the issue where modal backdrops remain visible after closing modals
 */

// Immediate fix for any existing modal backdrops
(function() {
  function removeModalBackdrops() {
    // Remove all modal backdrops
    const backdrops = document.querySelectorAll('.modal-backdrop');
    backdrops.forEach(backdrop => backdrop.remove());
    
    // Reset body styles
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
    
    // Make sure modals are properly hidden
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
      modal.classList.remove('show');
      modal.style.display = 'none';
      modal.setAttribute('aria-hidden', 'true');
      modal.removeAttribute('aria-modal');
      modal.removeAttribute('role');
    });
  }
  
  // Run immediately
  removeModalBackdrops();
  
  // Also run when DOM is loaded
  document.addEventListener('DOMContentLoaded', function() {
    removeModalBackdrops();
    
    // Override Bootstrap's modal show method to ensure proper cleanup
    if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
      const originalShow = bootstrap.Modal.prototype.show;
      bootstrap.Modal.prototype.show = function() {
        removeModalBackdrops(); // Clean up before showing a new modal
        originalShow.apply(this, arguments);
      };
    }
    
    // Add global click handler for modal triggers
    document.addEventListener('click', function(e) {
      // If clicking a modal trigger button
      if (e.target.getAttribute('data-bs-toggle') === 'modal' || 
          (e.target.parentElement && e.target.parentElement.getAttribute('data-bs-toggle') === 'modal')) {
        removeModalBackdrops();
      }
      
      // If clicking a modal close button
      if (e.target.classList.contains('btn-close') || 
          e.target.getAttribute('data-bs-dismiss') === 'modal' || 
          (e.target.parentElement && e.target.parentElement.getAttribute('data-bs-dismiss') === 'modal')) {
        setTimeout(removeModalBackdrops, 300);
      }
    });
    
    // Add handler for ESC key (which also closes modals)
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' || e.keyCode === 27) {
        setTimeout(removeModalBackdrops, 300);
      }
    });
    
    // Run every second to catch any missed backdrops
    setInterval(removeModalBackdrops, 1000);
  });
})();

// Add direct fix for modal buttons
document.addEventListener('DOMContentLoaded', function() {
  // Fix for 'Add New Customer' button
  const addCustomerButtons = document.querySelectorAll('a[href="#"][data-bs-toggle="modal"], button[data-bs-toggle="modal"]');
  addCustomerButtons.forEach(button => {
    const originalOnclick = button.onclick;
    button.onclick = function(e) {
      // Remove any existing backdrops first
      const backdrops = document.querySelectorAll('.modal-backdrop');
      backdrops.forEach(backdrop => backdrop.remove());
      document.body.classList.remove('modal-open');
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
      
      // Call original onclick if it exists
      if (originalOnclick) {
        return originalOnclick.call(this, e);
      }
    };
  });
});

