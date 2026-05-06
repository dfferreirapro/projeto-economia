import pytest
import pandas as pd
import numpy as np
from unittest.mock import patch, mock_open
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from pipeline_etl.io_utils import detect_encoding, load_data, preview_data, validate_extension
from pipeline_etl.mapping import inspect_columns, suggest_mapping, confirm_mapping, save_mapping, load_mapping
from pipeline_etl.cleaning import remove_duplicates, standardize_municipality, validate_ranges
from pipeline_etl.calculations import calc_aprendizado, calc_ideb, extract_uf
from pipeline_etl.export import aggregate_by_municipality, export_json, format_record


class TestValidateExtension:
    def test_valid_csv(self):
        assert validate_extension("data.csv") is True

    def test_valid_xlsx(self):
        assert validate_extension("data.xlsx") is True

    def test_valid_xls(self):
        assert validate_extension("data.xls") is True

    def test_invalid_txt(self):
        assert validate_extension("data.txt") is False

    def test_invalid_json(self):
        assert validate_extension("data.json") is False

    def test_case_insensitive(self):
        assert validate_extension("data.CSV") is True
        assert validate_extension("data.XLSX") is True


class TestDetectEncoding:
    @patch("builtins.open", new_callable=mock_open, read_data=b"nome,idade\nJoao,25\n")
    def test_detect_utf8(self, mock_file):
        encoding = detect_encoding("dummy.csv")
        assert encoding in ["utf-8", "ascii", "UTF-8-SIG"]

    @patch("builtins.open", new_callable=mock_open, read_data=b"nome,idade\nJo\xe3o,25\n")
    def test_detect_latin1(self, mock_file):
        encoding = detect_encoding("dummy.csv")
        assert encoding in ["latin-1", "cp1252", "ascii"]


class TestLoadData:
    def test_load_csv(self, tmp_path):
        csv_file = tmp_path / "test.csv"
        csv_file.write_text("inep_id,nome_escola,no_municipio\n123,Escola A,Sorocaba\n")
        df = load_data(str(csv_file))
        assert isinstance(df, pd.DataFrame)
        assert len(df) == 1
        assert "inep_id" in df.columns

    def test_load_xlsx(self, tmp_path):
        xlsx_file = tmp_path / "test.xlsx"
        df_original = pd.DataFrame({
            "inep_id": [123, 456],
            "nome_escola": ["Escola A", "Escola B"],
            "no_municipio": ["Sorocaba", "Votorantim"]
        })
        df_original.to_excel(xlsx_file, index=False)
        df = load_data(str(xlsx_file))
        assert isinstance(df, pd.DataFrame)
        assert len(df) == 2

    def test_load_invalid_extension(self):
        with pytest.raises(ValueError):
            load_data("data.txt")


class TestPreviewData:
    def test_preview_returns_string(self, capsys):
        df = pd.DataFrame({"a": [1, 2, 3, 4, 5, 6], "b": ["x"] * 6})
        result = preview_data(df)
        assert isinstance(result, str)
        assert len(result) > 0


class TestInspectColumns:
    def test_inspect_returns_dict(self):
        df = pd.DataFrame({
            "col_a": [1, 2, None],
            "col_b": ["x", "y", "z"]
        })
        result = inspect_columns(df)
        assert isinstance(result, dict)
        assert "col_a" in result
        assert "col_b" in result
        assert result["col_a"]["null_pct"] == pytest.approx(33.33, abs=0.1)
        assert result["col_b"]["null_pct"] == 0.0

    def test_inspect_with_all_nulls(self):
        df = pd.DataFrame({"col_null": [None, None, None]})
        result = inspect_columns(df)
        assert result["col_null"]["null_pct"] == 100.0


class TestSuggestMapping:
    def test_exact_match(self):
        source = ["inep_id", "nome_escola", "municipio"]
        target = ["inep_id", "nome_escola", "no_municipio"]
        result = suggest_mapping(source, target)
        assert result["inep_id"] == "inep_id"
        assert result["nome_escola"] == "nome_escola"

    def test_fuzzy_match(self):
        source = ["cod_inep", "nome", "cidade"]
        target = ["inep_id", "nome_escola", "no_municipio"]
        result = suggest_mapping(source, target)
        assert "inep_id" in result.values() or "cod_inep" in result

    def test_empty_source(self):
        result = suggest_mapping([], ["inep_id"])
        assert result == {}

    def test_threshold_filter(self):
        source = ["xyz_random_column"]
        target = ["inep_id", "nome_escola"]
        result = suggest_mapping(source, target)
        assert "xyz_random_column" not in result


