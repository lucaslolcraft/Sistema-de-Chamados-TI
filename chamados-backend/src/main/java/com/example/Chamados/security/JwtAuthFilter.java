// src/main/java/com/example/Chamados/security/JwtAuthFilter.java
package com.example.Chamados.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserDetailServiceImpl userDetailService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");
        final String userEmail;
        final String jwtToken;

        // 1. Verifica se o cabeçalho Authorization existe e começa com "Bearer "
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response); // Se não, continua o fluxo sem autenticar
            return;
        }

        // 2. Extrai o token (remove o "Bearer ")
        jwtToken = authHeader.substring(7);
        userEmail = jwtUtil.extractUsername(jwtToken); // Extrai o email do token

        // 3. Se temos o email E o usuário ainda não está autenticado no contexto do Spring
        if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            
            // 4. Carrega os detalhes do usuário do banco
            UserDetails userDetails = this.userDetailService.loadUserByUsername(userEmail);

            // 5. Valida o token
            if (jwtUtil.validateToken(jwtToken, (com.example.Chamados.model.Usuario) userDetails)) {
                
                // 6. Se o token for válido, cria a autenticação e a coloca no Contexto do Spring
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities());
                
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }
        
        // 7. Continua o fluxo da requisição
        filterChain.doFilter(request, response);
    }
}