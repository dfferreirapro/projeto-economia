import pytest
import pandas as pd
import numpy as np

@pytest.fixture
def sample_school_data():
    return pd.DataFrame({
        'inep_id': [35004421, 35004422, 35004958],
        'nome_escola': ['ESCOLA A', 'ESCOLA B', 'ESCOLA C'],
        'no_municipio': ['Sorocaba', 'Sorocaba', 'Votorantim'],
        'no_estado': ['Sao Paulo', 'Sao Paulo', 'Sao Paulo'],
        'dependencia': ['Municipal', 'Municipal', 'Municipal'],
        'ano': [2023, 2023, 2023],
        'ideb': [6.2, 5.4, None],
        'fluxo': [1.0, 0.99, 0.99],
        'nota_mt': [227.32, 208.83, None],
        'nota_lp': [213.75, 190.92, None]
    })
