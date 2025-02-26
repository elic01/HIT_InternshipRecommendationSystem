class ProfileManager {
    constructor() {
        this.isEditMode = false;
        this.isDarkMode = localStorage.getItem('darkMode') === 'true';
        this.initializeEventListeners();
        this.loadProfileData();
        this.setupFormValidation();
        this.initializeDarkMode();
    }

    initializeEventListeners() {
        // Existing listeners
        const imageUpload = document.getElementById('imageUpload');
        imageUpload.addEventListener('change', (e) => this.handleImageUpload(e));
        
        document.getElementById('editProfile').addEventListener('click', () => this.handleEditClick());
        document.getElementById('addEducation').addEventListener('click', () => this.addEducation());
        document.getElementById('addSkill').addEventListener('click', () => this.addSkill());
        document.getElementById('addExperience').addEventListener('click', () => this.addExperience());
        
        // New listeners
        document.getElementById('darkModeToggle').addEventListener('click', () => this.toggleDarkMode());
        document.getElementById('closeProfile').addEventListener('click', () => this.returnToDashboard());
    }

    initializeDarkMode() {
        document.documentElement.classList.toggle('dark', this.isDarkMode);
        this.updateDarkModeButton();
    }

    toggleDarkMode() {
        this.isDarkMode = !this.isDarkMode;
        localStorage.setItem('darkMode', this.isDarkMode);
        document.documentElement.classList.toggle('dark');
        this.updateDarkModeButton();
    }

    updateDarkModeButton() {
        const darkModeBtn = document.getElementById('darkModeToggle');
        darkModeBtn.innerHTML = this.isDarkMode ? 
            '<i class="fas fa-sun"></i>' : 
            '<i class="fas fa-moon"></i>';
    }

    handleEditClick() {
        if (this.isEditMode) {
            this.saveProfileChanges();
        } else {
            this.toggleEditMode();
        }
    }

    async handleImageUpload(event) {
        const file = event.target.files[0];
        if (file) {
            const preview = document.getElementById('profileImage');
            preview.src = URL.createObjectURL(file);
            
            try {
                const formData = new FormData();
                formData.append('profileImage', file);
                
                const response = await fetch('/api/profile/upload-image', {
                    method: 'POST',
                    body: formData
                });

                if (response.ok) {
                    const data = await response.json();
                    preview.src = data.imageUrl;
                    this.showSuccess('Profile image updated successfully');
                }
            } catch (error) {
                this.showError(document.getElementById('imageUpload'), 'Failed to upload image');
                preview.src = preview.dataset.originalSrc; // Revert to original image
            }
        }
    }

    returnToDashboard() {
        if (this.isEditMode) {
            if (confirm('You have unsaved changes. Are you sure you want to leave?')) {
                window.location.href = '/dashboard';
            }
        } else {
            window.location.href = '/dashboard';
        }
    }

    toggleEditMode() {
        this.isEditMode = !this.isEditMode;
        document.body.classList.toggle('edit-mode', this.isEditMode);
        
        const editButton = document.getElementById('editProfile');
        const saveButton = document.getElementById('saveChanges');
        
        editButton.innerHTML = this.isEditMode ? 
            '<i class="fas fa-times mr-2"></i>Cancel' : 
            '<i class="fas fa-edit mr-2"></i>Edit Profile';
            
        saveButton.style.display = this.isEditMode ? 'block' : 'none';
        
        // Toggle input fields
        const editableFields = document.querySelectorAll('[data-editable]');
        editableFields.forEach(field => {
            field.contentEditable = this.isEditMode;
            field.classList.toggle('editing', this.isEditMode);
        });
    }

    async loadProfileData() {
        const profileData = await this.fetchProfileData();
        this.updateProfileUI(profileData);
        this.setupEditableFields();
    }

    setupEditableFields() {
        const editableFields = document.querySelectorAll('[data-editable]');
        editableFields.forEach(field => {
            field.addEventListener('click', () => {
                if (this.isEditMode) {
                    this.makeFieldEditable(field);
                }
            });
        });
    }

    makeFieldEditable(element) {
        const currentValue = element.textContent;
        const input = document.createElement('input');
        input.value = currentValue;
        input.className = 'w-full bg-white/10 rounded p-2';
        
        input.addEventListener('blur', () => {
            element.textContent = input.value;
            this.validateField(element);
        });

        element.textContent = '';
        element.appendChild(input);
        input.focus();
    }

    setupFormValidation() {
        const form = document.getElementById('profileForm');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
        });
    }
}

