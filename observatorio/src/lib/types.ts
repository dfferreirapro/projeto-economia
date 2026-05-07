export interface Escola {
  inep_id: number;
  nome_escola: string;
  no_municipio: string;
  no_estado: string;
  uf_estado: string;
  dependencia: string;
  ano: number;
  ideb: number | null;
  fluxo: number | null;
  aprendizado: number | null;
  nota_mt: number | null;
  nota_lp: number | null;
}

export interface Filters {
  city: string;
  dep: string;
  idebRange: string;
  onlyIdeb: boolean;
  search: string;
}
