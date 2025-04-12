document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search');
    const searchBtn = document.getElementById('search-btn');
    const resultsContainer = document.getElementById('results');
    const loadingElement = document.getElementById('loading');
    const errorElement = document.getElementById('error');
    const recipeDetails = document.getElementById('recipe-details');
    const modal = document.getElementById('recipe-modal');
    const closeBtn = document.querySelector('.close-btn');

    // Event Listeners
    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', e => {
        if (e.key === 'Enter') performSearch();
    });
    closeBtn?.addEventListener('click', () => modal.style.display = 'none');
    window.addEventListener('click', e => {
        if (e.target === modal) modal.style.display = 'none';
    });

    async function performSearch() {
        const keyword = searchInput.value.trim();
        if (!keyword) return;

        toggleLoading(true);
        clearMessages();

        try {
            const res = await fetch('http://localhost:3030/recipes/search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ searchTerm: keyword })
            });

            const response = await res.json();
            const data = response?.meals||[];
            // console.log({data});
            
            toggleLoading(false);

            if (!data || data.length === 0) {
                errorElement.style.display = 'block';
                return;
            }

            displayResults(data);
        } catch (err) {
            toggleLoading(false);
            errorElement.style.display = 'block';
            console.error('Error fetching recipes:', err);
        }
    }

    function displayResults(meals) {
        resultsContainer.innerHTML = '';

        meals.forEach(meal => {
            const mealCard = document.createElement('div');
            mealCard.className = 'recipe-card';

            mealCard.innerHTML = `
                <img src="${meal.strMealThumb}" alt="${meal.strMeal}" class="recipe-img">
                <div class="recipe-info">
                    <h3 class="recipe-title">${meal.strMeal}</h3>
                    <p class="recipe-category">${meal.strCategory} | ${meal.strArea}</p>
                    <button class="view-recipe" data-id="${meal.idMeal}">View Recipe</button>
                </div>
            `;

            resultsContainer.appendChild(mealCard);
        });

        document.querySelectorAll('.view-recipe').forEach(button => {
            button.addEventListener('click', () => {
                const mealId = button.getAttribute('data-id');
                fetchRecipeDetails(mealId);
            });
        });
    }

    async function fetchRecipeDetails(mealId) {
        toggleLoading(true);

        try {
            const res = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`);
            const data = await res.json();
            toggleLoading(false);

            if (data.meals && data.meals[0]) {
                displayRecipeDetails(data.meals[0]);
            }
        } catch (err) {
            toggleLoading(false);
            console.error('Error fetching recipe details:', err);
        }
    }

    function displayRecipeDetails(meal) {
        const ingredients = [];

        for (let i = 1; i <= 20; i++) {
            const ing = meal[`strIngredient${i}`];
            const measure = meal[`strMeasure${i}`];
            if (ing && ing.trim()) {
                ingredients.push(`${measure} ${ing}`);
            }
        }

        const price = estimatePrice(meal);

        recipeDetails.innerHTML = `
            <h2>${meal.strMeal}</h2>
            <p><strong>Category:</strong> ${meal.strCategory} | 
               <strong>Origin:</strong> ${meal.strArea} <br>
               <strong>Estimated Price:</strong> $${price}</p>
            <img src="${meal.strMealThumb}" alt="${meal.strMeal}" style="max-width: 300px; border-radius: 8px; margin: 15px 0;">
            <h3>Ingredients:</h3>
            <div class="ingredients-list">
                ${ingredients.map(ing => `<p>• ${ing}</p>`).join('')}
            </div>
            <h3>Instructions:</h3>
            <p>${meal.strInstructions.replace(/\n/g, '<br>')}</p>
            ${meal.strYoutube ? `<h3>Video Tutorial:</h3>
            <p><a href="${meal.strYoutube}" target="_blank">Watch on YouTube</a></p>` : ''}
        `;

        modal.style.display = 'block';
    }

    function estimatePrice(meal) {
        const basePrices = {
            "Beef": 12,
            "Chicken": 10,
            "Seafood": 15,
            "Vegetarian": 8,
            "Pasta": 9,
            "Dessert": 7,
            "Miscellaneous": 10
        };

        const base = basePrices[meal.strCategory] || 10;
        let ingredientCount = 0;

        for (let i = 1; i <= 20; i++) {
            if (meal[`strIngredient${i}`]?.trim()) {
                ingredientCount++;
            }
        }

        return (base + ingredientCount * 0.75).toFixed(2);
    }

    function toggleLoading(isLoading) {
        loadingElement.style.display = isLoading ? 'block' : 'none';
    }

    function clearMessages() {
        errorElement.style.display = 'none';
        resultsContainer.innerHTML = '';
    }
});
