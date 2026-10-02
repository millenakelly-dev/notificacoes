package com.ifpb.notificacoes.repository;

import com.ifpb.notificacoes.model.Notificacao;
import org.springframework.data.jpa.domain.Specification;

import java.util.Set;

public class NotificacaoSpecs {

    public static Specification<Notificacao> agravoContem(String agravo) {
        return (root, query, cb) -> {
            if (agravo == null || agravo.isBlank()) {
                return cb.conjunction();
            }
            return cb.like(cb.lower(root.get("agravo")),
                    "%" + agravo.trim().toLowerCase() + "%");
        };
    }

    public static Specification<Notificacao> nomePacienteContem(String nome) {
        return (root, query, cb) -> {
            if (nome == null || nome.isBlank()) {
                return cb.conjunction();
            }
            return cb.like(cb.lower(root.get("nomePaciente")),
                    "%" + nome.trim().toLowerCase() + "%");
        };
    }

    public static Specification<Notificacao> idEm(Set<Long> ids) {
        return (root, query, cb) -> ids.isEmpty()
                ? cb.disjunction()          // nenhum resultado
                : root.get("id").in(ids);
    }

    public static Specification<Notificacao> todas() {
        return (root, query, cb) -> cb.conjunction();
    }
}