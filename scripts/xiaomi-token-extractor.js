import { getMiIOT } from 'mi-service-lite';
import readline from 'readline';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function extract() {
    console.log('\n=== Извлечение токенов Xiaomi (mi-service-lite) ===\n');
    console.log('Скрипт поможет получить userId, serviceToken и ssecurity для CRM.\n');

    const username = await question('Введите email или номер телефона Xiaomi: ');
    const password = await question('Введите пароль: ');

    if (!username || !password) {
        console.log('Данные не введены, выход.');
        rl.close();
        return;
    }

    console.log('\nПодключение к Xiaomi Cloud...');

    try {
        let miIOT;
        while (!miIOT) {
            // getMiIOT инициирует логин. Если потребуется 2FA, библиотека выведет ссылку в консоль.
            miIOT = await getMiIOT({
                userId: username,
                password: password,
                service: 'xiaomiio'
            });

            if (!miIOT || !miIOT.account) {
                console.log('\n[!] Похоже, требуется подтверждение (2FA).');
                console.log('Если в консоли выше появилась ссылка (notificationUrl), перейдите по ней в браузере и подтвердите вход.');
                await question('\nПосле того как подтвердите вход в браузере, нажмите ENTER здесь для повторной попытки...');
                miIOT = null; // Продолжаем цикл
            }
        }

        const account = miIOT.account;

        console.log('\n===== УСПЕШНО Авторизовано ===\n');
        console.log('Вставьте эти данные в форму "Добавить аккаунт" в CRM:\n');
        console.log(`Email (идентификатор): ${username}`);
        console.log(`User ID (xiaomiUserId): ${account.userId || 'Неизвестно'}`);
        console.log(`Service Token         : ${account.serviceToken}`);
        console.log(`ssecurity Token       : ${account.pass?.ssecurity || 'Не найдено'}`);
        console.log('\n==============================\n');

    } catch (error) {
        console.error('\n[Ошибка]:', error.message || error);
    } finally {
        rl.close();
    }
}

extract();
