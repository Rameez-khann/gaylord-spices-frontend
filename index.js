

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
  const authButtonsContainer = document.getElementById('auth-buttons');
  const logoutContainer = document.getElementById('logout');
  const userLoggedIn = userIsLoggedIn();

  // Get Menu Items
getMenu();
  // Update login/logout and orders buttons
  if (userLoggedIn) {
    authButtonsContainer.innerHTML = `
      <a href="/orders.html" class="login-btn">Orders</a>
    `;

    logoutContainer.innerHTML = `
    <a  id="logout-btn" class="logout-btn">log out</a>
  `;

    document.getElementById('logout-btn').addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.removeItem('token');
      location.reload();
    });
  }

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



async function getMenu(){
  try {
    const res = await fetch('http://localhost:3030/menu/', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      // body: JSON.stringify({ searchTerm: keyword })
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

// Listen for clicks on Make Order buttons and change color to crimson
document.addEventListener('click', function (e) {
  if (e.target && e.target.classList.contains('view-recipe')) {
    e.target.style.backgroundColor = '#dc143c';  // Crimson
    e.target.style.color = 'white';
    e.target.textContent = 'Added to Cart';
  }
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
          <button class="view-recipe">Make Order</button>
        </div>
      `;
      // mealCard.querySelector('.view-recipe').addEventListener('click', () => {
      //   displayRecipeDetails(meal);
      // });

      mealCard.querySelector('.view-recipe').addEventListener('click', () => {
        addToCart(meal);
      });
      
      resultsContainer.appendChild(mealCard);
    });
  }

  function addToCart(meal) {
    meal.id = new Date().getTime()
    let cart = JSON.parse(localStorage.getItem('orderCart')) || [];
    cart.push(meal);
    localStorage.setItem('orderCart', JSON.stringify(cart));
    // alert(`${meal.strMeal} added to cart.`);
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

  // Display Modal with Order Form
  function displayRecipeDetails(meal) {
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

    const deliveryOption = orderForm.querySelector('#deliveryOption');
    const deliveryAddressSection = orderForm.querySelector('#deliveryAddress');
    deliveryOption.addEventListener('change', () => {
      deliveryAddressSection.style.display = deliveryOption.checked ? 'block' : 'none';
    });

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
      if (isDelivery) price += 4;

      const orderDetails = {
        userName,
        userPhone,
        isDelivery,
        deliveryAddress,
        meal: meal.strMeal,
        price: price,
      };

      submitOrder(orderDetails);
      modal.style.display = 'none';
    });

    const recipeDetailsSection = document.getElementById('recipe-details');
    recipeDetailsSection.innerHTML = '';
    recipeDetailsSection.appendChild(orderForm);
    modal.style.display = 'flex';
  }

  async function submitOrder(order) {
    console.log({order});
    
    // try {
    //   const res = await fetch('http://localhost:3030/menu/order', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(order)
    //   });
    //   const data = await res.json();
    //   alert("Order Submitted Successfully");
    // } catch (err) {
    //   toggleLoading(false);
    //   errorElement.style.display = 'block';
    //   console.error('Error submitting order:', err);
    // }
  }

  function userIsLoggedIn() {
    const token = localStorage.getItem('token');
    return !!token;
  }

  document.getElementById('cart-btn').addEventListener('click', displayCart);

// function displayCart() {
//   const cart = JSON.parse(localStorage.getItem('orderCart')) || [];
//   recipeDetails.innerHTML = '';

//   if (cart.length === 0) {
//     recipeDetails.innerHTML = '<p>Your cart is empty.</p>';
//     modal.style.display = 'flex';
//     return;
//   }

//   const list = document.createElement('div');
//   list.className = 'cart-list';

//   cart.forEach((meal, index) => {
//     const item = document.createElement('div');
//     item.className = 'cart-item';
//     item.style.display = 'flex';
//     item.style.alignItems = 'center';
//     item.style.gap = '15px';
//     item.style.marginBottom = '10px';

//     item.innerHTML = `
//       <img src="${meal.strMealThumb}" alt="${meal.strMeal}" style="width: 80px; height: 80px; border-radius: 8px;">
//       <div style="flex-grow: 1">
//         <h4>${meal.strMeal}</h4>
//         <p>${meal.strCategory} | ${meal.strArea}</p>
//         <p>€${meal.price}</p>
//       </div>
//     `;

//     // Create and add remove button
//     const removeBtn = document.createElement('button');
//     removeBtn.textContent = 'Remove';
//     removeBtn.style.padding = '8px';
//     removeBtn.style.backgroundColor = '#ff5555';
//     removeBtn.style.color = 'white';
//     removeBtn.style.border = 'none';
//     removeBtn.style.borderRadius = '6px';
//     removeBtn.style.cursor = 'pointer';

//     removeBtn.addEventListener('click', () => {
//       removeFromCart(index);
//       displayCart(); // Refresh modal
//     });

//     item.appendChild(removeBtn);
//     list.appendChild(item);
//   });

//   const orderBtn = document.createElement('button');
//   orderBtn.textContent = 'Submit All Orders';
//   orderBtn.style.marginTop = '15px';
//   orderBtn.addEventListener('click', () => {
//     cart.forEach(submitOrder);
//     localStorage.removeItem('orderCart');
//     modal.style.display = 'none';
//   });

//   recipeDetails.appendChild(list);
//   recipeDetails.appendChild(orderBtn);
//   modal.style.display = 'flex';
// }

function displayCart() {
  const cart = JSON.parse(localStorage.getItem('orderCart')) || [];
  recipeDetails.innerHTML = '';

  if (cart.length === 0) {
    recipeDetails.innerHTML = '<p>Your cart is empty.</p>';
    modal.style.display = 'flex';
    return;
  }

  const list = document.createElement('div');
  list.className = 'cart-list';

  cart.forEach((meal, index) => {
    const item = document.createElement('div');
    item.className = 'cart-item';
    item.style.display = 'flex';
    item.style.alignItems = 'center';
    item.style.gap = '15px';
    item.style.marginBottom = '10px';

    item.innerHTML = `
      <img src="${meal.strMealThumb}" alt="${meal.strMeal}" style="width: 80px; height: 80px; border-radius: 8px;">
      <div style="flex-grow: 1">
        <h4>${meal.strMeal}</h4>
        <p>${meal.strCategory} | ${meal.strArea}</p>
        <p>€${meal.price}</p>
      </div>
    `;

    const removeBtn = document.createElement('button');
    removeBtn.textContent = 'Remove';
    removeBtn.style.padding = '8px';
    removeBtn.style.backgroundColor = '#ff5555';
    removeBtn.style.color = 'white';
    removeBtn.style.border = 'none';
    removeBtn.style.borderRadius = '6px';
    removeBtn.style.cursor = 'pointer';

    removeBtn.addEventListener('click', () => {
      removeFromCart(index);
      displayCart();
    });

    item.appendChild(removeBtn);
    list.appendChild(item);
  });

  // Create form for user details
  const form = document.createElement('form');
  form.innerHTML = `
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
    
    <button type="submit">Submit All Orders</button>
  `;

  // Toggle delivery section
  const deliveryCheckbox = form.querySelector('#deliveryOption');
  const deliveryAddressDiv = form.querySelector('#deliveryAddress');
  deliveryCheckbox.addEventListener('change', () => {
    deliveryAddressDiv.style.display = deliveryCheckbox.checked ? 'block' : 'none';
  });

  // Submit all orders
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const userName = form.userName.value.trim();
    const userPhone = form.userPhone.value.trim();
    const isDelivery = deliveryCheckbox.checked;
    const deliveryAddress = isDelivery ? form.userAddress.value.trim() : null;

    if (!userName || !userPhone || (isDelivery && !deliveryAddress)) {
      alert('Please fill in all required fields.');
      return;
    }

    cart.forEach((meal) => {
      let totalPrice = Number(meal.price);
      if (isDelivery) totalPrice += 4;

      const orderDetails = {
        userName,
        userPhone,
        isDelivery,
        deliveryAddress,
        meal: meal.strMeal,
        price: totalPrice
      };

      submitOrder(orderDetails);
    });

    const orderDetails = {
      userName,
      userPhone,
      isDelivery,
      deliveryAddress,
      meals: meal.strMeal,
      price: totalPrice
    };

    localStorage.removeItem('orderCart');
    modal.style.display = 'none';
  });

  recipeDetails.appendChild(list);
  recipeDetails.appendChild(form);
  modal.style.display = 'flex';
}


function removeFromCart(index) {
  let cart = JSON.parse(localStorage.getItem('orderCart')) || [];
  cart.splice(index, 1);
  localStorage.setItem('orderCart', JSON.stringify(cart));
}


});
