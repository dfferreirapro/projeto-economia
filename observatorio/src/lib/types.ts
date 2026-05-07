export interface Escola {
  /* ── Identificação ── */
  inep_id:      number;
  nome_escola:  string;
  no_municipio: string;
  no_estado:    string;
  uf_estado:    string;
  dependencia:  string;
  ano:          number;

  /* ── Desempenho ── */
  ideb:         number | null;
  fluxo:        number | null;
  aprendizado:  number | null;
  nota_mt:      number | null;
  nota_lp:      number | null;

  /* ── Infraestrutura (0 = não tem, 1 = tem, null = sem dado) ── */
  IN_BANHEIRO:                    number | null;
  IN_BANHEIRO_PNE:                number | null;
  IN_BIBLIOTECA:                  number | null;
  IN_COZINHA:                     number | null;
  IN_LABORATORIO_CIENCIAS:        number | null;
  IN_LABORATORIO_INFORMATICA:     number | null;
  IN_QUADRA_ESPORTES:             number | null;
  IN_REFEITORIO:                  number | null;
  IN_SALA_PROFESSOR:              number | null;
  IN_SECRETARIA:                  number | null;
  IN_AGUA_POTAVEL:                number | null;
  IN_AGUA_REDE_PUBLICA:           number | null;
  IN_ENERGIA_REDE_PUBLICA:        number | null;
  IN_ESGOTO_REDE_PUBLICA:         number | null;
  IN_LIXO_SERVICO_COLETA:         number | null;
  IN_ACESSIBILIDADE_RAMPAS:       number | null;
  IN_ACESSIBILIDADE_CORRIMAO:     number | null;
  IN_ACESSIBILIDADE_PISOS_TATEIS: number | null;
  IN_COMPUTADOR:                  number | null;
  IN_INTERNET:                    number | null;
  IN_INTERNET_ALUNOS:             number | null;
  IN_BANDA_LARGA:                 number | null;

  /* ── Quantitativos ── */
  QT_DESKTOP_ALUNO:               number | null;
  QT_COMP_PORTATIL_ALUNO:         number | null;
  QT_TABLET_ALUNO:                number | null;
  QT_SALAS_UTILIZADAS:            number | null;
  QT_SALAS_UTILIZA_CLIMATIZADAS:  number | null;
  QT_SALAS_UTILIZADAS_ACESSIVEIS: number | null;
  QT_PROF_COORDENADOR:            number | null;
  QT_PROF_PSICOLOGO:              number | null;
  QT_PROF_PEDAGOGIA:              number | null;
  QT_PROF_GESTAO:                 number | null;
  QT_PROF_MONITORES:              number | null;

  /* ── Calculado no seed ── */
  infra_score: number | null; // % de 12 itens-chave de infra presentes
}

export interface Filters {
  city:      string;
  dep:       string;
  idebRange: string;
  onlyIdeb:  boolean;
  search:    string;
}
