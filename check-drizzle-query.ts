import { config } from "dotenv";
config({ path: ".env.local" });
import { db } from "./lib/db";

async function check() {
    try {
        console.log("Schema keys:", Object.keys(db.query || {}));
        if (db.query && db.query.inventoryAttributes) {
            console.log("Found db.query.inventoryAttributes!");
            const attrs = await db.query.inventoryAttributes.findMany({ limit: 5 });
            console.log("First 5 attributes fetched:", attrs);
        } else {
            console.log("db.query.inventoryAttributes DID NOT EXIST!");

            // Check if schema has it
            const schema = await import("./lib/schema");
            console.log("Is inventoryAttributes in schema exports?", !!schema.inventoryAttributes);
        }
    } catch (e) {
        console.error("Error connecting or querying:", e);
    }
}

check().catch(console.error).finally(() => process.exit(0));
