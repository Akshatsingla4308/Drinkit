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

  function productCard(product) {
    const saved = state.wishlist.has(product.id);
    return `
      <article class="product-card compact-card">
        <a class="product-link" href="product.html?id=${encodeURIComponent(product.id)}"><img ${imageAttrs(product)} alt="${product.name}" loading="lazy"></a>
        <button class="heart ${saved ? "saved" : ""}" data-wish="${product.id}">♥</button>
        <div class="product-body">
          <p class="chip">${product.offer || product.category}</p>
          <h3><a href="product.html?id=${encodeURIComponent(product.id)}">${product.name}</a></h3>
          <p class="muted">${product.brand} · ${product.size}</p>
          <div class="rating"><span>★ ${product.rating}</span><span>${product.available ? "In stock" : "Unavailable"}</span></div>
          <div class="price-row"><strong>${rupee(product.price)}</strong><span>${rupee(product.mrp)}</span></div>
          <button class="add-btn ripple" data-add="${product.id}" ${product.available ? "" : "disabled"}>${product.available ? "Add to Cart" : "Out of stock"}</button>
        </div>
      </article>`;
  }

  function saveCart() {
    localStorage.setItem("drinkit_cart", JSON.stringify(state.cart));
    renderCart();
  }

  function renderCoupons(totals) {
    if (!$("couponBox")) return;
    $("couponBox").innerHTML = (state.settings.demoCoupons || []).map((coupon) => {
      const active = state.activeCoupon === coupon.code;
      const minText = coupon.minTotal ? `Min Rs. ${coupon.minTotal.toLocaleString("en-IN")}` : coupon.minItems ? `Min ${coupon.minItems} items` : "";
      return `
        <button class="coupon ${active ? "active" : ""}" data-coupon="${coupon.code}">
          <strong>${coupon.code}</strong>
          <span>${coupon.label}</span>
          ${minText ? `<small class="coupon-min">${minText}</small>` : ""}
        </button>`;
    }).join("");
    if ($("couponDiscount")) $("couponDiscount").textContent = `-${rupee(totals.coupon)}`;
  }

  function renderCart() {
    if (!state.products || !state.products.length) {
      state.products = (window.DrinkItSeed && window.DrinkItSeed.products) || [];
    }
    const t = Cart.calculateTotals(state.cart, state.products, state.settings, state.activeCoupon);
    $("cartCount").textContent = t.itemCount;
    $("deliveryEta").textContent = `ETA ${state.settings.deliveryEta || "18-24 min"}`;
    $("cartItems").innerHTML = t.lines.length ? t.lines.map(({ product, qty }) => `
      <div class="cart-line">
        <img ${imageAttrs(product)} alt="">
        <div><strong>${product.name}</strong><span>${product.size} | ${rupee(product.price)}</span></div>
        <div class="qty"><button class="ripple" data-dec="${product.id}">-</button><span>${qty}</span><button class="ripple" data-inc="${product.id}">+</button></div>
        <button class="remove ripple" data-remove="${product.id}">x</button>
      </div>`).join("") : `<div class="empty"><div class="empty-illustration">DI</div><strong>Your demo cart is empty</strong></div>`;
    $("subtotal").textContent = rupee(t.subtotal);
    $("savings").textContent = rupee(t.savings);
    $("platformFee").textContent = rupee(t.platform);
    $("gst").textContent = rupee(t.gst);
    $("grandTotal").textContent = rupee(t.grand);
    renderCoupons(t);
    const hasAlcohol = t.lines.some((line) => alcoholSet.has(line.product.category));
    $("recoveryKit").hidden = !hasAlcohol || state.recoveryDismissed;
    if (!$("recoveryKit").hidden) {
      $("recoveryKit").innerHTML = `
        <button data-dismiss-recovery class="remove ripple">x</button>
        <strong>Comfort and hydration add-ons</strong>
        <p>${(state.settings.recoveryKit || []).join(", ")}</p>
        <small>Suggested as general comfort items only.</small>`;
    }
  }

  function openCart() {
    renderCart();
    $("cartDrawer").classList.add("open");
    $("cartDrawer").setAttribute("aria-hidden", "false");
    $("overlay").hidden = false;
  }

  function closeCart() {
    $("cartDrawer").classList.remove("open");
    $("cartDrawer").setAttribute("aria-hidden", "true");
    $("overlay").hidden = true;
  }

  function rememberProduct(id) {
    const recent = JSON.parse(localStorage.getItem("drinkit_recent_views") || "[]").filter((item) => item !== id);
    recent.unshift(id);
    localStorage.setItem("drinkit_recent_views", JSON.stringify(recent.slice(0, 12)));
  }

  function renderDetail(product) {
    if (!product) {
      $("productDetail").innerHTML = `<section class="detail-panel"><h1>Product not found</h1><a class="primary-btn" href="./">Return home</a></section>`;
      return;
    }
    document.title = `${product.name} | DrinkIt`;
    rememberProduct(product.id);
    $("productDetail").innerHTML = `
      <div class="detail-media"><img ${imageAttrs(product)} alt="${product.name}"></div>
      <section class="detail-panel">
        <p class="eyebrow">${product.category}</p>
        <h1>${product.name}</h1>
        <div class="detail-meta">
          <span>${product.brand}</span>
          <span>${product.size}</span>
          <span>★ ${product.rating} Rating</span>
          <span>${product.offer || "Cellar Reserve"}</span>
        </div>
        <p>${product.description}</p>
        <div class="price-row">
          <strong>${rupee(product.price)}</strong>
          <span>${rupee(product.mrp)}</span>
          <em>Save ${rupee(product.savings || product.mrp - product.price)}</em>
        </div>
        <div class="hero-actions">
          <button class="primary-btn ripple" data-add="${product.id}" ${product.available ? "" : "disabled"}>${product.available ? "Add to Cellar Cart" : "Out of Stock"}</button>
          <button class="secondary-btn ripple" data-wish="${product.id}">${state.wishlist.has(product.id) ? "♥ Saved to Wishlist" : "♡ Add to Wishlist"}</button>
        </div>
        <div class="info-grid">
          <div class="info-panel">
            <strong>Tasting Notes & Character</strong>
            <p>${product.nutrition}</p>
          </div>
          <div class="info-panel">
            <strong>Cellar Specifications</strong>
            <p>${product.info}</p>
          </div>
          <div class="info-panel">
            <strong>Savoring Etiquette</strong>
            <p>Best served at recommended cellar temperature in appropriate crystal glassware. Enjoy responsibly.</p>
          </div>
        </div>
      </section>`;
    $("relatedGrid").innerHTML = state.products.filter((item) => item.category === product.category && item.id !== product.id).slice(0, 10).map(productCard).join("");
    $("togetherGrid").innerHTML = state.products.filter((item) => ["Cocktail Mixers", "Ice Cubes", "Party Snacks", "Mineral Water", "Plastic Glasses"].includes(item.category) && item.available).slice(0, 10).map(productCard).join("");
    $("similarGrid").innerHTML = state.products
      .filter((item) => item.id !== product.id && item.available && (item.brand === product.brand || item.type === product.type || Math.abs(item.price - product.price) < 400))
      .sort((a, b) => Math.abs(a.price - product.price) - Math.abs(b.price - product.price))
      .slice(0, 10)
      .map(productCard)
      .join("");
  }

  function bind() {
    document.addEventListener("click", (event) => {
      const target = event.target.closest("button");
      if (!target) return;
      if (target.dataset.add) {
        state.cart[target.dataset.add] = (state.cart[target.dataset.add] || 0) + 1;
        saveCart();
        openCart();
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
        state.wishlist.has(target.dataset.wish) ? state.wishlist.delete(target.dataset.wish) : state.wishlist.add(target.dataset.wish);
        localStorage.setItem("drinkit_wishlist", JSON.stringify([...state.wishlist]));
        renderDetail(state.products.find((item) => item.id === new URLSearchParams(location.search).get("id")));
        renderCart();
      }
    });
    $("openCart").addEventListener("click", openCart);
    $("cartFab").addEventListener("click", openCart);
    if ($("bottomCart")) $("bottomCart").addEventListener("click", openCart);
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
    $("placeOrder").addEventListener("click", () => {
      if (!Cart.cartLines(state.cart, state.products).length) return;
      closeCart();
      $("successModal").hidden = false;
      Cart.confetti();
      state.cart = {};
      saveCart();
    });
    $("backHome").addEventListener("click", () => { location.href = "./"; });
    $("detailSearch").addEventListener("keydown", (event) => {
      if (event.key === "Enter") location.href = `./?q=${encodeURIComponent(event.target.value)}`;
    });
  }

  async function init() {
    const theme = localStorage.getItem("drinkit_theme");
    if (theme === "dark") document.documentElement.classList.add("dark");
    state.settings = await window.DrinkItStore.getSettings();
    state.products = await window.DrinkItStore.list("products");
    renderDetail(state.products.find((item) => item.id === new URLSearchParams(location.search).get("id")));
    renderCart();
    bind();
  }

  init();
})();
