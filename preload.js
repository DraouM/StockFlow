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
  // orders: {
  //   getRecent: () => ipcRenderer.invoke("orders:getRecent"),
  //   // Add more order methods here
  // },
  // Add more modules here
});
