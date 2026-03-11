import { db } from '@/lib/db';
import { applicationTypes } from '@/lib/schema';
import { v4 as uuidv4 } from 'uuid';

const defaultApplicationTypes = [
    {
        id: uuidv4(),
        name: 'DTF-печать',
        slug: 'dtf',
        color: '#3B82F6', // blue
        description: 'Прямая печать на плёнку с последующим переносом на ткань',
        sortOrder: 1,
    },
    {
        id: uuidv4(),
        name: 'Сублимация',
        slug: 'sublimation',
        color: '#8B5CF6', // purple
        description: 'Сублимационная печать на полиэстер',
        sortOrder: 2,
    },
    {
        id: uuidv4(),
        name: 'Шелкография',
        slug: 'silkscreen',
        color: '#F59E0B', // amber
        description: 'Трафаретная печать',
        sortOrder: 3,
    },
    {
        id: uuidv4(),
        name: 'Вышивка',
        slug: 'embroidery',
        color: '#10B981', // emerald
        description: 'Машинная вышивка',
        sortOrder: 4,
    },
    {
        id: uuidv4(),
        name: 'Термотрансфер',
        slug: 'heat-transfer',
        color: '#EF4444', // red
        description: 'Термоперенос готовых изображений',
        sortOrder: 5,
    },
    {
        id: uuidv4(),
        name: 'UV-печать',
        slug: 'uv-print',
        color: '#06B6D4', // cyan
        description: 'УФ-печать на твёрдых поверхностях',
        sortOrder: 6,
    },
];

export async function seedApplicationTypes() {
    console.log('🌱 Seeding application types...');

    for (const type of defaultApplicationTypes) {
        await db
            .insert(applicationTypes)
            .values(type)
            .onConflictDoNothing();
    }

    console.log('✅ Application types seeded');
}

// Запуск при прямом вызове файла
if (require.main === module) {
    seedApplicationTypes()
        .then(() => process.exit(0))
        .catch((err) => {
            console.error('❌ Seed failed:', err);
            process.exit(1);
        });
}
