package com.example.Chamados.repository;

import com.example.Chamados.model.Chamado;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ChamadoRepository extends JpaRepository<Chamado, Long> {

    // Método para buscar um chamado pelo ID
    Optional<Chamado> findById(Long id);

    // Método para buscar chamados por status (Ex: "aberto", "em progresso", "fechado")
    List<Chamado> findByStatus(String status);

    // Método para buscar chamados de um usuário (por exemplo, de um usuário específico)
    List<Chamado> findByUsuarioId(Long usuarioId);

    // Método para buscar chamados por categoria
    List<Chamado> findByCategoriaId(Long categoriaId);

    // Método para buscar chamados por setor
    List<Chamado> findBySetorId(Long setorId);
}
