package com.ifpb.notificacoes.model;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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
public class Notificacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Agravo obrigatório")
    private String agravo;

    @NotBlank(message = "Nome obrigatório")
    private String nomePaciente;

    private LocalDate dataNascimento;
    private String nomeMae;

    @NotNull(message = "Data obrigatória")
    private LocalDate dataNotificacao;
    
    private Integer idade;
    private String gestante;

    @Column(length = 2)
    private String ufResidencia;
    private String municipioResidencia;
    private String paisResidencia;
}
