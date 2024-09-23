// Fetch the products from  the databased and display it to the table
document.addEventListener("DOMContentLoaded", async () => {
  const spinner = new LoadingSpinner("stockTable", {
    message: "Loading products...",
  });

  try {
    spinner.show(); // Show spinner before data fetching

    // Fetch all products using the exposed API
    const products = await window.electronAPI.products.getAll();

    // Get the table body element
    const tableBody = document.querySelector("#stockTable tbody");

    // Clear any existing rows
    tableBody.innerHTML = "";

    // Use a document fragment to improve performance
    const fragment = document.createDocumentFragment();

    // Iterate over each product and add a row to the fragment
    products.forEach((product) => {
      const row = document.createElement("tr");

      row.innerHTML = `
  <td>${product.id}</td>
  <td>${product.name}</td>
  <td>${product.product_unit}</td>
  <td>${product.stock_quantity}</td>
  <td>${product.stock_quantity / product.product_unit}</td>
  <td>${product.unit_price}</td>
  <td>${product.product_value}</td>
  <td>${product.tax_rate}</td>
  <td>
    <button class="button button-small button-secondary edit-button" data-id="${
      product.id
    }">Edit</button>
    <button class="button button-small button-secondary delete-button" data-id="${
      product.id
    }">Delete</button>
  </td>
`;

      fragment.appendChild(row);
    });

    // Append the fragment to the table body
    tableBody.appendChild(fragment);

    spinner.hide(); // Hide spinner after data fetching is done

    // Initialize the EnhancedTable
    const stockTable = new EnhancedTable("stockTable", {
      searchable: true,
      sortable: true,
      searchInputId: "table-search-input", // Link the search input by ID
      emptyMessage: "No Item found",
      emptyImageSrc: "../assets/empty-table.png",
    });
    // Optionally handle the case where no products are available
    if (products.length === 0) {
      stockTable.checkTableEmpty(0);
    }
  } catch (error) {
    console.error("Error fetching products:", error);

    spinner.hide(); // Hide spinner in case of an error

    // Optionally, display an error message to the user
  }
});
// Add a listener to the edit button for each row
// Use event delegation to handle clicks on .edit-button
document
  .querySelector("#stockTable tbody")
  .addEventListener("click", (event) => {
    if (event.target.classList.contains("edit-button")) {
      const productId = event.target.dataset.id;
      // Handle the edit action for the product with productId
      console.log("Edit product with ID:", productId);
    }
  });

// Handle the creation of new product
document
  .getElementById("newProductForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault(); // Prevent the default form submission

    // Collect the product data
    const productName = document.getElementById("productName").value;
    const productTaxes =
      parseFloat(document.getElementById("productTaxes").value) || 0;
    const subunitsInUnit = parseInt(
      document.getElementById("subunitsInUnit").value
    );
    const productDescription =
      document.getElementById("productDescription").value || "";

    // Create the product data object
    const productData = {
      productName: productName,
      taxes: productTaxes,
      subunitsInUnit: subunitsInUnit,
      // description: productDescription, -- ADD LATER WHEN CREATING THE PROFUCT HISTORY
    };

    console.log("ProductData ", productData);

    try {
      const result = await window.electronAPI.products.create(productData);

      if (result.success) {
        console.log("Product created successfully with ID:", result.id);
        document.getElementById("newProductForm").reset();
        document.getElementById("newProductModal").style.display = "none";
      } else {
        console.error("Failed to create product:", result.error);
      }
    } catch (error) {
      console.error("Error creating product:", error);
    }
  });
