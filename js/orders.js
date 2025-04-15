

document.addEventListener("DOMContentLoaded", () => {
  const pendingTable = document.querySelector("#pendingOrders tbody");
  const deliveredTable = document.querySelector("#deliveredOrders tbody");
  const isLoggedIn = localStorage.getItem('token');

  if (!isLoggedIn) {
    alert("Log in First");
    window.location.assign('/login.html');
    return;
  }

  // Fetch all orders from the server
  function fetchOrders() {
    fetch("http://localhost:3030/orders/grouped")
      .then((res) => res.json())
      .then(({ pendingOrders, deliveredOrders }) => {
        renderOrders(pendingOrders, pendingTable, true);
        renderOrders(deliveredOrders, deliveredTable, false);
      })
      .catch((err) => {
        console.error("Failed to load orders:", err);
        alert("Could not load orders.");
      });
  }

  // Render orders into the specified table
  function renderOrders(orders, tableBody, isPending) {
    tableBody.innerHTML = "";

    orders.forEach((order) => {
      const row = document.createElement("tr");

      // Convert cart items to item1<br/>item2...
      const itemsHTML = order.cart
        .map((item, index) => `${index + 1}. ${item.strMeal}`)
        .join("<br/>");

      row.innerHTML = `
        <td>${order.userName}</td>
        <td>${order.userPhone}</td>
        <td>${order.isDelivery ? "Yes" : "No"}</td>
        <td>${order.deliveryAddress || '*Collection'}</td>
        <td>€${order.totalAmount.toFixed(2)}</td>
        <td>${itemsHTML}</td>
      `;

      if (isPending) {
        const actionCell = document.createElement("td");
        const button = document.createElement("button");
        button.className = "mark-delivered";
        button.textContent = "Mark as Delivered";
        button.onclick = () => markAsDelivered(order);
        actionCell.appendChild(button);
        row.appendChild(actionCell);
      }

      tableBody.appendChild(row);
    });
  }

  // Mark order as delivered
  function markAsDelivered(order) {
    fetch(`http://localhost:3030/orders/mark-as-delivered/${order.id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to update order");
        fetchOrders(); // Refresh after successful update
      })
      .catch((err) => {
        console.error("Delivery update failed:", err);
        alert("Could not update order. Try again.");
      });
  }

  // Initial load
  fetchOrders();
});

  