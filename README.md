# API de Notificações de Agravos (SINAN)

API REST em **Spring Boot** para cadastrar, consultar, atualizar e excluir notificações de agravos de saúde, inspirada na ficha de notificação/conclusão do SINAN.

Atividade prática de **Programação para a Web I** — ADS, IFPB Campus Cajazeiras.

**Autores:** Millena Kelly Silva Almeida

## Tecnologias

Java 21 · Spring Boot 4.1.1 (Web MVC, Data JPA, Validation) · H2 (em memória) · Lombok · Maven

## Arquitetura em camadas

O projeto segue o **modelo em camadas**: cada camada tem uma responsabilidade e conversa só com a camada logo abaixo.

```
Cliente (Insomnia / front-end)
        │ HTTP + JSON
        ▼
Controller   → recebe a requisição, aciona @Valid, devolve o status HTTP
        ▼
Service      → regras de negócio (RN01: duplicidade)
        ▼
Repository   → acesso ao banco (Spring Data JPA)
        ▼
Banco H2
```

Pacotes de apoio: `model` (entidade `Notificacao`), `validation` (validadores das regras RN02 e RN03) e `exception` (tratamento central de erros).

## Como executar

Requisito: **JDK 21 ou superior** (o Maven já vem no projeto e o banco H2 roda em memória, sem instalação).

```bash
git clone https://github.com/millenakelly-dev/notificacoes
cd notificacoes
./mvnw spring-boot:run        # Windows: mvnw.cmd spring-boot:run
```

A API sobe em **http://localhost:8080**. Ao iniciar, o `data.sql` carrega 5 notificações de exemplo (os dados voltam ao estado inicial a cada reinício).

Console do banco: http://localhost:8080/h2-console — JDBC URL `jdbc:h2:mem:notificacoes`, usuário `sa`, senha em branco.

## Endpoints

| Método | Rota | Descrição | Sucesso |
|---|---|---|---|
| `POST` | `/notificacao` | Cria uma notificação | `201` |
| `GET` | `/notificacao` | Lista (com filtros opcionais) | `200` |
| `GET` | `/notificacao/{id}` | Busca por id | `200` |
| `PUT` | `/notificacao/{id}` | Atualiza (substitui o registro inteiro) | `200` |
| `DELETE` | `/notificacao/{id}` | Exclui | `204` |

**Filtros** de `GET /notificacao` (combináveis): `agravo`, `nomePaciente` (busca por trecho, sem diferenciar maiúsculas) e `duplicadas=true` (somente possíveis duplicadas).

Exemplo: `GET /notificacao?nomePaciente=maria&duplicadas=true`

**Corpo de exemplo** (`POST` e `PUT`; datas no formato `aaaa-mm-dd`):

```json
{
  "agravo": "Dengue",
  "nomePaciente": "Maria da Silva",
  "sexo": "F",
  "dataNascimento": "1990-05-12",
  "nomeMae": "Ana da Silva",
  "dataNotificacao": "2026-09-28",
  "idade": 36,
  "gestante": "Não",
  "ufResidencia": "PB",
  "municipioResidencia": "João Pessoa",
  "paisResidencia": "Brasil"
}
```

Obrigatórios sempre: `agravo`, `nomePaciente`, `sexo` (`M`, `F` ou `I`) e `dataNotificacao`.

## Regras de negócio

- **RN01 — Duplicidade:** são possíveis duplicadas as notificações com mesmo agravo, nome do paciente, data de nascimento e nome da mãe, e datas de notificação com até 3 dias de diferença. O texto é comparado sem diferenciar maiúsculas/minúsculas nem espaços extras, e notificações com algum desses campos em branco ficam de fora. Disponível via `?duplicadas=true`.
- **RN02 — Idade e gestante:** a `idade` é obrigatória quando não há `dataNascimento`; `gestante` é obrigatório para sexo feminino com 16 anos ou mais (constante `IDADE_MINIMA` em `IdadeValidator`).
- **RN03 — Residência:** `ufResidencia` é obrigatória quando o paciente reside no Brasil; `municipioResidencia` é obrigatório quando a UF é informada; quem reside em outro país informa `paisResidencia` (UF e município não são exigidos). Considera-se residente no Brasil quando o país está em branco ou é "Brasil".

## Erros (Problem Detail, RFC 9457)

Erros retornam `application/problem+json`: `400` para dados inválidos (campos em `erros`) e `404` para notificação inexistente.

```json
{
  "title": "Dados inválidos",
  "status": 400,
  "detail": "Um ou mais campos são inválidos.",
  "instance": "/notificacao",
  "erros": { "agravo": "Agravo obrigatório" }
}
```

## Observações

- A paginação e a ordenação (desafio opcional) não foram implementadas.
- `duplicadas=false` equivale a não aplicar o filtro.