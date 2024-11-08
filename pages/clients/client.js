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
async function displayPartiesByType(type, page = 1, limit = 50) {
  try {
    const response = await window.partiesAPI.getPartiesByType({
      type,
      page,
      limit,
    });

    console.log("Response:", response);

    if (response.success) {
      const { data, pagination } = response;
      // Handle the data...
    } else {
      console.error("Error:", response.error);
    }
  } catch (error) {
    console.error("Error fetching parties by type:", error);
  }
}

// Usage examples:
displayPartiesByType("customer"); // Basic usage
// displayPartiesByType("supplier", 2); // With page
// displayPartiesByType("both", 1, 25); // With page and limit

//
document.addEventListener("DOMContentLoaded", async () => {
  const spinner = new LoadingSpinner("clientTable", {
    message: "Loading products...",
  });

  try {
    spinner.show(); // Show spinner before data fetching

    // Fetch all parties using the exposed API
    const { data, pagination, success } =
      await window.partiesAPI.getAllParties();

    // Get the table body element
    const tableBody = document.querySelector("#clientTable tbody");

    // Clear any existing rows
    tableBody.innerHTML = "";

    // Use a document fragment to improve performance
    const fragment = document.createDocumentFragment();

    // Iterate over each product and add a row to the fragment
    if (success) {
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
    }

    // Append the fragment to the table body
    tableBody.appendChild(fragment);

    spinner.hide(); // Hide spinner after data fetching is done

    // Initialize the EnhancedTable
    const clientTable = new EnhancedTable("clientTable", {
      searchable: true,
      sortable: true,
      searchInputId: "table-search-input", // Link the search input by ID
      emptyMessage: "No Item found",
      emptyImageSrc: "../assets/empty-table.png",
    });
    // Optionally handle the case where no CLIENT is available
    if (data.length === 0) {
      clientTable.checkTableEmpty(0);
    }
    console.log("Pagination:", pagination);
  } catch (error) {
    console.error("Error fetching parties:", error);

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
displayPartiesByType("customer");
console.log("DONE");

// Model

document.addEventListener("DOMContentLoaded", () => {
  const form1 = document.getElementById("form-1");
  const form2 = document.getElementById("form-2");
  const nextBtn = document.querySelector(".next-btn");
  const prevBtn = document.querySelector(".prev-btn");
  const clearBtns = document.querySelectorAll(".clear-btn");
  const createBtn = document.querySelector(".create-btn");

  // Helper function to check if we're on mobile view
  const isMobileView = () => window.innerWidth < 768;

  // Page switching logic (mobile only)
  if (nextBtn && prevBtn) {
    nextBtn.addEventListener("click", () => {
      if (isMobileView()) {
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

  // // Handle form submission
  // if (createBtn) {
  //   createBtn.addEventListener("click", () => {
  //     // Collect data from both forms
  //     const formData = {
  //       personalInfo: {
  //         fullName: document.getElementById("full-name").value,
  //         address: document.getElementById("address").value,
  //         phoneNumber: document.getElementById("phone-number").value,
  //         type: document.getElementById("type").value,
  //       },
  //       commerceDetails: {
  //         nrc: document.getElementById("nrc").value,
  //         nif: document.getElementById("nif").value,
  //         ia: document.getElementById("ia").value,
  //         nis: document.getElementById("nis").value,
  //       },
  //     };

  //     // Validate the forms
  //     if (validateForms(formData)) {
  //       // Handle the submission
  //       console.log("Form data:", formData);
  //       // You can add your API call or other submission logic here
  //       // alert("Form submitted successfully!");
  //       console.log("Form submitted successfully!");
  //     }
  //   });
  // }

  // // Form validation
  // function validateForms(data) {
  //   console.log("Data for Validation ", data);

  //   // Check if required fields are filled
  //   const required = [
  //     { field: "fullName", label: "Full Name" },
  //     { field: "type", label: "Type" },
  //   ];

  //   for (const item of required) {
  //     const value = item.field in data.personalInfo;
  //     console.log("Value to Check ", value);

  //     if (!value || typeof value !== "string" || value.trim() === "") {
  //       // alert(`${item.label} is required`);
  //       console.log(`${item.label} is required`);

  //       return false;
  //     }
  //   }

  //   // Validate party type
  //   if (!["customer", "supplier", "both"].includes(data.personalInfo.type)) {
  //     alert("Party type must be 'customer', 'supplier', or 'both'");
  //     return false;
  //   }

  //   // Validate optional fields
  //   const optionalFields = [
  //     { field: "phone", label: "Phone" },
  //     { field: "address", label: "Address" },
  //     { field: "nrc", label: "NRC", validator: validateNRC },
  //     { field: "nif", label: "NIF", validator: validateNIF },
  //     { field: "ia", label: "IA" },
  //   ];

  //   for (const item of optionalFields) {
  //     const value = data.personalInfo[item.field];

  //     if (value && !item.validator?.(value)) {
  //       alert(`${item.label} is invalid`);
  //       return false;
  //     }
  //   }

  //   return true;
  // }

  // function validateNRC(nrc) {
  //   // Implement NRC validation logic here
  //   return nrc.match(/^[0-9]{2}\/[0-9]{2}-[0-9]{7}[A-Z][0-9]{2}$/);
  // }

  // function validateNIF(nif) {
  //   // Implement NIF validation logic here
  //   return nif.match(/^[0-9]{15}$/);
  // }

  // Handle resize events to manage visibility
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

  // Initial setup
  if (!isMobileView()) {
    form1.classList.remove("hidden");
    form2.classList.remove("hidden");
  }
});

// Form validation rules and messages
const VALIDATION_RULES = {
  personalInfo: {
    fullName: {
      required: true,
      minLength: 2,
      pattern: /^[a-zA-Z\s-']+$/,
      message:
        "Full name must contain only letters, spaces, hyphens, and apostrophes",
    },
    phoneNumber: {
      required: false,
      pattern: /^[0-9\s+()-]{8,}$/,
      message: "Please enter a valid phone number",
    },
    type: {
      required: true,
      enum: ["customer", "supplier", "both"],
      message: "Type must be customer, supplier, or both",
    },
  },
  commerceDetails: {
    nrc: {
      required: false,
      pattern: /^[0-9]{2}\/[0-9]{2}-[0-9]{7}[A-Z][0-9]{2}$/,
      message: "Invalid NRC format. Expected format: XX/XX-XXXXXXXAXX",
    },
    nif: {
      required: false,
      pattern: /^[0-9]{15}$/,
      message: "NIF must be exactly 15 digits",
    },
    ia: {
      required: false,
      pattern: /^[0-9A-Z]{10,}$/,
      message: "Invalid IA format",
    },
    nis: {
      required: false,
      pattern: /^[0-9]{20}$/,
      message: "NIS must be exactly 20 digits",
    },
  },
};

class FormHandler {
  constructor() {
    this.form = document.getElementById("partyCreationForm");
    this.createBtn = document.querySelector(".create-btn");
    this.personalInfoSection = document.getElementById("form-1");
    this.commerceDetailsSection = document.getElementById("form-2");

    this.modal = document.getElementById("newPartyModal");

    this.setupEventListeners();
  }

  setupEventListeners() {
    // Handle form submission
    this.form.addEventListener("submit", (e) => {
      e.preventDefault();
      this.handleSubmission();
    });

    // Real-time validation on input
    this.form.addEventListener("input", (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "SELECT") {
        this.validateField(e.target);
      }
    });
  }

  collectFormData() {
    return {
      personalInfo: {
        fullName: document.getElementById("full-name").value,
        address: document.getElementById("address").value,
        phoneNumber: document.getElementById("phone-number").value,
        type: document.getElementById("type").value,
      },
      commerceDetails: {
        nrc: document.getElementById("nrc").value,
        nif: document.getElementById("nif").value,
        ia: document.getElementById("ia").value,
        nis: document.getElementById("nis").value,
      },
    };
  }

  validateField(field) {
    // const fieldName = field.id.replace("-", ""); // Convert 'full-name' to 'fullName'
    const fieldName = field.id.replace(/-(.)/g, (_, c) => c.toUpperCase()); // Convert 'full-name' to 'fullName'

    console.log("Field Name ", fieldName);

    const section =
      field.closest("section").id === "form-1"
        ? "personalInfo"
        : "commerceDetails";
    const rules = VALIDATION_RULES[section]?.[fieldName];

    if (!rules) return true;

    const value = field.value.trim();

    // Check required
    if (rules.required && !value) {
      this.showFieldError(field, `${fieldName} is required`);
      return false;
    }

    // Check minimum length
    if (rules.minLength && value.length < rules.minLength) {
      this.showFieldError(
        field,
        `Minimum length is ${rules.minLength} characters`
      );
      return false;
    }

    // Check pattern
    if (rules.pattern && value && !rules.pattern.test(value)) {
      this.showFieldError(field, rules.message);
      return false;
    }

    // Check enum values
    if (rules.enum && !rules.enum.includes(value)) {
      this.showFieldError(field, rules.message);
      return false;
    }

    this.clearFieldError(field);
    return true;
  }

  showFieldError(field, message) {
    // Remove any existing error message
    this.clearFieldError(field);

    // Add error class to field
    field.classList.add("error");

    // Create and insert error message
    const errorDiv = document.createElement("div");
    errorDiv.className = "error-message";
    errorDiv.textContent = message;
    field.parentNode.appendChild(errorDiv);
  }

  clearFieldError(field) {
    field.classList.remove("error");
    const existingError = field.parentNode.querySelector(".error-message");
    if (existingError) {
      existingError.remove();
    }
  }

  validateForm(data) {
    let isValid = true;
    const fields = this.form.querySelectorAll("input, select");

    fields.forEach((field) => {
      if (!this.validateField(field)) {
        isValid = false;
      }
    });

    // Explicitly check the full name field
    const fullNameField = this.form.querySelector("#full-name");
    if (!this.validateField(fullNameField)) {
      isValid = false;
    }

    return isValid;
  }

  async handleSubmission() {
    try {
      const formData = this.collectFormData();

      // Validate the form
      if (!this.validateForm(formData)) {
        // Automatically switch to the first section if there are errors
        this.showSection(this.personalInfoSection);
        return;
      }

      // Disable submit button and show loading state
      this.createBtn.disabled = true;
      this.createBtn.textContent = "Creating...";

      // Here you would typically make an API call
      // For example:
      // await this.submitToAPI(formData);

      // Show success message after the modal is hidden
      this.hideModal();
      this.showSuccessMessage();

      // Reset form
      this.form.reset();

      // Close modal (assuming you have a closeModal function)
      // closeModal();
    } catch (error) {
      this.showErrorMessage(error);
    } finally {
      // Re-enable submit button
      this.createBtn.disabled = false;
      this.createBtn.textContent = "Create";
    }
  }

  showSection(section) {
    // Hide all sections
    this.personalInfoSection.classList.add("hidden");
    this.personalInfoSection.classList.remove("active");
    this.commerceDetailsSection.classList.add("hidden");
    this.commerceDetailsSection.classList.remove("active");

    // Show the specified section
    section.classList.remove("hidden");
    section.classList.add("active");
  }

  hideModal() {
    this.modal.classList.add("hidden");
  }

  showSuccessMessage() {
    // Create a success message element
    const successMessage = document.createElement("div");
    successMessage.className = "success-message";
    successMessage.textContent = "Party created successfully!";

    // Insert it at the top of the form
    this.form.insertBefore(successMessage, this.form.firstChild);

    // Remove it after 3 seconds
    setTimeout(() => {
      successMessage.remove();
    }, 3000);
  }

  showErrorMessage(error) {
    // Create an error message element
    const errorMessage = document.createElement("div");
    errorMessage.className = "error-message";
    errorMessage.textContent =
      "An error occurred while creating the party. Please try again.";

    // Insert it at the top of the form
    this.form.insertBefore(errorMessage, this.form.firstChild);

    // Remove it after 3 seconds
    setTimeout(() => {
      errorMessage.remove();
    }, 3000);

    // Log the actual error for debugging
    console.error("Form submission error:", error);
  }

  // Method to submit to API (implement as needed)
  async submitToAPI(formData) {
    // Implementation depends on your API
    const response = await fetch("/api/parties", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      throw new Error("API submission failed");
    }

    return await response.json();
  }
}

// Initialize the form handler
document.addEventListener("DOMContentLoaded", () => {
  const formHandler = new FormHandler();
});
