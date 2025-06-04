// Script for the product management table
// Sample file
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


// Update dashboard with filtered product count
function updateDashboard() {
  anzeige.textContent = groceriesFiltered.length;

  // Calculate average amount
  const summen = groceriesFiltered.reduce((acc, p) => acc + (p.amount || 0), 0);
  const durchschnitt = groceriesFiltered.length ? (summen / groceriesFiltered.length).toFixed(1) : 0;
  document.getElementById("avg-amount").textContent = durchschnitt;

  // Count categories
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

  // Action menu for edit and delete
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

  // Edit and delete buttons
  document.querySelectorAll('.menu .edit').forEach(btn => {
    btn.addEventListener('click', e => bearbeiten(Number(e.target.dataset.idx)));
  });
  document.querySelectorAll('.menu .delete').forEach(btn => {
    btn.addEventListener('click', e => loeschen(Number(e.target.dataset.idx)));
  });
  updateDashboard();
}

// Fetch data and render table
async function fetchDataAndRender() {
  try {
    const response = await fetch(url + '/grocery/all');
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }
    const data = await response.json();

    const newData = Array.isArray(data) ? data : [data];

    groceries.length = 0;
    groceries.push(...newData);

    groceriesFiltered = [...groceries];

    renderTable(groceriesFiltered);
  } catch (error) {
    console.error('Error fetching data:', error);
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

  // Validation
  if (!gtin || gtin.toString().length > 14 || gtin.toString().length < 8
    || !name || !brand || !category || amount <= 0 || !unit) {
    alert("Please enter valid values! GTIN must be 8–14 digits. Name, Brand, Category, Amount (>0) and Unit are required.");
    return;
  }

  // New product object
  const neu = {
    gtin, name, brand, category, imageUrl,
    amount, unit, drainedAmount, drainedUnit
  };

  try {
    // POST to backend: /grocery
    const response = await fetch(url + '/grocery', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(neu)
    });
    if (!response.ok) {
      throw new Error(`Backend error on create: ${response.status}`);
    }

    const created = await response.json();

    groceries.push(created);

    showToast("Product added successfully!");

    // Refill category dropdown
    kategorieFilter.innerHTML = '<option value="alle">Alle Kategorien</option>';
    setCategoryDropdown();

    // Reset filter/search and re-render table
    search.value = '';
    groceriesFiltered = [...groceries];
    sortKey ? sortBy(sortKey) : renderTable(groceriesFiltered);

    // Clear input fields
    document.querySelectorAll('#addGrocery input').forEach(i => i.value = '');

  } catch (error) {
    console.error("Error adding product:", error);
    alert("Product could not be added. Please try again later.");
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

    // Default full-text search over all fields
    const passtZurSuche = Object.values(p)
      .some(v => String(v).toLowerCase().includes(t));

    return passtZurSuche && passtZurKategorie;
  });

  sortKey ? sortBy(sortKey) : renderTable(groceriesFiltered);
}

// Edit product
async function bearbeiten(idx) {
  const p = groceriesFiltered[idx];
  p.name = prompt("Name:", p.name) ?? p.name;
  p.brand = prompt("Brand:", p.brand) ?? p.brand;
  p.category = prompt("Category:", p.category) ?? p.category;
  p.imageUrl = prompt("Image URL:", p.imageUrl) ?? p.imageUrl;
  p.amount = Number(prompt("Amount:", p.amount)) || p.amount;
  p.unit = prompt("Unit:", p.unit) ?? p.unit;
  p.drainedAmount = Number(prompt("Drained Amount:", p.drainedAmount)) || p.drainedAmount;
  p.drainedUnit = prompt("Drained Unit:", p.drainedUnit) ?? p.drainedUnit;

  // PUT to backend: /grocery/{gtin}
  try {
    const response = await fetch(url + `/grocery/${p.gtin}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(p)
    });
    if (!response.ok) {
      throw new Error(`Backend error on update: ${response.status}`);
    }

    const updated = await response.json();

    const origIdx = groceries.findIndex(x => x.gtin === updated.gtin);
    if (origIdx !== -1) {
      groceries[origIdx] = updated;
    } else {
      groceries.push(updated);
    }

    // If category was changed, refill dropdown
    kategorieFilter.innerHTML = '<option value="alle">Alle Kategorien</option>';
    setCategoryDropdown();

    filtereTabelle(search.value, kategorieFilter.value);
    showToast("Product updated successfully!");

  } catch (error) {
    console.error("Error updating product:", error);
    alert("Product could not be saved. Please try again later.");
  }
}

// Delete product
async function loeschen(idx) {
  const p = groceriesFiltered[idx];

  if (!confirm(`Delete product "${p.name}"?`)) return;

  try {
    // DELETE to backend: /grocery/{gtin}
    const response = await fetch(url + `/grocery/${p.gtin}`, {
      method: 'DELETE'
    });
    if (!response.ok) {
      throw new Error(`Backend error on delete: ${response.status}`);
    }

    const origIdx = groceries.findIndex(x => x.gtin === p.gtin);
    if (origIdx !== -1) {
      groceries.splice(origIdx, 1);
    }

    // Refill category dropdown, filter/re-render table
    kategorieFilter.innerHTML = '<option value="alle">Alle Kategorien</option>';
    setCategoryDropdown();
    filtereTabelle(search.value, kategorieFilter.value);

    showToast("Product deleted successfully!");

  } catch (error) {
    console.error("Error deleting product:", error);
    alert("Product could not be deleted. Please try again later.");
  }
}

// Show toast message
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
  // Define header
  const header = [
    'GTIN', 'Name', 'Brand', 'Category', 'Amount', 'Unit', 'DrainedAmount', 'DrainedUnit'
  ];
  // Generate data rows
  const rows = groceriesFiltered.map(p => [
    p.gtin,
    `"${p.name.replace(/"/g, '""')}"`,
    `"${p.brand.replace(/"/g, '""')}"`,
    `"${p.category.replace(/"/g, '""')}"`,
    p.amount,
    `"${p.unit.replace(/"/g, '""')}"`,
    p.drainedAmount,
    `"${p.drainedUnit.replace(/"/g, '""')}"`
  ]);

  // Build CSV string
  const csvContent =
    header.join(',') + '\n' +
    rows.map(r => r.join(',')).join('\n');

  // Create blob and download link
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

// Event listeners
document.querySelectorAll("th[data-key]").forEach(th =>
  th.addEventListener("click", () => sortBy(th.dataset.key))
);
search.addEventListener("input", () => filtereTabelle(search.value, kategorieFilter.value));
kategorieFilter.addEventListener("change", () => filtereTabelle(search.value, kategorieFilter.value));
btnAdd.addEventListener("click", addProduct);
document.getElementById('btn_export')
  .addEventListener('click', exportCSV);

// Initialization
document.addEventListener('DOMContentLoaded', () => {
  fetchDataAndRender();
  renderTable(groceriesFiltered);
  updateDashboard();
  setCategoryDropdown();
});