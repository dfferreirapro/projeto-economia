# Observatório Educacional Brasileiro — EduMetrics

Analise dos dados educacionais das redes publicas do Brasil — cruzamento de IDEB, SAEB e infraestrutura escolar com dados do INEP 2023.

---

## Sobre o Projeto

O **Observatorio Educacional (EduMetrics)** e uma plataforma interativa de visualizacao de dados que cruza indicadores educacionais, investimentos publicos e infraestrutura escolar das redes publicas brasileiras. Desenvolvido como projeto de Ciencia de Dados para Negocios, o site transforma dados abertos do governo federal em inferencias aplicaveis sobre a qualidade da educacao no Brasil.

### Base de dados

| Fonte | Dados | Periodo |
|-------|-------|---------|
| **INEP — Censo Escolar** | 1.321 escolas, IDEB, SAEB, fluxo, infraestrutura | 2023 |
| **FNDE/SIOPE** | Investimentos no Ensino Fundamental por municipio | 2021–2025 |
| **INEP — Sinopse Estatistica** | Matriculas do Ensino Fundamental Regular | 2021–2025 |
| **IBGE** | Dados municipais de referencia | — |

### Tecnologias

- **Front-end:** HTML5, CSS3, JavaScript puro
- **Visualizacao:** Chart.js, Leaflet + MarkerCluster (mapas)
- **ETL:** Python (Pandas, NumPy)
- **Fontes:** INEP, FNDE/SIOPE, IBGE

---

## Estrutura do Site

O painel e organizado em **9 secoes** navegaveis via sidebar:

### 1. Home / Nossa Equipe
Apresentacao do projeto, integrantes e cards de tecnologia. Grafico de barras com IDEB medio por municipio (top 6).

### 2. Metodologia
Dicionario de dados, etapas do projeto (coleta, tratamento, analise) e limitacoes das bases utilizadas.

### 3. Dashboard
KPIs principais: IDEB medio, SAEB LP, SAEB MT, total de escolas, taxa de fluxo e melhor IDEB. Inclui grafico de barras (top municipios) e grafico de rosca (distribuicao por rede).

### 4. Graficos
- **Top 40 escolas por IDEB** com linha de media
- **IDEB medio por municipio** (barras horizontais)
- **SAEB LP vs Matematica** por municipio
- **Dispersao IDEB x Aprovacao** (fluxo escolar)
- **Histograma de distribuicao do IDEB**

### 5. Mapa
Mapa interativo com clustering das escolas geolocalizadas. Popups com dados de SAEB, IDEB, dependencia administrativa e infraestrutura. Legendas por faixa SAEB.

### 6. Infraestrutura
Indicadores fisicos e tecnologicos:
- Banheiro, biblioteca, lab. informatica, quadra, internet, banda larga, rampas, refeitorio
- Media de equipamentos por aluno (desktop, portatil, tablet)
- Salas totais, climatizadas e acessiveis
- Profissionais de apoio (coordenador, psicologo, pedagogo, gestao, monitores)
- Comparativo: escolas com SAEB alto vs baixo

### 7. Investimentos
Series historicas 2021–2025 de despesas no Ensino Fundamental por municipio (fonte: FNDE/SIOPE):
- Investimento total e por matricula
- Rankings municipais
- Relacao investimento x desempenho

### 8. Comparativo
Compare ate **3 municipios** lado a lado com:
- Cards de metricas (IDEB, SAEB LP, SAEB MT, fluxo, aprendizado)
- Grafico radar normalizado
- Tabela de distribuicao por rede

### 9. Escolas
Tabela completa com todas as escolas, busca textual, filtros por municipio/estado/rede/IDEB, ordenacao por coluna e paginacao.

---

## Analise de Dados e Insights

### Insight 1: Investimento crescente em Sorocaba

| Ano | Valor Empenhado (R$) | Variacao |
|-----|---------------------|----------|
| 2021 | 361,6 milhoes | — |
| 2022 | 259,9 milhoes | -28% |
| 2023 | 533,2 milhoes | **+105%** |
| 2024 | 593,4 milhoes | +11% |
| 2025 | 638,7 milhoes | +8% |

Sorocaba saiu de R$ 260M (2022) para R$ 639M (2025) — mais que dobrou o investimento no Ensino Fundamental em 3 anos.

### Insight 2: Comparativo entre municipios

Investimento total acumulado no Ensino Fundamental (2021–2025, valores empenhados):

| Municipio | UF | Total | Perfil |
|-----------|----|-------|--------|
| **Sorocaba** | SP | **R$ 2,4 bilhoes** | Maior investimento absoluto |
| Sobral | CE | R$ 1,3 bilhao | Referencia nacional em educacao |
| Votorantim | SP | R$ 437 milhoes | Cidade de pequeno porte |
| Sao Caetano do Sul | SP | R$ 1,1 bilhao | Alto IDHM |

