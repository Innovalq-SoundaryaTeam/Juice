/* ==========================================================================
   JUICEBAR ADMIN — NOTIFICATIONS
   Adds a simple dropdown of sample notifications when the bell icon
   (.notify) in the topbar is clicked.
   ========================================================================== */

(function () {
  var notifications = [
    { icon: "bi-basket-fill", text: "New order #1006 placed by Sophia", time: "5 min ago" },
    { icon: "bi-exclamation-triangle-fill", text: "Milk stock is running low (8 Litres left)", time: "1 hour ago" },
    { icon: "bi-chat-left-text-fill", text: "New message from oliviabennett@gmail.com", time: "2 hours ago" },
    { icon: "bi-check-circle-fill", text: "Mango Smoothie is back in stock", time: "Yesterday" }
  ];

  function injectStyles() {
    if (document.getElementById("admin-notif-styles")) return;
    var style = document.createElement("style");
    style.id = "admin-notif-styles";
    style.textContent =
      ".notify { position: relative; cursor: pointer; }" +
      ".admin-notif-panel { position: absolute; top: 130%; right: 0; width: 300px; background: var(--card-bg, #fff); border: 1px solid var(--border, #e9ecef); border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,.15); z-index: 1050; overflow: hidden; display: none; text-align: left; }" +
      ".admin-notif-panel.show { display: block; }" +
      ".admin-notif-header { padding: 12px 16px; font-weight: 600; font-size: 0.95rem; border-bottom: 1px solid var(--border, #e9ecef); color: var(--text, #212529); }" +
      ".admin-notif-list { list-style: none; margin: 0; padding: 0; max-height: 280px; overflow-y: auto; }" +
      ".admin-notif-list li { display: flex; gap: 10px; align-items: flex-start; padding: 12px 16px; border-bottom: 1px solid var(--border, #f1f1f1); }" +
      ".admin-notif-list li:last-child { border-bottom: none; }" +
      ".admin-notif-list li i { color: #198754; margin-top: 3px; }" +
      ".admin-notif-list li p { margin: 0; font-size: 0.85rem; color: var(--text, #212529); }" +
      ".admin-notif-list li small { color: var(--text-muted, #6c757d); }";
    document.head.appendChild(style);
  }

  function buildPanel() {
    var panel = document.createElement("div");
    panel.className = "admin-notif-panel";

    var items = notifications
      .map(function (n) {
        return (
          '<li><i class="bi ' + n.icon + '"></i>' +
          "<div><p>" + n.text + "</p><small>" + n.time + "</small></div></li>"
        );
      })
      .join("");

    panel.innerHTML =
      '<div class="admin-notif-header">Notifications</div>' +
      '<ul class="admin-notif-list">' + items + "</ul>";

    return panel;
  }

  var bells = document.querySelectorAll(".notify");
  if (!bells.length) return;

  injectStyles();

  bells.forEach(function (bell) {
    var panel = buildPanel();
    bell.appendChild(panel);

    bell.addEventListener("click", function (e) {
      e.stopPropagation();
      var isOpen = panel.classList.contains("show");
      document.querySelectorAll(".admin-notif-panel").forEach(function (p) {
        p.classList.remove("show");
      });
      if (!isOpen) panel.classList.add("show");
    });
  });

  document.addEventListener("click", function () {
    document.querySelectorAll(".admin-notif-panel").forEach(function (p) {
      p.classList.remove("show");
    });
  });
})();
