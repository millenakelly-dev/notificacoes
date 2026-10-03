package com.ifpb.notificacoes.validation;
import com.ifpb.notificacoes.model.Notificacao;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import java.time.LocalDate;
import java.time.Period;

public class IdadeValidator implements ConstraintValidator<IdadeValida, Notificacao> {
    private static final int IDADE_MINIMA = 10;

    @Override
    public boolean isValid(Notificacao n, ConstraintValidatorContext context) {
        if (n == null) {
            return true;
        }
        context.disableDefaultConstraintViolation();
        boolean valido = true;

        //  idade obrigatória se data de nascimento desconhecida
        if (n.getDataNascimento() == null && n.getIdade() == null) {
            adicionarErro(context, "idade",
                    "Idade é obrigatória quando a data de nascimento não é informada");
            valido = false;
        }

        //  gestante obrigatória para sexo feminino com idade >= 16
        Integer idadeAnos = calcularIdade(n);
        boolean feminino = "F".equalsIgnoreCase(n.getSexo());
        boolean gestanteVazio = n.getGestante() == null || n.getGestante().isBlank();

        if (feminino && idadeAnos != null && idadeAnos >= IDADE_MINIMA && gestanteVazio) {
            adicionarErro(context, "gestante",
                    "Gestante é obrigatório para sexo feminino com " + IDADE_MINIMA + " anos ou mais");
            valido = false;
        }
        return valido;
    }

    private Integer calcularIdade(Notificacao n) {
        if (n.getDataNascimento() != null) {
            LocalDate referencia = n.getDataNotificacao() != null
                    ? n.getDataNotificacao() : LocalDate.now();
            return Period.between(n.getDataNascimento(), referencia).getYears();
        }
        return n.getIdade();
    }

    private void adicionarErro(ConstraintValidatorContext context, String campo, String mensagem) {
        context.buildConstraintViolationWithTemplate(mensagem)
                .addPropertyNode(campo)
                .addConstraintViolation();
    }
}
