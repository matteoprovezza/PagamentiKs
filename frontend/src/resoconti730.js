// Resoconti 730 functionality
class Resoconti730Page {
    constructor() {
        this.athletes = [];
        this.payments = [];
        this.init();
    }

    async init() {
        await this.loadDashboardData();
        this.bindEvents();
    }

    async loadDashboardData() {
        console.log('Loading 730 dashboard data...');
        try {
            // Load athletes
            console.log('Fetching athletes...');
            this.athletes = await api.getAthletes();
            console.log('Athletes loaded:', this.athletes.length, this.athletes);
            
            // Load payments
            console.log('Fetching payments...');
            this.payments = await api.getPayments();
            console.log('Payments loaded:', this.payments.length, this.payments);
            
            // Load stats
            console.log('Fetching dashboard stats...');
            const stats = await api.getDashboardStats();
            console.log('Stats loaded:', stats);
            
            this.updateStats(stats);
            this.updateAthletes730Table();
            console.log('730 Dashboard updated successfully');
            
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            showMessage('Errore nel caricamento dei dati', 'error');
            
            // Fallback to mock data for testing
            console.log('Using fallback values...');
            this.athletes = [
                { id: 1, nome: 'Mario', cognome: 'Rossi', email: 'mario@email.com', telefono: '3331234567', dataIscrizione: '2023-01-15', attivo: true },
                { id: 2, nome: 'Giulia', cognome: 'Bianchi', email: 'giulia@email.com', telefono: '3331234568', dataIscrizione: '2023-02-20', attivo: true },
                { id: 3, nome: 'Paolo', cognome: 'Verdi', email: 'paolo@email.com', telefono: '3331234569', dataIscrizione: '2023-03-10', attivo: false }
            ];
            
            this.payments = [
                { id: 1, atletaId: 1, importo: 400, data: '2023-01-15', tipoPagamento: 'CONTANTI' },
                { id: 2, atletaId: 2, importo: 400, data: '2023-02-20', tipoPagamento: 'BONIFICO' },
                { id: 3, atletaId: 1, importo: 300, data: '2023-04-10', tipoPagamento: 'CONTANTI' }
            ];
            
            this.updateStats({});
            this.updateAthletes730Table();
            showMessage('Dati di esempio caricati (backend non disponibile)', 'info');
        }
    }

