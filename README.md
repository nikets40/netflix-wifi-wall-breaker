# Netflix GraphQL Blocker — Chrome Extension

Blocks outbound requests from **netflix.com** to:

```
https://web.prod.cloud.netflix.com/graphql
```

…where the request payload contains:

```json
{ "operationName": "CLCSInterstitialPlaybackAndPostPlayback" }
```

---

## How it works

The extension injects a content script at `document_start` (before any page JS runs) directly into the **MAIN** world. This lets it wrap the native `window.fetch` and `window.XMLHttpRequest` before Netflix's own code can use them.

For every outbound request it:
1. Checks if the URL starts with the target GraphQL endpoint.
2. Parses the request body (supports both single and **batched** GraphQL operations).
3. If the `operationName` matches, it **cancels** the real request and returns a synthetic empty `{ data: null, errors: [] }` response so Netflix doesn't crash.

---

## Installation

1. Open Chrome and go to `chrome://extensions/`
2. Enable **Developer mode** (top-right toggle)
3. Click **Load unpacked**
4. Select the `netflix-blocker` folder
5. Navigate to Netflix — the blocker is active immediately

---

## Files

| File | Purpose |
|------|---------|
| `manifest.json` | Extension manifest (Manifest V3) |
| `content.js` | Request interception logic |
| `icon.png` | Extension icon |

---

## Notes

- Uses `"world": "MAIN"` so the script shares the same JS context as the page — essential for patching native globals.
- Handles **batched GraphQL** (array of operations in a single request).
- Falls back to a string `.includes()` check if JSON parsing fails.
- No network permissions are consumed — blocking happens entirely client-side.
