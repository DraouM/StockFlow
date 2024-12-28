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
  }

  populate(givenList = []) {
    if (!Array.isArray(givenList)) {
      throw new Error("Given list must be an array");
    }
    console.log("Shopping List Populated ", givenList);
    this.shoppingList.populate(givenList);
    this.originalList = [...this.shoppingList.shoppingList];
    this.listeners.listPopulated.forEach((listener) =>
      listener(this.originalList)
    );
  }

  addProduct(product) {
    console.log("Adding Product ", product);
    this.shoppingList.addProduct(product);
    this.changeLog.push({ type: "add", product });
    // this.listeners.productAdded.forEach((listener) => listener(product));
  }

  // deleteProduct(productTempId) {
  //   console.log("Deleting Product ", productTempId);
  //   const product = this.originalList.find(
  //     (product) => product.tempId === productTempId
  //   );
  //   console.log({ product });

  //   if (product) {
  //     this.shoppingList.deleteProduct(productTempId);

  //     this.changeLog.push({ type: "delete", product });
  //     // this.listeners.productDeleted.forEach((listener) => listener(product));
  //   }
  // }

  log() {
    console.log("Original List ", this.originalList);
    console.log("Change Log ", this.changeLog);
  }
}

export default ShoppingListManager;
