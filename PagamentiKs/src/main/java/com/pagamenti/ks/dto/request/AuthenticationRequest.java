package com.pagamenti.ks.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class AuthenticationRequest {
    
    @NotBlank(message = "L'email è obbligatoria")
    @Email(message = "Inserire un indirizzo email valido")
    private String email;
    
    @NotBlank(message = "La password è obbligatoria")
    @Size(min = 8, message = "La password deve contenere almeno 8 caratteri")
    private String password;

    // Constructors
    public AuthenticationRequest() {}

    public AuthenticationRequest(String email, String password) {
        this.email = email;
        this.password = password;
    }

    // Getters and Setters
    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
