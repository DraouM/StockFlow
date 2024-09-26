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
  const quantityInput = document.getElementById("quantity");
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

  // Store the product data in a temporary object for adding to the shopping list
  window.selectedProduct = product;
}

// Adding Selected Product to a Shopping List
let shoppingList = []; // Array to store selected products

function addToShoppingList() {
  const quantity = parseInt(document.getElementById("quantity").value, 10);

  // Check if the product is already in the shopping list
  const existingProduct = shoppingList.find(
    (item) => item.id === window.selectedProduct.id
  );

  if (existingProduct) {
    // Update the quantity of the existing product
    existingProduct.quantity += quantity;
  } else {
    // Add the product to the shopping list with the selected quantity
    shoppingList.push({
      ...window.selectedProduct,
      quantity: quantity,
    });
  }

  displayShoppingList(); // Update the displayed shopping list
}

function displayShoppingList() {
  const shoppingListContainer = document.getElementById("shopping-list");
  shoppingListContainer.innerHTML = ""; // Clear the list

  shoppingList.forEach((product, index) => {
    const productElement = document.createElement("li");
    productElement.innerHTML = `
      ${product.name} - Quantity: ${product.quantity}, Unit Price: ${
      product.unit_price
    }, 
      Total: ${(product.quantity * product.unit_price).toFixed(2)}
      <button onclick="removeFromShoppingList(${index})">Remove</button>
    `;
    shoppingListContainer.appendChild(productElement);
  });

  calculateTotal();
}
function calculateTotal() {
  // Call this function inside displayShoppingList() to update the total price
  const total = shoppingList.reduce(
    (acc, product) => acc + product.quantity * product.unit_price,
    0
  );
  document.getElementById(
    "total-price"
  ).innerText = `Total Price: $${total.toFixed(2)}`;
}

function removeFromShoppingList(index) {
  shoppingList.splice(index, 1); // Remove the product from the shopping list
  displayShoppingList(); // Update the displayed list
}
function selectProductFromSearch(product) {
  displayProductInfo(product);
}
