// Toggle function for payment form
function togglePaymentForm() {
    const container = document.getElementById('payment-form-container');
    const icon = document.getElementById('payment-form-icon');
    const toggleBtn = document.getElementById('payment-form-toggle');
    
    if (container.style.display === 'none') {
        container.style.display = 'block';
        icon.className = 'fas fa-chevron-up';
        toggleBtn.classList.remove('collapsed');
    } else {
        container.style.display = 'none';
        icon.className = 'fas fa-chevron-down';
        toggleBtn.classList.add('collapsed');
    }
}

// Payments management functionality
class PagamentiPage {
    constructor() {
        this.payments = [];
        this.athletes = [];
        this.init();
    }

    async init() {
        await this.loadPaymentsData();
        this.bindEvents();
    }

    bindEvents() {
        // Filter events will be bound in HTML
    }

    bindPaymentFormEvents() {
        const paymentForm = document.querySelector('.payment-form');
        if (!paymentForm) return;

        paymentForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(paymentForm);
            const payment = {
                importo: parseFloat(formData.get('amount')),
                dataPagamento: formData.get('date'),
                tipoPagamento: 'CONTANTI', // Default payment type
                atleta: {
                    id: formData.get('athlete')
                }
            };

            try {
                // Register payment first
                const newPayment = await api.createPayment(payment);
                showMessage('Pagamento registrato con successo!', 'success');
                
                // Generate receipt for the newly created payment
                if (newPayment && newPayment.id) {
                    showMessage('Generazione ricevuta in corso...', 'info');
                    
                    // Call the new PDF endpoint
                    const response = await fetch(`http://localhost:8080/api/v1/pagamenti/${newPayment.id}/ricevuta`);
                    
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    
                    // Get the PDF blob
                    const blob = await response.blob();
                    
                    // Create download link
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `ricevuta_pagamento_${newPayment.id}.pdf`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    window.URL.revokeObjectURL(url);
                    
                    showMessage('Ricevuta PDF generata e scaricata con successo', 'success');
                }
                
                paymentForm.reset();
                // Set default date again
                document.getElementById('date').value = new Date().toISOString().split('T')[0];
                await this.loadPaymentsData();
            } catch (error) {
                showMessage('Errore nella registrazione del pagamento', 'error');
                console.error('Error adding payment:', error);
            }
        });
    }

    async loadPaymentsData() {
        try {
            console.log('Loading payments data from API...');
            
            // Load athletes first
            this.athletes = await api.getAthletes();
            console.log('Athletes loaded:', this.athletes.length, this.athletes);
            
            // Load payments
            this.payments = await api.getPayments();
            console.log('Payments loaded:', this.payments.length, this.payments);
            
            // Debug: Log the first payment to see its structure
            if (this.payments.length > 0) {
                console.log('First payment structure:', JSON.stringify(this.payments[0], null, 2));
            }
            
            // Update all UI components
            await this.updatePaymentsTable();
            this.updateAthleteFilter();
            this.updatePaymentFormAthletes();
            this.updateAthletesQuickPaymentGrid();
            this.bindPaymentFormEvents();
            this.bindAthletesQuickSearch();
        } catch (error) {
            console.error('Error loading payments data:', error);
            showMessage('Errore nel caricamento dei dati', 'error');
            
            // Show empty state when backend is unavailable
            this.athletes = [];
            this.payments = [];
            await this.updatePaymentsTable();
            this.updateAthleteFilter();
            this.updatePaymentFormAthletes();
            this.updateAthletesQuickPaymentGrid();
        }
    }

    updateAthleteFilter() {
        const athleteFilter = document.getElementById('athlete-filter');
        if (!athleteFilter) return;

        athleteFilter.innerHTML = '<option value="">Tutti gli atleti</option>';
        
        this.athletes.forEach(athlete => {
            const option = document.createElement('option');
            option.value = athlete.id;
            option.textContent = `${athlete.nome} ${athlete.cognome}`;
            athleteFilter.appendChild(option);
        });
    }

    updatePaymentFormAthletes() {
        const athleteSelect = document.getElementById('athlete');
        if (!athleteSelect) return;

        athleteSelect.innerHTML = '<option value="">Seleziona un atleta...</option>';
        
        this.athletes.forEach(athlete => {
            const option = document.createElement('option');
            option.value = athlete.id;
            option.textContent = `${athlete.nome} ${athlete.cognome}`;
            athleteSelect.appendChild(option);
        });

        // Set default date
        const dateInput = document.getElementById('date');
        if (dateInput && !dateInput.value) {
            dateInput.value = new Date().toISOString().split('T')[0];
        }
    }

    async updatePaymentsTable() {
        const tableBody = document.getElementById('payments-table-body');
        if (!tableBody) return;

        tableBody.innerHTML = '';

        for (const payment of this.payments) {
            const row = document.createElement('tr');
            
            // Get athlete name - now async
            const athleteName = await this.getAthleteName(payment);
            
            row.innerHTML = `
                <td>${formatDate(payment.data)}</td>
                <td>${athleteName}</td>
                <td><strong>${formatCurrency(payment.importo)}</strong></td>
                <td>
                    <span class="payment-type-badge ${payment.tipoPagamento?.toLowerCase()}">
                        ${payment.tipoPagamento || 'N/D'}
                    </span>
                </td>
                <td>${payment.metodoPagamento || 'N/D'}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-primary" onclick="editPayment(${payment.id})">
                            Modifica
                        </button>
                        <button class="btn btn-sm btn-info" onclick="generateAthleteReceipt(${payment.atleta?.id || payment.atletaId})">
                            Ricevuta
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="deletePayment(${payment.id})">
                            Elimina
                        </button>
                    </div>
                </td>
            `;
            
            tableBody.appendChild(row);
        }

        if (this.payments.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="6" class="empty-row">Nessun pagamento trovato</td></tr>';
        }
    }

    async getAthleteName(payment) {
        console.log('Getting athlete name for payment:', payment);
        
        // First try to get from payment.atleta object
        if (payment.atleta && payment.atleta.nome && payment.atleta.cognome) {
            console.log('Found athlete name in payment.atleta');
            return `${payment.atleta.nome} ${payment.atleta.cognome}`;
        }
        
        // Try all possible ID fields
        const athleteId = payment.atleta?.id || payment.atletaId || payment.atleta_id || payment.athleteId;
        console.log('Trying to find athlete by ID:', athleteId);
        
        if (athleteId) {
            try {
                // Make API call to get athlete data
                const athlete = await api.getAthleteById(athleteId);
                console.log('Found athlete from API:', athlete);
                
                if (athlete && athlete.nome && athlete.cognome) {
                    // Cache the athlete data for future use
                    payment.atleta = {
                        id: athlete.id,
                        nome: athlete.nome,
                        cognome: athlete.cognome
                    };
                    return `${athlete.nome} ${athlete.cognome}`;
                }
            } catch (error) {
                console.error('Error fetching athlete data:', error);
            }
            
            // Fallback to local athletes cache
            if (this.athletes.length > 0) {
                let athlete = this.athletes.find(a => a.id == athleteId);
                if (!athlete) athlete = this.athletes.find(a => a.id === athleteId);
                if (!athlete) athlete = this.athletes.find(a => a.id === parseInt(athleteId));
                if (!athlete) athlete = this.athletes.find(a => a.id == parseInt(athleteId));
                
                console.log('Found athlete in local cache:', athlete);
                if (athlete) {
                    return `${athlete.nome} ${athlete.cognome}`;
                }
            }
        }
        
        // Fallback - show ID for debugging
        console.log('Athlete not found, payment data:', JSON.stringify(payment, null, 2));
        console.log('Athlete ID fields:', {
            'payment.atleta?.id': payment.atleta?.id,
            'payment.atletaId': payment.atletaId,
            'payment.atleta_id': payment.atleta_id,
            'payment.athleteId': payment.athleteId
        });
        return athleteId ? `Atleta ID: ${athleteId}` : 'N/D';
    }

    updateAthletesQuickPaymentGrid() {
        const tableBody = document.getElementById('athletes-quick-payment-table-body');
        if (!tableBody) return;

        tableBody.innerHTML = '';

        this.athletes.forEach(athlete => {
            const row = document.createElement('tr');
            row.setAttribute('data-athlete-id', athlete.id);
            row.setAttribute('data-athlete-name', `${athlete.nome} ${athlete.cognome}`.toLowerCase());
            
            row.innerHTML = `
                <td>${athlete.nome}</td>
                <td>${athlete.cognome}</td>
                <td>${athlete.email || 'N/D'}</td>
                <td>${athlete.telefono || 'N/D'}</td>
                <td>${athlete.dataIscrizione ? formatDate(athlete.dataIscrizione) : 'N/D'}</td>
                <td>
                    <span class="status-badge ${athlete.attivo ? 'active' : 'inactive'}">
                        ${athlete.attivo ? 'Attivo' : 'Disattivato'}
                    </span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-primary btn-sm" onclick="showQuickPaymentForm(${athlete.id})">
                            Pagamento Rapido
                        </button>
                        <button class="btn btn-info btn-sm" onclick="viewAthletePayments(${athlete.id})">
                            Vedi Pagamenti
                        </button>
                    </div>
                </td>
            `;

            tableBody.appendChild(row);
        });

        if (this.athletes.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="7" class="empty-row">Nessun atleta trovato</td></tr>';
        }
    }

    bindAthletesQuickSearch() {
        const searchInput = document.getElementById('athlete-quick-search');
        if (!searchInput) return;

        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const rows = document.querySelectorAll('#athletes-quick-payment-table-body tr');

            rows.forEach(row => {
                const athleteName = row.getAttribute('data-athlete-name');
                const matchesSearch = !searchTerm || athleteName.includes(searchTerm);
                row.style.display = matchesSearch ? '' : 'none';
            });
        });
    }
}

