const apiBase = '/api/recipes';

// Loads all recipes and renders them
async function loadRecipes() {
  try {
    const res = await fetch(apiBase);
    if (!res.ok) throw new Error('Fehler beim Laden');
    const recipes = await res.json();
    const list = document.getElementById('recipeList');
    list.innerHTML = recipes.map(r => `
      <div class="recipe">
        <h3>${r.title}</h3>
        <p>${r.instructions}</p>
      </div>
    `).join('');
  } catch (err) {
    console.error(err);
    document.getElementById('recipeList').textContent = 'Rezepte konnten nicht geladen werden.';
  }
}

// Sends a new recipe to the backend
async function addRecipe(event) {
  event.preventDefault();
  const title = document.getElementById('title').value.trim();
  const instructions = document.getElementById('instructions').value.trim();
  if (!title) {
    alert('Bitte gib einen Titel ein.');
    return;
  }
  if (!instructions) {
    alert('Bitte gib eine Anleitung ein.');
    return;
  }

  const payload = { title, instructions };
  const submitBtn = document.querySelector('#recipeForm button[type="submit"]');
  submitBtn.disabled = true;
  try {
    const res = await fetch(apiBase, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Fehler beim Speichern');
    event.target.reset();
    await loadRecipes();
    showToast('Rezept erfolgreich gespeichert!');
  } catch (err) {
    console.error(err);
    alert('Rezept konnte nicht gespeichert werden. Bitte versuche es später erneut.');
  } finally {
    submitBtn.disabled = false;
  }
}

function showToast(msg, duration = 3000) {
  let toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 500);
  }, duration);
}

// Register event handlers
document.addEventListener('DOMContentLoaded', () => {
  loadRecipes();
  document.getElementById('recipeForm').addEventListener('submit', addRecipe);
});
