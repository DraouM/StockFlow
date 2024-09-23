const Product = require("../models/productsModel");

async function manageProducts() {
  const product = new Product();

  try {
    await product.createTable();

    // Add a new product
    const newId = await product.addNewProduct("Chocolate Box", 12, 0.1);
    console.log(`New product added with ID: ${newId}`);

    // Get the product
    const newProduct = await product.getProduct(newId);
    console.log("New product:", newProduct);

    // Update the product
    await product.updateProduct(newId, { stock_quantity: 72 });
    console.log("Product updated");

    // Calculate some values
    const productValue = Product.calculateProductValue(
      newProduct.stock_quantity,
      newProduct.unit_price
    );
    console.log(`Product Value: $${productValue.toFixed(2)}`);
  } catch (error) {
    console.error("An error occurred:", error);
  }
}

// manageProducts();

async function manageProducts2() {
  const product = new Product();

  try {
    await product.connect();
    // await product.createTable();

    // Add a new product
    const newId = await product.addNewProduct("Smartphone", 1, 70, 250, 0.7);
    console.log(`New product added with ID: ${newId}`);

    // Get the product
    const newProduct = await product.getProduct(newId);
    console.log("New product:", newProduct);

    // Update the product
    await product.updateProduct(newId, { stock_quantity: 35 });
    console.log("Product updated");

    // Get calculated values
    const productValue = product.getProductValue(newId);
    const totalWithTax = product.getTotalWithTax(newId);
    const stockUnits = product.getStockUnits(newId);

    console.log(`Product Value: $${productValue}`);
    console.log(`Total with Tax: $${totalWithTax}`);
    console.log(`Stock Units: ${stockUnits}`);

    // List all products
    const allProducts = await product.listProducts();
    console.log("All products:", allProducts);
  } catch (error) {
    console.error("An error occurred:", error);
  } finally {
    await product.close();
  }
}

manageProducts2();
