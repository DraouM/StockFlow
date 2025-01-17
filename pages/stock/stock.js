import { UtilityHelpers } from "/home/mohamed/Documents/Projects/StockFlow/pages/transactions/selling/utilityHelpers.js";

// Fetch the products from the database and display it to the table
document.addEventListener("DOMContentLoaded", async () => {
  const spinner = new LoadingSpinner("stockTable", {
    message: "Loading products...",
  });
  try {
    spinner.show(); // Show spinner before data fetching

    // Fetch all products using the exposed API
    const result = await window.productsAPI.listProducts();
    let products = null;
    if (result.success) {
      products = result.data;
      console.log("products ", products); // log the products
    } else {
      console.log("Something happened in products fetching");
      return;
    }

    // Get the table body element
    const tableBody = document.querySelector("#stockTable tbody");

    // Clear any existing rows
    tableBody.innerHTML = "";

    // Use a document fragment to improve performance
    const fragment = document.createDocumentFragment();

    // Iterate over each product and add a row to the fragment
    products.forEach((product) => {
      const row = document.createElement("tr");
      const quantity = UtilityHelpers.convertSubUnitsToQuantity(
        product.total_stock,
        product.subunit_in_unit
      );
      row.innerHTML = `
        <td>${product.id}</td>
        <td>${product.name}</td>
        <td>
          <span class="main-quantity">${quantity}</span>
          <span class="sub-quantity highlight">${product.subunit_in_unit}</span>
        </td>
        <td>${product.total_stock || "N/A"}</td>
        <td>${product.selling_price}</td>
        <td>${product.buying_price}</td>
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
  }
});

// Add a listener to the edit button for each row
document
  .querySelector("#stockTable tbody")
  .addEventListener("click", (event) => {
    if (event.target.classList.contains("edit-button")) {
      const productId = event.target.dataset.id;
      console.log("Edit product with ID:", productId);
    }
  });

// Handle the creation of new product
// document
//   .getElementById("product-form")
//   .addEventListener("submit", async (e) => {
//     e.preventDefault(); // Prevent the default form submission

//     // Collect the product data
//     const productName = document.getElementById("productName").value;
//     const productTaxes =
//       parseFloat(document.getElementById("productTaxes").value) || 0;
//     const subunitsInUnit = parseInt(
//       document.getElementById("subunitsInUnit").value
//     );
//     const productDescription =
//       document.getElementById("productDescription").value || "";

//     // Create the product data object
//     const productData = {
//       productName: productName,
//       taxes: productTaxes,
//       subunitsInUnit: subunitsInUnit,
//       // description: productDescription, -- ADD LATER WHEN CREATING THE PROFUCT HISTORY
//     };

//     console.log("ProductData ", productData);

//     try {
//       const response = await productsAPI.createProduct(productData);
//       if (!response.success) {
//         // Handle specific error types
//         switch (response.error.type) {
//           case "DUPLICATE_NAME":
//             showError("This product name is already taken");
//             break;
//           case "INVALID_DATA":
//             showError("Please check your input values");
//             break;
//           default:
//             showError("An error occurred");
//         }
//       }
//     } catch (error) {
//       showError("Failed to communicate with the server");
//     }
//   });

//
// modal functionality
// Create a modal service/manager
const modalManager = {
  modal: null,

  init() {
    this.modal = document.getElementById("product-modal");

    // Bind event listeners
    this.bindEvents();
  },

  bindEvents() {
    // Modal open/close events
    document
      .getElementById("open-modal-btn")
      .addEventListener("click", () => this.open());

    document
      .querySelector(".close-modal-btn")
      .addEventListener("click", () => this.close());

    // Outside click close
    window.addEventListener("click", (event) => {
      if (event.target === this.modal) {
        this.close();
      }
    });
  },

  open() {
    this.modal.style.display = "flex";
  },

  close() {
    this.modal.style.display = "none";
  },

  setType(type) {
    // Your modal type logic
  },
};

// Usage
document.addEventListener("DOMContentLoaded", function () {
  const productForm = document.getElementById("product-form");
  const modal = document.getElementById("product-modal");

  modalManager.init();

  // Setup form submission
  productForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const formValidationResult = validateForm();
    if (formValidationResult) {
      // Submit form data
      const formData = formValidationResult.formData;
      // Proceed with processing formData
      console.log("Form Data Collected:", formData);

      const productId = modal.dataset.productId;
      console.log("Edit Index ID XXX ", productId);
      if (productId !== undefined) {
        // UPDATE existing Product
        handleProductUpdating(productId, formData);
        console.log("Product updated successefully ");

        delete modal.dataset.productId;
        showSuccessMessage("updated");
        // closeModal();
      } else {
        // CREATE new Product
        handleProductCreation(formData);
      }
    } else {
      // Handle invalid form, as errors are displayed
      showSummaryError("Please fix the highlighted errors.");
    }
  });
});

// Can be used anywhere after initialization
function handleEditClick() {
  modalManager.open();
  modalManager.setType("edit");
}

//

// Example frontend usage
async function updateProduct(productData) {
  try {
    console.log("Sending update request with data:", productData); // Debug log

    const result = await window.productsAPI.updateProduct({
      id: 6,
      name: "Updated Product 3",
      selling_price: 29.99,
      status: "available",
    });
    console.log("Received result:", result); // Debug log

    if (result.status === "success") {
      console.log("Product updated successfully:", result.data);
      // Handle success (e.g., show success message, refresh product list)
      return result.data;
    } else {
      console.error("Update failed:", result.error);
      throw new Error(result.error.message);
    }
  } catch (error) {
    console.error("Update error:", error);
    throw error; // Re-throw to handle in the calling function
  }
}

// updateProduct(null);

async function fetchSingleProduct(productId) {
  try {
    console.log("Fetching product with ID:", productId);

    const result = await window.productsAPI.fetchSingleProduct(productId);

    if (result.status === "success") {
      console.log("Product fetched successfully:", result.data);
      return result.data;
    } else {
      console.error("Fetch failed:", result.error);
      throw new Error(result.error.message);
    }
  } catch (error) {
    console.error("Fetch product error:", error);
    throw error;
  }
}
fetchSingleProduct(6); // Example usage
/** Product UPDATING Handler */

function handleProductUpdating(productId, productData) {
  console.log("Updating Product with ID: ", productId);
  // Update Product logic here
  // Example: Update Product in database
  // const updatedProduct = await updateProductInDatabase(productId, formData);
  // console.log("Updated Product: ", updatedProduct);
}

/** Product CREATION Handler */
async function handleProductCreation(productData) {
  try {
    const response = await window.productsAPI.createProduct(productData);
    if (!response.success) {
      // Handle specific error types
      switch (response.error.type) {
        case "DUPLICATE_NAME":
          showError("product-name", "This product name is already taken");
          break;
        case "INVALID_DATA":
          showError("summary", "Please check your input values");
          break;
        default:
          showError("summary", "An error occurred");
      }
    }
  } catch (error) {
    showError("summary", "Failed to communicate with the server");
  }
}

/** Product Creation Form Validation */
function validateForm() {
  // Product Iitial Info Form inputs
  const name = document.getElementById("product-name").value.trim();
  const taxes = document.getElementById("product-taxes").value.trim();
  const unit = document.getElementById("subunits-in-unit").value.trim();

  const result = validateInputs(name, taxes, unit);
  if (result.valid) {
    showSuccessMessage();
    const formData = { name, taxes, unit };
    return { isValid: true, formData }; // Form is valid, return data
  } else {
    showError(result.field, result.message);
    return { isValid: false }; // Form is invalid, no data to return
  }
}

/** Fields Validations */
function validateInputs(name, tax, unit) {
  // validate name
  if (name.trim() === "") {
    return {
      valid: false,
      field: "product-name",
      message: "Product Name is required.",
    };
  } else if (name.length < 3) {
    return {
      valid: false,
      field: "product-name",
      message: "Product name must be at least 3 characters.",
    };
  }

  // Validate tax (float)
  if (isNaN(tax) || tax < 0) {
    return {
      valid: false,
      field: "tax",
      message: "Tax must be a non-negative number.",
    };
  }

  // Ensure tax is a float
  if (!Number(tax) || !/^(\d+(\.\d+)?|\.\d+)$/.test(tax)) {
    return {
      valid: false,
      field: "tax",
      message: "Tax must be a valid float.",
    };
  }

  // Validate unit (integer)
  if (!Number.isInteger(Number(unit)) || unit < 0) {
    return {
      valid: false,
      field: "unit",
      message: "Unit must be a non-negative integer.",
    };
  }

  return { valid: true, field: null, message: "Inputs are valid." };
}
/* /END Fields Validations */

/** Error/Success Display/Removal Functions */
function showError(fieldId, message) {
  const errorDiv = document.getElementById(`${fieldId}-error`);
  errorDiv.innerText = message;
  errorDiv.style.display = "block";
}

function showSuccessMessage(action = "created") {
  const successMessage = document.getElementById("successMessage");
  const message =
    action === "created"
      ? "Party created successfully!"
      : "Party updated successfully!";
  successMessage.innerText = message;
  successMessage.style.display = "block";

  // Hide success message after 3 seconds
  setTimeout(() => {
    successMessage.style.display = "none";
  }, 3000);
} /** End of Error/Success Display/Removal Functions */
