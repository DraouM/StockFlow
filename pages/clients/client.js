// client.js
async function displayPartiesByType(type, page = 1, limit = 50) {
  try {
    console.log("Requesting parties of type:", type);

    const response = await window.partiesAPI.getPartiesByType({
      type,
      page,
      limit,
    });

    console.log("Response from IPC:", response);

    if (response.success) {
      const { data, pagination } = response;
      console.log("Parties data:", data);

      // Handle the data...
    } else {
      console.error("Error from server:", response.error);
      // Handle the error...
    }
  } catch (error) {
    console.error("Client error:", error);
    // Handle unexpected errors...
  }
}

// // Usage examples:
// displayPartiesByType("customer"); // Basic usage
// displayPartiesByType("supplier", 2); // With page
// displayPartiesByType("both", 1, 25); // With page and limit

/** TABLE */
document.addEventListener("DOMContentLoaded", async () => {
  const spinner = new LoadingSpinner("clientTable", {
    message: "Loading parties...",
  });

  try {
    spinner.show(); // Show spinner before data fetching

    await loadAndDisplayData();

    spinner.hide(); // Hide spinner after data fetching is done

    // Initialize the EnhancedTable
    const clientTable = new EnhancedTable("clientTable", {
      searchable: true,
      sortable: true,
      searchInputId: "table-search-input", // Link the search input by ID
      emptyMessage: "No parties found",
      emptyImageSrc: "../assets/empty-table.png",
    });

    // Optionally handle the case where no parties are available
    const tableBody = document.querySelector("#clientTable tbody");
    if (tableBody.childElementCount === 0) {
      clientTable.checkTableEmpty(0);
    }
  } catch (error) {
    console.error("Error fetching or rendering parties:", error);

    spinner.hide(); // Hide spinner in case of an error

    // Optionally, display an error message to the user
  }
});

/** MODEL */
// modal functionality
document.addEventListener("DOMContentLoaded", function () {
  // Model
  const modal = document.getElementById("modal");
  const closeModalBtn = document.querySelector(".close-modal-btn");
  const openModalBtn = document.getElementById("open-modal-btn");
  // Form
  const modalForm = document.getElementById("party-form");
  const form1 = document.getElementById("form-1");
  const form2 = document.getElementById("form-2");
  const nextBtn = document.querySelector(".next-btn");
  const prevBtn = document.querySelector(".prev-btn");
  const clearBtns = document.querySelectorAll(".clear-btn");

  // Handling open and close functionallities
  function openModal() {
    modal.style.display = "flex";
  }

  function closeModal() {
    modal.style.display = "none";
  }

  // Event listeners for openning the modal
  openModalBtn.addEventListener("click", openModal);

  // Event listeners for closing the modal
  closeModalBtn.addEventListener("click", closeModal);

  // Close modal if clicking out  side of content
  window.addEventListener("click", function (event) {
    if (event.target === modal) {
      closeModal();
    }
  });

  // Clear form functionality
  clearBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      // Find the closest parent form
      const form = e.target.closest(".personal-info, .commerce-details");
      if (form) {
        const inputs = form.querySelectorAll("input, select");
        inputs.forEach((input) => {
          input.value = "";
        });
      }
    });
  });

  /* MOBILE VIEW */
  // Helper function to check if we're on mobile view
  const isMobileView = () => window.innerWidth < 768;

  // Initial setup
  if (!isMobileView()) {
    form1.classList.remove("hidden");
    form2.classList.remove("hidden");
  }

  //Handle resize events to manage visibility
  window.addEventListener("resize", () => {
    if (!isMobileView()) {
      // Remove hidden class from both forms on desktop
      form1.classList.remove("hidden");
      form2.classList.remove("hidden");
    } else {
      // Reset to initial state on mobile
      form1.classList.remove("hidden");
      form2.classList.add("hidden");
    }
  });

  // Page switching logic (mobile only)
  if (nextBtn && prevBtn) {
    nextBtn.addEventListener("click", () => {
      if (isMobileView() && validatePersonalInfo()) {
        clearAllErrors(); // if exists
        form1.classList.add("hidden");
        form2.classList.remove("hidden");
      }
    });

    prevBtn.addEventListener("click", () => {
      if (isMobileView()) {
        form2.classList.add("hidden");
        form1.classList.remove("hidden");
      }
    });
  }

  modalForm.addEventListener("submit", (e) => {
    e.preventDefault(); // Prevent form from submitting

    const formValidationResult = validateForm();
    if (formValidationResult.isValid) {
      const formData = formValidationResult.formData;
      // Proceed with processing formData
      console.log("Form Data Collected:", formData);

      const partyId = modal.dataset.partyId;
      console.log("Edit Index ID XXX ", partyId);

      if (partyId !== undefined) {
        // // Update existing Party
        const success = handleUpdateParty(partyId, formData);
        console.log("updating success ", success);

        delete modal.dataset.partyId;
        showSuccessMessage("updated");
        closeModal();
      } else {
        // You can now send this data to the server, close the modal, or display a success message
        const success = handleCreateParty(formData);
        console.log("creation success ", success);

        if (success) {
          // Show a success message, clear the form and close the modal
          showSuccessMessage("created");
          resetForm();
          closeModal();

          // Reload table with the new data
          loadAndDisplayData();
        }
      }
    } else {
      // Handle invalid form, as errors are displayed
      showSummaryError("Please fix the highlighted errors.");
    }
  });
});

