const ProductModel = require("../database/models/productsModel");
const productModel = new ProductModel();

class ProductError extends Error {
  constructor(type, message) {
    super(message);
    this.type = type;
  }
}

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

  async handleFetchSingle(productId) {
    try {
      // Validate input
      if (!productId) {
        return {
          status: "error",
          error: {
            type: "INVALID_INPUT",
            message: "Product ID is required",
          },
        };
      }

      // Fetch the product
      const product = await productModel.fetchSingleProduct(productId);

      return {
        status: "success",
        data: product,
      };
    } catch (error) {
      // Handle known error types
      if (error instanceof ProductError) {
        return {
          status: "error",
          error: {
            type: error.type,
            message: error.message,
          },
        };
      }

      // Handle unexpected errors
      console.error("Fetch single product error:", error);
      return {
        status: "error",
        error: {
          type: "UNKNOWN_ERROR",
          message: "An unexpected error occurred while fetching the product",
        },
      };
    }
  }

  async handleUpdate(data) {
    const id = data.id;
    try {
      console.log("Received update data:", data); // Debug log

      // Validate required fields in request
      if (!id) {
        return {
          status: "error",
          error: {
            type: "INVALID_INPUT",
            message: "Product ID is required",
          },
        };
      }

      // Remove any undefined or null values
      const updateData = Object.fromEntries(
        Object.entries(data).filter(
          ([key, value]) =>
            value !== undefined && value !== null && key !== "id"
        )
      );

      console.log("Filtered update data:", updateData); // Debug log

      // Perform the update
      const result = await productModel.updateProduct(data);

      return {
        status: "success",
        data: result,
      };
    } catch (error) {
      // Enhanced error logging
      console.error("Detailed error information:", {
        message: error.message,
        type: error.type,
        stack: error.stack,
      });

      // Handle known error types
      if (error instanceof ProductError) {
        return {
          status: "error",
          error: {
            type: error.type,
            message: error.message,
          },
        };
      }

      // More specific error for database-related issues
      if (error.code) {
        // SQL errors usually have a code
        return {
          status: "error",
          error: {
            type: "DATABASE_ERROR",
            message: `Database error: ${error.message}`,
          },
        };
      }

      // Handle unexpected errors with more detail
      return {
        status: "error",
        error: {
          type: "UNKNOWN_ERROR",
          message: error.message || "An unexpected error occurred",
        },
      };
    }
  }

  async searchProducts(searchTerm) {
    try {
      const products = await productModel.searchProducts(searchTerm);
      return {
        success: true,
        data: products,
        message: `Found ${products.length} product(s)`,
      };
    } catch (error) {
      console.error("Search products error:", error);
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
