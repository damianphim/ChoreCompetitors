from flask import Flask, jsonify, request
from flask_cors import CORS
import sqlite3
import os

app = Flask(__name__)
CORS(app)  # Allow cross-origin requests

# Initialize database
DATABASE = 'app.db'

def init_db():
    with sqlite3.connect(DATABASE) as conn:
        cursor = conn.cursor()
        # Create table for households
        cursor.execute('''CREATE TABLE IF NOT EXISTS households (
                            id INTEGER PRIMARY KEY AUTOINCREMENT,
                            name TEXT NOT NULL
                        )''')

        # Create table for tasks
        cursor.execute('''CREATE TABLE IF NOT EXISTS tasks (
                            id INTEGER PRIMARY KEY AUTOINCREMENT,
                            household_id INTEGER,
                            name TEXT NOT NULL,
                            stars INTEGER DEFAULT 1,
                            task_type TEXT NOT NULL,
                            completed BOOLEAN DEFAULT FALSE,
                            cooldown_end TIMESTAMP,
                            FOREIGN KEY (household_id) REFERENCES households(id)
                        )''')

        # Create table for members
        cursor.execute('''CREATE TABLE IF NOT EXISTS members (
                            id INTEGER PRIMARY KEY AUTOINCREMENT,
                            household_id INTEGER,
                            name TEXT NOT NULL,
                            FOREIGN KEY (household_id) REFERENCES households(id)
                        )''')

with app.app_context():
    init_db()  # Run every time to ensure the schema is up-to-date

# Initialize the database if it doesn't exist
if not os.path.exists(DATABASE):
    init_db()

@app.route('/api/households', methods=['GET'])
def get_households():
    with sqlite3.connect(DATABASE) as conn:
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM households')
        households = [{'id': row[0], 'name': row[1]} for row in cursor.fetchall()]
    return jsonify(households)

@app.route('/api/households', methods=['POST'])
def add_household():
    data = request.get_json()
    name = data['name']
    with sqlite3.connect(DATABASE) as conn:
        cursor = conn.cursor()
        cursor.execute('INSERT INTO households (name) VALUES (?)', (name,))
        conn.commit()
        household_id = cursor.lastrowid
    return jsonify({'id': household_id, 'name': name})

@app.route('/api/tasks', methods=['GET'])
def get_tasks():
    with sqlite3.connect(DATABASE) as conn:
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM tasks')
        tasks = [{'id': row[0], 'household_id': row[1], 'name': row[2], 'stars': row[3], 'task_type': row[4], 'completed': row[5], 'cooldown_end': row[6]} for row in cursor.fetchall()]

    daily_tasks = [task for task in tasks if task['task_type'] == 'daily']
    weekly_tasks = [task for task in tasks if task['task_type'] == 'weekly']
    monthly_tasks = [task for task in tasks if task['task_type'] == 'monthly']

    return jsonify({
        'dailyTasks': daily_tasks,
        'weeklyTasks': weekly_tasks,
        'monthlyTasks': monthly_tasks
    })


@app.route('/api/tasks', methods=['POST'])
def add_task():
    data = request.get_json()
    household_id = data['household_id']
    name = data['name']
    task_type = data['task_type']
    stars = data['stars']
    completed = False  # New task should start as not completed
    cooldown_end = None  # Initially, there's no cooldown end timestamp

    with sqlite3.connect(DATABASE) as conn:
        cursor = conn.cursor()
        cursor.execute('INSERT INTO tasks (household_id, name, task_type, stars, completed, cooldown_end) VALUES (?, ?, ?, ?, ?, ?)', 
                       (household_id, name, task_type, stars, completed, cooldown_end))
        conn.commit()
        task_id = cursor.lastrowid
    
    return jsonify({'id': task_id, 'household_id': household_id, 'name': name, 'task_type': task_type, 'stars': stars, 'completed': completed, 'cooldown_end': cooldown_end})

@app.route('/api/tasks/<int:task_id>/complete', methods=['PUT'])
def complete_task(task_id):
    data = request.get_json()
    completed = data['completed']
    cooldown_end = data['cooldown_end']

    with sqlite3.connect(DATABASE) as conn:
        cursor = conn.cursor()
        cursor.execute('UPDATE tasks SET completed = ?, cooldown_end = ? WHERE id = ?', (completed, cooldown_end, task_id))
        conn.commit()
    
    return jsonify({'id': task_id, 'completed': completed, 'cooldown_end': cooldown_end})

@app.route('/api/tasks/<int:task_id>', methods=['PUT'])
def update_task(task_id):
    data = request.get_json()
    name = data['name']
    stars = data['stars']
    
    with sqlite3.connect(DATABASE) as conn:
        cursor = conn.cursor()
        cursor.execute('UPDATE tasks SET name = ?, stars = ? WHERE id = ?', (name, stars, task_id))
        conn.commit()
    
    return jsonify({'id': task_id, 'name': name, 'stars': stars})

@app.route('/api/members', methods=['GET'])
def get_members():
    with sqlite3.connect(DATABASE) as conn:
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM members')
        members = [{'id': row[0], 'household_id': row[1], 'name': row[2]} for row in cursor.fetchall()]
    return jsonify(members)

@app.route('/api/members', methods=['POST'])
def add_member():
    data = request.get_json()
    household_id = data['household_id']
    name = data['name']
    with sqlite3.connect(DATABASE) as conn:
        cursor = conn.cursor()
        cursor.execute('INSERT INTO members (household_id, name) VALUES (?, ?)', (household_id, name))
        conn.commit()
        member_id = cursor.lastrowid
    return jsonify({'id': member_id, 'household_id': household_id, 'name': name})

if __name__ == '__main__':
    app.run(debug=True)
