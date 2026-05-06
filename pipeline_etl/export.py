import pandas as pd
import json
import os
from datetime import datetime


def aggregate_by_municipality(df):
    agg_dict = {}
    if 'ideb' in df.columns:
        agg_dict['ideb'] = ['mean', 'count']
    if 'fluxo' in df.columns:
        agg_dict['fluxo'] = 'mean'
    if 'nota_mt' in df.columns:
        agg_dict['nota_mt'] = 'mean'
    if 'nota_lp' in df.columns:
        agg_dict['nota_lp'] = 'mean'

    if agg_dict:
        result = df.groupby('no_municipio').agg(agg_dict)
    else:
        result = df.groupby('no_municipio').size().to_frame('count')
    return result


def format_record(record):
    formatted = {}
    for key, value in record.items():
        if key in ('inep_id', 'ano'):
            formatted[key] = int(value) if pd.notna(value) else None
        elif key in ('ideb', 'fluxo', 'aprendizado', 'nota_mt', 'nota_lp'):
            formatted[key] = float(round(value, 2)) if pd.notna(value) else None
        else:
            formatted[key] = value if pd.notna(value) else None
    return formatted


def export_json(df, output_path):
    records = []
    for _, row in df.iterrows():
        record = row.to_dict()
        formatted = format_record(record)
        records.append(formatted)

    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(records, f, indent=4, ensure_ascii=False)
    print(f'JSON exportado: {output_path} ({len(records)} registros)')
    return len(records)


def append_historico(source_file, total_read, total_written, mapping_count, output_path='.historico.md'):
    entry = f'### Sessao Pipeline - {datetime.now().strftime("%Y-%m-%d")}\n'
    entry += f'Fonte: {source_file}\n'
    entry += f'Linhas lidas: {total_read}\n'
    entry += f'Linhas exportadas: {total_written}\n'
    entry += f'Campos mapeados: {mapping_count}\n\n'

    with open(output_path, 'a', encoding='utf-8') as f:
        f.write(entry)
    print(f'Historico atualizado: {output_path}')


def generate_report(total_read, total_written, removed, mapping):
    print()
    print('=== Relatorio de Execucao ===')
    print(f'Total linhas lidas: {total_read}')
    print(f'Total linhas removidas: {removed}')
    print(f'Total linhas exportadas: {total_written}')
    print(f'Campos mapeados: {len(mapping)}')
    print('=' * 30)
