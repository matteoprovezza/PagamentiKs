# Sistema di Autenticazione - KARATE SAN

## Implementazione completata

Ho implementato un sistema completo di autenticazione per l'applicazione KARATE SAN che protegge tutti gli endpoint API e richiede il login per accedere alle funzionalità del sistema.

## Componenti implementati

### Backend (Java/Spring Boot)
- **Entity User**: Gestisce gli utenti nel database
- **UserRepository**: Repository per l'accesso ai dati degli utenti
- **AuthenticationService**: Servizio per la gestione dell'autenticazione
- **JwtService**: Servizio per la gestione dei token JWT
- **AuthenticationController**: Endpoint REST per il login
- **JwtAuthenticationFilter**: Filtro per la validazione dei token JWT
- **UserDetailsServiceImpl**: Implementazione di Spring Security UserDetailsService
- **SecurityConfig**: Configurazione di Spring Security con protezione endpoint

### Frontend (HTML/JavaScript)
- **Pagina di login**: `login.html` con interfaccia moderna e responsive
- **AuthManager**: Classe JavaScript per la gestione dell'autenticazione
- **API Client aggiornato**: Inclusione automatica dei token JWT nelle chiamate API
- **Pulsanti di logout**: In tutte le pagine protette
- **Redirect automatico**: Reindirizzamento al login se non autenticati

### Database
- **Tabella _user**: Tabella per gli utenti con campi:
  - id (auto-increment)
  - first_name
  - last_name  
  - email (unique)
  - password (hashata con BCrypt)
  - role (enum ADMIN)
  - timestamps

## Setup del Database

1. Eseguire lo script SQL `create_users_table.sql` per creare la tabella utenti
2. Lo script inserisce automaticamente un utente admin di default:
   - **Email**: admin@karatesan.it
   - **Password**: admin123

## Configurazione

### Proprietà JWT (application.properties)
```properties
jwt.secret=mySecretKey
jwt.expiration=86400000  # 24 ore
jwt.refresh-expiration=604800000  # 7 giorni
```

## Endpoint API

### Pubblici
- `POST /api/v1/auth/login` - Login utente
- `GET /login.html` - Pagina di login
- File statici frontend

### Protetti (richiedono autenticazione)
- Tutti gli endpoint `/api/v1/atleti/*`
- Tutti gli endpoint `/api/v1/pagamenti/*`
- Tutti gli endpoint `/api/v1/reports/*`
- Tutti gli endpoint `/api/v1/users/*`

## Flusso di Autenticazione

1. **Login**: Utente inserisce email e password
2. **Validazione**: Backend verifica le credenziali
3. **Token JWT**: Viene generato un token JWT con scadenza 24 ore
4. **Storage**: Token salvato nel localStorage del browser
5. **API Calls**: Token incluso nell'header Authorization per tutte le chiamate API
6. **Auto-logout**: Se il token scade, utente reindirizzato al login

## Sicurezza

- Password hashate con BCrypt
- Token JWT con firma HMAC-SHA256
- Protezione CSRF disabilitata per API stateless
- Configurazione CORS per frontend locale
- Auto-redirect al login per sessioni scadute

## Utilizzo

1. Avviare il backend Spring Boot
2. Accedere a `http://localhost:8080/login.html`
3. Inserire le credenziali:
   - Email: admin@karatesan.it
   - Password: admin123
4. Dopo il login, verrà reindirizzati alla dashboard
5. Tutte le chiamate API includeranno automaticamente il token di autenticazione

## Gestione Utenti

Per aggiungere nuovi utenti:

1. **Via Database**: Inserire direttamente nella tabella _user
2. **Hash Password**: Usare BCrypt per hashare le password
3. **Ruolo**: Attualmente solo ruolo ADMIN disponibile

## Estensioni Future

- Sistema di registrazione utenti
- Ruoli multipli (ADMIN, USER, VIEWER)
- Refresh token automatico
- Recupero password
- Autenticazione a due fattori

## Troubleshooting

### Problemi comuni:
1. **401 Unauthorized**: Token scaduto o non valido
2. **403 Forbidden**: Utente non autorizzato per l'endpoint
3. **Database connection**: Verificare che lo script SQL sia stato eseguito
4. **CORS issues**: Verificare configurazione in SecurityConfig

### Log di debug:
- Abilitare log DEBUG per Spring Security
- Controllare console browser per errori JavaScript
- Verificare Network tab per chiamate API fallite
