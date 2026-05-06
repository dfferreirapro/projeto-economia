import pandas as pd
import numpy as np


STATE_TO_UF = {
    'sao paulo': 'SP', 'rio de janeiro': 'RJ', 'minas gerais': 'MG',
    'bahia': 'BA', 'parana': 'PR', 'rio grande do sul': 'RS',
    'pernambuco': 'PE', 'ceara': 'CE', 'para': 'PA',
    'maranhao': 'MA', 'santa catarina': 'SC', 'goias': 'GO',
    'amazonas': 'AM', 'espirito santo': 'ES', 'paraiba': 'PB',
    'mato grosso': 'MT', 'mato grosso do sul': 'MS', 'piaui': 'PI',
    'alagoas': 'AL', 'distrito federal': 'DF', 'rio grande do norte': 'RN',
    'sergipe': 'SE', 'rondonia': 'RO', 'tocantins': 'TO',
    'acre': 'AC', 'amapa': 'AP', 'roraima': 'RR'
}


def calc_aprendizado(df):
    df = df.copy()
    df['aprendizado'] = (df['nota_lp'] + df['nota_mt']) / 100
    return df


def calc_ideb(df):
    df = df.copy()
    df['ideb'] = df['fluxo'] * df['aprendizado']
    return df


def extract_uf(df, col_estado='no_estado'):
    import unicodedata
    df = df.copy()
    def get_uf(estado):
        if pd.isna(estado):
            return None
        key = str(estado).strip().lower()
        normalized = ''
        for char in key:
            if ord(char) > 127:
                char = unicodedata.normalize('NFKD', char).encode('ascii', 'ignore').decode('ascii')
            normalized += char
        return STATE_TO_UF.get(normalized, None)
    df['uf_estado'] = df[col_estado].apply(get_uf)
    return df
