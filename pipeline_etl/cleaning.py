import pandas as pd
import unicodedata


def remove_duplicates(df, key='inep_id'):
    before = len(df)
    df_clean = df.drop_duplicates(subset=[key], keep='first')
    after = len(df_clean)
    removed = before - after
    if removed > 0:
        print(f'Removidas {removed} duplicatas por {key}')
    return df_clean


def standardize_municipality(df, col='no_municipio'):
    def clean_name(name):
        if pd.isna(name):
            return name
        name = str(name).strip()
        if not name:
            return None
        normalized = unicodedata.normalize('NFKD', name)
        ascii_name = normalized.encode('ascii', 'ignore').decode('ascii')
        return ascii_name.title()
    df = df.copy()
    df[col] = df[col].apply(clean_name)
    return df


def validate_ranges(df):
    df = df.copy()
    mask = pd.Series([True] * len(df), index=df.index)

    if 'ideb' in df.columns:
        ideb_mask = df['ideb'].isna() | ((df['ideb'] > 0) & (df['ideb'] <= 10))
        invalid = (~ideb_mask).sum()
        if invalid > 0:
            print(f'Aviso: {invalid} linhas removidas - ideb fora do range (0, 10]')
        mask &= ideb_mask

    if 'fluxo' in df.columns:
        fluxo_mask = df['fluxo'].isna() | ((df['fluxo'] > 0) & (df['fluxo'] <= 1))
        invalid = (~fluxo_mask).sum()
        if invalid > 0:
            print(f'Aviso: {invalid} linhas removidas - fluxo fora do range (0, 1]')
        mask &= fluxo_mask

    for nota_col in ['nota_mt', 'nota_lp']:
        if nota_col in df.columns:
            nota_mask = df[nota_col].isna() | ((df[nota_col] >= 0) & (df[nota_col] <= 500))
            invalid = (~nota_mask).sum()
            if invalid > 0:
                print(f'Aviso: {invalid} linhas removidas - {nota_col} fora do range [0, 500]')
            mask &= nota_mask

    df_valid = df[mask].reset_index(drop=True)
    removed_count = len(df) - len(df_valid)
    return df_valid, removed_count