async function loadAndDisplayData() {
  try {
    const data = await fetchDataFromDatabase();
    if (data) {
      renderDataInTable(data);
    }
  } catch (error) {
    console.error("Error fetching or rendering data:", error);
    // Add a user-friendly error message or fallback UI
  }
}
async function fetchDataFromDatabase() {
  try {
    const { data, pagination, success } =
      await window.partiesAPI.getAllParties();
    if (success) {
      return data;
    } else {
      throw new Error("Failed to fetch data from database");
    }
  } catch (error) {
    console.error("Error fetching data from database:", error);
    throw error;
  }
}

function renderDataInTable(data) {
  const tableBody = document.querySelector("#clientTable tbody");
  tableBody.innerHTML = "";

  const fragment = document.createDocumentFragment();

  data.forEach((party) => {
    const row = document.createElement("tr");
    row.setAttribute("data-id", party.id); // Assign the ID

    row.innerHTML = `
      <td>${party.name}</td>
      <td>${party.phone}</td>
      <td>${party.address}</td>
      <td>${party.type}</td>
      <td>${party.credit_balance}</td>
      <td>
        <button data-action="edit" class="button button-small button-secondary edit-button" data-id="${party.id}">Edit</button>
        <button data-action="delete" class="button button-small button-secondary delete-button" data-id="${party.id}">Delete</button>
      </td>
    `;
    fragment.appendChild(row);
  });

  tableBody.appendChild(fragment);

  // Remove any existing event listeners (if re-rendering)
  tableBody.removeEventListener("click", handleTableActions);

  // Add the event listener for all table actions
  tableBody.addEventListener("click", handleTableActions);
}

function handleTableActions(event) {
  const target = event.target;

  // Check if a button was clicked
  if (target.matches("button[data-action]")) {
    const row = target.closest("tr");
    const partyId = row.dataset.id;
    const action = target.dataset.action;

    switch (action) {
      case "edit":
        handleEditParty(partyId, row);
        break;
      case "delete":
        handleDeleteParty(partyId, row);
        break;
      default:
        console.log("Unknown action:", action);
    }
  } else if (target.closest("tr")) {
    // Handle row click (if needed)
    const row = target.closest("tr");
    const recordId = row.dataset.id;
    handleRowClick(recordId, row);
  }
}

