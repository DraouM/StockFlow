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

exports.createProduct = async (productData) => {
  try {
    const lastID = await productModel.addNewProduct(productData);
    return { success: true, id: lastID };
  } catch (error) {
    console.error("Error creating product:", error);
    return { success: false, error: error.message };
  }
};

exports.searchProducts = async (searchTerm) => {
  try {
    console.log("BBB ", searchTerm);

    return await productModel.searchProducts(searchTerm);
  } catch (error) {
    console.error("Error searching products:", error);
    throw error;
  }
}; //  exports.searchProducts = async ()=>{...}  //  exports.search

exports.updateProduct = async (productId, productData) => {
  try {
    return await productModel.updateProduct(productId, productData);
  } catch (error) {
    console.error(`Error updating product ${productId}:`, error);
    throw error;
  }
};
