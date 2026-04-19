package com.pagamenti.ks.service;

import com.pagamenti.ks.dto.request.AuthenticationRequest;
import com.pagamenti.ks.dto.request.RegisterRequest;
import com.pagamenti.ks.dto.response.AuthenticationResponse;
import com.pagamenti.ks.entity.User;
import com.pagamenti.ks.enums.Role;
import com.pagamenti.ks.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthenticationService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    public AuthenticationResponse authenticate(AuthenticationRequest request) {
        try {
            // Autentica l'utente
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    request.getEmail(),
                    request.getPassword()
                )
            );

            // Recupera l'utente dal database
            User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Utente non trovato"));

            // Genera token JWT
            String accessToken = jwtService.generateToken(user);
            String refreshToken = jwtService.generateRefreshToken(user);

            return AuthenticationResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .build();

        } catch (AuthenticationException e) {
            throw new RuntimeException("Credenziali non valide: " + e.getMessage());
        }
    }

    public User getCurrentUser(String email) {
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Utente non trovato"));
    }

    public User register(RegisterRequest request) {
        // Verifica se l'email è già in uso
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email già in uso");
        }

        // Crea nuovo utente
        User user = new User();
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole() != null ? request.getRole() : Role.USER);

        return userRepository.save(user);
    }
}
