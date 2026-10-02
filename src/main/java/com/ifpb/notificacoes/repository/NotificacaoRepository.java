package com.ifpb.notificacoes.repository;
import com.ifpb.notificacoes.model.Notificacao;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NotificacaoRepository extends JpaRepository<Notificacao, Long> {
}
