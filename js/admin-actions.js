/* ==========================================================================
   JUICEBAR ADMIN — TABLE ACTIONS
   Adds working behaviour to the View / Edit / Delete icon buttons found in
   table rows across Orders, Inventory, Juice Menu and Smoothies pages.
   Works generically off each table's <thead> labels, so it needs no
   per-page configuration.
   ========================================================================== */

(function () {
  "use strict";

  function ensureViewModal() {
    if (document.getElementById("adminViewModal")) return;
    var wrap = document.createElement("div");
    wrap.innerHTML =
      '<div class="modal fade" id="adminViewModal" tabindex="-1" aria-hidden="true">' +
      '<div class="modal-dialog">' +
      '<div class="modal-content">' +
      '<div class="modal-header">' +
      '<h5 class="modal-title">Record Details</h5>' +
      '<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>' +
      "</div>" +
      '<div class="modal-body"><dl class="row mb-0" id="adminViewModalBody"></dl></div>' +
      '<div class="modal-footer"><button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button></div>' +
      "</div></div></div>";
    document.body.appendChild(wrap.firstElementChild);
  }

  function rowHeaders(table) {
    return Array.prototype.map.call(
      table.querySelectorAll("thead th"),
      function (th) {
        return th.textContent.trim();
      }
    );
  }

  function showView(row, table) {
    ensureViewModal();
    var headers = rowHeaders(table);
    var cells = row.querySelectorAll("td");
    var body = document.getElementById("adminViewModalBody");
    body.innerHTML = "";

    cells.forEach(function (td, i) {
      if (headers[i] === "Action") return;
      var dt = document.createElement("dt");
      dt.className = "col-4";
      dt.textContent = headers[i] || "";
      var dd = document.createElement("dd");
      dd.className = "col-8";
      dd.textContent = td.textContent.trim();
      body.appendChild(dt);
      body.appendChild(dd);
    });

    var modalEl = document.getElementById("adminViewModal");
    var modal = bootstrap.Modal.getOrCreateInstance(modalEl);
    modal.show();
  }

  function statusOptionsFor(currentText) {
    var t = currentText.trim().toLowerCase();
    if (["pending", "completed", "cancelled"].indexOf(t) !== -1) {
      return ["Pending", "Completed", "Cancelled"];
    }
    if (["in stock", "low stock", "out of stock"].indexOf(t) !== -1) {
      return ["In Stock", "Low Stock", "Out of Stock"];
    }
    if (["available", "out of stock"].indexOf(t) !== -1) {
      return ["Available", "Out of Stock"];
    }
    return null;
  }

  function badgeClassFor(value) {
    var v = value.trim().toLowerCase();
    if (v === "completed" || v === "available" || v === "in stock")
      return "badge bg-success";
    if (v === "pending" || v === "low stock") return "badge bg-warning text-dark";
    if (v === "cancelled" || v === "out of stock") return "badge bg-danger";
    return "badge bg-secondary";
  }

  function startEdit(row, table, btn) {
    row.dataset.editing = "true";
    var headers = rowHeaders(table);
    var cells = row.querySelectorAll("td");

    cells.forEach(function (td, i) {
      if (headers[i] === "Action") return;

      var badge = td.querySelector(".badge, .status");
      var currentText = td.textContent.trim();
      td.dataset.original = td.innerHTML;

      if (badge) {
        var options = statusOptionsFor(currentText);
        if (options) {
          var select = document.createElement("select");
          select.className = "form-select form-select-sm";
          options.forEach(function (opt) {
            var o = document.createElement("option");
            o.value = opt;
            o.textContent = opt;
            if (opt.toLowerCase() === currentText.toLowerCase()) o.selected = true;
            select.appendChild(o);
          });
          td.innerHTML = "";
          td.appendChild(select);
          return;
        }
      }

      var input = document.createElement("input");
      input.type = "text";
      input.className = "form-control form-control-sm";
      input.value = currentText;
      td.innerHTML = "";
      td.appendChild(input);
    });

    var icon = btn.querySelector("i");
    if (icon) icon.className = "bi bi-check-lg";
    btn.title = "Save changes";
  }

  function saveEdit(row, btn) {
    var cells = row.querySelectorAll("td");

    cells.forEach(function (td) {
      var select = td.querySelector("select");
      var input = td.querySelector("input");

      if (select) {
        var val = select.value;
        var span = document.createElement("span");
        span.className = badgeClassFor(val);
        span.textContent = val;
        td.innerHTML = "";
        td.appendChild(span);
      } else if (input) {
        td.textContent = input.value;
      }
      delete td.dataset.original;
    });

    row.dataset.editing = "false";
    var icon = btn.querySelector("i");
    if (icon) icon.className = "bi bi-pencil";
    btn.title = "Edit";
  }

  document.addEventListener("click", function (e) {
    var btn = e.target.closest("button, a.btn");
    if (!btn) return;
    var icon = btn.querySelector("i");
    if (!icon) return;
    var row = btn.closest("tr");
    var table = btn.closest("table");
    if (!row || !table) return;

    if (icon.classList.contains("bi-eye")) {
      e.preventDefault();
      showView(row, table);
    } else if (icon.classList.contains("bi-pencil")) {
      e.preventDefault();
      startEdit(row, table, btn);
    } else if (icon.classList.contains("bi-check-lg")) {
      e.preventDefault();
      saveEdit(row, btn);
    } else if (icon.classList.contains("bi-trash")) {
      e.preventDefault();
      if (confirm("Delete this record? This cannot be undone.")) {
        row.remove();
      }
    }
  });
})();