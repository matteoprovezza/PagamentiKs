package com.pagamenti.ks.controller;

import com.pagamenti.ks.dto.ErrorResponse;
import com.pagamenti.ks.dto.request.AuthenticationRequest;
import com.pagamenti.ks.dto.request.RegisterRequest;
import com.pagamenti.ks.dto.response.AuthenticationResponse;
import com.pagamenti.ks.dto.response.RegistrationResponse;
import com.pagamenti.ks.entity.User;
import com.pagamenti.ks.service.AuthenticationService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:5500", "http://127.0.0.1:5500"})
public class AuthenticationController {

    @Autowired
    private AuthenticationService authenticationService;

    @PostMapping("/login")
    public ResponseEntity<?> authenticate(
            @Valid @RequestBody AuthenticationRequest request) {
        try {
            AuthenticationResponse response = authenticationService.authenticate(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(new ErrorResponse(e.getMessage()));
        }
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthenticationResponse> refreshToken(@RequestBody String refreshToken) {
        // Implementazione del refresh token (da completare se necessario)
        return ResponseEntity.ok().build();
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        // Implementazione del logout (da completare se necessario)
        return ResponseEntity.ok().build();
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        try {
            User user = authenticationService.register(request);
            return ResponseEntity.ok(new RegistrationResponse(user.getId(), user.getEmail(), user.getFirstName(), user.getLastName(), user.getRole()));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(new ErrorResponse(e.getMessage()));
        }
    }
}
