(function () {
  const state = { products: [], categories: [], settings: {}, editingProduct: null, editingCategory: null, selected: new Set() };
  const $ = (id) => document.getElementById(id);
  const slug = (value) => String(value).toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const rupee = (value) => `Rs. ${Math.round(Number(value) || 0).toLocaleString("en-IN")}`;

  function productTemplate(product = {}) {
    product = product || {};
    return `
      <input type="hidden" name="id" value="${product.id || ""}">
      <label>Name<input name="name" required value="${product.name || ""}"></label>
      <label>Brand<input name="brand" required value="${product.brand || ""}"></label>
      <label>Category<select name="category">${state.categories.map((cat) => `<option ${cat.name === product.category ? "selected" : ""}>${cat.name}</option>`).join("")}</select></label>
      <label>Size<input name="size" value="${product.size || "750 ml"}"></label>
      <label>Price<input name="price" type="number" min="0" value="${product.price || 999}"></label>
      <label>MRP<input name="mrp" type="number" min="0" value="${product.mrp || 1199}"></label>
      <label>Discount %<input name="discount" type="number" min="0" max="95" value="${product.discount || 10}"></label>
      <label>Rating<input name="rating" type="number" min="0" max="5" step="0.1" value="${product.rating || 4.2}"></label>
      <label>Stock<input name="stock" type="number" min="0" value="${product.stock || 10}"></label>
      <label class="wide">Image Path / URL<input name="image" id="productImageInput" value="${product.image || ""}" placeholder="images/products/id.jpg"></label>
      <label class="wide">Description<textarea name="description">${product.description || ""}</textarea></label>
      <label class="check"><input name="available" type="checkbox" ${product.available !== false ? "checked" : ""}> Available</label>
      <label class="check"><input name="featured" type="checkbox" ${product.featured ? "checked" : ""}> Featured</label>
      <div class="form-actions">
        <button class="primary-btn" type="submit">Save Product</button>
        <button class="secondary-btn" type="button" id="cancelProduct">Clear</button>
        ${product.id ? `<button class="secondary-btn" type="button" id="duplicateProduct" data-duplicate="${product.id}">Duplicate</button>` : ""}
      </div>`;
  }

  function categoryTemplate(category = {}) {
    category = category || {};
    return `
      <input type="hidden" name="id" value="${category.id || ""}">
      <label>Name<input name="name" required value="${category.name || ""}"></label>
      <label>Icon<input name="icon" value="${category.icon || ""}"></label>
      <label>Display Order<input name="order" type="number" value="${category.order ?? state.categories.length}"></label>
      <label class="wide">Image URL<input name="image" value="${category.image || ""}"></label>
      <div class="form-actions"><button class="primary-btn" type="submit">Save Category</button><button class="secondary-btn" type="button" id="cancelCategory">Clear</button></div>`;
  }

  function settingsTemplate() {
    const settings = state.settings;
    return `
      <label>Website Name<input name="websiteName" value="${settings.websiteName || "DrinkIt"}"></label>
      <label>Delivery Fee<input name="deliveryFee" type="number" min="0" value="${settings.deliveryFee || 0}"></label>
      <label>Platform Fee<input name="platformFee" type="number" min="0" value="${settings.platformFee || 0}"></label>
      <label>GST %<input name="gstPercent" type="number" min="0" step="0.1" value="${settings.gstPercent || 0}"></label>
      <label>Delivery ETA<input name="deliveryEta" value="${settings.deliveryEta || "18-24 min"}"></label>
      <label>Admin Username<input name="adminUsername" value="${settings.adminUsername || ""}"></label>
      <label>Admin Password<input name="adminPassword" type="password" value="${settings.adminPassword || ""}"></label>
      <label class="wide">Recovery Kit Items<textarea name="recoveryKit">${(settings.recoveryKit || []).join(", ")}</textarea></label>
      <label class="wide">Popular Searches<textarea name="popularSearches">${(settings.popularSearches || []).join(", ")}</textarea></label>
      <label class="check"><input name="darkModeDefault" type="checkbox" ${settings.darkModeDefault ? "checked" : ""}> Dark mode default</label>
      <div class="form-actions"><button class="primary-btn" type="submit">Save Settings</button></div>`;
  }

  function renderDashboard() {
    const prices = state.products.map((p) => Number(p.price) || 0).filter((n) => n > 0);
    const avg = prices.length ? prices.reduce((a, b) => a + b, 0) / prices.length : 0;
    $("productCount").textContent = state.products.length;
    $("categoryCount").textContent = state.categories.length;
    $("availableCount").textContent = state.products.filter((p) => p.available).length;
    $("unavailableCount").textContent = state.products.filter((p) => !p.available).length;
    $("featuredCount").textContent = state.products.filter((p) => p.featured).length;
    $("avgPrice").textContent = rupee(avg);
    $("highPrice").textContent = rupee(prices.length ? Math.max(...prices) : 0);
    $("lowPrice").textContent = rupee(prices.length ? Math.min(...prices) : 0);
    const recent = [...state.products].sort((a, b) => Number(b.editedAt || b.createdAt || 0) - Number(a.editedAt || a.createdAt || 0)).slice(0, 8);
    $("recentEdited").innerHTML = recent.map((p) => `
      <div class="table-row compact">
        <div><strong>${p.name}</strong><small>${p.brand} · ${p.category}</small></div>
        <div>${rupee(p.price)}</div>
        <div>${p.available ? "In stock" : "Unavailable"}</div>
        <div class="row-actions"><button data-edit-product="${p.id}">Edit</button></div>
      </div>`).join("") || `<p class="muted">No products yet.</p>`;
  }

  function filteredProducts() {
    const query = $("adminProductSearch").value.toLowerCase();
    return state.products.filter((p) => `${p.name} ${p.brand} ${p.category}`.toLowerCase().includes(query));
  }

  function renderProductTable() {
    const rows = filteredProducts().slice(0, 200);
    $("productTable").innerHTML = rows.map((p) => `
      <div class="table-row">
        <label class="check row-check"><input type="checkbox" data-select="${p.id}" ${state.selected.has(p.id) ? "checked" : ""}></label>
        <div class="thumb-cell"><img src="${p.image}" alt="" loading="lazy" onerror="this.onerror=null;this.src='${p.fallbackImage || window.DrinkItSeed.placeholder}'"><div><strong>${p.name}</strong><small>${p.brand} · ${p.size}</small></div></div>
        <div>${p.category}</div>
        <div>${rupee(p.price)}</div>
        <div>${p.available ? "In stock" : "Hidden"}</div>
        <div class="row-actions">
          <button data-edit-product="${p.id}">Edit</button>
          <button data-duplicate="${p.id}">Duplicate</button>
          <button data-delete-product="${p.id}">Delete</button>
        </div>
      </div>`).join("");
  }

  function renderCategoryTable() {
    $("categoryTable").innerHTML = state.categories.sort((a, b) => Number(a.order) - Number(b.order)).map((cat) => `
      <div class="table-row category">
        <div><strong>${cat.name}</strong><small>${cat.id}</small></div>
        <div>${cat.icon || ""}</div>
        <div>${cat.order}</div>
        <div class="row-actions"><button data-edit-category="${cat.id}">Edit</button><button data-delete-category="${cat.id}">Delete</button></div>
      </div>`).join("");
  }

  function updateImagePreview() {
    const input = $("productImageInput");
    const wrap = $("imagePreviewWrap");
    const img = $("imagePreview");
    if (!input || !wrap || !img) return;
    const value = input.value.trim();
    if (!value) {
      wrap.hidden = true;
      return;
    }
    img.src = value;
    img.onerror = () => {
      img.src = (state.editingProduct && state.editingProduct.fallbackImage) || window.DrinkItSeed.placeholder;
    };
    wrap.hidden = false;
  }

  function renderForms() {
    $("productForm").innerHTML = productTemplate(state.editingProduct);
    $("categoryForm").innerHTML = categoryTemplate(state.editingCategory);
    $("settingsForm").innerHTML = settingsTemplate();
    updateImagePreview();
  }

  function renderAll() {
    renderDashboard();
    renderForms();
    renderProductTable();
    renderCategoryTable();
  }

  function formData(form) {
    return Object.fromEntries(new FormData(form).entries());
  }

  async function duplicateProduct(id) {
    const source = state.products.find((p) => p.id === id);
    if (!source) return;
    const copy = {
      ...source,
      id: `${slug(source.name)}-copy-${Date.now()}`,
      name: `${source.name} Copy`,
      createdAt: Date.now(),
      editedAt: Date.now()
    };
    await window.DrinkItStore.upsert("products", copy);
    state.editingProduct = copy;
    await loadData();
    $("productForm").scrollIntoView({ behavior: "smooth" });
  }

  function downloadBlob(filename, content, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  function toCsv(rows) {
    const headers = ["id", "name", "brand", "category", "size", "price", "mrp", "discount", "rating", "stock", "available", "featured", "image", "description"];
    const escape = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;
    const lines = [headers.join(",")];
    rows.forEach((row) => {
      lines.push(headers.map((key) => escape(row[key])).join(","));
    });
    return lines.join("\n");
  }

  function parseCsv(text) {
    const lines = text.replace(/\r/g, "").split("\n").filter(Boolean);
    if (!lines.length) return [];
    const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
    return lines.slice(1).map((line) => {
      const values = [];
      let current = "";
      let inQuotes = false;
      for (let i = 0; i < line.length; i += 1) {
        const char = line[i];
        if (char === '"') {
          if (inQuotes && line[i + 1] === '"') {
            current += '"';
            i += 1;
          } else inQuotes = !inQuotes;
        } else if (char === "," && !inQuotes) {
          values.push(current);
          current = "";
        } else current += char;
      }
      values.push(current);
      const row = {};
      headers.forEach((header, index) => {
        row[header] = (values[index] || "").trim();
      });
      return row;
    });
  }

  function normalizeImportedProduct(row) {
    const category = row.category || state.categories[0]?.name || "Whisky";
    return {
      id: row.id || slug(`${category}-${row.brand || "brand"}-${row.name || "item"}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`),
      name: row.name || "Untitled Product",
      brand: row.brand || "DrinkIt",
      category,
      size: row.size || "750 ml",
      price: Number(row.price) || 0,
      mrp: Number(row.mrp) || Number(row.price) || 0,
      discount: Number(row.discount) || 0,
      rating: Number(row.rating) || 4,
      stock: Number(row.stock) || 10,
      available: String(row.available).toLowerCase() !== "false" && row.available !== "0",
      featured: String(row.featured).toLowerCase() === "true" || row.featured === "1",
      image: row.image || `images/products/${slug(row.name || "item")}.jpg`,
      description: row.description || `${row.name || "Product"} demo listing for DrinkIt.`,
      type: window.DrinkItSeed.alcoholCategories.includes(category) ? "Alcohol" : "Essentials",
      savings: Math.max(0, (Number(row.mrp) || 0) - (Number(row.price) || 0)),
      createdAt: Date.now(),
      editedAt: Date.now(),
      fallbackImage: window.DrinkItSeed.placeholder
    };
  }

  async function importProducts(rows) {
    for (const row of rows) {
      await window.DrinkItStore.upsert("products", normalizeImportedProduct(row));
    }
    await loadData();
    alert(`Imported ${rows.length} products.`);
  }

  async function setAvailability(ids, available) {
    for (const id of ids) {
      const product = state.products.find((p) => p.id === id);
      if (!product) continue;
      await window.DrinkItStore.upsert("products", { ...product, available, editedAt: Date.now() });
    }
    state.selected.clear();
    await loadData();
  }

  function bindEvents() {
    $("loginForm").addEventListener("submit", (event) => {
      event.preventDefault();
      const ok = $("username").value === state.settings.adminUsername && $("password").value === state.settings.adminPassword;
      $("loginError").hidden = ok;
      if (ok) {
        sessionStorage.setItem("drinkit_admin", "1");
        $("loginModal").hidden = true;
      }
    });
    $("logoutBtn").addEventListener("click", () => {
      sessionStorage.removeItem("drinkit_admin");
      $("loginModal").hidden = false;
    });
    document.querySelector(".admin-sidebar nav").addEventListener("click", (event) => {
      const button = event.target.closest("button");
      if (!button) return;
      document.querySelectorAll(".admin-sidebar nav button").forEach((item) => item.classList.toggle("active", item === button));
      document.querySelectorAll(".admin-tab").forEach((tab) => tab.classList.toggle("active", tab.id === button.dataset.tab));
    });
    $("seedBtn").addEventListener("click", async () => {
      const ok = await window.DrinkItStore.seedFirestore();
      alert(ok ? "Firestore seeded." : "Add Firebase config first; local demo seed is already active.");
      await loadData();
    });
    $("newProduct").addEventListener("click", () => { state.editingProduct = null; renderForms(); });
    $("newCategory").addEventListener("click", () => { state.editingCategory = null; renderForms(); });
    $("adminProductSearch").addEventListener("input", renderProductTable);
    $("selectAllProducts").addEventListener("change", (event) => {
      const ids = filteredProducts().slice(0, 200).map((p) => p.id);
      if (event.target.checked) ids.forEach((id) => state.selected.add(id));
      else ids.forEach((id) => state.selected.delete(id));
      renderProductTable();
    });
    $("bulkAvailable").addEventListener("click", async () => {
      if (!state.selected.size) return alert("Select products first.");
      await setAvailability([...state.selected], true);
    });
    $("bulkUnavailable").addEventListener("click", async () => {
      if (!state.selected.size) return alert("Select products first.");
      await setAvailability([...state.selected], false);
    });
    $("bulkDelete").addEventListener("click", async () => {
      if (!state.selected.size) return alert("Select products first.");
      if (!confirm(`Delete ${state.selected.size} products?`)) return;
      for (const id of [...state.selected]) await window.DrinkItStore.remove("products", id);
      state.selected.clear();
      await loadData();
    });
    $("exportCsv").addEventListener("click", () => downloadBlob("drinkit-products.csv", toCsv(state.products), "text/csv"));
    $("exportJson").addEventListener("click", () => downloadBlob("drinkit-products.json", JSON.stringify(state.products, null, 2), "application/json"));
    $("importCsv").addEventListener("change", async (event) => {
      const file = event.target.files?.[0];
      if (!file) return;
      const text = await file.text();
      await importProducts(parseCsv(text));
      event.target.value = "";
    });
    $("importJson").addEventListener("change", async (event) => {
      const file = event.target.files?.[0];
      if (!file) return;
      try {
        const data = JSON.parse(await file.text());
        await importProducts(Array.isArray(data) ? data : [data]);
      } catch (error) {
        alert("Invalid JSON file.");
      }
      event.target.value = "";
    });
    document.addEventListener("click", async (event) => {
      const target = event.target.closest("button");
      if (!target) return;
      if (target.id === "cancelProduct") { state.editingProduct = null; renderForms(); }
      if (target.id === "cancelCategory") { state.editingCategory = null; renderForms(); }
      if (target.dataset.editProduct) {
        state.editingProduct = state.products.find((p) => p.id === target.dataset.editProduct);
        renderForms();
        document.querySelectorAll(".admin-sidebar nav button").forEach((item) => item.classList.toggle("active", item.dataset.tab === "products"));
        document.querySelectorAll(".admin-tab").forEach((tab) => tab.classList.toggle("active", tab.id === "products"));
        $("productForm").scrollIntoView({ behavior: "smooth" });
      }
      if (target.dataset.editCategory) {
        state.editingCategory = state.categories.find((c) => c.id === target.dataset.editCategory);
        renderForms();
        $("categoryForm").scrollIntoView({ behavior: "smooth" });
      }
      if (target.dataset.duplicate) await duplicateProduct(target.dataset.duplicate);
      if (target.dataset.deleteProduct && confirm("Delete this product?")) {
        await window.DrinkItStore.remove("products", target.dataset.deleteProduct);
        state.selected.delete(target.dataset.deleteProduct);
        await loadData();
      }
      if (target.dataset.deleteCategory && confirm("Delete this category?")) {
        await window.DrinkItStore.remove("categories", target.dataset.deleteCategory);
        await loadData();
      }
    });
    document.addEventListener("change", (event) => {
      const select = event.target.closest("[data-select]");
      if (select) {
        if (select.checked) state.selected.add(select.dataset.select);
        else state.selected.delete(select.dataset.select);
      }
      if (event.target.id === "productImageInput") updateImagePreview();
    });
    $("productForm").addEventListener("submit", async (event) => {
      event.preventDefault();
      const data = formData(event.target);
      const price = Number(data.price);
      const mrp = Number(data.mrp);
      const item = {
        ...state.editingProduct,
        ...data,
        id: data.id || slug(`${data.category}-${data.brand}-${data.name}-${Date.now()}`),
        price,
        mrp,
        discount: Number(data.discount),
        rating: Number(data.rating),
        stock: Number(data.stock),
        savings: Math.max(0, mrp - price),
        available: Boolean(data.available),
        featured: Boolean(data.featured),
        type: window.DrinkItSeed.alcoholCategories.includes(data.category) ? "Alcohol" : "Essentials",
        createdAt: state.editingProduct?.createdAt || Date.now(),
        editedAt: Date.now(),
        fallbackImage: state.editingProduct?.fallbackImage || window.DrinkItSeed.placeholder
      };
      await window.DrinkItStore.upsert("products", item);
      state.editingProduct = null;
      await loadData();
    });
    $("productForm").addEventListener("input", (event) => {
      if (event.target.name === "image") updateImagePreview();
    });
    $("categoryForm").addEventListener("submit", async (event) => {
      event.preventDefault();
      const data = formData(event.target);
      const item = { ...state.editingCategory, ...data, id: data.id || slug(data.name), order: Number(data.order) };
      await window.DrinkItStore.upsert("categories", item);
      state.editingCategory = null;
      await loadData();
    });
    $("settingsForm").addEventListener("submit", async (event) => {
      event.preventDefault();
      const data = formData(event.target);
      await window.DrinkItStore.saveSettings({
        websiteName: data.websiteName,
        deliveryFee: Number(data.deliveryFee),
        platformFee: Number(data.platformFee),
        gstPercent: Number(data.gstPercent),
        deliveryEta: data.deliveryEta || "18-24 min",
        adminUsername: data.adminUsername,
        adminPassword: data.adminPassword,
        recoveryKit: data.recoveryKit.split(",").map((item) => item.trim()).filter(Boolean),
        popularSearches: data.popularSearches.split(",").map((item) => item.trim()).filter(Boolean),
        darkModeDefault: Boolean(data.darkModeDefault)
      });
      await loadData();
      alert("Settings saved.");
    });
  }

  async function loadData() {
    state.settings = await window.DrinkItStore.getSettings();
    state.products = await window.DrinkItStore.list("products");
    state.categories = await window.DrinkItStore.list("categories");
    renderAll();
  }

  async function init() {
    await loadData();
    bindEvents();
    $("loginModal").hidden = sessionStorage.getItem("drinkit_admin") === "1";
  }

  init();
})();
