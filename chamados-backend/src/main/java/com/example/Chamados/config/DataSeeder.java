package com.example.Chamados.config;

import com.example.Chamados.model.Role;
import com.example.Chamados.model.Setor;
import com.example.Chamados.model.Usuario;
import com.example.Chamados.repository.SetorRepository;
import com.example.Chamados.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional; 

@Configuration
public class DataSeeder {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private SetorRepository setorRepository; 

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Bean
    public CommandLineRunner loadData() {
        return args -> {
            
            // --- Passo 1: Garantir que o Setor "ADM" exista ---
            // (Sem mudanças aqui, ele ainda é necessário para os Chamados)
            String setorNome = "ADM"; 
            
            Optional<Setor> setorOpt = setorRepository.findByNome(setorNome);
            Setor setorPrincipal;

            if (setorOpt.isEmpty()) {
                System.out.println(">>> Criando setor padrão '" + setorNome + "'...");
                setorPrincipal = new Setor();
                setorPrincipal.setNome(setorNome);
                setorPrincipal = setorRepository.save(setorPrincipal);
            } else {
                setorPrincipal = setorOpt.get();
            }


            // --- Passo 2: Criar o Usuário Administrador (ADM) ---
            String adminEmail = "admin@ti.com"; // Vamos manter o email, mas o Role muda

            if (usuarioRepository.findByEmail(adminEmail).isEmpty()) {
                
                System.out.println(">>> Criando usuário administrador (ADM) padrão...");

                Usuario admin = new Usuario();
                admin.setNome("Administrador Sistema"); // Nome atualizado
                admin.setEmail(adminEmail);
                admin.setUsername(adminEmail);
                
                admin.setRole(Role.ROLE_ADM); 
                
                admin.setAtivo(true);
                admin.setPassword(passwordEncoder.encode("admin123")); // Senha: admin123

                usuarioRepository.save(admin);
                
                System.out.println(">>> Usuário 'admin@ti.com' (ADM) criado."); 
            } else {
                System.out.println(">>> Usuário 'admin@ti.com' já existe.");
            }

            // --- Passo 3: Criar o Usuário Comum (NORMAL) ---
            String userEmail = "usuario@comum.com";

            if (usuarioRepository.findByEmail(userEmail).isEmpty()) {
                
                System.out.println(">>> Criando usuário comum (NORMAL) padrão...");

                Usuario comum = new Usuario();
                comum.setNome("Usuario Comum");
                comum.setEmail(userEmail);
                comum.setUsername(userEmail);
                comum.setRole(Role.ROLE_NORMAL); 
                comum.setAtivo(true);
                comum.setPassword(passwordEncoder.encode("user123")); // Senha: user123

                usuarioRepository.save(comum);
                
                System.out.println(">>> Usuário 'usuario@comum.com' (NORMAL) criado."); 
            } else {
                System.out.println(">>> Usuário 'usuario@comum.com' já existe.");
            }

            // --- Passo 4: Criar o Usuário Técnico (TI) ---
            String tecnicoEmail = "tecnico@ti.com";

            if (usuarioRepository.findByEmail(tecnicoEmail).isEmpty()) {
                
                System.out.println(">>> Criando usuário técnico (TI) padrão...");

                Usuario tecnico = new Usuario();
                tecnico.setNome("Tecnico TI");
                tecnico.setEmail(tecnicoEmail);
                tecnico.setUsername(tecnicoEmail);
                
                tecnico.setRole(Role.ROLE_TI); 
                
                tecnico.setAtivo(true);
                tecnico.setPassword(passwordEncoder.encode("tecnico123")); // Senha: tecnico123

                usuarioRepository.save(tecnico);
                
                System.out.println(">>> Usuário 'tecnico@ti.com' (TI) criado.");
            } else {
                System.out.println(">>> Usuário 'tecnico@ti.com' já existe.");
            }
        };
    }
}