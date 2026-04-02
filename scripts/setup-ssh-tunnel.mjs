import fs from 'fs';
import path from 'path';
import { execSync, spawn, spawnSync } from 'child_process';
import dotenv from 'dotenv';

// Цвета для вывода
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RED = '\x1b[31m';
const NC = '\x1b[0m';

const log = (msg) => console.log(`${GREEN}🚀 ${msg}${NC}`);
const warn = (msg) => console.log(`${YELLOW}⚠️  ${msg}${NC}`);
const error = (msg) => console.error(`${RED}❌ ${msg}${NC}`);

const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
} else {
    warn('.env.local не найден, использую системные переменные');
}

const SERVER_IP = '89.104.69.25';
const SSH_KEY = '~/.ssh/antigravity_key';

async function setup() {
    log('Настройка адаптивного SSH-туннеля...');

    // 1. Парсинг портов из ENV
    const dbUrl = process.env.DATABASE_URL || '';
    const dbPortMatch = dbUrl.match(/:(\d+)\//);
    const localDbPort = dbPortMatch ? dbPortMatch[1] : '5432';

    const localRedisPort = process.env.REDIS_PORT || '6379';
    
    // Порт для go2rtc (если используется)
    const localGo2rtcPort = '1984';

    log(`Целевые локальные порты: DB=${localDbPort}, Redis=${localRedisPort}`);

    let redisContainerIp = '127.0.0.1';
    let dbContainerIp = '127.0.0.1';
    try {
        log('Запрос IP контейнера Redis и DB на сервере...');
        // ship-safe-ignore: Command arguments are fixed, no user input
        const resultRedis = spawnSync('ssh', [
            '-i', SSH_KEY,
            `root@${SERVER_IP}`,
            `docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' merch-crm-redis`
        ], { encoding: 'utf8' });
        
        const ipR = resultRedis.stdout?.trim();
        if (ipR) {
            redisContainerIp = ipR;
            log(`IP Redis найден: ${redisContainerIp}`);
        }

        const resultDb = spawnSync('ssh', [
            '-i', SSH_KEY,
            `root@${SERVER_IP}`,
            `docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' merch-crm-db`
        ], { encoding: 'utf8' });
        
        const ipD = resultDb.stdout?.trim();
        if (ipD) {
            dbContainerIp = ipD;
            log(`IP DB найден: ${dbContainerIp}`);
        }
    } catch (e) {
        warn('Не удалось получить IP, использую 127.0.0.1');
    }

    // 3. Очистка локальных портов и старых процессов
    log('Очистка локальных портов...');
    try {
        execSync('killall autossh 2>/dev/null || true');
    } catch (e) {}

    [localDbPort, localRedisPort, localGo2rtcPort].forEach(port => {
        try {
            // ship-safe-ignore: Port is parsed from env or fixed numbers
            spawnSync('sh', ['-c', `lsof -ti:${port} | xargs kill -9 2>/dev/null || true`]);
        } catch (e) {}
    });

    // 4. Формирование команды SSH
    // Мы пробрасываем:
    // - Локальный DB порт -> 127.0.0.1:5432 (потому что Postgres проброшен на хост сервера)
    // - Локальный Redis порт -> RedisContainerIp:6379 (прямой доступ в контейнер)
    // - Локальный 1984 -> 127.0.0.1:1984 (go2rtc обычно проброшен)
    
    const sshCmd = [
        'autossh',
        '-M', '0', // Используем встроенные механизмы SSH (ServerAliveInterval) вместо монитор-порта autossh
        '-i', SSH_KEY,
        '-o', 'ServerAliveInterval=30',
        '-o', 'ServerAliveCountMax=3',
        '-o', 'ExitOnForwardFailure=yes',
        '-N', // Не выполнять команду, только туннель
        '-L', `${localDbPort}:${dbContainerIp}:5432`,
        '-L', `${localRedisPort}:${redisContainerIp}:6379`,
        '-L', `${localGo2rtcPort}:127.0.0.1:1984`,
        `root@${SERVER_IP}`
    ];

    log(`Запуск туннеля: ${sshCmd.join(' ')}`);

    const env = { ...process.env, AUTOSSH_GATETIME: '0', AUTOSSH_POLL: '30' };

    const tunnel = spawn(sshCmd[0], sshCmd.slice(1), {
        detached: true,
        stdio: 'ignore',
        env
    });

    tunnel.unref();

    // Даем время на установку соединения
    await new Promise(resolve => setTimeout(resolve, 2000));

    log('✅ SSH-туннель запущен в фоновом режиме');
    process.exit(0);
}

setup().catch(err => {
    error(`Ошибка: ${err.message}`);
    process.exit(1);
});