// Global functions for payment management
window.showAddPaymentModal = async function() {
    if (!window.pagamentiPage.athletes.length) {
        showMessage('Nessun atleta disponibile. Aggiungi prima un atleta.', 'warning');
        return;
    }

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Registra Nuovo Pagamento</h3>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <form id="add-payment-form">
                    <div class="form-group">
                        <label for="athlete">Atleta*</label>
                        <select id="athlete" name="athlete" required>
                            <option value="">Seleziona un atleta...</option>
                        </select>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="importo">Importo (€)*</label>
                            <input type="number" id="importo" name="importo" step="0.01" min="0" required>
                        </div>
                        <div class="form-group">
                            <label for="data">Data*</label>
                            <input type="date" id="data" name="data" required>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="paymentType">Tipologia Pagamento*</label>
                        <select id="paymentType" name="paymentType" required>
                            <option value="CONTANTI">Contanti</option>
                            <option value="BONIFICO">Bonifico</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="metodoPagamento">Metodo Pagamento</label>
                        <input type="text" id="metodoPagamento" name="metodoPagamento" placeholder="Es: Contanti, Bonifico Bancario">
                    </div>
                    <div class="form-group">
                        <label for="note">Note</label>
                        <textarea id="note" name="note" rows="3"></textarea>
                    </div>
                    <div class="form-actions">
                        <button type="submit" class="btn btn-primary">Registra Pagamento</button>
                        <button type="button" class="btn btn-success" onclick="handleAddPaymentAndGenerateReceipt()">Registra e Genera Ricevuta</button>
                        <button type="button" class="btn btn-secondary modal-cancel">Annulla</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    addModalStyles();

    // Populate athletes dropdown
    const athleteSelect = modal.querySelector('#athlete');
    window.pagamentiPage.athletes.forEach(athlete => {
        const option = document.createElement('option');
        option.value = athlete.id;
        option.textContent = `${athlete.nome} ${athlete.cognome}`;
        athleteSelect.appendChild(option);
    });

    // Set default date
    modal.querySelector('#data').value = new Date().toISOString().split('T')[0];

    // Bind events
    modal.querySelector('.modal-close').addEventListener('click', () => removeModal(modal));
    modal.querySelector('.modal-cancel').addEventListener('click', () => removeModal(modal));
    modal.querySelector('#add-payment-form').addEventListener('submit', (e) => handleAddPayment(e, modal));
};