Sobral (CE) e referencia nacional de educacao publica — investiu **R$ 383M em 2025** e e reconhecida por ter transformado a educacao municipal com alfabetizacao na idade certa e gestao por resultados.

### Insight 3: Infraestrutura como preditor de qualidade

Os dados mostram que escolas com:
- **Biblioteca** — tendem a ter SAEB 10–15% maior
- **Laboratorio de informatica** — correlacionado com melhor desempenho em Matematica
- **Internet banda larga** — presente em escolas com IDEB acima da media
- **Salas climatizadas** — ainda sao deficit na maioria das escolas

**Mas infraestrutura nao e tudo** — o fator gestao e valorizacao do professor aparece como diferencial nos municipios com melhor desempenho.

### Insight 4: Distribuicao do IDEB

- **IDEB medio geral:** ~5.5 (variacao de 0 a 10)
- **Rede Municipal** predomina em quantidade de escolas
- **Rede Estadual** tende a ter IDEB medio mais alto
- **Taxa de aprovacao (fluxo) media:** ~95%
- Escolas com IDEB >= 7 concentram-se em municipios com maior investimento per capita

### Resumo para apresentacao

> *"Os dados do INEP 2023 mostram que escolas com melhor infraestrutura tem, em media, IDEB 15% maior."*

> *"Sorocaba saiu de R$ 260 milhoes em 2022 para R$ 638 milhoes em 2025 — mais que dobrou o investimento em Ensino Fundamental em 3 anos."*

> *"Sobral e o estudo de caso brasileiro: com R$ 383 milhoes investidos em 2025, evidencia que gestao aliada a investimento continuo transforma a educacao."*

> *"Este painel unifica dados do INEP, SIOPE e Censo Escolar — demonstrando que dados abertos, quando devidamente tratados, geram inferencias aplicaveis para gestores publicos."*

---

## Como executar localmente

```bash
# 1. Clone o repositorio
git clone https://github.com/seu-usuario/observatorio-educacional.git

# 2. Entre na pasta do projeto
cd Acesto

# 3. Inicie um servidor HTTP (Python ou Node)
python -m http.server 8080
# ou
npx serve .

# 4. Acesse no navegador
# http://localhost:8080
```

> **Importante:** O site usa `fetch()` para carregar os dados, portanto precisa ser servido via HTTP. Nao funciona com o protocolo `file://`.

---

## Estrutura do Projeto

```
Acesto/
├── README.md                    # Este arquivo
├── .gitignore
├── index.html                   # Aplicacao completa (HTML + CSS + JS)
├── style.css                    # Folha de estilos (nao utilizado — CSS e inline no HTML)
├── script.js                    # Script JS (nao utilizado — JS e inline no HTML)
├── assets/
│   └── logo-observatorio.svg    # Logo do projeto
├── fotos/
│   ├── douglas-ferreira.jpeg
│   ├── gabriel-ferreira.jpg
│   ├── Mateus-Mariano.jpeg
│   └── peterson.jpeg
├── data/                        # Dados do projeto
│   ├── base_i.json              # Base principal (1.321 escolas)
│   ├── dados_educacao_fundamental_site_2021_2025.json  # Investimentos + matriculas
│   ├── ensino_fundamental_unificado.json                # Dados bimestrais (Sorocaba, Sobral, Votorantim)
│   ├── investimentos_educacao_fundamental_2021_2025.json # Investimentos FNDE/SIOPE
│   ├── longitudes.json          # Coordenadas geograficas das escolas
│   └── municipios.json          # Lista de municipios
└── screenshots/                 # Capturas de tela do projeto
    ├── 01-home.png
    ├── 02-dashboard.png
    ├── 03-graficos.png
    ├── 04-infraestrutura.png
    ├── 05-investimentos.png
    ├── 06-comparativo.png
    ├── 07-mapa.png
    └── 08-escolas.png
```

---

## Equipe

| Nome | Papel |
|------|-------|
| **Douglas Ferreira** | Ciencia de Dados |
| **Gabriel Ferreira** | Visualizacao |
| **Mateus Mariano** | Design |
| **Peterson** | Analise |

**Disciplina:** Ciencia de Dados para Negocios

---

## Fontes dos Dados

- **INEP — Censo Escolar 2023:** https://www.gov.br/inep/pt-br/acesso-a-informacao/dados-abertos/microdados/censo-escolar
- **INEP — SAEB:** https://www.gov.br/inep/pt-br/areas-de-atuacao/avaliacao-da-educacao-basica/saeb
- **FNDE — SIOPE (Dados Abertos):** https://www.fnde.gov.br/olinda-ide/servico/DADOS_ABERTOS_SIOPE
- **IBGE — Cidades:** https://cidades.ibge.gov.br/

---

## Licenca

Projeto academico sem fins comerciais. Dados publicos governamentais conforme leis de acesso a informacao do Brasil.
