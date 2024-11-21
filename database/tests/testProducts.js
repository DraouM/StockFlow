// tests/testProducts.js
const ProdcutsModel = require("../models/productsModel");
const { seedProducts } = require("../seeders/seedProducts");

async function runTests() {
  // Create a single instance of ProductsModel to be used throughout the tests
  const productsModel = new ProdcutsModel();

  try {
    console.log("\n=== Starting Products Model Tests ===\n");

    // First, seed the database using the same connection
    console.log("Seeding database...");
    await seedProducts(productsModel);
    console.log("Database seeded successfully!\n");
  } catch (error) {
    console.error("\nTest failed:", error.message);
  }
}

// Run the tests
runTests().catch(console.error);
