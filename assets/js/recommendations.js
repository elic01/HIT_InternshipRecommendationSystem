class RecommendationSystem {
    constructor() {
        this.currentPage = 1;
        this.itemsPerPage = 9;
        this.recommendations = [];
        this.filters = {
            industry: '',
            experience: '',
            location: '',
            duration: ''
        };
        this.userProfile = null;
        
        this.initializeEventListeners();
        this.fetchUserProfile();
    }

    async fetchUserProfile() {
        // Simulate API call to get user profile
        this.userProfile = {
            skills: ['JavaScript', 'React', 'Node.js', 'Python'],
            experience: 'intermediate',
            interests: ['AI', 'Web Development', 'Cloud Computing'],
            location: 'remote'
        };
        await this.generateRecommendations();
    }

    async generateRecommendations() {
        // Simulate API call to get recommendations
        const response = await fetch('/api/recommendations', {
            method: 'POST',
            body: JSON.stringify(this.userProfile)
        });
        this.recommendations = await response.json();
        this.applyFiltersAndSort();
    }

    calculateMatchScore(recommendation) {
        let score = 0;
        // Skills match
        const skillsMatch = this.userProfile.skills.filter(skill => 
            recommendation.requiredSkills.includes(skill)).length;
        score += (skillsMatch / this.userProfile.skills.length) * 40;

        // Experience match
        if (recommendation.experienceLevel === this.userProfile.experience) {
            score += 30;
        }

        // Location match
        if (recommendation.locationType === this.userProfile.location) {
            score += 20;
        }

        // Interest match
        const interestMatch = this.userProfile.interests.filter(interest => 
            recommendation.tags.includes(interest)).length;
        score += (interestMatch / this.userProfile.interests.length) * 10;

        return Math.round(score);
    }

    applyFiltersAndSort() {
        let filtered = [...this.recommendations];

        // Apply filters
        if (this.filters.industry) {
            filtered = filtered.filter(r => r.industry === this.filters.industry);
        }
        if (this.filters.experience) {
            filtered = filtered.filter(r => r.experienceLevel === this.filters.experience);
        }
        if (this.filters.location) {
            filtered = filtered.filter(r => r.locationType === this.filters.location);
        }
        if (this.filters.duration) {
            filtered = filtered.filter(r => r.duration === parseInt(this.filters.duration));
        }

        // Apply sorting
        const sortSelect = document.querySelector('#sortSelect');
        switch (sortSelect.value) {
            case 'match':
                filtered.sort((a, b) => b.matchScore - a.matchScore);
                break;
            case 'date':
                filtered.sort((a, b) => new Date(b.postDate) - new Date(a.postDate));
                break;
            case 'company':
                filtered.sort((a, b) => a.company.localeCompare(b.company));
                break;
        }

        this.displayRecommendations(filtered);
        this.updatePagination(filtered.length);
    }

    displayRecommendations(filtered) {
        const container = document.querySelector('#recommendationsGrid');
        const start = (this.currentPage - 1) * this.itemsPerPage;
        const end = start + this.itemsPerPage;
        const pageItems = filtered.slice(start, end);

        container.innerHTML = pageItems.map(item => this.createRecommendationCard(item)).join('');
    }

    createRecommendationCard(item) {
        return `
            <div class="glass-card p-6 recommendation-card">
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <h3 class="text-xl font-bold">${item.title}</h3>
                        <p class="text-gray-500">${item.company}</p>
                        <div class="mt-2">
                            <p class="text-sm"><i class="fas fa-map-marker-alt mr-2"></i>${item.location}</p>
                            <p class="text-sm"><i class="fas fa-clock mr-2"></i>${item.duration} months</p>
                            <p class="text-sm"><i class="fas fa-dollar-sign mr-2"></i>${item.salary}</p>
                        </div>
                    </div>
                    <div class="match-indicator">${item.matchScore}%</div>
                </div>
                <div class="space-y-4">
                    <div class="flex flex-wrap gap-2">
                        ${item.requiredSkills.map(skill => 
                            `<span class="bg-primary/20 text-primary px-3 py-1 rounded">${skill}</span>`
                        ).join('')}
                    </div>
                    <p class="text-sm">${item.description}</p>
                    <div class="flex justify-between items-center">
                        <span class="text-sm text-gray-500">Posted ${item.postDate}</span>
                        <button class="bg-primary hover:bg-primary-dark px-4 py-2 rounded-lg">
                            Apply Now
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    updatePagination(totalItems) {
        const totalPages = Math.ceil(totalItems / this.itemsPerPage);
        document.querySelector('#startRange').textContent = 
            ((this.currentPage - 1) * this.itemsPerPage) + 1;
        document.querySelector('#endRange').textContent = 
            Math.min(this.currentPage * this.itemsPerPage, totalItems);
        document.querySelector('#totalItems').textContent = totalItems;
        
        document.querySelector('#prevPage').disabled = this.currentPage === 1;
        document.querySelector('#nextPage').disabled = this.currentPage === totalPages;
    }

    initializeEventListeners() {
        // Filter listeners
        document.querySelectorAll('select[id$="Filter"]').forEach(select => {
            select.addEventListener('change', () => {
                this.filters[select.id.replace('Filter', '')] = select.value;
                this.currentPage = 1;
                this.applyFiltersAndSort();
            });
        });

        // Pagination listeners
        document.querySelector('#prevPage').addEventListener('click', () => {
            if (this.currentPage > 1) {
                this.currentPage--;
                this.applyFiltersAndSort();
            }
        });

        document.querySelector('#nextPage').addEventListener('click', () => {
            this.currentPage++;
            this.applyFiltersAndSort();
        });

        // Sort listener
        document.querySelector('#sortSelect').addEventListener('change', () => {
            this.applyFiltersAndSort();
        });
    }
}

// Initialize the recommendation system
document.addEventListener('DOMContentLoaded', () => {
    new RecommendationSystem();
});
