-- Inserimento utente admin di default (password: admin123)
-- La password è hashata con BCrypt (il valore corrisponde a "admin123")
INSERT INTO _user (firstname, lastname, email, password, role) 
VALUES ('Admin', 'User', 'admin@karatesan.it', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ADMIN')
ON CONFLICT (email) DO NOTHING;
