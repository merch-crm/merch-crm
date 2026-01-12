import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const baseUri = process.env.DATABASE_URL || "";

if (baseUri) {
    const url = new URL(baseUri);
    console.log("Protocol:", url.protocol);
    console.log("Hostname:", url.hostname);
    console.log("Port:", url.port);
    console.log("Pathname:", url.pathname);
    console.log("Params:", url.search);
} else {
    console.log("DATABASE_URL is empty");
}
