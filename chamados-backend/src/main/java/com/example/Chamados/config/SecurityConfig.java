package com.example.Chamados.config;
/*
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import static org.springframework.security.config.Customizer.withDefaults;

//@Configuration
//@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(authorize -> authorize
                // ESTA É A PARTE CRUCIAL: Libera o acesso ao Swagger
                .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()
                
                // Exige autenticação para todas as outras requisições
                .anyRequest().authenticated()
            )
            .formLogin(withDefaults()); // Usa o formulário de login padrão

        return http.build();
    }
}*/