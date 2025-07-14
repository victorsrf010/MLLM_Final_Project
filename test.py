import requests
headers = {"Authorization": f"Bearer sk-..."}
res = requests.get("https://api.openai.com/v1/models", headers=headers)
print(res.status_code, res.text)