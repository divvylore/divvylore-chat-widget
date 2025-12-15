# Divvylore Drop-In Script Guide

Partners that cannot install npm packages can still embed the Divvylore chat widget by hosting the standalone loader we ship with every release.

## 1. Build the Loader

```bash
npm install
npm run build # produces dist/embed/divvylore-chat-loader.js and .map
```

Artifacts:

- `dist/embed/divvylore-chat-loader.js` – production IIFE bundle with React, styles, and the loader runtime
- `dist/embed/divvylore-chat-loader.js.map` – optional source map for debugging

Upload both files to any static hosting provider (CDN, storage bucket, etc.) and note the public URL, e.g. `https://cdn.example.com/divvylore/v2/divvylore-chat-loader.js`.

## 2. Embed Snippet on the Partner Site

```html
<div id="divvylore-widget"></div>
<script>
  (function (w, d, s, src) {
    if (w.DivvyloreChatLoader) return;
    var el = d.createElement(s);
    el.async = true;
    el.src = src;
    el.onerror = function () {
      console.error('Divvylore widget failed to load');
      d.querySelector('#divvylore-widget').textContent = 'Chat is temporarily unavailable.';
    };
    d.head.appendChild(el);
  })(window, document, 'script', 'https://cdn.example.com/divvylore/v2/divvylore-chat-loader.js');
</script>
<script>
  window.addEventListener('divvylore:ready', function () {
    window.loadDivvyloreChatWidget({
      target: '#divvylore-widget',
      organizationId: 'partner-org-id',
      agentId: 'support',
      agentKey: 'partner-agent-key',
      enableMultiSession: true,
      headerTitle: 'Need help?'
    });
  });
</script>
```

> The loader sets `window.DivvyloreChatLoader` once it finishes booting so the snippet guard can safely prevent duplicate downloads on pages that inject the loader multiple times.

### Events

The loader dispatches these custom DOM events so partners can monitor availability without impacting the rest of their page:

| Event | Description |
|-------|-------------|
| `divvylore:ready` | Fired when the loader has registered `window.loadDivvyloreChatWidget` |
| `divvylore:widget-mounted` | Fired after a widget mounts; `detail.container` exposes the root element |
| `divvylore:widget-destroyed` | Fired after `destroy()` runs |
| `divvylore:widget-error` | Fired when mounting fails; `detail.error` contains the error object |

## 3. Runtime API

`window.loadDivvyloreChatWidget(config)` returns a handle with a `destroy()` method. The config accepts all `DivvyloreChatWidgetProps` plus loader-specific fields:

| Field | Type | Default | Notes |
|-------|------|---------|-------|
| `target` | `string | HTMLElement` | `#divvylore-chat-widget` | Where to mount the widget; auto-created if missing |
| `onMount` | `(element) => void` | `undefined` | Called after React finishes mounting |
| `onError` | `(error) => void` | `undefined` | Called when mounting fails |

All other fields map directly to the React component props (e.g., `organizationId`, `agentId`, `agentKey`, `theme`, etc.).

## 4. Failure Isolation

- If the script fails to download, the rest of the page continues working. Use the `el.onerror` handler to show a fallback message.
- If Divvylore services are down, `loadDivvyloreChatWidget` will dispatch `divvylore:widget-error` so partners can log/alert without blocking their core flows.

## 5. Versioning Strategy

Publish new embeds under versioned URLs (for example `.../v2.0.0/divvylore-chat-loader.js`). Partners can pin to a tested major version and upgrade on their own schedule while you keep serving multiple versions in parallel.
