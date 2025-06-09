import sqlite3

conn = sqlite3.connect("users.db")
cursor = conn.cursor()

# Create user table (if not already done)
cursor.execute("""
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    password TEXT NOT NULL
)
""")

# Create history table
cursor.execute("""
CREATE TABLE IF NOT EXISTS history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id TEXT NOT NULL,
    product TEXT NOT NULL,
    english_translation TEXT NOT NULL,
    review_feedback TEXT NOT NULL,
    score INTEGER NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES users(employee_id)
)
""")

conn.commit()
conn.close()
print("✅ Tables created.")
