package com.ifpb.notificacoes.model;
import com.ifpb.notificacoes.validation.ResidenciaValida;
import com.ifpb.notificacoes.validation.IdadeValida;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDate;
import jakarta.persistence.Column;

@Entity
@Table(name = "notificacao")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ResidenciaValida
@IdadeValida
public class Notificacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Agravo obrigatório")
    private String agravo;

    @NotBlank(message = "Nome obrigatório")
    private String nomePaciente;

    @NotBlank(message = "Sexo obrigatório")
    @Pattern(regexp = "M|F|I", message = "Sexo deve ser M, F ou I")
    @Column(length = 1)
    private String sexo;

    private LocalDate dataNascimento;
    private String nomeMae;

    @NotNull(message = "Data obrigatória")
    private LocalDate dataNotificacao;

    @Min(value = 0, message = "Idade não pode ser negativa")
    private Integer idade;
    private String gestante;

    @Column(length = 2)
    private String ufResidencia;
    private String municipioResidencia;
    private String paisResidencia;
}
