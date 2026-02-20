// src/main/java/com/example/Chamados/security/JwtUtil.java
package com.example.Chamados.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;
// IMPORTAMOS A INTERFACE UserDetails
import org.springframework.security.core.userdetails.UserDetails; 
import com.example.Chamados.model.Usuario;
import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Service
public class JwtUtil {

    private final String SECRET_KEY = "suaChaveSeCretamuitoForteParaAssinarOJWTdeveSerLonga"; // (Sua chave)
    private final Key assinarChave;

    public JwtUtil() {
        this.assinarChave = Keys.hmacShaKeyFor(SECRET_KEY.getBytes());
    }

    // Extrai o username (email no seu caso) do token
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    // Extrai a data de expiração
    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder().setSigningKey(assinarChave).build().parseClaimsJws(token).getBody();
    }

    // Verifica se o token expirou
    private Boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    // --- 1. PRIMEIRA MUDANÇA AQUI ---
    // Gera um token para o usuário
    public String generateToken(Usuario usuario) {
        Map<String, Object> claims = new HashMap<>();
        
        // Usamos .name() para salvar o texto (ex: "ROLE_ADM") no token
        claims.put("role", usuario.getRole().name()); 
        claims.put("nome", usuario.getNome());
        
        return createToken(claims, usuario.getEmail()); // Usando email como "subject" (que é o username)
    }

    private String createToken(Map<String, Object> claims, String subject) {
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(subject)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 10)) // 10 horas de validade
                .signWith(assinarChave, SignatureAlgorithm.HS256)
                .compact();
    }

    // --- 2. SEGUNDA MUDANÇA AQUI ---
    // Valida o token
    // MUDANÇA: Trocamos 'Usuario usuario' pela interface 'UserDetails userDetails'
    public Boolean validateToken(String token, UserDetails userDetails) {
        final String username = extractUsername(token); // Pega o email do token
        
        // MUDANÇA: Usamos userDetails.getUsername() (que retorna o email)
        return (username.equals(userDetails.getUsername()) && !isTokenExpired(token));
    }
}