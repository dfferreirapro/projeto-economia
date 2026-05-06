import json
import os
from thefuzz import process


TARGET_KEYS = [
    'inep_id', 'nome_escola', 'no_municipio', 'no_estado',
    'uf_estado', 'dependencia', 'ano', 'ideb', 'fluxo',
    'aprendizado', 'nota_mt', 'nota_lp'
]


def inspect_columns(df):
    info = {}
    for col in df.columns:
        null_count = df[col].isna().sum()
        null_pct = (null_count / len(df)) * 100
        info[col] = {
            'dtype': str(df[col].dtype),
            'null_count': int(null_count),
            'null_pct': round(null_pct, 2),
            'sample': str(df[col].dropna().iloc[0]) if not df[col].dropna().empty else None
        }
    print()
    print('=== Inspecao de Colunas ===')
    for col, data in info.items():
        dtype = data['dtype']
        null_pct = data['null_pct']
        print(f'  {col}: tipo={dtype}, nulos={null_pct}%')
    print('=' * 40)
    return info


def suggest_mapping(source_cols, target_keys=None, threshold=60):
    if target_keys is None:
        target_keys = TARGET_KEYS
    mapping = {}
    for src in source_cols:
        result = process.extractOne(src, target_keys)
        if result:
            match, score = result[0], result[1]
            if score >= threshold:
                mapping[src] = match
    return mapping


def confirm_mapping(suggestions):
    print()
    print('=== Mapeamento Sugerido ===')
    final_mapping = {}
    for src, target in suggestions.items():
        answer = input(f'  {src} -> {target} ? [Y/n]: ').strip().lower()
        if answer in ('n', 'no'):
            manual = input(f'  Digite a coluna alvo para "{src}": ').strip()
            if manual:
                final_mapping[src] = manual
        else:
            final_mapping[src] = target
    print()
    print('Mapeamento final:')
    for src, target in final_mapping.items():
        print(f'  {src} -> {target}')
    return final_mapping


def save_mapping(mapping, path):
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(mapping, f, indent=2, ensure_ascii=False)
    print(f'Mapeamento salvo em: {path}')


def load_mapping(path):
    if not os.path.exists(path):
        return None
    with open(path, 'r', encoding='utf-8') as f:
        return json.load(f)
