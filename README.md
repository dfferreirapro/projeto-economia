# Observatório Educacional

Análise comparativa dos dados do INEP (Censo Escolar 2023) sobre o Ensino Fundamental I (1º ao 5º ano). Foco nas redes municipais de **Sorocaba** e **Votorantim** (SP) comparadas com os maiores destaques nacionais — incluindo o paradoxo do Nordeste.

## Stack

| Camada | Tecnologia |
|---|---|
| Banco de dados | MongoDB 7 |
| Backend / API | Next.js 14 — App Router, API Routes, SSR |
| Frontend | React 18, TypeScript, Chart.js, react-chartjs-2 |
| Admin visual | Mongo Express |
| Containerização | Docker + Docker Compose |

## Rodar com Docker (recomendado)

Sobe MongoDB, popula o banco e inicia o frontend com um único comando:

```bash
docker compose up --build
```

| Serviço | Endereço |
|---|---|
| App Next.js | http://localhost:3000 |
| Mongo Express (admin) | http://localhost:8081 · `admin` / `admin123` |

> O serviço `seed` roda automaticamente após o MongoDB estar pronto e carrega os 1.357 registros com os dados de infraestrutura. O frontend só sobe após o seed concluir com sucesso.

Para parar:
```bash
docker compose down
```

Para parar e apagar os dados do banco:
```bash
docker compose down -v
```

## Rodar localmente (desenvolvimento)

**Pré-requisitos:** Docker Desktop + Node.js 18+

```bash
# 1. Subir só o MongoDB
docker compose up mongo -d

# 2. Popular o banco
node scripts/seed.mjs

# 3. Configurar variável de ambiente
cd observatorio
cp .env.local.example .env.local   # Windows: copy .env.local.example .env.local

# 4. Instalar dependências e iniciar
npm install
npm run dev   # http://localhost:3000
```

Verificar tipos TypeScript:
```bash
npx tsc --noEmit
```

## Estrutura do projeto

```
projeto-economia/
├── docker-compose.yml          # Orquestra MongoDB + seed + frontend
├── Dockerfile.seed             # Imagem do seed script
├── base_escolas_tratada.json   # Base INEP 2023 — desempenho (imutável)
├── base_i.json                 # Base INEP 2023 — infraestrutura (imutável)
├── scripts/
│   └── seed.mjs                # Merge das duas bases → MongoDB
├── mocks/
│   └── Observatorio.html       # Design de referência
└── observatorio/               # App Next.js
    ├── Dockerfile
    ├── .env.local.example
    └── src/
        ├── app/
        │   ├── page.tsx            # Server Component — busca dados do Mongo
        │   ├── layout.tsx
        │   ├── globals.css
        │   └── api/escolas/        # GET /api/escolas
        ├── components/
        │   ├── Dashboard.tsx       # Orquestrador: estado, filtros, seções
        │   ├── RankingChart.tsx    # Ranking nacional (Chart.js)
        │   └── ParadoxChart.tsx    # Scatter IDEB × Infraestrutura
        └── lib/
            ├── mongodb.ts          # Conexão lazy (segura para build)
            └── types.ts            # Interface Escola
```

## Dados

**Fontes:** INEP — Censo Escolar 2023, IDEB 2023, SAEB

| Campo | Descrição |
|---|---|
| `ideb` | Índice de Desenvolvimento da Educação Básica (0–10) |
| `fluxo` | Taxa de aprovação (0–1) |
| `nota_lp` / `nota_mt` | Proficiência SAEB em LP e Matemática |
| `infra_score` | % de 12 itens-chave de infraestrutura presentes |
| `IN_*` | 22 indicadores binários de infraestrutura |
| `QT_*` | Quantitativos (computadores, professores, salas) |

**Registros:** 1.357 escolas · 57 municípios · 16 estados + DF  
**Cobertura IDEB:** 1.017 escolas (75%)  
**Com infra:** 1.355 escolas

## Seed script

Faz merge das duas bases pelo `inep_id`, normaliza nomes de municípios (ex: `SOROCABA` → `Sorocaba`) e calcula `infra_score`. Resolve o driver `mongodb` via `createRequire` a partir de `observatorio/node_modules` — sem `npm install` separado na raiz.

## Equipe

Projeto acadêmico — Ciência de Dados para Negócios

- Douglas Ferreira
- Gabriel Ferreira  
- Mateus Mariano
- Peterson Alves
