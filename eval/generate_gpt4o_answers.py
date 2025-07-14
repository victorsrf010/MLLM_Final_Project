from openai import OpenAI
import base64
import os
import json
import constants
import requests
from tqdm import tqdm

client = OpenAI(api_key=constants.APIKEY)
print("Using model: gpt-4o")

# Load dataset
with open(constants.DATASET_PATH, "r", encoding="utf-8") as f:
    dataset = json.load(f)

# Prepare output path
answers_dir = os.path.join(os.path.dirname(__file__), "answers")
os.makedirs(answers_dir, exist_ok=True)
out_path = os.path.join(answers_dir, "gpt-4o-answers.json")

# Load existing answers if available
if os.path.exists(out_path):
    with open(out_path, "r", encoding="utf-8") as f:
        answers = json.load(f)
else:
    answers = {}

# Determine missing entries
keys_to_run = [
    key for key in dataset
    if key not in answers or not answers[key].get("answer")
]

print(f"Found {len(keys_to_run)} unanswered entries.")

for key in tqdm(keys_to_run):
    item = dataset[key]
    image_file = os.path.join(constants.PROJECT_ROOT, "data", "images", item["imagename"])

    if not os.path.exists(image_file):
        print(f"Image missing for {key}, skipping.")
        continue

    with open(image_file, "rb") as f:
        base64_image = base64.b64encode(f.read()).decode("utf-8")

    prompt = f"{item['question']}\nExplain your reasoning in 1–2 sentences, then give just the letter."

    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {
                            "type": "image_url",
                            "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"}
                        },
                    ],
                }
            ],
            max_tokens=100
        )

        answers[key] = {"answer": response.choices[0].message.content.strip()}

    except Exception as e:
        print(f"Error with {key}: {e}")
        answers[key] = {"answer": ""}

# Save updated answers
with open(out_path, "w", encoding="utf-8") as f:
    json.dump(answers, f, indent=2, ensure_ascii=False)

print("Done.")
