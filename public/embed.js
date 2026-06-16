/*!
 * gh-growth-score embeddable widget loader.
 *
 * Drop this on any page to host the growth audit — self-contained, no backend,
 * no dependencies. It injects a responsive <iframe> pointing at /embed and
 * auto-resizes it from height beacons the embed posts back.
 *
 * Usage:
 *   <script src="https://YOUR-HOST/embed.js"
 *           data-diagnostic="aarrr"   // or "plg" (optional, default aarrr)
 *           data-lang="en"            // optional ?lang=
 *           data-token="1.342013402230114"  // optional: embed a shared result
 *           data-height="720"         // optional initial min-height (px)
 *           async></script>
 *
 * Privacy: the height beacon carries only a type tag + an integer height — no
 * answers, no PII. The iframe URL carries only non-PII view state.
 *
 * NOTE: the pure logic here is mirrored + unit-tested in lib/embed.ts. Keep in
 * sync if you change attribute names or the beacon shape.
 */
(function () {
  var script =
    document.currentScript ||
    (function () {
      var s = document.getElementsByTagName("script");
      return s[s.length - 1];
    })();
  if (!script) return;

  var HEIGHT_MESSAGE = "gh-embed-height";
  var MIN_HEIGHT = 320;
  var MAX_HEIGHT = 20000;

  var ds = script.dataset || {};
  var base = (ds.base || new URL(script.src).origin).replace(/\/+$/, "");

  // Build the /embed URL from data-* attributes (mirrors buildEmbedSrc).
  var params = new URLSearchParams();
  if (ds.diagnostic) params.set("d", ds.diagnostic);
  if (ds.lang) params.set("lang", ds.lang);
  if (ds.token) params.set("r", ds.token);
  var qs = params.toString();
  var src = base + "/embed" + (qs ? "?" + qs : "");

  var embedOrigin;
  try {
    embedOrigin = new URL(src).origin;
  } catch (e) {
    embedOrigin = base;
  }

  var iframe = document.createElement("iframe");
  iframe.src = src;
  iframe.title = "Growth audit";
  iframe.loading = "lazy";
  iframe.setAttribute("scrolling", "no");
  iframe.style.width = "100%";
  iframe.style.border = "0";
  iframe.style.display = "block";
  iframe.style.minHeight = (parseInt(ds.height, 10) || 720) + "px";
  iframe.style.colorScheme = "normal";

  script.parentNode.insertBefore(iframe, script.nextSibling);

  // Auto-resize from the embed's height beacons — only trust our own origin.
  window.addEventListener("message", function (event) {
    if (event.origin !== embedOrigin) return;
    var data = event.data;
    if (
      !data ||
      typeof data !== "object" ||
      data.type !== HEIGHT_MESSAGE ||
      typeof data.height !== "number" ||
      !isFinite(data.height) ||
      data.height <= 0
    ) {
      return;
    }
    var h = Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, Math.ceil(data.height)));
    iframe.style.height = h + "px";
  });
})();
