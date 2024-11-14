// Fetch all parties
async function fetchAllParties() {
  try {
    const parties = await window.partiesAPI.getAllParties();
    console.log("All parties:", parties);
  } catch (error) {
    console.error("Error fetching parties:", error);
  }
}
fetchAllParties();
// Client-side usage:
// async function displayPartiesByType(type, page = 1, limit = 50) {
//   try {
//     const response = await window.partiesAPI.getPartiesByType({
//       type,
//       page,
//       limit,
//     });

//     console.log("Response:", response);

//     if (response.success) {
//       const { data, pagination } = response;
//       // Handle the data...
//     } else {
//       console.error("Error:", response.error);
//     }
//   } catch (error) {
//     console.error("Error fetching parties by type:", error);
//   }
// }

// Usage examples:
// displayPartiesByType("customer"); // Basic usage
// displayPartiesByType("supplier", 2); // With page
// displayPartiesByType("both", 1, 25); // With page and limit

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
// displayPartiesByType("customer");
console.log("DONE");

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

  // Close modal if clicking outside of content
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

      // You can now send this data to the server, close the modal, or display a success message
      const success = handleCreateParty(formData);
      console.log("success ", success);

      if (success) {
        // Show a success message, clear the form and close the modal
        showSuccessMessage();
        resetForm();
        closeModal();

        // Reload table with the new data
        loadAndDisplayData();
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
    row.innerHTML = `
      <td>${party.id}</td>
      <td>${party.name}</td>
      <td>${party.phone}</td>
      <td>${party.address}</td>
      <td>${party.type}</td>
      <td>${party.credit_balance}</td>
      <td>
        <button class="button button-small button-secondary edit-button" data-id="${party.id}">Edit</button>
        <button class="button button-small button-secondary delete-button" data-id="${party.id}">Delete</button>
      </td>
    `;
    fragment.appendChild(row);
  });

  tableBody.appendChild(fragment);
}

async function handleCreateParty(partyData) {
  try {
    clearAllErrors(); // Clear any existing errors

    const result = await window.partiesAPI.createParty(partyData);

    if (!result.success) {
      console.log("RESULT STATUS ", result.status);

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

/** Error Display/Removal Functions */
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

function showSuccessMessage() {
  const successMessage = document.getElementById("successMessage");
  successMessage.style.display = "block";

  // Hide success message after 3 seconds
  setTimeout(() => {
    successMessage.style.display = "none";
  }, 3000);
}
