/**
 * DRINKIT — LUXURY PRODUCT IMAGE & ASSET RESOLUTION ENGINE
 * Resolves verified local bottle photographs and category imagery for all 55 categories & 300+ brands.
 */
(function () {
  function slug(str) {
    return String(str || "")
      .toLowerCase()
      .replace(/&/g, "and")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  // Luxury dark amber badge SVG for ultimate graceful fallback
  const LUXURY_FALLBACK_SVG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='1000' viewBox='0 0 800 1000'%3E%3Cdefs%3E%3ClinearGradient id='bg' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%23141416'/%3E%3Cstop offset='100%25' stop-color='%230B0B0D'/%3E%3C/linearGradient%3E%3CradialGradient id='amberGlow' cx='50%25' cy='45%25' r='50%25'%3E%3Cstop offset='0%25' stop-color='%23B97832' stop-opacity='0.25'/%3E%3Cstop offset='100%25' stop-color='%230B0B0D' stop-opacity='0'/%3E%3C/radialGradient%3E%3C/defs%3E%3Crect width='800' height='1000' fill='url(%23bg)'/%3E%3Ccircle cx='400' cy='450' r='280' fill='url(%23amberGlow)'/%3E%3Cpath d='M350 260 L450 260 L440 340 L480 430 L480 720 L320 720 L320 430 L360 340 Z' fill='none' stroke='%23C9A96E' stroke-width='2' stroke-opacity='0.4'/%3E%3Ccircle cx='400' cy='520' r='55' fill='%231C1C1E' stroke='%23C9A96E' stroke-width='1.5'/%3E%3Ctext x='400' y='532' text-anchor='middle' font-family='serif' font-size='34' font-weight='600' fill='%23C9A96E'%3ED%3C/text%3E%3Ctext x='400' y='790' text-anchor='middle' font-family='sans-serif' font-size='18' letter-spacing='6' fill='%23C9A96E' font-weight='500'%3EDRINKIT CELLAR%3C/text%3E%3Ctext x='400' y='820' text-anchor='middle' font-family='sans-serif' font-size='13' letter-spacing='2' fill='%23A6A6A6'%3EFINE SPIRITS & BEVERAGES%3C/text%3E%3C/svg%3E";

  // Brand-to-image mapping
  const BRAND_MAP = {
    // Scotch & Single Malts
    "johnnie walker": "images/products/johnnie-walker.webp",
    "chivas regal": "images/products/chivas-regal.webp",
    "ballantine's": "images/products/ballantines.webp",
    "ballantines": "images/products/ballantines.webp",
    "dewar's": "images/products/dewars.webp",
    "dewars": "images/products/dewars.webp",
    "glenfiddich": "images/products/glenfiddich.webp",
    "the glenlivet": "images/products/the-glenlivet.webp",
    "glenlivet": "images/products/the-glenlivet.webp",
    "macallan": "images/products/macallan.webp",
    "talisker": "images/products/talisker.webp",
    "laphroaig": "images/products/laphroaig.webp",
    "singleton": "images/products/singleton.webp",
    "glenmorangie": "images/products/glenmorangie.webp",
    "ardbeg": "images/products/ardbeg.webp",
    "lagavulin": "images/products/lagavulin.webp",
    "monkey shoulder": "images/products/monkey-shoulder.webp",
    "grant's": "images/products/grants.webp",
    "grants": "images/products/grants.webp",
    "black & white": "images/products/black-and-white.webp",
    "black and white": "images/products/black-and-white.webp",
    "teacher's": "images/products/teachers.webp",
    "teachers": "images/products/teachers.webp",
    "black dog": "images/products/black-dog.webp",
    "100 pipers": "images/products/100-pipers.webp",
    "vat 69": "images/products/vat-69.webp",

    // Irish & Japanese
    "jameson": "images/products/jameson.webp",
    "bushmills": "images/products/bushmills.webp",
    "tullamore d.e.w.": "images/products/tullamore-dew.webp",
    "tullamore dew": "images/products/tullamore-dew.webp",
    "suntory": "images/products/suntory.webp",
    "hibiki": "images/products/hibiki.webp",
    "yamazaki": "images/products/yamazaki.webp",
    "toki": "images/products/toki.webp",
    "nikka": "images/products/nikka.webp",

    // Indian Malts & Whiskies
    "amrut": "images/products/amrut.webp",
    "paul john": "images/products/paul-john.webp",
    "rampur": "images/products/rampur.webp",
    "indri": "images/products/indri.webp",
    "royal stag": "images/products/royal-stag.webp",
    "blenders pride": "images/products/blenders-pride.webp",
    "antiquity": "images/products/antiquity.webp",
    "signature": "images/products/signature.webp",
    "oaksmith": "images/products/oaksmith.webp",
    "mcdowell's no.1": "images/products/mcdowells-no1.webp",
    "mcdowell's": "images/products/mcdowells-no1.webp",
    "royal challenge": "images/products/royal-challenge.webp",
    "rockford": "images/products/rockford.webp",
    "imperial blue": "images/products/imperial-blue.webp",
    "sterling reserve": "images/products/sterling-reserve.webp",

    // Bourbon
    "jim beam": "images/products/jim-beam.webp",
    "jack daniel's": "images/products/jack-daniels.webp",
    "jack daniels": "images/products/jack-daniels.webp",
    "maker's mark": "images/products/makers-mark.webp",
    "woodford reserve": "images/products/woodford-reserve.webp",
    "bulleit": "images/products/bulleit.webp",
    "buffalo trace": "images/products/buffalo-trace.webp",
    "wild turkey": "images/products/wild-turkey.webp",

    // Vodka
    "absolut": "images/products/absolut.webp",
    "grey goose": "images/products/grey-goose.webp",
    "belvedere": "images/products/belvedere.webp",
    "smirnoff": "images/products/smirnoff.webp",
    "magic moments": "images/products/magic-moments.webp",
    "ketel one": "images/products/ketel-one.webp",
    "ciroc": "images/products/ciroc.webp",

    // Gin
    "bombay sapphire": "images/products/bombay-sapphire.webp",
    "tanqueray": "images/products/tanqueray.webp",
    "beefeater": "images/products/beefeater.webp",
    "roku": "images/products/roku.webp",
    "gordon's": "images/products/gordons.webp",
    "greater than": "images/products/greater-than.webp",
    "stranger & sons": "images/products/stranger-and-sons.webp",
    "jaisalmer": "images/products/jaisalmer.webp",

    // Rum
    "old monk": "images/products/old-monk.webp",
    "bacardi": "images/products/bacardi.webp",
    "captain morgan": "images/products/captain-morgan.webp",
    "havana club": "images/products/havana-club.webp",
    "maka zai": "images/products/maka-zai.webp",

    // Beers
    "kingfisher": "images/products/kingfisher.webp",
    "kingfisher strong": "images/products/kingfisher.webp",
    "budweiser": "images/products/budweiser.webp",
    "budweiser magnum": "images/products/budweiser.webp",
    "corona": "images/products/corona.webp",
    "heineken": "images/products/heineken.webp",
    "carlsberg": "images/products/carlsberg.webp",
    "tuborg": "images/products/tuborg.webp",
    "bira 91": "images/products/bira-91.webp",
    "hoegaarden": "images/products/hoegaarden.webp",
    "stella artois": "images/products/stella-artois.webp",

    // Wine & Champagne
    "sula": "images/products/sula.webp",
    "fratelli": "images/products/fratelli.webp",
    "grover zampa": "images/products/grover-zampa.webp",
    "jacob's creek": "images/products/jacobs-creek.webp",
    "chandon": "images/products/chandon.webp",
    "moet & chandon": "images/products/moet-and-chandon.webp",
    "dom perignon": "images/products/dom-perignon.webp",
    "veuve clicquot": "images/products/veuve-clicquot.webp",
    "taittinger": "images/products/taittinger.webp",

    // Tequila
    "don julio": "images/products/don-julio.webp",
    "patron": "images/products/patron.webp",
    "jose cuervo": "images/products/jose-cuervo.webp",
    "1800": "images/products/1800.webp",

    // Brandy & Cognac
    "hennessy": "images/products/hennessy.webp",
    "remy martin": "images/products/remy-martin.webp",
    "martell": "images/products/martell.webp",
    "morpheus": "images/products/morpheus.webp",

    // Liqueurs
    "baileys": "images/products/baileys.webp",
    "jagermeister": "images/products/jagermeister.webp",
    "kahlua": "images/products/kahlua.webp",
    "cointreau": "images/products/cointreau.webp",

    // Beverages & Mixers
    "coca-cola": "images/products/coca-cola.webp",
    "pepsi": "images/products/pepsi.webp",
    "thums up": "images/products/thums-up.webp",
    "red bull": "images/products/red-bull.webp",
    "monster": "images/products/monster.webp",
    "schweppes": "images/products/schweppes.webp",
    "jimmys": "images/products/jimmys.webp",
    "jimmy's": "images/products/jimmys.webp",
    "bisleri": "images/products/bisleri.webp"
  };

  function resolveProductImage(product) {
    if (!product) return LUXURY_FALLBACK_SVG;
    
    // Check if brand matches our curated brand assets
    const brandKey = String(product.brand || "").toLowerCase().trim();
    if (BRAND_MAP[brandKey]) {
      return BRAND_MAP[brandKey];
    }
    
    // Fall back to category-level verified studio photography
    const catSlug = slug(product.category);
    return `images/categories/${catSlug}.webp`;
  }

  function resolveCategoryImage(categoryOrName) {
    const name = typeof categoryOrName === "object" ? categoryOrName.name : categoryOrName;
    const catSlug = slug(name);
    return `images/categories/${catSlug}.webp`;
  }

  window.DrinkItImages = {
    resolveProductImage,
    resolveCategoryImage,
    placeholder: LUXURY_FALLBACK_SVG,
    BRAND_MAP
  };
})();
