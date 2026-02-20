package com.example.Chamados.model;

import jakarta.persistence.*;
import java.util.Objects;
import java.util.Collection;
import java.util.Collections;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

@Entity
@Table(name = "usuario")
// --- MUDANÇA AQUI ---
public class Usuario implements UserDetails {
	private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false)
    private String password; // Senha (criptografada)

    @Column(nullable = false)
    private String nome; // Nome completo do usuário

    @Column(nullable = false, unique = true)
    private String email; // E-mail do usuário

    @Enumerated(EnumType.STRING) // Diz ao JPA para salvar o nome do Enum (ex: "ROLE_TI") no banco
    @Column(nullable = false) // Pode renomear a coluna para "role"
    private Role role; //

    @Column(nullable = false)
    private boolean ativo; // Para verificar se o usuário está ativo no sistema

    // --- Getters e Setters (Os que você já tinha) ---
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        // O Spring Security vai chamar este método!
        // Estamos dizendo que o "username" para login é o email.
        return this.email; 
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        // O Spring Security vai chamar este método!
        return this.password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public boolean isAtivo() {
        return ativo;
    }

    public void setAtivo(boolean ativo) {
        this.ativo = ativo;
    }

    // --- MÉTODOS OBRIGATÓRIOS DO 'UserDetails' ---

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        if (this.role == null) {
            return Collections.emptyList();
        }
        return Collections.singletonList(new SimpleGrantedAuthority(this.role.name()));
    }

    @Override
    public boolean isAccountNonExpired() {
        return true; // Você pode adicionar lógica para expirar contas se quiser
    }

    @Override
    public boolean isAccountNonLocked() {
        return true; // Você pode adicionar lógica de bloqueio de conta
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true; // Você pode adicionar lógica de expiração de senha
    }

    @Override
    public boolean isEnabled() {
        return this.ativo; // Usamos nosso campo 'ativo'
    }

    // --- Métodos equals e hashCode (Os que você já tinha) ---
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Usuario usuario = (Usuario) o;
        return Objects.equals(id, usuario.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}