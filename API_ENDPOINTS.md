# PagamentiKs API Endpoints

## Base URL
```
http://localhost:8080/api/v1
```

## Authentication Endpoints (`/api/v1/auth`)

### POST `/api/v1/auth/register`
- **Description**: Register a new user
- **Request Body**: RegisterRequest
- **Response**: AuthenticationResponse

### POST `/api/v1/auth/authenticate`
- **Description**: Authenticate user and get JWT token
- **Request Body**: AuthenticationRequest
- **Response**: AuthenticationResponse

---

## Athletes Endpoints (`/api/v1/atleti`)

### GET `/api/v1/atleti`
- **Description**: Get all athletes or search by name
- **Query Parameters**: `search` (optional) - Search term for name
- **Response**: List<Atleta>

### GET `/api/v1/atleti/{id}`
- **Description**: Get athlete by ID
- **Path Variables**: `id` - Athlete ID
- **Response**: Atleta

### GET `/api/v1/atleti/active`
- **Description**: Get all active athletes
- **Response**: List<Atleta>

### GET `/api/v1/atleti/expiring-certificates`
- **Description**: Get athletes with certificates expiring in next X days
- **Query Parameters**: `days` (default: 30) - Number of days before expiration
- **Response**: List<Atleta>

### POST `/api/v1/atleti`
- **Description**: Create a new athlete
- **Request Body**: Atleta
- **Response**: Atleta

### PUT `/api/v1/atleti/{id}`
- **Description**: Update an existing athlete
- **Path Variables**: `id` - Athlete ID
- **Request Body**: Atleta
- **Response**: Atleta

### PUT `/api/v1/atleti/{id}/disable`
- **Description**: Disable an athlete
- **Path Variables**: `id` - Athlete ID
- **Response**: Atleta

### PUT `/api/v1/atleti/{id}/enable`
- **Description**: Enable an athlete
- **Path Variables**: `id` - Athlete ID
- **Response**: Atleta

### DELETE `/api/v1/atleti/{id}`
- **Description**: Delete an athlete
- **Path Variables**: `id` - Athlete ID
- **Response**: 204 No Content

---

## Payments Endpoints (`/api/v1/pagamenti`)

### GET `/api/v1/pagamenti`
- **Description**: Get all payments
- **Response**: List<Pagamento>

### GET `/api/v1/pagamenti/{id}`
- **Description**: Get payment by ID
- **Path Variables**: `id` - Payment ID
- **Response**: Pagamento

### GET `/api/v1/pagamenti/atleta/{atletaId}`
- **Description**: Get all payments for a specific athlete
- **Path Variables**: `atletaId` - Athlete ID
- **Response**: List<Pagamento>

### GET `/api/v1/pagamenti/date-range`
- **Description**: Get payments within a date range
- **Query Parameters**: 
  - `startDate` - Start date (Date)
  - `endDate` - End date (Date)
- **Response**: List<Pagamento>

### GET `/api/v1/pagamenti/method/{method}`
- **Description**: Get payments by payment method
- **Path Variables**: `method` - Payment method
- **Response**: List<Pagamento>

### GET `/api/v1/pagamenti/recent`
- **Description**: Get recent payments (last X days)
- **Query Parameters**: `days` (default: 7) - Number of days
- **Response**: List<Pagamento>

### POST `/api/v1/pagamenti`
- **Description**: Create a new payment
- **Request Body**: Pagamento
- **Response**: Pagamento

### POST `/api/v1/pagamenti/atleta/{atletaId}`
- **Description**: Create a new payment for a specific athlete
- **Path Variables**: `atletaId` - Athlete ID
- **Request Body**: Pagamento
- **Response**: Pagamento

### PUT `/api/v1/pagamenti/{id}`
- **Description**: Update an existing payment
- **Path Variables**: `id` - Payment ID
- **Request Body**: Pagamento
- **Response**: Pagamento

### DELETE `/api/v1/pagamenti/{id}`
- **Description**: Delete a payment
- **Path Variables**: `id` - Payment ID
- **Response**: 204 No Content

### GET `/api/v1/pagamenti/atleta/{atletaId}/total`
- **Description**: Get total payments amount for a specific athlete
- **Path Variables**: `atletaId` - Athlete ID
- **Response**: BigDecimal

