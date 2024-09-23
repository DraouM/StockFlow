document.addEventListener("DOMContentLoaded", () => {
  const fetchProducts = async (searchTerm) => {
    return await window.electronAPI.products.searchProducts(searchTerm);
  };

  const onProductSelected = (selectedProduct) => {
    console.log("Product selected:", selectedProduct);
    // You can add custom behavior for what happens when a product is selected.
    // For example, you might want to fill another input field or redirect the user.
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
