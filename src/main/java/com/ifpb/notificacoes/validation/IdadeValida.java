package com.ifpb.notificacoes.validation;
import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import java.lang.annotation.*;

@Documented
@Constraint(validatedBy = IdadeValidator.class)
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
public @interface IdadeValida {
    String message() default "Dados de idade/gestante inválidos";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
