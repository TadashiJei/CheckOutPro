/**
 * Direct Modal Fix for Bootstrap
 * This script directly fixes modal issues by replacing Bootstrap's modal implementation
 */

document.addEventListener('DOMContentLoaded', function() {
  // Fix for all modals
  const allModals = document.querySelectorAll('.modal');
  
  // Clean up any existing modal issues
  function cleanupModals() {
    document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
    document.body.classList.remove('modal-open');
    document.body.style.paddingRight = '';
    document.body.style.overflow = '';
  }
  
  // Run cleanup immediately
  cleanupModals();
  
  // Replace all modal triggers with direct JavaScript implementation
  document.querySelectorAll('[data-bs-toggle="modal"]').forEach(trigger => {
    const targetId = trigger.getAttribute('data-bs-target') || trigger.getAttribute('href');
    if (!targetId) return;
    
    const modalId = targetId.replace('#', '');
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    // Replace the click handler
    trigger.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      // Clean up any existing modals
      cleanupModals();
      
      // Show this modal
      modal.style.display = 'block';
      modal.classList.add('show');
      modal.setAttribute('aria-modal', 'true');
      modal.setAttribute('role', 'dialog');
      modal.removeAttribute('aria-hidden');
      
      // Add backdrop manually
      const backdrop = document.createElement('div');
      backdrop.className = 'modal-backdrop fade show';
      document.body.appendChild(backdrop);
      
      // Set body styles
      document.body.classList.add('modal-open');
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = '17px';
      
      return false;
    });
  });
  
  // Handle close buttons
  document.querySelectorAll('[data-bs-dismiss="modal"], .modal .btn-close, .modal .close').forEach(closeBtn => {
    closeBtn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      const modal = this.closest('.modal');
      if (modal) {
        modal.style.display = 'none';
        modal.classList.remove('show');
        modal.setAttribute('aria-hidden', 'true');
        modal.removeAttribute('aria-modal');
        modal.removeAttribute('role');
      }
      
      cleanupModals();
      return false;
    });
  });
  
  // Close modal when clicking outside
  allModals.forEach(modal => {
    modal.addEventListener('click', function(e) {
      if (e.target === this) {
        this.style.display = 'none';
        this.classList.remove('show');
        this.setAttribute('aria-hidden', 'true');
        this.removeAttribute('aria-modal');
        this.removeAttribute('role');
        
        cleanupModals();
      }
    });
  });
  
  // Close modal on escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' || e.keyCode === 27) {
      const openModal = document.querySelector('.modal.show');
      if (openModal) {
        openModal.style.display = 'none';
        openModal.classList.remove('show');
        openModal.setAttribute('aria-hidden', 'true');
        openModal.removeAttribute('aria-modal');
        openModal.removeAttribute('role');
        
        cleanupModals();
      }
    }
  });
});