// Separate handlers for each action
// Modified handle functions to show loading states
async function handleEditParty(partyId, row) {
  try {
    tableHelpers.setRowLoading(row, true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const response = await window.partiesAPI.getPartyById(partyId);
    if (response.success) {
      openEditModal(response.data);
    }
  } catch (error) {
    console.error("Error editing record:", error);
  } finally {
    tableHelpers.setRowLoading(row, false);
  }
}

async function handleDeleteParty(partyId, row) {
  try {
    console.log("Deleting party:", partyId);
    // Show confirmation dialog
    if (confirm("Are you sure you want to delete this Party?")) {
      const response = await window.partiesAPI.deleteParty(partyId);
      if (response.success) {
        // Remove row from table
        row.remove();
        // Show success message
      }
    }
  } catch (error) {
    console.error("Error deleting record:", error);
    // Show error message to user
  }
}

function handleRowClick(partyId, row) {
  console.log("Row clicked:", partyId);
  // Handle row click logic (if needed)
  // For example, show details, highlight row, etc.
}

// Example edit modal function
function openEditModal(partyData) {
  // Implementation of edit modal/form
  console.log("Opening edit modal with data:", partyData);
  // You would typically:
  // 1. Show a modal/form
  // 2. Populate it with partyData
  // 3. Handle form submission

  const partyToEdit = partyData;

  // Open modal
  const modal = document.getElementById("modal");
  modal.style.display = "flex";

  // Change modal title
  const modalTitle = modal.querySelector(".modal-title"); // Add class to your title
  modalTitle.textContent = "Edit Party";

  // Populate form fields
  document.getElementById("full-name").value = partyToEdit.name;
  document.getElementById("address").value = partyToEdit.address;
  document.getElementById("phone").value = partyToEdit.phone;
  document.getElementById("type").value = partyToEdit.type;

  // Change submit button text and style
  const submitBtn = modal.querySelector('button[type="submit"]');
  submitBtn.textContent = "Modify";
  submitBtn.classList.remove("bg-blue-500", "hover:bg-blue-600"); // Remove create button classes
  submitBtn.classList.add("bg-green-500", "hover:bg-green-600"); // Add edit button classes

  // Store ID for later use when saving
  console.log("Party To Edit ID ", partyToEdit.id);

  modal.dataset.partyId = partyToEdit.id;
}

// Helper functions for common tasks
const tableHelpers = {
  // Show loading state for a row
  setRowLoading(row, isLoading) {
    if (!row) return;
    // Toggle loading class on row
    row.classList.toggle("row-loading", isLoading);

    // Disable/enable all buttons in the row
    const buttons = row.querySelectorAll("button");
    buttons.forEach((button) => {
      button.disabled = isLoading;
      button.classList.toggle("button-loading", isLoading);
    });

    return row; // Return for chaining
  },

  // Test the loading state
  async simulateLoading(row, duration = 2000) {
    this.setRowLoading(row, true);
    await new Promise((resolve) => setTimeout(resolve, duration));
    this.setRowLoading(row, false);
  },

  // Show success/error message
  showMessage(message, type = "success") {
    // Implementation depends on your UI library
    console.log(`${type}: ${message}`);
  },

  // Highlight a row temporarily
  highlightRow(row, duration = 2000) {
    row.classList.add("highlight");
    setTimeout(() => row.classList.remove("highlight"), duration);
  },

  // Update row data
  updateRowData(row, newData) {
    row.querySelector("td:nth-child(1)").textContent = newData.name;
    row.querySelector("td:nth-child(2)").textContent = newData.phone;
    row.querySelector("td:nth-child(3)").textContent = newData.address;
    row.querySelector("td:nth-child(4)").textContent = newData.type;
    row.querySelector("td:nth-child(5)").textContent = newData.credit_balance;
  },
};

/** Party UPDATING Handler */
async function handleUpdateParty(partyId, partyData) {
  try {
    clearAllErrors(); // Clear any existing errors

    const result = await window.partiesAPI.updateParty(partyId, partyData);

    if (!result.success) {
      console.log("UPDATING RESULT STATUS ", result.status);

      switch (result.status) {
        case 409: // Unique constraint violation (duplicate name)
          showError("full-name", result.error.message);
          document.querySelector("#full-name")?.focus();
          break;

        case 400: // Validation error
          if (result.error.field) {
            showError(result.error.field, result.error.message);
            document.querySelector(`#${result.error.field}`)?.focus();
          } else {
            showSummaryError(result.error.message);
          }
          break;

        case 500: // System error
        default:
          showSummaryError(result.error.message);
          break;
      }
      return false;
    }

    showSuccessMessage(result.message);
    return true;
  } catch (error) {
    console.error("IPC communication error:", error);
    showSummaryError(
      "Failed to communicate with the application. Please try again."
    );
    return false;
  }
}

/** Party CREATEION Handler */
async function handleCreateParty(partyData) {
  try {
    clearAllErrors(); // Clear any existing errors

    const result = await window.partiesAPI.createParty(partyData);

    if (!result.success) {
      console.log("CREATION RESULT STATUS ", result.status);

      switch (result.status) {
        case 409: // Unique constraint violation (duplicate name)
          showError("full-name", result.error.message);
          document.querySelector("#full-name")?.focus();
          break;

        case 400: // Validation error
          if (result.error.field) {
            showError(result.error.field, result.error.message);
            document.querySelector(`#${result.error.field}`)?.focus();
          } else {
            showSummaryError(result.error.message);
          }
          break;

        case 500: // System error
        default:
          showSummaryError(result.error.message);
          break;
      }
      return false;
    }

    showSuccessMessage(result.message);
    return true;
  } catch (error) {
    console.error("IPC communication error:", error);
    showSummaryError(
      "Failed to communicate with the application. Please try again."
    );
    return false;
  }
}

/** Form Validations Functions */
function validateForm() {
  const isPersonalInfoValid = validatePersonalInfo();
  const isCommerceDetailsValid = validateCommerceDetails();

  if (isPersonalInfoValid && isCommerceDetailsValid) {
    const formData = { ...isPersonalInfoValid, ...isCommerceDetailsValid };
    return { isValid: true, formData }; // Form is valid, return data
  } else {
    showSummaryError("Please fix the highlighted errors.");
    return { isValid: false }; // Form is invalid, no data to return
  }
}

function validatePersonalInfo() {
  // Personal Info Form inputs
  const name = document.getElementById("full-name").value.trim();
  const address = document.getElementById("address").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const type = document.getElementById("type").value.trim();

  // Run all individual validators
  const isNameValid = validateName(name);
  const isAddressValid = validateAddress(address);
  const isPhoneValid = validatePhone(phone);
  const isTypeValid = validateType(type);

  if (isNameValid && isAddressValid && isPhoneValid && isTypeValid) {
    return { name, address, phone, type }; // Form is valid
  } else {
    showSummaryError("Please fix the highlighted errors.");
    return false; // Prevent form submission
  }
}

function validateCommerceDetails() {
  // Commerce Details Form inputs
  const nrc = document.getElementById("nrc").value.trim();
  const nif = document.getElementById("nif").value.trim();
  const ia = document.getElementById("ia").value.trim();
  const nis = document.getElementById("nis").value.trim();

  // Run all individual validators
  const isNRC_valid = validateNRC(nrc);
  const isNIF_valid = validateNIF(nif);
  const isIA_valid = validateIA(ia);
  const isNIS_valid = validateNIS(nis);

  if (isNRC_valid && isNIF_valid && isIA_valid && isNIS_valid) {
    return { nrc, nif, ia, nis }; // Form is valid
  } else {
    showSummaryError("Please fix the highlighted errors.");
    return false; // Prevent form submission
  }
}

/** Fields Validations */
function validateName(name) {
  if (name.trim() === "") {
    showError("full-name", "Party Full Name is required");
    return false;
  }
  if (name.length < 3) {
    showError("full-name", "Full Name must be at least 3 characters.");
    return false;
  }
  removeError("full-name");
  return true;
}

function validateAddress(address) {
  if (address.trim() !== "" && address.length <= 4) {
    showError("address", "Address is to short must be >= 4 ");
    return false;
  }
  removeError("address");
  return true;
}

function validatePhone(phone) {
  const phoneRegex = /^[0-9]{10}$/; // Adjust pattern as needed
  if (!phoneRegex.test(phone)) {
    showError(
      "phone",
      `Phone number must be 10 digits. Yours is ${phone.length} `
    );
    return false;
  }
  removeError("phone");
  return true;
}

function validateType(type) {
  const validTypes = ["customer", "supplier", "both"];
  if (!validTypes.includes(type)) {
    showError(
      "type",
      "Invalid type. Must be 'customer', 'supplier', or 'both'."
    );
    return true;
  }
  removeError("type");
  return true;
}

function validateNRC(nrc) {
  const nrcPattern = /^[0-9]{2}\/[0-9]{2}-[0-9]{7}[A-Z][0-9]{2}$/;
  if (nrc && !nrcPattern.test(nrc)) {
    showError("nrc", "Invalid NRC format. Expected format: XX/XX-XXXXXXXAXX");
    return false;
  }
  removeError("nrc");
  return true;
}

function validateNIF(nif) {
  const nifPattern = /^[0-9]{15}$/;
  if (nif && !nifPattern.test(nif)) {
    showError("nif", "Invalid NIF format. Expected format: 15 digits.");
    return false;
  }
  removeError("nif");
  return true;
}

function validateIA(ia) {
  const iaPattern = /^[0-9]{11}$/;
  if (ia && !iaPattern.test(ia)) {
    showError("ia", "Invalid IA format. Expected format: 11 digits.");
    return false;
  }
  removeError("ia");
  return true;
}

function validateNIS(nis) {
  const nisPattern = /^[0-9]{12}$/;
  if (nis && !nisPattern.test(nis)) {
    showError("nis", "Invalid NIS format. Expected format: 12 digits.");
    return false;
  }
  removeError("nis");
  return true;
}

/** Error/Success Display/Removal Functions */
function showError(fieldId, message) {
  const errorDiv = document.getElementById(`${fieldId}-error`);
  errorDiv.innerText = message;
  errorDiv.style.display = "block";
}

function removeError(fieldId) {
  const errorDiv = document.getElementById(`${fieldId}-error`);
  errorDiv.innerText = "";
  errorDiv.style.display = "none";
}

function showSummaryError(message) {
  const summaryErrorDiv = document.getElementById("summary-error");
  summaryErrorDiv.innerText = message;
  summaryErrorDiv.style.display = "block";
}

function clearAllErrors() {
  document.querySelectorAll(".error-message").forEach((errorDiv) => {
    errorDiv.innerText = "";
    errorDiv.style.display = "none";
  });
}

function resetForm() {
  document
    .querySelectorAll("input, select")
    .forEach((input) => (input.value = ""));
  clearAllErrors(); // Clear all error messages
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
