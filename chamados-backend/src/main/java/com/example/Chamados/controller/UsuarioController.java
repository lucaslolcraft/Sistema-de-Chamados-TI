package com.example.Chamados.controller;

import com.example.Chamados.model.Usuario;
import com.example.Chamados.model.Role;
//import repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import com.example.Chamados.repository.UsuarioRepository;



import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/usuarios")
public class UsuarioController {

    @Autowired
    private UsuarioRepository usuarioRepository;
    @Autowired 
    private PasswordEncoder passwordEncoder;

    // Mock do usuário autenticado para validação
    // Substitua isso por um serviço de autenticação real no futuro.
    /*private Usuario usuarioAutenticado() {
        // Simula um usuário autenticado. Substitua com autenticação real.
        Usuario usuario = new Usuario();
        usuario.setId(1L); // ID do usuário logado
        usuario.setTipo("TI"); // Tipo do usuário logado ("NORMAL" ou "TI")
        return usuario;
    }*/

    // 1. Listar todos os usuários
    @GetMapping
    public List<Usuario> listarTodos() {
        return usuarioRepository.findAll();
    }

    // 2. Buscar um usuário por ID
    @GetMapping("/{id}")
    public ResponseEntity<Usuario> buscarPorId(@PathVariable Long id) {
        Optional<Usuario> usuario = usuarioRepository.findById(id);
        return usuario.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // 3. Criar um novo usuário 
    @PostMapping
    public ResponseEntity<Usuario> criarUsuario(@RequestBody Usuario usuario) {
        usuario.setPassword(passwordEncoder.encode(usuario.getPassword())); // Hasheia a senha
        Usuario novoUsuario = usuarioRepository.save(usuario);
        return ResponseEntity.ok(novoUsuario);
    }

    // 4. Atualizar um usuário existente
    @PutMapping("/{id}")
    public ResponseEntity<Usuario> atualizarUsuario(@PathVariable Long id, @RequestBody Usuario usuarioAtualizado, @AuthenticationPrincipal Usuario usuarioLogado) {
        Optional<Usuario> usuarioExistente = usuarioRepository.findById(id);

        if (usuarioExistente.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Usuario usuario = usuarioExistente.get();
        usuario.setNome(usuarioAtualizado.getNome());
        usuario.setEmail(usuarioAtualizado.getEmail());
        usuario.setPassword(usuarioAtualizado.getPassword());
        usuario.setRole(usuarioAtualizado.getRole());
        if (usuarioAtualizado.getPassword() != null && !usuarioAtualizado.getPassword().isEmpty()) {
            usuario.setPassword(passwordEncoder.encode(usuarioAtualizado.getPassword())); // Hasheia a nova senha
        }

        Usuario usuarioSalvo = usuarioRepository.save(usuario);
        return ResponseEntity.ok(usuarioSalvo);
    }

    // 5. Deletar um usuário
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarUsuario(@PathVariable Long id, @AuthenticationPrincipal Usuario usuarioLogado) {

        if (!usuarioRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        usuarioRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // 6. Alterar o tipo (Role) de usuário (Somente ADM)
    @PatchMapping("/{id}/alterar-role")
    public ResponseEntity<Usuario> alterarRole(@PathVariable Long id, 
                                               @RequestParam String role, // Recebe a String (ex: "ROLE_TI")
                                               @AuthenticationPrincipal Usuario usuarioLogado) {

        // --- MUDANÇA 1: Verificação de Segurança ---
        // Apenas um ADM pode alterar o tipo de outros usuários.
        if (!usuarioLogado.getRole().equals(Role.ROLE_ADM)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build(); // 403 Acesso Negado
        }

        // --- (Sem mudança) Busca o usuário que será modificado ---
        Optional<Usuario> usuarioExistente = usuarioRepository.findById(id);

        if (usuarioExistente.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Usuario usuario = usuarioExistente.get();

        // --- MUDANÇA 2: Validação do Role (convertendo String para Enum) ---
        Role novoRole;
        try {
            // Tenta converter a String (ex: "ROLE_TI") para o Enum Role
            novoRole = Role.valueOf(role.toUpperCase()); 
        } catch (IllegalArgumentException e) {
            // Se a String não for "ROLE_ADM", "ROLE_TI" ou "ROLE_NORMAL",
            // o Role.valueOf() falha, então retornamos um 400 Bad Request.
            return ResponseEntity.badRequest().body(null); 
        }

        // --- MUDANÇA 3: Seta o novo Role usando o Enum ---
        usuario.setRole(novoRole);
        Usuario usuarioAtualizado = usuarioRepository.save(usuario);

        return ResponseEntity.ok(usuarioAtualizado);
    }
    // 7. Listar todos os usuários que são técnicos (ROLE_TI)
    @GetMapping("/tecnicos")
    public ResponseEntity<List<Usuario>> listarTecnicos(@AuthenticationPrincipal Usuario usuarioLogado) {
        
        // Apenas ADM e TI podem ver a lista de técnicos
        Role role = usuarioLogado.getRole();
        if (role.equals(Role.ROLE_ADM) || role.equals(Role.ROLE_TI)) {
            List<Usuario> tecnicos = usuarioRepository.findByRole(Role.ROLE_TI);
            return ResponseEntity.ok(tecnicos);
        }

        // Se um usuário NORMAL tentar acessar, negamos.
        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }
}
