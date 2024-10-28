// Fetch all parties
async function fetchAllParties() {
  try {
    const parties = await window.partiesAPI.getAllParties();
    console.log("All parties:", parties);
  } catch (error) {
    console.error("Error fetching parties:", error);
  }
}

// Get party by ID

fetchAllParties();

// Example component showing how to fetch a party by ID
async function getPartyDetails(partyId) {
  try {
    const party = await window.partiesAPI.getPartyById(partyId);
    console.log("Party details:", party);
    return party;
  } catch (error) {
    console.error("Error fetching party:", error);
    throw error;
  }
}
getPartyDetails(6);

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
