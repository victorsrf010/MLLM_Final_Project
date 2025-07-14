import argparse
import base64
import google.generativeai as genai
import sys
sys.stdout.reconfigure(encoding='utf-8')

parser = argparse.ArgumentParser()
parser.add_argument('--img', required=True)
parser.add_argument('--key', required=True)
parser.add_argument('--prompt', default='Which letter (A–F) completes the visual logic puzzle? Explain your reasoning in 1–2 sentences, then give just the letter.')
args = parser.parse_args()

# Read image bytes
with open(args.img, "rb") as img_file:
    image_bytes = img_file.read()

# Configure Gemini API
genai.configure(api_key=args.key)
model = genai.GenerativeModel("gemini-1.5-flash")

# Run prompt with image
response = model.generate_content(
    [args.prompt, {"mime_type": "image/jpeg", "data": image_bytes}],
    generation_config={"max_output_tokens": 300}
)

print(response.text.strip())
