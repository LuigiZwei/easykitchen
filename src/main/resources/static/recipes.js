(function() {
  const apiBase = '/api/recipes';
  let editingId = null;
  let allRecipes = [];
  // Weekly plan: for each day a list of recipe IDs
  let weeklyPlan = {
    Montag: [], Dienstag: [], Mittwoch: [], Donnerstag: [], Freitag: [], Samstag: [], Sonntag: []
  };

  // apiFetch: checks for 204 and Content-Type before res.json()
  async function apiFetch(url, options = {}) {
    try {
      const res = await fetch(url, options);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      if (res.status === 204) return null;
      const contentType = res.headers.get('Content-Type') || '';
      if (contentType.includes('application/json')) {
        return await res.json();
      }
      return null;
    } catch (err) {
      console.error('[API-Fehler]', err);
      throw err;
    }
  }

  // Renders checkboxes for all available tags and fills datalist
  function renderTagFilters() {
    const container = document.getElementById('tag-filters');
    container.innerHTML = '';
    const uniqueTags = new Set();
    allRecipes.forEach(r => {
      (r.tags || []).forEach(tag => uniqueTags.add(tag));
    });
    uniqueTags.forEach(tag => {
      const wrapper = document.createElement('label');
      wrapper.classList.add('tag-filter');
      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.value = tag;
      cb.name = 'tag-filter';
      wrapper.appendChild(cb);
      wrapper.appendChild(document.createTextNode(tag));
      container.appendChild(wrapper);
    });

    // Fill datalist in form (smart tag suggestions)
    const datalist = document.getElementById('tags-list');
    datalist.innerHTML = '';
    Array.from(uniqueTags).forEach(tag => {
      const option = document.createElement('option');
      option.value = tag;
      datalist.appendChild(option);
    });
  }

  function getSelectedTags() {
    return Array.from(document.querySelectorAll('input[name="tag-filter"]:checked'))
      .map(cb => cb.value);
  }

  // Renders the list of all recipes as cards
  function renderRecipes(recipes) {
    const list = document.getElementById('recipe-list');
    // Fade-out trick: hide list, refill, show again
    list.style.opacity = '0';
    setTimeout(() => {
      list.innerHTML = '';

      recipes.forEach(r => {
        const li = document.createElement('li');
        li.classList.add('recipe');
        li.draggable = true;
        li.dataset.id = r.id;

        // Dragstart / Dragend for recipes
        li.addEventListener('dragstart', (e) => {
          e.dataTransfer.setData('text/plain', r.id);
          li.classList.add('dragging');
        });
        li.addEventListener('dragend', () => {
          li.classList.remove('dragging');
        });

        // Thumbnail (if available)
        if (r.image) {
          const img = document.createElement('img');
          img.src = r.image;
          img.alt = r.title;
          img.classList.add('thumbnail');
          li.appendChild(img);
        }

        // Favorite star
        const favToggle = document.createElement('span');
        favToggle.classList.add('favorite-toggle');
        favToggle.innerHTML = r.isFavorite ? '★' : '☆';
        favToggle.dataset.id = r.id;
        li.appendChild(favToggle);

        // Body: title, tags, ingredients, instructions, buttons
        const bodyDiv = document.createElement('div');
        bodyDiv.classList.add('recipe-body');

        // Header (title + buttons)
        const headerDiv = document.createElement('div');
        headerDiv.classList.add('recipe-header');
        const h3 = document.createElement('h3');
        h3.textContent = r.title;
        headerDiv.appendChild(h3);

        const buttonContainer = document.createElement('div');
        buttonContainer.classList.add('recipe-buttons');

        const editBtn = document.createElement('button');
        editBtn.textContent = 'Bearbeiten';
        editBtn.classList.add('edit-btn');
        editBtn.dataset.id = r.id;
        buttonContainer.appendChild(editBtn);

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Löschen';
        deleteBtn.classList.add('delete-btn');
        deleteBtn.dataset.id = r.id;
        buttonContainer.appendChild(deleteBtn);

        const printBtn = document.createElement('button');
        printBtn.textContent = 'Drucken';
        printBtn.classList.add('print-btn');
        printBtn.dataset.id = r.id;
        buttonContainer.appendChild(printBtn);

        headerDiv.appendChild(buttonContainer);
        bodyDiv.appendChild(headerDiv);

        // Creation date
        if (r.createdAt) {
          const dateP = document.createElement('p');
          const date = new Date(r.createdAt);
          dateP.textContent = `Erstellt am ${date.toLocaleDateString('de-DE')}`;
          dateP.style.fontSize = '0.85rem';
          dateP.style.color = '#555';
          bodyDiv.appendChild(dateP);
        }

        // Tags
        if (Array.isArray(r.tags) && r.tags.length) {
          const tagsDiv = document.createElement('div');
          tagsDiv.classList.add('tags-list');
          r.tags.forEach(tag => {
            const span = document.createElement('span');
            span.classList.add('tag');
            span.textContent = tag;
            tagsDiv.appendChild(span);
          });
          bodyDiv.appendChild(tagsDiv);
        }

        // Ingredients list
        if (Array.isArray(r.ingredients) && r.ingredients.length) {
          const ulIngr = document.createElement('ul');
          ulIngr.style.marginTop = '0.5rem';
          ulIngr.style.paddingLeft = '1.25rem';
          r.ingredients.forEach(ing => {
            const liIng = document.createElement('li');
            liIng.textContent = `${ing.name} – ${ing.amount}`;
            ulIngr.appendChild(liIng);
          });
          bodyDiv.appendChild(ulIngr);
        }

        // Instructions text
        const p = document.createElement('p');
        p.textContent = r.instructions;
        bodyDiv.appendChild(p);

        li.appendChild(bodyDiv);
        list.appendChild(li);
      });

      // Show list again after inserting
      list.style.opacity = '1';
    }, 150);
  }

  // Loads recipes and initializes tag filter, list and drag&drop
  async function loadRecipes() {
    const loadingEl = document.getElementById('loading');
    const errorEl = document.getElementById('load-error');
    loadingEl.hidden = false;
    errorEl.hidden = true;

    try {
      allRecipes = await apiFetch(apiBase);
      renderTagFilters();
      applyFiltersAndRender();
      initDragAndDropSlots();
    } catch (err) {
      errorEl.hidden = false;
    } finally {
      loadingEl.hidden = true;
    }
  }

  // Applies search, tag filter, favorite filter & sorting, then calls renderRecipes
  function applyFiltersAndRender() {
    let filtered = [...allRecipes];

    // Search by title or text (combined)
    const searchTerm = document.getElementById('search-input').value.trim().toLowerCase();
    if (searchTerm) {
      filtered = filtered.filter(r => {
        return (
          r.title.toLowerCase().includes(searchTerm) ||
          r.instructions.toLowerCase().includes(searchTerm)
        );
      });
    }

    // Tag filter
    const selectedTags = getSelectedTags();
    if (selectedTags.length) {
      filtered = filtered.filter(r => {
        return Array.isArray(r.tags) && r.tags.some(tag => selectedTags.includes(tag));
      });
    }

    // Favorite filter
    const favCheckbox = document.getElementById('favorites-only');
    if (favCheckbox.checked) {
      filtered = filtered.filter(r => r.isFavorite);
    }

    // Sorting
    const sortVal = document.getElementById('sort-select').value;
    switch (sortVal) {
      case 'title-asc':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'title-desc':
        filtered.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case 'date-asc':
        filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case 'date-desc':
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      default:
        break;
    }

    renderRecipes(filtered);
  }

  // Reset form
  function resetForm() {
    editingId = null;
    document.getElementById('form-title').textContent = 'Neues Rezept hinzufügen';
    document.getElementById('submit-button').textContent = 'Speichern';
    document.getElementById('cancel-edit').hidden = true;
    document.getElementById('form-error').hidden = true;
    document.getElementById('tags-input').value = '';
    document.getElementById('image-input').value = '';
    clearIngredientsFields();
    document.getElementById('recipe-form').reset();
    addIngredientRow();

    // Immediate update of tag datalist after reset
    renderTagFilters();
  }

  function clearIngredientsFields() {
    const fieldset = document.getElementById('ingredients-fieldset');
    Array.from(fieldset.querySelectorAll('.ingredient-row')).forEach(row => row.remove());
  }

  function addIngredientRow(name = '', amount = '') {
    const fieldset = document.getElementById('ingredients-fieldset');
    const row = document.createElement('div');
    row.classList.add('ingredient-row');

    const nameInp = document.createElement('input');
    nameInp.type = 'text';
    nameInp.classList.add('ingredient-name');
    nameInp.placeholder = 'Name';
    nameInp.required = true;
    nameInp.value = name;
    row.appendChild(nameInp);

    const amtInp = document.createElement('input');
    amtInp.type = 'text';
    amtInp.classList.add('ingredient-amount');
    amtInp.placeholder = 'Menge';
    amtInp.required = true;
    amtInp.value = amount;
    row.appendChild(amtInp);

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.classList.add('remove-ingredient');
    removeBtn.title = 'Diese Zutat entfernen';
    removeBtn.textContent = '✖';
    row.appendChild(removeBtn);

    fieldset.insertBefore(row, document.getElementById('add-ingredient'));
  }

  function parseTagsInput(input) {
    return input
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);
  }

  // Reads file as Base64 (for image upload)
  function readFileAsBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = err => reject(err);
      reader.readAsDataURL(file);
    });
  }

  // Form submit: POST or PUT, including Base64 image
  async function handleFormSubmit(event) {
    event.preventDefault();
    const titleInput = document.getElementById('title');
    const instrInput = document.getElementById('instructions');
    const tagsInput = document.getElementById('tags-input');
    const imageInput = document.getElementById('image-input');
    const formError = document.getElementById('form-error');
    formError.hidden = true;

    const title = titleInput.value.trim();
    const instructions = instrInput.value.trim();
    const tags = parseTagsInput(tagsInput.value);

    if (!title || !instructions) {
      formError.textContent = 'Titel und Anleitung dürfen nicht leer sein.';
      formError.hidden = false;
      return;
    }

    // Read ingredients
    const rows = Array.from(document.querySelectorAll('.ingredient-row'));
    const ingredients = [];
    for (const row of rows) {
      const name = row.querySelector('.ingredient-name').value.trim();
      const amount = row.querySelector('.ingredient-amount').value.trim();
      if (!name || !amount) {
        formError.textContent = 'Alle Zutatenfelder müssen ausgefüllt sein.';
        formError.hidden = false;
        return;
      }
      ingredients.push({ name, amount });
    }

    // Convert image to Base64
    let imageData = null;
    if (imageInput.files && imageInput.files[0]) {
      imageData = await readFileAsBase64(imageInput.files[0]);
    }

    const payload = { title, instructions, ingredients, tags, image: imageData };

    try {
      if (editingId) {
        await apiFetch(`${apiBase}/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        await apiFetch(apiBase, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }
      resetForm();
      await loadRecipes();
    } catch (err) {
      formError.textContent = 'Speichern fehlgeschlagen. Bitte versuche es erneut.';
      formError.hidden = false;
    }
  }

  // Opens a new window to print a recipe
  function printRecipe(id) {
    const recipe = allRecipes.find(r => r.id === id);
    if (!recipe) return;
    const w = window.open('', '_blank');
    const html = `
      <html>
        <head>
          <meta charset="UTF-8">
          <title>${recipe.title}</title>
          <style>
            body { font-family: sans-serif; margin: 2rem; }
            h1 { margin-bottom: 0.5rem; }
            .meta { font-size: 0.9rem; color: #555; margin-bottom: 1rem; }
            .tags span { background-color: #eee; border-radius: 0.25rem; padding: 0.2rem 0.5rem; margin-right: 0.3rem; }
            .ingredients ul { padding-left: 1.25rem; }
            img { max-width: 100%; margin-bottom: 1rem; border-radius: 0.5rem; }
          </style>
        </head>
        <body>
          <h1>${recipe.title}</h1>
          <div class="meta">Erstellt am ${new Date(recipe.createdAt).toLocaleDateString('de-DE')}</div>
          ${recipe.tags && recipe.tags.length
            ? `<div class="tags">${recipe.tags.map(t => `<span>${t}</span>`).join('')}</div>`
            : ''}
          ${recipe.image
            ? `<div class="image"><img src="${recipe.image}" alt="${recipe.title}" /></div>`
            : ''}
          ${recipe.ingredients && recipe.ingredients.length
            ? `<div class="ingredients"><h2>Zutaten</h2><ul>${recipe.ingredients
                .map(ing => `<li>${ing.name} – ${ing.amount}</li>`)
                .join('')}</ul></div>`
            : ''}
          <div class="instructions"><h2>Anleitung</h2><p>${recipe.instructions}</p></div>
          <script>
            window.onload = () => { window.print(); window.close(); };
          <\/script>
        </body>
      </html>`;
    w.document.write(html);
    w.document.close();
  }

  // Removes recipe ID from all days
  function removeFromAllDays(recipeId) {
    for (const day of Object.keys(weeklyPlan)) {
      const idx = weeklyPlan[day].indexOf(recipeId);
      if (idx !== -1) {
        weeklyPlan[day].splice(idx, 1);
      }
    }
  }

  // Renders the current weekly plan in the day slots
  function renderWeeklyPlan() {
    for (const [day, arr] of Object.entries(weeklyPlan)) {
      const slotList = document.querySelector(`.day-slot[data-day="${day}"] .plan-list`);
      slotList.innerHTML = '';
      arr.forEach(id => {
        const recipe = allRecipes.find(r => r.id === id);
        if (recipe) {
          const li = document.createElement('li');
          li.textContent = recipe.title;
          li.draggable = true;
          li.dataset.id = recipe.id;
          // Dragstart and dragend for weekly plan items
          li.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', recipe.id);
            li.classList.add('dragging');
          });
          li.addEventListener('dragend', () => {
            li.classList.remove('dragging');
          });
          slotList.appendChild(li);
        }
      });
    }
  }

  // Initializes drag & drop for weekly plan slots and recipe list
  function initDragAndDropSlots() {
    // Drop handler for day slots
    const slots = document.querySelectorAll('.day-slot');
    slots.forEach(slot => {
      slot.addEventListener('dragover', (e) => {
        e.preventDefault();
        slot.classList.add('drag-over');
      });
      slot.addEventListener('dragleave', () => {
        slot.classList.remove('drag-over');
      });
      slot.addEventListener('drop', (e) => {
        e.preventDefault();
        slot.classList.remove('drag-over');
        const recipeId = e.dataTransfer.getData('text/plain');
        const day = slot.dataset.day;
        if (recipeId) {
          removeFromAllDays(recipeId);
          if (!weeklyPlan[day].includes(recipeId)) {
            weeklyPlan[day].push(recipeId);
          }
          renderWeeklyPlan();
        }
      });
    });

    // Drop handler for recipe list (remove from weekly plan)
    const recipeList = document.getElementById('recipe-list');
    recipeList.addEventListener('dragover', (e) => {
      e.preventDefault();
      recipeList.classList.add('drag-over-recipe-list');
    });
    recipeList.addEventListener('dragleave', () => {
      recipeList.classList.remove('drag-over-recipe-list');
    });
    recipeList.addEventListener('drop', (e) => {
      e.preventDefault();
      recipeList.classList.remove('drag-over-recipe-list');
      const recipeId = e.dataTransfer.getData('text/plain');
      if (recipeId) {
        removeFromAllDays(recipeId);
        renderWeeklyPlan();
      }
    });
  }

  // Generates shopping list from all planned ingredients
  function generateShoppingList() {
    const combined = {};
    Object.values(weeklyPlan).forEach(arr => {
      arr.forEach(id => {
        const recipe = allRecipes.find(r => r.id === id);
        if (recipe && recipe.ingredients) {
          recipe.ingredients.forEach(ing => {
            const key = ing.name.toLowerCase();
            if (!combined[key]) {
              combined[key] = ing.amount;
            } else {
              const prev = combined[key];
              const curr = ing.amount;
              const numPrev = parseFloat(prev);
              const numCurr = parseFloat(curr);
              if (!isNaN(numPrev) && !isNaN(numCurr)) {
                const unit = prev.replace(numPrev, '');
                combined[key] = `${numPrev + numCurr}${unit}`;
              } else {
                combined[key] = `${combined[key]}, ${ing.amount}`;
              }
            }
          });
        }
      });
    });
    const shoppingEl = document.getElementById('shopping-items');
    shoppingEl.innerHTML = '';
    Object.entries(combined).forEach(([name, amount]) => {
      const li = document.createElement('li');
      li.textContent = `${name.charAt(0).toUpperCase() + name.slice(1)} – ${amount}`;
      shoppingEl.appendChild(li);
    });
    document.getElementById('shopping-list').hidden = false;
  }

  // Show/hide scroll-to-top button
  function initScrollTopButton() {
    const scrollBtn = document.getElementById('scroll-top');
    window.addEventListener('scroll', () => {
      if (window.scrollY > 300) {
        scrollBtn.style.display = 'flex';
      } else {
        scrollBtn.style.display = 'none';
      }
    });
    scrollBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Event listeners for button clicks and interactions
  document.getElementById('recipe-list').addEventListener('click', async (e) => {
    // Delete
    if (e.target.matches('.delete-btn')) {
      const id = e.target.dataset.id;
      try {
        await apiFetch(`${apiBase}/${id}`, { method: 'DELETE' });
        await loadRecipes();
      } catch {
        alert('Löschen fehlgeschlagen.');
      }
      return;
    }

    // Edit
    if (e.target.matches('.edit-btn')) {
      const id = e.target.dataset.id;
      try {
        const recipe = await apiFetch(`${apiBase}/${id}`);
        editingId = id;
        document.getElementById('form-title').textContent = 'Rezept bearbeiten';
        document.getElementById('submit-button').textContent = 'Aktualisieren';
        document.getElementById('cancel-edit').hidden = false;
        document.getElementById('title').value = recipe.title;
        document.getElementById('instructions').value = recipe.instructions;
        document.getElementById('tags-input').value = (recipe.tags || []).join(', ');

        clearIngredientsFields();
        recipe.ingredients.forEach(ing => addIngredientRow(ing.name, ing.amount));
      } catch {
        alert('Konnte Rezept nicht laden.');
      }
      return;
    }

    // Toggle favorite
    if (e.target.matches('.favorite-toggle')) {
      const id = e.target.dataset.id;
      const recipe = allRecipes.find(r => r.id === id);
      if (!recipe) return;
      const newFav = !recipe.isFavorite;
      try {
        await apiFetch(`${apiBase}/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...recipe, isFavorite: newFav })
        });
        await loadRecipes();
      } catch {
        alert('Favoriten-Status konnte nicht geändert werden.');
      }
      return;
    }

    // Print
    if (e.target.matches('.print-btn')) {
      const id = e.target.dataset.id;
      printRecipe(id);
      return;
    }
  });

  // Add/remove ingredient rows
  document.getElementById('add-ingredient').addEventListener('click', () => {
    addIngredientRow();
  });
  document.getElementById('ingredients-fieldset').addEventListener('click', (e) => {
    if (e.target.matches('.remove-ingredient')) {
      const row = e.target.closest('.ingredient-row');
      row.remove();
    }
  });

  // Search, sorting, tag filter, favorite filter
  document.getElementById('search-input').addEventListener('input', applyFiltersAndRender);
  document.getElementById('sort-select').addEventListener('change', applyFiltersAndRender);
  document.getElementById('tag-filters').addEventListener('change', applyFiltersAndRender);
  document.getElementById('favorites-only').addEventListener('change', applyFiltersAndRender);

  // Form events
  document.getElementById('cancel-edit').addEventListener('click', resetForm);
  document.getElementById('recipe-form').addEventListener('submit', handleFormSubmit);

  // Shopping list
  document.getElementById('generate-list').addEventListener('click', generateShoppingList);

  document.addEventListener('DOMContentLoaded', () => {
    resetForm();
    loadRecipes();
    initScrollTopButton();
  });
})();
