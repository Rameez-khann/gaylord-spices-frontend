const recipeDetails = document.getElementById('recipe-details');

// export 

// Function to handle order submission (you can adapt this to your backend or API)
function submitOrder(name, phone, orderType, address) {
    const orderData = {
        name,
        phone,
        orderType,
        address: orderType === 'delivery' ? address : 'N/A', // Set 'N/A' if pick-up
        meal: meal.strMeal
    };

    console.log("Order submitted:", orderData);
    
    // Example of sending the order data to a server (you would need to replace this with your actual server endpoint)
    fetch('/submit-order', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
    })
    .then(response => response.json())
    .then(data => {
        alert('Order placed successfully!');
        modal.style.display = 'none';  // Close the modal after submission
    })
    .catch(error => {
        console.error('Error submitting order:', error);
        alert('There was an error placing your order. Please try again.');
    });
}
