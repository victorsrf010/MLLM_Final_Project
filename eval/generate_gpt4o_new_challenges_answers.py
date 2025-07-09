from openai import OpenAI
import base64
import os
import json
from tqdm import tqdm
import constants

client = OpenAI(api_key=constants.APIKEY)

# Load dataset
with open(os.path.join(constants.DATASET_PATH, "new-challenges-dataset-incorrect-base.json"), "r", encoding="utf-8") as f:
    dataset = json.load(f)

answers = {}

for key in tqdm(dataset):
    item = dataset[key]
    image_file = os.path.join(constants.DATASET_PATH, "new-challenges-images", item["imagename"])

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

# Save output
os.makedirs("answers", exist_ok=True)
with open("answers/gpt-4o-new-challenges-answers-incorrect-base.json", "w", encoding="utf-8") as f:
    json.dump(answers, f, indent=2, ensure_ascii=False)
