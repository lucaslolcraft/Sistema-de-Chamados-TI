package com.example.Chamados.repository;

import com.example.Chamados.model.Setor;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SetorRepository extends JpaRepository<Setor, Long> {

    // Método para buscar um setor pelo nome
    Optional<Setor> findByNome(String nome);
}
