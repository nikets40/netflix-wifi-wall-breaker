// Popup script for Netflix WiFi Wall Breaker
document.addEventListener("DOMContentLoaded", function () {
  const statusIndicator = document.getElementById("statusIndicator");
  const statusText = document.getElementById("statusText");
  const divsRemoved = document.getElementById("divsRemoved");
  const runsCount = document.getElementById("runsCount");
  const manualRunBtn = document.getElementById("manualRun");
  const checkStatusBtn = document.getElementById("checkStatus");

  // Check if we're on a Netflix page
  function checkNetflixPage() {
    return new Promise((resolve) => {
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        const currentTab = tabs[0];
        const isNetflix =
          currentTab.url &&
          (currentTab.url.includes("netflix.com") ||
            currentTab.url.includes("www.netflix.com"));
        resolve({ isNetflix, tab: currentTab });
      });
    });
  }

  // Update status display
  function updateStatus(isActive, message) {
    statusIndicator.className = isActive
      ? "status-indicator"
      : "status-indicator inactive";
    statusText.textContent = message;
  }

  // Get stats from content script
  function getStats() {
    return new Promise((resolve) => {
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        if (tabs[0]) {
          chrome.tabs.sendMessage(
            tabs[0].id,
            { action: "getStats" },
            function (response) {
              if (chrome.runtime.lastError) {
                resolve({ divsRemoved: 0, runsCount: 0 });
              } else {
                resolve(response || { divsRemoved: 0, runsCount: 0 });
              }
            }
          );
        } else {
          resolve({ divsRemoved: 0, runsCount: 0 });
        }
      });
    });
  }

  // Initialize popup
  async function init() {
    const { isNetflix, tab } = await checkNetflixPage();

    if (isNetflix) {
      updateStatus(true, "Active on Netflix");

      // Get stats
      const stats = await getStats();
      divsRemoved.textContent = stats.divsRemoved || 0;
      runsCount.textContent = stats.runsCount || 0;

      // Enable buttons
      manualRunBtn.disabled = false;
      checkStatusBtn.disabled = false;
    } else {
      updateStatus(false, "Not on Netflix");
      divsRemoved.textContent = "0";
      runsCount.textContent = "0";

      // Disable buttons
      manualRunBtn.disabled = true;
      checkStatusBtn.disabled = true;
    }
  }

  // Manual run button
  manualRunBtn.addEventListener("click", async function () {
    const { isNetflix, tab } = await checkNetflixPage();

    if (isNetflix) {
      chrome.tabs.sendMessage(
        tab.id,
        { action: "manualRun" },
        function (response) {
          if (chrome.runtime.lastError) {
            updateStatus(false, "Error: Content script not responding");
          } else {
            updateStatus(true, "Manual run executed");
            // Update stats after a short delay
            setTimeout(async () => {
              const stats = await getStats();
              divsRemoved.textContent = stats.divsRemoved || 0;
              runsCount.textContent = stats.runsCount || 0;
            }, 500);
          }
        }
      );
    }
  });

  // Check status button
  checkStatusBtn.addEventListener("click", async function () {
    const { isNetflix, tab } = await checkNetflixPage();

    if (isNetflix) {
      chrome.tabs.sendMessage(
        tab.id,
        { action: "checkStatus" },
        function (response) {
          if (chrome.runtime.lastError) {
            updateStatus(false, "Error: Content script not responding");
          } else {
            updateStatus(true, response.message || "Status checked");
            // Update stats
            if (response.stats) {
              divsRemoved.textContent = response.stats.divsRemoved || 0;
              runsCount.textContent = response.stats.runsCount || 0;
            }
          }
        }
      );
    }
  });

  // Initialize on load
  init();

  // Listen for messages from content script
  chrome.runtime.onMessage.addListener(function (
    request,
    sender,
    sendResponse
  ) {
    if (request.action === "updateStats") {
      divsRemoved.textContent = request.stats.divsRemoved || 0;
      runsCount.textContent = request.stats.runsCount || 0;
    }
  });
});
