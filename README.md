# 💰 DebtTracker — Sistema de Gestão de Dívidas

Sistema completo de gestão de dívidas com **banco de dados local** (IndexedDB), feito para rodar 100% no navegador sem backend. Ideal para uso pessoal — basta publicar no Vercel e usar.

![React](https://img.shields.io/badge/React-18-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue) ![Tailwind](https://img.shields.io/badge/Tailwind-3.4-blue) ![PWA](https://img.shields.io/badge/PWA-Installable-green)

---

## ✨ Funcionalidades

- 📊 **Dashboard** com cards de estatísticas, gráfico de pizza por status e gráfico de barras mensal
- 📋 **CRUD completo** de dívidas (criar, visualizar, editar, excluir)
- 🔍 **Busca e filtros** por nome, e-mail, status, ordenação
- 📱 **Grid e Tabela** — alterne entre visualização em cards ou tabela
- 💹 **Cálculo automático de juros** (simples, composta, fixa mensal, sem juros)
- 🔔 **Lembretes** via Web Notifications para dívidas próximas do vencimento
- ⚡ **PWA instalável** — funciona como app no desktop/celular
- 🌙 **Design dark mode** moderno com animações suaves
- 💾 **Dados 100% locais** — IndexedDB via Dexie.js, sem servidor
- 🚀 **Deploy estático** no Vercel com 1 clique

---

## 🏗️ Stack Tecnológica

| Tecnologia | Uso |
|---|---|
| **Vite 5** | Build tool e dev server |
| **React 18** | UI Framework |
| **TypeScript 5.6** | Tipagem estática |
| **Tailwind CSS 3.4** | Estilização (dark mode, cores customizadas) |
| **Dexie.js 4** | Banco de dados IndexedDB |
| **React Router 6** | Roteamento SPA |
| **React Hook Form** | Formulários com validação |
| **Recharts 2** | Gráficos (pizza, barras) |
| **Zustand 5** | Gerenciamento de estado (filtros, modais) |
| **date-fns 3** | Manipulação de datas |
| **vite-plugin-pwa** | Service worker + manifest PWA |

---

## 📁 Estrutura do Projeto

```
src/
├── db/
│   ├── db.ts                     # Instância Dexie + schema IndexedDB
│   ├── types.ts                  # Enums (StatusDivida, TaxType) + interfaces
│   └── hooks/
│       └── useDividas.ts         # CRUD hooks + live queries + stats
├── services/
│   ├── taxCalculator.ts          # Cálculo de juros + formatação BRL
│   └── reminderService.ts        # Sistema de lembretes (Web Notifications)
├── store/
│   └── useUIStore.ts             # Zustand store (filtros, modais, sidebar)
├── components/
│   ├── ui/                       # Componentes base
│   │   ├── Button.tsx            # Botão com variantes e loading
│   │   ├── Card.tsx              # Card + StatCard
│   │   ├── Input.tsx             # Input, Select, Textarea
│   │   ├── Modal.tsx             # Modal + ConfirmModal
│   │   └── StatusBadge.tsx       # Badge colorido por status
│   ├── layout/
│   │   ├── Layout.tsx            # Layout principal (sidebar + content)
│   │   ├── Sidebar.tsx           # Navegação lateral responsiva
│   │   └── Topbar.tsx            # Barra superior com título e ações
│   ├── dividas/
│   │   ├── DebtForm.tsx          # Formulário de criação/edição
│   │   ├── DebtCard.tsx          # Card de dívida (grid view)
│   │   ├── DebtTable.tsx         # Tabela de dívidas (table view)
│   │   └── DebtFilters.tsx       # Barra de busca e filtros
│   └── dashboard/
│       ├── StatsBar.tsx          # 4 cards de estatísticas
│       ├── DebtsByStatusChart.tsx # Gráfico de pizza
│       ├── MonthlyTrendChart.tsx  # Gráfico de barras mensal
│       └── UpcomingDueSoon.tsx   # Lista de vencimentos próximos
├── pages/
│   ├── DashboardPage.tsx         # Página principal
│   ├── DebtListPage.tsx          # Lista de dívidas (grid/tabela)
│   ├── DebtDetailPage.tsx        # Detalhes de uma dívida
│   ├── NewDebtPage.tsx           # Cadastrar nova dívida
│   └── EditDebtPage.tsx          # Editar dívida existente
├── App.tsx                       # Rotas + inicialização
├── main.tsx                      # Entry point
└── index.css                     # Tailwind + estilos base
```

---

## 📦 Campos da Dívida

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | UUID | Identificador único (gerado automaticamente) |
| `devedorNome` | string | Nome do devedor |
| `devedorEmail` | string | E-mail do devedor |
| `valor` | number | Valor original da dívida |
| `descricao` | string | Descrição/motivo da dívida |
| `dataVencimento` | ISO DateTime | Data de vencimento |
| `status` | enum | PENDENTE, PAGA, VENCIDA, CANCELADA, NEGOCIANDO |
| `taxType` | enum | SIMPLES, COMPOSTA, JUROS_FIXO, SEM_JUROS |
| `taxValue` | number | Taxa de juros (%) |
| `valorAtual` | number | Valor atualizado com juros (calculado) |
| `lembreteEnviado` | ISO DateTime | Último lembrete enviado |
| `createAt` | ISO DateTime | Data de criação |
| `updateAt` | ISO DateTime | Última atualização |

---

## 🚀 Como Usar

### Desenvolvimento Local

```bash
# Instalar dependências
npm install

# Rodar dev server
npm run dev

# Build para produção
npm run build

# Preview do build
npm run preview
```

### Deploy no Vercel

1. Faça push do projeto para um repositório no GitHub
2. Vá em [vercel.com](https://vercel.com) e clique **"Add New Project"**
3. Importe o repositório
4. Vercel detecta Vite automaticamente — apenas clique **"Deploy"**
5. Pronto! Acesse a URL gerada

O arquivo `vercel.json` já está configurado com rewrite para SPA.

### Instalar como App (PWA)

Após acessar o site publicado:
1. No Chrome: clique no ícone **"Instalar"** na barra de endereço
2. No Edge: clique nos **3 pontos** → **"Instalar este site como um aplicativo"**
3. O app aparecerá na **área de trabalho** e no menu iniciar

---

## 🔔 Sistema de Lembretes

O app verifica automaticamente ao abrir:
- Dívidas que vencem nos próximos **3 dias**
- Dívidas já **vencidas** que ainda estão pendentes

Se você permitir notificações, receberá alertas via **Web Notifications**.
Verificações são feitas a cada 30 minutos enquanto o app estiver aberto.

---

## 💹 Tipos de Juros

| Tipo | Cálculo |
|---|---|
| **Sem Juros** | Valor original mantido |
| **Juros Simples** | `valor + (valor × taxa × tempo)` |
| **Juros Composta** | `valor × (1 + taxa)^meses` |
| **Juros Fixo** | `valor + (valor × taxa × meses)` |

Os juros são calculados automaticamente com base na data de vencimento.

---

## 🎨 Design

- **Tema escuro** com gradientes azul/cyan
- **Animações** suaves (fade-in, slide-up, pulse)
- **Responsivo** — funciona em desktop e mobile
- **Sidebar** colapsável no mobile
- **Scrollbar** customizada combinando com o tema

---

## 📄 Licença

Projeto pessoal — use como quiser.

