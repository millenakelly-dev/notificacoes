package com.ifpb.notificacoes.validation;
import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Documented
@Constraint(validatedBy = ResidenciaValidator.class)
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
public @interface ResidenciaValida {
    String message() default "Dados de residência inválidos";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
