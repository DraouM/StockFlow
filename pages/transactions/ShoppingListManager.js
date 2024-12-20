import ShoppingList from "./ShoppingList.js";
class ShoppingListManager extends ShoppingList {
  constructor(formManager, modalManager) {
    super(formManager, modalManager);
    this.changeLog = [];
    this.listeners = {
      productAdded: [],
      productUpdated: [],
      productDeleted: [],
    };
  }

  // Event listener method
  on(eventName, callback) {
    if (this.listeners[eventName]) {
      this.listeners[eventName].push(callback);
    } else {
      console.warn(`Event ${eventName} is not supported`);
    }
  }

  // Method to trigger events
  triggerEvent(eventName, data) {
    if (this.listeners[eventName]) {
      this.listeners[eventName].forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in ${eventName} event handler:`, error);
        }
      });
    }
  }

  // Override addProduct to include event trigger
  addProduct(product) {
    const addedProduct = super.addProduct(product);

    // Log the change
    this.logChange({
      type: "productAdded",
      details: product,
      timestamp: new Date(),
    });

    // Trigger event
    this.triggerEvent("productAdded", product);

    return addedProduct;
  }

  // Method to get change history
  getChangeHistory() {
    return this.changeLog;
  }

  // Method to log changes
  logChange(change) {
    this.changeLog.push(change);
  }

  // Example method for updating a product
  updateProduct(productId, updates) {
    const updatedProduct = super.updateProduct(productId, updates);

    // Log the change
    this.logChange({
      type: "productUpdated",
      details: { productId, updates },
      timestamp: new Date(),
    });

    // Trigger event
    this.triggerEvent("productUpdated", { productId, updates });

    return updatedProduct;
  }

  // Example method for deleting a product
  deleteProduct(productId) {
    const deletedProduct = super.deleteProduct(productId);

    // Log the change
    this.logChange({
      type: "productDeleted",
      details: { productId },
      timestamp: new Date(),
    });

    // Trigger event
    this.triggerEvent("productDeleted", { productId });

    return deletedProduct;
  }
}

export default ShoppingListManager;
