const ProductModel = require("../database/models/productsModel");

// Create an instance of ProductModel
const productModel = new ProductModel();
exports.getAllProducts = async () => {
  try {
    return await productModel.listProducts();
  } catch (error) {
    console.error("Error getting all products:", error);
    throw error;
  }
};

exports.getProductById = async (event, productId) => {
  try {
    return await productModel.getById(productId);
  } catch (error) {
    console.error(`Error getting product ${productId}:`, error);
    throw error;
  }
};

exports.createProduct = async (event, productData) => {
  try {
    return await ProductModel.create(productData);
  } catch (error) {
    console.error("Error creating product:", error);
    throw error;
  }
};
