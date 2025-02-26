
        // Initialize AOS
        AOS.init({
            duration: 1000,
            once: true
        });

        // Dark mode toggle
        const themeToggle = document.getElementById('theme-toggle');
        const body = document.body;
        
        themeToggle.addEventListener('click', () => {
            body.classList.toggle('dark-mode');
            const icon = themeToggle.querySelector('i');
            if (body.classList.contains('dark-mode')) {
                icon.classList.remove('fa-moon');
                icon.classList.add('fa-sun');
            } else {
                icon.classList.remove('fa-sun');
                icon.classList.add('fa-moon');
            }
        });

        // Smooth scroll for navigation links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                document.querySelector(this.getAttribute('href')).scrollIntoView({
                    behavior: 'smooth'
                });
            });
        });

        // Add scroll animation for header
        const header = document.querySelector('header');
        window.addEventListener('scroll', () => {
            if (window.scrollY > 100) {
                header.style.background = getComputedStyle(document.documentElement)
                    .getPropertyValue('--card-bg');
                header.style.boxShadow = '0 2px 10px ' + getComputedStyle(document.documentElement)
                    .getPropertyValue('--shadow');
            } else {
                header.style.background = 'transparent';
                header.style.boxShadow = 'none';
            }
        });