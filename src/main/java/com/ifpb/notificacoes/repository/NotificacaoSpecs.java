package com.ifpb.notificacoes.repository;

import com.ifpb.notificacoes.model.Notificacao;
import org.springframework.data.jpa.domain.Specification;

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
}