# Alterações Necessárias no Backend (Java Spring Boot)

## Resumo

O frontend foi atualizado para suportar **dois modos de pagamento** para dívidas. Abaixo estão as alterações necessárias no backend para manter compatibilidade.

---

## 1. Novo Enum: `PaymentMode`

```java
public enum PaymentMode {
    JUROS_MENSAL, // Paga somente juros por mês, principal de uma vez
    PARCELADO     // Amortização — pagamento abate do total
}
```

---

## 2. Novo Enum: `PagamentoTipo`

```java
public enum PagamentoTipo {
    JUROS,     // Pagamento cobre somente juros
    PARCELA,   // Pagamento como amortização (juros + principal)
    QUITACAO   // Pagamento para quitar o principal inteiro
}
```

---

## 3. Entidade `Divida` — Novo Campo

```java
@Entity
public class Divida {
    // ... campos existentes ...

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentMode paymentMode = PaymentMode.PARCELADO;
}
```

> **Migration SQL:**
> ```sql
> ALTER TABLE divida ADD COLUMN payment_mode VARCHAR(20) NOT NULL DEFAULT 'PARCELADO';
> ```

---

## 4. Entidade `Pagamento` — Novo Campo

```java
@Entity
public class Pagamento {
    // ... campos existentes ...

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PagamentoTipo tipo = PagamentoTipo.PARCELA;
}
```

> **Migration SQL:**
> ```sql
> ALTER TABLE pagamento ADD COLUMN tipo VARCHAR(20) NOT NULL DEFAULT 'PARCELA';
> ```

---

## 5. Entidade `Configuracao` — Novo Campo

```java
@Entity
public class Configuracao {
    // ... campos existentes ...

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentMode paymentModePadrao = PaymentMode.PARCELADO;
}
```

> **Migration SQL:**
> ```sql
> ALTER TABLE configuracao ADD COLUMN payment_mode_padrao VARCHAR(20) NOT NULL DEFAULT 'PARCELADO';
> ```

---

## 6. Lógica de Cálculo de Juros (Service)

No `DividaService`, crie dois métodos de cálculo:

### Modo JUROS_MENSAL
```java
/**
 * Juros sempre calculados sobre o valor ORIGINAL.
 * Pagamentos de tipo JUROS não reduzem o principal.
 * Principal é pago com QUITACAO.
 */
public DebtBreakdown calcularJurosMensal(Divida divida) {
    BigDecimal valorOriginal = divida.getValorOriginal();
    BigDecimal totalJurosPagos = divida.getPagamentos().stream()
        .filter(p -> p.getTipo() == PagamentoTipo.JUROS)
        .map(Pagamento::getValor)
        .reduce(BigDecimal.ZERO, BigDecimal::add);
    
    BigDecimal totalPrincipalPago = divida.getPagamentos().stream()
        .filter(p -> p.getTipo() != PagamentoTipo.JUROS)
        .map(Pagamento::getValor)
        .reduce(BigDecimal.ZERO, BigDecimal::add);

    BigDecimal jurosAcumulados = calcularJuros(valorOriginal, divida);
    BigDecimal jurosPendentes = jurosAcumulados.subtract(totalJurosPagos).max(BigDecimal.ZERO);
    BigDecimal saldoPrincipal = valorOriginal.subtract(totalPrincipalPago).max(BigDecimal.ZERO);
    
    return new DebtBreakdown(
        valorOriginal, jurosAcumulados, totalJurosPagos,
        totalPrincipalPago, saldoPrincipal, jurosPendentes
    );
}
```

### Modo PARCELADO
```java
/**
 * Pagamentos são amortização: abatidos do (principal + juros).
 * Comportamento antigo.
 */
public DebtBreakdown calcularParcelado(Divida divida) {
    // Lógica existente de amortização
}
```

### DTO `DebtBreakdown`

```java
public record DebtBreakdown(
    BigDecimal principal,
    BigDecimal jurosAcumulados,
    BigDecimal jurosPagos,
    BigDecimal principalPago,
    BigDecimal saldoPrincipal,
    BigDecimal jurosPendentes
) {}
```

---

## 7. Endpoint de Pagamento — Atualização

O endpoint `POST /api/dividas/{id}/pagamentos` agora precisa receber o `tipo`:

```java
@PostMapping("/{id}/pagamentos")
public ResponseEntity<?> adicionarPagamento(
    @PathVariable UUID id,
    @RequestBody PagamentoRequest request
) {
    // request contém: valor, data, tipo (JUROS|PARCELA|QUITACAO)
    // Se tipo == QUITACAO, marcar a dívida como PAGA
}
```

**DTO:**
```java
public record PagamentoRequest(
    BigDecimal valor,
    LocalDateTime data,
    PagamentoTipo tipo
) {}
```

---

## 8. Endpoint de Stats — Novos Campos

O endpoint de estatísticas deve retornar os novos campos:

```java
public record DividaStats(
    // ... campos existentes ...
    BigDecimal totalEmprestado,    // Soma de valorOriginal de dívidas ativas
    BigDecimal jurosAcumulados,    // Soma de juros calculados
    BigDecimal jurosPendentes      // jurosAcumulados - jurosPagos
) {}
```

---

## Resumo das Migrations (Flyway/Liquibase)

```sql
-- V3__add_payment_mode.sql
ALTER TABLE divida ADD COLUMN payment_mode VARCHAR(20) NOT NULL DEFAULT 'PARCELADO';
ALTER TABLE pagamento ADD COLUMN tipo VARCHAR(20) NOT NULL DEFAULT 'PARCELA';
ALTER TABLE configuracao ADD COLUMN payment_mode_padrao VARCHAR(20) NOT NULL DEFAULT 'PARCELADO';
```
