import chardet
import pandas as pd
import os


SUPPORTED_EXTENSIONS = {'.csv', '.xlsx', '.xls'}


def validate_extension(file_path):
    ext = os.path.splitext(file_path)[1].lower()
    return ext in SUPPORTED_EXTENSIONS


def detect_encoding(file_path):
    with open(file_path, 'rb') as f:
        raw_data = f.read(10000)
    result = chardet.detect(raw_data)
    encoding = result.get('encoding', 'utf-8')
    encoding_map = {
        'ascii': 'utf-8',
        'UTF-8-SIG': 'utf-8',
        'Windows-1252': 'cp1252',
    }
    return encoding_map.get(encoding, encoding)


def load_data(file_path):
    if not validate_extension(file_path):
        raise ValueError(f'Formato nao suportado: {os.path.splitext(file_path)[1]}. Use {SUPPORTED_EXTENSIONS}')
    ext = os.path.splitext(file_path)[1].lower()
    if ext == '.csv':
        encoding = detect_encoding(file_path)
        df = pd.read_csv(file_path, encoding=encoding)
    elif ext in ('.xlsx', '.xls'):
        engine = 'openpyxl' if ext == '.xlsx' else 'xlrd'
        df = pd.read_excel(file_path, engine=engine)
    else:
        raise ValueError(f'Extensao nao suportada: {ext}')
    return df


def preview_data(df, n=5):
    preview = df.head(n).to_string()
    print()
    print('=== Preview dos Dados (primeiras 5 linhas) ===')
    print(preview)
    print(f'Total de linhas: {len(df)}')
    print(f'Total de colunas: {len(df.columns)}')
    print('=' * 50)
    return preview
