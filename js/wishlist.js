(function () {
  const $ = (id) => document.getElementById(id);
  const Cart = window.DrinkItCart;
  const alcoholSet = new Set(window.DrinkItSeed.alcoholCategories);
  const { rupee, imageAttrs } = Cart;
  const state = {
    products: [],
    settings: {},
    cart: JSON.parse(localStorage.getItem("drinkit_cart") || "{}"),
    wishlist: new Set(JSON.parse(localStorage.getItem("drinkit_wishlist") || "[]")),
    activeCoupon: localStorage.getItem("drinkit_coupon") || "",
    recoveryDismissed: localStorage.getItem("drinkit_recovery_dismissed") === "1"
  };

  function card(product) {
    return `
      <article class="product-card">
        <a class="product-link" href="product.html?id=${encodeURIComponent(product.id)}"><img ${imageAttrs(product)} alt="${product.name}" loading="lazy"></a>
        <button class="heart saved" data-wish="${product.id}">Heart</button>
        <div class="product-body">
          <p class="chip">${product.category}</p>
          <h3><a href="product.html?id=${encodeURIComponent(product.id)}">${product.name}</a></h3>
          <p class="muted">${product.brand} | ${product.size}</p>
          <div class="price-row"><strong>${rupee(product.price)}</strong><span>${rupee(product.mrp)}</span><em>Save ${rupee(product.savings)}</em></div>
          <button class="add-btn ripple" data-add="${product.id}">Add</button>
        </div>
      </article>`;
  }

  function saveCart() {
    localStorage.setItem("drinkit_cart", JSON.stringify(state.cart));
    renderCart();
  }

  function renderCart() {
    const t = Cart.calculateTotals(state.cart, state.products, state.settings, state.activeCoupon);
    $("cartCount").textContent = t.itemCount;
    $("deliveryEta").textContent = `ETA ${state.settings.deliveryEta || "18-24 min"}`;
    $("cartItems").innerHTML = t.lines.length ? t.lines.map(({ product, qty }) => `
      <div class="cart-line"><img ${imageAttrs(product)} alt=""><div><strong>${product.name}</strong><span>${product.size} | ${rupee(product.price)}</span></div><div class="qty"><button class="ripple" data-dec="${product.id}">-</button><span>${qty}</span><button class="ripple" data-inc="${product.id}">+</button></div><button class="remove ripple" data-remove="${product.id}">x</button></div>`).join("") : `<div class="empty"><div class="empty-illustration">DI</div><strong>Your demo cart is empty</strong><span>Heart products from home, then add them here.</span></div>`;
    $("subtotal").textContent = rupee(t.subtotal);
    $("savings").textContent = rupee(t.savings);
    if ($("couponDiscount")) $("couponDiscount").textContent = `-${rupee(t.coupon)}`;
    $("platformFee").textContent = rupee(t.platform);
    $("gst").textContent = rupee(t.gst);
    $("grandTotal").textContent = rupee(t.grand);
    if ($("couponBox")) {
      $("couponBox").innerHTML = (state.settings.demoCoupons || []).map((coupon) => {
        const active = state.activeCoupon === coupon.code;
        return `<button class="coupon ${active ? "active" : ""}" data-coupon="${coupon.code}"><strong>${coupon.code}</strong><span>${coupon.label}</span></button>`;
      }).join("");
    }
    if ($("recoveryKit")) {
      const hasAlcohol = t.lines.some((line) => alcoholSet.has(line.product.category));
      $("recoveryKit").hidden = !hasAlcohol || state.recoveryDismissed;
      if (!$("recoveryKit").hidden) {
        $("recoveryKit").innerHTML = `
          <button data-dismiss-recovery class="remove ripple">x</button>
          <strong>Comfort and hydration add-ons</strong>
          <p>${(state.settings.recoveryKit || []).join(", ")}</p>`;
      }
    }
  }

  function render() {
    const query = $("wishlistSearch").value.toLowerCase();
    const items = state.products.filter((item) => state.wishlist.has(item.id) && `${item.name} ${item.brand} ${item.category}`.toLowerCase().includes(query));
    $("wishlistGrid").innerHTML = items.length ? items.map(card).join("") : `<div class="empty"><div class="empty-illustration">DI</div><strong>No wishlist items yet</strong><span>Heart products from the home page to save them locally.</span></div>`;
  }

  function openCart() {
    $("cartDrawer").classList.add("open");
    $("overlay").hidden = false;
  }

  function closeCart() {
    $("cartDrawer").classList.remove("open");
    $("overlay").hidden = true;
  }

  function bind() {
    $("wishlistSearch").addEventListener("input", render);
    $("themeToggle").addEventListener("click", () => {
      document.documentElement.classList.toggle("dark");
      localStorage.setItem("drinkit_theme", document.documentElement.classList.contains("dark") ? "dark" : "light");
    });
    $("openCart").addEventListener("click", openCart);
    $("cartFab").addEventListener("click", openCart);
    $("bottomCart").addEventListener("click", openCart);
    $("closeCart").addEventListener("click", closeCart);
    $("overlay").addEventListener("click", closeCart);
    $("shareCart").addEventListener("click", () => {
      Cart.shareCart(state.cart, state.products, state.settings, state.activeCoupon);
      alert("Shareable cart link copied.");
    });
    $("downloadReceipt").addEventListener("click", () => {
      Cart.downloadReceipt({
        cart: state.cart,
        products: state.products,
        settings: state.settings,
        activeCoupon: state.activeCoupon
      });
    });
    document.addEventListener("click", (event) => {
      const target = event.target.closest("button");
      if (!target) return;
      if (target.dataset.add) {
        state.cart[target.dataset.add] = (state.cart[target.dataset.add] || 0) + 1;
        saveCart();
      }
      if (target.dataset.inc) {
        state.cart[target.dataset.inc] = (state.cart[target.dataset.inc] || 0) + 1;
        saveCart();
      }
      if (target.dataset.dec) {
        state.cart[target.dataset.dec] -= 1;
        if (state.cart[target.dataset.dec] <= 0) delete state.cart[target.dataset.dec];
        saveCart();
      }
      if (target.dataset.remove) {
        delete state.cart[target.dataset.remove];
        saveCart();
      }
      if (target.dataset.coupon) {
        state.activeCoupon = state.activeCoupon === target.dataset.coupon ? "" : target.dataset.coupon;
        localStorage.setItem("drinkit_coupon", state.activeCoupon);
        renderCart();
      }
      if (target.dataset.dismissRecovery !== undefined) {
        state.recoveryDismissed = true;
        localStorage.setItem("drinkit_recovery_dismissed", "1");
        renderCart();
      }
      if (target.dataset.wish) {
        state.wishlist.delete(target.dataset.wish);
        localStorage.setItem("drinkit_wishlist", JSON.stringify([...state.wishlist]));
        render();
      }
    });
  }

  async function init() {
    const theme = localStorage.getItem("drinkit_theme");
    if (theme === "dark") document.documentElement.classList.add("dark");
    state.settings = await window.DrinkItStore.getSettings();
    state.products = await window.DrinkItStore.list("products");
    render();
    renderCart();
    bind();
  }

  init();
})();