class TestConfirmMapping:
    @patch("builtins.input", return_value="Y")
    def test_accept_mapping(self, mock_input):
        suggestions = {"cod_inep": "inep_id", "nome": "nome_escola"}
        result = confirm_mapping(suggestions)
        assert result == suggestions

    @patch("builtins.input", side_effect=["n", "inep_id"])
    def test_manual_override(self, mock_input):
        suggestions = {"cod_inep": "inep_id"}
        result = confirm_mapping(suggestions)
        assert result["cod_inep"] == "inep_id"


class TestSaveLoadMapping:
    def test_save_and_load(self, tmp_path):
        mapping = {"col_a": "inep_id", "col_b": "nome_escola"}
        path = str(tmp_path / "mapping.json")
        save_mapping(mapping, path)
        loaded = load_mapping(path)
        assert loaded == mapping

    def test_load_nonexistent(self, tmp_path):
        path = str(tmp_path / "nonexistent.json")
        result = load_mapping(path)
        assert result is None


class TestRemoveDuplicates:
    def test_remove_by_inep_id(self):
        df = pd.DataFrame({
            "inep_id": [1, 2, 2, 3],
            "nome": ["A", "B", "B_dup", "C"]
        })
        result = remove_duplicates(df, "inep_id")
        assert len(result) == 3
        assert list(result["inep_id"]) == [1, 2, 3]

    def test_no_duplicates(self):
        df = pd.DataFrame({"inep_id": [1, 2, 3]})
        result = remove_duplicates(df, "inep_id")
        assert len(result) == 3


class TestStandardizeMunicipality:
    def test_title_case(self):
        df = pd.DataFrame({"no_municipio": ["sorocaba", "VOTORANTIM", "sao paulo"]})
        result = standardize_municipality(df)
        assert result.loc[0, "no_municipio"] == "Sorocaba"
        assert result.loc[1, "no_municipio"] == "Votorantim"

    def test_strip_whitespace(self):
        df = pd.DataFrame({"no_municipio": ["  Sorocaba  ", " Votorantim "]})
        result = standardize_municipality(df)
        assert result.loc[0, "no_municipio"] == "Sorocaba"

    def test_handles_nulls(self):
        df = pd.DataFrame({"no_municipio": ["sorocaba", None, "  "]})
        result = standardize_municipality(df)
        assert result.loc[0, "no_municipio"] == "Sorocaba"


class TestValidateRanges:
    def test_valid_data_unchanged(self):
        df = pd.DataFrame({
            "ideb": [6.5, 7.2],
            "fluxo": [0.98, 1.0],
            "nota_mt": [230.0, 250.0],
            "nota_lp": [220.0, 240.0]
        })
        result, removed = validate_ranges(df)
        assert len(result) == 2
        assert removed == 0

    def test_remove_invalid_ideb(self):
        df = pd.DataFrame({
            "ideb": [6.5, 11.0, -1.0, 0.0],
            "fluxo": [0.98, 0.99, 0.97, 0.95],
            "nota_mt": [230.0, 240.0, 220.0, 210.0],
            "nota_lp": [220.0, 230.0, 210.0, 200.0]
        })
        result, removed = validate_ranges(df)
        assert removed >= 1

    def test_remove_invalid_fluxo(self):
        df = pd.DataFrame({
            "ideb": [6.5, 7.0],
            "fluxo": [0.98, 1.5],
            "nota_mt": [230.0, 240.0],
            "nota_lp": [220.0, 230.0]
        })
        result, removed = validate_ranges(df)
        assert removed >= 1

    def test_remove_invalid_saeb(self):
        df = pd.DataFrame({
            "ideb": [6.5, 7.0],
            "fluxo": [0.98, 0.99],
            "nota_mt": [230.0, 600.0],
            "nota_lp": [220.0, 230.0]
        })
        result, removed = validate_ranges(df)
        assert removed >= 1

    def test_nulls_are_kept(self):
        df = pd.DataFrame({
            "ideb": [6.5, None],
            "fluxo": [0.98, None],
            "nota_mt": [230.0, None],
            "nota_lp": [220.0, None]
        })
        result, removed = validate_ranges(df)
        assert len(result) == 2


