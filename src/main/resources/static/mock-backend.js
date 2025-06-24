(() => {
  // In-memory database with id, title, instructions, ingredients, tags, image, createdAt, isFavorite
  let recipes = [
    {
      id: '1',
      title: 'Spaghetti Bolognese',
      instructions: 'Tomaten, Hackfleisch, Pasta kochen...',
      ingredients: [
        { name: 'Spaghetti', amount: '200g' },
        { name: 'Hackfleisch', amount: '300g' },
        { name: 'Tomatensauce', amount: '200ml' }
      ],
      tags: ['Schnell', 'Familienküche'],
      image: null,
      createdAt: new Date('2025-06-01T10:00:00').toISOString(),
      isFavorite: false
    },
    {
      id: '2',
      title: 'Veganes Curry',
      instructions: 'Gemüse schneiden, Curry-Paste anbraten, Kokosmilch dazu...',
      ingredients: [
        { name: 'Karotten', amount: '2 Stück' },
        { name: 'Kichererbsen', amount: '1 Dose' },
        { name: 'Curry-Paste', amount: '2 EL' }
      ],
      tags: ['Vegetarisch', 'Vegan'],
      image: null,
      createdAt: new Date('2025-05-28T09:30:00').toISOString(),
      isFavorite: true
    }
  ];

  // Generates a random id for new recipes
  function generateId() {
    return Math.random().toString(36).substr(2, 9);
  }

  // Save the original fetch function
  const _fetch = window.fetch;
  // Override window.fetch to intercept API calls for recipes
  window.fetch = async (input, init = {}) => {
    const url = typeof input === 'string' ? input : input.url;
    const parsed = new URL(url, location.href);
    const path = parsed.pathname;              // e.g. "/api/recipes" or "/api/recipes/1"
    const method = (init.method || 'GET').toUpperCase();
    const body = init.body ? JSON.parse(init.body) : null;

    // Only handle /api/recipes endpoints, otherwise use the original fetch
    if (!path.startsWith('/api/recipes')) {
      return _fetch(input, init);
    }

    // Simulate network latency
    await new Promise(res => setTimeout(res, 200));

    // GET /api/recipes - return all recipes
    if (path === '/api/recipes' && method === 'GET') {
      return new Response(JSON.stringify(recipes), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // POST /api/recipes - add a new recipe
    if (path === '/api/recipes' && method === 'POST') {
      const newRecipe = {
        id: generateId(),
        title: body.title,
        instructions: body.instructions,
        ingredients: body.ingredients || [],
        tags: body.tags || [],
        image: body.image || null,
        createdAt: new Date().toISOString(),
        isFavorite: false
      };
      recipes.push(newRecipe);
      return new Response(JSON.stringify(newRecipe), {
        status: 201,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Handle /api/recipes/{id} for GET, PUT, DELETE
    const idMatch = path.match(/^\/api\/recipes\/([^\/]+)$/);
    if (idMatch) {
      const id = idMatch[1];
      const idx = recipes.findIndex(r => r.id === id);

      // GET single recipe by id
      if (method === 'GET') {
        if (idx === -1) return new Response(null, { status: 404 });
        return new Response(JSON.stringify(recipes[idx]), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // PUT (update) recipe by id
      if (method === 'PUT') {
        if (idx === -1) return new Response(null, { status: 404 });
        recipes[idx] = {
          ...recipes[idx],
          title: body.title,
          instructions: body.instructions,
          ingredients: body.ingredients || recipes[idx].ingredients,
          tags: body.tags || recipes[idx].tags,
          image: body.image !== undefined ? body.image : recipes[idx].image,
          isFavorite: body.isFavorite ?? recipes[idx].isFavorite
        };
        return new Response(JSON.stringify(recipes[idx]), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // DELETE recipe by id
      if (method === 'DELETE') {
        if (idx === -1) return new Response(null, { status: 404 });
        recipes.splice(idx, 1);
        return new Response(null, { status: 204 });
      }
    }

    // If no route matches, return 404
    return new Response(null, { status: 404 });
  };
})();
