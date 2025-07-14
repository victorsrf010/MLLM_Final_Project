import os
import json

CONFIG_PATH = os.path.join(os.path.dirname(__file__), "config.json")

if not os.path.exists(CONFIG_PATH):
    raise FileNotFoundError("Missing config.json. Save model and API key via interface.")

with open(CONFIG_PATH, "r", encoding="utf-8") as f:
    cfg = json.load(f)

MODEL = cfg.get("MODEL", "gpt-4o")

if MODEL.startswith("gpt"):
    APIKEY = cfg.get("OPENAI_APIKEY", "").strip()
elif MODEL.startswith("gemini"):
    APIKEY = cfg.get("GOOGLE_APIKEY", "").strip()
else:
    APIKEY = ""

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

def get_answers_path(model: str) -> str:
    return os.path.join(PROJECT_ROOT, "eval", "answers", f"{model}-answers.json")

def get_results_path(model: str) -> str:
    return os.path.join(PROJECT_ROOT, "eval", "results", f"{model}-accuracy-results.csv")

DATASET_PATH = os.path.join(PROJECT_ROOT, "data", "dataset.json")
