#!/usr/bin/env python3
import json
import os
import pandas as pd
import constants
from tqdm import tqdm
from datetime import datetime

# Load data
with open(constants.DATASET_PATH, "r", encoding="utf-8") as f:
    ground_truth = json.load(f)

with open(constants.ANSWERS_PATH, "r", encoding="utf-8") as f:
    data = json.load(f)

df = pd.DataFrame()

for id in tqdm(data):
    if id not in ground_truth:
        print(f"Skipping unknown ID: {id}")
        continue

    entry = data[id]["answer"].strip().lower()
    question = ground_truth[id]["question"]

    if entry in ['a', 'b', 'c', 'd', 'e']:
        MLLM_answers = [entry]
    else:
        MLLM_answers = ['zzzzz']

    truth_answers = [a.lower() for a in ground_truth[id]["answer"].split(", ")]
    MLLM_answers.sort()
    truth_answers.sort()
    match = int(MLLM_answers == truth_answers)

    row = pd.DataFrame({
        "id": [id],
        "reasoning skill": [", ".join(ground_truth[id].get("skill", ["N/A"]))],
        "capability": [", ".join(ground_truth[id].get("broad_capability", ["N/A"]))],
        "true answer": [truth_answers],
        constants.MODEL + " answer extracted": [MLLM_answers],
        constants.MODEL + " answer raw": [entry],
        "match?": [match],
    })
    df = pd.concat([df, row], ignore_index=True)

# Save with timestamp
timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
results_dir = os.path.dirname(constants.RESULTS_PATH)
basename = os.path.basename(constants.RESULTS_PATH).replace(".csv", "")
out_path = os.path.join(results_dir, f"{basename}_{timestamp}.csv")
df.to_csv(out_path, index=False)
print(f"Saved to {out_path}")
