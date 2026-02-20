// src/main/java/com/example/Chamados/controller/AuthController.java
package com.example.Chamados.controller;

import com.example.Chamados.dto.AuthRequestDTO;
import com.example.Chamados.dto.AuthResponseDTO;
import com.example.Chamados.model.Usuario;
import com.example.Chamados.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth") // Endpoint de autenticação
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/login")
    public ResponseEntity<?> createAuthenticationToken(@RequestBody AuthRequestDTO authRequest) throws Exception {
        
        // 1. Autentica o usuário E ARMAZENA o resultado
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(authRequest.getEmail(), authRequest.getPassword())
        );

        // 2. Pega o usuário (que é o "Principal") de dentro do resultado da autenticação.
        // Isso evita uma segunda consulta ao banco de dados!
        Usuario usuario = (Usuario) authentication.getPrincipal();

        // 3. Gera o token JWT com base no usuário
        final String jwt = jwtUtil.generateToken(usuario);

        // 4. Retorna o token
        return ResponseEntity.ok(new AuthResponseDTO(jwt));
    }
}