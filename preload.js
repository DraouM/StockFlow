// Example preload script
window.addEventListener("DOMContentLoaded", () => {
  console.log("Preload script loaded");
});

const { contextBridge, ipcRenderer } = require("electron");
contextBridge.exposeInMainWorld("electronAPI", {
  products: {
    getAll: () => ipcRenderer.invoke("products-get-all"),
    getById: (id) => ipcRenderer.invoke("products:getById", id),
    create: (productData) => ipcRenderer.invoke("products:create", productData),
    update: (id, productData) =>
      ipcRenderer.invoke("products:update", id, productData),
    delete: (id) => ipcRenderer.invoke("products:delete", id),
  },
  transactions: {
    getAll: () => ipcRenderer.invoke("transactions-get-all"),
    getById: (id) => ipcRenderer.invoke("transactions:getById", id),
    create: (transactionData) =>
      ipcRenderer.invoke("transactions:create", transactionData),
    update: (id, transactionData) =>
      ipcRenderer.invoke("transactions:update", id, transactionData),
    delete: (id) => ipcRenderer.invoke("transactions:delete", id),
    getByDateRange: (startDate, endDate, type) =>
      ipcRenderer.invoke(
        "transactions:getByDateRange",
        startDate,
        endDate,
        type
      ),
    getTotalAmountByType: (type, startDate, endDate) =>
      ipcRenderer.invoke(
        "transactions:getTotalAmountByType",
        type,
        startDate,
        endDate
      ),
    settle: (id) => ipcRenderer.invoke("transactions:settle", id),
    getUnsettled: (partyId = null) =>
      ipcRenderer.invoke("transactions:getUnsettled", partyId),
  },
  parties: {
    getAll: () => ipcRenderer.invoke("parties-get-all"),
    getById: (id) => ipcRenderer.invoke("parties:getById", id),
    create: (partyData) => ipcRenderer.invoke("parties:create", partyData),
    update: (id, partyData) =>
      ipcRenderer.invoke("parties:update", id, partyData),
    delete: (id) => ipcRenderer.invoke("parties:delete", id),
  },
});
