#!/usr/bin/env python3
import os
import json
import re
import constants
import pandas as pd
from tqdm import tqdm
from openai import OpenAI
import google.generativeai as genai

# Load dataset
with open(constants.DATASET_PATH, "r", encoding="utf-8") as f:
    ground_truth = json.load(f)

with open(constants.ANSWERS_PATH, "r", encoding="utf-8") as f:
    data = json.load(f)

# Init model
MODEL = constants.MODEL
APIKEY = constants.APIKEY

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

else:
    raise ValueError(f"Unsupported model: {MODEL}")

# Extract letters from final answer line
def extract_final_letters(raw):
    # Split lines and extract last line
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

    # Use local extraction for all answers
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

df.to_csv(constants.RESULTS_PATH, index=False)
print(f"Saved to {constants.RESULTS_PATH}")
