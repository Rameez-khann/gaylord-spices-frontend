document.addEventListener('DOMContentLoaded', () => {
  // Grab necessary DOM elements
  const searchInput = document.getElementById('search');
  const searchBtn = document.getElementById('search-btn');
  const resultsContainer = document.getElementById('results');
  const loadingElement = document.getElementById('loading');
  const errorElement = document.getElementById('error');
  const recipeDetails = document.getElementById('recipe-details');
  const modal = document.getElementById('modal');
  const closeBtn = document.querySelector('.close-btn');

  // When a search is initiated
  searchBtn.addEventListener('click', performSearch);
  searchInput.addEventListener('keypress', e => {
    if (e.key === 'Enter') performSearch();
  });

  // Close modal on clicking close button or overlay outside modal-content
  closeBtn.addEventListener('click', () => modal.style.display = 'none');
  window.addEventListener('click', e => {
    if (e.target === modal) modal.style.display = 'none';
  });

  // Perform a search via your API (adjust the URL as needed)
  async function performSearch() {
    const keyword = searchInput.value.trim();
    if (!keyword) return;

    toggleLoading(true);
    clearMessages();

    try {
      const res = await fetch('http://localhost:3030/menu/search', {
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

  // Display search results as recipe cards
  function displayResults(meals) {
    resultsContainer.innerHTML = '';

    meals.forEach(meal => {
      const price = meal.price;
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
      // When "View Recipe" is clicked, show the order form in the modal
      mealCard.querySelector('.view-recipe').addEventListener('click', () => {
        displayRecipeDetails(meal);
      });
      resultsContainer.appendChild(mealCard);
    });
  }



  // Toggle loading display
  function toggleLoading(isLoading) {
    loadingElement.style.display = isLoading ? 'block' : 'none';
  }
  
  // Clear messages and previous results
  function clearMessages() {
    errorElement.style.display = 'none';
    resultsContainer.innerHTML = '';
  }

  // ============================
  // Display Modal with Order Form
  // ============================
  function displayRecipeDetails(meal) {
    // Create the order form element
    const orderForm = document.createElement('form');
    orderForm.innerHTML = `
      <h2>Order for ${meal.strMeal}</h2>
      <p><strong>Category:</strong> ${meal.strCategory} | <strong>Origin:</strong> ${meal.strArea}</p>
      <img src="${meal.strMealThumb}" alt="${meal.strMeal}" style="max-width: 300px; border-radius: 8px; margin: 15px 0;">
      <h3>Enter your details:</h3>
      <label for="userName">Your Name:</label>
      <input type="text" id="userName" name="userName" required /><br>
      <label for="userPhone">Your Phone:</label>
      <input type="tel" id="userPhone" name="userPhone" required /><br>
      <label for="deliveryOption">Delivery:</label>
      <input type="checkbox" id="deliveryOption" name="deliveryOption" />
      <label for="deliveryOption">Check if you want delivery</label><br>
      <div id="deliveryAddress" style="display: none;">
        <label for="userAddress">Delivery Address:</label>
        <textarea id="userAddress" name="userAddress" placeholder="Enter delivery address"></textarea><br>
        <p>Delivery charge: €4</p>
      </div>
      <button type="submit">Submit Order</button>
    `;

    // Toggle delivery address section based on checkbox
    const deliveryOption = orderForm.querySelector('#deliveryOption');
    const deliveryAddressSection = orderForm.querySelector('#deliveryAddress');
    deliveryOption.addEventListener('change', () => {
      deliveryAddressSection.style.display = deliveryOption.checked ? 'block' : 'none';
    });

    // Form submission handler
    orderForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const userName = orderForm.userName.value.trim();
      const userPhone = orderForm.userPhone.value.trim();
      const isDelivery = deliveryOption.checked;
      const deliveryAddress = isDelivery ? orderForm.userAddress.value.trim() : null;
      if (!userName || !userPhone || (isDelivery && !deliveryAddress)) {
        alert('Please fill in all required fields.');
        return;
      }
let price = Number(meal.price);
if(isDelivery) price+=4;

      const orderDetails = {
        userName,
        userPhone,
        isDelivery,
        deliveryAddress,
        meal: meal.strMeal,
        price: price,
      };

// Submitting the order

    submitOrder(orderDetails);
      modal.style.display = 'none';
    });

    // Update modal content with the order form
    const recipeDetailsSection = document.getElementById('recipe-details');
    recipeDetailsSection.innerHTML = ''; // Clear previous contents
    recipeDetailsSection.appendChild(orderForm);
    // Show the modal using Flex display to trigger centering per CSS
    modal.style.display = 'flex';
  }

async function submitOrder(order){
  try {
    const res = await fetch('http://localhost:3030/menu/order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order)
    });
    const data = await res.json();
 alert("Order Submitted Successfully")
  } catch (err) {
    toggleLoading(false);
    errorElement.style.display = 'block';
    console.error('Error fetching recipes:', err);
  }
}


});