window.editPayment = async function(id) {
    try {
        const payment = await api.getPaymentById(id);
        
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Modifica Pagamento</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="edit-payment-form">
                        <input type="hidden" id="payment-id" name="payment-id" value="${payment.id}">
                        <div class="form-group">
                            <label for="athlete">Atleta*</label>
                            <select id="athlete" name="athlete" required>
                                <option value="">Seleziona un atleta...</option>
                            </select>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="importo">Importo (€)*</label>
                                <input type="number" id="importo" name="importo" step="0.01" min="0" 
                                       value="${payment.importo}" required>
                            </div>
                            <div class="form-group">
                                <label for="data">Data*</label>
                                <input type="date" id="data" name="data" 
                                       value="${payment.data}" required>
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="paymentType">Tipologia Pagamento*</label>
                            <select id="paymentType" name="paymentType" required>
                                <option value="CONTANTI" ${payment.tipoPagamento === 'CONTANTI' ? 'selected' : ''}>Contanti</option>
                                <option value="BONIFICO" ${payment.tipoPagamento === 'BONIFICO' ? 'selected' : ''}>Bonifico</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="metodoPagamento">Metodo Pagamento</label>
                            <input type="text" id="metodoPagamento" name="metodoPagamento" 
                                   value="${payment.metodoPagamento || ''}" 
                                   placeholder="Es: Contanti, Bonifico Bancario">
                        </div>
                        <div class="form-actions">
                            <button type="submit" class="btn btn-primary">Aggiorna</button>
                            <button type="button" class="btn btn-secondary modal-cancel">Annulla</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        addModalStyles();

        // Populate athletes dropdown
        const athleteSelect = modal.querySelector('#athlete');
        window.pagamentiPage.athletes.forEach(athlete => {
            const option = document.createElement('option');
            option.value = athlete.id;
            option.textContent = `${athlete.nome} ${athlete.cognome}`;
            
            // Get the payment's athlete ID (either from atleta object or atletaId)
            const paymentAthleteId = payment.atleta?.id || payment.atletaId;
            if (paymentAthleteId === athlete.id) {
                option.selected = true;
            }
            
            athleteSelect.appendChild(option);
        });

        // Bind events
        modal.querySelector('.modal-close').addEventListener('click', () => removeModal(modal));
        modal.querySelector('.modal-cancel').addEventListener('click', () => removeModal(modal));
        modal.querySelector('#edit-payment-form').addEventListener('submit', (e) => handleEditPayment(e, modal));

    } catch (error) {
        showMessage('Errore nel caricamento del pagamento', 'error');
        console.error('Error loading payment:', error);
    }
};

