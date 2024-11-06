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

document
  .getElementById("display-model-btn")
  .addEventListener("click", () => toggleModel());

window.addEventListener("click", (event) => {
  const model = document.querySelector(".model");
  const overlay = document.getElementById("overlay"); // or use querySelector

  if (event.target === overlay && overlay.classList.contains("active")) {
    toggleModel();
  } else if (event.target === model && model.classList.contains("active")) {
    //Prevent closing if click is inside model and model has active class.
    //this part depends on whether you chose to add `active` class to model in toggle functions
    event.stopPropagation(); // or event.preventDefault(); // or you can remove this completely depending on requirements
    return;
  }
});

function toggleModel() {
  const model = document.querySelector(".model");
  const overlay = document.getElementById("overlay");
  model.classList.toggle("active");
  overlay.classList.toggle("active");
}

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

  // Handle form submission
  if (createBtn) {
    createBtn.addEventListener("click", () => {
      // Collect data from both forms
      const formData = {
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

      // Validate the forms
      if (validateForms(formData)) {
        // Handle the submission
        console.log("Form data:", formData);
        // You can add your API call or other submission logic here
        alert("Form submitted successfully!");
        closeModel();
      }
    });
  }
  // Close Model
  function closeModel() {
    const overlay = document.getElementById("overlay");
    const model = document.getElementById("model");
    overlay.classList.remove("active");
    model.classList.remove("active");
  }

  // Form validation
  function validateForms(data) {
    // Check if required fields are filled
    const required = [
      { field: "fullName", label: "Full Name" },
      { field: "address", label: "Address" },
      { field: "phoneNumber", label: "Phone Number" },
      { field: "nrc", label: "NRC" },
      { field: "nif", label: "NIF" },
    ];

    for (const item of required) {
      const value =
        item.field in data.personalInfo
          ? data.personalInfo[item.field]
          : data.commerceDetails[item.field];

      if (!value || value.trim() === "") {
        alert(`${item.label} is required`);
        return false;
      }
    }

    return true;
  }

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
