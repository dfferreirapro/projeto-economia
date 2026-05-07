# Observatório Educacional

Análise dos dados do INEP (Censo Escolar 2023) sobre o desempenho das escolas de Ensino Fundamental I (1º ao 5º ano). Foco principal nas redes municipais de **Sorocaba** e **Votorantim** (SP), com comparativos de municípios de todas as regiões do Brasil.

## Stack

| Camada | Tecnologia |
|---|---|
| Banco de dados | MongoDB 7 (Docker) |
| Backend / API | Next.js 14 — App Router, API Routes, SSR |
| Frontend | React 18, TypeScript, Chart.js, react-chartjs-2 |
| Admin visual | Mongo Express |

## Pré-requisitos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- Node.js 18+

## Como rodar

**1. Subir o MongoDB**
```bash
docker compose up -d
```

- MongoDB: `localhost:27017`
- Mongo Express (admin visual): `http://localhost:8081` — login `admin` / `admin123`

**2. Popular o banco**
```bash
node scripts/seed.mjs
```

Saída esperada:
```
✓ 1357 escolas inseridas
✓ Índices criados: no_municipio, dependencia, ideb, nome_escola (text)
```

**3. Rodar o app Next.js**
```bash
cd observatorio
cp .env.local.example .env.local   # Windows: copy .env.local.example .env.local
npm install
npm run dev
```

App disponível em `http://localhost:3000`

## Estrutura do projeto

```
projeto-economia/
├── docker-compose.yml          # MongoDB + Mongo Express
├── base_escolas_tratada.json   # Base bruta INEP 2023 (imutável)
├── scripts/
│   └── seed.mjs                # Importa o JSON para o MongoDB
├── observatorio/               # App Next.js
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx            # Server Component — busca dados do Mongo
│   │   │   ├── layout.tsx
│   │   │   ├── globals.css
│   │   │   └── api/escolas/        # GET /api/escolas
│   │   ├── components/
│   │   │   ├── Dashboard.tsx       # Orquestrador: filtros, KPIs, tabela, comparativo
│   │   │   ├── MainCharts.tsx      # Top-40, IDEB por cidade/dep, SAEB, scatter
│   │   │   ├── InvestCharts.tsx    # Investimento × IDEB, eficiência
│   │   │   └── CompareCharts.tsx   # Radar + tabela de distribuição
│   │   └── lib/
│   │       ├── mongodb.ts          # Singleton de conexão
│   │       └── types.ts            # Interface Escola
│   └── .env.local                  # MONGODB_URI
└── index.html                  # Versão legada (HTML estático)
```

## Dados

- **Fonte:** INEP — Censo Escolar 2023, IDEB 2023, SAEB
- **Escopo:** Ensino Fundamental I (1º ao 5º ano)
- **Registros:** 1.357 escolas em 57 municípios, 16 estados + DF
- **Cobertura IDEB:** 1.017 escolas com dados (75%)
- **Dependências:** Municipal, Estadual, Federal

### Campos da base

| Campo | Descrição |
|---|---|
| `inep_id` | Código INEP da escola |
| `nome_escola` | Nome oficial |
| `no_municipio` / `uf_estado` | Localização |
| `dependencia` | Municipal · Estadual · Federal |
| `ideb` | Índice de Desenvolvimento da Educação Básica (0–10) |
| `fluxo` | Taxa de aprovação (0–1) |
| `aprendizado` | Nota padronizada SAEB (0–10) |
| `nota_lp` / `nota_mt` | Proficiência SAEB em LP e Matemática |

## Funcionalidades

- Filtros por município, dependência administrativa, faixa de IDEB e busca por nome
- KPIs em tempo real (IDEB médio, SAEB LP/MT, fluxo, melhor escola)
- Tabela paginada com ordenação por qualquer coluna
- Gráficos: top-40 por IDEB, médias por cidade/dependência, SAEB, scatter IDEB × fluxo
- Análise de investimento público × desempenho com correlação de Pearson
- Comparativo entre até 3 municípios (radar + distribuição por dependência)
- Tema claro / escuro

## Equipe

Projeto acadêmico — Ciência de Dados para Negócios

- Douglas Ferreira
- Gabriel Ferreira
- Mateus Mariano
