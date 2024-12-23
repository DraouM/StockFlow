import ShoppingList from "./ShoppingList.js";

class ShoppingListManager {
  constructor(shoppingList) {
    if (!(shoppingList instanceof ShoppingList)) {
      throw new Error("ShoppingListManager requires a ShoppingList instance");
    }

    this.shoppingList = shoppingList;
    this.originalList = [];
    this.changeLog = [];
    this.listeners = {
      productAdded: [],
      productUpdated: [],
      productDeleted: [],
      listPopulated: [],
    };

    // Bind the shopping list methods to track changes
    this.initializeTracking();
  }

  initializeTracking() {
    // Store original methods
    const originalAddProduct = this.shoppingList.addProduct.bind(
      this.shoppingList
    );
    const originalUpdateProduct = this.shoppingList.updateProduct.bind(
      this.shoppingList
    );
    const originalDeleteProduct = this.shoppingList.deleteProduct.bind(
      this.shoppingList
    );

    // Override addProduct
    this.shoppingList.addProduct = (product) => {
      const existingProduct = this.originalList.find(
        (item) => item.productId === product.productId
      );

      const result = originalAddProduct(product);

      this.logChange({
        type: existingProduct ? "MODIFY_PRODUCT" : "ADD_PRODUCT",
        timestamp: new Date(),
        product: { ...product },
        originalProduct: existingProduct ? { ...existingProduct } : null,
      });

      this.triggerEvent("productAdded", {
        product,
        isModification: !!existingProduct,
      });

      return result;
    };

    // Override updateProduct
    this.shoppingList.updateProduct = (tempId, updates) => {
      const originalItem = this.shoppingList.shoppingList.find(
        (item) => item.tempId === tempId
      );

      const result = originalUpdateProduct(tempId, updates);

      this.logChange({
        type: "UPDATE_PRODUCT",
        timestamp: new Date(),
        tempId,
        originalState: { ...originalItem },
        updates: { ...updates },
      });

      this.triggerEvent("productUpdated", { tempId, updates, originalItem });

      return result;
    };

    // Override deleteProduct
    this.shoppingList.deleteProduct = (tempId) => {
      const itemToDelete = this.shoppingList.shoppingList.find(
        (item) => item.tempId === tempId
      );
      const wasInOriginalList = this.originalList.some(
        (item) => item.productId === itemToDelete?.productId
      );

      const result = originalDeleteProduct(tempId);

      this.logChange({
        type: wasInOriginalList ? "REMOVE_ORIGINAL" : "DELETE_ADDED",
        timestamp: new Date(),
        deletedItem: { ...itemToDelete },
      });

      this.triggerEvent("productDeleted", {
        tempId,
        item: itemToDelete,
        wasOriginal: wasInOriginalList,
      });

      return result;
    };
  }

  populate(items) {
    // Create deep copies with generated tempIds
    this.originalList = items.map((item) => ({
      ...item,
      tempId: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    }));

    this.logChange({
      type: "POPULATE",
      timestamp: new Date(),
      items: [...this.originalList],
    });

    this.shoppingList.populate(this.originalList);
    this.triggerEvent("listPopulated", { items: this.originalList });
  }

  on(eventName, callback) {
    if (this.listeners[eventName]) {
      this.listeners[eventName].push(callback);
      return () => this.off(eventName, callback); // Return unsubscribe function
    } else {
      console.warn(`Event ${eventName} is not supported`);
    }
  }

  off(eventName, callback) {
    if (this.listeners[eventName]) {
      this.listeners[eventName] = this.listeners[eventName].filter(
        (cb) => cb !== callback
      );
    }
  }

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

  getChangeHistory() {
    return [...this.changeLog];
  }

  logChange(change) {
    this.changeLog.push({
      ...change,
      listSnapshot: this.shoppingList.shoppingList.map((item) => ({ ...item })),
    });
  }

  getDifferences() {
    const currentList = this.shoppingList.shoppingList;

    const added = currentList.filter(
      (current) =>
        !this.originalList.some(
          (original) => original.productId === current.productId
        )
    );

    const removed = this.originalList.filter(
      (original) =>
        !currentList.some((current) => current.productId === original.productId)
    );

    const modified = currentList.filter((current) => {
      const original = this.originalList.find(
        (item) => item.productId === current.productId
      );
      if (!original) return false;

      return (
        JSON.stringify({
          quantity: current.quantity,
          unitPrice: current.unitPrice,
          subUnits: current.subUnits,
        }) !==
        JSON.stringify({
          quantity: original.quantity,
          unitPrice: original.unitPrice,
          subUnits: original.subUnits,
        })
      );
    });

    return { added, removed, modified };
  }

  getChangeSummary() {
    const differences = this.getDifferences();
    return {
      totalChanges: this.changeLog.length,
      itemsAdded: differences.added.length,
      itemsRemoved: differences.removed.length,
      itemsModified: differences.modified.length,
      lastChangeTimestamp: this.changeLog[this.changeLog.length - 1]?.timestamp,
    };
  }
}

export default ShoppingListManager;
