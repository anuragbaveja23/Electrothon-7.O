async function fetchPrices() {
    const response = await fetch("/prices");
    const data = await response.json();

    document.getElementById("amazon-price").innerText = "₹" + data.amazon;
    document.getElementById("flipkart-price").innerText = "₹" + data.flipkart;
}

// Fetch prices on page load
document.addEventListener("DOMContentLoaded", fetchPrices);