### GET `/api/v1/pagamenti/total`
- **Description**: Get total payments amount within a date range
- **Query Parameters**: 
  - `startDate` - Start date (Date)
  - `endDate` - End date (Date)
- **Response**: BigDecimal

### GET `/api/v1/pagamenti/atleta/{atletaId}/ricevuta`
- **Description**: Generate PDF receipt for athlete's latest payment
- **Path Variables**: `atletaId` - Athlete ID
- **Response**: PDF file (application/pdf)

---

## Users Endpoints (`/api/v1/users`)

### GET `/api/v1/users`
- **Description**: Get all users
- **Response**: List<User>

### GET `/api/v1/users/{id}`
- **Description**: Get user by ID
- **Path Variables**: `id` - User ID
- **Response**: User

### GET `/api/v1/users/email/{email}`
- **Description**: Get user by email
- **Path Variables**: `email` - User email
- **Response**: User

### GET `/api/v1/users/role/{role}`
- **Description**: Get users by role
- **Path Variables**: `role` - User role (USER, ADMIN, MANAGER)
- **Response**: List<User>

### POST `/api/v1/users`
- **Description**: Create a new user
- **Request Body**: User
- **Response**: User

### PUT `/api/v1/users/{id}`
- **Description**: Update an existing user
- **Path Variables**: `id` - User ID
- **Request Body**: User
- **Response**: User

### PUT `/api/v1/users/{id}/role`
- **Description**: Change user role
- **Path Variables**: `id` - User ID
- **Query Parameters**: `newRole` - New role (USER, ADMIN, MANAGER)
- **Response**: User

### PUT `/api/v1/users/{id}/password`
- **Description**: Update user password
- **Path Variables**: `id` - User ID
- **Query Parameters**: `newPassword` - New password
- **Response**: User

### DELETE `/api/v1/users/{id}`
- **Description**: Delete a user
- **Path Variables**: `id` - User ID
- **Response**: 204 No Content

### GET `/api/v1/users/exists/email/{email}`
- **Description**: Check if email exists
- **Path Variables**: `email` - Email to check
- **Response**: Boolean

---

## Reports Endpoints (`/api/v1/reports`)

### GET `/api/v1/reports/dashboard`
- **Description**: Get dashboard statistics
- **Response**: Dashboard stats (total athletes, active athletes, recent payments, etc.)

### GET `/api/v1/reports/revenue/monthly/{year}`
- **Description**: Get monthly revenue for a specific year
- **Path Variables**: `year` - Year
- **Response**: Monthly revenue data

### GET `/api/v1/reports/athletes/stats`
- **Description**: Get athlete statistics
- **Response**: Athlete statistics (total, active/inactive, registration by year)

### GET `/api/v1/reports/athletes/top-payers`
- **Description**: Get top paying athletes
- **Query Parameters**: `limit` (default: 10) - Number of top athletes to return
- **Response**: List of athletes with total payments

### GET `/api/v1/reports/payments/method-stats`
- **Description**: Get payment method statistics
- **Response**: Payment method statistics (counts and totals by method)

---

## Swagger/OpenAPI Documentation

The API includes Swagger/OpenAPI documentation available at:
```
http://localhost:8080/swagger-ui.html
```

---

## Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

---

## Error Responses

- **400 Bad Request**: Invalid request data
- **401 Unauthorized**: Authentication required or invalid token
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Server error

---

## Data Formats

### Atleta
```json
{
  "id": 1,
  "nome": "Mario",
  "cognome": "Rossi",
  "cf": "RSSMRA85A01H501Z",
  "dataNascita": "1985-01-01",
  "indirizzo": "Via Roma 1",
  "telefono": "3331234567",
  "email": "mario.rossi@email.com",
  "dataIscrizione": "2023-01-01",
  "dataScadenzaCertificato": "2024-12-31",
  "attivo": true,
  "note": "Note sull'atleta",
  "disableDate": null
}
```

### Pagamento
```json
{
  "id": 1,
  "importo": 150.50,
  "data": "2023-12-01",
  "metodoPagamento": "Carta di credito",
  "atleta": {
    "id": 1,
    "nome": "Mario",
    "cognome": "Rossi"
  }
}
```

### User
```json
{
  "id": 1,
  "firstName": "Admin",
  "lastName": "User",
  "email": "admin@example.com",
  "role": "ADMIN"
}
```
