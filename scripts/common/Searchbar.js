class SearchBar {
  constructor(container) {
    this.container = container;
    this.searchForm = container.querySelector("#search-form");
    this.searchInput = container.querySelector("#search-input");
    this.searchResults = container.querySelector("#search-results");
    this.resultsList = container.querySelector("#results-list");
    this.apiUrl = container.getAttribute("data-api-url");

    this.debounceTimer;
    this.setupEventListeners();
  }

  setupEventListeners() {
    this.searchInput.addEventListener("input", () => {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(() => {
        const searchTerm = this.searchInput.value.trim();
        if (searchTerm.length > 0) {
          this.fetchSearchResults(searchTerm);
        } else {
          this.searchResults.classList.add("hidden");
        }
      }, 300);
    });

    this.searchForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const searchTerm = this.searchInput.value.trim();
      if (searchTerm.length > 0) {
        this.performSearch(searchTerm);
      }
    });

    document.addEventListener("click", (e) => {
      if (
        !this.searchForm.contains(e.target) &&
        !this.searchResults.contains(e.target)
      ) {
        this.searchResults.classList.add("hidden");
      }
    });
  }

  async fetchSearchResults(searchTerm) {
    try {
      const response = await fetch(
        `${this.apiUrl}?term=${encodeURIComponent(searchTerm)}`
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      this.displayResults(data);
    } catch (error) {
      console.error("Error fetching search results:", error);
    }
  }

  displayResults(results) {
    this.resultsList.innerHTML = "";
    if (results.length > 0) {
      results.forEach((result) => {
        const li = document.createElement("li");
        li.textContent = result.name; // Adjust as necessary
        li.addEventListener("click", () => {
          this.searchInput.value = result.name;
          this.searchResults.classList.add("hidden");
          this.performSearch(result.name);
        });
        this.resultsList.appendChild(li);
      });
      this.searchResults.classList.remove("hidden");
    } else {
      this.searchResults.classList.add("hidden");
    }
  }

  performSearch(searchTerm) {
    console.log("Performing search for:", searchTerm);
    // Implement search logic here
  }
}

// Initialize search bar instances
document.addEventListener("DOMContentLoaded", () => {
  const searchContainers = document.querySelectorAll(".search-container");
  searchContainers.forEach((container) => new SearchBar(container));
});
