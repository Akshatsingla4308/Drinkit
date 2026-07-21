(function () {
  const placeholder = () => (window.DrinkItSeed && window.DrinkItSeed.placeholder) || "";

  function rupee(value) {
    return `Rs. ${Math.round(Number(value) || 0).toLocaleString("en-IN")}`;
  }

  function imageAttrs(product) {
    const fallback = product.fallbackImage || placeholder();
    return `src="${product.image}" data-fallback="${fallback}" onerror="this.onerror=null;this.src=this.dataset.fallback||'${placeholder()}'"`;
  }

  function cartLines(cart, products) {
    return Object.entries(cart || {})
      .map(([id, qty]) => ({ product: (products || []).find((item) => item.id === id), qty: Number(qty) }))
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
    ctx.fillStyle = "#111827";
    ctx.fillRect(x, y, 108, 108);
    ctx.fillStyle = "#ffffff";
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
    const height = Math.max(640, 560 + totals.lines.length * 64);
    canvas.width = 980;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#f7f4ef";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(36, 36, 908, height - 72);
    ctx.strokeStyle = "#d9c9aa";
    ctx.lineWidth = 2;
    ctx.strokeRect(36, 36, 908, height - 72);

    ctx.fillStyle = "#111827";
    ctx.fillRect(70, 70, 48, 48);
    ctx.fillStyle = "#f3b347";
    ctx.font = "800 28px Arial";
    ctx.fillText("D", 84, 104);

    ctx.fillStyle = "#111827";
    ctx.font = "800 42px Arial";
    ctx.fillText(websiteName || (settings && settings.websiteName) || "DrinkIt", 132, 100);
    ctx.font = "700 16px Arial";
    ctx.fillText("PREMIUM DEMO INVOICE", 132, 128);
    ctx.font = "15px Arial";
    ctx.fillStyle = "#6b7280";
    ctx.fillText(new Date().toLocaleString("en-IN"), 132, 154);
    drawQr(ctx, 792, 70, JSON.stringify(cart) || "DrinkIt");
    ctx.fillStyle = "#6b7280";
    ctx.fillText("DEMO QR", 812, 196);

    let y = 245;
    ctx.fillStyle = "#111827";
    ctx.font = "700 17px Arial";
    ctx.fillText("Item", 70, y);
    ctx.fillText("Qty", 650, y);
    ctx.fillText("Total", 790, y);
    y += 24;
    ctx.strokeStyle = "#ece3d4";
    ctx.beginPath();
    ctx.moveTo(70, y);
    ctx.lineTo(890, y);
    ctx.stroke();
    y += 38;
    ctx.font = "16px Arial";
    totals.lines.forEach(({ product, qty }) => {
      ctx.fillStyle = "#111827";
      ctx.fillText(`${product.name} (${product.size})`.slice(0, 54), 70, y);
      ctx.fillStyle = "#6b7280";
      ctx.fillText(product.offer || "Demo item", 70, y + 22);
      ctx.fillStyle = "#111827";
      ctx.fillText(String(qty), 660, y);
      ctx.fillText(rupee(product.price * qty), 790, y);
      y += 64;
    });
    y += 20;
    [
      ["Subtotal (MRP)", totals.subtotal],
      ["Estimated Savings", -totals.savings],
      ["Coupon", -totals.coupon],
      ["Platform Fee", totals.platform],
      [`GST ${(settings && settings.gstPercent) || 0}%`, totals.gst],
      ["Grand Total", totals.grand]
    ].forEach(([label, value]) => {
      ctx.font = label === "Grand Total" ? "800 24px Arial" : "17px Arial";
      ctx.fillStyle = label === "Grand Total" ? "#0f8b6f" : "#111827";
      ctx.fillText(label, 560, y);
      ctx.fillText(`${value < 0 ? "-" : ""}${rupee(Math.abs(value))}`, 790, y);
      y += 36;
    });

    ctx.fillStyle = "#d33f49";
    ctx.font = "800 18px Arial";
    ctx.fillText("DEMO RECEIPT", 70, height - 120);
    ctx.font = "700 15px Arial";
    ctx.fillText("No Payment Processed  ·  No Products Delivered", 70, height - 92);
    ctx.fillStyle = "#6b7280";
    ctx.font = "14px Arial";
    ctx.fillText("Fictional DrinkIt UI demo only. No order, address, OTP, or delivery.", 70, height - 64);

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
      piece.style.background = ["#ffca3a", "#10b981", "#ef4444", "#3b82f6", "#c08923"][i % 5];
      piece.style.animationDelay = `${Math.random()}s`;
      document.body.appendChild(piece);
      setTimeout(() => piece.remove(), 2600);
    }
  }

  function shareCart(cart, products, settings, activeCoupon) {
    const totals = calculateTotals(cart, products, settings, activeCoupon);
    const payload = btoa(unescape(encodeURIComponent(JSON.stringify({ cart, total: Math.round(totals.grand), coupon: activeCoupon || "" }))));
    const url = `${location.origin}/?cart=${encodeURIComponent(payload)}`;
    navigator.clipboard?.writeText(url);
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
