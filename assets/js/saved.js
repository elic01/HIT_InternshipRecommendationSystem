class SavedInternships {
    constructor() {
        this.currentPage = 1;
        this.itemsPerPage = 9;
        this.savedInternships = [];
        
        this.initializeEventListeners();
        this.loadSavedInternships();
    }

    async loadSavedInternships() {
        // Simulate loading saved internships from localStorage or API
        try {
            const saved = localStorage.getItem('savedInternships');
            this.savedInternships = saved ? JSON.parse(saved) : [];
            this.applySort();
        } catch (error) {
            console.error('Error loading saved internships:', error);
            this.savedInternships = [];
        }
    }

    removeSavedInternship(id) {
        this.savedInternships = this.savedInternships.filter(item => item.id !== id);
        localStorage.setItem('savedInternships', JSON.stringify(this.savedInternships));
        this.applySort();
    }

    applySort() {
        let sorted = [...this.savedInternships];
        const sortSelect = document.querySelector('#sortSelect');
        
        switch (sortSelect.value) {
            case 'date':
                sorted.sort((a, b) => new Date(b.dateSaved) - new Date(a.dateSaved));
                break;
            case 'match':
                sorted.sort((a, b) => b.matchScore - a.matchScore);
                break;
            case 'company':
                sorted.sort((a, b) => a.company.localeCompare(b.company));
                break;
        }

        this.displaySaved(sorted);
        this.updatePagination(sorted.length);
    }

    displaySaved(sorted) {
        const container = document.querySelector('#savedGrid');
        const start = (this.currentPage - 1) * this.itemsPerPage;
        const end = start + this.itemsPerPage;
        const pageItems = sorted.slice(start, end);

        container.innerHTML = pageItems.map(item => this.createSavedCard(item)).join('');
    }

    createSavedCard(item) {
        return `
            <div class="glass-card p-6" data-id="${item.id}">
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
                    <div class="flex flex-col gap-2">
                        <div class="match-indicator">${item.matchScore}%</div>
                        <button onclick="savedSystem.removeSavedInternship('${item.id}')" 
                                class="text-red-500 hover:text-red-700">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="space-y-4">
                    <div class="flex flex-wrap gap-2">
                        ${item.requiredSkills.map(skill => 
                            `<span class="bg-primary/20 text-primary px-3 py-1 rounded">${skill}</span>`
                        ).join('')}
                    </div>
                    <p class="text-sm">${item.description}</p>
                    <div class="flex justify-between items-center">
                        <span class="text-sm text-gray-500">Saved on ${new Date(item.dateSaved).toLocaleDateString()}</span>
                        <button class="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg">
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
        document.querySelector('#sortSelect').addEventListener('change', () => {
            this.applySort();
        });

        document.querySelector('#prevPage').addEventListener('click', () => {
            if (this.currentPage > 1) {
                this.currentPage--;
                this.applySort();
            }
        });

        document.querySelector('#nextPage').addEventListener('click', () => {
            this.currentPage++;
            this.applySort();
        });
    }
}

// Initialize the saved internships system
let savedSystem;
document.addEventListener('DOMContentLoaded', () => {
    savedSystem = new SavedInternships();
});
