const apiBase = '/api/recipes';

// Loads all recipes and renders them
async function loadRecipes() {
  try {
    const res = await fetch(apiBase);
    if (!res.ok) throw new Error('Error loading');
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
    document.getElementById('recipe-list').textContent = 'Could not load recipes.';
  }
}

// Sends a new recipe to the backend
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
    if (!res.ok) throw new Error('Error saving');
    event.target.reset();
    await loadRecipes();
  } catch (err) {
    console.error(err);
    alert('Saving failed.');
  }
}

// Register event handlers
document.addEventListener('DOMContentLoaded', () => {
  loadRecipes();
  document.getElementById('recipe-form').addEventListener('submit', addRecipe);
});
