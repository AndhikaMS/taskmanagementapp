from flask import Flask, render_template, request, jsonify
import json
import os

app = Flask(__name__)

TASKS_FILE = 'tasks.json'

# Tambahan untuk manajemen catatan
NOTES_FILE = 'notes.json'

def load_notes():
    if os.path.exists(NOTES_FILE):
        with open(NOTES_FILE, 'r') as file:
            return json.load(file)
    return {}  # Mengembalikan dictionary kosong jika file tidak ada

def save_notes(notes):
    with open(NOTES_FILE, 'w') as file:
        json.dump(notes, file, indent=4)

@app.route('/notes', methods=['GET'])
def get_notes():
    notes = load_notes()
    return jsonify(notes)

@app.route('/notes', methods=['POST'])
def add_note():
    new_note = request.get_json()
    # Misalnya, struktur new_note: { "name": "Catatan1", "content": "Isi catatan", "date": "2025-02-06" }
    notes = load_notes()
    note_name = new_note.get("name")
    if note_name in notes:
        return jsonify({'message': 'Nama catatan sudah ada'}), 400
    notes[note_name] = new_note
    save_notes(notes)
    return jsonify(new_note), 201

@app.route('/notes/<string:note_name>', methods=['PUT'])
def update_note(note_name):
    updated_note = request.get_json()
    notes = load_notes()
    if note_name in notes:
        notes[note_name] = updated_note
        save_notes(notes)
        return jsonify(updated_note)
    return jsonify({'message': 'Catatan tidak ditemukan'}), 404

@app.route('/notes/<string:note_name>', methods=['DELETE'])
def delete_note(note_name):
    notes = load_notes()
    if note_name in notes:
        del notes[note_name]
        save_notes(notes)
        return jsonify({'message': 'Catatan dihapus'})
    return jsonify({'message': 'Catatan tidak ditemukan'}), 404

@app.route('/')
def home():
    return render_template('home.html')

@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/notepad')
def notepad():
    return render_template('notepad.html')

@app.route('/hobby')
def hobby():
    return render_template('hobby.html')


# Helper function to load tasks from JSON file
def load_tasks():
    if os.path.exists(TASKS_FILE):
        with open(TASKS_FILE, 'r') as file:
            return json.load(file)
    return []

# Helper function to save tasks to JSON file
def save_tasks(tasks):
    with open(TASKS_FILE, 'w') as file:
        json.dump(tasks, file, indent=4)


@app.route('/tasks', methods=['GET'])
def get_tasks():
    tasks = load_tasks()
    return jsonify(tasks)

@app.route('/tasks', methods=['POST'])
def add_task():
    new_task = request.get_json()
    
    tasks = load_tasks()
    tasks.append(new_task)
    save_tasks(tasks)
    
    return jsonify(new_task), 201

@app.route('/tasks/<int:task_id>', methods=['PUT'])
def update_task(task_id):
    updated_task = request.get_json()
    
    tasks = load_tasks()
    
    for task in tasks:
        if task['id'] == task_id:
            task.update(updated_task)
            save_tasks(tasks)
            return jsonify(task)
    
    return jsonify({'message': 'Task not found'}), 404

@app.route('/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    tasks = load_tasks()
    
    tasks = [task for task in tasks if task['id'] != task_id]
    save_tasks(tasks)
    
    return jsonify({'message': 'Task deleted'})

@app.route('/tasks/status/<int:task_id>', methods=['PATCH'])
def toggle_task_status(task_id):
    tasks = load_tasks()
    
    for task in tasks:
        if task['id'] == task_id:
            task['status'] = '✔ Selesai'
            save_tasks(tasks)
            return jsonify(task)
    
    return jsonify({'message': 'Task not found'}), 404

if __name__ == '__main__':
    app.run(debug=True)
