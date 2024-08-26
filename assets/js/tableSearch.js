function searchTable(tableId, searchTerm) {
  const table = document.getElementById(tableId);
  const rows = Array.from(table.getElementsByTagName("tr")).slice(1); // Skip header row
  const lowerCaseSearchTerm = searchTerm.toLowerCase();

  rows.forEach((row) => {
    const cells = Array.from(row.getElementsByTagName("td"));
    const matches = cells.some((cell) =>
      cell.innerText.toLowerCase().includes(lowerCaseSearchTerm)
    );

    if (matches) {
      row.style.display = "";
      animateRow(row);
    } else {
      row.style.display = "none";
    }
  });
}

function animateRow(row) {
  row.style.transition = "background-color 0.5s ease";
  row.style.backgroundColor = "yellow";
  setTimeout(() => {
    row.style.backgroundColor = "";
  }, 500);
}
