
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search');
    const searchBtn = document.getElementById('search-btn');
    const resultsContainer = document.getElementById('results');
    const loadingElement = document.getElementById('loading');
    const errorElement = document.getElementById('error');
    const recipeDetails = document.getElementById('recipe-details');
    const modal = document.getElementById('modal');
    const closeBtn = document.querySelector('.close-btn');
  
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
  
        const data = await res.json();
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
        const price = estimatePrice(meal);
        const mealCard = document.createElement('div');
        mealCard.className = 'recipe-card';
  
        mealCard.innerHTML = `
          <img src="${meal.strMealThumb}" alt="${meal.strMeal}" class="recipe-img">
          <div class="recipe-info">
            <h3 class="recipe-title">${meal.strMeal}</h3>
            <p class="recipe-category">${meal.strCategory} | ${meal.strArea}</p>
            <p class="recipe-price">€${price}</p>
            <button class="view-recipe">View Recipe</button>
          </div>
        `;
  
        mealCard.querySelector('.view-recipe').addEventListener('click', () => {
            displayRecipeDetails(meal);
        });
  
        resultsContainer.appendChild(mealCard);
      });
    }
  

  
    function estimatePrice(meal) {
      const minPrice = 15;
      const maxPrice = 22;
  
      const ingredientCount = [...Array(20).keys()]
        .filter(i => meal[`strIngredient${i + 1}`]?.trim()).length;
  
      const maxIngredients = 20;
      const complexityFactor = ingredientCount / maxIngredients;
      const randomVariation = Math.random() * 0.3 + 0.85; // Between 0.85 and 1.15
  
      let estimatedPrice = minPrice + (maxPrice - minPrice) * complexityFactor * randomVariation;
      return Math.min(estimatedPrice, maxPrice).toFixed(2);
    }
  
    function toggleLoading(isLoading) {
      loadingElement.style.display = isLoading ? 'block' : 'none';
    }
  
    function clearMessages() {
      errorElement.style.display = 'none';
      resultsContainer.innerHTML = '';
    }
  });
  

  function displayRecipeDetails(meal) {
    // Clear previous form data if any
    const orderForm = document.createElement('form');
    orderForm.innerHTML = `
        <h2>Order for ${meal.strMeal}</h2>
        <p><strong>Category:</strong> ${meal.strCategory} | 
           <strong>Origin:</strong> ${meal.strArea}</p>
        <img src="${meal.strMealThumb}" alt="${meal.strMeal}" style="max-width: 300px; border-radius: 8px; margin: 15px 0;">

        <h3>Enter your details:</h3>
        
        <label for="userName">Your Name:</label>
        <input type="text" id="userName" name="userName" required><br>

        <label for="userPhone">Your Phone:</label>
        <input type="tel" id="userPhone" name="userPhone" required><br>

        <label for="deliveryOption">Delivery:</label>
        <input type="checkbox" id="deliveryOption" name="deliveryOption">
        <label for="deliveryOption">Check if you want delivery</label><br>

        <div id="deliveryAddress" style="display: none;">
            <label for="userAddress">Delivery Address:</label>
            <textarea id="userAddress" name="userAddress" placeholder="Enter delivery address"></textarea><br>
            <p>Delivery charge: €4</p>
        </div>

        <button type="submit">Submit Order</button>
    `;

    // Handle delivery checkbox change to show/hide delivery address
    const deliveryOption = orderForm.querySelector('#deliveryOption');
    const deliveryAddressSection = orderForm.querySelector('#deliveryAddress');
    
    deliveryOption.addEventListener('change', () => {
        if (deliveryOption.checked) {
            deliveryAddressSection.style.display = 'block';
        } else {
            deliveryAddressSection.style.display = 'none';
        }
    });

    // Handle form submission
    orderForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const userName = orderForm.userName.value.trim();
        const userPhone = orderForm.userPhone.value.trim();
        const isDelivery = deliveryOption.checked;
        const deliveryAddress = isDelivery ? orderForm.userAddress.value.trim() : null;

        // Validate the form input
        if (!userName || !userPhone) {
            alert('Please enter your name and phone number.');
            return;
        }

        // Handle the order submission
        const orderDetails = {
            userName,
            userPhone,
            isDelivery,
            deliveryAddress,
            meal: meal.strMeal,
            price: estimatePrice(meal) + (isDelivery ? 4 : 0), // Add delivery charge if selected
        };

        console.log('Order Details:', orderDetails);
        alert('Your order has been submitted!');
        
        // Close modal (optional, depends on your design)
        modal.style.display = 'none';
    });

    // Show the modal with the form
    modal.innerHTML = '';
    modal.appendChild(orderForm);
    modal.style.display = 'block';
}


