## Transaction System Triggers

This file documents the triggers created for the transaction system, their purpose, and potential improvements.

### Trigger #1: `tr_update_transaction_on_insert`

- **Purpose:** This trigger is executed **after** a new entry is inserted into the `transaction_details` table. It ensures that the `transactions` and `products` tables are updated accordingly.

- **Logic:**

  - **Total Amount Update:** The `total_amount` field in the `transactions` table is updated to reflect the sum of `total_price` from all `transaction_details` associated with the transaction.
  - **Stock Adjustment:** The `total_stock` field in the `products` table is adjusted based on the `transaction_type`:
    - If the transaction type is 'sell', stock is decreased by the `quantity_selected`.
    - If the transaction type is 'buy', stock is increased by the `quantity_selected`.
  - **Product Status Update:** The `status` field in the `products` table is automatically updated based on the updated `total_stock`. If `total_stock` is greater than 0, the status is set to 'available'; otherwise, it's set to 'out_of_stock'.

- **Potential Improvements:**
  - **Subquery Optimization:** Instead of using subqueries within the `CASE` expressions, you can directly reference the `transaction_type` from the `NEW` row, which might improve performance.

### Trigger #2: `tr_update_transaction_on_update`

- **Purpose:** This trigger is executed **after** an existing entry in the `transaction_details` table is updated. It ensures that the `transactions` and `products` tables are updated to reflect the changes.

- **Logic:**

  - **Total Amount Update:** The `total_amount` field in the `transactions` table is updated based on the new values in `transaction_details`.
  - **Stock Adjustment:** The `total_stock` field in the `products` table is adjusted based on the difference between the old and new values of `quantity_selected`.
  - **Product Status Update:** The `status` field in the `products` table is updated based on the new `total_stock`.

- **Potential Improvements:**
  - **Conditional Update:** You could add a conditional statement to only update the stock and status if the `quantity_selected` has actually changed, preventing unnecessary updates.

### Trigger #3: `tr_update_transaction_on_delete`

- **Purpose:** This trigger is executed **after** an entry is deleted from the `transaction_details` table. It ensures that the `transactions` and `products` tables are updated correctly.

- **Logic:**

  - **Total Amount Update:** The `total_amount` field in the `transactions` table is updated based on the remaining `transaction_details` for the transaction.
  - **Stock Adjustment:** The `total_stock` field in the `products` table is adjusted based on the `transaction_type` and the quantity of the deleted entry.
  - **Product Status Update:** The `status` field in the `products` table is updated based on the new `total_stock`.

- **Potential Improvements:**
  - **Transaction Type Consistency:** You could verify that the `transaction_type` of the deleted row matches the current `transaction_type` in the `transactions` table to prevent potential errors if the type changes between deletion and update.
  - **Error Handling:** Include error handling mechanisms to prevent data corruption and ensure graceful handling of unexpected situations.

**Overall:**

These triggers are crucial for maintaining data integrity in your transaction system. Implementing these improvements and adding thorough error handling will ensure that your database operates efficiently and reliably.
