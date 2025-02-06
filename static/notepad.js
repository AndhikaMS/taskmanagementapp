document.addEventListener("DOMContentLoaded", () => {
    loadNotes();
});

// Memuat daftar catatan dari server
function loadNotes() {
    fetch('/notes')
        .then(response => response.json())
        .then(notes => {
            const noteList = document.getElementById("note-list");
            noteList.innerHTML = "";
            // Diasumsikan notes merupakan object dengan key berupa nama catatan dan value berupa detail catatan
            for (const noteName in notes) {
                const note = notes[noteName];
                const li = document.createElement("li");
                li.classList.add("note-item");
                li.innerHTML = `
                    <span class="note-name">${note.name}</span>
                    <span class="note-date">${note.date}</span>
                    <div class="note-icons">
                        <span class="edit-icon" onclick="editNoteName('${note.name}')">✏️</span>
                        <span class="delete-icon" onclick="deleteNote('${note.name}')">🗑️</span>
                    </div>
                `;
                // Hindari trigger event saat mengklik ikon edit atau delete
                li.onclick = (e) => {
                    if (e.target.classList.contains('edit-icon') || e.target.classList.contains('delete-icon')) return;
                    loadNoteContent(note.name);
                };
                noteList.appendChild(li);
            }
        })
        .catch(error => console.error("Error memuat catatan:", error));
}

// Menambahkan catatan baru
function newNote() {
    let noteName = prompt("Masukkan nama catatan:");
    if (!noteName) return;

    // Mendapatkan tanggal dan hari
    let currentDate = new Date();
    let dayOfWeek = currentDate.toLocaleString('id-ID', { weekday: 'long' });
    let date = currentDate.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
    let formattedDate = `${dayOfWeek}, ${date}`;

    const note = {
        name: noteName,
        content: "",
        date: formattedDate
    };

    fetch('/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(note)
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(data => { throw new Error(data.message); });
        }
        return response.json();
    })
    .then(data => {
        loadNotes();
        loadNoteContent(noteName);
    })
    .catch(error => alert(error.message));
}

// Memuat isi catatan dari server berdasarkan nama catatan
function loadNoteContent(noteName) {
    fetch('/notes')
        .then(response => response.json())
        .then(notes => {
            const note = notes[noteName];
            if (note) {
                document.getElementById("note-content").value = note.content;
                document.getElementById("save-note").setAttribute("data-note", noteName);
                toggleSaveUpdateButton(noteName);
            } else {
                document.getElementById("note-content").value = "";
                document.getElementById("save-note").removeAttribute("data-note");
                document.getElementById("save-note").textContent = "Simpan Catatan";
            }
        })
        .catch(error => console.error("Error memuat isi catatan:", error));
}

// Menyimpan atau memperbarui catatan
function saveOrUpdateNote() {
    let noteName = document.getElementById("save-note").getAttribute("data-note");
    if (!noteName) {
        alert("Pilih atau buat catatan terlebih dahulu.");
        return;
    }

    let content = document.getElementById("note-content").value;
    if (content.trim() === "") {
        alert("Catatan tidak boleh kosong.");
        return;
    }

    // Perbarui tanggal saat menyimpan
    let currentDate = new Date();
    let dayOfWeek = currentDate.toLocaleString('id-ID', { weekday: 'long' });
    let date = currentDate.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
    let formattedDate = `${dayOfWeek}, ${date}`;

    const updatedNote = {
        name: noteName,
        content: content,
        date: formattedDate
    };

    fetch('/notes/' + encodeURIComponent(noteName), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedNote)
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(data => { throw new Error(data.message); });
        }
        return response.json();
    })
    .then(data => {
        alert("Catatan berhasil diperbarui!");
        loadNotes();
    })
    .catch(error => alert(error.message));
}

// Mengubah label tombol menjadi "Update Catatan"
function toggleSaveUpdateButton(noteName) {
    let saveButton = document.getElementById("save-note");
    saveButton.textContent = "Update Catatan";
}

// Mengedit nama catatan
function editNoteName(noteName) {
    let newName = prompt("Masukkan nama catatan baru:", noteName);
    if (!newName || newName === noteName) return;

    // Ambil isi catatan saat ini terlebih dahulu
    fetch('/notes')
        .then(response => response.json())
        .then(notes => {
            let note = notes[noteName];
            if (!note) {
                alert("Catatan tidak ditemukan.");
                return;
            }
            // Buat objek catatan baru dengan nama baru
            const updatedNote = {
                name: newName,
                content: note.content,
                date: note.date
            };

            // Tambahkan catatan baru dengan nama baru
            fetch('/notes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedNote)
            })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(data => { throw new Error(data.message); });
                }
                return response.json();
            })
            .then(data => {
                // Hapus catatan lama
                return fetch('/notes/' + encodeURIComponent(noteName), {
                    method: 'DELETE'
                });
            })
            .then(response => {
                if (response.ok) {
                    alert("Nama catatan berhasil diubah!");
                    loadNotes();
                    loadNoteContent(newName);
                } else {
                    throw new Error("Gagal menghapus catatan lama.");
                }
            })
            .catch(error => alert(error.message));
        })
        .catch(error => console.error("Error mengedit catatan:", error));
}

// Menghapus catatan
function deleteNote(noteName) {
    if (confirm("Apakah Anda yakin ingin menghapus catatan ini?")) {
        fetch('/notes/' + encodeURIComponent(noteName), {
            method: 'DELETE'
        })
        .then(response => {
            if (response.ok) {
                alert("Catatan berhasil dihapus!");
                loadNotes();
                let currentNote = document.getElementById("save-note").getAttribute("data-note");
                if (currentNote === noteName) {
                    document.getElementById("note-content").value = "";
                    document.getElementById("save-note").removeAttribute("data-note");
                    document.getElementById("save-note").textContent = "Simpan Catatan";
                }
            } else {
                throw new Error("Gagal menghapus catatan.");
            }
        })
        .catch(error => alert(error.message));
    }
}
