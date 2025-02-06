function goToOlahragaPanel() {
    // Menyembunyikan panel lain
    hideAllPanels();

    // Menampilkan panel olahraga di panel-container
    document.getElementById("olahraga-panel").style.display = "block";
}

function goToBelajarPanel() {
    // Menyembunyikan panel lain
    hideAllPanels();

    // Menampilkan panel belajar di panel-container
    document.getElementById("belajar-panel").style.display = "block";
}

function goToOtherHobbyPanel() {
    // Menyembunyikan panel lain
    hideAllPanels();

    // Menampilkan panel hobby lainnya di panel-container
    document.getElementById("other-hobby-panel").style.display = "block";
}

function hideAllPanels() {
    // Menyembunyikan semua panel di dalam panel-container
    document.getElementById("olahraga-panel").style.display = "none";
    document.getElementById("belajar-panel").style.display = "none";
    document.getElementById("other-hobby-panel").style.display = "none";
}

