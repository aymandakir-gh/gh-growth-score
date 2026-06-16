# Embed the audit on your site

Host the Growth Health Score / PLG Readiness audit on any page with a single
`<script>` tag. It's **self-contained and backend-free** — the script injects a
responsive `<iframe>` pointing at the `/embed` route and auto-resizes it. Nothing
leaves the visitor's browser except non-PII view state.

## Copy-paste snippet

```html
<script
  src="https://growth-score.growthackers.io/embed.js"
  data-diagnostic="aarrr"
  async
></script>
```

That's it — the audit renders inline where the script tag sits.

### PLG Readiness instead of AARRR

```html
<script
  src="https://growth-score.growthackers.io/embed.js"
  data-diagnostic="plg"
  async
></script>
```

### Embed a specific shared result

```html
<script
  src="https://growth-score.growthackers.io/embed.js"
  data-token="1.342013402230114"
  async
></script>
```

## Options (data-\* attributes)

| Attribute | Default | Purpose |
|---|---|---|
| `data-diagnostic` | `aarrr` | Which audit: `aarrr` or `plg`. |
| `data-lang` | `en` | UI language (`en`, `ar`, `it`, `nl`, `zh`, `es`, `fr`, `de`, `pt-br`). |
| `data-token` | — | Show a specific shared result (`1.<digits>` or `2.<id>.<digits>`). |
| `data-height` | `720` | Initial min-height in px (the iframe then auto-grows). |
| `data-base` | script origin | Override the host origin (for self-hosted deployments). |

## Self-hosting

Deploy this repo anywhere (see the README's Deploy section), then point the
script `src` at `https://YOUR-HOST/embed.js`. The loader infers the host origin
from its own `src`, so the injected iframe and the resize handshake target your
deployment automatically. No configuration, no backend.

## How it works

1. `embed.js` reads its `data-*` attributes and builds the iframe URL
   (`/embed?d=…&lang=…&r=…`).
2. It inserts a full-width, borderless `<iframe>` right after the script tag.
3. The `/embed` page posts its content height to the parent via `postMessage`;
   the loader resizes the iframe to match. The beacon carries **only** a type tag
   and an integer height — it accepts messages **only from the embed's own
   origin**, and the embed posts **no answers and no PII**.

The pure logic (URL building + beacon validation) lives in
[`lib/embed.ts`](../lib/embed.ts) and is unit-tested; the static loader
[`public/embed.js`](../public/embed.js) mirrors it, and an end-to-end test loads
the real loader into a host page and asserts the iframe is created, the audit
renders inside it, and the auto-resize fires.