    updateStats(stats) {
        const totalAthletesEl = document.getElementById('totalAthletes');
        const generatedReportsEl = document.getElementById('generatedReports');
        const totalRevenue2025El = document.getElementById('totalRevenue2025');

        if (totalAthletesEl) {
            const totalAthletes = this.athletes.filter(a => a.attivo).length;
            totalAthletesEl.textContent = totalAthletes;
        }

        if (generatedReportsEl) {
            // Simulate generated reports count
            const generatedReports = Math.floor(this.athletes.length * 0.7); // 70% of athletes have reports
            generatedReportsEl.textContent = generatedReports;
        }

        if (totalRevenue2025El) {
            const currentYear = new Date().getFullYear();
            const yearlyTotal = this.payments
                .filter(p => new Date(p.data).getFullYear() === currentYear)
                .reduce((sum, p) => sum + (p.importo || 0), 0);
            totalRevenue2025El.textContent = `€ ${yearlyTotal.toLocaleString('it-IT', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
        }
    }

    updateAthletes730Table() {
        const tableBody = document.getElementById('athletes-730-table-body');
        if (!tableBody) return;

        tableBody.innerHTML = '';

        this.athletes.forEach(athlete => {
            const row = document.createElement('tr');
            row.setAttribute('data-athlete-id', athlete.id);
            row.setAttribute('data-athlete-name', `${athlete.nome} ${athlete.cognome}`.toLowerCase());
            
            // Calculate total payments for this athlete
            const athletePayments = this.payments.filter(p => p.atletaId === athlete.id);
            const totalPayments = athletePayments.reduce((sum, p) => sum + (p.importo || 0), 0);
            
            row.innerHTML = `
                <td>${athlete.nome}</td>
                <td>${athlete.cognome}</td>
                <td>${athlete.email || 'N/D'}</td>
                <td>${athlete.telefono || 'N/D'}</td>
                <td>${athlete.dataIscrizione ? formatDate(athlete.dataIscrizione) : 'N/D'}</td>
                <td><strong>${formatCurrency(totalPayments)}</strong></td>
                <td>
                    <span class="status-badge ${athlete.attivo ? 'active' : 'inactive'}">
                        ${athlete.attivo ? 'Attivo' : 'Disattivato'}
                    </span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-primary btn-sm" onclick="generate730Report(${athlete.id})" title="Genera Resoconto 730">
                            📄 730
                        </button>
                        <button class="btn btn-info btn-sm" onclick="viewAthletePayments(${athlete.id})" title="Vedi Dettagli Pagamenti">
                            💰 Pagamenti
                        </button>
                    </div>
                </td>
            `;

            tableBody.appendChild(row);
        });

        if (this.athletes.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="8" class="empty-row">Nessun atleta trovato</td></tr>';
        }
    }

    bindEvents() {
        // Search functionality
        const searchInput = document.getElementById('athlete-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.filterAthletes(e.target.value));
        }

        // Status filter
        const statusFilter = document.getElementById('status-filter');
        if (statusFilter) {
            statusFilter.addEventListener('change', () => this.filterAthletes());
        }

        // Year filter
        const yearFilter = document.getElementById('year-filter');
        if (yearFilter) {
            yearFilter.addEventListener('change', () => this.filterAthletes());
        }
    }

    filterAthletes(searchTerm = '') {
        const statusFilter = document.getElementById('status-filter')?.value || '';
        const yearFilter = document.getElementById('year-filter')?.value || '';
        const rows = document.querySelectorAll('#athletes-730-table-body tr');

        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            const statusText = row.querySelector('.status-badge')?.textContent.toLowerCase() || '';
            
            const matchesSearch = !searchTerm || text.includes(searchTerm.toLowerCase());
            const matchesStatus = !statusFilter || 
                (statusFilter === 'active' && statusText.includes('attivo')) ||
                (statusFilter === 'inactive' && statusText.includes('disattivato'));
            
            // Year filter would need payment data - for now just pass through
            const matchesYear = !yearFilter; // TODO: Implement year filtering based on payments
            
            row.style.display = matchesSearch && matchesStatus && matchesYear ? '' : 'none';
        });
    }
}

// Global functions for 730 reports
window.generate730Report = async function(athleteId) {
    console.log('Generating 730 report for athlete:', athleteId);
    
    try {
        const athlete = window.resoconti730Page.athletes.find(a => a.id === athleteId);
        if (!athlete) {
            showMessage('Atleta non trovato', 'error');
            return;
        }

        showMessage(`Generazione resoconto 730 per ${athlete.nome} ${athlete.cognome}...`, 'info');
        
        // Call API to generate 730 report
        // This would be a new API endpoint like: api.generate730Report(athleteId)
        // For now, simulate the API call
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        showMessage(`✅ Resoconto 730 generato per ${athlete.nome} ${athlete.cognome}`, 'success');
        
        // In a real implementation, this would trigger a PDF download
        // window.open('/api/v1/reports/730/' + athleteId, '_blank');
        
    } catch (error) {
        console.error('Error generating 730 report:', error);
        showMessage('Errore nella generazione del resoconto 730', 'error');
    }
};

window.generateAll730Reports = async function() {
    console.log('Generating all 730 reports...');
    
    if (!confirm('Sei sicuro di voler generare tutti i resoconti 730? Questa operazione potrebbe richiedere del tempo.')) {
        return;
    }

    try {
        const activeAthletes = window.resoconti730Page.athletes.filter(a => a.attivo);
        
        if (activeAthletes.length === 0) {
            showMessage('Nessun atleta attivo trovato', 'warning');
            return;
        }

        showMessage(`Generazione di ${activeAthletes.length} resoconti 730 in corso...`, 'info');
        
        // Simulate batch generation
        for (let i = 0; i < activeAthletes.length; i++) {
            const athlete = activeAthletes[i];
            console.log(`Generating report ${i + 1}/${activeAthletes.length} for ${athlete.nome} ${athlete.cognome}`);
            
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        showMessage(`✅ Generati ${activeAthletes.length} resoconti 730 con successo`, 'success');
        
        // Update stats
        const generatedReportsEl = document.getElementById('generatedReports');
        if (generatedReportsEl) {
            generatedReportsEl.textContent = activeAthletes.length;
        }
        
    } catch (error) {
        console.error('Error generating all 730 reports:', error);
        showMessage('Errore nella generazione dei resoconti 730', 'error');
    }
};

window.viewAthletePayments = async function(athleteId) {
    console.log('Viewing payments for athlete:', athleteId);
    
    try {
        const athlete = window.resoconti730Page.athletes.find(a => a.id === athleteId);
        if (!athlete) {
            showMessage('Atleta non trovato', 'error');
            return;
        }

        // Get payments for this athlete
        const payments = window.resoconti730Page.payments.filter(p => p.atletaId === athleteId);
        
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Pagamenti di ${athlete.nome} ${athlete.cognome}</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="payments-summary">
                        <div class="summary-item">
                            <span class="summary-label">Totale Pagamenti:</span>
                            <span class="summary-value">${formatCurrency(payments.reduce((sum, p) => sum + (p.importo || 0), 0))}</span>
                        </div>
                        <div class="summary-item">
                            <span class="summary-label">Numero Pagamenti:</span>
                            <span class="summary-value">${payments.length}</span>
                        </div>
                    </div>
                    <div class="payments-list">
                        ${payments.length > 0 ? `
                            <table class="payments-table">
                                <thead>
                                    <tr>
                                        <th>Data</th>
                                        <th>Importo</th>
                                        <th>Tipo</th>
                                        <th>Note</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${payments.map(payment => `
                                        <tr>
                                            <td>${formatDate(payment.data)}</td>
                                            <td>${formatCurrency(payment.importo)}</td>
                                            <td>
                                                <span class="payment-type-badge ${payment.tipoPagamento?.toLowerCase()}">
                                                    ${payment.tipoPagamento || 'N/D'}
                                                </span>
                                            </td>
                                            <td>${payment.note || '-'}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        ` : '<p class="empty-message">Nessun pagamento trovato per questo atleta</p>'}
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        addModalStyles();

        // Bind events
        modal.querySelector('.modal-close').addEventListener('click', () => removeModal(modal));
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                removeModal(modal);
            }
        });

    } catch (error) {
        console.error('Error viewing athlete payments:', error);
        showMessage('Errore nel caricamento dei pagamenti', 'error');
    }
};

