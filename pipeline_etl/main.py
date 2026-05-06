import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from io_utils import load_data, preview_data, validate_extension
from mapping import inspect_columns, suggest_mapping, confirm_mapping, save_mapping, load_mapping, TARGET_KEYS
from cleaning import remove_duplicates, standardize_municipality, validate_ranges
from calculations import calc_aprendizado, calc_ideb, extract_uf
from export import aggregate_by_municipality, export_json, append_historico, generate_report


MAPPING_CACHE = 'mapping_cache.json'
OUTPUT_JSON = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'base_escolas_tratada.json')


def main():
    print('=== Pipeline ETL Educacional ===')
    print()

    file_path = input('Caminho do arquivo de origem: ').strip()
    if not file_path or not os.path.exists(file_path):
        print('Erro: Arquivo nao encontrado.')
        sys.exit(1)

    if not validate_extension(file_path):
        print('Erro: Formato nao suportado. Use .csv, .xlsx, .xls')
        sys.exit(1)

    print(f'Carregando: {file_path}')
    df = load_data(file_path)
    preview_data(df)

    inspect_columns(df)

    cached_mapping = load_mapping(MAPPING_CACHE)
    if cached_mapping:
        use_cached = input('Usar mapeamento salvo? [Y/n]: ').strip().lower()
        if use_cached not in ('n', 'no'):
            mapping = cached_mapping
        else:
            source_cols = df.columns.tolist()
            suggestions = suggest_mapping(source_cols, TARGET_KEYS)
            mapping = confirm_mapping(suggestions)
            save = input('Salvar mapeamento? [Y/n]: ').strip().lower()
            if save not in ('n', 'no'):
                save_mapping(mapping, MAPPING_CACHE)
    else:
        source_cols = df.columns.tolist()
        suggestions = suggest_mapping(source_cols, TARGET_KEYS)
        mapping = confirm_mapping(suggestions)
        save = input('Salvar mapeamento para uso futuro? [Y/n]: ').strip().lower()
        if save not in ('n', 'no'):
            save_mapping(mapping, MAPPING_CACHE)

    df_renamed = df.rename(columns=mapping)

    for key in TARGET_KEYS:
        if key not in df_renamed.columns:
            df_renamed[key] = None

    df_renamed = remove_duplicates(df_renamed, 'inep_id')
    df_renamed = standardize_municipality(df_renamed)

    total_before_clean = len(df_renamed)
    df_renamed, removed = validate_ranges(df_renamed)

    df_renamed = calc_aprendizado(df_renamed)
    df_renamed = extract_uf(df_renamed, 'no_estado')
    df_renamed = calc_ideb(df_renamed)

    print()
    print('=== Resumo por Municipio ===')
    summary = aggregate_by_municipality(df_renamed)
    print(summary)
    print()

    answer = input('Deseja exportar o arquivo JSON? [Y/n]: ').strip().lower()
    if answer in ('n', 'no'):
        print('Exportacao cancelada.')
        sys.exit(0)

    total_read = len(df)
    total_removed = total_before_clean - len(df_renamed)

    export_json(df_renamed, OUTPUT_JSON)
    generate_report(total_read, len(df_renamed), total_removed, mapping)
    append_historico(file_path, total_read, len(df_renamed), len(mapping))

    print()
    print('Pipeline concluido com sucesso!')


if __name__ == '__main__':
    main()
