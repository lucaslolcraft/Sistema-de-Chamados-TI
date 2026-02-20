package com.example.Chamados.controller;

import java.time.LocalDateTime;
import com.example.Chamados.model.Chamado;
import com.example.Chamados.model.Usuario;
import com.example.Chamados.model.Role;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus; // Para enviar o status 403 (Forbidden)
import com.example.Chamados.repository.ChamadoRepository;
import com.example.Chamados.repository.UsuarioRepository;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/chamados")
public class ChamadoController {

    @Autowired
    private ChamadoRepository chamadoRepository;

    @SuppressWarnings("unused")
	@Autowired
    private UsuarioRepository usuarioRepository;

 // 1. Listar todos os chamados (ADM e TI veem todos, NORMAL vê apenas os próprios)
    @GetMapping
    public List<Chamado> listarTodos(@AuthenticationPrincipal Usuario usuarioLogado) {
        
        // 1. Pegamos o Role (Enum) do usuário logado
        Role roleDoUsuario = usuarioLogado.getRole();

        // 2. Verificamos se o Role é TI ou ADM
        if (roleDoUsuario.equals(Role.ROLE_TI) || roleDoUsuario.equals(Role.ROLE_ADM)) {
            return chamadoRepository.findAll(); // TI e ADM podem ver todos os chamados
        } else {
            // Se não for TI nem ADM, só pode ser NORMAL
            return chamadoRepository.findByUsuarioId(usuarioLogado.getId()); // Usuário normal vê apenas os seus
        }
    }

    // 2. Buscar um chamado por ID
    @GetMapping("/{id}")
    public ResponseEntity<Chamado> buscarPorId(@PathVariable Long id, 
                                               @AuthenticationPrincipal Usuario usuarioLogado) {
        
        // 1. Busca o chamado no repositório
        Optional<Chamado> chamadoOptional = chamadoRepository.findById(id);

        // 2. Verifica se o chamado existe
        if (chamadoOptional.isEmpty()) {
            return ResponseEntity.notFound().build(); // Retorna 404 Not Found
        }

        Chamado chamado = chamadoOptional.get();
        Role roleDoUsuario = usuarioLogado.getRole();
        // 3. Pega as informações do usuário logado (do token JWT)
        boolean isTI = roleDoUsuario.equals(Role.ROLE_TI) || roleDoUsuario.equals(Role.ROLE_ADM);
        
        // 4. Pega o ID do "dono" do chamado
        Long donoDoChamadoId = chamado.getUsuario().getId();

        // 5. Lógica de Segurança
        // O usuário pode ver o chamado SE:
        //    a) Ele for do tipo "TI"
        //    OU
        //    b) O ID dele for o mesmo do "dono" do chamado
        if (isTI || usuarioLogado.getId().equals(donoDoChamadoId)) {
            return ResponseEntity.ok(chamado); // 200 OK - Permissão concedida
        } else {
            // Se não for TI nem o dono, ele não pode ver.
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build(); // 403 Forbidden
        }
    }

    // 3. Criar um novo chamado
    @PostMapping
    public ResponseEntity<Chamado> criarChamado(@RequestBody Chamado chamado, 
                                                @AuthenticationPrincipal Usuario usuarioLogado) {
        
        // 1. Define o usuário
        chamado.setUsuario(usuarioLogado);
        
        // 2. Define a data de abertura
        chamado.setDataAbertura(LocalDateTime.now());
        
        // 3. Define o status inicial (caso o front-end não envie)
        if (chamado.getStatus() == null) {
            chamado.setStatus("ABERTO");
        }
        // --------------------

        Chamado novoChamado = chamadoRepository.save(chamado);
        return ResponseEntity.ok(novoChamado);
    }

