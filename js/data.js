(function () {
  const categoryNames = [
    "Whisky", "Scotch", "Irish Whisky", "Japanese Whisky", "Indian Whisky", "Single Malt",
    "Blended Whisky", "Bourbon", "Vodka", "Gin", "Rum", "Dark Rum", "White Rum", "Beer",
    "Strong Beer", "Craft Beer", "Wine", "Red Wine", "White Wine", "Rose Wine", "Sparkling Wine",
    "Champagne", "Tequila", "Brandy", "Cognac", "Liqueurs", "Ready To Drink", "Cocktail Mixers",
    "Soft Drinks", "Cola", "Soda", "Tonic Water", "Energy Drinks", "Juices", "Mineral Water",
    "Ice Cubes", "Party Snacks", "Chips", "Nachos", "Chocolate", "Peanuts", "Cigarettes",
    "Premium Cigarettes", "Cigars", "Rolling Paper", "Hookah", "Hookah Flavours",
    "Disposable Vape", "Vape Pods", "Accessories", "Party Essentials", "Bottle Openers",
    "Plastic Glasses", "Paper Cups", "Tissues"
  ];

  const categorySeeds = [
    "1510812431401-41d2bd2722f3", "1569529465841-dfecdab7503b", "1572116469696-31de0f17cc34",
    "1600788886242-5c96aabe3757", "1584225064785-c62a8b43d148", "1566737236500-c8ac43014a67",
    "1621873495884-845a939892d2", "1547595628-c61a29f496f0", "1527661591475-527312dd65f5"
  ];

  const brandPool = {
    Whisky: ["Royal Stag", "Blenders Pride", "Antiquity", "Signature", "Oaksmith", "Imperial Blue", "McDowell's No.1", "Officer's Choice", "8PM", "Royal Challenge", "Rockford", "Sterling Reserve"],
    Scotch: ["Johnnie Walker", "Chivas Regal", "Ballantine's", "Dewar's", "Teacher's", "Black & White", "J&B", "Monkey Shoulder", "Grant's", "Cutty Sark", "William Lawson's"],
    "Irish Whisky": ["Jameson", "Bushmills", "Tullamore D.E.W.", "Proper Twelve", "Teeling", "The Irishman", "Paddy"],
    "Japanese Whisky": ["Suntory", "Nikka", "Mars Shinshu", "Akashi", "Yamazaki", "Hibiki", "Toki"],
    "Indian Whisky": ["Amrut", "Paul John", "Rampur", "Indri", "Solan No. 1", "Kamet", "Godawan", "Maqintosh", "Woodburns"],
    "Single Malt": ["Glenfiddich", "The Glenlivet", "Talisker", "Laphroaig", "Singleton", "Glenmorangie", "Macallan", "Aberlour", "Ardbeg", "Lagavulin"],
    "Blended Whisky": ["Black Dog", "100 Pipers", "Vat 69", "Teacher's", "Black & White", "Dewar's", "Whyte & Mackay", "Ballantine's"],
    Bourbon: ["Jim Beam", "Maker's Mark", "Wild Turkey", "Evan Williams", "Jack Daniel's", "Woodford Reserve", "Bulleit", "Buffalo Trace"],
    Vodka: ["Magic Moments", "Smirnoff", "Absolut", "Grey Goose", "Belvedere", "Ketel One", "Ciroc", "White Mischief", "Romanov", "Skyy", "Finlandia"],
    Gin: ["Greater Than", "Stranger & Sons", "Bombay Sapphire", "Tanqueray", "Beefeater", "Hapusa", "Roku", "Gordon's", "Jaisalmer", "Samsara", "Blue Riband"],
    Rum: ["Old Monk", "Bacardi", "Captain Morgan", "Havana Club", "Maka Zai", "Amrut Two Indies", "McDowell's Celebration", "Contessa"],
    "Dark Rum": ["Old Monk", "Captain Morgan", "Maka Zai", "Havana Club", "Bacardi Black", "Cabo", "Contessa"],
    "White Rum": ["Bacardi", "Havana Club", "Mojito Bay", "Maka Zai", "Old Monk White", "Malibu"],
    Beer: ["Kingfisher", "Budweiser", "Corona", "Heineken", "Carlsberg", "Tuborg", "Hoegaarden", "Stella Artois", "Bira 91", "Simba", "Miller", "Peroni"],
    "Strong Beer": ["Kingfisher Strong", "Budweiser Magnum", "Tuborg Strong", "Haywards 5000", "Godfather", "Carlsberg Elephant", "Knock Out", "Thunderbolt"],
    "Craft Beer": ["Bira 91", "Simba", "White Rhino", "Kati Patang", "Bee Young", "Geist", "Toit", "Arbor"],
    Wine: ["Sula", "Fratelli", "Grover Zampa", "York", "Big Banyan", "KRSMA", "Jacob's Creek", "Hardys"],
    "Red Wine": ["Sula", "Fratelli", "Grover Zampa", "Big Banyan", "Jacob's Creek", "Campo Viejo", "Yellow Tail", "Barefoot"],
    "White Wine": ["Sula", "Fratelli", "York", "KRSMA", "Jacob's Creek", "Hardys", "Yellow Tail", "Barefoot"],
    "Rose Wine": ["Sula", "Fratelli", "Big Banyan", "York", "Jacob's Creek", "Barefoot", "Mateus"],
    "Sparkling Wine": ["Chandon", "Sula", "Fratelli", "Jacob's Creek", "Martini", "Zonin", "Freixenet"],
    Champagne: ["Moet & Chandon", "Veuve Clicquot", "Taittinger", "GH Mumm", "Dom Perignon", "Laurent-Perrier", "Piper-Heidsieck"],
    Tequila: ["Jose Cuervo", "Camino", "Patron", "Don Julio", "Sauza", "El Jimador", "1800", "Sierra"],
    Brandy: ["Mansion House", "Honey Bee", "Morpheus", "Courrier Napoleon", "McDowell's No.1", "Old Admiral", "Dreher"],
    Cognac: ["Hennessy", "Remy Martin", "Martell", "Courvoisier", "Camus", "Otard"],
    Liqueurs: ["Baileys", "Jagermeister", "Kahlua", "Cointreau", "Malibu", "Aperol", "Campari", "Sambuca"],
    "Ready To Drink": ["Bacardi Breezer", "Smirnoff Ice", "Jimmy's", "O' Be Cocktails", "Bira Boom", "Hooper's", "White Owl Spark"],
    "Cocktail Mixers": ["Jimmy's", "Sepoy & Co", "Svami", "Schweppes", "Monin", "Real", "Bartisans", "Jade Forest"],
    "Soft Drinks": ["Coca-Cola", "Pepsi", "Sprite", "Thums Up", "Limca", "Fanta", "7UP", "Mountain Dew"],
    Cola: ["Coca-Cola", "Pepsi", "Thums Up", "Campa", "Diet Coke", "Coke Zero", "Pepsi Black"],
    Soda: ["Kinley", "Bisleri", "Lehar", "Qua", "Schweppes", "Catch", "Kingfisher"],
    "Tonic Water": ["Schweppes", "Svami", "Sepoy & Co", "Strangelove", "Jade Forest", "Franklin & Sons"],
    "Energy Drinks": ["Red Bull", "Monster", "Sting", "Hell", "Budweiser Beats", "Ocean One8", "Rockstar"],
    Juices: ["Real", "Tropicana", "B Natural", "Paper Boat", "Minute Maid", "Raw Pressery", "Storia"],
    "Mineral Water": ["Bisleri", "Kinley", "Aquafina", "Himalayan", "Qua", "Bailley", "Rail Neer"],
    "Ice Cubes": ["Arctic", "Frosty", "Chill Pack", "Iceberg", "Coolberg Ice", "Party Ice"],
    "Party Snacks": ["Haldiram's", "Too Yumm", "Bikano", "Cornitos", "Pringles", "Lay's", "Bingo", "Snackible"],
    Chips: ["Lay's", "Bingo", "Uncle Chipps", "Pringles", "Too Yumm", "Kurkure", "Doritos", "Balaji"],
    Nachos: ["Cornitos", "Doritos", "Nacho King", "Snackible", "Tex Mex", "Wingreens"],
    Chocolate: ["Cadbury", "Nestle", "Amul", "Hershey's", "Mars", "Snickers", "Ferrero Rocher", "Lindt"],
    Peanuts: ["Haldiram's", "Nutty Gritties", "Bikano", "Rostaa", "Solimo", "Tong Garden"],
    Cigarettes: ["Classic", "Gold Flake", "Marlboro", "Navy Cut", "Four Square", "Wills", "Esse"],
    "Premium Cigarettes": ["Marlboro", "Dunhill", "Davidoff", "Classic", "Sobranie", "Esse"],
    Cigars: ["Cohiba", "Romeo y Julieta", "Montecristo", "Partagas", "Arturo Fuente", "Davidoff"],
    "Rolling Paper": ["RAW", "OCB", "Elements", "Stash Pro", "Smoking", "Rizla"],
    Hookah: ["Al Fakher", "Starbuzz", "Fumo", "Khalil Mamoon", "MYA", "Mya Saray", "Oduman"],
    "Hookah Flavours": ["Al Fakher", "Starbuzz", "Afzal", "Fumari", "Social Smoke", "Adalya", "Mazaya"],
    "Disposable Vape": ["Elf Bar", "Yuoto", "Vaporesso", "Geek Bar", "IGET", "Maskking", "Nasty"],
    "Vape Pods": ["Vaporesso", "SMOK", "Caliburn", "Voopoo", "Uwell", "Relx", "Geekvape"],
    Accessories: ["BarCraft", "Uber Bar", "IKEA", "Home Centre", "Party Propz", "Chuk", "Solo", "Origami"],
    "Party Essentials": ["Solo", "Origami", "Party Propz", "Scotch-Brite", "Chuk", "EcoSoul", "Dinewell"],
    "Bottle Openers": ["BarCraft", "Uber Bar", "Home Centre", "IKEA", "Prestige", "Bergner"],
    "Plastic Glasses": ["Solo", "Dinewell", "Party Propz", "Servewell", "Chuk", "EcoSoul"],
    "Paper Cups": ["Chuk", "Dinewell", "Party Propz", "EcoSoul", "Solo", "Origami"],
    Tissues: ["Origami", "Premier", "Scott", "Kleenex", "Tempo", "Selpak"]
  };

  const alcoholCategories = new Set(categoryNames.slice(0, 28));
  const sizes = ["90 ml", "180 ml", "375 ml", "500 ml", "650 ml", "750 ml", "1 L"];
  const nonAlcoholSizes = ["Single", "Pack", "250 ml", "330 ml", "500 ml", "1 L", "2 L", "Party Pack"];
  const variants = ["Reserve", "Classic", "Premium", "Select", "Gold", "Signature", "Party Pack", "Limited", "Original", "Ultra", "Smooth", "Craft", "Estate", "Barrel", "Deluxe", "Collector"];
  const offers = ["Buy 2 Get 5% Off", "Weekend Party Sale", "Festival Offer", "Happy Hours", "Mixer Combo", "Best Seller", "Premium Pick"];

  const priceBands = {
    Whisky: [420, 1850], Scotch: [1500, 6200], "Irish Whisky": [1450, 4800], "Japanese Whisky": [3200, 11800],
    "Indian Whisky": [900, 5200], "Single Malt": [2800, 14500], "Blended Whisky": [850, 3800], Bourbon: [1500, 5500],
    Vodka: [390, 5200], Gin: [850, 5600], Rum: [330, 2600], "Dark Rum": [360, 2800], "White Rum": [380, 2500],
    Beer: [110, 430], "Strong Beer": [135, 360], "Craft Beer": [170, 520], Wine: [650, 3200], "Red Wine": [750, 4200],
    "White Wine": [700, 3600], "Rose Wine": [750, 3300], "Sparkling Wine": [1100, 5200], Champagne: [5800, 26500],
    Tequila: [1600, 9800], Brandy: [360, 2600], Cognac: [4200, 22000], Liqueurs: [1200, 6200],
    "Ready To Drink": [110, 360], "Cocktail Mixers": [85, 980], "Soft Drinks": [35, 210], Cola: [40, 220],
    Soda: [25, 160], "Tonic Water": [70, 320], "Energy Drinks": [95, 260], Juices: [45, 290], "Mineral Water": [20, 160],
    "Ice Cubes": [60, 220], "Party Snacks": [35, 360], Chips: [20, 220], Nachos: [55, 260], Chocolate: [20, 620],
    Peanuts: [25, 260], Cigarettes: [95, 420], "Premium Cigarettes": [220, 760], Cigars: [450, 5200],
    "Rolling Paper": [45, 420], Hookah: [450, 5400], "Hookah Flavours": [160, 950], "Disposable Vape": [550, 2400],
    "Vape Pods": [650, 3200], Accessories: [35, 1450], "Party Essentials": [25, 620], "Bottle Openers": [110, 850],
    "Plastic Glasses": [55, 420], "Paper Cups": [45, 360], Tissues: [35, 280]
  };

  function slug(value) {
    return String(value).toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  }

  function seeded(seed) {
    const x = Math.sin(seed * 999) * 10000;
    return x - Math.floor(x);
  }

  function remoteImage(seed, width = 900) {
    return `https://images.unsplash.com/photo-${seed}?auto=format&fit=crop&w=${width}&q=80`;
  }

  function localProductImage(id, category, brand) {
    if (window.DrinkItImages && window.DrinkItImages.resolveProductImage) {
      return window.DrinkItImages.resolveProductImage({ id, category, brand });
    }
    const brandSlug = slug(brand);
    return `images/products/${brandSlug}.webp`;
  }

  function categoryImage(categoryName) {
    if (window.DrinkItImages && window.DrinkItImages.resolveCategoryImage) {
      return window.DrinkItImages.resolveCategoryImage(categoryName);
    }
    const catSlug = slug(categoryName);
    return `images/categories/${catSlug}.webp`;
  }

  function rangePrice(category, index, size) {
    const band = priceBands[category] || [99, 999];
    let price = band[0] + Math.round((band[1] - band[0]) * seeded(index + category.length));
    if (/90 ml/.test(size)) price *= 0.22;
    if (/180 ml/.test(size)) price *= 0.38;
    if (/375 ml/.test(size)) price *= 0.62;
    if (/500 ml/.test(size) && alcoholCategories.has(category)) price *= 0.8;
    if (/650 ml/.test(size) && /Beer|Strong Beer|Craft Beer/.test(category)) price *= 1.08;
    if (/1 L/.test(size)) price *= alcoholCategories.has(category) ? 1.28 : 1.18;
    if (/2 L|Party Pack/.test(size)) price *= 1.7;
    return Math.max(19, Math.round(price / 10) * 10 - 1);
  }

  const categories = categoryNames.map((name, order) => ({
    id: slug(name),
    name,
    icon: name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase(),
    image: categoryImage(name),
    order
  }));

  const products = [];
  categories.forEach((category, catIndex) => {
    const brands = brandPool[category.name] || ["DrinkIt"];
    const count = alcoholCategories.has(category.name) ? 24 : 16;
    for (let i = 0; i < count; i += 1) {
      const brand = brands[i % brands.length];
      const variant = variants[(i + catIndex) % variants.length];
      const sizeList = alcoholCategories.has(category.name) ? sizes : nonAlcoholSizes;
      const size = sizeList[(i + catIndex) % sizeList.length];
      const id = `${category.id}-${slug(brand)}-${slug(variant)}-${i + 1}`;
      const price = rangePrice(category.name, i + catIndex * 17, size);
      const discount = 4 + ((i * 3 + catIndex) % 22);
      const mrp = Math.max(price + 10, Math.round(price / (1 - discount / 100) / 10) * 10);
      const savings = mrp - price;
      const rating = Number((3.8 + seeded(i + catIndex) * 1.15).toFixed(1));
      const available = (i + catIndex) % 11 !== 0;
      const stock = (i + catIndex) % 13 === 0 ? 3 : 8 + ((i + catIndex) % 42);
      products.push({
        id,
        name: `${brand} ${variant}`,
        category: category.name,
        brand,
        size,
        price,
        mrp,
        savings,
        discount,
        rating: Math.min(5, rating),
        description: `${brand} ${variant} ${size} for a realistic fictional DrinkIt cart. Demo Punjab-style pricing, editable from admin, with no real sale or delivery.`,
        image: localProductImage(id, category.name, brand),
        fallbackImage: categoryImage(category.name),
        available,
        featured: (i + catIndex) % 5 === 0,
        bestSeller: (i + catIndex) % 7 === 0,
        trending: (i + catIndex) % 6 === 0,
        topRated: rating >= 4.5,
        premium: price >= 2500,
        offer: offers[(i + catIndex) % offers.length],
        nutrition: alcoholCategories.has(category.name)
          ? "Contains alcohol. Fictional demo listing. Enjoy responsibly where lawful."
          : "Packaged demo item. Check actual product label in real life.",
        info: `${category.name} | ${brand} | ${size} | Stock ${stock}`,
        availableInPunjab: true,
        createdAt: Date.now() - (catIndex * 100000 + i * 60000),
        editedAt: Date.now() - ((i + 1) * 45000),
        type: alcoholCategories.has(category.name) ? "Alcohol" : "Essentials",
        stock
      });
    }
  });

  const settings = {
    websiteName: "DrinkIt",
    deliveryFee: 0,
    platformFee: 19,
    gstPercent: 18,
    adminUsername: "admin",
    adminPassword: "drinkit123",
    darkModeDefault: false,
    deliveryEta: "18-24 min",
    demoCoupons: [
      { code: "PARTY5", label: "Buy 2 Get 5% Off", minItems: 2, percent: 5 },
      { code: "WEEKEND10", label: "Weekend Party Sale", minTotal: 2499, percent: 10 },
      { code: "HAPPYHOURS", label: "Happy Hours", minItems: 4, flat: 150 }
    ],
    recoveryKit: ["ORS", "Lemon", "Coconut Water", "Lassi", "Chocolate", "Chips", "Water Bottle", "Banana"],
    popularSearches: ["Whisky", "Old Monk", "Kingfisher", "Vodka", "Red Bull", "Chips", "Gin", "Beer", "Wine", "Ice Cubes"],
    partyKits: {
      "House Party": ["whisky", "beer", "cocktail-mixers", "ice-cubes", "chips", "plastic-glasses", "mineral-water"],
      "Birthday Party": ["sparkling-wine", "vodka", "juices", "party-snacks", "chocolate", "paper-cups", "tissues"],
      "Couple Night": ["wine", "gin", "tonic-water", "chocolate", "mineral-water"],
      "Match Night": ["beer", "strong-beer", "cola", "chips", "nachos", "ice-cubes"],
      "Weekend Chill": ["craft-beer", "ready-to-drink", "chips", "peanuts", "mineral-water", "ice-cubes"],
      "College Party": ["ready-to-drink", "soft-drinks", "party-snacks", "plastic-glasses", "ice-cubes", "mineral-water"],
      "Road Trip": ["ready-to-drink", "energy-drinks", "chips", "mineral-water", "chocolate", "tissues"],
      "Office Celebration": ["champagne", "wine", "soft-drinks", "party-snacks", "plastic-glasses", "tissues"],
      "Budget Party": ["beer", "soft-drinks", "chips", "ice-cubes", "plastic-glasses", "mineral-water"],
      "Premium Party": ["single-malt", "champagne", "cognac", "tonic-water", "chocolate", "party-essentials", "ice-cubes"]
    }
  };

  window.DrinkItSeed = {
    categories,
    products,
    settings,
    alcoholCategories: Array.from(alcoholCategories),
    placeholder: (window.DrinkItImages && window.DrinkItImages.placeholder) || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='1000' viewBox='0 0 800 1000'%3E%3Crect width='800' height='1000' fill='%23141416'/%3E%3Ccircle cx='400' cy='500' r='100' fill='%23C9A96E' opacity='.2'/%3E%3Ctext x='400' y='510' text-anchor='middle' font-family='serif' font-size='48' font-weight='700' fill='%23C9A96E'%3ED%3C/text%3E%3Ctext x='400' y='570' text-anchor='middle' font-family='sans-serif' font-size='18' letter-spacing='4' fill='%23A6A6A6'%3EDRINKIT%3C/text%3E%3C/svg%3E"
  };
})();
