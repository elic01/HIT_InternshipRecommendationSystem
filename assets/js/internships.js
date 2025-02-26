class InternshipManager {
    constructor() {
        this.jsearchAPI = new JSearchAPI();
        this.dbManager = new InternshipDBManager();
        this.template = document.getElementById('internshipCardTemplate');
        this.container = document.getElementById('internshipsList');
    }

    async fetchInternships() {
        try {
            // Try to fetch from API
            const internships = await this.jsearchAPI.fetchInternships();
            
            // Save to IndexedDB for offline access
            await this.dbManager.saveInternships(internships);
            
            // Display internships
            this.displayInternships(internships);
        } catch (error) {
            console.error('Error managing internships:', error);
        }
    }

    displayInternships(internships) {
        this.container.innerHTML = '';
        
        internships.forEach(internship => {
            const card = this.template.content.cloneNode(true);
            
            card.querySelector('h4').textContent = internship.job_title;
            card.querySelector('p').textContent = internship.employer_name;
            
            // Add tags
            const tagsContainer = card.querySelector('.tags');
            internship.job_employment_type && tagsContainer.appendChild(
                this.createTag(internship.job_employment_type)
            );
            
            // Add salary if available
            const salaryElement = card.querySelector('.salary');
            if (internship.job_salary) {
                salaryElement.textContent = `Salary: ${internship.job_salary}`;
            }
            
            const saveBtn = card.querySelector('.save-btn');
            saveBtn.addEventListener('click', () => this.saveInternship(internship));
            
            const applyBtn = card.querySelector('.apply-btn');
            applyBtn.addEventListener('click', () => this.applyToInternship(internship));
            
            this.container.appendChild(card);
        });
    }

    createTag(text) {
        const span = document.createElement('span');
        span.className = 'bg-primary/20 text-primary px-2 py-1 rounded text-xs';
        span.textContent = text;
        return span;
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
