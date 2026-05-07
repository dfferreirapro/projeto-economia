import { createRequire } from 'module';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const _require = createRequire(join(__dirname, '..', 'observatorio', 'package.json'));
const { MongoClient } = _require('mongodb');

const NORM = {
  'SOROCABA':   'Sorocaba',
  'BRASÍLIA':   'Brasília',
  'RECIFE':     'Recife',
  'PATO BRANCO':'Pato Branco',
};

const raw  = JSON.parse(readFileSync(join(__dirname, '..', 'base_escolas_tratada.json'), 'utf-8'));
const data = raw.map(d => ({ ...d, no_municipio: NORM[d.no_municipio] ?? d.no_municipio }));

const client = new MongoClient('mongodb://localhost:27017');

try {
  await client.connect();
  const col = client.db('observatorio').collection('escolas');

  await col.deleteMany({});
  const { insertedCount } = await col.insertMany(data);
  console.log(`✓ ${insertedCount} escolas inseridas`);

  await col.createIndex({ no_municipio: 1 });
  await col.createIndex({ dependencia: 1 });
  await col.createIndex({ ideb: 1 });
  await col.createIndex({ nome_escola: 'text' });
  console.log('✓ Índices criados: no_municipio, dependencia, ideb, nome_escola (text)');
} finally {
  await client.close();
}
