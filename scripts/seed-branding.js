import pg from 'pg';
const { Client } = pg;
import fs from 'fs';
import path from 'path';

function loadEnv() {
    const envPath = path.join(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        envContent.split('\n').forEach(line => {
            const parts = line.split('=');
            if (parts.length === 2) {
                process.env[parts[0].trim()] = parts[1].trim().replace(/^"(.*)"$/, '$1');
            }
        });
    }
}

loadEnv();

const defaultBranding = {
    companyName: "MerchCRM",
    logoUrl: null,
    primaryColor: "#5d00ff",
    faviconUrl: null,
    radiusOuter: 24,
    radiusInner: 14,
    loginSlogan: "Ваша CRM для управления мерчем",
    dashboardWelcome: "Добро пожаловать в систему управления",
    notificationSound: "/sounds/notification.wav",
    isVibrationEnabled: true,
    soundConfig: {},
    backgroundColor: "#f2f2f2",
    crmBackgroundUrl: null,
    crmBackgroundBlur: 0,
    crmBackgroundBrightness: 100,
    emailPrimaryColor: "#5d00ff",
    emailContrastColor: "#ffffff",
    emailFooter: "С уважением, команда MerchCRM",
    emailSignature: "Управляйте вашим мерчем эффективно",
    currencySymbol: "₽",
    dateFormat: "DD.MM.YYYY",
    timezone: "Europe/Moscow"
};

async function seed() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL || 'postgresql://postgres:5738870192e24949b02a700547743048@localhost:5432/postgres',
    });

    try {
        await client.connect();
        console.log('🌱 Сидирование branding в system_settings...');
        
        await client.query(`
            INSERT INTO system_settings (key, value, updated_at, created_at)
            VALUES ($1, $2, NOW(), NOW())
            ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW();
        `, ["branding", JSON.stringify(defaultBranding)]);
        
        console.log('✅ Данные успешно сидированы.');
    } catch (err) {
        console.error('❌ Ошибка при сидировании:', err.message);
    } finally {
        await client.end();
    }
}

seed();
