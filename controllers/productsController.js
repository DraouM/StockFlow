const ProductModel = require("../database/models/productsModel");
const productModel = new ProductModel();

class ProductsController {
  async createProductController(data) {
    try {
      const result = await productModel.createProduct(data);
      return { success: true, data: result };
    } catch (error) {
      return {
        success: false,
        error: {
          type: error.type || "UNKNOWN_ERROR",
          message: error.message,
        },
      };
    }
  }

  async listProductsController(filter = {}) {
    try {
      const products = await productModel.listProducts(filter);
      return { success: true, data: products };
    } catch (error) {
      return {
        success: false,
        error: {
          type: error.type || "UNKNOWN_ERROR",
          message: error.message,
        },
      };
    }
  }
}

module.exports = new ProductsController();

// exports.getAllProducts = async () => {
//   try {
//     return await productModel.listProducts();
//   } catch (error) {
//     console.error("Error getting all products:", error);
//     throw error;
//   }
// };

// exports.getProductById = async (event, productId) => {
//   try {
//     return await productModel.getById(productId);
//   } catch (error) {
//     console.error(`Error getting product ${productId}:`, error);
//     throw error;
//   }
// };

// exports.searchProducts = async (searchTerm) => {
//   try {
//     console.log("BBB ", searchTerm);

//     return await productModel.searchProducts(searchTerm);
//   } catch (error) {
//     console.error("Error searching products:", error);
//     throw error;
//   }
// }; //  exports.searchProducts = async ()=>{...}  //  exports.search

// exports.updateProduct = async (productId, productData) => {
//   try {
//     return await productModel.updateProduct(productId, productData);
//   } catch (error) {
//     console.error(`Error updating product ${productId}:`, error);
//     throw error;
//   }
// };
