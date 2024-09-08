// Function to load sidebar content
async function loadSidebar() {
  const response = await fetch(
    "/home/mohamed/Documents/Projects/StockFlow/pages/common/sidebar.html"
  ); // Make sure the path is correct
  const sidebarHTML = await response.text();
  document.getElementById("sidebar").innerHTML = sidebarHTML;
}

loadSidebar();
