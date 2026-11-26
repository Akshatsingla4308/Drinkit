/**
 * DRINKIT — SHARED CART & RECEIPT UTILITIES
 */
(function () {
  const placeholder = () => (window.DrinkItImages && window.DrinkItImages.placeholder) || (window.DrinkItSeed && window.DrinkItSeed.placeholder) || "";

  function rupee(value) {
    return `Rs. ${Math.round(Number(value) || 0).toLocaleString("en-IN")}`;
  }

  // Safe error handler that never throws syntax errors
  window.DrinkItHandleImageError = function (img) {
    if (!img) return;
    const fallback = img.getAttribute("data-fallback");
    if (fallback && img.src !== fallback && !img.dataset.failedOnce) {
      img.dataset.failedOnce = "1";
      img.src = fallback;
    } else {
      img.onerror = null;
      img.src = placeholder();
    }
  };

  function imageAttrs(product) {
    const defaultPlaceholder = placeholder();
    const src = (window.DrinkItImages && window.DrinkItImages.resolveProductImage(product)) || (product && product.image) || defaultPlaceholder;
    const fallback = (window.DrinkItImages && window.DrinkItImages.resolveCategoryImage(product && product.category)) || (product && product.fallbackImage) || defaultPlaceholder;
    return `src="${src}" data-fallback="${fallback}" onerror="window.DrinkItHandleImageError(this)" loading="lazy"`;
  }

  function cartLines(cart, products) {
    const pool = (products && products.length) ? products : ((window.DrinkItSeed && window.DrinkItSeed.products) || []);
    return Object.entries(cart || {})
      .map(([id, qty]) => {
        let product = pool.find((item) => item.id === id);
        if (!product && window.DrinkItSeed && window.DrinkItSeed.products) {
          product = window.DrinkItSeed.products.find((item) => item.id === id);
        }
        return { product, qty: Number(qty) };
      })
      .filter((line) => line.product && line.qty > 0);
  }

  function couponValue(settings, activeCoupon, selling, itemCount) {
    const coupon = ((settings && settings.demoCoupons) || []).find((item) => item.code === activeCoupon);
    if (!coupon) return 0;
    if (coupon.minItems && itemCount < coupon.minItems) return 0;
    if (coupon.minTotal && selling < coupon.minTotal) return 0;
    if (coupon.flat) return Math.min(coupon.flat, selling);
    return selling * Number(coupon.percent || 0) / 100;
  }

  function calculateTotals(cart, products, settings, activeCoupon) {
    const lines = cartLines(cart, products);
    const itemCount = lines.reduce((sum, line) => sum + line.qty, 0);
    const subtotal = lines.reduce((sum, line) => sum + line.product.mrp * line.qty, 0);
    const selling = lines.reduce((sum, line) => sum + line.product.price * line.qty, 0);
    const savings = subtotal - selling;
    const coupon = couponValue(settings, activeCoupon, selling, itemCount);
    const taxable = Math.max(0, selling - coupon);
    const platform = lines.length ? Number((settings && settings.platformFee) || 0) : 0;
    const gst = taxable * Number((settings && settings.gstPercent) || 0) / 100;
    return { lines, itemCount, subtotal, selling, savings, coupon, platform, gst, grand: taxable + platform + gst };
  }

  function drawQr(ctx, x, y, text) {
    ctx.fillStyle = "#1C1C1E";
    ctx.fillRect(x, y, 108, 108);
    ctx.fillStyle = "#C9A96E";
    for (let row = 0; row < 13; row += 1) {
      for (let col = 0; col < 13; col += 1) {
        const code = String(text || "DrinkIt").charCodeAt((row * 13 + col) % String(text || "DrinkIt").length);
        if ((code + row + col) % 3 !== 0) ctx.fillRect(x + 8 + col * 7, y + 8 + row * 7, 5, 5);
      }
    }
  }

  function downloadReceipt({ cart, products, settings, activeCoupon, websiteName }) {
    const totals = calculateTotals(cart, products, settings, activeCoupon);
    const canvas = document.createElement("canvas");
    const height = Math.max(680, 580 + totals.lines.length * 68);
    canvas.width = 980;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    
    // Luxury dark obsidian cellar receipt
    ctx.fillStyle = "#0B0B0D";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = "#141416";
    ctx.fillRect(36, 36, 908, height - 72);
    
    ctx.strokeStyle = "#C9A96E";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(36, 36, 908, height - 72);

    // Monogram Box
    ctx.fillStyle = "#1C1C1E";
    ctx.fillRect(70, 70, 54, 54);
    ctx.strokeStyle = "#C9A96E";
    ctx.lineWidth = 1;
    ctx.strokeRect(70, 70, 54, 54);
    ctx.fillStyle = "#C9A96E";
    ctx.font = "700 32px Georgia";
    ctx.fillText("D", 86, 108);

    ctx.fillStyle = "#F5F1E8";
    ctx.font = "700 38px Georgia";
    ctx.fillText(websiteName || (settings && settings.websiteName) || "DrinkIt", 140, 100);
    ctx.font = "600 14px Arial";
    ctx.fillStyle = "#C9A96E";
    ctx.fillText("CURATED SPIRITS & CELLAR DEMO INVOICE", 140, 126);
    ctx.font = "14px Arial";
    ctx.fillStyle = "#A6A6A6";
    ctx.fillText(new Date().toLocaleString("en-IN"), 140, 150);
    
    drawQr(ctx, 792, 70, JSON.stringify(cart) || "DrinkIt");
    ctx.fillStyle = "#C9A96E";
    ctx.fillText("CELLAR QR", 808, 196);

    let y = 245;
    ctx.fillStyle = "#C9A96E";
    ctx.font = "700 16px Arial";
    ctx.fillText("SELECTED SPIRIT / BEVERAGE", 70, y);
    ctx.fillText("QTY", 650, y);
    ctx.fillText("TOTAL", 790, y);
    y += 20;
    ctx.strokeStyle = "rgba(201, 169, 110, 0.3)";
    ctx.beginPath();
    ctx.moveTo(70, y);
    ctx.lineTo(890, y);
    ctx.stroke();
    y += 38;
    ctx.font = "16px Arial";
    totals.lines.forEach(({ product, qty }) => {
      ctx.fillStyle = "#F5F1E8";
      ctx.fillText(`${product.name} (${product.size})`.slice(0, 54), 70, y);
      ctx.fillStyle = "#A6A6A6";
      ctx.fillText(product.offer || "Cellar Edition", 70, y + 22);
      ctx.fillStyle = "#F5F1E8";
      ctx.fillText(String(qty), 660, y);
      ctx.fillText(rupee(product.price * qty), 790, y);
      y += 64;
    });
    y += 20;
    [
      ["Subtotal (MRP)", totals.subtotal],
      ["Cellar Privileges / Savings", -totals.savings],
      ["Promo Code Applied", -totals.coupon],
      ["Platform Fee", totals.platform],
      [`GST ${(settings && settings.gstPercent) || 0}%`, totals.gst],
      ["Grand Total", totals.grand]
    ].forEach(([label, value]) => {
      ctx.font = label === "Grand Total" ? "700 22px Georgia" : "16px Arial";
      ctx.fillStyle = label === "Grand Total" ? "#C9A96E" : "#F5F1E8";
      ctx.fillText(label, 520, y);
      ctx.fillText(`${value < 0 ? "-" : ""}${rupee(Math.abs(value))}`, 790, y);
      y += 36;
    });

    ctx.fillStyle = "#C9A96E";
    ctx.font = "700 16px Arial";
    ctx.fillText("VERIFIED CELLAR DEMO RECEIPT", 70, height - 120);
    ctx.font = "14px Arial";
    ctx.fillStyle = "#A6A6A6";
    ctx.fillText("No Payment Processed · Fictional Demonstration Only · No Products Delivered", 70, height - 94);
    ctx.fillStyle = "#6E6E73";
    ctx.font = "13px Arial";
    ctx.fillText("DrinkIt Luxury Beverage Catalogue · Created for UI/UX Exhibition", 70, height - 70);

    const link = document.createElement("a");
    link.download = "drinkit-demo-receipt.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  function confetti() {
    for (let i = 0; i < 90; i += 1) {
      const piece = document.createElement("span");
      piece.className = "confetti";
      piece.style.left = `${Math.random() * 100}%`;
      piece.style.background = ["#C9A96E", "#E0C797", "#B97832", "#F5F1E8", "#2E8B57"][i % 5];
      piece.style.animationDelay = `${Math.random()}s`;
      document.body.appendChild(piece);
      setTimeout(() => piece.remove(), 2600);
    }
  }

  function shareCart(cart, products, settings, activeCoupon) {
    const encoded = encodeURIComponent(JSON.stringify(cart || {}));
    const url = `${location.origin}${location.pathname}?cart=${encoded}${activeCoupon ? `&coupon=${activeCoupon}` : ""}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).catch(() => {});
    }
    return url;
  }

  window.DrinkItCart = {
    rupee,
    imageAttrs,
    cartLines,
    calculateTotals,
    downloadReceipt,
    confetti,
    shareCart
  };
})();
