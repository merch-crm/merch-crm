import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const connectionString = process.env.DATABASE_URL || "";
console.log("Connection string length:", connectionString.length);
if (connectionString) {
    const url = new URL(connectionString);
    console.log("Protocol:", url.protocol);
    console.log("Host:", url.hostname);
    console.log("Port:", url.port);
    console.log("Database:", url.pathname);
    console.log("Has SSL param:", url.searchParams.has("sslmode"));
    console.log("SSL param value:", url.searchParams.get("sslmode"));
} else {
    console.log("DATABASE_URL is not set!");
}
