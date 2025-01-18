import ShoppingList from "./ShoppingList.js"; // Assuming ShoppingList is defined
import ShoppingListManager from "./ShoppingListManager.js";

describe("ShoppingListManager", () => {
  let shoppingList;
  let manager;

  beforeEach(() => {
    shoppingList = new ShoppingList();
    manager = new ShoppingListManager(shoppingList);
  });

  test("should initialize with a valid ShoppingList instance", () => {
    expect(manager.shoppingList).toBe(shoppingList);
  });

  test("should throw an error when initialized with an invalid object", () => {
    expect(() => new ShoppingListManager({})).toThrow(
      "ShoppingListManager requires a ShoppingList instance"
    );
  });

  test("should populate the shopping list with valid products", () => {
    const products = [
      { tempId: 1, name: "Apple" },
      { tempId: 2, name: "Banana" },
    ];
    manager.populate(products);
    expect(manager.originalList).toEqual(products);
  });

  test("should throw an error when populating with a non-array", () => {
    expect(() => manager.populate("not an array")).toThrow(
      "Given list must be an array"
    );
  });

  test("should add a product to the shopping list", () => {
    const product = { tempId: 3, name: "Orange" };
    manager.addProduct(product);
    expect(manager.shoppingList.shoppingList).toContainEqual(product);
    expect(manager.changeLog).toContainEqual({
      type: "add",
      newProduct: product,
    });
  });

  test("should delete a product from the shopping list", () => {
    const product = { tempId: 4, name: "Grapes" };
    manager.addProduct(product);
    manager.deleteProduct(product.tempId);
    expect(manager.shoppingList.shoppingList).not.toContainEqual(product);
    expect(manager.changeLog).toContainEqual({ type: "delete", product });
  });

  test("should handle deletion of a non-existent product gracefully", () => {
    const initialLength = manager.shoppingList.shoppingList.length;
    manager.deleteProduct(999); // Assuming 999 does not exist
    expect(manager.shoppingList.shoppingList.length).toBe(initialLength); // Length should remain the same
  });

  test("should log the original list and change log", () => {
    manager.log(); // Check console output manually or use a spy to capture console.log
  });
});
