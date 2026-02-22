/**
 * Netflix GraphQL Blocker
 * Intercepts fetch and XHR requests to block:
 * URL: https://web.prod.cloud.netflix.com/graphql
 * Condition: request payload contains operationName "CLCSInterstitialPlaybackAndPostPlayback"
 */

const TARGET_URL = 'https://web.prod.cloud.netflix.com/graphql';
const BLOCKED_OPERATIONS = new Set([
  'CLCSInterstitialPlaybackAndPostPlayback',
  'CLCSInterstitialLolomo',
]);

// ─── Intercept fetch ──────────────────────────────────────────────────────────
const originalFetch = window.fetch;

window.fetch = async function (...args) {
  const [resource, config] = args;

  const url = resource instanceof Request ? resource.url : String(resource);

  if (url.startsWith(TARGET_URL)) {
    try {
      let body = null;

      if (resource instanceof Request) {
        // Clone so we don't consume the body
        const cloned = resource.clone();
        body = await cloned.text();
      } else if (config && config.body) {
        body = typeof config.body === 'string'
          ? config.body
          : JSON.stringify(config.body);
      }

      if (body && isBlockedOperation(body)) {
        console.warn(`[Netflix GraphQL Blocker] Blocked fetch:`, getMatchedOperation(body));
        // Return an empty 200 response so Netflix doesn't crash
        return new Response(JSON.stringify({ data: null, errors: [] }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    } catch (e) {
      // If we can't inspect the body, let it through
      console.error('[Netflix GraphQL Blocker] Error inspecting fetch body:', e);
    }
  }

  return originalFetch.apply(this, args);
};

// ─── Intercept XMLHttpRequest ─────────────────────────────────────────────────
const OriginalXHR = window.XMLHttpRequest;

function PatchedXHR() {
  const xhr = new OriginalXHR();
  let _url = '';
  let _blocked = false;

  const originalOpen = xhr.open.bind(xhr);
  const originalSend = xhr.send.bind(xhr);

  // Proxy all properties / methods from the real XHR
  const proxy = new Proxy(xhr, {
    get(target, prop) {
      if (prop === 'open') {
        return function (method, url, ...rest) {
          _url = url;
          return originalOpen(method, url, ...rest);
        };
      }

      if (prop === 'send') {
        return function (body) {
          if (_url && _url.startsWith(TARGET_URL) && body && isBlockedOperation(body)) {
            console.warn(`[Netflix GraphQL Blocker] Blocked XHR:`, getMatchedOperation(body));
            _blocked = true;

            // Simulate a successful empty response
            setTimeout(() => {
              Object.defineProperties(xhr, {
                readyState: { get: () => 4, configurable: true },
                status: { get: () => 200, configurable: true },
                responseText: { get: () => JSON.stringify({ data: null, errors: [] }), configurable: true },
                response: { get: () => JSON.stringify({ data: null, errors: [] }), configurable: true },
              });
              const event = new Event('readystatechange');
              xhr.dispatchEvent(event);
              xhr.dispatchEvent(new Event('load'));
            }, 0);

            return;
          }
          return originalSend(body);
        };
      }

      const value = target[prop];
      return typeof value === 'function' ? value.bind(target) : value;
    },

    set(target, prop, value) {
      target[prop] = value;
      return true;
    }
  });

  return proxy;
}

// Copy static props
Object.setPrototypeOf(PatchedXHR, OriginalXHR);
Object.setPrototypeOf(PatchedXHR.prototype, OriginalXHR.prototype);
window.XMLHttpRequest = PatchedXHR;

// ─── Helper ───────────────────────────────────────────────────────────────────
function isBlockedOperation(body) {
  try {
    const parsed = typeof body === 'string' ? JSON.parse(body) : body;
    // Body can be a single object or an array of operations (batched GraphQL)
    const operations = Array.isArray(parsed) ? parsed : [parsed];
    return operations.some(op => op && BLOCKED_OPERATIONS.has(op.operationName));
  } catch {
    // If JSON parsing fails, do a quick string check as fallback
    return typeof body === 'string' && [...BLOCKED_OPERATIONS].some(op => body.includes(op));
  }
}

function getMatchedOperation(body) {
  try {
    const parsed = typeof body === 'string' ? JSON.parse(body) : body;
    const operations = Array.isArray(parsed) ? parsed : [parsed];
    return operations.map(op => op?.operationName).filter(name => BLOCKED_OPERATIONS.has(name));
  } catch {
    return [...BLOCKED_OPERATIONS].filter(op => typeof body === 'string' && body.includes(op));
  }
}

console.log('[Netflix GraphQL Blocker] Loaded — blocking:', [...BLOCKED_OPERATIONS].join(', '));
