// Script für die Produktverwaltungstabelle
// Probedatei
const groceries = [
  { gtin: 1234567890123, name: "Tomatensauce", brand: "Hausmarke", category: "Konserven", imageUrl: "https://www.alimentarium.org/sites/default/files/media/image/2016-10/AL001-02%20tomate_0.jpg", amount: 400, unit: "g", drainedAmount: 240, drainedUnit: "g" },
  { gtin: 9876543210123, name: "Mais", brand: "GoldKorn", category: "Konserven", imageUrl: "https://example.com/image2.jpg", amount: 300, unit: "g", drainedAmount: 200, drainedUnit: "g" },
  { gtin: 1112223334445, name: "Haferflocken", brand: "BioFit", category: "Getreide", imageUrl: "https://example.com/image3.jpg", amount: 500, unit: "g", drainedAmount: 0, drainedUnit: "" }
];

let sortKey = '', sortAsc = true;
let groceriesFiltered = [...groceries];


const url = "http://localhost:8080"
const table = document.getElementById("produkt-tabelle");
const search = document.getElementById("suche");
const anzeige = document.getElementById("anzahl-produkte");
const kategorieFilter = document.getElementById("kategorie-filter");
const btnAdd = document.getElementById("btn_add");


// Dashboard aktualisieren - zeigt Anzahl der gefilterten Produkte
function updateDashboard() {
  // Gesamtanzahl
  anzeige.textContent = groceriesFiltered.length;

  // Durchschnittliche Menge berechnen
  const summen = groceriesFiltered.reduce((acc, p) => acc + (p.amount || 0), 0);
  const durchschnitt = groceriesFiltered.length ? (summen / groceriesFiltered.length).toFixed(1) : 0;
  document.getElementById("avg-amount").textContent = durchschnitt;

  // Kategorien zählen
  const statistik = {};
  groceriesFiltered.forEach(p => {
    statistik[p.category] = (statistik[p.category] || 0) + 1;
  });

  const ul = document.getElementById("kategorie-statistik");
  ul.innerHTML = '';
  Object.entries(statistik).forEach(([kategorie, anzahl]) => {
    const li = document.createElement("li");
    li.textContent = `${kategorie}: ${anzahl}`;
    ul.appendChild(li);
  });
}

