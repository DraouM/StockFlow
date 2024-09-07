const PartiesModel = require("../models/partiesModel");

// Example usage
const parties = new PartiesModel();

// Create a new party
// parties
//   .createParty({
//     name: "Amine",
//     phone: "5466889552",
//     email: "amine@gmail.com",
//     address: "658 second St",
//     party_type: "supplier",
//   })
//   .then(() => {
//     console.log("New party created.");
//   })
//   .catch((err) => {
//     console.error("Error creating party:", err);
//   });

// Function to get total debt for a specific party
async function getPartyTotalDebt(party_id) {
  try {
    const totalDebt = await parties.getTotalDebt(party_id);
    console.log(`Total debt for party with ID ${party_id}: ${totalDebt}`);
  } catch (error) {
    console.error("Error fetching total debt:", error);
  } finally {
    parties.closeConnection(); // Always close the connection
  }
}

// Example: Fetch total debt for party with ID 1
getPartyTotalDebt(4);
