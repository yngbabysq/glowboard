(function () {
  "use strict";

  var script = document.currentScript;
  if (!script) return;

  var projectId = script.getAttribute("data-project");
  if (!projectId) return;

  var baseUrl = new URL(script.src).origin;

  var container = document.createElement("div");
  container.id = "glowboard-widget-" + projectId;
  script.parentNode.insertBefore(container, script.nextSibling);

  var shadow = container.attachShadow({ mode: "open" });

  function timeAgo(dateStr) {
    var diff = Date.now() - new Date(dateStr).getTime();
    var m = Math.floor(diff / 60000);
    if (m < 60) return m + "m ago";
    var h = Math.floor(m / 60);
    if (h < 24) return h + "h ago";
    var d = Math.floor(h / 24);
    if (d < 30) return d + "d ago";
    return Math.floor(d / 30) + "mo ago";
  }

  function stars(rating) {
    var s = "";
    for (var i = 0; i < 5; i++) {
      s += i < rating ? "\u2605" : "\u2606";
    }
    return s;
  }

  function initials(name) {
    return name
      .split(" ")
      .map(function (n) { return n[0]; })
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }

  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        if (k === "className") node.className = attrs[k];
        else if (k === "textContent") node.textContent = attrs[k];
        else if (k.indexOf("on") === 0) node.addEventListener(k.slice(2).toLowerCase(), attrs[k]);
        else node.setAttribute(k, attrs[k]);
      });
    }
    if (children) {
      children.forEach(function (c) {
        if (typeof c === "string") node.appendChild(document.createTextNode(c));
        else if (c) node.appendChild(c);
      });
    }
    return node;
  }

  function createCard(t, color) {
    var avatarEl;
    if (t.customer_avatar_url) {
      avatarEl = el("img", { className: "gb-avatar", src: t.customer_avatar_url, alt: "" });
    } else {
      avatarEl = el("div", {
        className: "gb-avatar gb-avatar-fallback",
        style: "background:" + color + "20;color:" + color,
        textContent: initials(t.customer_name),
      });
    }

    return el("div", { className: "gb-card" }, [
      el("div", { className: "gb-header" }, [
        avatarEl,
        el("div", { className: "gb-meta" }, [
          el("div", { className: "gb-name", textContent: t.customer_name }),
          el("div", { className: "gb-stars", style: "color:" + color, textContent: stars(t.rating) }),
        ]),
        el("div", { className: "gb-time", textContent: timeAgo(t.created_at) }),
      ]),
      el("div", { className: "gb-text", textContent: t.text }),
    ]);
  }

  function render(data) {
    var t = data.testimonials;
    var color = data.primaryColor || "#6366f1";
    var style = data.style || "carousel";

    // Clear shadow DOM
    while (shadow.firstChild) shadow.removeChild(shadow.firstChild);

    // Add styles
    var styleEl = document.createElement("style");
    styleEl.textContent = css(color);
    shadow.appendChild(styleEl);

    if (t.length === 0) {
      shadow.appendChild(el("div", { className: "gb-empty", textContent: "No testimonials yet" }));
      return;
    }

    var root = el("div", { className: "gb-root gb-" + style });

    if (style === "carousel") {
      var track = el("div", { className: "gb-track" });
      t.forEach(function (item) { track.appendChild(createCard(item, color)); });
      root.appendChild(track);

      var prev = el("button", { className: "gb-arrow gb-prev", "aria-label": "Previous", textContent: "\u2039" });
      var next = el("button", { className: "gb-arrow gb-next", "aria-label": "Next", textContent: "\u203A" });

      prev.addEventListener("click", function () {
        track.scrollBy({ left: -320, behavior: "smooth" });
      });
      next.addEventListener("click", function () {
        track.scrollBy({ left: 320, behavior: "smooth" });
      });

      root.appendChild(prev);
      root.appendChild(next);
    } else {
      t.forEach(function (item) { root.appendChild(createCard(item, color)); });
    }

    shadow.appendChild(root);

    if (data.showBranding) {
      var branding = el("div", { className: "gb-branding" });
      var link = el("a", {
        href: baseUrl,
        target: "_blank",
        rel: "noopener",
        textContent: "\u2B50 Powered by Glowboard",
      });
      branding.appendChild(link);
      shadow.appendChild(branding);
    }
  }

  function css() {
    return (
      "*{box-sizing:border-box;margin:0;padding:0}" +
      ".gb-root{font-family:system-ui,-apple-system,sans-serif;position:relative}" +
      ".gb-empty{font:14px/1.5 system-ui;color:#888;text-align:center;padding:2rem}" +
      ".gb-card{background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:16px;display:flex;flex-direction:column;gap:10px}" +
      ".gb-header{display:flex;align-items:center;gap:10px}" +
      ".gb-avatar{width:36px;height:36px;border-radius:50%;object-fit:cover;flex-shrink:0}" +
      ".gb-avatar-fallback{display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:600}" +
      ".gb-meta{flex:1;min-width:0}" +
      ".gb-name{font-size:14px;font-weight:600;color:#111;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}" +
      ".gb-stars{font-size:14px;letter-spacing:1px}" +
      ".gb-time{font-size:11px;color:#999;white-space:nowrap}" +
      ".gb-text{font-size:13px;line-height:1.6;color:#444}" +
      ".gb-carousel{overflow:hidden}" +
      ".gb-carousel .gb-track{display:flex;gap:12px;overflow-x:auto;scroll-snap-type:x mandatory;-ms-overflow-style:none;scrollbar-width:none;padding:4px}" +
      ".gb-carousel .gb-track::-webkit-scrollbar{display:none}" +
      ".gb-carousel .gb-card{min-width:300px;max-width:300px;scroll-snap-align:start;flex-shrink:0}" +
      ".gb-arrow{position:absolute;top:50%;transform:translateY(-50%);width:32px;height:32px;border-radius:50%;border:1px solid #e5e7eb;background:#fff;font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 1px 3px rgba(0,0,0,.1);z-index:2}" +
      ".gb-arrow:hover{background:#f9fafb}" +
      ".gb-prev{left:-16px}" +
      ".gb-next{right:-16px}" +
      ".gb-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:12px}" +
      ".gb-wall{columns:2;column-gap:12px}" +
      ".gb-wall .gb-card{break-inside:avoid;margin-bottom:12px}" +
      ".gb-minimal{display:flex;flex-direction:column;gap:0}" +
      ".gb-minimal .gb-card{border-radius:0;border-left:0;border-right:0;border-bottom:0}" +
      ".gb-minimal .gb-card:first-child{border-top:0}" +
      ".gb-branding{text-align:center;padding:12px 0 4px;font-size:11px}" +
      ".gb-branding a{color:#999;text-decoration:none}" +
      ".gb-branding a:hover{color:#666}" +
      "@media(prefers-color-scheme:dark){" +
        ".gb-card{background:#1e1e1e;border-color:#333}" +
        ".gb-name{color:#eee}" +
        ".gb-text{color:#bbb}" +
        ".gb-time{color:#777}" +
        ".gb-arrow{background:#1e1e1e;border-color:#333;color:#eee}" +
        ".gb-arrow:hover{background:#2a2a2a}" +
      "}"
    );
  }

  fetch(baseUrl + "/api/embed/" + projectId)
    .then(function (r) { return r.json(); })
    .then(render)
    .catch(function () {
      while (shadow.firstChild) shadow.removeChild(shadow.firstChild);
      var styleEl = document.createElement("style");
      styleEl.textContent = ".gb-err{font:13px/1.5 system-ui;color:#999;text-align:center;padding:1rem}";
      shadow.appendChild(styleEl);
      shadow.appendChild(el("div", { className: "gb-err", textContent: "Unable to load testimonials" }));
    });
})();