    // 4. Atualizar um chamado existente (Somente TI pode atualizar)
    @PutMapping("/{id}")
    public ResponseEntity<Chamado> atualizarChamado(@PathVariable Long id, @RequestBody Chamado chamadoAtualizado, @AuthenticationPrincipal Usuario usuarioLogado) {

        Optional<Chamado> chamadoExistente = chamadoRepository.findById(id);
        if (chamadoExistente.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Chamado chamado = chamadoExistente.get();
        
        chamado.setDescricao(chamadoAtualizado.getDescricao());
        chamado.setCategoria(chamadoAtualizado.getCategoria());
        chamado.setSetor(chamadoAtualizado.getSetor());
        chamado.setStatus(chamadoAtualizado.getStatus());
        // Atualize outros campos conforme necessário
        Chamado chamadoSalvo = chamadoRepository.save(chamado);
        return ResponseEntity.ok(chamadoSalvo);
    }

    // 5. Deletar um chamado
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarChamado(@PathVariable Long id, @AuthenticationPrincipal Usuario usuarioLogado) {

        if (!chamadoRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        chamadoRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
    // 6. Alterar o status de um chamado (Somente TI/ADM)
    @PatchMapping("/{id}/alterar-status")
    public ResponseEntity<Chamado> alterarStatus(@PathVariable Long id, 
                                                 @RequestParam String status, 
                                                 @AuthenticationPrincipal Usuario usuarioLogado) {

        // (A segurança (ROLE_TI/ADM) já é tratada pelo SecurityConfig)

        Optional<Chamado> chamadoExistente = chamadoRepository.findById(id);
        if (chamadoExistente.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Chamado chamado = chamadoExistente.get();

        // 1. Define o novo status (boa prática salvar em maiúsculas)
        chamado.setStatus(status.toUpperCase());

        // 2. Se o novo status for "FECHADO", define a data de conclusão
        if (status.equalsIgnoreCase("FECHADO")) {
            chamado.setDataConclusao(LocalDateTime.now());
        } 
        // 3. Se o chamado for reaberto, limpa a data de conclusão
        else if (!status.equalsIgnoreCase("FECHADO") && chamado.getDataConclusao() != null) {
            chamado.setDataConclusao(null);
        }

        Chamado chamadoAtualizado = chamadoRepository.save(chamado);
        return ResponseEntity.ok(chamadoAtualizado);
    }
    
    // 7. Endpoint para um TI assumir um chamado
    @PatchMapping("/{id}/assumir")
    public ResponseEntity<Chamado> assumirChamado(@PathVariable Long id, 
                                                 @AuthenticationPrincipal Usuario tecnicoLogado) {
        // 2. Busca o chamado
        Optional<Chamado> chamadoOptional = chamadoRepository.findById(id);
        if (chamadoOptional.isEmpty()) {
            return ResponseEntity.notFound().build(); // 404 Chamado não encontrado
        }

        Chamado chamado = chamadoOptional.get();

        // 3. (Opcional) Verifica se o chamado já tem um técnico
        if (chamado.getTecnico() != null) {
            // Retorna 409 Conflict se alguém já assumiu
            return ResponseEntity.status(HttpStatus.CONFLICT).body(chamado); 
        }

        // 4. A Lógica Principal: Atribui o técnico logado ao chamado
        chamado.setTecnico(tecnicoLogado);
        
        // (Opcional) Você pode querer mudar o status automaticamente
        if (chamado.getStatus().equalsIgnoreCase("ABERTO")) {
        	chamado.setStatus("EM_ANDAMENTO");
        }

        // 5. Salva e retorna o chamado atualizado
        Chamado chamadoAtualizado = chamadoRepository.save(chamado);
        return ResponseEntity.ok(chamadoAtualizado);
    }
    
    // 8. Endpoint para o PRÓPRIO USUÁRIO fechar seu chamado
    @PatchMapping("/{id}/fechar")
    public ResponseEntity<Chamado> fecharChamado(@PathVariable Long id, 
                                                 @AuthenticationPrincipal Usuario usuarioLogado) {

        // 1. Busca o chamado
        Optional<Chamado> chamadoOptional = chamadoRepository.findById(id);
        if (chamadoOptional.isEmpty()) {
            return ResponseEntity.notFound().build(); // 404 Chamado não encontrado
        }

        Chamado chamado = chamadoOptional.get();

        // 2. VERIFICAÇÃO DE SEGURANÇA (A MAIS IMPORTANTE)
        // O usuário logado é o "dono" (solicitante) do chamado?
        if (!chamado.getUsuario().getId().equals(usuarioLogado.getId())) {
            // Se não for o dono, ele não pode fechar.
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build(); // 403 Acesso Negado
        }

        // 3. (Opcional) Verifica se o chamado já está fechado
        if (chamado.getStatus().equalsIgnoreCase("FECHADO")) {
             // Retorna 409 Conflict se já estiver fechado
            return ResponseEntity.status(HttpStatus.CONFLICT).body(chamado);
        }

        // 4. A Lógica Principal: Fecha o chamado
        chamado.setStatus("FECHADO");
        chamado.setDataConclusao(LocalDateTime.now()); // Define a data de conclusão

        // 5. Salva e retorna o chamado atualizado
        Chamado chamadoAtualizado = chamadoRepository.save(chamado);
        return ResponseEntity.ok(chamadoAtualizado);
    }
    
    // 9. Endpoint para ADM ou TI atribuir um chamado a um técnico específico
    @PatchMapping("/{id}/atribuir")
    public ResponseEntity<Chamado> atribuirChamado(@PathVariable Long id, 
                                                   @RequestParam Long tecnicoId, // ID do técnico vindo da URL
                                                   @AuthenticationPrincipal Usuario usuarioLogado) {

        // 1. Busca o chamado
        Optional<Chamado> chamadoOptional = chamadoRepository.findById(id);
        if (chamadoOptional.isEmpty()) {
            return ResponseEntity.notFound().build(); // Chamado não existe
        }
        Chamado chamado = chamadoOptional.get();

        // 2. Busca o técnico
        Optional<Usuario> tecnicoOptional = usuarioRepository.findById(tecnicoId);
        if (tecnicoOptional.isEmpty()) {
            return ResponseEntity.badRequest().build(); // 400 - ID do técnico é inválido
        }
        Usuario tecnico = tecnicoOptional.get();

        // 3. Verificação de segurança extra: O usuário sendo atribuído é realmente um TI?
        if (!tecnico.getRole().equals(Role.ROLE_TI)) {
             // 400 - Você não pode atribuir um chamado a um usuário NORMAL ou ADM
            return ResponseEntity.badRequest().build();
        }

        // 4. A Lógica Principal: Atribui o técnico
        chamado.setTecnico(tecnico);

        // 5. (Opcional) Mudar o status se estiver "ABERTO"
        if (chamado.getStatus().equalsIgnoreCase("ABERTO")) {
           chamado.setStatus("EM_ANDAMENTO");
        }

        // 6. Salva e retorna o chamado atualizado
        Chamado chamadoAtualizado = chamadoRepository.save(chamado);
        return ResponseEntity.ok(chamadoAtualizado);
    }
}
