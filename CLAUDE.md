# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Comandos essenciais

```bash
# Ambiente completo (ordem obrigatória)
docker compose up -d              # sobe MongoDB 7 (27017) + Mongo Express (8081)
node scripts/seed.mjs             # popula coleção 'escolas' com 1.357 registros

# App Next.js
cd observatorio
npm install
npm run dev                        # http://localhost:3000
npm run build && npm start         # produção
npx tsc --noEmit                  # checar TypeScript sem build
```

## Arquitetura

### Fluxo de dados
```
MongoDB (Docker)
  └── coleção: observatorio.escolas
        └── src/lib/mongodb.ts      ← singleton de conexão (global em dev, nova instância em prod)
              └── src/app/page.tsx  ← Server Component: fetch completo dos 1.357 docs
                    └── Dashboard.tsx ← Client Component: todo o estado e lógica interativa
```

`page.tsx` busca **todos** os documentos do Mongo via SSR e passa como `initialData` ao Dashboard. Filtros, ordenação e paginação são 100% client-side (1.357 registros cabe em memória sem problema).

### Componentes de gráficos
Todos os gráficos usam `dynamic(() => import(...), { ssr: false })` porque Chart.js depende do DOM:
- `MainCharts.tsx` — recebe `filtered: Escola[]`, renderiza 5 gráficos (top-40 bar, IDEB por cidade/dep, SAEB, scatter fluxo)
- `InvestCharts.tsx` — recebe `investData` pré-computado no Dashboard (join local entre `INVESTIMENTOS[]` e os dados do Mongo)
- `CompareCharts.tsx` — recebe `groups` agregados por cidade, renderiza radar + tabela de dependência

### Estado no Dashboard
O `Dashboard.tsx` é o único lugar com `useState`. Nunca há fetch client-side — tudo part do `initialData`. Os dados derivados (`filtered`, `sorted`, `pageItems`, `kpis`, `compareGroups`, `investData`) são todos `useMemo`.

### Normalização de nomes
A base bruta contém duplicatas por capitalização (`SOROCABA`/`Sorocaba`, `BRASÍLIA`/`Brasília`, etc.). O `scripts/seed.mjs` aplica um mapa `NORM` antes de inserir. **Não alterar os nomes na base JSON** — normalizar sempre no seed.

## MongoDB

```
db: observatorio
collection: escolas
índices: no_municipio (1), dependencia (1), ideb (1), nome_escola (text)
```

A API REST em `src/app/api/escolas/route.ts` está disponível mas não é usada pelo front — existe para consumo externo futuro.

Conexão configurada em `observatorio/.env.local` (não vai pro git — copiar de `.env.local.example`):
```
MONGODB_URI=mongodb://localhost:27017/observatorio
```
Se a variável não estiver definida, `mongodb.ts` lança um erro com instrução clara antes de chegar ao driver.

## Convenções TypeScript

- Tipo central: `interface Escola` em `src/lib/types.ts` — espelha exatamente os campos do MongoDB
- Campos opcionais na base (`ideb`, `fluxo`, `aprendizado`, `nota_lp`, `nota_mt`) são `number | null`
- Datasets mistos Chart.js (bar + line) requerem `as unknown as ChartDataset<'bar'>` para passar no TypeScript
- Usar `Array.from(new Set(...))` em vez de `[...new Set(...)]` — o tsconfig não tem `downlevelIteration`

## Seed script

O `scripts/seed.mjs` resolve o `mongodb` via `createRequire` apontando para `observatorio/package.json`, usando o driver já instalado em `observatorio/node_modules`. Não precisa de `npm install` na raiz — basta ter rodado `npm install` dentro de `observatorio/`.
