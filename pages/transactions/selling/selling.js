// script.js
document.addEventListener("DOMContentLoaded", () => {
  const searchForm = document.getElementById("search-form");
  const searchInput = document.getElementById("search-input");
  const searchResults = document.getElementById("search-results");
  const resultsList = document.getElementById("results-list");

  let debounceTimer;

  searchInput.addEventListener("input", () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      const searchTerm = searchInput.value.trim();
      if (searchTerm.length > 0) {
        fetchSearchResults(searchTerm);
      } else {
        searchResults.classList.add("hidden");
      }
    }, 300);
  });

  searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const searchTerm = searchInput.value.trim();
    if (searchTerm.length > 0) {
      performSearch(searchTerm);
    }
  });

  async function fetchSearchResults(searchTerm) {
    try {
      const results = await window.electronAPI.products.searchProducts(
        searchTerm
      );
      console.log("Search results:", results); // Log the search results

      displayResults(results);
    } catch (error) {
      console.error("Error fetching search results:", error);
    }
  }

  function displayResults(results) {
    resultsList.innerHTML = "";
    if (results.length > 0) {
      results.forEach((result) => {
        const li = document.createElement("li");
        li.textContent = result.name; // Adjust according to your data structure
        li.addEventListener("click", () => {
          searchInput.value = result.name;
          searchResults.classList.add("hidden");
          performSearch(result.name);
        });
        resultsList.appendChild(li);
      });
      searchResults.classList.remove("hidden");
    } else {
      searchResults.classList.add("hidden");
    }
  }

  function performSearch(searchTerm) {
    // Implement your search logic here
    console.log("Performing search for:", searchTerm);
    // You might want to redirect to a search results page or update the current page
  }

  // Close the search results when clicking outside
  document.addEventListener("click", (e) => {
    if (!searchForm.contains(e.target) && !searchResults.contains(e.target)) {
      searchResults.classList.add("hidden");
    }
  });
});
