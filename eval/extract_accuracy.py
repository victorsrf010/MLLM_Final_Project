#!/usr/bin/env python3
import os
import json
import re
import constants
import pandas as pd
from tqdm import tqdm
from openai import OpenAI
import google.generativeai as genai
import argparse

parser = argparse.ArgumentParser()
parser.add_argument('--model', type=str, help='Model name to override config.json', default=None)
args = parser.parse_args()

# Determine model
MODEL = args.model if args.model else constants.MODEL

# Load dataset
with open(constants.DATASET_PATH, "r", encoding="utf-8") as f:
    ground_truth = json.load(f)

ANSWERS_PATH = constants.get_answers_path(MODEL)
with open(ANSWERS_PATH, "r", encoding="utf-8") as f:
    data = json.load(f)

# Load config.json manually
CONFIG_PATH = os.path.join(os.path.dirname(__file__), "config.json")
with open(CONFIG_PATH, "r", encoding="utf-8") as f:
    config = json.load(f)

if MODEL.startswith("gpt"):
    APIKEY = config.get("OPENAI_APIKEY", "")
elif MODEL.startswith("gemini"):
    APIKEY = config.get("GOOGLE_APIKEY", "")
else:
    raise ValueError(f"Unsupported model: {MODEL}")

# Init model
if MODEL.startswith("gpt"):
    client = OpenAI(api_key=APIKEY)
    def run_llm(prompt):
        res = client.chat.completions.create(
            model=MODEL,
            messages=[{"role": "user", "content": prompt}],
            max_tokens=100
        )
        return res.choices[0].message.content.strip()

elif MODEL.startswith("gemini"):
    genai.configure(api_key=APIKEY)
    model = genai.GenerativeModel(MODEL)
    def run_llm(prompt):
        res = model.generate_content(prompt)
        return res.text.strip()

# Extract letters from final answer line
def extract_final_letters(raw):
    last_line = raw.strip().split("\n")[-1]
    matches = re.findall(r"[A-Ea-e]", last_line)
    return sorted(set([m.lower() for m in matches])) if matches else ["ZZZZZ"]

# Main loop
df = pd.DataFrame()
for id in tqdm(data):
    if id not in ground_truth:
        continue

    raw = data[id]["answer"].strip()
    q = ground_truth[id]["question"]
    raw_answer = raw
    extracted = extract_final_letters(raw)

    truth = [a.lower() for a in ground_truth[id]["answer"].split(", ")]
    extracted.sort()
    truth.sort()
    match = int(extracted == truth)

    row = pd.DataFrame({
        "id": [id],
        "reasoning skill": [", ".join(ground_truth[id].get("skill", ["N/A"]))],
        "capability": [", ".join(ground_truth[id].get("broad_capability", ["N/A"]))],
        "true answer": [truth],
        f"{MODEL} answer extracted": [extracted],
        f"{MODEL} answer raw": [raw_answer],
        "match?": [match],
    })

    df = pd.concat([df, row], ignore_index=True)

RESULTS_PATH = constants.get_results_path(MODEL)
df.to_csv(RESULTS_PATH, index=False)
print(f"Saved to {RESULTS_PATH}")
