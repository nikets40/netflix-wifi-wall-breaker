# Netflix WiFi Wall Breaker

A Chrome extension that automatically removes divs from Netflix pages until it reaches the `appMountPoint` element, helping to bypass WiFi restrictions.

## Features

- 🎬 Automatically runs on Netflix pages
- 🧹 Removes divs from body until appMountPoint
- 🎮 Custom video controls on watch pages
- 📊 Tracks statistics (divs removed, script runs)
- 🎛️ Manual control via popup interface
- 🔄 Continuous monitoring with DOM observation
- 📱 Beautiful popup interface
- ⏱️ Auto-hiding video controls with mouse interaction

## Installation

1. **Download or clone this repository**

   ```bash
   git clone <repository-url>
   cd netflix-wifi-wall-breaker
   ```

2. **Open Chrome and go to Extensions**

   - Open Chrome browser
   - Navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)

3. **Load the extension**

   - Click "Load unpacked"
   - Select the folder containing this extension
   - The extension should now appear in your extensions list

4. **Grant permissions**
   - When you first visit Netflix, Chrome will ask for permission
   - Click "Allow" to let the extension run on Netflix

## Usage

1. **Automatic Operation**

   - Simply visit any Netflix page
   - The extension will automatically start working
   - Check the browser console for logs

2. **Manual Control**

   - Click the extension icon in your toolbar
   - Use the popup to:
     - Check current status
     - Manually run the script
     - View statistics

3. **Video Controls**

   - Navigate to any Netflix video page (e.g., netflix.com/watch/...)
   - Custom controls will automatically appear
   - Move your mouse or click to show controls
   - Controls auto-hide after 3 seconds
   - Use the progress bar to seek, play/pause, fullscreen, etc.

4. **Monitoring**
   - Open browser console (F12) to see detailed logs
   - The extension will continuously monitor for changes

## How It Works

The extension:

1. Detects when you're on a Netflix page
2. Waits for the `appMountPoint` element to load
3. Removes all div elements that come before `appMountPoint` in the DOM
4. Also removes other element types before `appMountPoint`
5. Continuously monitors for new content and repeats the process

### Video Controls (on /watch/ pages)

- Automatically creates custom video controls when on video pages
- Controls include: Play/Pause, Back, Fullscreen, Volume, Settings, Progress bar
- Auto-hides after 3 seconds of inactivity
- Shows on mouse movement or click
- Styled to match Netflix's original design
- Controls the actual video element on the page

## Files Structure

```
netflix-wifi-wall-breaker/
├── manifest.json      # Extension configuration
├── content.js         # Main script that runs on Netflix
├── popup.html         # Extension popup interface
├── popup.js           # Popup functionality
├── icon16.png         # Extension icon (16x16)
├── icon48.png         # Extension icon (48x48)
├── icon128.png        # Extension icon (128x128)
└── README.md          # This file
```

## Permissions

The extension requests the following permissions:

- `activeTab`: To interact with the current Netflix tab
- `scripting`: To inject scripts when needed
- `https://www.netflix.com/*`: To run on Netflix pages
- `https://netflix.com/*`: To run on Netflix pages

## Troubleshooting

1. **Extension not working**

   - Check if you're on a Netflix page
   - Open browser console (F12) and look for extension logs
   - Try refreshing the page

2. **Permission denied**

   - Go to `chrome://extensions/`
   - Find the extension and click "Details"
   - Ensure all permissions are granted

3. **Not removing divs**
   - Check if `appMountPoint` exists on the page
   - Look for console logs indicating the process
   - Try the manual run button in the popup

## Development

To modify the extension:

1. Edit the files as needed
2. Go to `chrome://extensions/`
3. Click the refresh icon on the extension
4. Test on Netflix

## Disclaimer

This extension is for educational purposes. Use responsibly and in accordance with Netflix's terms of service and applicable laws.

## License

This project is open source and available under the MIT License.
