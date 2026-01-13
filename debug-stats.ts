
import { getSystemStats } from "./app/dashboard/admin/actions";

async function main() {
    console.log("Fetching system stats...");
    try {
        const stats = await getSystemStats();
        console.log("Result:", JSON.stringify(stats, null, 2));
    } catch (e) {
        console.error("Script error:", e);
    }
}

main();
