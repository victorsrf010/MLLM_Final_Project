#!/usr/bin/env python3
import json
import os
import pandas as pd
import constants
from tqdm import tqdm

# Read ground truth
with open(os.path.join(constants.DATASET_PATH, "dataset.json"), "r", encoding="utf-8") as f:
    ground_truth = json.load(f)

# Read model output
with open(constants.ANSWERS_PATH, "r", encoding="utf-8") as f:
    data = json.load(f)

print("Ground Truth Length:", len(ground_truth))
print("Data Length:", len(data))

# Output DataFrame
df = pd.DataFrame(
    columns=[
        "id",
        "reasoning skill",
        "capability",
        "true answer",
        constants.MODEL + " answer extracted",
        constants.MODEL + " answer raw",
        "match?"
    ]
)

for i in tqdm(range(len(data))):
    id = "v1_" + str(i)

    entry = data[id]["answer"].strip()
    question = ground_truth[id]["question"]

    # Directly extract raw multiple choice answer (assumed to be clean)
    MLLM_answers = [entry.lower()]
    if entry == "" or entry.lower() not in ['a', 'b', 'c', 'd', 'e']:
        MLLM_answers = ['zzzzz']

    # Ground truth
    truth_answers = [a.lower() for a in ground_truth[id]["answer"].split(", ")]

    # Compare sorted
    MLLM_answers.sort()
    truth_answers.sort()
    match = int(MLLM_answers == truth_answers)

    row = pd.DataFrame(
        {
            "id": [id],
            "reasoning skill": [", ".join(ground_truth[id].get("skill", ["N/A"]))],
            "capability": [", ".join(ground_truth[id].get("broad_capability", ["N/A"]))],
            "true answer": [truth_answers],
            constants.MODEL + " answer extracted": [MLLM_answers],
            constants.MODEL + " answer raw": [entry],
            "match?": [match],
        }
    )
    df = pd.concat([df, row], ignore_index=True)

# Save
df.to_csv(constants.RESULTS_PATH, index=False)
