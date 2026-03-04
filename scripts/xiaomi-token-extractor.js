/**
 * Xiaomi Token Extractor (Native Node.js v18+)
 * Использует встроенный fetch API для избежания проблем с socket hang up.
 */

import crypto from 'crypto';
import querystring from 'querystring';
import readline from 'readline';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

function md5(str) {
    return crypto.createHash('md5').update(str).digest('hex').toUpperCase();
}

async function requestFetch(url, options, body = null) {
    if (body) {
        options.body = body;
    }

    if (options.method === 'POST' && !options.headers['Content-Type']) {
        options.headers['Content-Type'] = 'application/x-www-form-urlencoded';
    }

    try {
        const response = await fetch(url, options);
        const responseText = await response.text();
        return {
            status: response.status,
            headers: Object.fromEntries(response.headers.entries()),
            body: responseText
        };
    } catch (err) {
        throw new Error(`Ошибка сети (${url}): ${err.message}`);
    }
}

async function extractXiaomiTokens() {
    console.log('\n=== Извлечение токенов Xiaomi ===\n');
    console.log('Скрипт поможет получить userId, serviceToken и ssecurity для CRM.\n');

    const username = await question('Введите email или номер телефона Xiaomi: ');
    const password = await question('Введите пароль: ');

    if (!username || !password) {
        console.log('Данные не введены, выход.');
        rl.close();
        return;
    }

    const passwordHash = md5(password);
    const baseUrl = 'https://account.xiaomi.com';
    const userAgent = 'Android-7.1.1-1.0.0-ONEPLUS A3010-136-NFVQWEASDFGHQWER MiijiaSDK/ONEPLUS A3010 App/xiaomi.smarthome APPV/62830';

    try {
        console.log('\n[1/3] Получение сессионных cookie...');
        const step1Response = await requestFetch(`${baseUrl}/pass/serviceLogin?sid=xiaomiio&_json=true`, {
            method: 'GET',
            headers: { 'User-Agent': userAgent }
        });

        const step1Text = step1Response.body.replace('&&&START&&&', '');
        const step1Json = JSON.parse(step1Text);

        const sign = step1Json._sign;
        const sid = step1Json.sid || 'xiaomiio';
        const callback = step1Json.callback || 'https://sts.api.io.mi.com/sts';

        const rawCookies = step1Response.headers['set-cookie'] || '';
        let cookies = rawCookies;
        if (typeof rawCookies === 'string') {
            cookies = rawCookies.split(',').map(c => c.split(';')[0]).join('; ');
        }

        const authParams = querystring.stringify({
            sid: sid,
            hash: passwordHash,
            callback: callback,
            qs: '%3Fsid%3Dxiaomiio%26_json%3Dtrue',
            user: username,
            _sign: sign,
            _json: 'true'
        });

        console.log('[2/3] Авторизация...');
        const step2Response = await requestFetch(`${baseUrl}/pass/serviceLoginAuth2`, {
            method: 'POST',
            headers: {
                'User-Agent': userAgent,
                'Cookie': cookies
            }
        }, authParams);

        const step2Text = step2Response.body.replace('&&&START&&&', '');
        let step2Json = JSON.parse(step2Text);

        if (step2Json.notificationUrl) {
            console.log('\nВНИМАНИЕ! Сработала защита 2FA.');
            console.log('1. Откройте эту ссылку в браузере (выполняйте там логин до успеха):');
            console.log(`\n=> ${step2Json.notificationUrl}\n`);

            await question('2. После успешного подтверждения в браузере, нажмите ENTER здесь...');

            console.log('\nПовторная попытка авторизации...');
            const retryResponse = await requestFetch(`${baseUrl}/pass/serviceLoginAuth2`, {
                method: 'POST',
                headers: {
                    'User-Agent': userAgent,
                    'Cookie': cookies
                }
            }, authParams);

            step2Json = JSON.parse(retryResponse.body.replace('&&&START&&&', ''));
        }

        if (step2Json.code !== 0) {
            console.error('\nОшибка авторизации:', step2Json.description || 'Неизвестная ошибка');
            console.log('Ответ сервера:', step2Json);
            rl.close();
            return;
        }

        const ssecurity = step2Json.ssecurity;
        const userId = step2Json.userId;
        const locationUrl = step2Json.location;

        if (!locationUrl) {
            console.error('\nНе удалось получить location URL. Возможно, потребуется использовать официальное приложение.');
            rl.close();
            return;
        }

        console.log('[3/3] Обмен Token на ServiceToken...');
        const stsResponse = await requestFetch(locationUrl, {
            method: 'GET',
            headers: { 'User-Agent': userAgent }
        });

        const finalRawCookies = stsResponse.headers['set-cookie'] || '';
        let serviceToken = '';
        if (typeof finalRawCookies === 'string') {
            const match = finalRawCookies.match(/serviceToken=([^;,\s]+)/);
            if (match) serviceToken = match[1];
        }

        if (!serviceToken) {
            console.log('\nНе удалось извлечь serviceToken. Ответ STS:', stsResponse.body);
            rl.close();
            return;
        }

        console.log('\n===== УСПЕШНО =====');
        console.log('\nСкопируйте эти данные в CRM (раздел Камеры -> Добавить аккаунт):\n');
        console.log(`Email (идентификатор): ${username}`);
        console.log(`User ID (xiaomiUserId): ${userId}`);
        console.log(`Service Token         : ${serviceToken}`);
        console.log(`ssecurity Token       : ${ssecurity}`);
        console.log('\n===================\n');

    } catch (error) {
        console.error('Критическая ошибка:', error.message);
    } finally {
        rl.close();
    }
}

extractXiaomiTokens();
