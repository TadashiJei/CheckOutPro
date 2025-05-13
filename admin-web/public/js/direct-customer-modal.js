/**
 * Direct fix for the Add New Customer modal
 * This script completely bypasses Bootstrap's modal implementation
 */

document.addEventListener('DOMContentLoaded', function() {
  // Get the Add New Customer button and modal
  const addCustomerBtn = document.querySelector('button[data-bs-target="#addCustomerModal"]');
  const addCustomerModal = document.getElementById('addCustomerModal');
  
  if (addCustomerBtn && addCustomerModal) {
    // Create a completely custom implementation
    addCustomerBtn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      // Remove any existing modal backdrops
      document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
      
      // Reset body styles
      document.body.classList.remove('modal-open');
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
      
      // Show the modal with inline styles
      addCustomerModal.style.display = 'block';
      addCustomerModal.style.paddingRight = '17px';
      addCustomerModal.classList.add('show');
      addCustomerModal.setAttribute('aria-modal', 'true');
      addCustomerModal.setAttribute('role', 'dialog');
      addCustomerModal.removeAttribute('aria-hidden');
      
      // Create a new backdrop manually
      const backdrop = document.createElement('div');
      backdrop.className = 'modal-backdrop fade show';
      document.body.appendChild(backdrop);
      
      // Add modal-open class to body
      document.body.classList.add('modal-open');
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = '17px';
      
      // Make sure form inputs are clickable
      const inputs = addCustomerModal.querySelectorAll('input, select, textarea, button');
      inputs.forEach(input => {
        input.style.zIndex = '1052';
        input.style.position = 'relative';
      });
      
      return false;
    });
    
    // Handle close button clicks
    const closeButtons = addCustomerModal.querySelectorAll('[data-bs-dismiss="modal"], .btn-close, .close, .cancel, button.btn-secondary');
    closeButtons.forEach(button => {
      button.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        // Hide the modal
        addCustomerModal.style.display = 'none';
        addCustomerModal.classList.remove('show');
        addCustomerModal.setAttribute('aria-hidden', 'true');
        addCustomerModal.removeAttribute('aria-modal');
        addCustomerModal.removeAttribute('role');
        
        // Remove backdrop
        document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
        
        // Reset body styles
        document.body.classList.remove('modal-open');
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
        
        return false;
      });
    });
    
    // Close when clicking outside the modal
    addCustomerModal.addEventListener('click', function(e) {
      if (e.target === this) {
        // Hide the modal
        addCustomerModal.style.display = 'none';
        addCustomerModal.classList.remove('show');
        addCustomerModal.setAttribute('aria-hidden', 'true');
        addCustomerModal.removeAttribute('aria-modal');
        addCustomerModal.removeAttribute('role');
        
        // Remove backdrop
        document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
        
        // Reset body styles
        document.body.classList.remove('modal-open');
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
      }
    });
  }
  
  // Also fix the Draft Order button
  const draftOrderBtn = document.querySelector('a[href="/drafts/create"]');
  if (draftOrderBtn) {
    draftOrderBtn.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Navigate directly to the page
      window.location.href = '/drafts/create';
    });
  }
});
