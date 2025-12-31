# Karate Manager Frontend

Frontend HTML/CSS/JavaScript per l'applicazione Karate Manager che si connette al backend Spring Boot.

## Struttura del Progetto

```
frontend/
├── index.html          # Pagina principale
├── src/
│   ├── styles.css      # Foglio di stile completo
│   ├── api.js          # Client API per comunicare con il backend
│   └── app.js          # Logica principale dell'applicazione
└── README.md           # Questo file
```

## Funzionalità Implementate

### 1. Gestione Atleti
- Visualizzazione lista atleti con totale pagamenti annuali
- Aggiunta nuovo atleta (form modale)
- Modifica atleta (base)
- Eliminazione atleta con conferma
- Calcolo automatico totale pagamenti per atleta

### 2. Registrazione Pagamenti
- Form per registrazione nuovo pagamento
- Selezione atleta da dropdown
- Inserimento importo e data
- Generazione ricevuta PDF (simulata)
- Messaggi di feedback per utente

### 3. Resoconti Fiscali
- Download report annuale PDF (simulato)
- Statistiche dashboard
- Report mensili e analisi

### 4. Navigazione
- Sidebar con menu navigazione
- Stati attivi per sezione corrente
- Design responsive

## API Backend

Il frontend si connette al backend Spring Boot su `http://localhost:4000/api/v1`:

### Endpoint Atleti
- `GET /atleti` - Lista tutti gli atleti
- `GET /atleti/{id}` - Dettaglio atleta
- `POST /atleti` - Crea nuovo atleta
- `PUT /atleti/{id}` - Aggiorna atleta
- `DELETE /atleti/{id}` - Elimina atleta

### Endpoint Pagamenti
- `GET /pagamenti` - Lista pagamenti con filtri
- `POST /pagamenti` - Crea nuovo pagamento
- `POST /pagamenti/atleta/{id}` - Crea pagamento per atleta
- `GET /pagamenti/atleta/{id}/total` - Totale pagamenti atleta
- `GET /pagamenti/atleta/{id}/ricevuta` - Genera ricevuta PDF

### Endpoint Report
- `GET /reports/dashboard` - Statistiche dashboard
- `GET /reports/monthly-revenue/{year}` - Entrate mensili
- `GET /reports/athletes/stats` - Statistiche atleti

## Avvio del Progetto

1. **Avvia il backend Spring Boot** su porta 4000
2. **Apri `index.html`** nel browser (nessun server web richiesto)

## Configurazione

### URL Backend
Modifica `API_BASE_URL` in `src/api.js` se il backend è su un'altra porta o dominio:

```javascript
const API_BASE_URL = 'http://localhost:4000/api/v1';
```

### Funzionalità Chiave

#### Messaggi di Feedback
- Success (verde): operazioni completate
- Error (rosso): errori API
- Warning (arancione): avvisi
- Info (blu): informazioni

#### Gestione Errori
- Try-catch su tutte le chiamate API
- Messaggi user-friendly
- Console logging per debug

#### Formattazione Dati
- Currency formatter per Euro (it-IT)
- Date formatter per italiano
- Validazione form base

## Note Tecniche

- **Vanilla JavaScript** - Nessun framework required
- **Fetch API** - Per chiamate HTTP
- **CSS Grid/Flexbox** - Layout responsive
- **ES6+ Features** - Arrow functions, async/await, classes
- **CORS** - Backend deve permettere richieste dal frontend

## Prossimi Sviluppi

- [ ] Autenticazione utenti
- [ ] Grafici e visualizzazioni
- [ ] Export Excel/CSV
- [ ] Notifiche push
- [ ] PWA (Progressive Web App)

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+
