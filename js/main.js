/* ==========================================================================
   JUICE BAR — SHARED SCRIPT
   Handles: dark/light theme toggle, cart icon injection, cart modal,
   add-to-cart buttons, and toast notifications.
   ========================================================================== */

document.addEventListener("DOMContentLoaded", function () {

  /* ---------------------------------------------------------------------
     1. THEME TOGGLE
  --------------------------------------------------------------------- */
  const themeToggle = document.getElementById("themeToggle");

  function applyTheme(theme) {
    document.body.classList.toggle("dark-mode", theme === "dark");
    if (themeToggle) {
      const icon = themeToggle.querySelector("i");
      if (icon) {
        icon.classList.toggle("fa-moon", theme !== "dark");
        icon.classList.toggle("fa-sun", theme === "dark");
      }
    }
  }

  applyTheme(localStorage.getItem("theme") === "dark" ? "dark" : "light");

  themeToggle?.addEventListener("click", () => {
    const isDark = document.body.classList.toggle("dark-mode");
    localStorage.setItem("theme", isDark ? "dark" : "light");
    applyTheme(isDark ? "dark" : "light");
  });

  /* ---------------------------------------------------------------------
     1B. RIGHT-TO-LEFT (RTL) TOGGLE — only on customer-facing pages
         (i.e. pages that have the navbar theme toggle)
  --------------------------------------------------------------------- */
  let rtlToggle = null;

  if (themeToggle) {
    rtlToggle = document.createElement("button");
    rtlToggle.type = "button";
    rtlToggle.id = "rtlToggle";
    rtlToggle.className = themeToggle.className;
    rtlToggle.setAttribute("title", "Toggle right-to-left layout");
    rtlToggle.setAttribute("aria-label", "Toggle right-to-left layout");
    rtlToggle.innerHTML = '<i class="fas fa-align-right"></i>';

    themeToggle.parentNode.insertBefore(rtlToggle, themeToggle);

    function findBootstrapLink() {
      return Array.from(document.querySelectorAll('link[rel="stylesheet"]')).find((link) =>
        /bootstrap(\.rtl)?\.min\.css/.test(link.href)
      );
    }

    function applyDirection(dir) {
      document.documentElement.setAttribute("dir", dir);
      document.body.classList.toggle("rtl-mode", dir === "rtl");

      const bsLink = findBootstrapLink();
      if (bsLink) {
        bsLink.href =
          dir === "rtl"
            ? bsLink.href.replace("bootstrap.min.css", "bootstrap.rtl.min.css")
            : bsLink.href.replace("bootstrap.rtl.min.css", "bootstrap.min.css");
      }

      const icon = rtlToggle.querySelector("i");
      if (icon) {
        icon.classList.toggle("fa-align-right", dir !== "rtl");
        icon.classList.toggle("fa-align-left", dir === "rtl");
      }
    }

    applyDirection(localStorage.getItem("siteDirection") === "rtl" ? "rtl" : "ltr");

    rtlToggle.addEventListener("click", () => {
      const next = document.documentElement.getAttribute("dir") === "rtl" ? "ltr" : "rtl";
      localStorage.setItem("siteDirection", next);
      applyDirection(next);
    });
  }

  /* ---------------------------------------------------------------------
     2. CART — only wire up on pages that have the navbar theme toggle
        (i.e. the customer-facing site, not the admin panel)
  --------------------------------------------------------------------- */
  if (!themeToggle) return;

  const CART_KEY = "juicebar_cart";

  function getCart() {
    try {
      return JSON.parse(localStorage.getItem(CART_KEY)) || [];
    } catch (e) {
      return [];
    }
  }

  function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    updateCartBadge();
  }

  function cartCount(cart) {
    return cart.reduce((sum, item) => sum + item.qty, 0);
  }

  function cartTotal(cart) {
    return cart.reduce((sum, item) => sum + item.qty * item.price, 0);
  }

  function updateCartBadge() {
    const badge = document.getElementById("cartCount");
    if (!badge) return;
    const count = cartCount(getCart());
    badge.textContent = count;
    badge.style.display = count > 0 ? "flex" : "none";
  }

  /* ---- Inject the cart icon + auth buttons into the navbar ----
     Order: Theme -> RTL -> Login (outline) -> Sign Up (filled) -> Cart
     Skipped entirely on login.html / register.html (no themeToggle there). */
  function injectCartIcon() {
    if (document.getElementById("cartToggle")) return;

    const wrapper = document.createElement("div");
    wrapper.className = "nav-controls";

    const currentPage = window.location.pathname.split("/").pop();
    const isAuthPage = currentPage === "login.html" || currentPage === "register.html";

    const cartBtn = document.createElement("button");
    cartBtn.id = "cartToggle";
    cartBtn.className = "btn btn-outline-success";
    cartBtn.setAttribute("type", "button");
    cartBtn.setAttribute("aria-label", "View cart");
    cartBtn.innerHTML =
      '<i class="fas fa-basket-shopping"></i><span id="cartCount" class="cart-count">0</span>';

    themeToggle.parentNode.insertBefore(wrapper, themeToggle);
    wrapper.appendChild(themeToggle);
    if (rtlToggle) wrapper.appendChild(rtlToggle);

    if (!isAuthPage) {
      const loginBtn = document.createElement("a");
      loginBtn.href = "login.html";
      loginBtn.className = "btn btn-outline-success btn-sm rounded-pill nav-auth-btn";
      loginBtn.textContent = "Login";

      const signupBtn = document.createElement("a");
      signupBtn.href = "register.html";
      signupBtn.className = "btn btn-success btn-sm rounded-pill nav-auth-btn";
      signupBtn.textContent = "Sign Up";

      wrapper.appendChild(loginBtn);
      wrapper.appendChild(signupBtn);
    }

    wrapper.appendChild(cartBtn);

    cartBtn.addEventListener("click", openCartModal);
  }

  /* ---- Inject the cart modal markup once per page ---- */
  function injectCartModal() {
    if (document.getElementById("cartModal")) return;

    const modal = document.createElement("div");
    modal.innerHTML = `
      <div class="modal fade" id="cartModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title fw-bold"><i class="fas fa-basket-shopping text-success me-2"></i>Your Order</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body" id="cartItemsContainer"></div>
            <div class="modal-footer flex-column align-items-stretch">
              <div class="d-flex justify-content-between mb-3">
                <span class="fw-semibold">Total</span>
                <span class="fw-bold fs-5 text-success" id="cartTotalDisplay">$0.00</span>
              </div>
              <div class="d-flex gap-2">
                <button class="btn btn-outline-danger flex-fill" id="clearCartBtn">Clear</button>
                <button class="btn btn-success flex-fill" id="checkoutBtn">Checkout</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div id="cartToastWrap"></div>
    `;
    document.body.appendChild(modal);

    document.getElementById("clearCartBtn").addEventListener("click", () => {
      saveCart([]);
      renderCartModal();
    });

    document.getElementById("checkoutBtn").addEventListener("click", () => {
      const cart = getCart();
      if (!cart.length) return;
      saveCart([]);
      renderCartModal();
      showToast("Order placed! Your fresh drinks are being prepared.");
      bootstrap.Modal.getInstance(document.getElementById("cartModal"))?.hide();
    });
  }

  function renderCartModal() {
    const cart = getCart();
    const container = document.getElementById("cartItemsContainer");
    const totalDisplay = document.getElementById("cartTotalDisplay");
    if (!container) return;

    if (!cart.length) {
      container.innerHTML = `
        <div class="cart-empty">
          <i class="fas fa-basket-shopping"></i>
          <p class="mb-0">Your cart is empty.<br>Add something delicious from the menu!</p>
        </div>`;
    } else {
      container.innerHTML = cart
        .map(
          (item, idx) => `
        <div class="cart-item" data-idx="${idx}">
          <div class="cart-item-info">
            <h6>${item.name}</h6>
            <small>$${item.price.toFixed(2)} each</small>
          </div>
          <div class="cart-qty">
            <button type="button" class="qty-minus" data-idx="${idx}">−</button>
            <span>${item.qty}</span>
            <button type="button" class="qty-plus" data-idx="${idx}">+</button>
          </div>
          <div class="fw-bold" style="min-width:60px;text-align:right;">$${(item.qty * item.price).toFixed(2)}</div>
          <button type="button" class="cart-remove-btn" data-idx="${idx}" aria-label="Remove item">
            <i class="fas fa-trash"></i>
          </button>
        </div>`
        )
        .join("");
    }

    totalDisplay.textContent = `$${cartTotal(cart).toFixed(2)}`;

    container.querySelectorAll(".qty-plus").forEach((btn) =>
      btn.addEventListener("click", () => changeQty(+btn.dataset.idx, 1))
    );
    container.querySelectorAll(".qty-minus").forEach((btn) =>
      btn.addEventListener("click", () => changeQty(+btn.dataset.idx, -1))
    );
    container.querySelectorAll(".cart-remove-btn").forEach((btn) =>
      btn.addEventListener("click", () => removeItem(+btn.dataset.idx))
    );
  }

  function changeQty(idx, delta) {
    const cart = getCart();
    if (!cart[idx]) return;
    cart[idx].qty += delta;
    if (cart[idx].qty <= 0) cart.splice(idx, 1);
    saveCart(cart);
    renderCartModal();
  }

  function removeItem(idx) {
    const cart = getCart();
    cart.splice(idx, 1);
    saveCart(cart);
    renderCartModal();
  }

  function openCartModal() {
    renderCartModal();
    const el = document.getElementById("cartModal");
    bootstrap.Modal.getOrCreateInstance(el).show();
  }

  function addToCart(name, price, id) {
    const cart = getCart();
    const key = id || name;
    const existing = cart.find((i) => i.id === key);
    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({ id: key, name, price, qty: 1 });
    }
    saveCart(cart);
    showToast(`Added "${name}" to your order`);
  }

  function showToast(message) {
    const wrap = document.getElementById("cartToastWrap");
    if (!wrap) return;
    const toast = document.createElement("div");
    toast.className = "cart-toast";
    toast.innerHTML = `<i class="fas fa-circle-check"></i><span>${message}</span>`;
    wrap.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transition = "opacity 0.3s ease";
      setTimeout(() => toast.remove(), 300);
    }, 2600);
  }

  /* ---- Wire up every "Add to Order" button on the page ---- */
  function wireAddToCartButtons() {
    document.querySelectorAll(".add-to-cart-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const name = btn.dataset.name;
        const price = parseFloat(btn.dataset.price || "0");
        const id = btn.dataset.id;
        if (!name || !price) return;
        addToCart(name, price, id);
      });
    });
  }

  injectCartIcon();
  injectCartModal();
  updateCartBadge();
  wireAddToCartButtons();
});


document.addEventListener("DOMContentLoaded", () => {

    const currentPage = window.location.pathname.split("/").pop();

    document.querySelectorAll(".navbar-nav .nav-link").forEach(link => {

        link.classList.remove("active");

        const href = link.getAttribute("href");

        if (href === currentPage || (currentPage === "" && href === "index.html")) {
            link.classList.add("active");
        }

    });

});