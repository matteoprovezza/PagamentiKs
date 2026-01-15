// Dashboard specific functionality
class DashboardPage {
    constructor() {
        this.athletes = [];
        this.payments = [];
        this.init();
    }

    async init() {
        await this.loadDashboardData();
    }

    async loadDashboardData() {
        console.log('Loading dashboard data...');
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
            
            // Load expiring certificates
            console.log('Fetching expiring certificates...');
            this.expiringCertificates = await api.getExpiringCertificates(30);
            console.log('Expiring certificates loaded:', this.expiringCertificates.length, this.expiringCertificates);
            
            // Load expiring memberships
            console.log('Fetching expiring memberships...');
            this.expiringMemberships = await api.getExpiringMemberships(30);
            console.log('Expiring memberships loaded:', this.expiringMemberships.length, this.expiringMemberships);
            
            // Load expiring FIJLKAM memberships
            console.log('Fetching expiring FIJLKAM memberships...');
            this.expiringFijlkamMemberships = await api.getExpiringFijlkamMemberships(30);
            console.log('Expiring FIJLKAM memberships loaded:', this.expiringFijlkamMemberships.length, this.expiringFijlkamMemberships);
            
            this.updateStats(stats);
            this.renderExpiringCertificates();
            this.renderExpiringMemberships();
            this.renderExpiringFijlkamMemberships();
            console.log('Dashboard updated successfully');
            
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            showMessage('Errore nel caricamento dei dati', 'error');
            
            // Show empty values when database is empty or API is unavailable
            console.log('Database empty or API unavailable - showing empty values...');
            document.getElementById('totalAthletes').textContent = '0';
            document.getElementById('revenue2025').textContent = '€ 0';
            document.getElementById('receiptsToGenerate').textContent = '0';
            
            // Show empty state for expiring items
            const certContainer = document.getElementById('expiringCertificates');
            const membContainer = document.getElementById('expiringMemberships');
            if (certContainer) {
                certContainer.innerHTML = `
                    <div class="no-certificates">
                        <i class="fas fa-calendar-check"></i>
                        <div>Nessun certificato in scadenza nei prossimi 30 giorni</div>
                    </div>`;
            }
            if (membContainer) {
                membContainer.innerHTML = `
                    <div class="no-certificates">
                        <i class="fas fa-id-card"></i>
                        <div>Nessun tesseramento in scadenza nei prossimi 30 giorni</div>
                    </div>`;
            }
        }
    }

    updateStats(stats) {
        const totalAthletesEl = document.getElementById('totalAthletes');
        const revenue2025El = document.getElementById('revenue2025');
        const revenue2026El = document.getElementById('revenue2026');
        const receiptsToGenerateEl = document.getElementById('receiptsToGenerate');

        if (totalAthletesEl) {
            const totalAthletes = this.athletes.filter(a => a.attivo).length;
            totalAthletesEl.textContent = totalAthletes;
        }

        if (revenue2025El) {
            const revenue2025 = this.payments
                .filter(p => new Date(p.data).getFullYear() === 2025)
                .reduce((sum, p) => sum + (p.importo || 0), 0);
            revenue2025El.textContent = `€ ${revenue2025.toLocaleString('it-IT', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
        }

        if (revenue2026El) {
            const revenue2026 = this.payments
                .filter(p => new Date(p.data).getFullYear() === 2026)
                .reduce((sum, p) => sum + (p.importo || 0), 0);
            revenue2026El.textContent = `€ ${revenue2026.toLocaleString('it-IT', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
        }

        if (receiptsToGenerateEl) {
            // Calculate receipts to generate (payments without receipts)
            const receiptsToGenerate = this.payments.filter(p => !p.ricevutaGenerata).length;
            receiptsToGenerateEl.textContent = receiptsToGenerate;
        }
    }

    renderExpiringCertificates() {
        console.log('renderExpiringCertificates called');
        
        const container = document.getElementById('expiringCertificates');
        
        // Only render expiring certificates if the container exists (main dashboard)
        if (!container) {
            console.log('Container #expiringCertificates not found - skipping expiring certificates render (this is normal on resoconti 730 page)');
            return;
        }
        
        console.log('Container found:', container);

        if (!this.expiringCertificates || this.expiringCertificates.length === 0) {
            console.log('No expiring certificates to display');
            container.innerHTML = `
                <div class="no-certificates">
                    <i class="fas fa-calendar-check"></i>
                    <div>Nessun certificato in scadenza nei prossimi 30 giorni</div>
                </div>`;
            return;
        }

        console.log('Rendering certificates:', this.expiringCertificates);
        
        // Sort by days to expiry (ascending)
        const sortedCertificates = [...this.expiringCertificates].sort((a, b) => 
            a.giorniAllaScadenza - b.giorniAllaScadenza
        );

        container.innerHTML = '';

        sortedCertificates.forEach((cert, index) => {
            console.log(`Processing certificate ${index}:`, cert);
            
            // Ensure we have a valid date
            const expiryDate = cert.dataScadenzaCertificato ? new Date(cert.dataScadenzaCertificato) : null;
            const formattedDate = expiryDate && !isNaN(expiryDate) 
                ? expiryDate.toLocaleDateString('it-IT', {
                    weekday: 'long',
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric'
                })
                : 'Data non disponibile';

            // Calculate days to expiry if not provided
            let daysToExpiry = cert.giorniAllaScadenza;
            if ((daysToExpiry === undefined || daysToExpiry === null) && expiryDate) {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const timeDiff = expiryDate.getTime() - today.getTime();
                daysToExpiry = Math.ceil(timeDiff / (1000 * 3600 * 24));
            }
            const expiryClass = daysToExpiry <= 7 ? 'danger' : 'warning';
            const expiryText = daysToExpiry === 0 ? 
                'Scade oggi' : 
                daysToExpiry === 1 ? 
                    'Scade domani' : 
                    `Scade tra ${daysToExpiry} giorni`;

            const certElement = document.createElement('li');
            certElement.className = 'certificate-item';
            certElement.innerHTML = `
                <div class="certificate-name" title="Vai ai dettagli di ${cert.nome} ${cert.cognome}">
                    <i class="fas fa-user"></i>
                    ${cert.nome} ${cert.cognome}
                    <span class="certificate-expiry ${expiryClass}" title="${formattedDate}">
                        <i class="fas ${expiryClass === 'danger' ? 'fa-exclamation-circle' : 'fa-calendar-alt'}"></i>
                        ${expiryText}
                    </span>
                </div>
            `;
            
            // Remove the whole card click handler to avoid conflicts
            // Only the athlete name will be clickable for the modal
            
            // Add click listener to athlete name div
            const certDiv = certElement.querySelector('.certificate-name');
            if (certDiv) {
                certDiv.style.cursor = 'pointer';
                certDiv.title = `Clicca per vedere l'anagrafica di ${cert.nome} ${cert.cognome}`;
                certDiv.addEventListener('click', async (e) => {
                    console.log('Certificate div clicked!', cert);
                    console.log('Event target:', e.target);
                    console.log('Current target:', e.currentTarget);
                    
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    
                    try {
                        // Show loading state
                        showMessage('Caricamento anagrafica...', 'info');
                        
                        // Call API to get athlete details
                        const athleteData = await api.getAthleteById(cert.id);
                        console.log('Athlete data retrieved:', athleteData);
                        
                        // Get athlete's payments to find the last one
                        const payments = await api.getPayments({ atletaId: cert.id });
                        console.log('Payments retrieved:', payments);
                        
                        // Find the most recent payment
                        const lastPayment = payments.length > 0 
                            ? payments.sort((a, b) => new Date(b.data) - new Date(a.data))[0]
                            : null;
                        
                        // Attach last payment info to athlete data
                        athleteData.ultimoPagamento = lastPayment ? lastPayment.data : null;
                        athleteData.importoUltimoPagamento = lastPayment ? lastPayment.importo : null;
                        
                        // Show athlete details in a modal or dedicated section
                        this.showAthleteDetails(athleteData);
                        
                    } catch (error) {
                        console.error('Error fetching athlete details:', error);
                        showMessage('Errore nel caricamento dell\'anagrafica', 'error');
                    }
                });
            } else {
                console.log('Certificate name div not found!');
            }
            
            container.appendChild(certElement);
            console.log(`Certificate ${index} added to container`);
        });
        
        console.log('All certificates rendered successfully');
    }

    renderExpiringMemberships() {
        console.log('renderExpiringMemberships called');
        
        const container = document.getElementById('expiringMemberships');
        console.log('Container #expiringMemberships found:', container);
        
        if (!container) {
            console.log('Container #expiringMemberships not found - skipping expiring memberships render');
            return;
        }
        
        console.log('Container found:', container);
        console.log('this.expiringMemberships:', this.expiringMemberships);

        if (!this.expiringMemberships || this.expiringMemberships.length === 0) {
            console.log('No expiring memberships to display');
            container.innerHTML = `
                <div class="no-certificates">
                    <i class="fas fa-id-card"></i>
                    <div>Nessun tesseramento in scadenza nei prossimi 30 giorni</div>
                </div>`;
            console.log('Set no memberships message');
            return;
        }

        console.log('Rendering memberships:', this.expiringMemberships);
        
        // Sort by days to expiry (ascending)
        const sortedMemberships = [...this.expiringMemberships].sort((a, b) => {
            const dateA = a.scadenzaTesseramentoAsc ? new Date(a.scadenzaTesseramentoAsc) : new Date();
            const dateB = b.scadenzaTesseramentoAsc ? new Date(b.scadenzaTesseramentoAsc) : new Date();
            return dateA - dateB;
        });

        container.innerHTML = '';
        console.log('Container cleared, adding memberships...');

        sortedMemberships.forEach((memb, index) => {
            console.log(`Processing membership ${index}:`, memb);
            
            // Ensure we have a valid date
            const expiryDate = memb.scadenzaTesseramentoAsc ? new Date(memb.scadenzaTesseramentoAsc) : null;
            const formattedDate = expiryDate && !isNaN(expiryDate) 
                ? expiryDate.toLocaleDateString('it-IT', {
                    weekday: 'long',
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric'
                })
                : 'Data non disponibile';

            // Calculate days to expiry
            let daysToExpiry;
            if (expiryDate) {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const timeDiff = expiryDate.getTime() - today.getTime();
                daysToExpiry = Math.ceil(timeDiff / (1000 * 3600 * 24));
            } else {
                daysToExpiry = 0;
            }
            
            const expiryClass = daysToExpiry <= 7 ? 'danger' : 'warning';
            const expiryText = daysToExpiry === 0 ? 
                'Scade oggi' : 
                daysToExpiry === 1 ? 
                    'Scade domani' : 
                    `Scade tra ${daysToExpiry} giorni`;

            const membElement = document.createElement('li');
            membElement.className = 'certificate-item';
            membElement.innerHTML = `
                <div class="certificate-name" title="Vai ai dettagli di ${memb.nome} ${memb.cognome}">
                    <i class="fas fa-id-card"></i>
                    ${memb.nome} ${memb.cognome}
                    <span class="certificate-expiry ${expiryClass}" title="${formattedDate}">
                        <i class="fas ${expiryClass === 'danger' ? 'fa-exclamation-circle' : 'fa-calendar-alt'}"></i>
                        ${expiryText}
                    </span>
                </div>
            `;
            
            // Remove the whole card click handler to avoid conflicts
            // Only the athlete name will be clickable for the modal
            
            // Add click listener to athlete name div
            const membDiv = membElement.querySelector('.certificate-name');
            if (membDiv) {
                membDiv.style.cursor = 'pointer';
                membDiv.title = `Clicca per vedere l'anagrafica di ${memb.nome} ${memb.cognome}`;
                membDiv.addEventListener('click', async (e) => {
                    console.log('Membership div clicked!', memb);
                    console.log('Event target:', e.target);
                    console.log('Current target:', e.currentTarget);
                    
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    
                    try {
                        // Show loading state
                        showMessage('Caricamento anagrafica...', 'info');
                        
                        // Call API to get athlete details
                        const athleteData = await api.getAthleteById(memb.id);
                        console.log('Athlete data retrieved:', athleteData);
                        
                        // Get athlete's payments to find the last one
                        const payments = await api.getPayments({ atletaId: memb.id });
                        console.log('Payments retrieved:', payments);
                        
                        // Find the most recent payment
                        const lastPayment = payments.length > 0 
                            ? payments.sort((a, b) => new Date(b.data) - new Date(a.data))[0]
                            : null;
                        
                        // Attach last payment info to athlete data
                        athleteData.ultimoPagamento = lastPayment ? lastPayment.data : null;
                        athleteData.importoUltimoPagamento = lastPayment ? lastPayment.importo : null;
                        
                        // Show athlete details in a modal or dedicated section
                        this.showAthleteDetails(athleteData);
                        
                    } catch (error) {
                        console.error('Error fetching athlete details:', error);
                        showMessage('Errore nel caricamento dell\'anagrafica', 'error');
                    }
                });
            } else {
                console.log('Membership name div not found!');
            }
            
            container.appendChild(membElement);
            console.log(`Membership ${index} added to container`);
        });
        
        console.log('All memberships rendered successfully');
        console.log('Container HTML after rendering:', container.innerHTML);
    }

    renderExpiringFijlkamMemberships() {
        console.log('renderExpiringFijlkamMemberships called');
        
        const container = document.getElementById('expiringFijlkamMemberships');
        console.log('Container #expiringFijlkamMemberships found:', container);
        
        if (!container) {
            console.log('Container #expiringFijlkamMemberships not found - skipping expiring FIJLKAM memberships render');
            return;
        }
        
        console.log('Container found:', container);
        console.log('this.expiringFijlkamMemberships:', this.expiringFijlkamMemberships);

        if (!this.expiringFijlkamMemberships || this.expiringFijlkamMemberships.length === 0) {
            console.log('No expiring FIJLKAM memberships to display');
            container.innerHTML = `
                <div class="no-certificates">
                    <i class="fas fa-id-card"></i>
                    <div>Nessun tesseramento FIJLKAM in scadenza nei prossimi 30 giorni</div>
                </div>`;
            console.log('Set no FIJLKAM memberships message');
            return;
        }

        console.log('Rendering FIJLKAM memberships:', this.expiringFijlkamMemberships);
        
        // Sort by days to expiry (ascending)
        const sortedMemberships = [...this.expiringFijlkamMemberships].sort((a, b) => {
            const dateA = a.scadenzaTesseramentoFijlkam ? new Date(a.scadenzaTesseramentoFijlkam) : new Date();
            const dateB = b.scadenzaTesseramentoFijlkam ? new Date(b.scadenzaTesseramentoFijlkam) : new Date();
            return dateA - dateB;
        });

        container.innerHTML = '';
        console.log('Container cleared, adding FIJLKAM memberships...');

        sortedMemberships.forEach((memb, index) => {
            console.log(`Processing FIJLKAM membership ${index}:`, memb);
            
            // Ensure we have a valid date
            const expiryDate = memb.scadenzaTesseramentoFijlkam ? new Date(memb.scadenzaTesseramentoFijlkam) : null;
            const formattedDate = expiryDate && !isNaN(expiryDate) 
                ? expiryDate.toLocaleDateString('it-IT', {
                    weekday: 'long',
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric'
                })
                : 'Data non disponibile';

            // Calculate days to expiry
            let daysToExpiry;
            if (expiryDate) {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const timeDiff = expiryDate.getTime() - today.getTime();
                daysToExpiry = Math.ceil(timeDiff / (1000 * 3600 * 24));
            } else {
                daysToExpiry = 0;
            }
            
            const expiryClass = daysToExpiry <= 7 ? 'danger' : 'warning';
            const expiryText = daysToExpiry === 0 ? 
                'Scade oggi' : 
                daysToExpiry === 1 ? 
                    'Scade domani' : 
                    `Scade tra ${daysToExpiry} giorni`;

            const membElement = document.createElement('li');
            membElement.className = 'certificate-item';
            membElement.innerHTML = `
                <div class="certificate-name" title="Vai ai dettagli di ${memb.nome} ${memb.cognome}">
                    <i class="fas fa-id-card"></i>
                    ${memb.nome} ${memb.cognome}
                    <span class="certificate-expiry ${expiryClass}" title="${formattedDate}">
                        <i class="fas ${expiryClass === 'danger' ? 'fa-exclamation-circle' : 'fa-calendar-alt'}"></i>
                        ${expiryText}
                    </span>
                </div>
            `;
            
            // Add click listener to athlete name div
            const membDiv = membElement.querySelector('.certificate-name');
            if (membDiv) {
                membDiv.style.cursor = 'pointer';
                membDiv.title = `Clicca per vedere l'anagrafica di ${memb.nome} ${memb.cognome}`;
                membDiv.addEventListener('click', async (e) => {
                    console.log('FIJLKAM membership div clicked!', memb);
                    console.log('Event target:', e.target);
                    console.log('Current target:', e.currentTarget);
                    
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    
                    try {
                        // Show loading state
                        showMessage('Caricamento anagrafica...', 'info');
                        
                        // Call API to get athlete details
                        const athleteData = await api.getAthleteById(memb.id);
                        console.log('Athlete data retrieved:', athleteData);
                        
                        // Get athlete's payments to find last one
                        const payments = await api.getPayments({ atletaId: memb.id });
                        console.log('Payments retrieved:', payments);
                        
                        // Find most recent payment
                        const lastPayment = payments.length > 0 
                            ? payments.sort((a, b) => new Date(b.data) - new Date(a.data))[0]
                            : null;
                        
                        // Attach last payment info to athlete data
                        athleteData.ultimoPagamento = lastPayment ? lastPayment.data : null;
                        athleteData.importoUltimoPagamento = lastPayment ? lastPayment.importo : null;
                        
                        // Show athlete details in a modal or dedicated section
                        this.showAthleteDetails(athleteData);
                        
                    } catch (error) {
                        console.error('Error fetching athlete details:', error);
                        showMessage('Errore nel caricamento dell\'anagrafica', 'error');
                    }
                });
            } else {
                console.log('FIJLKAM membership name div not found!');
            }
            
            container.appendChild(membElement);
            console.log(`FIJLKAM membership ${index} added to container`);
        });
        
        console.log('All FIJLKAM memberships rendered successfully');
        console.log('Container HTML after rendering:', container.innerHTML);
    }

    showAthleteDetails(athlete) {
        // Create modal overlay
        const modalOverlay = document.createElement('div');
        modalOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            z-index: 1000;
            display: flex;
            justify-content: center;
            align-items: center;
        `;

        // Create modal content
        const modalContent = document.createElement('div');
        modalContent.className = 'athlete-modal';
        modalContent.style.cssText = `
            background: var(--bg-secondary);
            color: var(--text-primary);
            padding: 30px;
            border-radius: 12px;
            max-width: 600px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
            border: 1px solid var(--border-color);
        `;

        // Format date function
        const formatDate = (dateString) => {
            if (!dateString) return 'Non disponibile';
            return new Date(dateString).toLocaleDateString('it-IT');
        };

        modalContent.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h2 class="modal-title">
                    <i class="fas fa-user" style="margin-right: 10px; color: #3b82f6;"></i>
                    Anagrafica Atleta
                </h2>
                <button id="closeModal" class="modal-close-btn">&times;</button>
            </div>
            
            <div class="modal-grid">
                <div class="modal-section">
                    <h3 class="section-title">Dati Personali</h3>
                    <div class="section-grid">
                        <div><strong>Nome:</strong> ${athlete.nome || 'N/D'}</div>
                        <div><strong>Cognome:</strong> ${athlete.cognome || 'N/D'}</div>
                        <div><strong>Codice Fiscale:</strong> ${athlete.cf || athlete.codiceFiscale || 'N/D'}</div>
                        <div><strong>Data Nascita:</strong> ${formatDate(athlete.dataNascita)}</div>
                    </div>
                </div>
                
                <div class="modal-section">
                    <h3 class="section-title">Contatti</h3>
                    <div class="section-grid">
                        <div><strong>Email:</strong> ${athlete.email || 'N/D'}</div>
                        <div><strong>Telefono:</strong> ${athlete.telefono || 'N/D'}</div>
                        <div><strong>Indirizzo:</strong> ${athlete.indirizzo || 'N/D'}</div>
                    </div>
                </div>
                
                <div class="modal-section">
                    <h3 class="section-title">Dati Sportivi</h3>
                    <div class="section-grid">
                        <div><strong>Data Iscrizione:</strong> ${formatDate(athlete.dataIscrizione)}</div>
                        <div><strong>Stato:</strong> 
                            <span style="
                                padding: 2px 8px;
                                border-radius: 12px;
                                font-size: 12px;
                                font-weight: 500;
                                background: ${athlete.attivo ? '#dcfce7' : '#fee2e2'};
                                color: ${athlete.attivo ? '#166534' : '#991b1b'};
                            ">
                                ${athlete.attivo ? 'Attivo' : 'Non attivo'}
                            </span>
                        </div>
                        <div><strong>Certificato Medico:</strong> ${formatDate(athlete.dataScadenzaCertificato)}</div>
                        <div><strong>Scadenza Tesseramento ASC:</strong> ${formatDate(athlete.scadenzaTesseramentoAsc)}</div>
                        <div><strong>Scadenza Tesseramento FIJLKAM:</strong> ${formatDate(athlete.scadenzaTesseramentoFijlkam)}</div>
                        <div><strong>Ultimo Pagamento:</strong> ${athlete.ultimoPagamento ? `${formatDate(athlete.ultimoPagamento)} (€${(athlete.importoUltimoPagamento || 0).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})` : 'Nessun pagamento'}</div>
                    </div>
                </div>
                
                <div style="background: #f9fafb; padding: 15px; border-radius: 8px;">
                    <h3 style="margin: 0 0 10px 0; color: #374151; font-size: 16px;">Note</h3>
                    <div style="font-size: 14px; color: #6b7280;">
                        ${athlete.note || 'Nessuna nota disponibile'}
                    </div>
                </div>
            </div>
        `;

        modalOverlay.appendChild(modalContent);
        document.body.appendChild(modalOverlay);

        // Add close functionality
        const closeBtn = modalContent.querySelector('#closeModal');
        closeBtn.addEventListener('click', () => {
            document.body.removeChild(modalOverlay);
        });

        // Close on overlay click
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                document.body.removeChild(modalOverlay);
            }
        });

        // Close on ESC key
        const handleEsc = (e) => {
            if (e.key === 'Escape') {
                document.body.removeChild(modalOverlay);
                document.removeEventListener('keydown', handleEsc);
            }
        };
        document.addEventListener('keydown', handleEsc);
    }

    async sendReminder(athleteId, athleteName, buttonElement = null) {
        // Disable button and show loading state
        if (buttonElement) {
            const originalHTML = buttonElement.innerHTML;
            buttonElement.disabled = true;
            buttonElement.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Invio in corso...';
            
            try {
                if (confirm(`Inviare un promemoria a ${athleteName} per il rinnovo del certificato medico?`)) {
                    // Here you would typically call an API endpoint to send the reminder
                    // await api.sendReminder(athleteId);
                    
                    // Simulate API call delay
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    
                    showMessage(`✅ Promemoria inviato a ${athleteName}`, 'success');
                    
                    // Update button to show success state
                    buttonElement.innerHTML = '<i class="fas fa-check"></i> Inviato';
                    buttonElement.style.backgroundColor = '#10b981';
                    buttonElement.style.borderColor = '#059669';
                    
                    // Re-enable after delay and reset state
                    setTimeout(() => {
                        buttonElement.disabled = false;
                        buttonElement.innerHTML = originalHTML;
                        buttonElement.style.backgroundColor = '';
                        buttonElement.style.borderColor = '';
                    }, 2000);
                } else {
                    buttonElement.disabled = false;
                    buttonElement.innerHTML = originalHTML;
                }
            } catch (error) {
                console.error('Error sending reminder:', error);
                showMessage('❌ Errore nell\'invio del promemoria', 'error');
                buttonElement.disabled = false;
                buttonElement.innerHTML = originalHTML;
            }
        } else {
            // Fallback if button element is not provided
            if (confirm(`Inviare un promemoria a ${athleteName} per il rinnovo del certificato medico?`)) {
                try {
                    // await api.sendReminder(athleteId);
                    showMessage(`✅ Promemoria inviato a ${athleteName}`, 'success');
                } catch (error) {
                    console.error('Error sending reminder:', error);
                    showMessage('❌ Errore nell\'invio del promemoria', 'error');
                }
            }
        }
    }
}

// Initialize dashboard page
document.addEventListener('DOMContentLoaded', () => {
    window.dashboardPage = new DashboardPage();
});
