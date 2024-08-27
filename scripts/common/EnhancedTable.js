class EnhancedTable {
  constructor(tableId, options = {}) {
    this.table = document.getElementById(tableId);
    this.options = {
      searchable: true,
      sortable: true,
      emptyMessage: "No data available",
      emptyImageSrc: "../assets/empty-table.png",
      ...options,
    };
    this.tbody = this.table.querySelector("tbody");
    this.thead = this.table.querySelector("thead");
    this.rows = Array.from(this.tbody.querySelectorAll("tr"));

    this.emptyMessage = document.getElementById(`${tableId}-empty-message`);

    this.init();
  }

  init() {
    if (this.options.searchable) {
      this.setupSearch();
    }
    if (this.options.sortable) {
      this.setupSort();
    }
    this.checkTableEmpty();
  }

  setupSearch() {
    const searchInput = document.createElement("input");
    searchInput.setAttribute("type", "text");
    searchInput.setAttribute("placeholder", "Search table...");
    searchInput.classList.add("table-search");
    this.table.parentNode.insertBefore(searchInput, this.table);

    searchInput.addEventListener("input", () =>
      this.searchTable(searchInput.value)
    );
  }

  searchTable(query) {
    const lowerQuery = query.toLowerCase();
    let visibleRowCount = 0;
    this.rows.forEach((row) => {
      const text = row.textContent.toLowerCase();
      const isVisible = text.includes(lowerQuery);
      row.style.display = isVisible ? "" : "none";
      if (isVisible) visibleRowCount++;
    });
    this.checkTableEmpty(visibleRowCount);
  }

  checkTableEmpty(visibleRowCount = this.rows.length) {
    if (visibleRowCount === 0) {
      this.emptyMessage.style.display = "block";
      this.table.style.display = "none";
    } else {
      this.emptyMessage.style.display = "none";
      this.table.style.display = "table";
    }
  }

  setupSort() {
    const headers = this.thead.querySelectorAll("th");
    headers.forEach((header, index) => {
      header.classList.add("sortable");
      header.addEventListener("click", () => this.sortTable(index));
    });
  }
  sortTable(columnIndex) {
    const direction = this.getSortDirection(columnIndex);
    const modifier = direction === "asc" ? 1 : -1;
    const newRows = Array.from(this.rows);

    newRows.sort((a, b) => {
      const aColText = a.querySelectorAll("td")[columnIndex].textContent.trim();
      const bColText = b.querySelectorAll("td")[columnIndex].textContent.trim();

      return aColText > bColText ? 1 * modifier : -1 * modifier;
    });

    while (this.tbody.firstChild) {
      this.tbody.removeChild(this.tbody.firstChild);
    }

    newRows.forEach((newRow) => this.tbody.appendChild(newRow));

    this.updateSortDirection(columnIndex);
  }

  getSortDirection(columnIndex) {
    const header = this.thead.querySelectorAll("th")[columnIndex];
    return header.classList.contains("asc") ? "desc" : "asc";
  }

  updateSortDirection(columnIndex) {
    const headers = this.thead.querySelectorAll("th");
    headers.forEach((header, index) => {
      if (index === columnIndex) {
        header.classList.toggle("asc");
        header.classList.toggle("desc");
      } else {
        header.classList.remove("asc", "desc");
      }
    });
  }
}
