package com.example.Chamados.repository;

import com.example.Chamados.model.Usuario;
import com.example.Chamados.model.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.List;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    // Método para buscar um usuário pelo email
    Optional<Usuario> findByEmail(String email);

    // Método para buscar usuários por role (NORMAL ou TI ou ADM)
    List<Usuario> findByRole(Role role);

    // Método para buscar usuários pelo nome
    List<Usuario> findByNomeContainingIgnoreCase(String nome);
}
