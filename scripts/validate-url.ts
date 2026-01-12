import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const baseUri = process.env.DATABASE_URL || "";

if (baseUri) {
    console.log("Length:", baseUri.length);
    console.log("Starts with postgresql://:", baseUri.startsWith("postgresql://"));
    console.log("Starts with postgres://:", baseUri.startsWith("postgres://"));
    const parts = baseUri.split(':');
    console.log("Number of colons:", parts.length);
} else {
    console.log("Empty");
}
