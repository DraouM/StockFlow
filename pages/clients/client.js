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
