class ApplicationsManager {
    constructor() {
        this.applications = [];
        this.filterStatus = 'all';
        this.searchQuery = '';
        this.sortBy = 'latest';
        
        // DOM Elements
        this.filterButtons = document.querySelectorAll('.filter-btn');
        this.searchInput = document.querySelector('#searchApplications');
        this.sortSelect = document.querySelector('#sortApplications');
        this.applicationsContainer = document.querySelector('#applicationsList');
        
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Filter buttons
        this.filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.filterStatus = button.dataset.status;
                this.updateActiveFilter(button);
                this.renderApplications();
            });
        });

        // Search
        this.searchInput.addEventListener('input', (e) => {
            this.searchQuery = e.target.value;
            this.renderApplications();
        });

        // Sort
        this.sortSelect.addEventListener('change', (e) => {
            this.sortBy = e.target.value;
            this.renderApplications();
        });
    }

    async fetchApplications() {
        try {
            const response = await fetch('/api/applications');
            this.applications = await response.json();
            this.renderApplications();
        } catch (error) {
            console.error('Error fetching applications:', error);
        }
    }

    updateActiveFilter(activeButton) {
        this.filterButtons.forEach(button => {
            button.classList.remove('bg-primary', 'text-white');
            button.classList.add('hover:bg-white/10');
        });
        activeButton.classList.add('bg-primary', 'text-white');
        activeButton.classList.remove('hover:bg-white/10');
    }

    filterApplications() {
        let filtered = [...this.applications];

        // Status filter
        if (this.filterStatus !== 'all') {
            filtered = filtered.filter(app => app.status === this.filterStatus);
        }

        // Search filter
        if (this.searchQuery) {
            const query = this.searchQuery.toLowerCase();
            filtered = filtered.filter(app => 
                app.position.toLowerCase().includes(query) ||
                app.company.toLowerCase().includes(query)
            );
        }

        // Sort
        filtered.sort((a, b) => {
            switch(this.sortBy) {
                case 'latest':
                    return new Date(b.appliedDate) - new Date(a.appliedDate);
                case 'oldest':
                    return new Date(a.appliedDate) - new Date(b.appliedDate);
                case 'company':
                    return a.company.localeCompare(b.company);
                default:
                    return 0;
            }
        });

        return filtered;
    }

    getStatusClass(status) {
        const statusClasses = {
            pending: 'status-pending',
            accepted: 'status-accepted',
            rejected: 'status-rejected'
        };
        return statusClasses[status] || 'status-pending';
    }

    renderApplicationCard(application) {
        return `
            <div class="glass-card p-6 application-card" data-id="${application.id}">
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-4">
                        <img src="${application.companyLogo}" alt="${application.company} Logo" class="w-12 h-12 rounded-lg">
                        <div>
                            <h3 class="text-xl font-bold">${application.position}</h3>
                            <p class="text-gray-500">${application.company}</p>
                        </div>
                    </div>
                    <span class="px-4 py-2 rounded-full ${this.getStatusClass(application.status)} text-sm font-medium">
                        ${application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                    </span>
                </div>
                <div class="mt-4 flex items-center justify-between">
                    <div class="flex space-x-4 text-sm text-gray-500">
                        <span><i class="fas fa-calendar-alt mr-2"></i>Applied: ${new Date(application.appliedDate).toLocaleDateString()}</span>
                        <span><i class="fas fa-map-marker-alt mr-2"></i>${application.location}</span>
                        <span><i class="fas fa-clock mr-2"></i>${application.type}</span>
                    </div>
                    <button class="text-primary hover:text-primary-dark view-details-btn">
                        <i class="fas fa-chevron-right"></i>
                    </button>
                </div>
            </div>
        `;
    }

    renderApplications() {
        const filtered = this.filterApplications();
        this.applicationsContainer.innerHTML = filtered.map(app => 
            this.renderApplicationCard(app)
        ).join('');

        // Add event listeners to view details buttons
        document.querySelectorAll('.view-details-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const applicationId = e.target.closest('.application-card').dataset.id;
                this.viewApplicationDetails(applicationId);
            });
        });
    }

    viewApplicationDetails(applicationId) {
        // Implement view details functionality
        window.location.href = `/application-details/${applicationId}`;
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const applicationsManager = new ApplicationsManager();
    applicationsManager.fetchApplications();
});
