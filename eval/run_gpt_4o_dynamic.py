import argparse
import base64
from openai import OpenAI
import sys
sys.stdout.reconfigure(encoding='utf-8')

parser = argparse.ArgumentParser()
parser.add_argument('--img', required=True)
parser.add_argument('--key', required=True)
parser.add_argument('--prompt', default='Which letter (A–F) completes the visual logic puzzle? Explain your reasoning in 1–2 sentences, then give just the letter.')
args = parser.parse_args()

with open(args.img, "rb") as img_file:
    base64_image = base64.b64encode(img_file.read()).decode("utf-8")

client = OpenAI(api_key=args.key)

response = client.chat.completions.create(
    model="gpt-4o",
    messages=[
        {
            "role": "user",
            "content": [
                {"type": "text", "text": args.prompt},
                {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"}},
            ],
        }
    ],
    max_tokens=300,
)

print(response.choices[0].message.content.strip())