function renderTable(arr) {
  table.innerHTML = '';
  arr.forEach((p, idx) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
    <td>${p.gtin}</td>
    <td>${p.name}</td>
    <td>${p.brand}</td>
    <td>${p.category}</td>
    <td><a href="${p.imageUrl}" target="_blank" rel="noopener">
    <img src="${p.imageUrl}" alt="${p.name}" style="width:50px; height:auto; object-fit:cover; border-radius:4px;">
    </a>
    </td>
    <td>${p.amount}</td>
    <td>${p.unit}</td>
    <td>${p.drainedAmount}</td>
    <td>${p.drainedUnit}</td>
    <td class="actions">
    <button aria-label="Menü öffnen">⋮</button>
    <div class="menu" role="menu">
    <button class="edit"   data-idx="${idx}" role="menuitem">Bearbeiten</button>
    <button class="delete" data-idx="${idx}" role="menuitem">Löschen</button>
    </div>
    </td>
    `;
    table.appendChild(tr);
  });

  // Menü für Bearbeiten und Löschen
  document.querySelectorAll('.actions button').forEach(btn => {
    const menu = btn.nextElementSibling;
    btn.addEventListener('click', e => {
      e.stopPropagation();
      document.querySelectorAll('.menu').forEach(m => {
        if (m !== menu) m.style.display = 'none';
      });
      menu.style.display = (menu.style.display === 'block') ? 'none' : 'block';
    });

  });
  document.addEventListener('click', () => {
    document.querySelectorAll('.menu').forEach(m => m.style.display = 'none');
  });

  // Bearbeit und Lösch Buttons
  document.querySelectorAll('.menu .edit').forEach(btn => {
    btn.addEventListener('click', e => bearbeiten(Number(e.target.dataset.idx)));
  });
  document.querySelectorAll('.menu .delete').forEach(btn => {
    btn.addEventListener('click', e => loeschen(Number(e.target.dataset.idx)));
  });
  //Dashboard aktualisieren
  updateDashboard();
}

// Daten abrufen und Tabelle rendern
async function fetchDataAndRender() {
  try {
    const response = await fetch(url + '/grocery/all'); // URL 
    if (!response.ok) {
      throw new Error(`HTTP Fehler: ${response.status}`);
    }
    const data = await response.json();
    // Falls die Antwort ein Objekt ist, in ein Array umwandeln
    const newData = Array.isArray(data) ? data : [data];

    // 1. produkte ersetzen (oder befüllen) mit den neuen Daten
    groceries.length = 0;          // altes Array leeren
    groceries.push(...newData);    // alle neuen Elemente einfügen

    // 2. gefilterte = produkte (frisch gefüllt)
    groceriesFiltered = [...groceries];

    // 3. Tabelle rendern
    renderTable(groceriesFiltered);
  } catch (error) {
    console.error('Fehler beim Abrufen der Daten:', error);
  }
}

async function addProduct() {
  const gtin = document.getElementById("in_gtin").value.trim();
  const name = document.getElementById("in_name").value.trim();
  const brand = document.getElementById("in_brand").value.trim();
  const category = document.getElementById("in_category").value.trim();
  const imageUrl = document.getElementById("in_imageUrl").value.trim();
  const amount = Number(document.getElementById("in_amount").value);
  const unit = document.getElementById("in_unit").value.trim();
  const drainedAmount = Number(document.getElementById("in_drainedAmt").value);
  const drainedUnit = document.getElementById("in_drainedUnit").value.trim();

  // Validierung
  if (!gtin || gtin.toString().length > 14 || gtin.toString().length < 8
    || !name || !brand || !category || amount <= 0 || !unit) {
    alert("Bitte gültige Werte eingeben! GTIN muss 8–14-stellig sein. Name, Brand, Kategorie, Amount (>0) und Unit sind Pflichtfelder.");
    return;
  }

  // Neues Produkt‐Objekt
  const neu = {
    gtin, name, brand, category, imageUrl,
    amount, unit, drainedAmount, drainedUnit
  };

  try {
    // === POST ans Backend: /grocery 
    const response = await fetch(url + '/grocery', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(neu)
    });
    if (!response.ok) {
      throw new Error(`Backend-Fehler beim Anlegen: ${response.status}`);
    }

    // Backend gibt idealerweise das neu angelegte Objekt (oder zumindest den Erfolgsstatus) zurück.
    const created = await response.json();
    // (Falls dein Backend nichts zurückschickt, kannst du hier einfach "neu" weiterverwenden.)

    // === Lokales Array aktualisieren ===
    groceries.push(created);   // oder: produkte.push(neu);

    showToast("Produkt erfolgreich hinzugefügt!");

    // Kategorie‐Dropdown neu befüllen
    kategorieFilter.innerHTML = '<option value="alle">Alle Kategorien</option>';
    setCategoryDropdown();

    // Filter/Suche zurücksetzen und Tabelle neu rendern
    search.value = '';
    groceriesFiltered = [...groceries];
    sortKey ? sortBy(sortKey) : renderTable(groceriesFiltered);

    // Eingabefelder leeren
    document.querySelectorAll('#eingabezeile input').forEach(i => i.value = '');

  } catch (error) {
    console.error("Fehler beim Hinzufügen:", error);
    alert("Produkt konnte nicht hinzugefügt werden. Bitte versuche es später erneut.");
  }
}

function sortBy(key) {
  if (sortKey === key) sortAsc = !sortAsc;
  else { sortKey = key; sortAsc = true; }

  groceriesFiltered.sort((a, b) => {
    const va = a[key], vb = b[key];
    if (typeof va === 'number') return sortAsc ? va - vb : vb - va;
    return sortAsc ? String(va).localeCompare(vb) : String(vb).localeCompare(va);
  });

  document.querySelectorAll("th").forEach(th => {
    th.classList.remove("sort-asc", "sort-desc");
    if (th.dataset.key === sortKey) th.classList.add(sortAsc ? "sort-asc" : "sort-desc");
  });
  renderTable(groceriesFiltered);
}

function setCategoryDropdown() {
  const kategorien = [...new Set(groceries.map(p => p.category))];
  kategorien.forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    kategorieFilter.appendChild(opt);
  });
}

function filtereTabelle(term = search.value, kategorie = kategorieFilter.value) {
  const t = term.trim().toLowerCase();
  const matchOperator = t.match(/^([<>=])\s*(\d+(\.\d+)?)/);

  groceriesFiltered = groceries.filter(p => {
    const passtZurKategorie = (kategorie === 'alle' || p.category.toLowerCase() === kategorie.toLowerCase());

    if (matchOperator) {
      const operator = matchOperator[1];
      const wert = parseFloat(matchOperator[2]);

      const prüfung = val => {
        switch (operator) {
          case '=': return val === wert;
          case '>': return val > wert;
          case '<': return val < wert;
          default: return false;
        }
      };

      return passtZurKategorie && (prüfung(p.amount) || prüfung(p.drainedAmount));
    }

    // Standard-Volltextsuche über alle Felder
    const passtZurSuche = Object.values(p)
      .some(v => String(v).toLowerCase().includes(t));

    return passtZurSuche && passtZurKategorie;
  });

  // Sortierung oder direktes Rendern
  sortKey ? sortBy(sortKey) : renderTable(groceriesFiltered);
}
/*
// Filter mit Operatoren nur für amount 
function filtereTabelle(term = suche.value, kategorie = kategorieFilter.value) {
  const t = term.trim().toLowerCase();
  
  const matchOperator = t.match(/^([<>=])\s*(\d+(\.\d+)?)/); // Zahlensuche
  gefilterte = produkte.filter(p => {
    const passtZurKategorie = (kategorie === 'alle' || p.category.toLowerCase() === kategorie.toLowerCase());
    
    if (matchOperator) {
      const operator = matchOperator[1];
      const wert = parseFloat(matchOperator[2]);
      switch (operator) {
        case '=': return p.amount === wert && passtZurKategorie;
        case '>': return p.amount > wert && passtZurKategorie;
        case '<': return p.amount < wert && passtZurKategorie;
        default: return false;
      }
    }
    
    // Standard-Suche über alle Felder
    const passtZurSuche = Object.values(p).some(v => String(v).toLowerCase().includes(t));
    return passtZurSuche && passtZurKategorie;
  });
  
  sortKey ? sortBy(sortKey) : renderTable(gefilterte);
}*/

// Bearbeiten 
async function bearbeiten(idx) {
  const p = groceriesFiltered[idx]; // p ist das geändernde Objekt
  // Alte Werte in den Prompts anzeigen, Änderungen reinschreiben lassen
  p.name = prompt("Name:", p.name) ?? p.name;
  p.brand = prompt("Brand:", p.brand) ?? p.brand;
  p.category = prompt("Category:", p.category) ?? p.category;
  p.imageUrl = prompt("Image URL:", p.imageUrl) ?? p.imageUrl;
  p.amount = Number(prompt("Amount:", p.amount)) || p.amount;
  p.unit = prompt("Unit:", p.unit) ?? p.unit;
  p.drainedAmount = Number(prompt("Drained Amount:", p.drainedAmount)) || p.drainedAmount;
  p.drainedUnit = prompt("Drained Unit:", p.drainedUnit) ?? p.drainedUnit;

  // === PUT ans Backend: /grocery/{gtin} ===
  try {
    const response = await fetch(url + `/grocery/${p.gtin}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(p)
    });
    if (!response.ok) {
      throw new Error(`Backend-Fehler beim Updaten: ${response.status}`);
    }

    // Backend sendet idealerweise das aktualisierte Objekt zurück (oder 204 No Content).
    const updated = await response.json();
    // Fallback, falls dein Backend gar nichts zurückgibt: mit p arbeiten.

    // === Lokales Array aktualisieren ===
    const origIdx = groceries.findIndex(x => x.gtin === updated.gtin);
    if (origIdx !== -1) {
      groceries[origIdx] = updated;
    } else {
      // Soll nicht passieren, aber zur Sicherheit:
      groceries.push(updated);
    }

    // Wenn Kategorie geändert wurde, Dropdown neu befüllen
    kategorieFilter.innerHTML = '<option value="alle">Alle Kategorien</option>';
    setCategoryDropdown();

    // Tabelle neu rendern (unter Berücksichtigung der aktuellen Filter)
    filtereTabelle(search.value, kategorieFilter.value);
    showToast("Produkt erfolgreich bearbeitet!");

  } catch (error) {
    console.error("Fehler beim Bearbeiten:", error);
    alert("Produkt konnte nicht gespeichert werden. Bitte versuche es später erneut.");
  }
}


