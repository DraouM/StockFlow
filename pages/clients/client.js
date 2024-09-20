// Fetch all parties
async function fetchAllParties() {
  try {
    const parties = await window.electronAPI.parties.getAll();
    console.log("All parties:", parties);
  } catch (error) {
    console.error("Error fetching parties:", error);
  }
}

// Get party by ID
async function fetchPartyById(id) {
  try {
    const party = await window.electronAPI.parties.getById(id);
    console.log(`Party with ID ${id}:`, party);
  } catch (error) {
    console.error("Error fetching party by ID:", error);
  }
}

fetchAllParties();

fetchPartyById(2);

//
document.addEventListener("DOMContentLoaded", async () => {
  const spinner = new LoadingSpinner("clientTable", {
    message: "Loading products...",
  });

  try {
    spinner.show(); // Show spinner before data fetching

    // Fetch all parties using the exposed API
    const parties = await window.electronAPI.parties.getAll();

    // Get the table body element
    const tableBody = document.querySelector("#clientTable tbody");

    // Clear any existing rows
    tableBody.innerHTML = "";

    // Use a document fragment to improve performance
    const fragment = document.createDocumentFragment();

    // Iterate over each product and add a row to the fragment
    parties.forEach((party) => {
      const row = document.createElement("tr");

      row.innerHTML = `
  <td>${party.party_id}</td>
  <td>${party.name}</td>
  <td>${party.phone}</td>
  <td>${party.email}</td>
  <td>${party.address}</td>
  <td>${party.party_type}</td>
  <td>${party.total_debt}</td>
  <td>
    <button class="button button-small button-secondary edit-button" data-id="${party.id}">Edit</button>
    <button class="button button-small button-secondary delete-button" data-id="${party.id}">Delete</button>
  </td>
`;

      fragment.appendChild(row);
    });

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
    // Optionally handle the case where no products are available
    if (parties.length === 0) {
      clientTable.checkTableEmpty(0);
    }
  } catch (error) {
    console.error("Error fetching parties:", error);

    spinner.hide(); // Hide spinner in case of an error

    // Optionally, display an error message to the user
  }
});