window.deletePayment = async function(id) {
    if (!confirm('Sei sicuro di voler eliminare questo pagamento?')) {
        return;
    }

    try {
        await api.deletePayment(id);
        showMessage('Pagamento eliminato con successo', 'success');
        await window.pagamentiPage.loadPaymentsData();
    } catch (error) {
        showMessage('Errore nell\'eliminazione del pagamento', 'error');
        console.error('Error deleting payment:', error);
    }
};

window.generateReceipt = async function(paymentId) {
    if (!paymentId) {
        showMessage('ID pagamento non valido per la generazione della ricevuta', 'warning');
        return;
    }

    try {
        showMessage('Generazione ricevuta in corso...', 'info');
        
        // Call the new PDF endpoint
        const response = await fetch(`http://localhost:8080/api/v1/pagamenti/${paymentId}/ricevuta`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        // Get the PDF blob
        const blob = await response.blob();
        
        // Create download link
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ricevuta_pagamento_${paymentId}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        showMessage('Ricevuta PDF generata e scaricata con successo', 'success');
        
    } catch (error) {
        showMessage('Errore nella generazione della ricevuta', 'error');
        console.error('Error generating receipt:', error);
    }
};

window.generateAthleteReceipt = async function(athleteId) {
    if (!athleteId) {
        showMessage('ID atleta non valido per la generazione della ricevuta', 'warning');
        return;
    }

    try {
        showMessage('Generazione ricevuta atleta in corso...', 'info');
        
        // Call the athlete PDF endpoint
        const response = await fetch(`http://localhost:8080/api/v1/pagamenti/atleta/${athleteId}/ricevuta`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        // Get the PDF blob
        const blob = await response.blob();
        
        // Create download link
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ricevuta_atleta_${athleteId}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        showMessage('Ricevuta PDF atleta generata e scaricata con successo', 'success');
        
    } catch (error) {
        showMessage('Errore nella generazione della ricevuta atleta', 'error');
        console.error('Error generating athlete receipt:', error);
    }
};

window.filterPayments = async function() {
    try {
        const athleteId = document.getElementById('athlete-filter')?.value;
        const paymentType = document.getElementById('payment-type-filter')?.value;
        const dateFrom = document.getElementById('date-from')?.value;
        const dateTo = document.getElementById('date-to')?.value;

        const filters = {};
        if (athleteId) filters.atletaId = athleteId;
        if (paymentType) filters.tipo = paymentType;
        if (dateFrom) filters.fromDate = dateFrom;
        if (dateTo) filters.toDate = dateTo;

        window.pagamentiPage.payments = await api.getPayments(filters);
        await window.pagamentiPage.updatePaymentsTable();
    } catch (error) {
        showMessage('Errore nel filtraggio dei pagamenti', 'error');
        console.error('Error filtering payments:', error);
    }
};

window.showQuickPaymentForm = function(athleteId) {
    const athlete = window.pagamentiPage.athletes.find(a => a.id == athleteId);
    if (!athlete) {
        showMessage('Atleta non trovato', 'error');
        return;
    }

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Pagamento Rapido - ${athlete.nome} ${athlete.cognome}</h3>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <div class="athlete-info-summary">
                    <div class="info-item">
                        <span class="info-label">Email:</span>
                        <span class="info-value">${athlete.email || 'N/D'}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Telefono:</span>
                        <span class="info-value">${athlete.telefono || 'N/D'}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Stato:</span>
                        <span class="status-badge ${athlete.attivo ? 'active' : 'inactive'}">
                            ${athlete.attivo ? 'Attivo' : 'Disattivato'}
                        </span>
                    </div>
                </div>
                
                <form id="quick-payment-modal-form">
                    <div class="form-row">
                        <div class="form-group">
                            <label for="modal-quick-amount-${athleteId}">Importo (€)*</label>
                            <input type="number" id="modal-quick-amount-${athleteId}" step="0.01" min="0" placeholder="0.00" required>
                        </div>
                        <div class="form-group">
                            <label for="modal-quick-type-${athleteId}">Tipo Pagamento*</label>
                            <select id="modal-quick-type-${athleteId}" required>
                                <option value="CONTANTI">Contanti</option>
                                <option value="BONIFICO">Bonifico</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="modal-quick-date-${athleteId}">Data Pagamento*</label>
                        <input type="date" id="modal-quick-date-${athleteId}" required>
                    </div>
                    <div class="form-group">
                        <label for="modal-quick-note-${athleteId}">Note</label>
                        <textarea id="modal-quick-note-${athleteId}" rows="3" placeholder="Note opzionali sul pagamento..."></textarea>
                    </div>
                    <div class="form-actions">
                        <button type="submit" class="btn btn-primary">Registra Pagamento</button>
                        <button type="button" class="btn btn-success" onclick="handleQuickPaymentAndGenerateReceipt(${athleteId})">Registra e Genera Ricevuta</button>
                        <button type="button" class="btn btn-secondary modal-cancel">Annulla</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    addModalStyles();

    // Set default date
    document.getElementById(`modal-quick-date-${athleteId}`).value = new Date().toISOString().split('T')[0];

    // Bind events
    modal.querySelector('.modal-close').addEventListener('click', () => removeModal(modal));
    modal.querySelector('.modal-cancel').addEventListener('click', () => removeModal(modal));
    modal.querySelector('#quick-payment-modal-form').addEventListener('submit', (e) => handleModalQuickPayment(e, modal, athleteId));
    
    // Close on backdrop click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            removeModal(modal);
        }
    });

    // Focus on amount input
    setTimeout(() => {
        document.getElementById(`modal-quick-amount-${athleteId}`).focus();
    }, 100);
};

