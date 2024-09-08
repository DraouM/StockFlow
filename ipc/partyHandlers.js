const PartiesModel = require("../database/models/partiesModel");

// Instantiate the partiesModel class
const partiesModel = new PartiesModel();

// Get all parties
exports.getAllParties = async () => {
  try {
    const parties = await partiesModel.getAll();
    return parties;
  } catch (error) {
    console.error("Error fetching parties:", error);
    throw error;
  }
};

// Get party by ID
exports.getPartyById = async (event, partyId) => {
  try {
    const party = await partiesModel.getById(partyId);
    return party;
  } catch (error) {
    console.error(`Error fetching party with ID ${partyId}:`, error);
    throw error;
  }
};

// Create a new party
exports.createParty = async (event, partyData) => {
  try {
    const newPartyId = await partiesModel.create(partyData);
    return newPartyId;
  } catch (error) {
    console.error("Error creating party:", error);
    throw error;
  }
};

// Update an existing party
exports.updateParty = async (event, id, partyData) => {
  try {
    const updatedParty = await partiesModel.update(id, partyData);
    return updatedParty;
  } catch (error) {
    console.error(`Error updating party with ID ${id}:`, error);
    throw error;
  }
};

// Delete a party
exports.deleteParty = async (event, id) => {
  try {
    const deletedParty = await partiesModel.delete(id);
    return deletedParty;
  } catch (error) {
    console.error(`Error deleting party with ID ${id}:`, error);
    throw error;
  }
};

// Get total debt for a party
exports.getPartyTotalDebt = async (event, partyId) => {
  try {
    const totalDebt = await partiesModel.getTotalDebt(partyId);
    return totalDebt;
  } catch (error) {
    console.error(
      `Error fetching total debt for party with ID ${partyId}:`,
      error
    );
    throw error;
  }
};
