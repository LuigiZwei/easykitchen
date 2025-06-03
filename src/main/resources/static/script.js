// Script für die Produktverwaltungstabelle
// Probedatei
const produkte = [
  { gtin: 1234567890123, name: "Tomatensauce", brand: "Hausmarke", category: "Konserven", imageUrl: "https://www.alimentarium.org/sites/default/files/media/image/2016-10/AL001-02%20tomate_0.jpg", amount: 400, unit: "g", drainedAmount: 240, drainedUnit: "g" },
  { gtin: 9876543210123, name: "Mais", brand: "GoldKorn", category: "Konserven", imageUrl: "https://example.com/image2.jpg", amount: 300, unit: "g", drainedAmount: 200, drainedUnit: "g" },
  { gtin: 1112223334445, name: "Haferflocken", brand: "BioFit", category: "Getreide", imageUrl: "https://example.com/image3.jpg", amount: 500, unit: "g", drainedAmount: 0, drainedUnit: "" }
];

let sortKey = '', sortAsc = true;
let gefilterte = [...produkte];
const tabelle = document.getElementById("produkt-tabelle");
const suche = document.getElementById("suche");
const anzeige = document.getElementById("anzahl-produkte");
const kategorieFilter = document.getElementById("kategorie-filter");
const btnAdd = document.getElementById("btn_add");


