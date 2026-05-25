import json
import csv
import os
from collections import defaultdict
from datetime import datetime, timezone

DATA_DIR = os.path.join(os.path.dirname(__file__), '..', 'EduMetrics', 'data')
TRAT_DIR = os.path.dirname(__file__)

def load_json(rel_path):
    with open(os.path.join(TRAT_DIR, rel_path), 'r', encoding='utf-8') as f:
        return json.load(f)

def format_br(val):
    if val is None:
        return None
    return round(float(val), 2)

def extrair_votorantim():
    raw = load_json('base_votorantim.json')
    serie = []
    for ano_str, data in sorted(raw.items()):
        ano = int(ano_str)
        total = format_br(data.get('total_ano'))
        serie.append({
            'ano': ano,
            'investimento': total,
            'fonte': 'base_votorantim.json'
        })
    return {'municipio': 'Votorantim', 'uf': 'SP', 'serie': serie}

def extrair_sorocaba():
    raw = load_json('base_sorocaba.json')
    registros = raw.get('resumo_ensino_fundamental', [])
    por_ano = defaultdict(list)
    for r in registros:
        ano = r['ano']
        por_ano[ano].append(r)
    serie = []
    for ano in sorted(por_ano.keys()):
        registros_ano = por_ano[ano]
        max_trim = max(r['trimestre'] for r in registros_ano)
        total = None
        for r in registros_ano:
            if r['trimestre'] == max_trim:
                total = format_br(r['liquidada_valor'])
                break
        serie.append({
            'ano': ano,
            'investimento': total,
            'fonte': 'base_sorocaba.json'
        })
    return {'municipio': 'Sorocaba', 'uf': 'SP', 'serie': serie}

def extrair_sobral():
    raw = load_json('base_sobral.json')
    registros = raw.get('ensino_fundamental', [])
    por_ano = defaultdict(list)
    for r in registros:
        ano = r['ano']
        por_ano[ano].append(r)
    serie = []
    for ano in sorted(por_ano.keys()):
        registros_ano = por_ano[ano]
        max_bim = max(r['bimestre'] for r in registros_ano)
        total = None
        for r in registros_ano:
            if r['bimestre'] == max_bim:
                total = format_br(r['liquidada_valor'])
                break
        serie.append({
            'ano': ano,
            'investimento': total,
            'fonte': 'base_sobral.json'
        })
    return {'municipio': 'Sobral', 'uf': 'CE', 'serie': serie}

def processar_matriculas():
    inep_muni = {}
    base_i_path = os.path.join(DATA_DIR, 'base_i.json')
    with open(base_i_path, 'r', encoding='utf-8') as f:
        escolas = json.load(f)
    for escola in escolas:
        cod = str(escola.get('inep_id') or escola.get('co_entidade') or '').strip()
        muni = escola.get('no_municipio', '').strip()
        uf = escola.get('uf_estado', '').strip().upper()
        if cod and muni:
            inep_muni[cod] = (muni, uf)

    csv_path = os.path.join(TRAT_DIR, 'Tabela_Matricula_2025.csv')
    matriculas_por_muni = defaultdict(int)
    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f, delimiter=';')
        for row in reader:
            cod_escola = row.get('CO_ENTIDADE', '').strip()
            qt_mat_fund = row.get('QT_MAT_FUND', '0').strip()
            if not qt_mat_fund or not qt_mat_fund.replace('-', '').replace(',', '').isdigit():
                continue
            qt = int(float(qt_mat_fund.replace(',', '.')))
            if cod_escola in inep_muni:
                muni, uf = inep_muni[cod_escola]
                if muni in ['Sorocaba', 'Sobral', 'Votorantim']:
                    matriculas_por_muni[(muni, uf)] += qt

    return matriculas_por_muni

def merge_dados():
    cidades = [
        extrair_votorantim(),
        extrair_sorocaba(),
        extrair_sobral()
    ]
    matriculas = processar_matriculas()
    anos_disponiveis = sorted(set(
        ano for cidade in cidades for ano in [r['ano'] for r in cidade['serie']]
    ))
    TODOS_ANOS = [2021, 2022, 2023, 2024, 2025]
    for cidade in cidades:
        anos_existentes = {r['ano'] for r in cidade['serie']}
        for ano in TODOS_ANOS:
            if ano not in anos_existentes:
                cidade['serie'].append({
                    'ano': ano,
                    'investimento': None,
                    'fonte': None
                })
        cidade['serie'].sort(key=lambda r: r['ano'])
    for cidade in cidades:
        key = (cidade['municipio'], cidade['uf'])
        for r in cidade['serie']:
            anoinv = r['ano']
            if anoinv == 2025 and key in matriculas:
                r['matriculas'] = matriculas[key]
                r['investimento_por_aluno'] = format_br(r['investimento'] / matriculas[key]) if r['investimento'] else None
            else:
                r['matriculas'] = None
                r['investimento_por_aluno'] = None

    saida = {
        'metadados': {
            'gerado_em': datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ'),
            'anos': anos_disponiveis,
            'municipios': [c['municipio'] for c in cidades],
            'observacao_matriculas': 'Matriculas disponiveis apenas para 2025 (Censo Escolar INEP). Anos anteriores mostram apenas investimento total.'
        },
        'dados': cidades
    }

    saida_path = os.path.join(DATA_DIR, 'investimentos_novo.json')
    with open(saida_path, 'w', encoding='utf-8') as f:
        json.dump(saida, f, ensure_ascii=False, indent=2)

    print(f'Base unificada gerada: {saida_path}')
    print(f'Municipios: {", ".join(c["municipio"] for c in cidades)}')
    print(f'Anos: {", ".join(str(a) for a in anos_disponiveis)}')
    for c in cidades:
        key = (c['municipio'], c['uf'])
        m = matriculas.get(key, 'N/A')
        print(f'  {c["municipio"]}/{c["uf"]}: matriculas 2025 = {m}')
    print('Concluido.')

if __name__ == '__main__':
    merge_dados()
