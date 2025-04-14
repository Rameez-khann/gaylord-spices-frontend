document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("form");

    form.addEventListener("submit", async (event) => {
        event.preventDefault(); // Stop form from submitting the normal way

        
        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;

        try {
            const response = await fetch("http://localhost:3030/authentication/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();
            if (data.status ==='success') {
                // You can redirect or store token, etc.
                alert("Login successful!");
                saveUser(data);
            } else {
                alert(`Wrong Email or Password`);
            }
        } catch (err) {
            console.error("Login error:", err);
            alert("Something went wrong. Please try again later.");
        }
    });


    function saveUser(data){
        const token = data.token||''
        localStorage.setItem('token',token);
        window.location.href = "/index.html"; // Example redirect
    }
});
