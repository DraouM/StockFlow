# Electron IPC Data Flow Documentation

## Overview

This document outlines the data flow through different layers in our Electron application, specifically focusing on the IPC (Inter-Process Communication) chain.

## Data Flow Steps

### 1. Client-side Request

```javascript
// client.js
console.log("Client sending request with params:", { type, page, limit });
const response = await window.partiesAPI.getPartiesByType({
  type,
  page,
  limit,
});
```

- Starting point of the data flow
- Client makes request through the exposed API
- Parameters are packed into an object

### 2. Preload Bridge

```javascript
// preload.js
contextBridge.exposeInMainWorld("partiesAPI", {
  getPartiesByType: (params) => {
    console.log("Preload received params:", params);
    return ipcRenderer.invoke("parties:getByType", params);
  },
});
```

- Bridge between renderer and main process
- Securely exposes main process methods
- Passes parameters unchanged to IPC handler

### 3. IPC Handler (Main Process)

```javascript
// main.js
ipcMain.handle("parties:getByType", async (event, params) => {
  console.log("IPC handler received params:", params);
  const result = await partiesController.getPartiesByType(params);
  console.log("IPC handler got result:", result);
  return result;
});
```

- Receives request in main process
- Forwards to controller
- Returns response back to renderer

### 4. Controller Layer

```javascript
// partiesController.js
async getPartiesByType(params) {
    console.log("Controller received type:", type);
    const data = await Party.getByType(type);
    console.log("Controller response:", response);
    return {
        success: true,
        data: data || [],
        pagination: {
            currentPage: params.page || 1,
            pageSize: params.limit || 50
        }
    };
}
```

- Business logic layer
- Processes request parameters
- Calls model methods
- Formats response

### 5. Model Layer

```javascript
// party.js
async getByType(type, page = 1, limit = 50) {
    console.log("Model getByType called with:", type);
    const result = // database query
    console.log("Model found data:", result);
    return result;
}
```

- Data access layer
- Performs database operations
- Returns raw data

### 6. Response Flow

The data flows back through the same layers in reverse:

1. Model → Controller: Raw data
2. Controller → IPC Handler: Formatted response
3. IPC Handler → Preload: IPC response
4. Preload → Client: Final response

## Response Structure

```javascript
{
    success: boolean,
    data: Array,
    pagination: {
        currentPage: number,
        pageSize: number
    },
    error?: string
}
```

## Debugging Tips

To debug the data flow:

1. Check console logs at each step
2. Verify data structure consistency
3. Ensure proper error handling
4. Monitor IPC channel communication

## Common Issues

1. Undefined responses: Check if all layers return proper data
2. Data transformation: Verify data structure at each step
3. Error handling: Ensure errors are caught and formatted correctly
4. IPC timeout: Monitor response times in each layer

## Best Practices

1. Always use structured responses
2. Include proper error handling
3. Log important data transformations
4. Maintain consistent data format
5. Use type checking when possible
6. Handle edge cases (null, undefined)
