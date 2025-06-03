const apiBase = '/api/recipes'; // passe URL an

// Lädt beim Seitenaufruf alle Rezepte und rendert sie
async function loadRecipes() {
  try {
    const res = await fetch(apiBase);
    if (!res.ok) throw new Error('Fehler beim Laden');
    const recipes = await res.json();
    const list = document.getElementById('recipe-list');
    list.innerHTML = recipes.map(r => `
      <div class="recipe">
        <h3>${r.title}</h3>
        <p>${r.instructions}</p>
      </div>
    `).join('');
  } catch (err) {
    console.error(err);
    document.getElementById('recipe-list').textContent = 'Konnte Rezepte nicht laden.';
  }
}

// Sendet ein neues Rezept an das Backend
async function addRecipe(event) {
  event.preventDefault();
  const title = document.getElementById('title').value.trim();
  const instructions = document.getElementById('instructions').value.trim();
  if (!title || !instructions) return;

  const payload = { title, instructions };
  try {
    const res = await fetch(apiBase, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Fehler beim Speichern');
    // Formular zurücksetzen
    event.target.reset();
    // Liste neu laden, um das neue Rezept zu zeigen
    await loadRecipes();
  } catch (err) {
    console.error(err);
    alert('Speichern fehlgeschlagen.');
  }
}

// Event-Handler registrieren
document.addEventListener('DOMContentLoaded', () => {
  loadRecipes();
  document.getElementById('recipe-form').addEventListener('submit', addRecipe);
});
