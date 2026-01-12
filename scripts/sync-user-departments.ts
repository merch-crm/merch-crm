import { db } from "../lib/db";
import { users, departments } from "../lib/schema";
import { eq, isNull } from "drizzle-orm";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function main() {
    console.log("Fetching all departments...");
    const allDepts = await db.query.departments.findMany();
    const deptMap = new Map(allDepts.map(d => [d.name.toLowerCase(), d.id]));

    console.log("Fetching users with missing departmentId...");
    const usersToUpdate = await db.query.users.findMany({
        where: isNull(users.departmentId)
    });

    console.log(`Found ${usersToUpdate.length} users to check.`);

    let updatedCount = 0;
    for (const user of usersToUpdate) {
        if (user.department) {
            const deptId = deptMap.get(user.department.toLowerCase());
            if (deptId) {
                await db.update(users)
                    .set({ departmentId: deptId })
                    .where(eq(users.id, user.id));
                console.log(`- Linked user ${user.name} to department ${user.department}`);
                updatedCount++;
            }
        }
    }

    console.log(`Sync completed! ${updatedCount} users updated.`);
    process.exit(0);
}

main().catch((err) => {
    console.error("Sync failed:", err);
    process.exit(1);
});
