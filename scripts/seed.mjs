import { createRequire } from 'module';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const _require = createRequire(join(__dirname, '..', 'observatorio', 'package.json'));
const { MongoClient } = _require('mongodb');

/* ── Normalização de nomes de municípios ── */
const NORM = {
  'SOROCABA':    'Sorocaba',
  'BRASÍLIA':    'Brasília',
  'RECIFE':      'Recife',
  'PATO BRANCO': 'Pato Branco',
};

/* ── Campos de infra que compõem o infra_score ── */
const INFRA_SCORE_KEYS = [
  'IN_BIBLIOTECA', 'IN_LABORATORIO_INFORMATICA', 'IN_QUADRA_ESPORTES',
  'IN_INTERNET', 'IN_INTERNET_ALUNOS', 'IN_BANDA_LARGA', 'IN_COMPUTADOR',
  'IN_AGUA_POTAVEL', 'IN_ENERGIA_REDE_PUBLICA', 'IN_ESGOTO_REDE_PUBLICA',
  'IN_LABORATORIO_CIENCIAS', 'IN_ACESSIBILIDADE_RAMPAS',
];

function infraScore(infra) {
  if (!infra) return null;
  const present = INFRA_SCORE_KEYS.filter(k => infra[k] === 1).length;
  return +(present / INFRA_SCORE_KEYS.length * 100).toFixed(1);
}

/* ── Carregar base principal (normalizada) ── */
const base = JSON.parse(
  readFileSync(join(__dirname, '..', 'base_escolas_tratada.json'), 'utf-8')
);

/* ── Carregar base de infraestrutura (pode vir sem colchetes externos) ── */
const rawInfra = readFileSync(join(__dirname, '..', 'base_i.json'), 'utf-8').trim();
const infraList = JSON.parse(rawInfra.startsWith('[') ? rawInfra : `[${rawInfra}]`);

/* ── Montar mapa inep_id → campos de infra ── */
const infraMap = new Map();
for (const row of infraList) {
  infraMap.set(row.inep_id, {
    IN_BANHEIRO:                  row.IN_BANHEIRO                  ?? null,
    IN_BANHEIRO_PNE:              row.IN_BANHEIRO_PNE              ?? null,
    IN_BIBLIOTECA:                row.IN_BIBLIOTECA                ?? null,
    IN_COZINHA:                   row.IN_COZINHA                   ?? null,
    IN_LABORATORIO_CIENCIAS:      row.IN_LABORATORIO_CIENCIAS      ?? null,
    IN_LABORATORIO_INFORMATICA:   row.IN_LABORATORIO_INFORMATICA   ?? null,
    IN_QUADRA_ESPORTES:           row.IN_QUADRA_ESPORTES           ?? null,
    IN_REFEITORIO:                row.IN_REFEITORIO                ?? null,
    IN_SALA_PROFESSOR:            row.IN_SALA_PROFESSOR            ?? null,
    IN_SECRETARIA:                row.IN_SECRETARIA                ?? null,
    IN_AGUA_POTAVEL:              row.IN_AGUA_POTAVEL              ?? null,
    IN_AGUA_REDE_PUBLICA:         row.IN_AGUA_REDE_PUBLICA         ?? null,
    IN_ENERGIA_REDE_PUBLICA:      row.IN_ENERGIA_REDE_PUBLICA      ?? null,
    IN_ESGOTO_REDE_PUBLICA:       row.IN_ESGOTO_REDE_PUBLICA       ?? null,
    IN_LIXO_SERVICO_COLETA:       row.IN_LIXO_SERVICO_COLETA       ?? null,
    IN_ACESSIBILIDADE_RAMPAS:     row.IN_ACESSIBILIDADE_RAMPAS     ?? null,
    IN_ACESSIBILIDADE_CORRIMAO:   row.IN_ACESSIBILIDADE_CORRIMAO   ?? null,
    IN_ACESSIBILIDADE_PISOS_TATEIS: row.IN_ACESSIBILIDADE_PISOS_TATEIS ?? null,
    IN_COMPUTADOR:                row.IN_COMPUTADOR                ?? null,
    IN_INTERNET:                  row.IN_INTERNET                  ?? null,
    IN_INTERNET_ALUNOS:           row.IN_INTERNET_ALUNOS           ?? null,
    IN_BANDA_LARGA:               row.IN_BANDA_LARGA               ?? null,
    QT_DESKTOP_ALUNO:             row.QT_DESKTOP_ALUNO             ?? null,
    QT_COMP_PORTATIL_ALUNO:       row.QT_COMP_PORTATIL_ALUNO       ?? null,
    QT_TABLET_ALUNO:              row.QT_TABLET_ALUNO              ?? null,
    QT_SALAS_UTILIZADAS:          row.QT_SALAS_UTILIZADAS          ?? null,
    QT_SALAS_UTILIZA_CLIMATIZADAS: row.QT_SALAS_UTILIZA_CLIMATIZADAS ?? null,
    QT_SALAS_UTILIZADAS_ACESSIVEIS: row.QT_SALAS_UTILIZADAS_ACESSIVEIS ?? null,
    QT_PROF_COORDENADOR:          row.QT_PROF_COORDENADOR          ?? null,
    QT_PROF_PSICOLOGO:            row.QT_PROF_PSICOLOGO            ?? null,
    QT_PROF_PEDAGOGIA:            row.QT_PROF_PEDAGOGIA            ?? null,
    QT_PROF_GESTAO:               row.QT_PROF_GESTAO               ?? null,
    QT_PROF_MONITORES:            row.QT_PROF_MONITORES            ?? null,
  });
}

/* ── Merge: base principal + infra ── */
const data = base.map(d => {
  const norm = { ...d, no_municipio: NORM[d.no_municipio] ?? d.no_municipio };
  const infra = infraMap.get(d.inep_id) ?? null;
  return {
    ...norm,
    ...infra,
    infra_score: infraScore(infra),
  };
});

const semInfra = data.filter(d => d.infra_score === null).length;

/* ── Inserir no MongoDB ── */
const MONGODB_URI = process.env.MONGODB_URI ?? 'mongodb://localhost:27017';
const client = new MongoClient(MONGODB_URI);

try {
  await client.connect();
  const col = client.db('observatorio').collection('escolas');

  await col.deleteMany({});
  const { insertedCount } = await col.insertMany(data);
  console.log(`✓ ${insertedCount} escolas inseridas`);
  console.log(`  ├─ ${insertedCount - semInfra} com dados de infraestrutura`);
  console.log(`  └─ ${semInfra} sem par na base_i.json (infra_score = null)`);

  await col.createIndex({ no_municipio: 1 });
  await col.createIndex({ dependencia: 1 });
  await col.createIndex({ ideb: 1 });
  await col.createIndex({ infra_score: 1 });
  await col.createIndex({ nome_escola: 'text' });
  console.log('✓ Índices: no_municipio, dependencia, ideb, infra_score, nome_escola (text)');
} finally {
  await client.close();
}
