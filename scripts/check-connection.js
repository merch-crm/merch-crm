const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Manually parse .env.local if dotenv is not working in this context or to be safe
function loadEnv() {
  const envPath = path.join(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, 'utf8');
    envFile.split('\n').forEach(line => {
      const match = line.match(/^([^#=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        let value = match[2].trim();
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.substring(1, value.length - 1);
        }
        process.env[key] = value;
      }
    });
  }
}

async function checkConnection() {
  loadEnv();
  
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL не найден в .env.local');
    process.exit(1);
  }

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    connectionTimeoutMillis: 5000,
  });

  try {
    await client.connect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Ошибка подключения к базе данных:', err.message);
    process.exit(1);
  }
}

checkConnection();
