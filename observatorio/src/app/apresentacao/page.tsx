import { getClient } from '@/lib/mongodb';
import Presentation from '@/components/Presentation';
import type { Escola } from '@/lib/types';
import './apresentacao.css';

export const dynamic = 'force-dynamic';

export default async function ApresentacaoPage() {
  const client = await getClient();
  const raw = await client
    .db('observatorio')
    .collection('escolas')
    .find({}, { projection: { _id: 0 } })
    .toArray();

  const data: Escola[] = JSON.parse(JSON.stringify(raw));
  return <Presentation initialData={data} />;
}
