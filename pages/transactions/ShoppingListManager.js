import ShoppingList from "./ShoppingList.js";
import BuyingShoppingList from "./buyingShoppingList.js";

class ShoppingListManager {
  constructor(shoppingList) {
    if (
      !(shoppingList instanceof ShoppingList) &&
      !(shoppingList instanceof BuyingShoppingList)
    ) {
      throw new Error(
        "ShoppingListManager requires a ShoppingList or BuyingShoppingList instance"
      );
    }

    this.shoppingList = shoppingList;
    this.originalList = [];

    this.changeLog = [];
    this.listeners = {
      productAdded: [],
      productUpdated: [],
      productDeleted: [],
    };
  }

  populate(givenList = []) {
    if (!Array.isArray(givenList)) {
      throw new Error("Given list must be an array");
    }
    console.log("Shopping List Populated ", givenList);
    this.shoppingList.populate(givenList);
    this.originalList = [...this.shoppingList.shoppingList];
  }

  addProduct(product) {
    console.log("Adding Product ", product);
    this.shoppingList.addProduct(product);
    const newProduct =
      this.shoppingList.shoppingList[this.shoppingList.shoppingList.length - 1];
    this.changeLog.push({ type: "add", newProduct });
    this.listeners.productAdded.push(newProduct);
    console.log("ADDED products ", this.listeners.productAdded); // Output: true
  }

  deleteProduct(productTempId) {
    console.log("Deleting Product ", productTempId);

    // Check if the product exists in the original List
    const product = this.originalList.find(
      (product) => product.tempId === productTempId
    );
    console.log({ product });

    // Case, it exists in the original list
    if (product) {
      this.shoppingList.deleteProduct(productTempId);
      this.changeLog.push({ type: "delete", product });
      this.listeners.productDeleted.push(product);
    }
    // Case not
    else {
      this.shoppingList.deleteProduct(productTempId);
      this.changeLog.push({ type: "delete", product: null });
      // find the prduct index in the added list
      const foundItem = this.listeners.productAdded.find(
        (product) => product.tempId === productTempId
      );
      if (foundItem !== -1) {
        this.listeners.productAdded.splice(foundItem, 1);
      }

      console.log("ADDED products ", this.listeners.productAdded); // Output: true
    }
    console.log("DELETED products ", this.listeners.productDeleted); // Output: true
  }

  updateProduct(productTempId, updatedProduct) {
    // Validate that updatedProduct has the necessary properties
    if (!updatedProduct) {
      throw new Error("Updated product must have a valid tempId");
    }

    // Check if the product exists in the original list
    const productIndex = this.originalList.findIndex(
      (product) => product.tempId === productTempId
    );

    if (productIndex !== -1) {
      // Ensure tempId is preserved
      updatedProduct.tempId = productTempId;
      this.changeLog.push({ type: "update", product: updatedProduct });

      // Check if the product is already in updated list
      const foundItemIndex = this.listeners.productUpdated.findIndex(
        (product) => product.tempId === productTempId
      );

      if (foundItemIndex === -1) {
        // New update - add to list
        console.log("Adding new update");
        this.listeners.productUpdated.push(updatedProduct);
      } else {
        // Existing update - replace in list
        console.log("Updating existing update");
        this.listeners.productUpdated[foundItemIndex] = updatedProduct;
      }

      console.log(
        "Product updated in original list: ",
        this.listeners.productUpdated
      );
    } else {
      // If the product does not exist in the original list, check in the added products
      const addedProductIndex = this.listeners.productAdded.findIndex(
        (product) => product.tempId === productTempId
      );
      if (addedProductIndex !== -1) {
        // Update the product in the added list
        this.listeners.productAdded[addedProductIndex] = updatedProduct;
        this.changeLog.push({ type: "update", product: updatedProduct });
        // this.listeners.productUpdated.forEach((listener) =>
        //   listener(updatedProduct)
        // );
        console.log("Product updated in added list: ", updatedProduct);
      } else {
        // If the product does not exist at all
        throw new Error("Product not found for update");
      }
    }

    this.shoppingList.updateProduct(productTempId, updatedProduct);
    console.log("UPDATED products ", this.listeners.productUpdated); // Output: true
  }

  clearList() {
    this.originalList = [];
    this.changeLog = [];
    this.listeners.productUpdated = [];
    this.listeners.productAdded = [];
    this.listeners.productDeleted = [];
  }

  log() {
    console.log("Original List ", this.originalList);
    console.log("Change Log ", this.changeLog);
    console.log("Changes ", this.listeners);
  }
}

export default ShoppingListManager;
