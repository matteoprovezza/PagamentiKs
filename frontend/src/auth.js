// Authentication management
class AuthManager {
    constructor() {
        this.token = localStorage.getItem('access_token');
        this.refreshToken = localStorage.getItem('refresh_token');
        this.user = null;
    }

    // Login method
    async login(email, password) {
        try {
            const response = await fetch('http://localhost:8080/api/v1/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    password: password
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Credenziali non valide');
            }

            const data = await response.json();
            
            // Save tokens
            this.token = data.access_token;
            this.refreshToken = data.refresh_token;
            localStorage.setItem('access_token', this.token);
            if (this.refreshToken) {
                localStorage.setItem('refresh_token', this.refreshToken);
            }

            return data;
        } catch (error) {
            throw error;
        }
    }

    // Logout method
    logout() {
        this.token = null;
        this.refreshToken = null;
        this.user = null;
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        
        // Redirect to login page
        window.location.href = 'login.html';
    }

    // Check if user is authenticated
    isAuthenticated() {
        return !!this.token;
    }

    // Get authorization header
    getAuthHeader() {
        return this.token ? `Bearer ${this.token}` : null;
    }

    // Make authenticated API call
    async authenticatedFetch(url, options = {}) {
        const headers = {
            ...options.headers,
        };

        if (this.getAuthHeader()) {
            headers['Authorization'] = this.getAuthHeader();
        }

        try {
            const response = await fetch(url, {
                ...options,
                headers
            });

            // If token is expired, try to refresh
            if (response.status === 401 && this.refreshToken) {
                await this.refreshAccessToken();
                // Retry the request with new token
                headers['Authorization'] = this.getAuthHeader();
                return fetch(url, {
                    ...options,
                    headers
                });
            }

            return response;
        } catch (error) {
            console.error('Authenticated fetch error:', error);
            throw error;
        }
    }

    // Refresh access token
    async refreshAccessToken() {
        if (!this.refreshToken) {
            this.logout();
            return;
        }

        try {
            const response = await fetch('http://localhost:8080/api/v1/auth/refresh', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    refresh_token: this.refreshToken
                })
            });

            if (!response.ok) {
                throw new Error('Refresh token expired');
            }

            const data = await response.json();
            this.token = data.access_token;
            localStorage.setItem('access_token', this.token);

            if (data.refresh_token) {
                this.refreshToken = data.refresh_token;
                localStorage.setItem('refresh_token', this.refreshToken);
            }
        } catch (error) {
            console.error('Token refresh failed:', error);
            this.logout();
        }
    }

    // Check authentication and redirect if needed
    checkAuthAndRedirect() {
        if (!this.isAuthenticated()) {
            window.location.href = 'login.html';
            return false;
        }
        return true;
    }
}

// Global auth manager instance
window.authManager = new AuthManager();

// Initialize authentication check
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on a protected page (not login page)
    if (!window.location.pathname.includes('login.html')) {
        window.authManager.checkAuthAndRedirect();
    }
});

// Login form handler (for login.html)
if (document.getElementById('loginForm')) {
    document.getElementById('loginForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const loginBtn = document.getElementById('loginBtn');
        const btnText = document.getElementById('btnText');
        const btnLoading = document.getElementById('btnLoading');
        const errorMessage = document.getElementById('errorMessage');

        // Hide previous error message
        errorMessage.style.display = 'none';
        
        // Disable button and show loading
        loginBtn.disabled = true;
        btnText.style.display = 'none';
        btnLoading.style.display = 'inline-block';

        try {
            await window.authManager.login(email, password);
            
            // Redirect to dashboard on successful login
            window.location.href = 'index.html';
            
        } catch (error) {
            errorMessage.textContent = error.message || 'Errore durante il login. Riprova.';
            errorMessage.style.display = 'block';
        } finally {
            // Re-enable button and hide loading
            loginBtn.disabled = false;
            btnText.style.display = 'inline';
            btnLoading.style.display = 'none';
        }
    });
}

// Logout handler
window.logout = function() {
    if (confirm('Sei sicuro di voler uscire dal sistema?')) {
        window.authManager.logout();
    }
};

// Utility function to show user info
window.getCurrentUser = function() {
    return window.authManager.user;
};

// Utility function to check if user is admin
window.isAdmin = function() {
    const token = localStorage.getItem('access_token');
    if (!token) {
        return false;
    }
    
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.role === 'ADMIN';
    } catch (error) {
        console.error('Error checking admin status:', error);
        return false;
    }
};

// Show user creation modal
window.showCreateUserModal = function() {
    const modal = document.getElementById('createUserModal');
    if (modal) {
        modal.style.display = 'block';
    }
};

// Close user creation modal
window.closeCreateUserModal = function() {
    const modal = document.getElementById('createUserModal');
    if (modal) {
        modal.style.display = 'none';
        // Reset form
        const form = document.getElementById('createUserForm');
        if (form) {
            form.reset();
        }
    }
};

// Handle user creation form submission
document.addEventListener('DOMContentLoaded', function() {
    const createUserForm = document.getElementById('createUserForm');
    if (createUserForm) {
        createUserForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = document.getElementById('user-email').value;
            const password = document.getElementById('user-password').value;
            const firstName = document.getElementById('user-first-name').value;
            const lastName = document.getElementById('user-last-name').value;
            const role = document.getElementById('user-role').value;
            
            try {
                const response = await fetch('http://localhost:8080/api/v1/auth/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        email: email,
                        password: password,
                        firstName: firstName,
                        lastName: lastName,
                        role: role
                    })
                });
                
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Errore durante la creazione dell\'utente');
                }
                
                const data = await response.json();
                showMessage('Utente creato con successo!', 'success');
                closeCreateUserModal();
                
            } catch (error) {
                showMessage(error.message || 'Errore durante la creazione dell\'utente', 'error');
            }
        });
    }
    
    // Close modal when clicking outside
    window.onclick = function(event) {
        const modal = document.getElementById('createUserModal');
        if (modal && event.target === modal) {
            closeCreateUserModal();
        }
    };
});

// Check user role and show/hide admin-only elements on all pages
document.addEventListener('DOMContentLoaded', function() {
    checkUserRoleAndShowAdminElements();
});

// Function to check user role and show admin elements
async function checkUserRoleAndShowAdminElements() {
    const token = localStorage.getItem('access_token');
    console.log('Checking user role, token exists:', !!token);
    
    if (!token) {
        return;
    }
    
    try {
        // Decode JWT token to get user role
        const payload = JSON.parse(atob(token.split('.')[1]));
        const userRole = payload.role;
        console.log('User role from token:', userRole);
        
        if (userRole === 'ADMIN') {
            document.body.classList.add('is-admin');
            console.log('Added is-admin class to body');
        }
    } catch (error) {
        console.error('Error checking user role:', error);
        // If we can't decode the token, try to get user info from API
        try {
            const response = await fetch('http://localhost:8080/api/v1/auth/me', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            });
            
            if (response.ok) {
                const user = await response.json();
                console.log('User from API:', user);
                if (user.role === 'ADMIN') {
                    document.body.classList.add('is-admin');
                    window.authManager.user = user;
                    console.log('Added is-admin class to body from API');
                }
            }
        } catch (apiError) {
            console.error('Error fetching user info:', apiError);
        }
    }
}