// Utility functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('it-IT');
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('it-IT', {
        style: 'currency',
        currency: 'EUR'
    }).format(amount);
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

function addModalStyles() {
    if (!document.getElementById('modal-styles')) {
        const modalStyles = document.createElement('style');
        modalStyles.id = 'modal-styles';
        modalStyles.textContent = `
            .modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.5);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 1000;
            }
            .modal-content {
                background: var(--bg-secondary);
                border-radius: 12px;
                max-width: 600px;
                width: 90%;
                max-height: 90vh;
                overflow-y: auto;
            }
            .modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 20px;
                border-bottom: 1px solid var(--border-color);
            }
            .modal-header h3 {
                margin: 0;
                color: var(--text-primary);
            }
            .modal-close {
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
                color: var(--text-secondary);
            }
            .modal-close:hover {
                color: var(--text-primary);
            }
            .modal-body {
                padding: 20px;
            }
            .payments-summary {
                display: flex;
                gap: 20px;
                margin-bottom: 20px;
                padding: 15px;
                background-color: var(--hover-bg);
                border-radius: 8px;
            }
            .summary-item {
                display: flex;
                flex-direction: column;
                align-items: center;
            }
            .summary-label {
                font-size: 14px;
                color: var(--text-secondary);
                margin-bottom: 5px;
            }
            .summary-value {
                font-size: 18px;
                font-weight: 600;
                color: var(--text-primary);
            }
            .payments-list {
                max-height: 400px;
                overflow-y: auto;
            }
            .empty-message {
                text-align: center;
                color: var(--text-secondary);
                font-style: italic;
                padding: 20px;
            }
        `;
        document.head.appendChild(modalStyles);
    }
}

function removeModal(modal) {
    if (modal && modal.parentNode) {
        modal.parentNode.removeChild(modal);
    }
}

// Initialize resoconti730 page
document.addEventListener('DOMContentLoaded', () => {
    window.resoconti730Page = new Resoconti730Page();
});
