package com.example.Chamados.repository;

import com.example.Chamados.model.Categoria;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface CategoriaRepository extends JpaRepository<Categoria, Long> {

    // Método para buscar uma categoria pelo nome
    Optional<Categoria> findByNome(String nome);

    // Método para verificar se uma categoria já existe pelo nome
    boolean existsByNome(String nome);
}
