function sortTable(tableId, colIndex, type = "string", order = "asc") {
  const table = document.getElementById(tableId);
  const rows = Array.from(table.getElementsByTagName("tr")).slice(1); // Skip header row

  rows.sort((rowA, rowB) => {
    const cellA = rowA.getElementsByTagName("td")[colIndex].innerText;
    const cellB = rowB.getElementsByTagName("td")[colIndex].innerText;

    let comparison = 0;

    if (type === "number") {
      comparison = parseFloat(cellA) - parseFloat(cellB);
    } else {
      comparison = cellA.localeCompare(cellB);
    }

    return order === "asc" ? comparison : -comparison;
  });

  rows.forEach((row) => table.appendChild(row));

  // Update sorted column classes
  const headers = table.getElementsByTagName("th");
  Array.from(headers).forEach((header, index) => {
    header.classList.remove("sorted-asc", "sorted-dsc");
    if (index === colIndex) {
      header.classList.add(order === "asc" ? "sorted-asc" : "sorted-dsc");
    }
  });
}
// Helper function to toggle sorting order
function toggleSortOrder(currentOrder) {
  return currentOrder === "asc" ? "dsc" : "asc";
}
