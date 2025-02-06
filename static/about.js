// Jalankan fungsi loadTasks saat halaman selesai dimuat
document.addEventListener("DOMContentLoaded", () => {
    loadTasks();
});

// Memuat daftar tugas dari server (endpoint /tasks)
function loadTasks() {
    fetch('/tasks')
        .then(response => response.json())
        .then(tasks => {
            const taskList = document.getElementById("task-list");
            taskList.innerHTML = "";
            tasks.forEach(task => {
                const li = document.createElement("li");
                li.style.padding = "10px";
                li.style.border = "1px solid #ddd";
                li.style.marginBottom = "10px";
                li.style.borderRadius = "4px";
                    li.innerHTML = `
                        <div style="cursor: pointer;" onclick="loadTaskContent(${task.id})">
                            <strong>${task.name}</strong><br>
                            <small>Tanggal: ${task.date}, Deadline: ${task.deadline}</small><br>
                            <small>Status: <span style="color: ${task.status === 'Selesai' ? '#4caf50' : '#f44336'}">${task.status}</span></small>
                        </div>
                        <div style="margin-top: 5px;">
                            <button onclick="editTaskName(${task.id}); event.stopPropagation();" style="margin-right: 5px;">✏️ Edit Nama</button>
                            <button onclick="deleteTask(${task.id}); event.stopPropagation();">🗑️ Hapus</button>
                            <button onclick="toggleStatus(${task.id}); event.stopPropagation();" style="margin-left: 5px;">${task.status === 'Selesai' ? 'Tandai Belum Selesai' : 'Tandai Selesai'}</button>
                        </div>
                    `;
                taskList.appendChild(li);
            });
        })
        .catch(error => console.error("Error memuat tugas:", error));
}

// Membuat tugas baru dengan mengosongkan form editor dan meminta input nama tugas
function newTask() {
    let taskName = prompt("Masukkan nama tugas:");
    if (!taskName) return;
    // Set nilai default pada editor
    document.getElementById("task-name").value = taskName;
    document.getElementById("task-description").value = "";
    document.getElementById("task-date").value = "";
    document.getElementById("task-deadline").value = "";
    document.getElementById("save-task").removeAttribute("data-task-id");
}

// Memuat data tugas ke form editor berdasarkan task id
function loadTaskContent(taskId) {
    fetch('/tasks')
        .then(response => response.json())
        .then(tasks => {
            const task = tasks.find(t => t.id === taskId);
            if (task) {
                document.getElementById("task-name").value = task.name;
                document.getElementById("task-description").value = task.description;
                document.getElementById("task-date").value = task.date;
                document.getElementById("task-deadline").value = task.deadline;
                document.getElementById("save-task").setAttribute("data-task-id", task.id);
            }
        })
        .catch(error => console.error("Error memuat detail tugas:", error));
}

// Menyimpan tugas baru atau memperbarui tugas yang sudah ada
function saveOrUpdateTask() {
    const taskId = document.getElementById("save-task").getAttribute("data-task-id");
    const name = document.getElementById("task-name").value;
    const description = document.getElementById("task-description").value;
    const date = document.getElementById("task-date").value;
    const deadline = document.getElementById("task-deadline").value;

    if (!name || !description || !date || !deadline) {
        alert("Semua kolom harus diisi.");
        return;
    }

    // Buat objek tugas dengan status default "Belum Selesai"
    const task = {
        name: name,
        description: description,
        date: date,
        deadline: deadline,
        status: "Belum Selesai"
    };

    if (taskId) {
        // Jika data-task-id ada, maka lakukan update (PUT)
        fetch(`/tasks/${taskId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(task)
        })
        .then(response => response.json())
        .then(data => {
            alert("Tugas diperbarui!");
            loadTasks();
        })
        .catch(error => console.error("Error memperbarui tugas:", error));
    } else {
        // Jika belum ada data-task-id, maka buat tugas baru (POST)
        // Menggunakan Date.now() sebagai id (client-generated)
        task.id = Date.now();
        fetch('/tasks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(task)
        })
        .then(response => response.json())
        .then(data => {
            alert("Tugas ditambahkan!");
            loadTasks();
        })
        .catch(error => console.error("Error menambahkan tugas:", error));
    }
}

// Menghapus tugas berdasarkan id
function deleteTask(taskId) {
    if (confirm("Apakah Anda yakin ingin menghapus tugas ini?")) {
        fetch(`/tasks/${taskId}`, { method: 'DELETE' })
            .then(response => response.json())
            .then(data => {
                alert("Tugas dihapus!");
                loadTasks();
            })
            .catch(error => console.error("Error menghapus tugas:", error));
    }
}

// Mengubah status tugas (toggle) antara "Belum Selesai" dan "Selesai"
function toggleStatus(taskId) {
    fetch(`/tasks/status/${taskId}`, { method: 'PATCH' })
        .then(response => response.json())
        .then(data => {
            loadTasks();
        })
        .catch(error => console.error("Error mengubah status tugas:", error));
}

// Mengubah nama tugas melalui prompt
function editTaskName(taskId) {
    let newName = prompt("Masukkan nama tugas baru:");
    if (!newName) return;
    // Pertama, ambil data tugas yang ingin diubah
    fetch('/tasks')
        .then(response => response.json())
        .then(tasks => {
            const task = tasks.find(t => t.id === taskId);
            if (!task) {
                alert("Tugas tidak ditemukan.");
                return;
            }
            // Perbarui nama tugas
            task.name = newName;
            // Lakukan update menggunakan metode PUT
            fetch(`/tasks/${taskId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(task)
            })
            .then(response => response.json())
            .then(data => {
                alert("Nama tugas diperbarui!");
                loadTasks();
            })
            .catch(error => console.error("Error mengubah nama tugas:", error));
        })
        .catch(error => console.error("Error mengambil data tugas:", error));
}
