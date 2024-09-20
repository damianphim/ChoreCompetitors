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
                            stars INTEGER DEFAULT 0,
                            FOREIGN KEY (household_id) REFERENCES households(id)
                        )''')

def clear_db():
    with sqlite3.connect(DATABASE) as conn:
        cursor = conn.cursor()
        # Delete all rows from the tables
        cursor.execute('DELETE FROM households')
        cursor.execute('DELETE FROM tasks')
        cursor.execute('DELETE FROM members')
        
        # Reset the autoincrement sequence for each table
        cursor.execute('DELETE FROM sqlite_sequence WHERE name="households"')
        cursor.execute('DELETE FROM sqlite_sequence WHERE name="tasks"')
        cursor.execute('DELETE FROM sqlite_sequence WHERE name="members"')
        
        conn.commit()

init_db()

clear_db()

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

@app.route('/api/households/<int:household_id>/tasks', methods=['GET'])
def get_tasks(household_id):
    with sqlite3.connect(DATABASE) as conn:
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM tasks WHERE household_id = ?', (household_id,))
        tasks = [{'id': row[0], 'household_id': row[1], 'name': row[2], 'stars': row[3], 'task_type': row[4], 'completed': row[5], 'cooldown_end': row[6]} for row in cursor.fetchall()]

    daily_tasks = [task for task in tasks if task['task_type'] == 'daily']
    weekly_tasks = [task for task in tasks if task['task_type'] == 'weekly']
    monthly_tasks = [task for task in tasks if task['task_type'] == 'monthly']

    return jsonify({
        'dailyTasks': daily_tasks,
        'weeklyTasks': weekly_tasks,
        'monthlyTasks': monthly_tasks
    })

@app.route('/api/households/<int:household_id>/tasks', methods=['POST'])
def add_task(household_id):
    data = request.get_json()
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

@app.route('/api/households/<int:household_id>/tasks/<int:task_id>/complete', methods=['PUT'])
def complete_task(household_id, task_id):
    data = request.get_json()
    completed = data['completed']
    cooldown_end = data['cooldown_end']

    with sqlite3.connect(DATABASE) as conn:
        cursor = conn.cursor()
        cursor.execute('UPDATE tasks SET completed = ?, cooldown_end = ? WHERE id = ? AND household_id = ?', 
                       (completed, cooldown_end, task_id, household_id))
        conn.commit()
    
    return jsonify({'id': task_id, 'completed': completed, 'cooldown_end': cooldown_end})

@app.route('/api/households/<int:household_id>/tasks/<int:task_id>', methods=['PUT'])
def update_task(household_id, task_id):
    data = request.get_json()
    name = data['name']
    stars = data['stars']
    
    with sqlite3.connect(DATABASE) as conn:
        cursor = conn.cursor()
        cursor.execute('UPDATE tasks SET name = ?, stars = ? WHERE id = ? AND household_id = ?', (name, stars, task_id, household_id))
        conn.commit()
    
    return jsonify({'id': task_id, 'name': name, 'stars': stars})

@app.route('/api/households/<int:household_id>/members', methods=['GET'])
def get_members(household_id):
    with sqlite3.connect(DATABASE) as conn:
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM members WHERE household_id = ?', (household_id,))
        members = [{'id': row[0], 'household_id': row[1], 'name': row[2], 'stars': row[3]} for row in cursor.fetchall()]  # Include stars
    return jsonify(members)

@app.route('/api/households/<int:household_id>/members', methods=['POST'])
def add_member(household_id):
    data = request.get_json()
    name = data['name']
    stars = data.get('stars', 0)  # Set stars to 0 if not provided
    with sqlite3.connect(DATABASE) as conn:
        cursor = conn.cursor()
        cursor.execute('INSERT INTO members (household_id, name, stars) VALUES (?, ?, ?)', (household_id, name, stars))
        conn.commit()
        member_id = cursor.lastrowid
    return jsonify({'id': member_id, 'household_id': household_id, 'name': name, 'stars': stars})

@app.route('/api/households/<int:household_id>/members/<int:member_id>', methods=['PUT'])
def update_member(household_id, member_id):
    data = request.get_json()
    name = data['name']
    stars = data['stars']

    with sqlite3.connect(DATABASE) as conn:
        cursor = conn.cursor()
        cursor.execute('UPDATE members SET name = ?, stars = ? WHERE id = ? AND household_id = ?', 
                       (name, stars, member_id, household_id))
        conn.commit()
    
    return jsonify({'id': member_id, 'household_id': household_id, 'name': name, 'stars': stars})

if __name__ == '__main__':
    app.run(debug=True)
