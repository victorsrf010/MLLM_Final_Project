import os
import json
import constants
import google.generativeai as genai
from tqdm import tqdm

# Allow override
env_model = os.getenv("MODEL_OVERRIDE", "").strip().lower()
if env_model == "gemini":
    MODEL = "gemini"
    APIKEY = os.getenv("GOOGLE_APIKEY", "").strip()
else:
    MODEL = constants.MODEL
    APIKEY = constants.APIKEY

genai.configure(api_key=APIKEY)
model = genai.GenerativeModel("gemini-1.5-flash")
print("Using model: gemini-1.5-flash")

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
        print(f"Missing image for {key}")
        continue

    prompt = f"{item['question']}\nExplain your reasoning in 1–2 sentences, then give just the letter."

    try:
        with open(image_file, "rb") as img:
            image_bytes = img.read()

        response = model.generate_content(
            [prompt, {"mime_type": "image/jpeg", "data": image_bytes}],
            generation_config={"max_output_tokens": 100}
        )

        answers[key] = {"answer": response.text.strip()}
    except Exception as e:
        print(f"Error with {key}: {e}")
        answers[key] = {"answer": ""}

with open(out_path, "w", encoding="utf-8") as f:
    json.dump(answers, f, indent=2, ensure_ascii=False)

print("Done.")
