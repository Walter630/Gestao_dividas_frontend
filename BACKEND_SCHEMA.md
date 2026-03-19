# Documentação: Entidades para o Backend em Java (Spring Boot)

Como você vai desenvolver o backend em Java, aqui está a estrutura de classes (Entidades JPA) que você precisará criar. Essa estrutura já contempla o modelo **SaaS (Multi-Tenant)**, onde cada usuário logado vê apenas os seus próprios clientes e dívidas.

---

## 1. Entidade: `Usuario` (User)
Responsável pelo login, autenticação (JWT) e isolamento dos dados.

| Atributo | Tipo Java | Descrição |
| :--- | :--- | :--- |
| `id` | `UUID` / `Long` | Chave Primária. |
| `username` | `String` | E-mail ou nome de usuário (único). |
| `password` | `String` | Senha (criptografada com BCrypt). |
| `role` | `String` | "ADMIN" ou "USER". |
| `createdAt` | `LocalDateTime`| Data de cadastro. |

---

## 2. Entidade: `Cliente` (Client)
Representa as pessoas para quem o usuário cadastrado está cobrando.

| Atributo | Tipo Java | Descrição |
| :--- | :--- | :--- |
| `id` | `UUID` | Chave Primária. |
| `usuarioId` | `UUID` | **FK** para `Usuario`. (Isolamento de dados). |
| `nome` | `String` | Nome completo. |
| `email` | `String` | E-mail do devedor. |
| `telefone` | `String` | WhatsApp (formatado: 5511999999999). |
| `documento` | `String` | CPF ou CNPJ. |
| `createdAt` | `LocalDateTime` | Data de criação. |

---

## 3. Entidade: `Divida` (Debt)
O coração do sistema. Armazena os parâmetros para o motor de juros.

| Atributo | Tipo Java | Descrição |
| :--- | :--- | :--- |
| `id` | `UUID` | Chave Primária. |
| `clienteId` | `UUID` | **FK** para `Cliente`. |
| `usuarioId` | `UUID` | **FK** para `Usuario`. |
| `valorOriginal` | `BigDecimal` | O valor inicial da dívida. |
| `descrição` | `String` | Texto livre. |
| `dataVencimento`| `LocalDateTime`| Data acordada para o pagamento. |
| `status` | `Enum` | `PENDENTE`, `PAGA`, `VENCIDA`, `CANCELADA`. |
| `tipoJuros` | `Enum` | `SIMPLES`, `COMPOSTA`, `FIXO`, `SEM_JUROS`. |
| `taxaJuros` | `BigDecimal` | Valor da taxa (ex: 2.5 para 2.5%). |
| `createdAt` | `LocalDateTime`| Data de cadastro. |

---

## 4. Entidade: `Pagamento` (Payment / Amortization)
Representa pagamentos parciais feitos em uma dívida.

| Atributo | Tipo Java | Descrição |
| :--- | :--- | :--- |
| `id` | `UUID` | Chave Primária. |
| `dividaId` | `UUID` | **FK** para `Divida` (Relacionamento Many-to-One). |
| `valor` | `BigDecimal` | Quantia paga. |
| `dataPagamento` | `LocalDateTime`| Quando o dinheiro entrou. |

---

## 5. Entidade: `Configuracao` (Settings)
Dados globais da empresa do usuário.

| Atributo | Tipo Java | Descrição |
| :--- | :--- | :--- |
| `id` | `UUID` | Chave Primária. |
| `usuarioId` | `UUID` | **FK** para `Usuario` (Único por usuário). |
| `nomeEmpresa` | `String` | Nome que aparece nas cobranças. |
| `taxaPadrao` | `BigDecimal` | Sugestão de juros para novas dívidas. |
| `tipoJurosPadrao`| `Enum` | Sugestão de tipo de juros. |
| `whatsappTemplate`| `String` | O texto com `{nome}` e `{valor}`. |

---

## 🔗 Relacionamentos sugeridos (Hibernate/JPA)
- **Usuario** (1) ----> (N) **Cliente**
- **Usuario** (1) ----> (N) **Dividal**
- **Cliente** (1) ----> (N) **Divida**
- **Divida** (1) ----> (N) **Pagamento**

### Dicas de Ouro para Java/SaaS:
1. **BigDecimal**: Nunca use `Double` para dinheiro no Java. Use sempre `BigDecimal` para evitar erros de centavos.
2. **Soft Delete**: Em vez de apagar (Delete), use um campo `ativo` (boolean). É mais seguro em SaaS.
3. **Auditoria**: Use as anotações `@CreatedAt` e `@LastModifiedDate` do Spring Data JPA.
4. **Isolamento**: Em cada busca (SELECT), sempre adicione o filtro `WHERE usuario_id = :logadoId`. Isso garante que ninguém acesse os dados de outro assinante.

Deseja que eu crie um exemplo de como seria a classe `Divida` em código Java para você se basear?
