import pandas as pd
import constants
import argparse
import json

parser = argparse.ArgumentParser()
parser.add_argument('--model', type=str, help='Model name to override config.json', default=None)
args = parser.parse_args()

MODEL = args.model if args.model else constants.MODEL
df = pd.read_csv(constants.get_results_path(MODEL))

reasoning_skills = ["inductive", "deductive", "numerical", "spatial", "mechanical"]
capabilities = ["diagram", "ocr", "patterns", "graphs", "tables", "3d shapes", "puzzles", "sequences", "physics"]

summary = {
    "model": MODEL,
    "total": {
        "correct": int(df["match?"].sum()),
        "total": int(df.shape[0])
    },
    "skills": [],
    "capabilities": []
}

for skill in reasoning_skills:
    subset = df[df["reasoning skill"].str.contains(skill, case=False, na=False)]
    summary["skills"].append({
        "name": skill,
        "correct": int(subset["match?"].sum()),
        "total": int(subset.shape[0])
    })

for cap in capabilities:
    subset = df[df["capability"].astype(str).str.contains(cap, case=False, na=False)]
    summary["capabilities"].append({
        "name": cap,
        "correct": int(subset["match?"].sum()),
        "total": int(subset.shape[0])
    })

print(json.dumps(summary))
