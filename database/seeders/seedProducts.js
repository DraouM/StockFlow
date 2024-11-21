// Sample products to seed
const seedData = [
  {
    name: "Product D",
    units: 2,
    taxRate: 5,
  },
  {
    name: "Product E",
    units: 1,
    taxRate: 10,
  },
  {
    name: "Product F",
    units: 10,
    taxRate: 3.75,
  },
];

async function seedProducts(productsModel) {
  try {
    console.log("Seeding products...");

    // Drop existing data
    // await productsModel.runQuery("DELETE FROM prodcuts", []);

    // Insert seed data
    for (const product of seedData) {
      await productsModel.create(product); // Assuming `create` is the function in your model
      console.log(`Seeded: ${product.name}`);
    }

    console.log("Product seeding completed successfully.");
  } catch (error) {
    console.error("Seeders => Error seeding products:", error.message);
    throw error;
  }
}

module.exports = {
  seedProducts,
  seedData, // Export seed data for testing purposes
};
