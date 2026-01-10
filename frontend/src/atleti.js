// Athletes management functionality
class AthletiPage {
    constructor() {
        this.athletes = [];
        this.init();
    }

    async init() {
        console.log('AthletiPage init started');

        // Check if we have an ID parameter to show athlete details
        const urlParams = new URLSearchParams(window.location.search);
        const athleteId = urlParams.get('id');

        console.log('URL athleteId:', athleteId);

        if (athleteId) {
            console.log('Loading athlete profile for ID:', athleteId);
            await this.showAthleteProfile(athleteId);
        } else {
            console.log('Loading athletes list');
            await this.loadAthletes();
        }
        this.bindEvents();
        console.log('AthletiPage init completed');
    }

    bindEvents() {
        const searchInput = document.getElementById('athlete-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.filterAthletes(e.target.value));
        }

        const statusFilter = document.getElementById('status-filter');
        if (statusFilter) {
            statusFilter.addEventListener('change', () => this.filterAthletes());
        }
    }

    async loadAthletes() {
        try {
            console.log('Loading athletes from API...');
            this.athletes = await api.getAthletes();
            console.log('Athletes loaded:', this.athletes.length, this.athletes);
            this.updateAthletesTable();
        } catch (error) {
            console.error('Error loading athletes:', error);
            showMessage('Errore nel caricamento degli atleti', 'error');

            // Show empty state when backend is unavailable
            this.athletes = [];
            this.updateAthletesTable();
        }
    }

