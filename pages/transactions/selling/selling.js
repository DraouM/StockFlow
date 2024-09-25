document.addEventListener("DOMContentLoaded", () => {
  const fetchProducts = async (searchTerm) => {
    return await window.electronAPI.products.searchProducts(searchTerm);
  };

  const onProductSelected = (selectedProduct) => {
    console.log("Product selected:", selectedProduct);
    // You can add custom behavior for what happens when a product is selected.
    // For example, you might want to fill another input field or redirect the user.
    displaySelectedProduct(selectedProduct);
  };

  // Create an instance of the Searchbar class
  const productSearchbar = new Searchbar(
    "search-input", // Input field ID
    "results-list", // Results list ID
    "search-form", // Search form ID
    "search-results", // Results div ID
    fetchProducts, // Fetch function for searching products
    onProductSelected // Callback when a product is selected
  );
});

// Form handler
function displaySelectedProduct(product) {
  // Get form input elements
  const productNameInput = document.getElementById("productName");
  const quantityInput = document.getElementById("quantite");
  const unitPriceInput = document.getElementById("unitPrice");
  const totalPriceInput = document.getElementById("totalPrice");

  // Populate form inputs with selected product data
  productNameInput.value = product.name || "";
  quantityInput.value = product.stock_quantity || 0;
  unitPriceInput.value = product.unit_price || 0;

  // Calculate total price based on quantity and unit price
  updateTotalPrice();

  // Remove previous event listeners before adding new ones to avoid duplicates
  quantityInput.removeEventListener("input", updateTotalPrice);
  unitPriceInput.removeEventListener("input", updateTotalPrice);

  // Add event listeners for dynamic price and quantity updates
  quantityInput.addEventListener("input", updateTotalPrice);
  unitPriceInput.addEventListener("input", updateTotalPrice);

  // Function to calculate and update total price
  function updateTotalPrice() {
    const quantity = parseFloat(quantityInput.value) || 0;
    const unitPrice = parseFloat(unitPriceInput.value) || 0;
    const totalPrice = quantity * unitPrice;
    totalPriceInput.value = totalPrice.toFixed(2); // Round to two decimal places
  }
}
