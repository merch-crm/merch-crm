#!/usr/bin/env node

const { Client } = require('pg');

async function checkConnection() {
    // Load environment variables
    require('dotenv').config({ path: '.env.local' });

    const client = new Client({
        connectionString: process.env.DATABASE_URL
    });

    try {
        console.log('🔍 Проверка подключения к базе данных...');
        await client.connect();
        const result = await client.query('SELECT NOW()');
        console.log('✅ Подключение успешно! Время сервера:', result.rows[0].now);
        await client.end();
        process.exit(0);
    } catch (error) {
        console.error('❌ Ошибка подключения к базе данных:', error.message);
        await client.end();
        process.exit(1);
    }
}

checkConnection();
