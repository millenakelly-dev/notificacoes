package com.ifpb.notificacoes.validation;
import com.ifpb.notificacoes.model.Notificacao;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class ResidenciaValidator implements ConstraintValidator<ResidenciaValida, Notificacao> {

    @Override
    public boolean isValid(Notificacao n, ConstraintValidatorContext context) {
        if (n == null) {
            return true;
        }
        context.disableDefaultConstraintViolation();
        boolean valido = true;

        boolean temUf = temTexto(n.getUfResidencia());
        boolean temMunicipio = temTexto(n.getMunicipioResidencia());
        boolean temPais = temTexto(n.getPaisResidencia());
        boolean moraNoBrasil = !temPais
                || n.getPaisResidencia().trim().equalsIgnoreCase("Brasil");

        if (moraNoBrasil && !temUf) {
            adicionarErro(context, "ufResidencia",
                    "UF de residência é obrigatória quando o paciente reside no Brasil");
            valido = false;
        }
        if (temUf && !temMunicipio) {
            adicionarErro(context, "municipioResidencia",
                    "Município de residência é obrigatório quando a UF é informada");
            valido = false;
        }
        return valido;
    }

    private boolean temTexto(String valor) {
        return valor != null && !valor.isBlank();
    }

    private void adicionarErro(ConstraintValidatorContext context, String campo, String mensagem) {
        context.buildConstraintViolationWithTemplate(mensagem)
                .addPropertyNode(campo)
                .addConstraintViolation();
    }
}