window.hideQuickPaymentForm = function(athleteId) {
    // Questa funzione non è più necessaria con il modal, ma la lascio per compatibilità
};

window.registerPaymentWithoutReceipt = async function() {
    if (!window.pagamentiPage.paymentForm) return;
    
    const paymentForm = window.pagamentiPage.paymentForm;
    const formData = new FormData(paymentForm);
    const payment = {
        importo: parseFloat(formData.get('amount')),
        dataPagamento: formData.get('date'),
        tipoPagamento: 'CONTANTI', // Default payment type
        atleta: {
            id: formData.get('athlete')
        }
    };

    try {
        // Register payment first
        const newPayment = await api.createPayment(payment);
        showMessage('Pagamento registrato con successo!', 'success');
        
        paymentForm.reset();
        // Set default date again
        document.getElementById('date').value = new Date().toISOString().split('T')[0];
        await window.pagamentiPage.loadPaymentsData();
    } catch (error) {
        showMessage('Errore nella registrazione del pagamento', 'error');
        console.error('Error adding payment:', error);
    }
};

async function handleModalQuickPayment(e, modal, athleteId) {
    e.preventDefault();
    
    const amountInput = document.getElementById(`modal-quick-amount-${athleteId}`);
    const typeSelect = document.getElementById(`modal-quick-type-${athleteId}`);
    const dateInput = document.getElementById(`modal-quick-date-${athleteId}`);
    const noteInput = document.getElementById(`modal-quick-note-${athleteId}`);
    
    const amount = parseFloat(amountInput.value);
    const paymentType = typeSelect.value;
    const paymentDate = dateInput.value;
    const note = noteInput.value;
    
    if (!amount || amount <= 0) {
        showMessage('Inserisci un importo valido', 'warning');
        amountInput.focus();
        return;
    }
    
    if (!paymentDate) {
        showMessage('Seleziona una data di pagamento', 'warning');
        dateInput.focus();
        return;
    }
    
    try {
        const payment = {
            importo: amount,
            dataPagamento: paymentDate,
            tipoPagamento: paymentType,
            note: note || null,
            atleta: {
                id: athleteId
            }
        };

        const newPayment = await api.createPayment(payment);
        showMessage('Pagamento registrato con successo!', 'success');
        
        // Close the modal
        removeModal(modal);
        
        // Reload data
        await window.pagamentiPage.loadPaymentsData();
    } catch (error) {
        showMessage('Errore nella registrazione del pagamento', 'error');
        console.error('Error adding quick payment:', error);
    }
}

