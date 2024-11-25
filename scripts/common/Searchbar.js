class Searchbar {
  constructor(
    searchInputId,
    resultsListId,
    searchFormId,
    searchResultsId,
    fetchFunction,
    onSelectCallback
  ) {
    this.searchInput = document.getElementById(searchInputId);
    this.resultsList = document.getElementById(resultsListId);
    this.searchForm = document.getElementById(searchFormId);
    this.searchResults = document.getElementById(searchResultsId);
    this.fetchFunction = fetchFunction; // Function to fetch search results from database
    this.onSelectCallback = onSelectCallback; // Callback for handling selected result
    this.debounceTimer = null;

    this.init();
  }

  init() {
    // Initialize event listeners
    this.searchInput.addEventListener("input", () => this.handleInput());
    this.searchForm.addEventListener("submit", (e) => this.handleSubmit(e));
    document.addEventListener("click", (e) => this.handleClickOutside(e));
  }

  handleInput() {
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      const searchTerm = this.searchInput.value.trim();
      if (searchTerm.length > 0) {
        this.fetchResults(searchTerm);
      } else {
        this.hideResults();
      }
    }, 300);
  }

  handleSubmit(e) {
    e.preventDefault();
    const searchTerm = this.searchInput.value.trim();
    if (searchTerm.length > 0) {
      this.fetchResults(searchTerm);
    }
  }

  async fetchResults(searchTerm) {
    console.log("Search.. ", searchTerm);

    try {
      const results = await this.fetchFunction(searchTerm);
      console.log("Result from fetching..", results);

      if (results.length === 0) {
        this.displayNoResultsMessage();
      } else {
        this.displayResults(results.data);
      }
    } catch (error) {
      this.displayErrorMessage("An error occurred while fetching results.");
      console.error("Error fetching search results:", error);
    }
  }

  displayResults(results) {
    this.resultsList.innerHTML = "";
    results.forEach((result) => {
      const li = document.createElement("li");
      li.textContent = result.name; // Adjust based on your data structure
      li.addEventListener("click", () => {
        this.searchInput.value = result.name;
        this.hideResults();
        this.onSelectCallback(result); // Call the callback with selected result
      });
      this.resultsList.appendChild(li);
    });
    this.showResults();
  }

  displayNoResultsMessage() {
    this.resultsList.innerHTML = ""; // Clear previous results
    const message = document.createElement("li");
    message.textContent = "No products found.";
    message.classList.add("no-results-message");
    this.resultsList.appendChild(message);
    this.showResults();
  }

  displayErrorMessage(message) {
    this.resultsList.innerHTML = ""; // Clear previous results
    const errorMessage = document.createElement("li");
    errorMessage.textContent = message;
    errorMessage.classList.add("error-message");
    this.resultsList.appendChild(errorMessage);
    this.showResults();
  }

  showResults() {
    this.searchResults.classList.remove("hidden");
  }

  hideResults() {
    this.searchResults.classList.add("hidden");
  }

  handleClickOutside(e) {
    if (
      !this.searchForm.contains(e.target) &&
      !this.searchResults.contains(e.target)
    ) {
      this.hideResults();
    }
  }
}
