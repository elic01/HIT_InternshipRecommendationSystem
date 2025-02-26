// Sidebar functionality
function initializeSidebar() {
  const sidebarLinks = document.querySelectorAll('.sidebar nav a');
  
  sidebarLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      // Remove active class from all links
      sidebarLinks.forEach(l => l.classList.remove('active-nav-item'));
      
      // Add active class to clicked link
      link.classList.add('active-nav-item');
      
      // Store active state in localStorage
      localStorage.setItem('activeLink', link.getAttribute('href'));
    });
  });

  // Restore active state on page load
  const activeLink = localStorage.getItem('activeLink');
  if (activeLink) {
    const link = document.querySelector(`a[href="${activeLink}"]`);
    if (link) link.classList.add('active-nav-item');
  }
}

// Mobile sidebar toggle
function initializeMobileSidebar() {
  const toggleButton = document.createElement('button');
  toggleButton.innerHTML = '<i class="fas fa-bars"></i>';
  toggleButton.className = 'md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-primary text-white';
  
  document.body.appendChild(toggleButton);
  
  const sidebar = document.querySelector('.sidebar');
  
  toggleButton.addEventListener('click', () => {
    sidebar.classList.toggle('-translate-x-full');
  });
}
