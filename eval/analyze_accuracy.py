import pandas as pd
import constants
import argparse

parser = argparse.ArgumentParser()
parser.add_argument('--model', type=str, help='Model name to override config.json', default=None)
args = parser.parse_args()

df = pd.read_csv(constants.RESULTS_PATH)

reasoning_skills = ["inductive", "deductive", "numerical", "spatial", "mechanical"]
capabilities = ["diagram", "ocr", "patterns", "graphs", "tables", "3d shapes", "puzzles", "sequences", "physics"]

def print_header(title):
    print(f"\n{title:<20}")
    print(f"{'Name':<15}{'Accuracy':>10}{'Score':>15}")
    print("-" * 40)

def print_line(name, correct, total):
    if total == 0:
        acc = "N/A"
        score = "0/0"
    else:
        acc = f"{(correct / total) * 100:6.2f}%"
        score = f"{correct}/{total}"
    print(f"{name:<15}{acc:>10}{score:>15}")

MODEL = args.model if args.model else constants.MODEL
print(f"Model: {MODEL}")

# Reasoning Skill Accuracy
print_header("Reasoning Skill Accuracy")
total_correct = df["match?"].sum()
print_line("Total", total_correct, df.shape[0])
for skill in reasoning_skills:
    subset = df[df["reasoning skill"].str.contains(skill, case=False, na=False)]
    print_line(skill.capitalize(), subset["match?"].sum(), subset.shape[0])

# Capability Accuracy
print_header("Capability Accuracy")
for cap in capabilities:
    subset = df[df["capability"].astype(str).str.contains(cap, case=False, na=False)]
    print_line(cap, subset["match?"].sum(), subset.shape[0])
