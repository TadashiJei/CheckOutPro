/**
 * CheckOutPro Admin Web Interface
 * Main JavaScript file
 */

document.addEventListener('DOMContentLoaded', function() {
  // Auto-hide flash messages after 5 seconds
  const flashMessages = document.querySelectorAll('.alert');
  flashMessages.forEach(message => {
    setTimeout(() => {
      const alert = bootstrap.Alert.getOrCreateInstance(message);
      alert.close();
    }, 5000);
  });

  // Set active link in sidebar based on current path
  const currentPath = window.location.pathname;
  const sidebarLinks = document.querySelectorAll('.sidebar .nav-link');
  
  sidebarLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (currentPath === href || (href !== '/' && currentPath.startsWith(href))) {
      link.classList.add('active');
    }
  });

  // Initialize tooltips
  const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
  });

  // Initialize popovers
  const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
  popoverTriggerList.map(function (popoverTriggerEl) {
    return new bootstrap.Popover(popoverTriggerEl);
  });

  // Confirm delete actions
  const deleteButtons = document.querySelectorAll('.btn-delete');
  deleteButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      if (!confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
        e.preventDefault();
      }
    });
  });

  // Dashboard charts initialization (if on dashboard page)
  if (document.getElementById('salesChart')) {
    initializeDashboardCharts();
  }
});

/**
 * Initialize dashboard charts
 */
function initializeDashboardCharts() {
  // Example chart for sales data
  const salesChartCtx = document.getElementById('salesChart').getContext('2d');
  const salesChart = new Chart(salesChartCtx, {
    type: 'line',
    data: {
      labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
      datasets: [{
        label: 'Sales',
        data: [65, 59, 80, 81, 56, 55, 40],
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });

  // Example chart for order types
  const orderTypesChartCtx = document.getElementById('orderTypesChart').getContext('2d');
  const orderTypesChart = new Chart(orderTypesChartCtx, {
    type: 'doughnut',
    data: {
      labels: ['Dine-in', 'Takeout'],
      datasets: [{
        label: 'Order Types',
        data: [60, 40],
        backgroundColor: [
          'rgb(54, 162, 235)',
          'rgb(255, 99, 132)'
        ],
        hoverOffset: 4
      }]
    },
    options: {
      responsive: true
    }
  });
}

/**
 * Format currency
 * @param {number} amount - The amount to format
 * @returns {string} Formatted currency string
 */
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
}

/**
 * Format date
 * @param {string|Date} date - The date to format
 * @returns {string} Formatted date string
 */
function formatDate(date) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date));
}
