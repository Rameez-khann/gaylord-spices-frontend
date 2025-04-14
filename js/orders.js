document.addEventListener("DOMContentLoaded", () => {
    const pendingTable = document.querySelector("#pendingOrders tbody");
    const deliveredTable = document.querySelector("#deliveredOrders tbody");
    const isLoggedIn = localStorage.getItem('token');

    if(!isLoggedIn){
        alert("Log in First");
        window.location.assign('/login.html')
    }
  
    // Fetch and render all orders
    function fetchOrders() {
      fetch("http://localhost:3030/orders/grouped")
        .then((res) => res.json())
        .then(({ pendingOrders, deliveredOrders }) => {
          renderOrders(pendingOrders, pendingTable, true);
          renderOrders(deliveredOrders, deliveredTable, false);
        })
        .catch((err) => {
          console.error("Failed to load orders:", err);
        });
    }
  
    // Render orders into the given table
    function renderOrders(orders, tableBody, isPending) {
      tableBody.innerHTML = "";
  
      orders.forEach((order) => {
        const row = document.createElement("tr");
  
        row.innerHTML = `
          <td>${order.meal}</td>
          <td>${order.userName}</td>
          <td>${order.userPhone}</td>
          <td>${order.isDelivery ? "Yes" : "No"}</td>
          <td>${order.deliveryAddress || '*Collection'}</td>
          <td>€${order.price.toFixed(2)}</td>
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
  
    // Mark order as delivered and refresh orders
    function markAsDelivered(order) {
      fetch(`http://localhost:3030/orders/mark-as-delivered/${order.id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((res) => {
          if (!res.ok) throw new Error("Failed to update order");
          fetchOrders(); // Refresh list after update
        })
        .catch((err) => {
          console.error("Delivery update failed:", err);
          alert("Could not update order. Try again.");
        });
    }
  
    // Initial fetch
    fetchOrders();
  });
  