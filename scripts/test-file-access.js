
const fs = require('fs');
const path = require('path');

const LOCAL_STORAGE_ROOT = path.join(process.cwd(), "local-storage");
const relativePath = "SKU/Одежда/Футболки/Футболка Muse Wear Френч-терри Base Шоколад S 95_ Хлопок_ 5_ Эластан/item-1769111963573-irukq.jpg";
const fullPath = path.join(LOCAL_STORAGE_ROOT, relativePath);

console.log("Full Path:", fullPath);
console.log("Exists:", fs.existsSync(fullPath));
if (fs.existsSync(fullPath)) {
    console.log("Stats:", fs.statSync(fullPath));
} else {
    // Try to find it manually by listing dirs to see if there's a mismatch
    console.log("Listing SKU/Одежда/Футболки:");
    const sub = path.join(LOCAL_STORAGE_ROOT, "SKU/Одежда/Футболки");
    if (fs.existsSync(sub)) {
        console.log(fs.readdirSync(sub));
    }
}
