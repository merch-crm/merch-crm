import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function main() {
    // Dynamic imports
    const { db } = await import("@/lib/db");
    const { clients, orders, orderItems, users } = await import("@/lib/schema");
    const { eq } = await import("drizzle-orm");

    console.log("Seeding 20 clients and 20 orders...");

    try {
        // 1. Get a user for `createdBy` field
        const allUsers = await db.select().from(users).limit(1);
        if (allUsers.length === 0) {
            console.error("Error: No users found. Please run valid seed first or create a user.");
            process.exit(1);
        }
        const creatorId = allUsers[0].id;

        // --- Data Generators ---
        const firstNames = ["Александр", "Дмитрий", "Максим", "Сергей", "Андрей", "Алексей", "Артем", "Илья", "Кирилл", "Михаил", "Елена", "Анна", "Мария", "Ольга", "Татьяна", "Наталья", "Екатерина", "Ирина"];
        const lastNames = ["Иванов", "Смирнов", "Кузнецов", "Попов", "Васильев", "Петров", "Соколов", "Михайлов", "Новиков", "Федоров", "Морозов", "Волков", "Алексеев", "Лебедев", "Семенов"];
        const companyPrefixes = ["ООО", "ИП", "АО", "ЗАО"];
        const companyNames = ["Вектор", "Альянс", "Техно", "Строй", "Мастер", "Сервис", "Группа", "Спектр", "Лидер", "Гарант", "Прогресс", "Бизнес", "Трейд", "Опт", "Снаб"];
        const cities = ["Москва", "Санкт-Петербург", "Новосибирск", "Екатеринбург", "Казань", "Нижний Новгород", "Челябинск", "Самара", "Омск", "Ростов-на-Дону"];
        const statuses = ["new", "design", "production", "done", "shipped"] as const;
        const priorities = ["low", "normal", "high"] as const;
        const categories = ["print", "embroidery", "merch", "other"] as const;

        const getRandomElement = <T>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)];
        const getRandomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

        // --- Create Clients ---
        console.log("Creating 20 clients...");
        const newClientsData = Array.from({ length: 20 }).map(() => {
            const firstName = getRandomElement(firstNames);
            const lastName = getRandomElement(lastNames);
            const isCompany = Math.random() > 0.3;
            const company = isCompany ? `${getRandomElement(companyPrefixes)} "${getRandomElement(companyNames)}-${getRandomInt(1, 99)}"` : null;

            return {
                firstName: firstName,
                lastName: lastName,
                name: `${firstName} ${lastName}`,
                company: company,
                phone: `+7 (9${getRandomInt(10, 99)}) ${getRandomInt(100, 999)}-${getRandomInt(10, 99)}-${getRandomInt(10, 99)}`,
                email: `client${getRandomInt(1000, 9999)}@example.com`,
                city: getRandomElement(cities),
                address: `ул. Ленина, д. ${getRandomInt(1, 200)}`,
                telegram: `@user_${getRandomInt(1000, 9999)}`,
                source: Math.random() > 0.5 ? "Сайт" : "Рекомендация"
            };
        });

        const createdClients = await db.insert(clients).values(newClientsData).returning();
        console.log(`✓ Created ${createdClients.length} clients`);


        // --- Create Orders ---
        console.log("Creating 20 orders...");
        const newOrdersData = Array.from({ length: 20 }).map(() => {
            const randomClient = getRandomElement(createdClients);
            return {
                clientId: randomClient.id,
                status: getRandomElement(statuses),
                category: getRandomElement(categories),
                priority: getRandomElement(priorities),
                totalAmount: (getRandomInt(10, 500) * 100).toString(), // Random amount 1000 - 50000
                deadline: new Date(Date.now() + getRandomInt(1, 14) * 24 * 60 * 60 * 1000), // Deadline in 1-14 days
                createdBy: creatorId
            };
        });

        const createdOrders = await db.insert(orders).values(newOrdersData).returning();
        console.log(`✓ Created ${createdOrders.length} orders`);

        // --- Create Order Items (optional but good for realism) ---
        console.log("Adding items to orders...");
        const orderItemsData = [];
        for (const order of createdOrders) {
            const itemsCount = getRandomInt(1, 4);
            for (let i = 0; i < itemsCount; i++) {
                orderItemsData.push({
                    orderId: order.id,
                    description: `Товар/Услуга #${getRandomInt(100, 999)}`,
                    quantity: getRandomInt(1, 50),
                    price: (getRandomInt(5, 100) * 100).toString()
                });
            }
        }

        await db.insert(orderItems).values(orderItemsData);
        console.log(`✓ Added ${orderItemsData.length} items to ${createdOrders.length} orders`);

        console.log("\n✓ Seeding completed successfully!");

    } catch (error) {
        console.error("Error seeding database:", error);
        throw error;
    }

    process.exit(0);
}

main();