// Löschen 
async function loeschen(idx) {
  const p = groceriesFiltered[idx];

  // Optional: Bestätigungsdialog
  if (!confirm(`Produkt "${p.name}" wirklich löschen?`)) return;

  try {
    // === DELETE ans Backend: /grocery/{gtin} ===
    const response = await fetch(url + `/grocery/${p.gtin}`, {
      method: 'DELETE'
    });
    if (!response.ok) {
      throw new Error(`Backend-Fehler beim Löschen: ${response.status}`);
    }

    // === Lokales Array aktualisieren ===
    const origIdx = groceries.findIndex(x => x.gtin === p.gtin);
    if (origIdx !== -1) {
      groceries.splice(origIdx, 1);
    }

    // Kategorie‐Dropdown neu befüllen, Tabelle filtern/neu rendern
    kategorieFilter.innerHTML = '<option value="alle">Alle Kategorien</option>';
    setCategoryDropdown();
    filtereTabelle(search.value, kategorieFilter.value);

    showToast("Produkt erfolgreich gelöscht!");

  } catch (error) {
    console.error("Fehler beim Löschen:", error);
    alert("Produkt konnte nicht gelöscht werden. Bitte versuche es später erneut.");
  }
}


// Toast-Nachricht anzeigen
function showToast(message, duration = 3000) {
  const container = document.getElementById("toast-container");
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => container.removeChild(toast), 500);
  }, duration);
}

