// API Client for Karate Manager Backend
const API_BASE_URL = 'http://localhost:8080/api/v1';

class ApiClient {
    constructor() {
        this.baseURL = API_BASE_URL;
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        };

        try {
            const response = await fetch(url, config);
            
            if (!response.ok) {
                const error = new Error(`HTTP error! status: ${response.status}`);
                error.status = response.status;
                try {
                    const errorData = await response.json().catch(() => ({}));
                    error.data = errorData;
                    error.message = errorData.message || error.message;
                } catch (e) {
                    error.data = { message: response.statusText };
                }
                throw error;
            }
            
            if (response.status === 204) {
                return null;
            }
            
            return await response.json();
        } catch (error) {
            console.error('API request failed:', {
                url,
                method: options.method || 'GET',
                error: error.message,
                status: error.status,
                response: error.data
            });
            throw error;
        }
    }

    // Athletes API
    async getAthletes(search = '') {
        const endpoint = search ? `/atleti?search=${encodeURIComponent(search)}` : '/atleti';
        return this.request(endpoint);
    }

    async getActiveAthletes() {
        return this.request('/atleti/active');
    }

    // Get athletes with expiring medical certificates
    async getExpiringCertificates(days = 30) {
        return this.request(`/atleti/expiring-certificates?days=${days}`);
    }

    // Get athletes with expiring memberships
    async getExpiringMemberships(days = 30) {
        return this.request(`/atleti/expiring-memberships?days=${days}`);
    }

    async getAthleteById(id) {
        return this.request(`/atleti/${id}`);
    }

    async createAthlete(athlete) {
        return this.request('/atleti', {
            method: 'POST',
            body: JSON.stringify(athlete),
        });
    }

    async updateAthlete(id, athlete) {
        return this.request(`/atleti/${id}`, {
            method: 'PUT',
            body: JSON.stringify(athlete),
        });
    }

    async deleteAthlete(id) {
        return this.request(`/atleti/${id}`, {
            method: 'DELETE',
        });
    }

    async disableAthlete(id) {
        return this.request(`/atleti/${id}/disable`, {
            method: 'PUT',
        });
    }

    async enableAthlete(id) {
        return this.request(`/atleti/${id}/enable`, {
            method: 'PUT',
        });
    }

    // Payments API
    async getPayments(filters = {}) {
        const params = new URLSearchParams();
        
        if (filters.atletaId) params.append('atletaId', filters.atletaId);
        if (filters.tipo) params.append('tipo', filters.tipo);
        if (filters.fromDate) params.append('fromDate', filters.fromDate);
        if (filters.toDate) params.append('toDate', filters.toDate);
        
        const endpoint = params.toString() ? `/pagamenti?${params.toString()}` : '/pagamenti';
        return this.request(endpoint);
    }

    async getRecentPayments(days = 7) {
        return this.request(`/pagamenti/recent?days=${days}`);
    }

    async getPaymentById(id) {
        return this.request(`/pagamenti/${id}`);
    }

    async createPayment(payment) {
        return this.request('/pagamenti', {
            method: 'POST',
            body: JSON.stringify(payment),
        });
    }

    async createPaymentForAthlete(atletaId, payment) {
        return this.request(`/pagamenti/atleta/${atletaId}`, {
            method: 'POST',
            body: JSON.stringify(payment),
        });
    }

    async updatePayment(id, payment) {
        return this.request(`/pagamenti/${id}`, {
            method: 'PUT',
            body: JSON.stringify(payment),
        });
    }

    async deletePayment(id) {
        return this.request(`/pagamenti/${id}`, {
            method: 'DELETE',
        });
    }

    async getTotalPaymentsByAthlete(atletaId) {
        return this.request(`/pagamenti/atleta/${atletaId}/total`);
    }

    async generateReceipt(atletaId) {
        return this.request(`/pagamenti/atleta/${atletaId}/ricevuta`);
    }

    async getPaymentsByDateRange(startDate, endDate) {
        return this.request(`/pagamenti/date-range?startDate=${startDate}&endDate=${endDate}`);
    }

    async getPaymentsByMethod(method) {
        return this.request(`/pagamenti/method/${method}`);
    }

    async getPaymentsByAthlete(atletaId) {
        return this.request(`/pagamenti/atleta/${atletaId}`);
    }

    async getTotalPayments(startDate, endDate) {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        const endpoint = params.toString() ? `/pagamenti/total?${params.toString()}` : '/pagamenti/total';
        return this.request(endpoint);
    }

    // Users API
    async getUsers() {
        return this.request('/users');
    }

    async getUserById(id) {
        return this.request(`/users/${id}`);
    }

    async getUserByEmail(email) {
        return this.request(`/users/email/${email}`);
    }

    async getUsersByRole(role) {
        return this.request(`/users/role/${role}`);
    }

    async createUser(user) {
        return this.request('/users', {
            method: 'POST',
            body: JSON.stringify(user),
        });
    }

    async updateUser(id, user) {
        return this.request(`/users/${id}`, {
            method: 'PUT',
            body: JSON.stringify(user),
        });
    }

    async changeUserRole(id, newRole) {
        return this.request(`/users/${id}/role?newRole=${newRole}`, {
            method: 'PUT',
        });
    }

    async updateUserPassword(id, newPassword) {
        return this.request(`/users/${id}/password?newPassword=${newPassword}`, {
            method: 'PUT',
        });
    }

    async deleteUser(id) {
        return this.request(`/users/${id}`, {
            method: 'DELETE',
        });
    }

    async checkEmailExists(email) {
        return this.request(`/users/exists/email/${email}`);
    }

    // Reports API
    async getDashboardStats() {
        return this.request('/reports/dashboard');
    }

    async getMonthlyRevenue(year = new Date().getFullYear()) {
        return this.request(`/reports/revenue/monthly/${year}`);
    }

    async getAthleteStats() {
        return this.request('/reports/athletes/stats');
    }

    async getTopPayingAthletes(limit = 10) {
        return this.request(`/reports/athletes/top-payers?limit=${limit}`);
    }

    async getPaymentMethodStats() {
        return this.request('/reports/payments/method-stats');
    }
}

// Utility functions for UI
function formatCurrency(amount) {
    return new Intl.NumberFormat('it-IT', {
        style: 'currency',
        currency: 'EUR'
    }).format(amount);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('it-IT');
}

function showMessage(message, type = 'info') {
    // Create a simple message system
    const messageDiv = document.createElement('div');
    messageDiv.className = `message message-${type}`;
    messageDiv.textContent = message;
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 1000;
        max-width: 300px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    
    switch(type) {
        case 'success':
            messageDiv.style.backgroundColor = '#4caf50';
            break;
        case 'error':
            messageDiv.style.backgroundColor = '#f44336';
            break;
        case 'warning':
            messageDiv.style.backgroundColor = '#ff9800';
            break;
        default:
            messageDiv.style.backgroundColor = '#2196f3';
    }
    
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.parentNode.removeChild(messageDiv);
        }
    }, 5000);
}

// Global API client instance
const api = new ApiClient();
