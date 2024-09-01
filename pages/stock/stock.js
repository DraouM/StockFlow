document.addEventListener("DOMContentLoaded", async () => {
  const spinner = new LoadingSpinner("products-table", {
    message: "Loading products...",
  });

  try {
    // Show the spinner
    spinner.show();

    // Simulate a delay to see the loader (e.g., 2 seconds)
    await new Promise((resolve) => setTimeout(resolve, 5000));

    // Fetch all products using the exposed API
    const products = await window.electronAPI.products.getAll();

    // Get the table body element
    const tableBody = document.querySelector("#products-table tbody");

    // Clear any existing rows
    tableBody.innerHTML = "";

    // Use a document fragment to improve performance
    const fragment = document.createDocumentFragment();

    // Iterate over each product and add a row to the fragment
    products.forEach((product) => {
      const row = document.createElement("tr");

      row.innerHTML = `
          <td>${product.id}</td>
          <td>${product.product_name}</td>
          <td>${product.stock_quantity}</td>
          <td>${product.unit_price}</td>
          <td>${product.product_value}</td>
          <!-- Add more columns as needed -->
        `;

      // Append the row to the fragment
      fragment.appendChild(row);
    });

    // Append the fragment to the table body
    tableBody.appendChild(fragment);

    // Initialize the EnhancedTable after rows are added
    const stockTable = new EnhancedTable("products-table", {
      searchable: true,
      sortable: true,
      emptyMessage: "No Item found",
      emptyImageSrc: "../assets/empty-table.png",
    });
    // Hide the spinner even if there's an error
    spinner.hide();

    // Optionally handle the case where no products are available
    if (products.length === 0) {
      stockTable.checkTableEmpty(0);
    }
  } catch (error) {
    console.error("Error fetching products:", error);
  }
});
