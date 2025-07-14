from openai import OpenAI
import base64
import os
import json
import constants
from tqdm import tqdm

client = OpenAI(api_key=constants.APIKEY)
MODEL = "gpt-4o"
print(f"Using model: {MODEL}")

with open(constants.DATASET_PATH, "r", encoding="utf-8") as f:
    dataset = json.load(f)

out_path = constants.get_answers_path(MODEL)
os.makedirs(os.path.dirname(out_path), exist_ok=True)

if os.path.exists(out_path):
    with open(out_path, "r", encoding="utf-8") as f:
        answers = json.load(f)
else:
    answers = {}

keys_to_run = [k for k in dataset if k not in answers or not answers[k].get("answer")]

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
            model=MODEL,
            messages=[{
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt},
                    {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"}}
                ]
            }],
            max_tokens=100
        )
        answers[key] = {"answer": response.choices[0].message.content.strip()}
    except Exception as e:
        print(f"Error with {key}: {e}")
        answers[key] = {"answer": ""}

with open(out_path, "w", encoding="utf-8") as f:
    json.dump(answers, f, indent=2, ensure_ascii=False)

print("Done.")