function exportCSV() {
  // Kopfzeile definieren
  const header = [
    'GTIN', 'Name', 'Brand', 'Category', 'Amount', 'Unit', 'DrainedAmount', 'DrainedUnit'
  ];
  // Datenzeilen generieren
  const rows = groceriesFiltered.map(p => [
    p.gtin,
    `"${p.name.replace(/"/g, '""')}"`,        // Anführungszeichen in Strings escapen
    `"${p.brand.replace(/"/g, '""')}"`,
    `"${p.category.replace(/"/g, '""')}"`,
    p.amount,
    `"${p.unit.replace(/"/g, '""')}"`,
    p.drainedAmount,
    `"${p.drainedUnit.replace(/"/g, '""')}"`
  ]);

  // CSV-String zusammenbauen
  const csvContent =
    header.join(',') + '\n' +
    rows.map(r => r.join(',')).join('\n');

  // Blob und Download-Link erzeugen
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'groceries_export.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}


// Event Listener
// für Sortiere nach Spaltenüberschrift
document.querySelectorAll("th[data-key]").forEach(th =>
  th.addEventListener("click", () => sortBy(th.dataset.key))
);
// für Suchfeld
search.addEventListener("input", () => filtereTabelle(search.value, kategorieFilter.value));
// für Filter Dropdown
kategorieFilter.addEventListener("change", () => filtereTabelle(search.value, kategorieFilter.value));
// für Hinzufügen-Button
btnAdd.addEventListener("click", addProduct);
// für Export-Button
document.getElementById('btn_export')
  .addEventListener('click', exportCSV);

// Initialisierung
document.addEventListener('DOMContentLoaded', () => {
  fetchDataAndRender();
  renderTable(groceriesFiltered);
  updateDashboard();
  setCategoryDropdown();
});