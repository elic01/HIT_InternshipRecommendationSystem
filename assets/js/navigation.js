class NavigationManager {
    constructor() {
        this.mainContent = document.querySelector('main');
        this.initializeNavigation();
    }

    initializeNavigation() {
        const navLinks = document.querySelectorAll('nav a');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleNavigation(link);
            });
        });
    }

    async handleNavigation(link) {
        // Remove active class from all links
        document.querySelectorAll('nav a').forEach(el => {
            el.classList.remove('active-nav-item');
        });
        
        // Add active class to clicked link
        link.classList.add('active-nav-item');
        
        const page = link.querySelector('span').textContent.toLowerCase();
        await this.loadContent(page);
    }

    async loadContent(page) {
        try {
            const response = await fetch(`/${page}.html`);
            const content = await response.text();
            this.mainContent.innerHTML = content;
            
            // Initialize page-specific features
            if (page === 'internships') {
                this.loadInternships();
            }
        } catch (error) {
            console.error('Error loading content:', error);
        }
    }

    async loadInternships() {
        // Example internship data - in real app, fetch from backend
        const internships = [
            {
                title: "Software Developer Intern",
                company: "Microsoft",
                location: "Remote",
                type: "Full-time",
                description: "Join our team to work on cutting-edge technologies",
                skills: ["JavaScript", "React", "Node.js"]
            },
            // Add more internship objects
        ];

        const grid = document.getElementById('internships-grid');
        grid.innerHTML = internships.map(internship => `
            <div class="glass-card p-6 hover:transform hover:scale-105 transition-transform">
                <div class="flex justify-between items-start">
                    <div>
                        <h3 class="text-xl font-bold">${internship.title}</h3>
                        <p class="text-gray-500">${internship.company}</p>
                    </div>
                    <button class="text-primary hover:text-primary-dark">
                        <i class="fas fa-bookmark"></i>
                    </button>
                </div>
                <div class="flex gap-2 my-3">
                    <span class="text-sm bg-primary/20 text-primary px-2 py-1 rounded">${internship.location}</span>
                    <span class="text-sm bg-primary/20 text-primary px-2 py-1 rounded">${internship.type}</span>
                </div>
                <p class="text-sm mb-4">${internship.description}</p>
                <div class="flex flex-wrap gap-2">
                    ${internship.skills.map(skill => 
                        `<span class="text-xs bg-white/10 px-2 py-1 rounded">${skill}</span>`
                    ).join('')}
                </div>
            </div>
        `).join('');
    }
}