class TestCalcAprendizado:
    def test_basic_calculation(self):
        df = pd.DataFrame({
            "nota_lp": [213.75, 200.0],
            "nota_mt": [227.32, 210.0]
        })
        result = calc_aprendizado(df)
        assert "aprendizado" in result.columns
        assert result.loc[0, "aprendizado"] == pytest.approx(4.41, abs=0.1)

    def test_null_handling(self):
        df = pd.DataFrame({
            "nota_lp": [213.75, None],
            "nota_mt": [227.32, 200.0]
        })
        result = calc_aprendizado(df)
        assert pd.isna(result.loc[1, "aprendizado"])


class TestCalcIdeb:
    def test_ideb_formula(self):
        df = pd.DataFrame({
            "fluxo": [1.0, 0.98],
            "aprendizado": [6.19, 5.5]
        })
        result = calc_ideb(df)
        assert "ideb" in result.columns
        assert result.loc[0, "ideb"] == pytest.approx(6.19, abs=0.1)
        assert result.loc[1, "ideb"] == pytest.approx(5.39, abs=0.1)

    def test_null_handling(self):
        df = pd.DataFrame({
            "fluxo": [1.0, None],
            "aprendizado": [6.19, 5.5]
        })
        result = calc_ideb(df)
        assert pd.isna(result.loc[1, "ideb"])


class TestExtractUf:
    def test_sao_paulo(self):
        df = pd.DataFrame({"no_estado": ["Sao Paulo", "SAO PAULO", "sao paulo"]})
        result = extract_uf(df, "no_estado")
        assert "uf_estado" in result.columns
        assert all(result["uf_estado"] == "SP")

    def test_multiple_states(self):
        df = pd.DataFrame({"no_estado": ["Sao Paulo", "Rio de Janeiro", "Minas Gerais"]})
        result = extract_uf(df, "no_estado")
        assert result.loc[0, "uf_estado"] == "SP"
        assert result.loc[1, "uf_estado"] == "RJ"
        assert result.loc[2, "uf_estado"] == "MG"


class TestAggregateByMunicipality:
    def test_aggregation(self):
        df = pd.DataFrame({
            "no_municipio": ["Sorocaba", "Sorocaba", "Votorantim"],
            "ideb": [6.5, 7.0, 6.8],
            "fluxo": [0.98, 0.99, 1.0]
        })
        result = aggregate_by_municipality(df)
        assert isinstance(result, pd.DataFrame)
        assert len(result) == 2


class TestFormatRecord:
    def test_types(self):
        record = {
            "inep_id": 35004421,
            "nome_escola": "ESCOLA TESTE",
            "no_municipio": "Sorocaba",
            "no_estado": "Sao Paulo",
            "uf_estado": "SP",
            "dependencia": "Municipal",
            "ano": 2023,
            "ideb": 6.2,
            "fluxo": 1.0,
            "aprendizado": 6.19,
            "nota_mt": 227.32,
            "nota_lp": 213.75
        }
        result = format_record(record)
        assert isinstance(result["inep_id"], int)
        assert isinstance(result["ano"], int)
        assert isinstance(result["ideb"], float)

    def test_null_handling(self):
        record = {
            "inep_id": 35004421,
            "nome_escola": "ESCOLA TESTE",
            "no_municipio": "Sorocaba",
            "no_estado": "Sao Paulo",
            "uf_estado": "SP",
            "dependencia": "Municipal",
            "ano": 2023,
            "ideb": None,
            "fluxo": None,
            "aprendizado": None,
            "nota_mt": None,
            "nota_lp": None
        }
        result = format_record(record)
        assert result["ideb"] is None
        assert result["nota_mt"] is None


class TestExportJson:
    def test_export_creates_file(self, tmp_path):
        df = pd.DataFrame({
            "inep_id": [123],
            "nome_escola": ["Escola A"],
            "no_municipio": ["Sorocaba"],
            "no_estado": ["Sao Paulo"],
            "uf_estado": ["SP"],
            "dependencia": ["Municipal"],
            "ano": [2023],
            "ideb": [6.2],
            "fluxo": [1.0],
            "aprendizado": [6.19],
            "nota_mt": [227.32],
            "nota_lp": [213.75]
        })
        output_path = str(tmp_path / "test_output.json")
        export_json(df, output_path)
        assert os.path.exists(output_path)
        with open(output_path) as f:
            data = json.load(f)
        assert isinstance(data, list)
        assert len(data) == 1
        assert data[0]["inep_id"] == 123