window.handleQuickPaymentAndGenerateReceipt = async function(athleteId) {
    const modal = document.querySelector('.modal');
    if (!modal) return;
    
    const amountInput = document.getElementById(`modal-quick-amount-${athleteId}`);
    const typeSelect = document.getElementById(`modal-quick-type-${athleteId}`);
    const dateInput = document.getElementById(`modal-quick-date-${athleteId}`);
    const noteInput = document.getElementById(`modal-quick-note-${athleteId}`);
    
    const amount = parseFloat(amountInput.value);
    const paymentType = typeSelect.value;
    const paymentDate = dateInput.value;
    const note = noteInput.value;
    
    if (!amount || amount <= 0) {
        showMessage('Inserisci un importo valido', 'warning');
        amountInput.focus();
        return;
    }
    
    if (!paymentDate) {
        showMessage('Seleziona una data di pagamento', 'warning');
        dateInput.focus();
        return;
    }
    
    try {
        showMessage('Registrazione pagamento in corso...', 'info');
        
        const payment = {
            importo: amount,
            dataPagamento: paymentDate,
            tipoPagamento: paymentType,
            note: note || null,
            atleta: {
                id: athleteId
            }
        };

        const newPayment = await api.createPayment(payment);
        showMessage('Pagamento registrato con successo!', 'success');
        
        // Generate receipt for the newly created payment
        if (newPayment && newPayment.id) {
            showMessage('Generazione ricevuta in corso...', 'info');
            
            // Call the PDF endpoint
            const response = await fetch(`http://localhost:8080/api/v1/pagamenti/${newPayment.id}/ricevuta`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            // Get the PDF blob
            const blob = await response.blob();
            
            // Create download link
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `ricevuta_pagamento_${newPayment.id}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            
            showMessage('Ricevuta PDF generata e scaricata con successo', 'success');
        }
        
        // Close the modal
        removeModal(modal);
        
        // Reload data
        await window.pagamentiPage.loadPaymentsData();
    } catch (error) {
        showMessage('Errore nella registrazione del pagamento o generazione ricevuta', 'error');
        console.error('Error adding quick payment and generating receipt:', error);
    }
};

window.viewAthletePayments = async function(athleteId) {
    console.log('viewAthletePayments called with athleteId:', athleteId);
    
    try {
        // Check if pagamentiPage exists
        if (!window.pagamentiPage || !window.pagamentiPage.athletes) {
            showMessage('Dati degli atleti non caricati', 'error');
            return;
        }

        console.log('Loading athlete details from API...');
        // Get complete athlete details from API - this includes payments array
        const athlete = await api.getAthleteById(athleteId);
        console.log('Athlete details from API:', athlete);
        
        if (!athlete) {
            console.error('Athlete not found with ID:', athleteId);
            showMessage('Atleta non trovato', 'error');
            return;
        }

        // Extract payments from the athlete object
        const payments = athlete.pagamenti || [];
        console.log('Payments from athlete object:', payments);

        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Scheda Atleta: ${athlete.nome} ${athlete.cognome}</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <!-- Athlete Details Section -->
                    <div class="athlete-details-section">
                        <h4>Dati Personali</h4>
                        <div class="athlete-info-grid">
                            <div class="info-item">
                                <span class="info-label">Codice Fiscale:</span>
                                <span class="info-value">${athlete.cf || 'N/D'}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Data di Nascita:</span>
                                <span class="info-value">${athlete.dataNascita ? formatDate(athlete.dataNascita) : 'N/D'}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Email:</span>
                                <span class="info-value">${athlete.email || 'N/D'}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Telefono:</span>
                                <span class="info-value">${athlete.telefono || 'N/D'}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Indirizzo:</span>
                                <span class="info-value">${athlete.indirizzo || 'N/D'}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Data Iscrizione:</span>
                                <span class="info-value">${athlete.dataIscrizione ? formatDate(athlete.dataIscrizione) : 'N/D'}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Stato:</span>
                                <span class="status-badge ${athlete.attivo ? 'active' : 'inactive'}">
                                    ${athlete.attivo ? 'Attivo' : 'Disattivato'}
                                </span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Scadenza Certificato:</span>
                                <span class="info-value">${athlete.dataScadenzaCertificato ? formatDate(athlete.dataScadenzaCertificato) : 'N/D'}</span>
                            </div>
                        </div>
                        ${athlete.note ? `
                            <div class="athlete-notes">
                                <h4>Note</h4>
                                <p>${athlete.note}</p>
                            </div>
                        ` : ''}
                    </div>
                    
                    <!-- Payments Summary Section -->
                    <div class="payments-summary-section">
                        <h4>Riepilogo Pagamenti</h4>
                        <div class="payments-summary">
                            <div class="summary-item">
                                <span class="summary-label">Totale Pagamenti:</span>
                                <span class="summary-value">${formatCurrency(calculateAthleteTotal(payments))}</span>
                            </div>
                            <div class="summary-item">
                                <span class="summary-label">Numero Pagamenti:</span>
                                <span class="summary-value">${payments.length}</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Payments List Section -->
                    <div class="payments-list-section">
                        <h4>Elenco Pagamenti</h4>
                        <div class="payments-list">
                            ${payments.length > 0 ? `
                                <table class="payments-table">
                                    <thead>
                                        <tr>
                                            <th>Data</th>
                                            <th>Importo</th>
                                            <th>Tipo</th>
                                            <th>Metodo</th>
                                            <th>Note</th>
                                            <th>Ricevuta</th>
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
                                                <td>${payment.metodoPagamento || 'N/D'}</td>
                                                <td>${payment.note || '-'}</td>
                                                <td>
                                                    <button class="btn btn-info btn-sm" onclick="generatePaymentReceipt(${athlete.id}, ${payment.id})" title="Genera Ricevuta PDF">
                                                        📄 Ricevuta
                                                    </button>
                                                </td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            ` : '<p class="empty-message">Nessun pagamento trovato per questo atleta</p>'}
                        </div>
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
        console.error('Error in viewAthletePayments:', error);
        showMessage('Errore nel caricamento dei dati dell\'atleta', 'error');
    }
};

function calculateAthleteTotal(payments) {
    return payments.reduce((total, payment) => total + (payment.importo || 0), 0);
}

window.generatePaymentReceipt = async function(athleteId, paymentId) {
    console.log('Generating receipt for athlete:', athleteId, 'payment:', paymentId);
    
    try {
        showMessage('Generazione ricevuta in corso...', 'info');
        
        // Generate receipt for the specific payment using the payment endpoint
        const response = await fetch(`http://localhost:8080/api/v1/pagamenti/${paymentId}/ricevuta`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        // Get the PDF blob
        const blob = await response.blob();
        
        // Create download link
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ricevuta_pagamento_${paymentId}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        showMessage('Ricevuta PDF generata con successo!', 'success');
    } catch (error) {
        console.error('Error generating receipt:', error);
        showMessage('Errore nella generazione della ricevuta', 'error');
    }
};

async function handleAddPayment(e, modal) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const payment = {
        importo: parseFloat(formData.get('importo')),
        dataPagamento: formData.get('data'),
        tipoPagamento: formData.get('paymentType'),
        atleta: {
            id: formData.get('athlete')
        }
    };

    try {
        await api.createPayment(payment);
        showMessage('Pagamento registrato con successo!', 'success');
        removeModal(modal);
        await window.pagamentiPage.loadPaymentsData();
    } catch (error) {
        showMessage('Errore nella registrazione del pagamento', 'error');
        console.error('Error adding payment:', error);
    }
}

window.handleAddPaymentAndGenerateReceipt = async function() {
    const modal = document.querySelector('.modal');
    if (!modal) return;
    
    const form = modal.querySelector('#add-payment-form');
    if (!form) return;
    
    const formData = new FormData(form);
    const payment = {
        importo: parseFloat(formData.get('importo')),
        dataPagamento: formData.get('data'),
        tipoPagamento: formData.get('paymentType'),
        atleta: {
            id: formData.get('athlete')
        }
    };

    try {
        showMessage('Registrazione pagamento in corso...', 'info');
        
        // Register payment first
        const newPayment = await api.createPayment(payment);
        showMessage('Pagamento registrato con successo!', 'success');
        
        // Generate receipt for the newly created payment
        if (newPayment && newPayment.id) {
            showMessage('Generazione ricevuta in corso...', 'info');
            
            // Call the PDF endpoint
            const response = await fetch(`http://localhost:8080/api/v1/pagamenti/${newPayment.id}/ricevuta`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            // Get the PDF blob
            const blob = await response.blob();
            
            // Create download link
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `ricevuta_pagamento_${newPayment.id}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            
            showMessage('Ricevuta PDF generata e scaricata con successo', 'success');
        }
        
        removeModal(modal);
        await window.pagamentiPage.loadPaymentsData();
    } catch (error) {
        showMessage('Errore nella registrazione del pagamento o generazione ricevuta', 'error');
        console.error('Error adding payment and generating receipt:', error);
    }
};

async function handleEditPayment(e, modal) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const id = formData.get('payment-id');
    
    const payment = {
        importo: parseFloat(formData.get('importo')),
        dataPagamento: formData.get('data'),
        tipoPagamento: formData.get('paymentType'),
        atleta: {
            id: formData.get('athlete')
        }
    };

    try {
        await api.updatePayment(id, payment);
        showMessage('Pagamento aggiornato con successo!', 'success');
        removeModal(modal);
        await window.pagamentiPage.loadPaymentsData();
    } catch (error) {
        showMessage('Errore nell\'aggiornamento del pagamento', 'error');
        console.error('Error updating payment:', error);
    }
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
            .form-row {
                display: flex;
                gap: 15px;
            }
            .form-row .form-group {
                flex: 1;
            }
            .form-actions {
                display: flex;
                gap: 10px;
                justify-content: flex-end;
                margin-top: 20px;
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

// Initialize payments page
document.addEventListener('DOMContentLoaded', () => {
    window.pagamentiPage = new PagamentiPage();
});
