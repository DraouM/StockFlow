// Example preload script
window.addEventListener("DOMContentLoaded", () => {
  console.log("Preload script loaded");
});

const { contextBridge, ipcRenderer } = require("electron");
contextBridge.exposeInMainWorld("partiesAPI", {
  getAllParties: (req) => ipcRenderer.invoke("parties:getAll", req),
  getPartyById: (partyId) => ipcRenderer.invoke("parties:getById", partyId),
  createParty: (partyData) => ipcRenderer.invoke("parties:create", partyData),
  updateParty: (partyId, updateData) =>
    ipcRenderer.invoke("parties:update", { partyId, updateData }),
  deleteParty: (partyId) => ipcRenderer.invoke("parties:delete", partyId),
  searchParties: (req) => ipcRenderer.invoke("parties:search", req),
  getPartiesByType: (params) => {
    console.log("Preload received params:", params); // Debug log
    return ipcRenderer.invoke("parties:getByType", params);
  },

  getPartyDebt: (partyId) => ipcRenderer.invoke("parties:getDebt", partyId),
  cleanup: () => ipcRenderer.invoke("parties:cleanup"),
});

// Expose parties API to renderer process
contextBridge.exposeInMainWorld("productsAPI", {
  createProduct: (productData) =>
    ipcRenderer.invoke("create-product", productData),
  listProducts: (filters) => ipcRenderer.invoke("list-products", filters),
  updateProduct: (data) => ipcRenderer.invoke("update-product", data),
  fetchSingleProduct: (id) => ipcRenderer.invoke("fetch-single-product", id),
  searchProduct: (searchTerm) =>
    ipcRenderer.invoke("search-products", searchTerm),
  // searchProduct: (searchTerm, filters) => ipcRenderer.invoke("search-product", searchTerm, filters),
});

// contextBridge.exposeInIsolatedWorld("transactionsAPI", {});

const transactionsAPI = {
  createTransaction: async (transaction) => {
    try {
      const result = await ipcRenderer.invoke(
        "create-transaction",
        transaction
      );
      return result;
    } catch (error) {
      console.error("Error in createTransaction:", error);
      return { success: false, error: error.message };
    }
  },

  getAllTransactions: async (page = 1, limit = 50) => {
    try {
      const result = await ipcRenderer.invoke(
        "get-all-transactions",
        page,
        limit
      );
      return result;
    } catch (error) {
      console.error("Error in getAllTransactions:", error);
      return { success: false, error: error.message };
    }
  },

  getTransactionById: async (transactionId) => {
    try {
      const result = await ipcRenderer.invoke(
        "get-transaction-by-id",
        transactionId
      );
      return result;
    } catch (error) {
      console.error("Error in getTransactionById:", error);
      return { success: false, error: error.message };
    }
  },

  updateTransaction: async (transactionId, updates) => {
    try {
      const result = await ipcRenderer.invoke(
        "update-transaction",
        transactionId,
        updates
      );
      return result;
    } catch (error) {
      console.error("Error in updateTransaction:", error);
      return { success: false, error: error.message };
    }
  },

  deleteTransaction: async (transactionId) => {
    try {
      const result = await ipcRenderer.invoke(
        "delete-transaction",
        transactionId
      );
      return result;
    } catch (error) {
      console.error("Error in deleteTransaction:", error);
      return { success: false, error: error.message };
    }
  },

  createTransactionDetail: async (transactionDetail) => {
    try {
      const result = await ipcRenderer.invoke(
        "create-transaction-detail",
        transactionDetail
      );
      return result;
    } catch (error) {
      console.error("Error in createTransactionDetail:", error);
      return { success: false, error: error.message };
    }
  },

  getAllTransactionDetails: async (page = 1, limit = 50) => {
    try {
      const result = await ipcRenderer.invoke(
        "get-all-transaction-details",
        page,
        limit
      );
      return result;
    } catch (error) {
      console.error("Error in getAllTransactionDetails:", error);
      return { success: false, error: error.message };
    }
  },

  getTransactionDetailsByTransactionId: async (transactionId) => {
    try {
      const result = await ipcRenderer.invoke(
        "get-transaction-details-by-transaction-id",
        transactionId
      );
      return result;
    } catch (error) {
      console.error("Error in getTransactionDetailsByTransactionId:", error);
      return { success: false, error: error.message };
    }
  },

  updateTransactionDetail: async (transactionDetailId, updates) => {
    try {
      const result = await ipcRenderer.invoke(
        "update-transaction-detail",
        transactionDetailId,
        updates
      );
      return result;
    } catch (error) {
      console.error("Error in updateTransactionDetail:", error);
      return { success: false, error: error.message };
    }
  },

  deleteTransactionDetail: async (transactionDetailId) => {
    try {
      const result = await ipcRenderer.invoke(
        "delete-transaction-detail",
        transactionDetailId
      );
      return result;
    } catch (error) {
      console.error("Error in deleteTransactionDetail:", error);
      return { success: false, error: error.message };
    }
  },
};

// Expose the transactions API to the renderer process
contextBridge.exposeInMainWorld("transactionsAPI", transactionsAPI);
