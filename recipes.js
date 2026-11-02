document.addEventListener('DOMContentLoaded', () => {
    const recipes = [
        {
            id: 1,
            name: "Golden Fried Rice",
            emoji: "🍚",
            leftovers: ["Rice", "Vegetables", "Chicken"],
            difficulty: "Easy",
            steps: "Heat oil in a pan. Sauté chopped leftover chicken and vegetables until tender. Add cooked rice and stir well. Season with soy sauce and serve hot."
        },
        {
            id: 2,
            name: "Stale Bread Pudding",
            emoji: "🍞",
            leftovers: ["Bread", "Eggs"],
            difficulty: "Medium",
            steps: "Tear bread into pieces in a baking dish. Whisk eggs, milk, and sugar together, then pour over the bread. Bake at 180°C for 30 minutes until golden and set."
        },
        {
            id: 3,
            name: "Vegetable Omelette",
            emoji: "🍳",
            leftovers: ["Vegetables", "Eggs"],
            difficulty: "Easy",
            steps: "Beat eggs in a bowl with salt and pepper. Pour into a heated greased pan. Add chopped leftover vegetables on top, fold over, and cook until fluffy."
        },
        {
            id: 4,
            name: "Leftover Chicken Fried Noodles",
            emoji: "🍜",
            leftovers: ["Chicken", "Vegetables"],
            difficulty: "Easy",
            steps: "Boil noodles until tender, then drain. Sauté leftover chicken and mixed vegetables in a skillet. Toss in noodles with soy sauce and stir-fry for 3 minutes."
        },
        {
            id: 5,
            name: "Fruit Smoothie Bowl",
            emoji: "🍌",
            leftovers: ["Fruit"],
            difficulty: "Easy",
            steps: "Blend overripe fruit pieces with a splash of milk until smooth and thick. Pour into a bowl and top with nuts or seeds."
        },
        {
            id: 6,
            name: "Cheesy Bread Casserole",
            emoji: "🧀",
            leftovers: ["Bread"],
            difficulty: "Easy",
            steps: "Layer cubed stale bread and shredded cheese in a baking dish. Bake at 190°C for 15 minutes until the cheese is melted and bubbling."
        },
        {
            id: 7,
            name: "Leftover Rice Porridge (Congee)",
            emoji: "🍲",
            leftovers: ["Rice", "Chicken"],
            difficulty: "Easy",
            steps: "Place leftover rice in a pot with broth or water. Simmer on low heat for 20 minutes until creamy. Stir in shredded leftover chicken and scallions."
        },
        {
            id: 8,
            name: "Roasted Veggie Frittata",
            emoji: "🥧",
            leftovers: ["Vegetables", "Eggs"],
            difficulty: "Medium",
            steps: "Whisk eggs and pour over warmed leftover roasted vegetables in an oven-safe skillet. Bake at 180°C for 15 minutes until set in the center."
        },
        {
            id: 9,
            name: "Leftover Rice Patties",
            emoji: "🍘",
            leftovers: ["Rice", "Eggs"],
            difficulty: "Medium",
            steps: "Mix cold leftover rice with beaten eggs, flour, and seasonings. Form into small patties and fry in a pan with oil for 3-4 minutes per side until crispy."
        },
        {
            id: 10,
            name: "Bread Croutons",
            emoji: "🥖",
            leftovers: ["Bread"],
            difficulty: "Easy",
            steps: "Dice stale bread into small cubes. Toss with olive oil, garlic powder, and salt. Bake at 180°C for 10 minutes until crunchy."
        },
        {
            id: 11,
            name: "Veggie Fried Rice",
            emoji: "🥕",
            leftovers: ["Vegetables", "Rice"],
            difficulty: "Easy",
            steps: "Sauté chopped leftover vegetables in a wok with garlic and oil. Add cold leftover rice, mix thoroughly, and season with soy sauce."
        },
        {
            id: 12,
            name: "Banana Bread Mug Cake",
            emoji: "🧁",
            leftovers: ["Fruit", "Eggs"],
            difficulty: "Easy",
            steps: "Mash overripe bananas in a mug, mix with an egg, a tablespoon of flour, and a pinch of sugar. Microwave for 90 seconds until cooked through."
        }
    ];

    const searchInput = document.getElementById('recipe-search');
    const chipButtons = document.querySelectorAll('.chip');
    const favoritesToggleBtn = document.getElementById('favorites-toggle-btn');
    const matchStatus = document.getElementById('match-status');
    const recipesGrid = document.getElementById('recipes-grid');
    const noMatchesState = document.getElementById('no-matches-state');
    const clearFiltersBtn = document.getElementById('btn-clear-filters');

    const modal = document.getElementById('recipe-modal');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const modalEmoji = document.getElementById('modal-emoji');
    const modalTitle = document.getElementById('modal-title');
    const modalLeftovers = document.getElementById('modal-leftovers');
    const modalDifficulty = document.getElementById('modal-difficulty');
    const modalSteps = document.getElementById('modal-steps');

    let currentIngredient = 'All';
    let favoritesOnly = false;
    let searchQuery = '';

    let favorites = JSON.parse(localStorage.getItem('leftover_recipe_favorites')) || [];

    function renderRecipes() {
        recipesGrid.innerHTML = '';

        const filtered = recipes.filter(r => {
            if (favoritesOnly && !favorites.includes(r.id)) {
                return false;
            }
            if (currentIngredient !== 'All') {
                const matchesIngredient = r.leftovers.some(item => item.toLowerCase() === currentIngredient.toLowerCase());
                if (!matchesIngredient) return false;
            }
            if (searchQuery.trim() !== '') {
                const q = searchQuery.toLowerCase();
                const matchesName = r.name.toLowerCase().includes(q);
                const matchesLeftovers = r.leftovers.some(item => item.toLowerCase().includes(q));
                if (!matchesName && !matchesLeftovers) return false;
            }
            return true;
        });

        matchStatus.textContent = `Showing ${filtered.length} recipe${filtered.length === 1 ? '' : 's'}`;

        if (filtered.length === 0) {
            noMatchesState.style.display = 'block';
            recipesGrid.style.display = 'none';
            return;
        }

        noMatchesState.style.display = 'none';
        recipesGrid.style.display = 'grid';

        filtered.forEach(r => {
            const isFav = favorites.includes(r.id);
            const card = document.createElement('div');
            card.className = 'recipe-card';
            card.tabIndex = 0;
            card.setAttribute('role', 'button');
            card.setAttribute('aria-label', `View recipe for ${r.name}`);

            card.innerHTML = `
                <div class="recipe-card-top">
                    <span class="recipe-emoji">${r.emoji}</span>
                    <button class="favorite-btn ${isFav ? 'active' : ''}" data-id="${r.id}" aria-label="Save to favorites">
                        <i data-lucide="heart" style="width: 18px; height: 18px;"></i>
                    </button>
                </div>
                <h3>${r.name}</h3>
                <div class="recipe-meta">
                    <span class="recipe-leftovers">Leftovers: ${r.leftovers.join(', ')}</span>
                    <span class="difficulty-badge ${r.difficulty.toLowerCase()}">${r.difficulty}</span>
                </div>
            `;

            card.addEventListener('click', (e) => {
                if (e.target.closest('.favorite-btn')) return;
                openModal(r);
            });

            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    if (e.target.closest('.favorite-btn')) return;
                    e.preventDefault();
                    openModal(r);
                }
            });

            recipesGrid.appendChild(card);
        });

        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }

        document.querySelectorAll('.favorite-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = Number(btn.getAttribute('data-id'));
                if (favorites.includes(id)) {
                    favorites = favorites.filter(favId => favId !== id);
                } else {
                    favorites.push(id);
                }
                localStorage.setItem('leftover_recipe_favorites', JSON.stringify(favorites));
                renderRecipes();
            });
        });
    }

    function openModal(r) {
        modalEmoji.textContent = r.emoji;
        modalTitle.textContent = r.name;
        modalLeftovers.textContent = `Leftovers: ${r.leftovers.join(', ')}`;
        modalDifficulty.textContent = r.difficulty;
        modalDifficulty.className = `difficulty-badge ${r.difficulty.toLowerCase()}`;
        modalSteps.textContent = r.steps;

        modal.classList.add('open');
        modalCloseBtn.focus();
    }

    function closeModal() {
        modal.classList.remove('open');
    }

    modalCloseBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('open')) {
            closeModal();
        }
    });

    searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        renderRecipes();
    });

    chipButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            chipButtons.forEach(b => b.classList.remove('active'));
            e.currentTarget.classList.add('active');
            currentIngredient = e.currentTarget.getAttribute('data-ingredient');
            renderRecipes();
        });
    });

    favoritesToggleBtn.addEventListener('click', () => {
        favoritesOnly = !favoritesOnly;
        favoritesToggleBtn.classList.toggle('active', favoritesOnly);
        renderRecipes();
    });

    clearFiltersBtn.addEventListener('click', () => {
        searchQuery = '';
        searchInput.value = '';
        currentIngredient = 'All';
        favoritesOnly = false;
        chipButtons.forEach(b => b.classList.toggle('active', b.getAttribute('data-ingredient') === 'All'));
        favoritesToggleBtn.classList.remove('active');
        renderRecipes();
    });

    renderRecipes();
});
