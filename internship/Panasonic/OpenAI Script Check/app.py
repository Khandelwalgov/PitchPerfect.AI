from flask import Flask, request, jsonify, session
from flask_cors import CORS
import os
import json
import sqlite3
import bcrypt
import re
from functools import wraps
from datetime import datetime
from uuid import uuid4
import traceback2 as traceback
from openai import OpenAI

# === SETUP ===
app = Flask(__name__)
CORS(app, supports_credentials=True)
app.secret_key = os.getenv("SECRET_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

client = OpenAI(api_key=OPENAI_API_KEY)

UPLOAD_DIR = "recordings"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# === DATABASE SETUP ===
def get_db_connection():
    conn = sqlite3.connect("users.db")
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            employee_id TEXT UNIQUE,
            name TEXT,
            phone TEXT,
            password TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            employee_id TEXT,
            product TEXT,
            transcription TEXT,
            review_feedback TEXT,
            score INTEGER,
            tokens_used INTEGER,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    conn.commit()
    conn.close()

init_db()

# === AUTH DECORATOR ===
def login_required(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        if 'employee_id' not in session:
            return jsonify({"error": "Unauthorized"}), 401
        return f(*args, **kwargs)
    return wrapper

# === AUTH ENDPOINTS ===
@app.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    employee_id = data.get('employee_id')
    name = data.get('name')
    phone = data.get('phone')
    password = data.get('password')
    confirm_password = data.get('confirm_password')

    if not all([employee_id, name, phone, password, confirm_password]):
        return jsonify({"error": "All fields are required"}), 400
    if password != confirm_password:
        return jsonify({"error": "Passwords do not match"}), 400

    hashed_pw = bcrypt.hashpw(password.encode(), bcrypt.gensalt())
    try:
        conn = get_db_connection()
        conn.execute("INSERT INTO users (employee_id, name, phone, password) VALUES (?, ?, ?, ?)",
                     (employee_id, name, phone, hashed_pw))
        conn.commit()
        conn.close()
        return jsonify({"message": "Signup successful"}), 201
    except sqlite3.IntegrityError:
        return jsonify({"error": "Employee ID already exists"}), 409

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    employee_id = data.get('employee_id')
    password = data.get('password')
    conn = get_db_connection()
    user = conn.execute("SELECT * FROM users WHERE employee_id = ?", (employee_id,)).fetchone()
    conn.close()
    if user and bcrypt.checkpw(password.encode(), user['password']):
        session['employee_id'] = employee_id
        session['name'] = user['name']
        return jsonify({"status": "success", "user": user['name']}), 200
    return jsonify({"error": "Invalid credentials"}), 401

@app.route('/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({"message": "Logged out"}), 200

@app.route('/check-auth', methods=['GET'])
def check_auth():
    return jsonify({
        "loggedIn": 'employee_id' in session,
        "employee_id": session.get('employee_id'),
        "name": session.get('name')
    }), 200

@app.route('/ping')
def ping():
    return "pong", 200

@app.route('/submit-product', methods=['POST'])
def submit_product():
    data = request.get_json()
    session['product'] = data.get('product')
    return {'status': 'success'}, 200

# === MAIN EVALUATION ROUTE ===
@app.route('/upload', methods=['POST'])
def upload():
    if 'audio' not in request.files:
        return jsonify({"error": "No audio file found"}), 400

    filename = f"{uuid4().hex}.wav"
    filepath = os.path.join(UPLOAD_DIR, filename)
    request.files['audio'].save(filepath)

    try:
        # Step 1: Transcribe
        with open(filepath, 'rb') as f:
            transcript = client.audio.transcriptions.create(
                model="whisper-1",
                file=f,
                language="hi"
            )
        transcription = transcript.text

        # Step 2: Evaluate via GPT
        script = load_product_script(session.get('product'))
        prompt = build_review_prompt(transcription, script)

        completion = client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": prompt}]
        )
        review = completion.choices[0].message.content.strip()
        tokens_used = getattr(completion.usage, "total_tokens", -1)

        try:
            score = extract_score(review)
        except:
            score = -1
            print(review)

        # Step 3: Save to DB
        conn = get_db_connection()
        conn.execute("""
            INSERT INTO history (employee_id, product, transcription, review_feedback, score, tokens_used)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (session['employee_id'], session['product'], transcription, review, score, tokens_used))
        conn.commit()
        conn.close()

        return jsonify({
            "transcription": transcription,
            "review_feedback": review,
            "score": score
        })
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

# === HELPERS ===
def extract_score(text):
    match = re.search(r'(\d{1,2})/10', text)
    return int(match.group(1)) if match else -1

def load_product_script(product):
    with open("product_scripts.json", "r", encoding="utf-8") as f:
        data = json.load(f)
        return data.get(product, "[No script found]")

def build_review_prompt(spoken, script):
    return f"""
You are a strict evaluator. Compare the following spoken product pitch (it may contain Hindi, English, or both) to the official English product script.

- Assess: Accuracy of Key Features, Coverage of Selling Points, Clarity and Pitching Skill, Product Understanding, and Customer Experience.
- Focus on factual correctness, not voice tone or accent.
- Return a final summary followed by a score out of 10, always a whole integer (e.g., 8/10).

### Product Script:
{script}

### Spoken (Translated to English):
{spoken}

### Evaluation:
"""

if __name__ == "__main__":
    app.run(debug=True)
