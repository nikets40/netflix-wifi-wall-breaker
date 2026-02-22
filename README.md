# Netflix WiFi Wall Breaker — Chrome Extension

Bypass Netflix's WiFi wall and enjoy your favorite shows on any network!

Blocks outbound requests from **netflix.com** to:

```
https://web.prod.cloud.netflix.com/graphql
```

…where the request payload contains any of the following operations:

```json
{ "operationName": "CLCSInterstitialPlaybackAndPostPlayback" }
{ "operationName": "CLCSInterstitialLolomo" }
```

---

## How it works

The extension injects a content script at `document_start` (before any page JS runs) directly into the **MAIN** world. This lets it wrap the native `window.fetch` and `window.XMLHttpRequest` before Netflix's own code can use them.

For every outbound request it:

1. Checks if the URL starts with the target GraphQL endpoint.
2. Parses the request body (supports both single and **batched** GraphQL operations).
3. If the `operationName` matches any blocked operation, it **cancels** the real request and returns a synthetic empty `{ data: null, errors: [] }` response so Netflix doesn't crash.

---

## Installation

1. Open Chrome and go to `chrome://extensions/`
2. Enable **Developer mode** (top-right toggle)
3. Click **Load unpacked**
4. Select the `netflix-wifi-wall-breaker` folder
5. Navigate to Netflix — the blocker is active immediately

---

## Files

| File            | Purpose                          |
| --------------- | -------------------------------- |
| `manifest.json` | Extension manifest (Manifest V3) |
| `content.js`    | Request interception logic       |
| `icon16.png`    | 16×16 extension icon             |
| `icon48.png`    | 48×48 extension icon             |
| `icon128.png`   | 128×128 extension icon           |

---

## Adding more blocked operations

Open `content.js` and add entries to the `BLOCKED_OPERATIONS` set at the top:

```js
const BLOCKED_OPERATIONS = new Set([
  "CLCSInterstitialPlaybackAndPostPlayback",
  "CLCSInterstitialLolomo",
  // add more here
]);
```

---

## Notes

- Uses `"world": "MAIN"` so the script shares the same JS context as the page — essential for patching native globals.
- Handles **batched GraphQL** (array of operations in a single request).
- Falls back to a string `.includes()` check if JSON parsing fails.
- No network permissions are consumed — blocking happens entirely client-side.
