// ===============================
// GLOBAL STATE
// ===============================
let countries = [];
let notes = [];

// ===============================
// INIT
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  console.log("App initialized");

  loadNotes();
  loadInitialJSON(); // JSON lokal sebagai data awal
  renderNotes();
  fetchCountries(); // API hanya pelengkap

  const form = document.getElementById("noteForm");
  const search = document.getElementById("searchCountry");

  if (form) form.addEventListener("submit", saveNote);
  if (search) search.addEventListener("input", filterCountries);
});

// ===============================
// FETCH REST COUNTRIES API (OPTIONAL)
// ===============================
function fetchCountries() {
  console.log("Fetching country data from Rest Countries API...");

  fetch("https://restcountries.com/v3.1/all?fields=name,cca2,flags,region")
    .then(response => {
      if (!response.ok) throw new Error("HTTP Error " + response.status);
      return response.json();
    })
    .then(data => {
      if (!Array.isArray(data)) throw new Error("Invalid API response");

      countries = data;
      console.log("Countries loaded:", countries.length);
      renderCountries(countries);
    })
    .catch(error => {
      console.warn("API unavailable, CRUD still works:", error.message);
      const container = document.getElementById("countryList");
      if (container) {
        container.innerHTML =
          "<p>Data negara tidak tersedia. Anda tetap dapat menambahkan catatan secara manual.</p>";
      }
    });
}

// ===============================
// RENDER COUNTRY LIST (API)
// ===============================
function renderCountries(list) {
  const container = document.getElementById("countryList");
  if (!container) return;

  container.innerHTML = "";

  list.forEach(country => {
    const name = country?.name?.common || "Unknown";
    const flag = country?.flags?.png || "";

    const div = document.createElement("div");
    div.className = "country-item";

    div.innerHTML = `
      <img src="${flag}" alt="${name}" width="40">
      <strong>${name}</strong>
      <button type="button">Gunakan</button>
    `;

    div.querySelector("button").addEventListener("click", () => {
      prepareNote(name);
    });

    container.appendChild(div);
  });
}

// ===============================
// FILTER COUNTRY (API OPTIONAL)
// ===============================
function filterCountries(e) {
  if (!Array.isArray(countries)) return;

  const keyword = e.target.value.toLowerCase();
  const filtered = countries.filter(c =>
    c?.name?.common?.toLowerCase().includes(keyword)
  );

  renderCountries(filtered);
}

// ===============================
// PREPARE NOTE (AUTOFILL OPTIONAL)
// ===============================
function prepareNote(name) {
  document.getElementById("noteId").value = "";
  document.getElementById("noteCountry").value = name;
  document.getElementById("noteText").value = "";
  document.getElementById("notePriority").value = "Normal";

  console.log("Prepare note (API autofill):", name);
}

// ===============================
// SAVE NOTE (CREATE & UPDATE)
// ===============================
function saveNote(e) {
  e.preventDefault();

  const id = document.getElementById("noteId").value;
  const country = document.getElementById("noteCountry").value.trim();
  const text = document.getElementById("noteText").value.trim();
  const priority = document.getElementById("notePriority").value;

  if (!country || !text) {
    alert("Negara dan catatan wajib diisi");
    return;
  }

  if (id) {
    // UPDATE
    const index = notes.findIndex(n => n.id == id);
    if (index !== -1) {
      notes[index].country = country;
      notes[index].note = text;
      notes[index].priority = priority;
      console.log("Note updated:", notes[index]);
    }
  } else {
    // CREATE
    const newNote = {
      id: Date.now(),
      country,
      note: text,
      priority
    };
    notes.push(newNote);
    console.log("Note added:", newNote);
  }

  saveNotes();
  renderNotes();
  e.target.reset();
}

// ===============================
// RENDER NOTES TABLE (READ)
// ===============================
function renderNotes() {
  const table = document.getElementById("notesTable");
  if (!table) return;

  table.innerHTML = "";

  notes.forEach(note => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${note.country}</td>
      <td>${note.note}</td>
      <td>${note.priority}</td>
      <td>
        <button type="button">Edit</button>
        <button type="button">Hapus</button>
      </td>
    `;

    tr.querySelectorAll("button")[0].addEventListener("click", () => {
      editNote(note.id);
    });

    tr.querySelectorAll("button")[1].addEventListener("click", () => {
      deleteNote(note.id);
    });

    table.appendChild(tr);
  });
}

// ===============================
// EDIT NOTE
// ===============================
function editNote(id) {
  const note = notes.find(n => n.id === id);
  if (!note) return;

  document.getElementById("noteId").value = note.id;
  document.getElementById("noteCountry").value = note.country;
  document.getElementById("noteText").value = note.note;
  document.getElementById("notePriority").value = note.priority;

  console.log("Editing note:", note);
}

// ===============================
// DELETE NOTE
// ===============================
function deleteNote(id) {
  notes = notes.filter(n => n.id !== id);
  saveNotes();
  renderNotes();
  console.log("Note deleted:", id);
}

// ===============================
// LOCAL STORAGE
// ===============================
function saveNotes() {
  localStorage.setItem("countryNotes", JSON.stringify(notes));
}

function loadNotes() {
  const data = localStorage.getItem("countryNotes");
  notes = data ? JSON.parse(data) : [];
  console.log("Notes loaded from localStorage:", notes.length);
}

// ===============================
// LOAD INITIAL JSON (JSON LOKAL)
// ===============================
function loadInitialJSON() {
  if (localStorage.getItem("countryNotes")) {
    console.log("LocalStorage exists, skip JSON");
    return;
  }

  fetch("data/data.json")
    .then(res => res.json())
    .then(data => {
      if (!Array.isArray(data)) throw new Error("Invalid local JSON");

      notes = data;
      saveNotes();
      renderNotes();
      console.log("Initial JSON loaded:", data.length);
    })
    .catch(err => {
      console.warn("Local JSON not loaded:", err.message);
    });
}