// Initialize Profile Manager
document.addEventListener('DOMContentLoaded', () => {
    new ProfileManager();
});            if (this.validateForm()) {
                this.saveProfileChanges();
            }
        });
    }

    validateForm() {
        const requiredFields = document.querySelectorAll('[data-required]');
        let isValid = true;

        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                this.showError(field, 'This field is required');
                isValid = false;
            }
        });

        return isValid;
    }

    showError(element, message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'text-red-500 text-sm mt-1';
        errorDiv.textContent = message;
        element.parentNode.appendChild(errorDiv);
        
        setTimeout(() => errorDiv.remove(), 3000);
    }

    async handleImageUpload(event) {
        const file = event.target.files[0];
        if (file) {
            try {
                const formData = new FormData();
                formData.append('profileImage', file);
                
                const response = await fetch('/api/profile/upload-image', {
                    method: 'POST',
                    body: formData
                });

                if (response.ok) {
                    const data = await response.json();
                    document.getElementById('profileImage').src = data.imageUrl;
                    this.showSuccess('Profile image updated successfully');
                }
            } catch (error) {
                this.showError(document.getElementById('imageUpload'), 'Failed to upload image');
            }
        }
    }

    addEducation() {
        const educationList = document.getElementById('educationList');
        const newEducation = document.createElement('div');
        newEducation.className = 'education-item bg-white/5 p-4 rounded-lg';
        newEducation.innerHTML = `
            <input type="text" placeholder="School" class="w-full bg-white/10 rounded p-2 mb-2">
            <input type="text" placeholder="Degree" class="w-full bg-white/10 rounded p-2 mb-2">
            <div class="flex gap-2">
                <input type="text" placeholder="Start Year" class="w-1/2 bg-white/10 rounded p-2">
                <input type="text" placeholder="End Year" class="w-1/2 bg-white/10 rounded p-2">
            </div>
            <button class="text-red-500 mt-2" onclick="this.parentElement.remove()">
                <i class="fas fa-trash"></i> Remove
            </button>
        `;
        educationList.appendChild(newEducation);
    }

    addSkill() {
        const skillInput = document.getElementById('skillInput');
        const skillsList = document.getElementById('skillsList');
        
        if (skillInput.value.trim()) {
            const skillTag = document.createElement('div');
            skillTag.className = 'bg-primary/20 text-primary px-3 py-1 rounded flex items-center';
            skillTag.innerHTML = `
                ${skillInput.value}
                <button class="ml-2" onclick="this.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            `;
            skillsList.appendChild(skillTag);
            skillInput.value = '';
        }
    }

    addExperience() {
        const experienceList = document.getElementById('experienceList');
        const newExperience = document.createElement('div');
        newExperience.className = 'experience-item bg-white/5 p-4 rounded-lg';
        newExperience.innerHTML = `
            <input type="text" placeholder="Company" class="w-full bg-white/10 rounded p-2 mb-2">
            <input type="text" placeholder="Position" class="w-full bg-white/10 rounded p-2 mb-2">
            <textarea placeholder="Description" class="w-full bg-white/10 rounded p-2 mb-2"></textarea>
            <div class="flex gap-2">
                <input type="date" class="w-1/2 bg-white/10 rounded p-2">
                <input type="date" class="w-1/2 bg-white/10 rounded p-2">
            </div>
            <button class="text-red-500 mt-2" onclick="this.parentElement.remove()">
                <i class="fas fa-trash"></i> Remove
            </button>
        `;
        experienceList.appendChild(newExperience);
    }

    async saveProfileChanges() {
        if (!this.validateForm()) return;

        const profileData = this.gatherProfileData();
        
        try {
            const response = await fetch('/api/profile/update', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(profileData)
            });

            if (response.ok) {
                this.showSuccess('Profile updated successfully');
                this.toggleEditMode();
                this.loadProfileData();
            }
        } catch (error) {
            this.showError(document.getElementById('profileForm'), 'Failed to update profile');
        }
    }

    gatherProfileData() {
        return {
            name: document.getElementById('profileName').textContent,
            major: document.getElementById('profileMajor').textContent,
            year: document.getElementById('profileYear').textContent,
            email: document.getElementById('profileEmail').textContent,
            phone: document.getElementById('profilePhone').textContent,
            location: document.getElementById('profileLocation').textContent,
            education: Array.from(document.querySelectorAll('.education-item')).map(edu => ({
                school: edu.querySelector('input[placeholder="School"]').value,
                degree: edu.querySelector('input[placeholder="Degree"]').value,
                startYear: edu.querySelector('input[placeholder="Start Year"]').value,
                endYear: edu.querySelector('input[placeholder="End Year"]').value
            })),
            skills: Array.from(document.querySelectorAll('#skillsList > div')).map(skill => skill.textContent.trim()),
            experience: Array.from(document.querySelectorAll('.experience-item')).map(exp => ({
                company: exp.querySelector('input[placeholder="Company"]').value,
                position: exp.querySelector('input[placeholder="Position"]').value,
                description: exp.querySelector('textarea').value,
                startDate: exp.querySelector('input[type="date"]:first-of-type').value,
                endDate: exp.querySelector('input[type="date"]:last-of-type').value
            }))
        };
    }

    showSuccess(message) {
        const toast = document.createElement('div');
        toast.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded shadow-lg';
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }

    toggleEditMode() {
        this.isEditMode = !this.isEditMode;
        document.body.classList.toggle('edit-mode');
        const editButton = document.getElementById('editProfile');
        editButton.innerHTML = this.isEditMode ? 
            '<i class="fas fa-save mr-2"></i>Save Changes' : 
            '<i class="fas fa-edit mr-2"></i>Edit Profile';
    }
}

// Initialize Profile Manager
document.addEventListener('DOMContentLoaded', () => {
    new ProfileManager();
});