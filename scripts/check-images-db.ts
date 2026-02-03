import { db } from "../lib/db";
import { inventoryItems } from "../lib/schema";
import "dotenv/config";
require('dotenv').config({ path: '.env.local' });

async function checkImages() {
    const items = await db.query.inventoryItems.findMany({
        columns: { name: true, image: true, imageBack: true, imageSide: true, imageDetails: true }
    });
    console.log(JSON.stringify(items.slice(0, 10), null, 2));
}

checkImages();
