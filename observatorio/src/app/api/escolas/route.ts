import { NextResponse } from 'next/server';
import { getClient } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const client = await getClient();
    const data = await client
      .db('observatorio')
      .collection('escolas')
      .find({}, { projection: { _id: 0 } })
      .toArray();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Erro ao buscar dados' }, { status: 500 });
  }
}
