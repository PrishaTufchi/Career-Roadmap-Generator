from flask import Flask, render_template, request, jsonify
import requests
import re
import os

app = Flask(__name__)  # Fixed the __name__ typo

API_KEY = os.getenv("GEMINI_API_KEY")
MODEL_NAME = os.getenv("GEMINI_MODEL_NAME", "gemini-1.5-pro")
url = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL_NAME}:generateContent?key={API_KEY}"

def get_career_roadmap(role, experience, language):
    prompt = (
        f"Create a detailed, friendly career roadmap to become a {role}."
        f" Assume the user is a {experience} level learner."
        f" Prefer using {language} programming language where applicable."
        f" Break it into clear, simple steps labeled Step 1, Step 2, etc."
        f" Provide short, concise explanations for each step."
        f" Use bullet points or numbered lists within each step where appropriate."
        f" Add extra line breaks between steps to improve readability."
    )
    data = {
        "contents": [{"parts": [{"text": prompt}]}]
    }
    headers = {"Content-Type": "application/json"}

    response = requests.post(url, headers=headers, json=data)

    if response.status_code == 200:
        res = response.json()
        return res['candidates'][0]['content']['parts'][0]['text']
    else:
        return f"Error {response.status_code}: {response.text}"

def extract_keywords(roadmap_text):
    lines = roadmap_text.split("\n")
    keywords = []

    for line in lines:
        if re.match(r"^\s*(Step \d+:|[-*•]|\d+\.)\s+", line):
            clean_line = re.sub(r"^\s*(Step \d+:|[-*•]|\d+\.)\s+", "", line).strip()
            if clean_line:
                keywords_to_keep = [
                    "Python", "Java", "C++", "SQL", "Machine Learning",
                    "Deep Learning", "Data Structures", "Algorithms",
                    "APIs", "OOP", "Linux", "Git", "Pandas", "NumPy",
                    "Seaborn", "Matplotlib", "Flask", "Django",
                    "Cloud Computing", "Big Data", "NLP", "Data Analysis"
                ]
                for keyword in keywords_to_keep:
                    if keyword.lower() in clean_line.lower():
                        keywords.append(keyword)
                        break

    return list(set(keywords))[:10]

@app.route("/", methods=["GET"])
def index():
    return render_template("index.html")

@app.route("/generate", methods=["POST"])
def generate():
    data = request.json
    role = data.get("role")
    experience = data.get("experience")
    language = data.get("language")

    roadmap = get_career_roadmap(role, experience, language)
    keywords = extract_keywords(roadmap)

    return jsonify({
        "roadmap": roadmap,
        "search_terms": keywords
    })

if __name__ == "__main__":  # Fixed this too
    app.run(debug=True)
