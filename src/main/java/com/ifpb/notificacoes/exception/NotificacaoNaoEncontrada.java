package com.ifpb.notificacoes.exception;

public class NotificacaoNaoEncontrada extends RuntimeException {
    public NotificacaoNaoEncontrada(Long id) {
        super("Notificação com id " + id + " não encontrada.");
    }
}
