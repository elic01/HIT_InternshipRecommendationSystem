class RecommendationsManager {
    constructor() {
        this.jsearchAPI = new JSearchAPI();
        this.template = document.getElementById('internshipCardTemplate');
        this.container = document.getElementById('recommendationsList');
        this.userSkills = this.getUserSkills();
        this.initializeEventListeners();
    }

    getUserSkills() {
        // Using skills from the dashboard profile section
        return ['JavaScript', 'React', 'Node.js', 'Python'];
    }

    initializeEventListeners() {
        const sortSelect = document.createElement('select');
        sortSelect.className = 'bg-white/5 rounded-lg px-4 py-2';
        sortSelect.innerHTML = `
            <option value="relevance">Most Relevant</option>
            <option value="date">Latest</option>
            <option value="salary">Highest Salary</option>
        `;
        
        document.querySelector('.top-bar').appendChild(sortSelect);
        sortSelect.addEventListener('change', (e) => this.sortRecommendations(e.target.value));
    }

    async fetchRecommendations() {
        try {
            const skillsQuery = this.userSkills.join(' OR ');
            const internships = await this.jsearchAPI.fetchInternships(
                `Internship (${skillsQuery})`,
                'Zimbabwe'
            );
            
            const scoredInternships = this.scoreInternships(internships);
            this.displayRecommendations(scoredInternships);
        } catch (error) {
            console.error('Error fetching recommendations:', error);
        }
    }

    scoreInternships(internships) {
        return internships.map(internship => {
            const score = this.calculateMatchScore(internship);
            return { ...internship, matchScore: score };
        }).sort((a, b) => b.matchScore - a.matchScore);
    }

    calculateMatchScore(internship) {
        let score = 0;
        const description = internship.job_description?.toLowerCase() || '';
        
        this.userSkills.forEach(skill => {
            if (description.includes(skill.toLowerCase())) {
                score += 10;
            }
        });

        if (internship.job_employment_type?.includes('Internship')) score += 15;
        if (internship.job_is_remote) score += 5;
        
        return Math.min(100, score);
    }

    displayRecommendations(recommendations) {
        this.container.innerHTML = '';
        
        recommendations.forEach(rec => {
            const card = this.template.content.cloneNode(true);
            
            card.querySelector('h4').textContent = rec.job_title;
            card.querySelector('p').textContent = rec.employer_name;
            
            const tagsContainer = card.querySelector('.tags');
            tagsContainer.innerHTML = `
                <span class="bg-primary/20 text-primary px-2 py-1 rounded text-xs">
                    ${rec.matchScore}% Match
                </span>
            `;
            
            if (rec.job_employment_type) {
                tagsContainer.innerHTML += `
                    <span class="bg-primary/20 text-primary px-2 py-1 rounded text-xs">
                        ${rec.job_employment_type}
                    </span>
                `;
            }
            
            const salaryElement = card.querySelector('.salary');
            if (rec.job_salary) {
                salaryElement.textContent = `Salary: ${rec.job_salary}`;
            }
            
            this.container.appendChild(card);
        });
    }

    sortRecommendations(criteria) {
        const cards = Array.from(this.container.children);
        
        switch (criteria) {
            case 'date':
                cards.sort((a, b) => new Date(b.dataset.date) - new Date(a.dataset.date));
                break;
            case 'salary':
                cards.sort((a, b) => b.dataset.salary - a.dataset.salary);
                break;
            default:
                cards.sort((a, b) => b.dataset.score - a.dataset.score);
        }

        this.container.innerHTML = '';
        cards.forEach(card => this.container.appendChild(card));
    }
}

// Initialize the recommendation system
document.addEventListener('DOMContentLoaded', () => {
    new RecommendationsManager();
});