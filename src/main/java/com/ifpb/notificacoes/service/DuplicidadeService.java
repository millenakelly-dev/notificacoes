package com.ifpb.notificacoes.service;
import com.ifpb.notificacoes.model.Notificacao;
import com.ifpb.notificacoes.repository.NotificacaoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.temporal.ChronoUnit;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DuplicidadeService {

    private static  final int DIAS_TOLERANCIA = 3;

    private final NotificacaoRepository repository;

    public Set<Long> idsDuplicados() {
        Map<String, List<Notificacao>> grupos = repository.findAll().stream()
                .filter(this::temCamposDeComparacao)
                .collect(Collectors.groupingBy(this::chave));

        Set<Long> ids = new HashSet<>();
        for (List<Notificacao> grupo : grupos.values()) {
            for (int i = 0; i < grupo.size(); i++) {
                for (int j = i + 1; j < grupo.size(); j++) {
                    Notificacao a = grupo.get(i);
                    Notificacao b = grupo.get(j);
                    long dias = Math.abs(ChronoUnit.DAYS.between(
                            a.getDataNotificacao(), b.getDataNotificacao()));
                    if (dias <= DIAS_TOLERANCIA) {
                        ids.add(a.getId());
                        ids.add(b.getId());
                    }
                }
            }
        }
        return ids;
    }

    private boolean temCamposDeComparacao(Notificacao n) {
        return temTexto(n.getAgravo())
                && temTexto(n.getNomePaciente())
                && temTexto(n.getNomeMae())
                && n.getDataNascimento() != null
                && n.getDataNotificacao() != null;
    }

    private String chave(Notificacao n) {
        return normalizar(n.getAgravo()) + "|"
                + normalizar(n.getNomePaciente()) + "|"
                + normalizar(n.getNomeMae()) + "|"
                + n.getDataNascimento();
    }

    private String normalizar(String texto) {
        return texto.trim().replaceAll("\\s+", " ").toLowerCase();
    }

    private boolean temTexto(String valor) {
        return valor != null && !valor.isBlank();
    }
}
