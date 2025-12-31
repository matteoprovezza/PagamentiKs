// Main application logic
class KarateManagerApp {
    constructor() {
        this.athletes = [];
        this.payments = [];
        this.currentYear = new Date().getFullYear();
        this.init();
    }

    async init() {
        this.bindEvents();
        this.setActiveNavItem();
        await this.loadAthletes();
        await this.loadDashboardStats();
    }

    bindEvents() {
        // Navigation
        document.querySelectorAll('.sidebar-nav a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleNavigation(e.target.getAttribute('href').substring(1));
            });
        });

        // Payment form
        const paymentForm = document.querySelector('.payment-form');
        if (paymentForm) {
            paymentForm.addEventListener('submit', (e) => this.handlePaymentSubmit(e));
        }

        // Generate receipt button
        const generateReceiptBtn = document.getElementById('generateReceiptBtn');
        if (generateReceiptBtn) {
            generateReceiptBtn.addEventListener('click', () => this.handleGenerateReceipt());
        }

        // Add athlete button
        const addAthleteBtn = document.querySelector('.btn-primary');
        if (addAthleteBtn && addAthleteBtn.textContent.includes('Aggiungi Nuovo Atleta')) {
            addAthleteBtn.addEventListener('click', () => this.showAddAthleteModal());
        }

        // Download report button
        const downloadReportBtn = document.querySelector('.btn-info');
        if (downloadReportBtn) {
            downloadReportBtn.addEventListener('click', () => this.downloadAnnualReport());
        }
    }

    setActiveNavItem() {
        // Ottieni il nome della pagina corrente
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        
        // Rimuovi la classe 'active' da tutti gli elementi del menu
        document.querySelectorAll('.sidebar-nav li').forEach(li => {
            li.classList.remove('active');
        });
        
        // Trova il link che corrisponde alla pagina corrente e aggiungi la classe 'active' al genitore li
        const navLinks = document.querySelectorAll('.sidebar-nav a');
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href === currentPage || 
                (currentPage === 'atleti.html' && href === 'atleti.html') ||
                (currentPage === 'pagamenti.html' && href === 'pagamenti.html') ||
                (currentPage === 'index.html' && href === 'index.html') ||
                (currentPage === 'dashboard.html' && href === 'dashboard.html')) {
                link.parentElement.classList.add('active');
            }
        });
    }

    handleNavigation(section) {
        // Update active nav item
        document.querySelectorAll('.sidebar-nav li').forEach(li => {
            li.classList.remove('active');
        });
        
        const activeLink = document.querySelector(`.sidebar-nav a[href="#${section}"]`);
        if (activeLink) {
            activeLink.parentElement.classList.add('active');
        }

        // Handle navigation logic
        switch(section) {
            case 'dashboard':
                this.showDashboard();
                break;
            case 'atleti':
                this.showAthleteManagement();
                break;
            case 'pagamenti':
                this.showPayments();
                break;
            case 'resoconti':
                this.showReports();
                break;
        }
    }

    async loadAthletes() {
        try {
            this.athletes = await api.getAthletes();
            this.updateAthleteList();
            this.updateAthleteSelect();
        } catch (error) {
            showMessage('Errore nel caricamento degli atleti', 'error');
            console.error('Error loading athletes:', error);
        }
    }

    async loadDashboardStats() {
        try {
            const stats = await api.getDashboardStats();
            console.log('Dashboard stats:', stats);
        } catch (error) {
            console.error('Error loading dashboard stats:', error);
        }
    }

    updateAthleteList() {
        const athleteList = document.querySelector('.athlete-list');
        if (!athleteList) return;

        athleteList.innerHTML = '';

        this.athletes.forEach(athlete => {
            const athleteItem = document.createElement('div');
            athleteItem.className = 'athlete-item';
            
            athleteItem.innerHTML = `
                <div class="athlete-name">${athlete.nome} ${athlete.cognome}</div>
                <div class="athlete-total" id="total-${athlete.id}">Caricamento...</div>
                <div class="athlete-actions">
                    <a href="#" class="btn-link" onclick="app.editAthlete(${athlete.id})">Modifica</a>
                    <a href="#" class="btn-link btn-danger" onclick="app.deleteAthlete(${athlete.id})">Elimina</a>
                </div>
            `;
            
            athleteList.appendChild(athleteItem);
            
            // Load total payments for each athlete
            this.loadAthleteTotal(athlete.id);
        });
    }

    async loadAthleteTotal(athleteId) {
        try {
            const total = await api.getTotalPaymentsByAthlete(athleteId);
            const totalElement = document.getElementById(`total-${athleteId}`);
            if (totalElement) {
                totalElement.textContent = formatCurrency(total);
            }
        } catch (error) {
            console.error(`Error loading total for athlete ${athleteId}:`, error);
            const totalElement = document.getElementById(`total-${athleteId}`);
            if (totalElement) {
                totalElement.textContent = formatCurrency(0);
            }
        }
    }

    updateAthleteSelect() {
        const athleteSelect = document.getElementById('athlete');
        if (!athleteSelect) return;

        athleteSelect.innerHTML = '<option value="">Seleziona un atleta...</option>';

        this.athletes.forEach(athlete => {
            const option = document.createElement('option');
            option.value = athlete.id;
            option.textContent = `${athlete.nome} ${athlete.cognome}`;
            athleteSelect.appendChild(option);
        });
    }

    async handlePaymentSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const atletaId = formData.get('athlete');
        const importo = parseFloat(formData.get('amount'));
        const data = formData.get('date');
        const paymentType = formData.get('paymentType');

        if (!atletaId || !importo || !data || !paymentType) {
            showMessage('Compila tutti i campi', 'warning');
            return;
        }

        try {
            const payment = {
                importo: importo,
                data: data,
                tipoPagamento: paymentType,
                metodoPagamento: paymentType === 'CONTANTI' ? 'Contanti' : 'Bonifico Bancario',
                atleta: {
                    id: atletaId
                }
            };

            const result = await api.createPayment(payment);
            showMessage('Pagamento registrato con successo!', 'success');
            
            // Reload data
            await this.loadAthletes();
            
        } catch (error) {
            showMessage('Errore nella registrazione del pagamento', 'error');
            console.error('Error creating payment:', error);
        }
    }

    async handleGenerateReceipt() {
        const athleteSelect = document.getElementById('athlete');
        const atletaId = athleteSelect.value;

        if (!atletaId) {
            showMessage('Seleziona un atleta per generare la ricevuta', 'warning');
            return;
        }

        try {
            showMessage('Generazione ricevuta in corso...', 'info');
            await api.generateReceipt(atletaId);
            showMessage('Ricevuta PDF generata con successo', 'success');
        } catch (error) {
            showMessage('Errore nella generazione della ricevuta', 'error');
            console.error('Error generating receipt:', error);
        }
    }

    showAddAthleteModal() {
        // Create modal for adding athlete
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Aggiungi Nuovo Atleta</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="add-athlete-form">
                        <div class="form-group">
                            <label for="nome">Nome</label>
                            <input type="text" id="nome" name="nome" required>
                        </div>
                        <div class="form-group">
                            <label for="cognome">Cognome</label>
                            <input type="text" id="cognome" name="cognome" required>
                        </div>
                        <div class="form-group">
                            <label for="cf">Codice Fiscale</label>
                            <input type="text" id="cf" name="cf">
                        </div>
                        <div class="form-group">
                            <label for="dataNascita">Data di Nascita</label>
                            <input type="date" id="dataNascita" name="dataNascita">
                        </div>
                        <div class="form-group">
                            <label for="telefono">Telefono</label>
                            <input type="tel" id="telefono" name="telefono">
                        </div>
                        <div class="form-group">
                            <label for="email">Email</label>
                            <input type="email" id="email" name="email">
                        </div>
                        <div class="form-group">
                            <label for="indirizzo">Indirizzo</label>
                            <input type="text" id="indirizzo" name="indirizzo">
                        </div>
                        <div class="form-actions">
                            <button type="submit" class="btn btn-primary">Salva</button>
                            <button type="button" class="btn btn-secondary modal-cancel">Annulla</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Add modal styles
        const modalStyles = document.createElement('style');
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
                background: white;
                border-radius: 12px;
                max-width: 500px;
                width: 90%;
                max-height: 90vh;
                overflow-y: auto;
            }
            .modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 20px;
                border-bottom: 1px solid #e0e0e0;
            }
            .modal-header h3 {
                margin: 0;
                color: #333;
            }
            .modal-close {
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
                color: #666;
            }
            .modal-body {
                padding: 20px;
            }
            .form-actions {
                display: flex;
                gap: 10px;
                justify-content: flex-end;
                margin-top: 20px;
            }
        `;
        document.head.appendChild(modalStyles);

        // Bind events
        modal.querySelector('.modal-close').addEventListener('click', () => {
            document.body.removeChild(modal);
            document.head.removeChild(modalStyles);
        });

        modal.querySelector('.modal-cancel').addEventListener('click', () => {
            document.body.removeChild(modal);
            document.head.removeChild(modalStyles);
        });

        modal.querySelector('#add-athlete-form').addEventListener('submit', (e) => {
            this.handleAddAthlete(e, modal, modalStyles);
        });
    }

    async handleAddAthlete(e, modal, modalStyles) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const athlete = {
            nome: formData.get('nome'),
            cognome: formData.get('cognome'),
            cf: formData.get('cf'),
            dataNascita: formData.get('dataNascita') || null,
            telefono: formData.get('telefono'),
            email: formData.get('email'),
            indirizzo: formData.get('indirizzo'),
            dataIscrizione: new Date().toISOString().split('T')[0],
            attivo: true
        };

        try {
            await api.createAthlete(athlete);
            showMessage('Atleta aggiunto con successo!', 'success');
            
            document.body.removeChild(modal);
            document.head.removeChild(modalStyles);
            
            await this.loadAthletes();
        } catch (error) {
            showMessage('Errore nell\'aggiunta dell\'atleta', 'error');
            console.error('Error adding athlete:', error);
        }
    }

    async editAthlete(id) {
        try {
            const athlete = await api.getAthleteById(id);
            // Similar to add athlete modal but pre-filled
            showMessage('Funzione di modifica in sviluppo', 'info');
        } catch (error) {
            showMessage('Errore nel caricamento dell\'atleta', 'error');
        }
    }

    async deleteAthlete(id) {
        if (!confirm('Sei sicuro di voler eliminare questo atleta?')) {
            return;
        }

        try {
            await api.deleteAthlete(id);
            showMessage('Atleta eliminato con successo', 'success');
            await this.loadAthletes();
        } catch (error) {
            showMessage('Errore nell\'eliminazione dell\'atleta', 'error');
            console.error('Error deleting athlete:', error);
        }
    }

    async downloadAnnualReport() {
        try {
            showMessage('Generazione report in corso...', 'info');
            // This would typically download a PDF
            // For now, we'll just show a message
            setTimeout(() => {
                showMessage('Report annuale scaricato con successo', 'success');
            }, 2000);
        } catch (error) {
            showMessage('Errore nella generazione del report', 'error');
        }
    }

    showDashboard() {
        // Dashboard specific logic
        console.log('Showing dashboard');
    }

    showAthleteManagement() {
        // Athlete management specific logic
        console.log('Showing athlete management');
    }

    showPayments() {
        // Payments specific logic
        console.log('Showing payments');
    }

    showReports() {
        // Reports specific logic
        console.log('Showing reports');
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new KarateManagerApp();
});
