// src/main/java/com/example/Chamados/security/SecurityConfig.java
package com.example.Chamados.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
//import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder; // Importe o BCrypt
import org.springframework.security.crypto.password.PasswordEncoder; // Importe o PasswordEncoder
import org.springframework.http.HttpMethod;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private UserDetailServiceImpl userDetailService;

    // (Vamos criar este filtro no próximo passo)
    @Autowired
    private JwtAuthFilter jwtAuthFilter;

    // Este Bean diz ao Spring como verificar as senhas
    @Bean
    public PasswordEncoder passwordEncoder() {
        // Você DEVE usar um encoder! 
        // As senhas no seu banco não podem estar em texto plano.
        // Se estiverem, você precisará criar um script para "hashear" todas elas com BCrypt.
        return new BCryptPasswordEncoder(); 
    }

    // Este Bean expõe o AuthenticationManager
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }
    
    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        // Diz ao Spring qual serviço usar para buscar usuários
        authProvider.setUserDetailsService(userDetailService); 
        // Diz ao Spring qual encoder usar para comparar senhas
        authProvider.setPasswordEncoder(passwordEncoder()); 
        return authProvider;
    }

    // O Filtro de CORS (COPIE E COLE do seu WebConfig)
    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowCredentials(true);
        config.addAllowedOrigin("http://localhost:5173"); 
        config.addAllowedHeader("*");
        config.addAllowedMethod("GET");
        config.addAllowedMethod("POST");
        config.addAllowedMethod("PUT");
        config.addAllowedMethod("DELETE");
        config.addAllowedMethod("OPTIONS");
        config.addAllowedMethod("PATCH");
        
        source.registerCorsConfiguration("/**", config); 
        return new CorsFilter(source);
    }


    // Este é o método principal que configura as regras de segurança
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // ... (seus filtros de CORS, CSRF, etc. continuam aqui)
            .addFilterBefore(corsFilter(), UsernamePasswordAuthenticationFilter.class)
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authenticationProvider(authenticationProvider())
            
            // --- BLOCO DE REGRAS ATUALIZADO ---
            .authorizeHttpRequests(authz -> authz
                
                // 1. Regras Públicas
                .requestMatchers("/auth/login", "/swagger-ui/**", "/v3/api-docs/**").permitAll()

                // 2. Regras de ADM
                .requestMatchers(HttpMethod.POST, "/usuarios/**", "/setores/**", "/categorias/**").hasAuthority("ROLE_ADM")
                .requestMatchers(HttpMethod.PUT, "/usuarios/**", "/setores/**", "/categorias/**").hasAuthority("ROLE_ADM")
                .requestMatchers(HttpMethod.DELETE, "/usuarios/**", "/setores/**", "/categorias/**").hasAuthority("ROLE_ADM")
                .requestMatchers(HttpMethod.GET, "/usuarios").hasAuthority("ROLE_ADM") // Lista completa de usuários
                .requestMatchers(HttpMethod.DELETE, "/chamados/**").hasAuthority("ROLE_ADM")

                // 3. Regras de TI / ADM
                .requestMatchers("/chamados/{id}/assumir").hasAnyAuthority("ROLE_TI", "ROLE_ADM")
                .requestMatchers("/chamados/{id}/alterar-status").hasAnyAuthority("ROLE_TI", "ROLE_ADM")
                
                // --- NOVAS REGRAS AQUI ---
                .requestMatchers(HttpMethod.GET, "/usuarios/tecnicos").hasAnyAuthority("ROLE_TI", "ROLE_ADM")
                .requestMatchers(HttpMethod.PATCH, "/chamados/{id}/atribuir").hasAnyAuthority("ROLE_TI", "ROLE_ADM")
                // -------------------------

                // 4. Regras de Usuário Autenticado (Comuns)
                .requestMatchers(HttpMethod.GET, "/setores/**", "/categorias/**").authenticated()
                .requestMatchers(HttpMethod.GET, "/chamados/**").authenticated()
                .requestMatchers(HttpMethod.POST, "/chamados").authenticated()
                .requestMatchers(HttpMethod.PATCH, "/chamados/{id}/fechar").authenticated()
                
                // 5. Regra Final
                .anyRequest().authenticated()
            )
            // ------------------------------------
            
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}