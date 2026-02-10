// Netflix WiFi Wall Breaker Content Script
// This script removes divs from the body until it reaches the div with id "appMountPoint"

(function () {
  "use strict";

  console.log("Netflix WiFi Wall Breaker: Content script loaded");

  // Statistics tracking
  let stats = {
    divsRemoved: 0,
    runsCount: 0,
  };

  // Video controls state
  let videoControls = null;
  let isVideoPage = false;
  let hideControlsTimeout = null;
  let isFullscreen = false;

  // Function to remove divs until appMountPoint
  function removeDivsUntilAppMountPoint() {
    const body = document.body;
    if (!body) {
      console.log("Netflix WiFi Wall Breaker: Body not found, retrying...");
      setTimeout(removeDivsUntilAppMountPoint, 1000);
      return;
    }

    // Check if appMountPoint already exists
    const appMountPoint = document.getElementById("appMountPoint");
    if (appMountPoint) {
      console.log(
        "Netflix WiFi Wall Breaker: appMountPoint found, processing...",
      );

      // Get all child nodes of body
      const bodyChildren = Array.from(body.childNodes);

      // Find the index of appMountPoint
      const appMountPointIndex = bodyChildren.findIndex(
        (child) => child.id === "appMountPoint",
      );

      if (appMountPointIndex !== -1) {
        // Remove all divs before appMountPoint
        let removedCount = 0;
        for (let i = 0; i < appMountPointIndex; i++) {
          const child = bodyChildren[i];
          if (child.nodeType === Node.ELEMENT_NODE && child.tagName === "DIV") {
            child.remove();
            removedCount++;
          }
        }

        // Update statistics
        stats.divsRemoved += removedCount;
        stats.runsCount++;

        console.log(
          `Netflix WiFi Wall Breaker: Removed ${removedCount} divs before appMountPoint`,
        );

        // Also remove any non-div elements before appMountPoint
        let nonDivRemovedCount = 0;
        for (let i = 0; i < appMountPointIndex; i++) {
          const child = bodyChildren[i];
          if (child.nodeType === Node.ELEMENT_NODE && child.tagName !== "DIV") {
            child.remove();
            nonDivRemovedCount++;
          }
        }

        if (nonDivRemovedCount > 0) {
          console.log(
            `Netflix WiFi Wall Breaker: Also removed ${nonDivRemovedCount} non-div elements`,
          );
        }
      }
    } else {
      console.log(
        "Netflix WiFi Wall Breaker: appMountPoint not found yet, retrying...",
      );
      // Retry after a short delay
      setTimeout(removeDivsUntilAppMountPoint, 500);
    }
  }

  // Check if current page is a video watch page
  function isVideoWatchPage() {
    return window.location.pathname.startsWith("/watch/");
  }

  // Create Netflix-style video controls
  function createVideoControls() {
    if (videoControls) {
      videoControls.remove();
    }

    const controls = document.createElement("div");
    controls.id = "netflix-wifi-wall-breaker-controls";
    controls.innerHTML = `
      <div class="controls-container">
                 <div class="controls-top">
           <div class="controls-left">
             <button class="control-btn back-btn" title="Back">
               <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                 <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
               </svg>
             </button>
           </div>
         </div>
                 <div class="controls-center">
           <div class="play-controls-container">
             <button class="control-btn play-pause-btn" title="Play/Pause">
               <svg class="play-icon" width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                 <path d="M8 5v14l11-7z"/>
               </svg>
               <svg class="pause-icon" width="48" height="48" viewBox="0 0 24 24" fill="currentColor" style="display: none;">
                 <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
               </svg>
             </button>
           </div>
         </div>
        <div class="controls-bottom">
          <div class="progress-container">
            <div class="progress-bar">
              <div class="progress-filled"></div>
              <div class="progress-handle"></div>
            </div>
            <div class="time-display">
              <span class="current-time">0:00</span>
              <span class="duration">0:00</span>
            </div>
          </div>
                     <div class="controls-actions">
             <button class="control-btn fullscreen-btn" title="Fullscreen">
               <svg class="fullscreen-enter" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                 <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
               </svg>
               <svg class="fullscreen-exit" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" style="display: none;">
                 <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/>
               </svg>
             </button>
           </div>
        </div>
      </div>
    `;

    // Add Netflix-style CSS
    const style = document.createElement("style");
    style.textContent = `
      #netflix-wifi-wall-breaker-controls {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 999999;
        pointer-events: none;
        transition: opacity 0.3s ease;
        opacity: 0;
      }

      /* When in fullscreen mode */
      #netflix-wifi-wall-breaker-controls.fullscreen {
        position: absolute;
        width: 100%;
        height: 100%;
      }

      #netflix-wifi-wall-breaker-controls.visible {
        opacity: 1;
        cursor: auto;
      }

      #netflix-wifi-wall-breaker-controls {
        cursor: none;
      }

      #netflix-wifi-wall-breaker-controls .controls-container {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(to bottom, 
          rgba(0,0,0,0.7) 0%, 
          rgba(0,0,0,0) 20%, 
          rgba(0,0,0,0) 80%, 
          rgba(0,0,0,0.7) 100%);
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        padding: 20px;
      }

      #netflix-wifi-wall-breaker-controls .controls-top {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      #netflix-wifi-wall-breaker-controls .controls-center {
        display: flex;
        justify-content: center;
        align-items: center;
      }

      #netflix-wifi-wall-breaker-controls .controls-bottom {
        display: flex;
        flex-direction: column;
        gap: 20px;
      }

      #netflix-wifi-wall-breaker-controls .control-btn {
        background: rgba(0,0,0,0.5);
        border: none;
        border-radius: 50%;
        width: 48px;
        height: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        color: white;
        transition: all 0.2s ease;
        backdrop-filter: blur(10px);
        pointer-events: auto;
      }

      #netflix-wifi-wall-breaker-controls .control-btn:hover {
        background: rgba(255,255,255,0.2);
        transform: scale(1.1);
      }

             #netflix-wifi-wall-breaker-controls .play-controls-container {
         display: flex;
         align-items: center;
         gap: 20px;
       }

       #netflix-wifi-wall-breaker-controls .play-pause-btn {
         width: 80px;
         height: 80px;
         background: rgba(0,0,0,0.7);
       }



      #netflix-wifi-wall-breaker-controls .progress-container {
        display: flex;
        flex-direction: column;
        gap: 10px;
        pointer-events: auto;
      }

             #netflix-wifi-wall-breaker-controls .progress-bar {
         position: relative;
         height: 4px;
         background: rgba(255,255,255,0.3);
         border-radius: 2px;
       }

      #netflix-wifi-wall-breaker-controls .progress-filled {
        height: 100%;
        background: #e50914;
        border-radius: 2px;
        width: 0%;
        transition: width 0.1s ease;
      }

      #netflix-wifi-wall-breaker-controls .progress-handle {
        position: absolute;
        top: 50%;
        left: 0%;
        width: 12px;
        height: 12px;
        background: #e50914;
        border-radius: 50%;
        transform: translate(-50%, -50%);
        opacity: 0;
        transition: opacity 0.2s ease;
      }

             #netflix-wifi-wall-breaker-controls .progress-handle {
         opacity: 0;
       }

      #netflix-wifi-wall-breaker-controls .time-display {
        display: flex;
        justify-content: space-between;
        color: white;
        font-family: 'Netflix Sans', Arial, sans-serif;
        font-size: 14px;
        font-weight: 500;
      }

      #netflix-wifi-wall-breaker-controls .controls-actions {
        display: flex;
        gap: 10px;
        justify-content: flex-end;
      }

      #netflix-wifi-wall-breaker-controls .back-btn {
        background: rgba(0,0,0,0.7);
        width: 40px;
        height: 40px;
      }

      #netflix-wifi-wall-breaker-controls .fullscreen-btn {
        background: rgba(0,0,0,0.7);
        width: 40px;
        height: 40px;
      }

      #netflix-wifi-wall-breaker-controls .fullscreen-enter,
      #netflix-wifi-wall-breaker-controls .fullscreen-exit {
        transition: display 0.2s ease;
      }
    `;

    document.head.appendChild(style);
    document.body.appendChild(controls);
    videoControls = controls;

    // Add event listeners
    setupVideoControlEvents();
  }

  // Setup video control event listeners
  function setupVideoControlEvents() {
    if (!videoControls) return;

    const playPauseBtn = videoControls.querySelector(".play-pause-btn");
    const backBtn = videoControls.querySelector(".back-btn");
    const fullscreenBtn = videoControls.querySelector(".fullscreen-btn");
    const progressBar = videoControls.querySelector(".progress-bar");
    const progressFilled = videoControls.querySelector(".progress-filled");
    const progressHandle = videoControls.querySelector(".progress-handle");
    const currentTimeSpan = videoControls.querySelector(".current-time");
    const durationSpan = videoControls.querySelector(".duration");

    // Play/Pause
    playPauseBtn.addEventListener("click", () => {
      const video = document.querySelector("video");
      if (video) {
        if (video.paused) {
          video.play();
        } else {
          video.pause();
        }
      }
    });

    // Back button
    backBtn.addEventListener("click", () => {
      window.history.back();
    });

    // Fullscreen
    fullscreenBtn.addEventListener("click", () => {
      const video = document.querySelector("video");
      if (video) {
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else {
          video.parentElement.requestFullscreen();
        }
      }
    });

    // Update video state
    function updateVideoState() {
      const video = document.querySelector("video");
      if (!video) return;

      // Update play/pause icon
      const playIcon = playPauseBtn.querySelector(".play-icon");
      const pauseIcon = playPauseBtn.querySelector(".pause-icon");

      if (video.paused) {
        playIcon.style.display = "block";
        pauseIcon.style.display = "none";
      } else {
        playIcon.style.display = "none";
        pauseIcon.style.display = "block";
      }

      // Update progress
      if (video.duration) {
        const percent = (video.currentTime / video.duration) * 100;
        progressFilled.style.width = percent + "%";
        progressHandle.style.left = percent + "%";

        currentTimeSpan.textContent = formatTime(video.currentTime);
        durationSpan.textContent = formatTime(video.duration);
      }
    }

    // Format time
    function formatTime(seconds) {
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins}:${secs.toString().padStart(2, "0")}`;
    }

    // Update state periodically
    setInterval(updateVideoState, 100);
  }

  // Handle fullscreen changes
  function handleFullscreenChange() {
    if (document.fullscreenElement) {
      // Entered fullscreen
      isFullscreen = true;
      if (videoControls) {
        videoControls.classList.add("fullscreen");
        // Move controls to fullscreen element
        const fullscreenElement = document.fullscreenElement;
        if (
          fullscreenElement &&
          fullscreenElement !== videoControls.parentElement
        ) {
          fullscreenElement.appendChild(videoControls);
        }
        // Update fullscreen icon
        const fullscreenEnterIcon =
          videoControls.querySelector(".fullscreen-enter");
        const fullscreenExitIcon =
          videoControls.querySelector(".fullscreen-exit");
        if (fullscreenEnterIcon && fullscreenExitIcon) {
          fullscreenEnterIcon.style.display = "none";
          fullscreenExitIcon.style.display = "block";
        }
      }
      console.log("Netflix WiFi Wall Breaker: Entered fullscreen mode");
    } else {
      // Exited fullscreen
      isFullscreen = false;
      if (videoControls) {
        videoControls.classList.remove("fullscreen");
        // Move controls back to body
        if (videoControls.parentElement !== document.body) {
          document.body.appendChild(videoControls);
        }
        // Update fullscreen icon
        const fullscreenEnterIcon =
          videoControls.querySelector(".fullscreen-enter");
        const fullscreenExitIcon =
          videoControls.querySelector(".fullscreen-exit");
        if (fullscreenEnterIcon && fullscreenExitIcon) {
          fullscreenEnterIcon.style.display = "block";
          fullscreenExitIcon.style.display = "none";
        }
      }
      console.log("Netflix WiFi Wall Breaker: Exited fullscreen mode");
    }
  }

  // Show video controls
  function showVideoControls() {
    if (videoControls) {
      videoControls.classList.add("visible");
      document.body.style.cursor = "auto";

      // Auto-hide after 3 seconds
      if (hideControlsTimeout) {
        clearTimeout(hideControlsTimeout);
      }
      hideControlsTimeout = setTimeout(hideVideoControls, 3000);
    }
  }

  // Hide video controls
  function hideVideoControls() {
    if (videoControls) {
      videoControls.classList.remove("visible");
      document.body.style.cursor = "none";
    }
  }

  // Handle video page
  function handleVideoPage() {
    if (isVideoWatchPage()) {
      if (!isVideoPage) {
        isVideoPage = true;
        console.log(
          "Netflix WiFi Wall Breaker: Video page detected, creating controls...",
        );
        createVideoControls();

        // Show controls on mouse move
        document.addEventListener("mousemove", showVideoControls);
        document.addEventListener("click", showVideoControls);

        // Hide controls on mouse leave
        document.addEventListener("mouseleave", hideVideoControls);

        // Listen for fullscreen changes
        document.addEventListener("fullscreenchange", handleFullscreenChange);
      }
    } else {
      if (isVideoPage) {
        isVideoPage = false;
        if (videoControls) {
          videoControls.remove();
          videoControls = null;
        }
        // Remove fullscreen listener
        document.removeEventListener(
          "fullscreenchange",
          handleFullscreenChange,
        );
        console.log(
          "Netflix WiFi Wall Breaker: Left video page, removing controls...",
        );
      }
    }
  }

  // Function to handle dynamic content changes
  function observeDOMChanges() {
    const observer = new MutationObserver((mutations) => {
      let shouldCheck = false;

      mutations.forEach((mutation) => {
        if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
          // Check if any added node is appMountPoint or if we need to re-run our script
          for (let node of mutation.addedNodes) {
            if (node.nodeType === Node.ELEMENT_NODE) {
              if (
                node.id === "appMountPoint" ||
                node.querySelector("#appMountPoint")
              ) {
                shouldCheck = true;
                break;
              }
            }
          }
        }
      });

      if (shouldCheck) {
        console.log(
          "Netflix WiFi Wall Breaker: DOM changes detected, re-running script...",
        );
        setTimeout(removeDivsUntilAppMountPoint, 100);
        setTimeout(handleVideoPage, 100);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    console.log("Netflix WiFi Wall Breaker: DOM observer started");
  }

  // Initialize the script
  function init() {
    console.log("Netflix WiFi Wall Breaker: Initializing...");

    // Start observing DOM changes
    observeDOMChanges();

    // Run the main function
    removeDivsUntilAppMountPoint();

    // Also run periodically to catch any missed elements
    setInterval(removeDivsUntilAppMountPoint, 2000);

    // Handle video page
    handleVideoPage();

    // Watch for URL changes (for SPA navigation)
    let currentUrl = window.location.href;
    setInterval(() => {
      if (window.location.href !== currentUrl) {
        currentUrl = window.location.href;
        handleVideoPage();
      }
    }, 1000);
  }

  // Wait for DOM to be ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  // Also run when window loads to catch any late-loading content
  window.addEventListener("load", () => {
    console.log("Netflix WiFi Wall Breaker: Window loaded, final check...");
    setTimeout(removeDivsUntilAppMountPoint, 1000);
  });

  // Message handling for popup communication
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request.action) {
      case "getStats":
        sendResponse(stats);
        break;
      case "manualRun":
        removeDivsUntilAppMountPoint();
        sendResponse({ success: true, message: "Manual run executed" });
        break;
      case "checkStatus":
        const appMountPoint = document.getElementById("appMountPoint");
        const message = appMountPoint
          ? "appMountPoint found"
          : "appMountPoint not found";
        sendResponse({ success: true, message: message, stats: stats });
        break;
      default:
        sendResponse({ error: "Unknown action" });
    }
  });
})();
