import sqlite3
import pandas as pd

# Connect to the SQLite database
conn = sqlite3.connect('users.db')

# Load the 'users' table
df_users = pd.read_sql_query("SELECT * FROM users", conn)

# Load the 'history' table
df_history = pd.read_sql_query("SELECT * FROM history", conn)

# Print both DataFrames
print("=== USERS TABLE ===")
print(df_users)

print("\n=== HISTORY TABLE ===")
print(df_history)

# Close the database connection
conn.close()
