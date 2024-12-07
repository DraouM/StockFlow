// Example preload script
window.addEventListener("DOMContentLoaded", () => {
  console.log("Preload script loaded");
});

const { contextBridge, ipcRenderer } = require("electron");

// contextBridge.exposeInMainWorld("electronAPI", {
//   products: {
//     getAll: () => ipcRenderer.invoke("products-get-all"),
//     getById: (id) => ipcRenderer.invoke("products:getById", id),
//     create: (productData) => ipcRenderer.invoke("products-create", productData),
//     update: (id, productData) =>
//       ipcRenderer.invoke("products-update", id, productData),
//     delete: (id) => ipcRenderer.invoke("products:delete", id),
//     searchProducts: (searchTerm) =>
//       ipcRenderer.invoke("products.search", searchTerm), // <--- NEW LINE ADDED HERE
//   },
//   transactions: {
//     getAll: () => ipcRenderer.invoke("transactions-get-all"),
//     getById: (id) => ipcRenderer.invoke("transactions-get-by-id", id),
//     create: (transactionData) =>
//       ipcRenderer.invoke("transactions-create", transactionData),

//     update: (id, transactionData) => {
//       console.log(
//         "STEP B => Data received in preload script:",
//         id,
//         transactionData
//       ); // Debug log

//       console.log(
//         "Data received in preload before invoking IPC (UPDATE):",
//         id,
//         transactionData
//       );
//       return ipcRenderer.invoke("transactions-update", id, transactionData);
//     },

//     delete: (id) => ipcRenderer.invoke("transactions-delete", id),
//     getByDateRange: (startDate, endDate, type) =>
//       ipcRenderer.invoke(
//         "transactions-get-by-date-range",
//         startDate,
//         endDate,
//         type
//       ),
//     getTotalAmountByType: (type, startDate, endDate) =>
//       ipcRenderer.invoke(
//         "transactions-get-total-amount-by-type",
//         type,
//         startDate,
//         endDate
//       ),
//     settle: (id) => ipcRenderer.invoke("transactions-settle", id),
//     getUnsettled: (partyId = null) =>
//       ipcRenderer.invoke("transactions-get-unsettled", partyId),
//   },
// });

// Expose parties API to renderer process
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
  // Get all transactions
  getAllTransactions: async () => {
    return await ipcRenderer.invoke("get-all-transactions");
  },

  // Get a transaction by ID
  getTransactionById: async (transactionId) => {
    return await ipcRenderer.invoke("get-transaction-by-id", transactionId);
  },

  // Create a new transaction
  createTransaction: async (transactionData) => {
    return await ipcRenderer.invoke("create-transaction", transactionData);
  },

  // Update a transaction
  updateTransaction: async (transactionData) => {
    return await ipcRenderer.invoke("update-transaction", transactionData);
  },

  // Delete a transaction
  deleteTransaction: async (transactionId) => {
    return await ipcRenderer.invoke("delete-transaction", transactionId);
  },

  // Get all transaction details for a specific transaction
  getTransactionDetails: async (transactionId) => {
    return await ipcRenderer.invoke("get-transaction-details", transactionId);
  },

  // Create a new transaction detail
  createTransactionDetail: async (detailData) => {
    return await ipcRenderer.invoke("create-transaction-detail", detailData);
  },

  // Update a transaction detail
  updateTransactionDetail: async (detailData) => {
    return await ipcRenderer.invoke("update-transaction-detail", detailData);
  },

  // Delete a transaction detail
  deleteTransactionDetail: async (detailId) => {
    return await ipcRenderer.invoke("delete-transaction-detail", detailId);
  },
};

// Expose the transactions API to the renderer process
contextBridge.exposeInMainWorld("transactionsAPI", transactionsAPI);
