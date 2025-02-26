class InternshipManager {
    constructor() {
        this.internships = [];
        this.template = document.getElementById('internshipCardTemplate');
        this.container = document.getElementById('internshipsList');
    }

    async fetchInternships() {
        // Simulate API call
        this.internships = [
            {
                title: 'Software Developer Intern',
                company: 'Microsoft Corporation',
                tags: ['Remote', 'Full-time'],
                salary: '$45/hr',
                deadline: '2024-03-01'
            },
            {
                title: 'ML Engineer Intern',
                company: 'Google',
                tags: ['Hybrid', 'Full-time'],
                salary: '$50/hr',
                deadline: '2024-03-15'
            }
        ];
        this.renderInternships();
    }

    renderInternships() {
        this.container.innerHTML = '';
        this.internships.forEach(internship => {
            const card = this.template.content.cloneNode(true);
            
            card.querySelector('h4').textContent = internship.title;
            card.querySelector('p').textContent = internship.company;
            
            const tagsContainer = card.querySelector('.tags');
            internship.tags.forEach(tag => {
                const span = document.createElement('span');
                span.className = 'text-xs bg-primary/20 text-primary px-2 py-1 rounded';
                span.textContent = tag;
                tagsContainer.appendChild(span);
            });
            
            card.querySelector('.salary').textContent = internship.salary;
            
            const saveBtn = card.querySelector('.save-btn');
            saveBtn.addEventListener('click', () => this.saveInternship(internship));
            
            const applyBtn = card.querySelector('.apply-btn');
            applyBtn.addEventListener('click', () => this.applyToInternship(internship));
            
            this.container.appendChild(card);
        });
    }

    saveInternship(internship) {
        // Add save functionality
        const saved = localStorage.getItem('savedInternships') || '[]';
        const savedInternships = JSON.parse(saved);
        savedInternships.push(internship);
        localStorage.setItem('savedInternships', JSON.stringify(savedInternships));
        
        // Update UI
        this.updateSavedCount();
    }

    applyToInternship(internship) {
        // Add application functionality
        const applications = localStorage.getItem('applications') || '[]';
        const applicationsList = JSON.parse(applications);
        applicationsList.push({
            ...internship,
            appliedDate: new Date().toISOString()
        });
        localStorage.setItem('applications', JSON.stringify(applicationsList));
        
        // Update UI
        this.updateApplicationCount();
    }

    updateSavedCount() {
        const saved = JSON.parse(localStorage.getItem('savedInternships') || '[]');
        document.querySelector('.stat-card:nth-child(3) .text-3xl').textContent = saved.length;
    }

    updateApplicationCount() {
        const applications = JSON.parse(localStorage.getItem('applications') || '[]');
        document.querySelector('.stat-card:nth-child(1) .text-3xl').textContent = applications.length;
    }
}
