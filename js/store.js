(function () {
  const config = window.DRINKIT_FIREBASE_CONFIG || {};
  const hasFirebase = window.firebase && config.projectId && config.projectId !== "YOUR_PROJECT_ID";
  let db = null;

  if (hasFirebase) {
    firebase.initializeApp(config);
    db = firebase.firestore();
  }

  const local = {
    products: [...window.DrinkItSeed.products],
    categories: [...window.DrinkItSeed.categories],
    settings: { ...window.DrinkItSeed.settings }
  };

  function normalizeItem(collectionName, item) {
    if (!item) return item;
    const data = { ...item };
    if (collectionName === "products") {
      if (window.DrinkItImages) {
        data.image = window.DrinkItImages.resolveProductImage(data);
        data.fallbackImage = window.DrinkItImages.resolveCategoryImage(data.category);
      }
      if (typeof data.stock === "number" && data.stock > 0) {
        data.available = true;
      }
    } else if (collectionName === "categories") {
      if (window.DrinkItImages) {
        data.image = window.DrinkItImages.resolveCategoryImage(data.name);
      }
    }
    return data;
  }

  function normalizeDoc(collectionName, doc) {
    const data = { id: doc.id, ...doc.data() };
    return normalizeItem(collectionName, data);
  }

  async function list(collectionName) {
    if (!db) {
      return (local[collectionName] || []).map((item) => normalizeItem(collectionName, item));
    }
    const snap = await db.collection(collectionName).get();
    if (snap.empty && collectionName in local) {
      return (local[collectionName] || []).map((item) => normalizeItem(collectionName, item));
    }
    return snap.docs.map((doc) => normalizeDoc(collectionName, doc));
  }

  async function getSettings() {
    if (!db) return { ...local.settings };
    const doc = await db.collection("settings").doc("store").get();
    return doc.exists ? { ...local.settings, ...doc.data() } : { ...local.settings };
  }

  async function saveSettings(settings) {
    local.settings = { ...local.settings, ...settings };
    if (db) await db.collection("settings").doc("store").set(local.settings, { merge: true });
    return local.settings;
  }

  async function upsert(collectionName, item) {
    const id = item.id || `${collectionName}-${Date.now()}`;
    const payload = { ...item, id };
    const index = local[collectionName].findIndex((entry) => entry.id === id);
    if (index >= 0) local[collectionName][index] = payload;
    else local[collectionName].push(payload);
    if (db) await db.collection(collectionName).doc(id).set(payload, { merge: true });
    return payload;
  }

  async function remove(collectionName, id) {
    local[collectionName] = local[collectionName].filter((entry) => entry.id !== id);
    if (db) await db.collection(collectionName).doc(id).delete();
  }

  async function seedFirestore() {
    if (!db) return false;
    const writes = [];
    window.DrinkItSeed.categories.forEach((item) => writes.push(["categories", item]));
    window.DrinkItSeed.products.forEach((item) => writes.push(["products", item]));
    writes.push(["settings", { id: "store", ...window.DrinkItSeed.settings }]);
    for (let i = 0; i < writes.length; i += 450) {
      const batch = db.batch();
      writes.slice(i, i + 450).forEach(([collectionName, item]) => {
        batch.set(db.collection(collectionName).doc(item.id), item, { merge: true });
      });
      await batch.commit();
    }
    return true;
  }

  window.DrinkItStore = {
    isFirebaseReady: Boolean(db),
    list,
    getSettings,
    saveSettings,
    upsert,
    remove,
    seedFirestore
  };
})();
