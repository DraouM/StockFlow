// seeds/seedParty.js
const PartiesModel = require("../models/partiesModel");

const seedData = [
  {
    name: "ABC Corporation",
    type: "customer",
    phone: "123-456-7890",
    address: "456 Customer Ave",
    credit_balance: 1000,
  },
  {
    name: "XYZ Suppliers",
    type: "supplier",
    phone: "098-765-4321",
    address: "789 Supplier Blvd",
    credit_balance: -500,
  },
  {
    name: "General Trading Co",
    type: "both",
    phone: "555-123-4567",
    address: "123 Trading Street",
    credit_balance: 750,
  },
  {
    name: "Quick Logistics",
    type: "supplier",
    phone: "555-987-6543",
    address: "321 Logistics Avenue",
    credit_balance: -250,
  },
  {
    name: "Retail Giants",
    type: "customer",
    phone: "555-246-8135",
    address: "789 Retail Road",
    credit_balance: 1500,
  },
];

async function seedParties(partiesModel) {
  try {
    console.log("Starting to seed parties...");

    // Drop existing data
    await partiesModel.runQuery(
      "DELETE FROM parties",
      [],
      "Cleared existing parties",
      "Error clearing parties"
    );

    // Insert seed data
    for (const party of seedData) {
      await partiesModel.create(party);
    }

    console.log("Successfully seeded parties data");
  } catch (error) {
    console.error("Error seeding parties:", error);
    throw error;
  }
}

module.exports = {
  seedParties,
  seedData, // Export seed data for testing purposes
};
