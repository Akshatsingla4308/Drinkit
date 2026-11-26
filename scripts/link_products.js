const fs = require('fs');
const path = require('path');

const sandbox = { window: {} };
const imgCode = fs.readFileSync('js/product-images.js', 'utf8');
const dataCode = fs.readFileSync('js/data.js', 'utf8');

eval('(function() { var window = sandbox.window;' + imgCode + '\n' + dataCode + '})()');

const products = sandbox.window.DrinkItSeed.products;
console.log('Linking files for ' + products.length + ' products...');

let created = 0;
products.forEach(p => {
  const pid = p.id;
  const webpSrc = p.image;
  const jpgSrc = p.image.replace('.webp', '.jpg');

  const tgtWebp = path.join('images', 'products', `${pid}.webp`);
  const tgtJpg = path.join('images', 'products', `${pid}.jpg`);

  if (!fs.existsSync(tgtWebp)) {
    try {
      fs.linkSync(webpSrc, tgtWebp);
      created++;
    } catch {
      fs.copyFileSync(webpSrc, tgtWebp);
      created++;
    }
  }

  if (!fs.existsSync(tgtJpg)) {
    const src = fs.existsSync(jpgSrc) ? jpgSrc : webpSrc;
    try {
      fs.linkSync(src, tgtJpg);
    } catch {
      fs.copyFileSync(src, tgtJpg);
    }
  }
});

console.log('Successfully linked/created ' + created + ' product image files.');
