from openai import OpenAI
import base64

client = OpenAI(api_key="")  # Replace with your key

# Load and encode image
with open("iq_test.jpeg", "rb") as img_file:
    base64_image = base64.b64encode(img_file.read()).decode("utf-8")

# Send request
response = client.chat.completions.create(
    model="gpt-4o",
    messages=[
        {
            "role": "user",
            "content": [
                {"type": "text", "text": "Which letter (A–F) completes the visual logic puzzle? Explain your reasoning in 1–2 sentences, then give just the letter."},
                {
                    "type": "image_url",
                    "image_url": {
                        "url": f"data:image/jpeg;base64,{base64_image}"
                    },
                },
            ],
        }
    ],
    max_tokens=100
)

print("GPT-4 Vision Answer:", response.choices[0].message.content.strip())
