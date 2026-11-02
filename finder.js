document.addEventListener('DOMContentLoaded', () => {
    const ingredientInput = document.getElementById('finder-ingredient-input');
    const findRecipesBtn = document.getElementById('find-recipes-btn');
    const finderError = document.getElementById('finder-error');
    const finderChips = document.querySelectorAll('.finder-chip');
    const resultsContainer = document.getElementById('finder-results-container');
    const sourceCreditEl = document.getElementById('finder-source-credit');

    const API_BASE = 'https://www.themealdb.com/api/json/v1/1/filter.php?i=';

    async function fetchRecipes(ingredient) {
        const query = ingredient.trim().toLowerCase();
        if (!query) {
            finderError.textContent = 'Please enter an ingredient.';
            ingredientInput.focus();
            return;
        }

        finderError.textContent = '';
        ingredientInput.value = query;

        // Update chip active states
        finderChips.forEach(chip => {
            if (chip.dataset.ingredient.toLowerCase() === query) {
                chip.classList.add('active');
            } else {
                chip.classList.remove('active');
            }
        });

        // Show loading skeletons & disable button (ensure credit remains visible)
        showLoadingSkeletons();
        findRecipesBtn.disabled = true;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        try {
            const response = await fetch(`${API_BASE}${encodeURIComponent(query)}`, { signal: controller.signal });
            clearTimeout(timeoutId);

            if (!response.ok) throw new Error('Network response was not ok');

            const data = await response.json();
            renderRecipes(data.meals, query);
        } catch (err) {
            console.warn('Recipe Finder fetch failed or timed out', err);
            showErrorState(query);
        } finally {
            findRecipesBtn.disabled = false;
        }
    }

    function showLoadingSkeletons() {
        sourceCreditEl.classList.remove('hidden');
        let html = '';
        for (let i = 0; i < 6; i++) {
            html += `
                <div class="skeleton-card">
                    <div class="skeleton-img"></div>
                    <div class="skeleton-content">
                        <div class="skeleton-line" style="margin-bottom: 8px;"></div>
                        <div class="skeleton-line short"></div>
                    </div>
                </div>
            `;
        }
        resultsContainer.innerHTML = html;
    }

    function renderRecipes(meals, query) {
        sourceCreditEl.classList.remove('hidden');

        if (!meals || meals.length === 0) {
            resultsContainer.innerHTML = `
                <div class="finder-message-box">
                    <p>No recipes found for "${query}". Try rice or egg.</p>
                </div>
            `;
            return;
        }

        // Limit to up to 6 recipes
        const limitedMeals = meals.slice(0, 6);
        let html = '';

        limitedMeals.forEach(meal => {
            const mealName = meal.strMeal;
            const mealThumb = meal.strMealThumb;
            const mealId = meal.idMeal;
            const recipeUrl = `https://www.themealdb.com/meal/${mealId}`;

            html += `
                <div class="recipe-result-card">
                    <div class="recipe-img-box">
                        <img src="${mealThumb}" alt="${mealName}" loading="lazy" onerror="this.onerror=null; this.parentElement.innerHTML='<span class=\'recipe-fallback-icon\'>🍽️</span>';">
                    </div>
                    <div class="recipe-card-content">
                        <h4>${mealName}</h4>
                        <a href="${recipeUrl}" target="_blank" rel="noopener noreferrer" class="recipe-link">See recipe &rarr;</a>
                    </div>
                </div>
            `;
        });

        resultsContainer.innerHTML = html;
    }

    function showErrorState(query) {
        sourceCreditEl.classList.remove('hidden');
        resultsContainer.innerHTML = `
            <div class="finder-message-box">
                <p>Unable to connect or load recipes. Please check your connection.</p>
                <button id="finder-retry-btn" class="btn-action btn-secondary" style="margin-top: 1rem;">Try again</button>
            </div>
        `;

        const retryBtn = document.getElementById('finder-retry-btn');
        if (retryBtn) {
            retryBtn.addEventListener('click', () => {
                fetchRecipes(query);
            });
        }
    }

    // Event Listeners
    findRecipesBtn.addEventListener('click', () => {
        fetchRecipes(ingredientInput.value);
    });

    ingredientInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            fetchRecipes(ingredientInput.value);
        }
    });

    finderChips.forEach(chip => {
        chip.addEventListener('click', () => {
            const ing = chip.dataset.ingredient;
            fetchRecipes(ing);
        });
    });

    // Initial load with default "rice"
    fetchRecipes('rice');
});
