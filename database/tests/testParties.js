// tests/testParties.js
const PartiesModel = require("../models/partiesModel");
const { seedParties } = require("../seeders/seedParties");

async function runTests() {
  // Create a single instance of PartiesModel to be used throughout the tests
  const partiesModel = new PartiesModel();

  try {
    console.log("\n=== Starting Parties Model Tests ===\n");

    // First, seed the database using the same connection
    console.log("Seeding database...");
    await seedParties(partiesModel);
    console.log("Database seeded successfully!\n");

    // Test 1: Create a new party
    console.log("Test 1: Creating a new party");
    const newParty = await partiesModel.create({
      name: "Test Company LLC",
      type: "supplier",
      phone: "555-0123",
      address: "123 Test Street",
    });
    console.log("Created party with ID:", newParty.id);

    // Test 2: Get party by ID
    console.log("\nTest 2: Getting party by ID");
    const retrievedParty = await partiesModel.getById(newParty.id);
    console.log("Retrieved party:", retrievedParty);

    // Test 3: Update party
    console.log("\nTest 3: Updating party");
    const updateResult = await partiesModel.update(newParty.id, {
      name: "Test Company LLC Updated",
      phone: "555-0124",
    });
    console.log("Update result:", updateResult);

    // Test 4: Search functionality
    console.log("\nTest 4: Searching for parties");
    const searchResults = await partiesModel.search("supplier", "Test", 1, 10);
    console.log("Search results:", searchResults);

    // Test 5: Get all parties with pagination
    console.log("\nTest 5: Getting all parties (first page)");
    const allParties = await partiesModel.getAll(1, 5);
    console.log("First 5 parties:", allParties);

    // Test 6: Get parties by type
    console.log("\nTest 6: Getting parties by type");
    const supplierParties = await partiesModel.getByType("supplier", 1, 5);
    console.log("Supplier parties:", supplierParties);

    // Test 7: Get total debt
    console.log("\nTest 7: Getting total debt");
    const totalDebt = await partiesModel.getTotalDebt(newParty.id);
    console.log("Total debt:", totalDebt);

    // Test 8: Delete party
    console.log("\nTest 8: Deleting party");
    const deleteResult = await partiesModel.delete(newParty.id);
    console.log("Delete result:", deleteResult);

    // Test 9: Error handling - Try to get deleted party
    console.log("\nTest 9: Error handling - Getting deleted party");
    try {
      await partiesModel.getById(newParty.id);
    } catch (error) {
      console.log("Expected error caught:", error.message);
    }

    // Test 10: Batch operations test
    console.log("\nTest 10: Batch operations test");
    const batchTestResults = await testBatchOperations(partiesModel);
    console.log("Batch test results:", batchTestResults);

    console.log("\n=== All tests completed successfully ===\n");
  } catch (error) {
    console.error("\nTest failed:", error.message);
  } finally {
    // Only close the connection after all tests are complete
    partiesModel.closeConnection();
  }
}

// Helper function for batch operations test
async function testBatchOperations(partiesModel) {
  const results = {
    created: [],
    retrieved: [],
    updated: [],
    deleted: [],
  };

  // Create multiple parties
  const partiesToCreate = [
    {
      name: "Batch Company 1",
      type: "customer",
      phone: "555-0001",
      address: "1 Batch Street",
    },
    {
      name: "Batch Company 2",
      type: "supplier",
      phone: "555-0002",
      address: "2 Batch Street",
    },
    {
      name: "Batch Company 3",
      type: "both",
      phone: "555-0003",
      address: "3 Batch Street",
    },
  ];

  // Create parties
  for (const party of partiesToCreate) {
    const result = await partiesModel.create(party);
    results.created.push(result);
  }

  // Retrieve all created parties
  for (const created of results.created) {
    const retrieved = await partiesModel.getById(created.id);
    results.retrieved.push(retrieved);
  }

  // Update all created parties
  for (const party of results.retrieved) {
    const updateResult = await partiesModel.update(party.id, {
      name: `${party.name} Updated`,
      address: `${party.address} Updated`,
    });
    results.updated.push(updateResult);
  }

  // Delete all created parties
  for (const party of results.retrieved) {
    const deleteResult = await partiesModel.delete(party.id);
    results.deleted.push(deleteResult);
  }

  return results;
}

// Run the tests
runTests().catch(console.error);
