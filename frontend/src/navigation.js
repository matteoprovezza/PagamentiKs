// Navigation utility to handle active menu highlighting
class NavigationManager {
    constructor() {
        this.currentPage = this.getCurrentPage();
        this.init();
    }

    getCurrentPage() {
        const path = window.location.pathname;
        const filename = path.split('/').pop() || 'index.html';
        return filename;
    }

    init() {
        // Remove all active classes first
        const navItems = document.querySelectorAll('.sidebar-nav li');
        navItems.forEach(item => item.classList.remove('active'));

        // Find and highlight the current page
        const currentPageLink = document.querySelector(`.sidebar-nav a[href="${this.currentPage}"]`);
        if (currentPageLink) {
            currentPageLink.parentElement.classList.add('active');
        }

        // Handle special case for index.html (should also match empty path)
        if (this.currentPage === '' || this.currentPage === '/') {
            const dashboardLink = document.querySelector('.sidebar-nav a[href="index.html"]');
            if (dashboardLink) {
                dashboardLink.parentElement.classList.add('active');
            }
        }
    }
}

// Initialize navigation when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.navigationManager = new NavigationManager();
});
