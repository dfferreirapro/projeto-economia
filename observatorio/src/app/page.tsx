import { getClient } from '@/lib/mongodb';
import Dashboard from '@/components/Dashboard';
import type { Escola } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const client = await getClient();
  const raw = await client
    .db('observatorio')
    .collection('escolas')
    .find({}, { projection: { _id: 0 } })
    .toArray();

  const data: Escola[] = JSON.parse(JSON.stringify(raw));
  return <Dashboard initialData={data} />;
}
