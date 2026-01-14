import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const connectionString = process.env.DATABASE_URL || "";
if (connectionString) {
    const url = new URL(connectionString);
    console.log("Username:", url.username);
    console.log("Host:", url.hostname);
    console.log("Port:", url.port);
    console.log("Database:", url.pathname);
    console.log("SSL params:", url.search);
} else {
    console.log("DATABASE_URL is not set!");
}