function exportCSV() {
  // Kopfzeile definieren
  const header = [
    'GTIN','Name','Brand','Category','Amount','Unit','DrainedAmount','DrainedUnit'
  ];
  // Datenzeilen generieren
  const rows = gefilterte.map(p => [
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
  a.download = 'produkte_export.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}





// Dashboard aktualisieren - zeigt Anzahl der gefilterten Produkte
function updateDashboard() {
  // Gesamtanzahl
  anzeige.textContent = gefilterte.length;
  
  // Durchschnittliche Menge berechnen
  const summen = gefilterte.reduce((acc, p) => acc + (p.amount || 0), 0);
  const durchschnitt = gefilterte.length ? (summen / gefilterte.length).toFixed(1) : 0;
  document.getElementById("avg-amount").textContent = durchschnitt;
  
  // Kategorien zählen
  const statistik = {};
  gefilterte.forEach(p => {
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

// Tabelle rendern
function renderTable(arr) {
  tabelle.innerHTML = '';
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
    tabelle.appendChild(tr);
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
    const response = await fetch('http://localhost:8080/grocery/1'); // URL anpassen
    if (!response.ok) {
      throw new Error(`HTTP Fehler: ${response.status}`);
    }
    const data = await response.json();
    gefilterte = Array.isArray(data) ? data : [data]; // Sicherstellen, dass es ein Array ist
    renderTable(gefilterte);
  } catch (error) {
    console.error('Fehler beim Abrufen der Daten:', error);
  }
}

// Produkt hinzufügen
function addProdukt() {
  const gtin = Number(document.getElementById("in_gtin").value);
  const name = document.getElementById("in_name").value.trim();
  const brand = document.getElementById("in_brand").value.trim();
  const category = document.getElementById("in_category").value.trim();
  const imageUrl = document.getElementById("in_imageUrl").value.trim();
  const amount = Number(document.getElementById("in_amount").value);
  const unit = document.getElementById("in_unit").value.trim();
  const drainedAmount = Number(document.getElementById("in_drainedAmt").value);
  const drainedUnit = document.getElementById("in_drainedUnit").value.trim();
  
  // Validierung
  if (!gtin || gtin.toString().length !== 13 || !name || !brand || !category || amount <= 0 || !unit) {
    alert("Bitte gültige Werte eingeben! GTIN muss 13-stellig sein. Name, Brand, Kategorie, Amount (>0) und Unit sind Pflichtfelder.");
    return;
  }
  
  // neue Eingabe in Haupt-Array schieben
  const neu = { gtin, name, brand, category, imageUrl, amount, unit, drainedAmount, drainedUnit };
  produkte.push(neu);
  //Nachricht für erfolgreiches hinzufügen
  showToast("Produkt erfolgreich hinzugefügt!");
  
  // Kategorie-Dropdown neu befüllen
  kategorieFilter.innerHTML = '<option value="alle">Alle Kategorien</option>';
  fuelleKategorienDropdown();
  // Suchfilter zurücksetzen und Tabelle neu rendern
  suche.value = '';
  gefilterte = [...produkte];
  sortKey ? sortiereNach(sortKey) : renderTable(gefilterte);
  // Eingabefelder zurücksetzen
  document.querySelectorAll('#eingabezeile input').forEach(i => i.value = '');
}


// Sortierung
function sortiereNach(key) {
  if (sortKey === key) sortAsc = !sortAsc;
  else { sortKey = key; sortAsc = true; }
  
  gefilterte.sort((a, b) => {
    const va = a[key], vb = b[key];
    if (typeof va === 'number') return sortAsc ? va - vb : vb - va;
    return sortAsc ? String(va).localeCompare(vb) : String(vb).localeCompare(va);
  });
  
  document.querySelectorAll("th").forEach(th => {
    th.classList.remove("sort-asc", "sort-desc");
    if (th.dataset.key === sortKey) th.classList.add(sortAsc ? "sort-asc" : "sort-desc");
  });
  // Tabelle aktualisieren
  renderTable(gefilterte);
}

// Kategorien Dropdown füllen
function fuelleKategorienDropdown() {
  const kategorien = [...new Set(produkte.map(p => p.category))];
  kategorien.forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    kategorieFilter.appendChild(opt);
  });
}

// Filtern (Suche + Kategorie) mit Operatoren für amount und drainedAmount
function filtereTabelle(term = suche.value, kategorie = kategorieFilter.value) {
  const t = term.trim().toLowerCase();
  
  // Prüfe, ob die Suche mit einem Operator beginnt
  const matchOperator = t.match(/^([<>=])\s*(\d+(\.\d+)?)/);
  
  gefilterte = produkte.filter(p => {
    const passtZurKategorie = (kategorie === 'alle' || p.category.toLowerCase() === kategorie.toLowerCase());
    
    if (matchOperator) {
      const operator = matchOperator[1];
      const wert = parseFloat(matchOperator[2]);
      
      // Prüfe sowohl amount als auch drainedAmount
      const prüfung = val => {
        switch (operator) {
          case '=': return val === wert;
          case '>': return val > wert;
          case '<': return val < wert;
          default:  return false;
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
  sortKey ? sortiereNach(sortKey) : renderTable(gefilterte);
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
        
        sortKey ? sortiereNach(sortKey) : renderTable(gefilterte);
        }*/
       
       // Bearbeiten 
       function bearbeiten(idx) {
         const p = gefilterte[idx];
         p.name = prompt("Name:", p.name) ?? p.name;
         p.brand = prompt("Brand:", p.brand) ?? p.brand;
         p.category = prompt("Category:", p.category) ?? p.category;
         p.imageUrl = prompt("Image URL:", p.imageUrl) ?? p.imageUrl;
         p.amount = Number(prompt("Amount:", p.amount)) || p.amount;
         p.unit = prompt("Unit:", p.unit) ?? p.unit;
         p.drainedAmount = Number(prompt("Drained Amount:", p.drainedAmount)) || p.drainedAmount;
         p.drainedUnit = prompt("Drained Unit:", p.drainedUnit) ?? p.drainedUnit;
         
         // Originalprodukt aktualisieren
         const origIdx = produkte.findIndex(x => x.gtin === p.gtin);
         produkte[origIdx] = p;
         
         // Wenn Kategorie geändert wurde Kategorien-Dropdown aktualisieren
         kategorieFilter.innerHTML = '<option value="alle">Alle Kategorien</option>';
         fuelleKategorienDropdown();
         // Tabelle aktualisieren
         filtereTabelle(suche.value, kategorieFilter.value);
         //Nachricht bei erfolgreichem Bearbeiten
         showToast("Produkt bearbeitet!");
        }
        
        // Löschen 
        function loeschen(idx) {
          const p = gefilterte[idx];
          const origIdx = produkte.findIndex(x => x.gtin === p.gtin);
          produkte.splice(origIdx, 1);
          
          // Kategorien-Dropdown aktualisieren
          kategorieFilter.innerHTML = '<option value="alle">Alle Kategorien</option>';
          fuelleKategorienDropdown();
          
          filtereTabelle(suche.value, kategorieFilter.value);
          //Nachricht bei erfolgreichem Löschen
          showToast("Produkt gelöscht!");
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
        
        // Event Listener
        // für Sortiere nach Spaltenüberschrift
        document.querySelectorAll("th[data-key]").forEach(th =>
          th.addEventListener("click", () => sortiereNach(th.dataset.key))
        );
        // für Suchfeld
        suche.addEventListener("input", () => filtereTabelle(suche.value, kategorieFilter.value));
        // für Filter Dropdown
        kategorieFilter.addEventListener("change", () => filtereTabelle(suche.value, kategorieFilter.value));
        // für Hinzufügen-Button
        btnAdd.addEventListener("click", addProdukt);
        // für Export-Button
        document.getElementById('btn_export')
        .addEventListener('click', exportCSV);

        // Initialisierung
        document.addEventListener('DOMContentLoaded', () => {
          fetchDataAndRender();
          renderTable(gefilterte);
          updateDashboard();
          fuelleKategorienDropdown();
        });