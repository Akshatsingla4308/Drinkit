(function () {
  const state = {
    products: [],
    categories: [],
    settings: {},
    cart: JSON.parse(localStorage.getItem("drinkit_cart") || "{}"),
    wishlist: new Set(JSON.parse(localStorage.getItem("drinkit_wishlist") || "[]")),
    filters: { category: "", brand: "", type: "", size: "", search: "", rating: 0, price: 30000, availability: "all", sort: "featured" },
    recoveryDismissed: localStorage.getItem("drinkit_recovery_dismissed") === "1",
    visibleCount: 96,
    activeCoupon: localStorage.getItem("drinkit_coupon") || "",
    logoClicks: 0,
    typed: ""
  };

  const $ = (id) => document.getElementById(id);
  const alcoholSet = new Set(window.DrinkItSeed.alcoholCategories);
  const Cart = window.DrinkItCart;
  const rupee = Cart.rupee;
  const imageAttrs = Cart.imageAttrs;
  const debounce = (fn, wait) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), wait);
    };
  };

  function saveCart() {
    localStorage.setItem("drinkit_cart", JSON.stringify(state.cart));
    renderCart();
  }

  function cartLines() {
    return Cart.cartLines(state.cart, state.products);
  }

  function calculateTotals() {
    if (!state.products || !state.products.length) {
      state.products = (window.DrinkItSeed && window.DrinkItSeed.products) || [];
    }
    return Cart.calculateTotals(state.cart, state.products, state.settings, state.activeCoupon);
  }

  function productCard(product, compact = false) {
    const saved = state.wishlist.has(product.id);
    return `
      <article class="product-card ${compact ? "compact-card" : ""}">
        <a class="product-link" href="product.html?id=${encodeURIComponent(product.id)}" aria-label="View ${product.name}">
          <img ${imageAttrs(product)} alt="${product.name}" loading="lazy">
        </a>
        <button class="heart ${saved ? "saved" : ""}" data-wish="${product.id}" aria-label="Wishlist ${product.name}">♥</button>
        <div class="product-body">
          <p class="chip">${product.offer || product.category}</p>
          <h3><a href="product.html?id=${encodeURIComponent(product.id)}">${product.name}</a></h3>
          <p class="muted">${product.brand} · ${product.size}</p>
          <p class="description">${product.description}</p>
          <div class="rating"><span>★ ${product.rating}</span> <span>${product.available ? `${product.stock} in stock` : "Unavailable"}</span></div>
          <div class="price-row"><strong>${rupee(product.price)}</strong><span>${rupee(product.mrp)}</span><em>Save ${rupee(product.savings || product.mrp - product.price)}</em></div>
          <button class="add-btn ripple" data-add="${product.id}" ${product.available ? "" : "disabled"}>${product.available ? "Add to Cart" : "Out of stock"}</button>
        </div>
      </article>`;
  }

  function renderCategories() {
    $("categoryRail").innerHTML = state.categories.sort((a, b) => a.order - b.order).map((cat) => `
      <button class="category-chip ripple" data-category="${cat.name}">
        <img src="${cat.image}" alt="${cat.name}" loading="lazy">
        <strong>${cat.name}</strong>
      </button>`).join("");

    $("categoryFilter").innerHTML = `<option value="">All categories</option>${state.categories.map((cat) => `<option>${cat.name}</option>`).join("")}`;
  }

  function shelf(title, items, subtitle) {
    return `
      <section class="section shelf">
        <div class="section-head">
          <div><p class="eyebrow">${subtitle}</p><h2>${title}</h2></div>
        </div>
        <div class="mini-grid">${items.slice(0, 10).map((item) => productCard(item, true)).join("")}</div>
      </section>`;
  }

  function renderShelves() {
    const recentIds = JSON.parse(localStorage.getItem("drinkit_recent_views") || "[]");
    const recent = recentIds.map((id) => state.products.find((item) => item.id === id)).filter(Boolean);
    const under500 = state.products.filter((item) => item.price <= 500 && item.available);
    const newest = [...state.products].sort((a, b) => b.createdAt - a.createdAt);
    const shelves = [
      shelf("Trending Now", state.products.filter((item) => item.trending), "Hot today"),
      shelf("Best Sellers", state.products.filter((item) => item.bestSeller), "Crowd picks"),
      shelf("Recommended", state.products.filter((item) => item.featured && item.available), "For your demo cart"),
      shelf("Top Rated", state.products.filter((item) => item.topRated), "Highly rated"),
      shelf("New Arrivals", newest, "Fresh on the shelf"),
      shelf("Under Rs. 500", under500, "Value shelf"),
      shelf("Premium Collection", state.products.filter((item) => item.premium), "High-end picks"),
      shelf("Party Picks", state.products.filter((item) => /Party|Mixer|Happy/.test(item.offer || "")), "Bundle energy"),
      shelf("Weekend Specials", state.products.filter((item) => /Weekend|Festival/.test(item.offer || "")), "Fake offers")
    ];
    if (recent.length) shelves.splice(3, 0, shelf("Recently Viewed", recent, "Continue browsing"));
    $("featuredShelves").innerHTML = shelves.join("");
  }

  function filteredProducts() {
    const search = state.filters.search.trim().toLowerCase();
    const items = state.products.filter((product) => {
      const text = `${product.name} ${product.brand} ${product.category} ${product.description} ${product.offer}`.toLowerCase();
      return (!search || text.includes(search)) &&
        (!state.filters.category || product.category === state.filters.category) &&
        (!state.filters.brand || product.brand === state.filters.brand) &&
        (!state.filters.type || product.type === state.filters.type) &&
        (!state.filters.size || product.size === state.filters.size) &&
        product.rating >= Number(state.filters.rating) &&
        product.price <= Number(state.filters.price) &&
        (state.filters.availability !== "available" || product.available);
    });
    const sorters = {
      featured: (a, b) => Number(b.featured) - Number(a.featured) || Number(b.bestSeller) - Number(a.bestSeller) || b.rating - a.rating,
      priceAsc: (a, b) => a.price - b.price,
      priceDesc: (a, b) => b.price - a.price,
      rating: (a, b) => b.rating - a.rating,
      recent: (a, b) => b.createdAt - a.createdAt
    };
    return items.sort(sorters[state.filters.sort]);
  }

  function renderProducts() {
    const items = filteredProducts();
    const visible = items.slice(0, state.visibleCount);
    $("resultCount").textContent = `${items.length.toLocaleString("en-IN")} products`;
    $("catalogTitle").textContent = state.filters.category || (state.filters.search ? "Search results" : "Full Catalog");
    $("productGrid").innerHTML = visible.map((item) => productCard(item)).join("");
    $("loadMore").hidden = visible.length >= items.length;
  }

  function populateFilterOptions() {
    const unique = (key) => [...new Set(state.products.map((item) => item[key]).filter(Boolean))].sort();
    $("brandFilter").innerHTML = `<option value="">All brands</option>${unique("brand").map((value) => `<option>${value}</option>`).join("")}`;
    $("typeFilter").innerHTML = `<option value="">All types</option>${unique("type").map((value) => `<option>${value}</option>`).join("")}`;
    $("sizeFilter").innerHTML = `<option value="">All sizes</option>${unique("size").map((value) => `<option>${value}</option>`).join("")}`;
  }

  function renderPartyBuilder() {
    const labels = [
      ["House Party", "4+ people"],
      ["Birthday Party", "Celebrate big"],
      ["Couple Night", "Low-key picks"],
      ["Match Night", "Snacks and beer"],
      ["Weekend Chill", "Easy vibes"],
      ["College Party", "Budget combo"],
      ["Road Trip", "Travel ready"],
      ["Office Celebration", "Toast the team"],
      ["Budget Party", "Under control"],
      ["Premium Party", "Top shelf"]
    ];
    $("partyBuilder").innerHTML = labels.map(([name, note]) => `
      <button class="party-kit-card ripple" data-party="${name}">
        <strong>${name}</strong>
        <span>${note}</span>
        <span class="kit-btn">Select Curated Bar</span>
      </button>`).join("");
  }

  function buildPartyCart(name) {
    const slugs = (state.settings.partyKits || {})[name] || [];
    slugs.forEach((catSlug, index) => {
      const product = state.products.find((item) => item.available && item.category.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") === catSlug);
      if (product) state.cart[product.id] = (state.cart[product.id] || 0) + (index < 2 ? 2 : 1);
    });
    state.recoveryDismissed = false;
    localStorage.removeItem("drinkit_recovery_dismissed");
    saveCart();
    openCart();
    confetti();
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
    $("couponDiscount").textContent = `-${rupee(totals.coupon)}`;
  }

  function renderCart() {
    const totals = calculateTotals();
    $("cartCount").textContent = totals.itemCount;
    $("deliveryEta").textContent = `ETA ${state.settings.deliveryEta || "18-24 min"}`;
    $("cartItems").innerHTML = totals.lines.length ? totals.lines.map(({ product, qty }) => `
      <div class="cart-line">
        <img ${imageAttrs(product)} alt="">
        <div><strong>${product.name}</strong><span>${product.size} | ${rupee(product.price)}</span></div>
        <div class="qty">
          <button class="ripple" data-dec="${product.id}">-</button><span>${qty}</span><button class="ripple" data-inc="${product.id}">+</button>
        </div>
        <button class="remove ripple" data-remove="${product.id}">x</button>
      </div>`).join("") : `
      <div class="empty">
        <div class="empty-illustration">DI</div>
        <strong>Your demo cart is empty</strong>
        <span>Use Party Builder or add products from any shelf.</span>
      </div>`;
    $("subtotal").textContent = rupee(totals.subtotal);
    $("savings").textContent = rupee(totals.savings);
    $("platformFee").textContent = rupee(totals.platform);
    $("gst").textContent = rupee(totals.gst);
    $("grandTotal").textContent = rupee(totals.grand);
    renderCoupons(totals);
    renderRecovery(totals.lines);
  }

  function renderRecovery(lines) {
    const hasAlcohol = lines.some((line) => alcoholSet.has(line.product.category));
    $("recoveryKit").hidden = !hasAlcohol || state.recoveryDismissed;
    if (!$("recoveryKit").hidden) {
      $("recoveryKit").innerHTML = `
        <button data-dismiss-recovery class="remove ripple">x</button>
        <strong>Comfort and hydration add-ons</strong>
        <p>${(state.settings.recoveryKit || []).join(", ")}</p>
        <small>Suggested as general comfort items only. It does not reduce intoxication.</small>`;
    }
  }

  function addToCart(id) {
    state.cart[id] = (state.cart[id] || 0) + 1;
    saveCart();
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

  function showSuggestions() {
    const value = $("searchInput").value.trim().toLowerCase();
    const recent = JSON.parse(localStorage.getItem("drinkit_recent_searches") || "[]");
    const popular = state.settings.popularSearches || window.DrinkItSeed.settings.popularSearches || [];
    let html = "";
    if (!value) {
      if (recent.length) {
        html += `<p class="suggest-label">Recent</p>${recent.map((item) => `<button data-suggest="${item}">${item}</button>`).join("")}`;
      }
      html += `<p class="suggest-label">Popular</p>${popular.map((item) => `<button data-suggest="${item}">${item}</button>`).join("")}`;
      $("suggestions").innerHTML = html;
      $("suggestions").hidden = false;
      return;
    }
    const brands = [...new Set(state.products.map((p) => p.brand).filter((b) => b.toLowerCase().includes(value)))].slice(0, 3);
    const cats = state.categories.filter((c) => c.name.toLowerCase().includes(value)).slice(0, 3);
    const products = state.products.filter((p) => `${p.name} ${p.brand} ${p.category}`.toLowerCase().includes(value)).slice(0, 6);
    if (cats.length) html += `<p class="suggest-label">Categories</p>${cats.map((c) => `<button data-suggest="${c.name}">${c.name}</button>`).join("")}`;
    if (brands.length) html += `<p class="suggest-label">Brands</p>${brands.map((b) => `<button data-suggest="${b}">${b}</button>`).join("")}`;
    if (products.length) html += `<p class="suggest-label">Products</p>${products.map((p) => `<button data-suggest="${p.name}">${p.name}</button>`).join("")}`;
    $("suggestions").innerHTML = html || `<button data-suggest="${$("searchInput").value.trim()}">Search "${$("searchInput").value.trim()}"</button>`;
    $("suggestions").hidden = false;
  }

  function updateRecentSearch(value) {
    if (!value) return;
    const recent = JSON.parse(localStorage.getItem("drinkit_recent_searches") || "[]").filter((item) => item !== value);
    recent.unshift(value);
    localStorage.setItem("drinkit_recent_searches", JSON.stringify(recent.slice(0, 8)));
  }

  function shareCart() {
    Cart.shareCart(state.cart, state.products, state.settings, state.activeCoupon);
    alert("Shareable cart link copied.");
  }

  function loadSharedCart() {
    const params = new URLSearchParams(location.search);
    const payload = params.get("cart");
    const query = params.get("q");
    if (query) {
      $("searchInput").value = query;
      state.filters.search = query;
      updateRecentSearch(query);
      setTimeout(() => document.querySelector("#catalog")?.scrollIntoView({ behavior: "smooth" }), 120);
    }
    if (!payload) return;
    try {
      const decoded = JSON.parse(decodeURIComponent(escape(atob(payload))));
      if (decoded.cart) state.cart = decoded.cart;
      if (decoded.coupon) state.activeCoupon = decoded.coupon;
      history.replaceState({}, "", location.pathname);
      saveCart();
      openCart();
    } catch (error) {
      console.warn("Invalid shared cart", error);
    }
  }

  function downloadReceipt() {
    Cart.downloadReceipt({
      cart: state.cart,
      products: state.products,
      settings: state.settings,
      activeCoupon: state.activeCoupon,
      websiteName: state.settings.websiteName
    });
  }

  function confetti() {
    Cart.confetti();
  }

  function beerAnimation() {
    for (let i = 0; i < 22; i += 1) {
      const bubble = document.createElement("span");
      bubble.className = "beer-bubble";
      bubble.style.left = `${8 + Math.random() * 84}%`;
      bubble.style.animationDelay = `${Math.random() * 0.8}s`;
      document.body.appendChild(bubble);
      setTimeout(() => bubble.remove(), 2600);
    }
  }

  function partyMode() {
    document.documentElement.classList.toggle("party-mode");
    confetti();
    beerAnimation();
  }

  function bindEvents() {
    const debouncedSearch = debounce(() => {
      state.visibleCount = 96;
      renderProducts();
      showSuggestions();
    }, 180);

    document.addEventListener("click", (event) => {
      const target = event.target.closest("button, a");
      if (!target) return;
      const rippleTarget = target.closest(".ripple");
      if (rippleTarget) {
        const pulse = document.createElement("span");
        pulse.className = "ripple-dot";
        rippleTarget.appendChild(pulse);
        setTimeout(() => pulse.remove(), 550);
      }
      if (target.dataset.add) addToCart(target.dataset.add);
      if (target.dataset.party) buildPartyCart(target.dataset.party);
      if (target.dataset.coupon) {
        state.activeCoupon = state.activeCoupon === target.dataset.coupon ? "" : target.dataset.coupon;
        localStorage.setItem("drinkit_coupon", state.activeCoupon);
        renderCart();
      }
      if (target.dataset.wish) {
        state.wishlist.has(target.dataset.wish) ? state.wishlist.delete(target.dataset.wish) : state.wishlist.add(target.dataset.wish);
        localStorage.setItem("drinkit_wishlist", JSON.stringify([...state.wishlist]));
        renderProducts();
        renderShelves();
      }
      if (target.dataset.category) {
        state.filters.category = target.dataset.category;
        $("categoryFilter").value = state.filters.category;
        state.visibleCount = 96;
        renderProducts();
        document.querySelector("#catalog").scrollIntoView({ behavior: "smooth" });
      }
      if (target.dataset.inc) addToCart(target.dataset.inc);
      if (target.dataset.dec) {
        state.cart[target.dataset.dec] -= 1;
        if (state.cart[target.dataset.dec] <= 0) delete state.cart[target.dataset.dec];
        saveCart();
      }
      if (target.dataset.remove) {
        delete state.cart[target.dataset.remove];
        saveCart();
      }
      if (target.dataset.dismissRecovery !== undefined) {
        state.recoveryDismissed = true;
        localStorage.setItem("drinkit_recovery_dismissed", "1");
        renderCart();
      }
      if (target.dataset.suggest) {
        $("searchInput").value = target.dataset.suggest;
        state.filters.search = target.dataset.suggest;
        updateRecentSearch(target.dataset.suggest);
        $("suggestions").hidden = true;
        state.visibleCount = 96;
        renderProducts();
      }
    });

    ["categoryFilter", "brandFilter", "typeFilter", "sizeFilter", "sortSelect"].forEach((id) => {
      $(id).addEventListener("change", (event) => {
        const key = id.replace("Filter", "").replace("sortSelect", "sort");
        state.filters[key] = event.target.value;
        state.visibleCount = 96;
        renderProducts();
      });
    });
    $("ratingFilter").addEventListener("input", (event) => {
      state.filters.rating = event.target.value;
      $("ratingValue").textContent = event.target.value === "0" ? "Any" : `${event.target.value}+`;
      renderProducts();
    });
    $("priceFilter").addEventListener("input", (event) => {
      state.filters.price = event.target.value;
      $("priceValue").textContent = Number(event.target.value) >= 30000 ? "Any" : rupee(event.target.value);
      renderProducts();
    });
    $("searchInput").addEventListener("focus", showSuggestions);
    $("searchInput").addEventListener("input", (event) => {
      state.filters.search = event.target.value;
      debouncedSearch();
    });
    document.addEventListener("click", (event) => {
      if (!event.target.closest(".search-wrap")) $("suggestions").hidden = true;
    });
    $("searchInput").addEventListener("keydown", (event) => {
      if (event.key === "Enter") updateRecentSearch(event.target.value.trim());
    });
    $("availabilityFilter").addEventListener("click", (event) => {
      const button = event.target.closest("button");
      if (!button) return;
      [...$("availabilityFilter").children].forEach((child) => child.classList.toggle("active", child === button));
      state.filters.availability = button.dataset.availability;
      renderProducts();
    });
    $("clearFilters").addEventListener("click", () => {
      state.filters = { category: "", brand: "", type: "", size: "", search: "", rating: 0, price: 30000, availability: "all", sort: "featured" };
      document.querySelectorAll("select").forEach((select) => { select.value = select.id === "sortSelect" ? "featured" : ""; });
      $("searchInput").value = "";
      $("ratingFilter").value = 0;
      $("priceFilter").value = 30000;
      $("ratingValue").textContent = "Any";
      $("priceValue").textContent = "Any";
      state.visibleCount = 96;
      renderProducts();
    });
    $("loadMore").addEventListener("click", () => {
      state.visibleCount += 96;
      renderProducts();
    });
    $("cartFab").addEventListener("click", openCart);
    $("bottomCart").addEventListener("click", openCart);
    $("closeCart").addEventListener("click", closeCart);
    $("overlay").addEventListener("click", closeCart);
    $("shareCart").addEventListener("click", shareCart);
    $("shareCartTop").addEventListener("click", shareCart);
    $("downloadReceipt").addEventListener("click", downloadReceipt);
    $("themeToggle").addEventListener("click", () => {
      document.documentElement.classList.toggle("dark");
      localStorage.setItem("drinkit_theme", document.documentElement.classList.contains("dark") ? "dark" : "light");
    });
    $("placeOrder").addEventListener("click", () => {
      if (!cartLines().length) return;
      closeCart();
      $("successModal").hidden = false;
      confetti();
      state.cart = {};
      saveCart();
    });
    $("backHome").addEventListener("click", () => {
      $("successModal").hidden = true;
      scrollTo({ top: 0, behavior: "smooth" });
    });
    $("guestForm").addEventListener("submit", (event) => {
      event.preventDefault();
      localStorage.setItem("drinkit_guest", $("guestName").value || "Guest");
      $("guestModal").hidden = true;
    });
    $("logoLink").addEventListener("click", () => {
      state.logoClicks += 1;
      if (state.logoClicks >= 7) {
        state.logoClicks = 0;
        partyMode();
      }
    });
    document.addEventListener("keydown", (event) => {
      if (event.key.length !== 1) return;
      state.typed = (state.typed + event.key.toLowerCase()).slice(-10);
      if (state.typed.endsWith("party")) confetti();
      if (state.typed.endsWith("cheers")) beerAnimation();
    });
  }

  async function init() {
    state.settings = await window.DrinkItStore.getSettings();
    state.products = await window.DrinkItStore.list("products");
    state.categories = await window.DrinkItStore.list("categories");
    $("siteName").textContent = state.settings.websiteName || "DrinkIt";
    const theme = localStorage.getItem("drinkit_theme");
    if (theme === "dark" || (!theme && state.settings.darkModeDefault)) document.documentElement.classList.add("dark");
    if (!localStorage.getItem("drinkit_guest")) {
      localStorage.setItem("drinkit_guest", "Connoisseur");
    }
    if ($("guestModal")) $("guestModal").hidden = true;
    renderPartyBuilder();
    renderCategories();
    populateFilterOptions();
    bindEvents();
    loadSharedCart();
    renderShelves();
    renderProducts();
    renderCart();
  }

  init();
})();
