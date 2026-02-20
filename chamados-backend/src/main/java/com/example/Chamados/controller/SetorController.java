package com.example.Chamados.controller;

import com.example.Chamados.model.Setor;
import com.example.Chamados.model.Usuario;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import com.example.Chamados.repository.SetorRepository;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/setores")
public class SetorController {

    @Autowired
    private SetorRepository setorRepository;

    // 1. Listar todos os setores
    @GetMapping
    public List<Setor> listarTodos() {
        return setorRepository.findAll();
    }

    // 2. Buscar um setor por ID
    @GetMapping("/{id}")
    public ResponseEntity<Setor> buscarPorId(@PathVariable Long id) {
        Optional<Setor> setor = setorRepository.findById(id);
        return setor.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    // 3. Criar um novo setor 
    @PostMapping
    public ResponseEntity<Setor> criarSetor(@RequestBody Setor setor, @AuthenticationPrincipal Usuario usuarioLogado) {

        if (setor.getId() != null) {
            return ResponseEntity.badRequest().build();
        }

        Setor novoSetor = setorRepository.save(setor);
        return ResponseEntity.ok(novoSetor);
    }

    // 4. Atualizar um setor existente 
    @PutMapping("/{id}")
    public ResponseEntity<Setor> atualizarSetor(@PathVariable Long id, @RequestBody Setor setorAtualizado, @AuthenticationPrincipal Usuario usuarioLogado) {

        Optional<Setor> setorExistente = setorRepository.findById(id);
        if (setorExistente.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Setor setor = setorExistente.get();
        setor.setNome(setorAtualizado.getNome());
        // Atualize outros campos, se necessário

        Setor setorSalvo = setorRepository.save(setor);
        return ResponseEntity.ok(setorSalvo);
    }

    // 5. Deletar um setor 
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarSetor(@PathVariable Long id, @AuthenticationPrincipal Usuario usuarioLogado) {
        if (!setorRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        setorRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
