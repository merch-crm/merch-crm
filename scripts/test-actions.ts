"use server";
import { config } from "dotenv";
config({ path: ".env.local" });

import {
    getDesignStats,
    getMyDesignTasks,
    getUrgentDesignTasks,
    getRecentCompletedTasks,
    getPopularDesigns,
    getApplicationTypesStats
} from "./app/(main)/dashboard/design/actions/design-dashboard-actions";

async function run() {
    try {
        console.log("Testing getDesignStats...");
        await getDesignStats();
        console.log("Testing getMyDesignTasks...");
        await getMyDesignTasks();
        console.log("Testing getUrgentDesignTasks...");
        await getUrgentDesignTasks();
        console.log("Testing getRecentCompletedTasks...");
        await getRecentCompletedTasks();
        console.log("Testing getPopularDesigns...");
        await getPopularDesigns();
        console.log("Testing getApplicationTypesStats...");
        await getApplicationTypesStats();
        console.log("ALL OK");
    } catch (e) {
        console.error("FAILED WITH:", e);
    }
}
run();
