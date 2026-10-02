package com.ifpb.notificacoes.controller;
import com.ifpb.notificacoes.exception.NotificacaoNaoEncontrada;
import com.ifpb.notificacoes.model.Notificacao;
import com.ifpb.notificacoes.repository.*;
import com.ifpb.notificacoes.service.DuplicidadeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.jpa.domain.Specification;
import java.util.List;

@RestController
@RequestMapping("/notificacao")
@RequiredArgsConstructor
public class NotificacaoController {
    private final NotificacaoRepository repository;
    private final DuplicidadeService duplicidadeService;


    @PostMapping
    public ResponseEntity<Notificacao> criar(@RequestBody @Valid Notificacao notificacao) {
        notificacao.setId(null);
        Notificacao slv = repository.save(notificacao);
        return ResponseEntity.status(HttpStatus.CREATED).body(slv);
    }

    @GetMapping
    public List<Notificacao> listar(@RequestParam(required = false) String agravo, @RequestParam(required = false) String nomePaciente, @RequestParam(required = false) Boolean duplicadas) {
        Specification<Notificacao> filtroDuplicadas = Boolean.TRUE.equals(duplicadas)
                ? NotificacaoSpecs.idEm(duplicidadeService.idsDuplicados())
                : NotificacaoSpecs.todas();

        Specification<Notificacao> filtro = Specification.allOf(
                NotificacaoSpecs.agravoContem(agravo),
                NotificacaoSpecs.nomePacienteContem(nomePaciente),
                filtroDuplicadas
        );
        return repository.findAll(filtro);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Notificacao> buscarPorId(@PathVariable Long id) {
        return repository.findById(id)
                .map(ResponseEntity::ok)
                .orElseThrow(() -> new NotificacaoNaoEncontrada(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        if (!repository.existsById(id)) {
            throw new NotificacaoNaoEncontrada(id);
        }
        repository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Notificacao> atualizar(@PathVariable Long id, @RequestBody @Valid Notificacao dados) {
        if (!repository.existsById(id)) {
            throw new NotificacaoNaoEncontrada(id);
        }
        dados.setId(id);
        Notificacao atualizada = repository.save(dados);
        return ResponseEntity.ok(atualizada);
    }
}