    updateAthletesTable() {
        const tableBody = document.getElementById('athletes-table-body');
        if (!tableBody) return;

        tableBody.innerHTML = '';

        this.athletes.forEach(athlete => {
            const row = document.createElement('tr');

            row.innerHTML = `
                <td>${athlete.nome}</td>
                <td>${athlete.cognome}</td>
                <td>${athlete.email || '-'}</td>
                <td>${athlete.telefono || '-'}</td>
                <td>${athlete.dataIscrizione ? formatDate(athlete.dataIscrizione) : 'N/D'}</td>
                <td>
                    <span class="status-badge ${athlete.attivo ? 'active' : 'inactive'}">
                        ${athlete.attivo ? 'Attivo' : 'Disattivato'}
                    </span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-primary" onclick="editAthlete(${athlete.id})">
                            Modifica
                        </button>
                        <button class="btn btn-sm ${athlete.attivo ? 'btn-warning' : 'btn-success'}" 
                                onclick="toggleAthleteStatus(${athlete.id})">
                            ${athlete.attivo ? 'Disattiva' : 'Attiva'}
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="deleteAthlete(${athlete.id})">
                            Elimina
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

    async showAthleteProfile(athleteId) {
        console.log('showAthleteProfile called with ID:', athleteId);
        try {
            // Show the profile section and hide the list
            const profileSection = document.getElementById('athlete-profile');
            const listSection = document.getElementById('athlete-list');

            console.log('Profile section:', profileSection);
            console.log('List section:', listSection);

            if (profileSection) profileSection.style.display = 'block';
            if (listSection) listSection.style.display = 'none';

            // Load athlete details
            console.log('Calling api.getAthleteById...');
            const athlete = await api.getAthleteById(athleteId);
            console.log('Athlete data received:', athlete);

            this.renderAthleteProfile(athlete);

        } catch (error) {
            console.error('Error loading athlete profile:', error);
            showMessage('Errore nel caricamento dei dettagli dell\'atleta', 'error');
        }
    }

    renderAthleteProfile(athlete) {
        const detailsContainer = document.getElementById('athlete-details');
        const profileTitle = document.getElementById('profile-title');

        if (!detailsContainer || !profileTitle) return;

        profileTitle.textContent = `Profilo Atleta: ${athlete.nome} ${athlete.cognome}`;

        // Calculate certificate expiry status
        let certificateStatus = '';
        let certificateClass = '';
        if (athlete.dataScadenzaCertificato) {
            const parts = String(athlete.dataScadenzaCertificato).split('-');
            const expiryDate = parts.length === 3
                ? new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]))
                : new Date(athlete.dataScadenzaCertificato);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const timeDiff = expiryDate.getTime() - today.getTime();
            const daysToExpiry = Math.ceil(timeDiff / (1000 * 3600 * 24));

            if (daysToExpiry < 0) {
                certificateStatus = `Scaduto da ${Math.abs(daysToExpiry)} giorni`;
                certificateClass = 'danger';
            } else if (daysToExpiry === 0) {
                certificateStatus = 'Scade oggi';
                certificateClass = 'danger';
            } else if (daysToExpiry <= 30) {
                certificateStatus = `Scade tra ${daysToExpiry} giorni`;
                certificateClass = daysToExpiry <= 7 ? 'danger' : 'warning';
            } else {
                certificateStatus = `Valido (${daysToExpiry} giorni rimanenti)`;
                certificateClass = 'success';
            }
        } else {
            certificateStatus = 'Non disponibile';
            certificateClass = 'warning';
        }

        detailsContainer.innerHTML = `
            <div class="athlete-profile-grid">
                <div class="profile-section">
                    <h3>Dati Personali</h3>
                    <div class="profile-field">
                        <label>Nome Completo:</label>
                        <span>${athlete.nome} ${athlete.cognome}</span>
                    </div>
                    <div class="profile-field">
                        <label>Codice Fiscale:</label>
                        <span>${athlete.cf || 'Non specificato'}</span>
                    </div>
                    <div class="profile-field">
                        <label>Data di Nascita:</label>
                        <span>${athlete.dataNascita ? formatDate(athlete.dataNascita) : 'Non specificata'}</span>
                    </div>
                    <div class="profile-field">
                        <label>Indirizzo:</label>
                        <span>${athlete.indirizzo || 'Non specificato'}</span>
                    </div>
                </div>
                
                <div class="profile-section">
                    <h3>Contatti</h3>
                    <div class="profile-field">
                        <label>Telefono:</label>
                        <span>${athlete.telefono || 'Non specificato'}</span>
                    </div>
                    <div class="profile-field">
                        <label>Email:</label>
                        <span>${athlete.email || 'Non specificata'}</span>
                    </div>
                </div>
                
                <div class="profile-section">
                    <h3>Dati Iscrizione</h3>
                    <div class="profile-field">
                        <label>Data Iscrizione:</label>
                        <span>${athlete.dataIscrizione ? formatDate(athlete.dataIscrizione) : 'Non specificata'}</span>
                    </div>
                    <div class="profile-field">
                        <label>Stato:</label>
                        <span class="status-badge ${athlete.attivo ? 'active' : 'inactive'}">
                            ${athlete.attivo ? 'Attivo' : 'Disattivato'}
                        </span>
                    </div>
                </div>
                
                <div class="profile-section">
                    <h3>Certificato Medico</h3>
                    <div class="profile-field">
                        <label>Stato Certificato:</label>
                        <span class="certificate-status ${certificateClass}">
                            <i class="fas ${certificateClass === 'danger' ? 'fa-exclamation-circle' : certificateClass === 'warning' ? 'fa-calendar-alt' : 'fa-check-circle'}"></i>
                            ${certificateStatus}
                        </span>
                    </div>
                    <div class="profile-field">
                        <label>Data Scadenza:</label>
                        <span>${athlete.dataScadenzaCertificato ? formatDate(athlete.dataScadenzaCertificato) : 'Non specificata'}</span>
                    </div>
                </div>
                
                <div class="profile-section">
                    <h3>Tesseramento ASC</h3>
                    <div class="profile-field">
                        <label>Scadenza Tesseramento:</label>
                        <span>${athlete.scadenzaTesseramentoAsc ? formatDate(athlete.scadenzaTesseramentoAsc) : 'Non specificata'}</span>
                    </div>
                </div>
                
                ${athlete.note ? `
                <div class="profile-section full-width">
                    <h3>Note</h3>
                    <div class="profile-field">
                        <span>${athlete.note}</span>
                    </div>
                </div>
                ` : ''}
                
                <div class="profile-actions">
                    <button class="btn btn-primary" onclick="editAthlete(${athlete.id})">
                        <i class="fas fa-edit"></i> Modifica
                    </button>
                    <button class="btn ${athlete.attivo ? 'btn-warning' : 'btn-success'}" 
                            onclick="toggleAthleteStatus(${athlete.id})">
                        <i class="fas ${athlete.attivo ? 'fa-ban' : 'fa-check'}"></i>
                        ${athlete.attivo ? 'Disattiva' : 'Attiva'}
                    </button>
                    <button class="btn btn-danger" onclick="deleteAthlete(${athlete.id})">
                        <i class="fas fa-trash"></i> Elimina
                    </button>
                </div>
            </div>
        `;
    }

    filterAthletes() {
        const searchTerm = document.getElementById('athlete-search')?.value.toLowerCase() || '';
        const statusFilter = document.getElementById('status-filter')?.value || '';
        const rows = document.querySelectorAll('#athletes-table-body tr');

        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            const statusText = row.querySelector('.status-badge')?.textContent.toLowerCase() || '';

            const matchesSearch = text.includes(searchTerm);
            const matchesStatus = !statusFilter ||
                (statusFilter === 'active' && statusText.includes('attivo')) ||
                (statusFilter === 'inactive' && statusText.includes('disattivato'));

            row.style.display = matchesSearch && matchesStatus ? '' : 'none';
        });
    }
}

// Global functions for athlete management
window.hideAthleteProfile = function () {
    const profileSection = document.getElementById('athlete-profile');
    const listSection = document.getElementById('athlete-list');

    if (profileSection) profileSection.style.display = 'none';
    if (listSection) listSection.style.display = 'block';

    // Clear URL parameter
    const url = new URL(window.location);
    url.searchParams.delete('id');
    window.history.replaceState({}, '', url);
};

window.showAddAthleteModal = async function () {
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
                    <div class="form-row">
                        <div class="form-group">
                            <label for="nome">Nome*</label>
                            <input type="text" id="nome" name="nome" required>
                        </div>
                        <div class="form-group">
                            <label for="cognome">Cognome*</label>
                            <input type="text" id="cognome" name="cognome" required>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="cf">Codice Fiscale</label>
                        <input type="text" id="cf" name="cf">
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="dataNascita">Data di Nascita</label>
                            <input type="date" id="dataNascita" name="dataNascita">
                        </div>
                        <div class="form-group">
                            <label for="dataIscrizione">Data Iscrizione</label>
                            <input type="date" id="dataIscrizione" name="dataIscrizione">
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="indirizzo">Indirizzo</label>
                        <input type="text" id="indirizzo" name="indirizzo">
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="telefono">Telefono</label>
                            <input type="tel" id="telefono" name="telefono">
                        </div>
                        <div class="form-group">
                            <label for="email">Email</label>
                            <input type="email" id="email" name="email">
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="note">Note</label>
                        <textarea id="note" name="note" rows="3"></textarea>
                    </div>
                    <div class="form-group">
                        <label for="dataScadenzaCertificato">Data Scadenza Certificato Medico</label>
                        <input type="date" id="dataScadenzaCertificato" name="dataScadenzaCertificato">
                    </div>
                    <div class="form-group">
                        <label for="scadenzaTesseramentoAsc">Scadenza Tesseramento ASC</label>
                        <input type="date" id="scadenzaTesseramentoAsc" name="scadenzaTesseramentoAsc">
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
    addModalStyles();

    // Set default date for iscrizione
    document.getElementById('dataIscrizione').value = new Date().toISOString().split('T')[0];

    // Bind events
    modal.querySelector('.modal-close').addEventListener('click', () => removeModal(modal));
    modal.querySelector('.modal-cancel').addEventListener('click', () => removeModal(modal));
    modal.querySelector('#add-athlete-form').addEventListener('submit', (e) => handleAddAthlete(e, modal));
};

window.editAthlete = async function (id) {
    try {
        const athlete = await api.getAthleteById(id);

        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Modifica Atleta</h3>
                    <button type="button" class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="edit-athlete-form">
                        <input type="hidden" name="athlete-id" value="${athlete.id}">
                        <div class="form-row">
                            <div class="form-group">
                                <label for="nome">Nome*</label>
                                <input type="text" id="nome" name="nome" value="${athlete.nome || ''}" required>
                            </div>
                            <div class="form-group">
                                <label for="cognome">Cognome*</label>
                                <input type="text" id="cognome" name="cognome" value="${athlete.cognome || ''}" required>
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="cf">Codice Fiscale</label>
                            <input type="text" id="cf" name="cf" value="${athlete.cf || ''}">
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="dataNascita">Data di Nascita</label>
                                <input type="date" id="dataNascita" name="dataNascita" 
                                       value="${athlete.dataNascita || ''}">
                            </div>
                            <div class="form-group">
                                <label for="dataIscrizione">Data Iscrizione</label>
                                <input type="date" id="dataIscrizione" name="dataIscrizione" 
                                       value="${athlete.dataIscrizione || ''}">
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="indirizzo">Indirizzo</label>
                            <input type="text" id="indirizzo" name="indirizzo" value="${athlete.indirizzo || ''}">
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="telefono">Telefono</label>
                                <input type="tel" id="telefono" name="telefono" value="${athlete.telefono || ''}">
                            </div>
                            <div class="form-group">
                                <label for="email">Email</label>
                                <input type="email" id="email" name="email" value="${athlete.email || ''}">
                            </div>
                        </div>
                                                <div class="form-group">
                            <label for="dataScadenzaCertificato">Data Scadenza Certificato Medico</label>
                            <input type="date" id="dataScadenzaCertificato" name="dataScadenzaCertificato" 
                                   value="${athlete.dataScadenzaCertificato || ''}">
                        </div>
                        <div class="form-group">
                            <label for="scadenzaTesseramentoAsc">Scadenza Tesseramento ASC</label>
                            <input type="date" id="scadenzaTesseramentoAsc" name="scadenzaTesseramentoAsc" 
                                   value="${athlete.scadenzaTesseramentoAsc || ''}">
                        </div>
                        <div class="form-group">
                            <label for="note">Note</label>
                            <textarea id="note" name="note" rows="3">${athlete.note || ''}</textarea>
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

        // Bind events
        modal.querySelector('.modal-close').addEventListener('click', () => removeModal(modal));
        modal.querySelector('.modal-cancel').addEventListener('click', () => removeModal(modal));
        modal.querySelector('#edit-athlete-form').addEventListener('submit', (e) => handleEditAthlete(e, modal));

    } catch (error) {
        showMessage('Errore nel caricamento dell\'atleta', 'error');
        console.error('Error loading athlete:', error);
    }
};

window.toggleAthleteStatus = async function (id) {
    const athlete = window.atletiPage.athletes.find(a => a.id === id);
    if (!athlete) return;

    const action = athlete.attivo ? 'disattivare' : 'attivare';
    if (!confirm(`Sei sicuro di voler ${action} questo atleta?`)) {
        return;
    }

    try {
        if (athlete.attivo) {
            await api.disableAthlete(id);
            showMessage('Atleta disattivato con successo', 'success');
        } else {
            await api.enableAthlete(id);
            showMessage('Atleta attivato con successo', 'success');
        }

        await window.atletiPage.loadAthletes();
    } catch (error) {
        showMessage(`Errore nell'${action} dell'atleta`, 'error');
        console.error('Error toggling athlete status:', error);
    }
};

window.deleteAthlete = async function (id) {
    if (!confirm('Sei sicuro di voler eliminare questo atleta? Questa azione non è reversibile.')) {
        return;
    }

    try {
        await api.deleteAthlete(id);
        showMessage('Atleta eliminato con successo', 'success');
        await window.atletiPage.loadAthletes();
    } catch (error) {
        showMessage('Errore nell\'eliminazione dell\'atleta', 'error');
        console.error('Error deleting athlete:', error);
    }
};

async function handleAddAthlete(e, modal) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const athlete = {
        nome: formData.get('nome'),
        cognome: formData.get('cognome'),
        cf: formData.get('cf'),
        dataNascita: formData.get('dataNascita') || null,
        dataIscrizione: formData.get('dataIscrizione') || new Date().toISOString().split('T')[0],
        telefono: formData.get('telefono'),
        email: formData.get('email'),
        indirizzo: formData.get('indirizzo'),
        note: formData.get('note'),
        dataScadenzaCertificato: formData.get('dataScadenzaCertificato') || null,
        scadenzaTesseramentoAsc: formData.get('scadenzaTesseramentoAsc') || null,
        attivo: true
    };

    try {
        await api.createAthlete(athlete);
        showMessage('Atleta aggiunto con successo!', 'success');
        removeModal(modal);
        await window.atletiPage.loadAthletes();
    } catch (error) {
        showMessage('Errore nell\'aggiunta dell\'atleta', 'error');
        console.error('Error adding athlete:', error);
    }
}

async function handleEditAthlete(e, modal) {
    e.preventDefault();

    const form = e.target;
    const idInput = form.querySelector('input[name="athlete-id"]');
    if (!idInput || !idInput.value) {
        showMessage('ID atleta non valido', 'error');
        console.error('Invalid or missing athlete ID in form');
        return;
    }

    const id = idInput.value;
    const formData = new FormData(form);

    // Convert empty strings to null for optional fields
    const athlete = {
        nome: formData.get('nome') || null,
        cognome: formData.get('cognome') || null,
        cf: formData.get('cf') || null,
        dataNascita: formData.get('dataNascita') || null,
        dataIscrizione: formData.get('dataIscrizione') || null,
        telefono: formData.get('telefono') || null,
        email: formData.get('email') || null,
        indirizzo: formData.get('indirizzo') || null,
        note: formData.get('note') || null,
        dataScadenzaCertificato: formData.get('dataScadenzaCertificato') || null,
        scadenzaTesseramentoAsc: formData.get('scadenzaTesseramentoAsc') || null
    };

    // Validate required fields
    if (!athlete.nome || !athlete.cognome) {
        showMessage('Nome e cognome sono campi obbligatori', 'error');
        return;
    }

    try {
        const response = await api.updateAthlete(id, athlete);
        showMessage('Atleta aggiornato con successo!', 'success');
        removeModal(modal);
        await window.atletiPage.loadAthletes();
    } catch (error) {
        const errorMessage = error.data?.message || error.message || 'Errore nell\'aggiornamento dell\'atleta';
        showMessage(errorMessage, 'error');
        console.error('Error updating athlete:', {
            error: error.message,
            status: error.status,
            response: error.data,
            id,
            athleteData: athlete
        });
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

// Initialize athletes page
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded - initializing AthletiPage');
    try {
        window.atletiPage = new AthletiPage();
        console.log('AthletiPage initialized successfully');
    } catch (error) {
        console.error('Error initializing AthletiPage:', error);
    }
});
