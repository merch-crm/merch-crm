const fs = require('fs');
const path = 'app/ui-kit/(categories)/errors/page.tsx';
let content = fs.readFileSync(path, 'utf8');

const parts = content.split('    </CategoryPage>');
if (parts.length < 2) {
  console.error("Could not find the end of file.");
  process.exit(1);
}

// Add imports
const newIcons = ', ArrowUpCircle, KeyRound, Smartphone, Webhook, Activity, HardDrive, Hexagon, ShieldAlert, EyeOff, LayoutDashboard, ServerCrash, CalendarClock, LockKeyhole, GlobeLock, TimerOff, FileWarning, Ban, CreditCard, UserCog, Megaphone, CheckSquare';
content = content.replace(", Info, Power", ", Info, Power" + newIcons);

// Replace split
content = content.split('    </CategoryPage>')[0] + `
      {/* 41. System Update */}
      <ComponentShowcase title="41. System Update Available" source="custom" desc="Индикация доступного минорного обновления.">
         <BgSolid>
            <motion.div initial={{ y: -10 }} whileInView={{ y: 0 }} className={\`\${solidStyles} p-4 w-full max-w-[400px] flex gap-4 items-center bg-slate-900 text-white !rounded-[16px]\`}>
               <div className="relative flex size-3">
                 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                 <span className="relative inline-flex rounded-full size-3 bg-blue-500"></span>
               </div>
               <div className="flex-1">
                  <h4 className="text-[13px] font-bold">Доступно обновление 2.4.1</h4>
                  <p className="text-[11px] font-medium text-slate-400 mt-0.5">Исправления багов и оптимизация скорости.</p>
               </div>
               <button className="px-4 py-2 bg-white text-slate-900 rounded-[10px] text-[12px] font-bold hover:bg-slate-100 transition-colors">Обновить</button>
            </motion.div>
         </BgSolid>
      </ComponentShowcase>

      {/* 42. OTP Required */}
      <ComponentShowcase title="42. 2FA Setup Required" source="custom" desc="Требование включить двухфакторную защиту.">
         <BgSolid>
            <motion.div initial={{ scale: 0.95 }} whileInView={{ scale: 1 }} className={\`\${solidStyles} p-8 w-full max-w-[340px] text-center\`}>
               <Fingerprint className="size-12 text-slate-300 mx-auto mb-4" strokeWidth={1.5} />
               <h4 className="text-[16px] font-bold text-slate-900 mb-2">Обязательная настройка 2FA</h4>
               <p className="text-[12px] font-medium text-slate-500 mb-6">Администратор рабочей области включил обязательную политику двухфакторной защиты. Вам нужно настроить ее прямо сейчас.</p>
               <button className="w-full py-3 bg-slate-900 text-white rounded-[14px] text-[13px] font-bold shadow-sm hover:bg-slate-800 transition-colors mb-2">Привязать устройство</button>
               <button className="text-[12px] font-bold text-slate-400 hover:text-slate-600 transition-colors">Выйти из аккаунта</button>
            </motion.div>
         </BgSolid>
      </ComponentShowcase>

      {/* 43. Password Expiration */}
      <ComponentShowcase title="43. Password Expiration" source="custom" desc="Предупреждение о скором истечении пароля.">
         <BgSolid>
            <motion.div initial={{ x: 10 }} whileInView={{ x: 0 }} className={\`\${solidStyles} p-6 w-full max-w-[340px] border-l-4 border-amber-500\`}>
               <div className="flex items-center gap-3 mb-4">
                  <KeyRound className="size-5 text-amber-500" strokeWidth={2}/>
                  <h4 className="text-[14px] font-bold text-slate-900">Обновите пароль</h4>
               </div>
               <p className="text-[12px] font-medium text-slate-500 mb-6">Срок действия вашего текущего пароля истекает через <strong className="text-amber-600">7 дней</strong> согласно политике безопасности.</p>
               <button className="w-full py-2.5 bg-amber-50 text-amber-600 hover:bg-amber-100 font-bold rounded-[10px] text-[12px] transition-colors">Сменить сейчас</button>
            </motion.div>
         </BgSolid>
      </ComponentShowcase>

      {/* 44. Unauthorized Device */}
      <ComponentShowcase title="44. Unknown Device Login" source="custom" desc="Вход с неизвестного устройства.">
         <BgSolid>
            <motion.div initial={{ scale: 0.95 }} whileInView={{ scale: 1 }} className={\`\${solidStyles} p-0 w-full max-w-[320px] overflow-hidden\`}>
               <div className="p-6 bg-slate-50 border-b border-slate-100 flex flex-col items-center">
                  <Smartphone className="size-10 text-rose-500 mb-3"/>
                  <h4 className="text-[16px] font-bold text-slate-900 text-center">Новое устройство</h4>
               </div>
               <div className="p-6">
                  <p className="text-[12px] font-medium text-slate-500 mb-4 text-center">Выполнен вход в аккаунт с устройства <strong className="text-slate-900">iPhone 15 Pro</strong> (Berlin, Germany).</p>
                  <p className="text-[11px] font-bold text-rose-500 text-center uppercase tracking-widest mb-6">Это были не вы?</p>
                  <div className="flex gap-2">
                     <button className="flex-[2] py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-[12px] text-[12px]">Да, это я</button>
                     <button className="flex-[3] py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-[12px] text-[12px] shadow-sm">Заблокировать доступ</button>
                  </div>
               </div>
            </motion.div>
         </BgSolid>
      </ComponentShowcase>

      {/* 45. Webhook Failed */}
      <ComponentShowcase title="45. Webhook Delivery Failed" source="custom" desc="Ошибка доставки Webhook.">
         <BgSolid>
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className={\`\${solidStyles} p-5 w-full max-w-[380px] bg-slate-900 text-white font-mono\`}>
               <div className="flex justify-between items-center mb-4">
                  <div className="flex gap-2 items-center text-rose-400">
                     <Webhook className="size-4"/>
                     <span className="text-[12px] font-bold">Webhook 502 Bad Gateway</span>
                  </div>
                  <span className="text-[10px] text-slate-500">Just now</span>
               </div>
               <div className="bg-black/50 p-3 rounded-lg border border-slate-800 mb-4 overflow-hidden">
                  <pre className="text-[10px] text-slate-400 leading-relaxed font-mono">
{JSON.stringify({ event: "order.created", target: "https://api.erp.system/v1/trigger", error: "Timeout after 15000ms" }, null, 2)}
                  </pre>
               </div>
               <button className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-[8px] text-[11px] transition-colors">Повторить отправку (Retry)</button>
            </motion.div>
         </BgSolid>
      </ComponentShowcase>

      {/* 46. Quota Reached */}
      <ComponentShowcase title="46. Quota Warning" source="custom" desc="Лимит ресурсов на исходе.">
         <BgSolid>
            <motion.div initial={{ y: 20 }} whileInView={{ y: 0 }} className={\`\${solidStyles} p-6 w-full max-w-[320px]\`}>
               <div className="flex gap-3 items-center mb-5">
                  <Activity className="size-6 text-indigo-500"/>
                  <h4 className="text-[15px] font-bold text-slate-900">Лимиты пакета</h4>
               </div>
               <p className="text-[12px] font-medium text-slate-500 mb-4">Использовано 9,850 из 10,000 запросов гео-кодинга в этом месяце.</p>
               <div className="w-full h-2 bg-slate-100 rounded-full mb-1">
                  <div className="h-full bg-indigo-500 rounded-full w-[95%]"/>
               </div>
               <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-6 uppercase tracking-wider">
                  <span>98%</span>
               </div>
               <button className="w-full py-2.5 bg-white border border-slate-200 shadow-sm text-slate-900 font-bold rounded-[10px] text-[12px] hover:bg-slate-50">Купить пакет (+$10)</button>
            </motion.div>
         </BgSolid>
      </ComponentShowcase>

      {/* 47. SSL Expired */}
      <ComponentShowcase title="47. Certificate Expired" source="custom" desc="Потеря доверия к подписи интеграции.">
         <BgSolid>
            <motion.div initial={{ scale: 0.95 }} whileInView={{ scale: 1 }} className={\`\${solidStyles} p-8 w-full max-w-[300px] text-center bg-rose-50 border border-rose-100 shadow-none\`}>
               <ShieldAlert className="size-10 text-rose-500 mx-auto mb-4" strokeWidth={1.5} />
               <h4 className="text-[16px] font-bold text-rose-900 mb-2">Интеграция заморожена</h4>
               <p className="text-[12px] font-medium text-rose-700/80 mb-6">SSL-сертификат внешнего шлюза отозван. В целях безопасности мы заблокировали обмен данными.</p>
               <button className="w-full py-2.5 bg-rose-600 text-white font-bold rounded-[12px] text-[12px] shadow-sm hover:bg-rose-700 transition-colors">Настройки интеграции</button>
            </motion.div>
         </BgSolid>
      </ComponentShowcase>

      {/* 48. Node Disconnected */}
      <ComponentShowcase title="48. Infrastructure Alert" source="custom" desc="Отключение узла инфраструктуры.">
         <BgSolid>
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className={\`\${solidStyles} p-4 w-full max-w-[400px] flex gap-4 items-center !rounded-[16px]\`}>
               <div className="bg-red-100 p-2 rounded-lg shrink-0"><ServerCrash className="size-5 text-red-600"/></div>
               <div className="flex-1">
                  <h4 className="text-[13px] font-bold text-slate-900">Узел Worker-04 недоступен</h4>
                  <p className="text-[11px] font-medium text-slate-500 mt-0.5">Оркестратор перераспределяет задачи на другие воркеры...</p>
               </div>
            </motion.div>
         </BgSolid>
      </ComponentShowcase>

      {/* 49. Scheduled Maintenance */}
      <ComponentShowcase title="49. Scheduled Maintenance" source="custom" desc="Запланированные техработы.">
         <BgSolid>
            <motion.div initial={{ y: -20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} className={\`\${solidStyles} p-6 w-full max-w-[340px] text-center\`}>
               <CalendarClock className="size-10 text-blue-500 mx-auto mb-4" strokeWidth={1.5}/>
               <h4 className="text-[16px] font-bold text-slate-900 mb-2">Технические работы</h4>
               <p className="text-[12px] font-medium text-slate-500 mb-6">В это воскресенье (02:00 - 05:00 UTC) CRM будет недоступна 1-2 часа в связи с переходом на новую базу данных.</p>
               <button className="w-full py-2.5 bg-slate-100 text-slate-700 font-bold rounded-[12px] text-[12px] hover:bg-slate-200 transition-colors">Добавить в календарь</button>
            </motion.div>
         </BgSolid>
      </ComponentShowcase>

      {/* 50. Cache Cleared */}
      <ComponentShowcase title="50. Cache Flushed" source="custom" desc="Уведомление об успешной сбросе кэша.">
         <BgSolid>
            <motion.div initial={{ scale: 0.9 }} whileInView={{ scale: 1 }} className={\`\${solidStyles} p-4 w-full max-w-[300px] text-center border border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.1)]\`}>
               <CheckSquare className="size-8 text-emerald-500 mx-auto mb-3" strokeWidth={1.5}/>
               <h4 className="text-[14px] font-bold text-slate-900 mb-1">Redis очищен</h4>
               <p className="text-[11px] font-medium text-slate-500">14.2 MB инвалидированных ключей удалено.</p>
            </motion.div>
         </BgSolid>
      </ComponentShowcase>

      {/* 51. Locked Out */}
      <ComponentShowcase title="51. Account Locked" source="custom" desc="Блокировка аккаунта после неудачных попыток.">
         <BgSolid>
            <motion.div initial={{ x: -10 }} whileInView={{ x: 0 }} className={\`\${solidStyles} p-8 w-full max-w-[340px] text-center\`}>
               <LockKeyhole className="size-10 text-rose-600 mx-auto mb-4"/>
               <h4 className="text-[16px] font-bold text-slate-900 mb-2">Учетная запись заблокирована</h4>
               <p className="text-[12px] font-medium text-slate-500 mb-6">Слишком много неудачных попыток входа подряд. Мы отправили инструкцию по восстановлению вам на почту.</p>
               <button className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-[14px] text-[13px] shadow-sm transition-colors">Перейти в почту</button>
            </motion.div>
         </BgSolid>
      </ComponentShowcase>

      {/* 52. IP Whitelist */}
      <ComponentShowcase title="52. Access Denied (IP)" source="custom" desc="Попытка доступа с неразрешенного IP.">
         <BgSolid>
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className={\`\${solidStyles} p-6 w-full max-w-[320px] bg-slate-50 border-dashed border-slate-300 shadow-none\`}>
               <GlobeLock className="size-8 text-slate-400 mb-4"/>
               <h4 className="text-[14px] font-bold text-slate-900 mb-2">Ограничение по IP</h4>
               <p className="text-[12px] font-medium text-slate-500 mb-4">Вход разрешен только из офисной сети (192.168.x.x). Ваш текущий IP <strong className="text-slate-800">104.28.112.5</strong> не в белом списке.</p>
               <button className="text-[12px] font-bold text-blue-600 hover:underline">Как настроить VPN?</button>
            </motion.div>
         </BgSolid>
      </ComponentShowcase>

      {/* 53. Long Query Execution */}
      <ComponentShowcase title="53. Heavy Query Alert" source="custom" desc="Предупреждение о тяжелом запросе.">
         <BgSolid>
            <motion.div initial={{ y: 20 }} whileInView={{ y: 0 }} className={\`\${solidStyles} p-0 w-full max-w-[340px] overflow-hidden\`}>
               <div className="bg-amber-400 p-4 flex items-center justify-center gap-2">
                  <TimerOff className="size-5 text-amber-900"/>
                  <span className="text-[13px] font-black text-amber-900 uppercase tracking-widest">Внимание</span>
               </div>
               <div className="p-6 bg-white">
                  <h4 className="text-[14px] font-bold text-slate-900 mb-2">Тяжелый запрос</h4>
                  <p className="text-[12px] font-medium text-slate-500 mb-6">Сводный отчет за год без фильтров затронет более 2.4 млн строк. Генерация может занять до 15 минут.</p>
                  <div className="flex gap-2">
                     <button className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-[10px] text-[12px] transition-colors">Отмена</button>
                     <button className="flex-[2] py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 font-bold rounded-[10px] text-[12px] transition-colors">Всё равно запустить</button>
                  </div>
               </div>
            </motion.div>
         </BgSolid>
      </ComponentShowcase>

      {/* 54. Read Only Mode */}
      <ComponentShowcase title="54. Read Only Mode" source="custom" desc="Система в режиме только для чтения.">
         <BgSolid>
            <motion.div initial={{ scale: 0.95 }} whileInView={{ scale: 1 }} className={\`\${solidStyles} p-4 w-full max-w-[420px] flex items-center gap-4 bg-slate-800 text-white !rounded-[16px] border-none\`}>
               <div className="bg-slate-700 p-2.5 rounded-full"><EyeOff className="size-4 text-amber-400"/></div>
               <div className="flex-1">
                  <h4 className="text-[13px] font-bold">База в режиме Read-Only</h4>
                  <p className="text-[11px] font-medium text-slate-400 mt-0.5">В данный момент мы мигрируем кластер. Все записи временно заблокированы.</p>
               </div>
            </motion.div>
         </BgSolid>
      </ComponentShowcase>

      {/* 55. Data Exfiltration */}
      <ComponentShowcase title="55. Data Rules Violation" source="custom" desc="Блокировка угрозы утечки данных.">
         <BgSolid>
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className={\`\${solidStyles} p-6 w-full max-w-[340px] border-t-4 border-rose-600\`}>
               <FileWarning className="size-8 text-rose-600 mb-4"/>
               <h4 className="text-[16px] font-bold text-slate-900 mb-2">Нарушение DLP</h4>
               <p className="text-[12px] font-medium text-slate-500 mb-4">Вы пытаетесь скачать базу клиентов (CSV), но ваше устройство не числится как доверенное.</p>
               <div className="bg-rose-50 p-3 rounded-lg border border-rose-100 mb-6">
                  <span className="text-[11px] font-bold text-rose-800">Инцидент залогирован. СБ уведомлена.</span>
               </div>
               <button className="w-full py-2.5 bg-slate-100 text-slate-500 font-bold rounded-[10px] text-[12px] transition-colors hover:text-slate-900">Закрыть окно</button>
            </motion.div>
         </BgSolid>
      </ComponentShowcase>
      
      {/* 56. Deadlock / Wait */}
      <ComponentShowcase title="56. Table Lock" source="custom" desc="Блокировка таблицы другим процессом.">
         <BgSolid>
            <motion.div initial={{ y: 20 }} whileInView={{ y: 0 }} className={\`\${solidStyles} p-6 w-full max-w-[320px] text-center\`}>
               <Ban className="size-8 text-slate-400 mx-auto mb-4"/>
               <h4 className="text-[15px] font-bold text-slate-900 mb-2">Запись временно заблокирована</h4>
               <p className="text-[12px] font-medium text-slate-500 mb-6">Процесс выгрузки заказов удерживает таблицу. Ваше сохранение ожидании...</p>
               <div className="flex gap-1 justify-center fade-in duration-500">
                  <span className="size-2 bg-blue-500 rounded-full animate-bounce"></span>
                  <span className="size-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '100ms'}}></span>
                  <span className="size-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '200ms'}}></span>
               </div>
            </motion.div>
         </BgSolid>
      </ComponentShowcase>

      {/* 57. Storage Limit Near */}
      <ComponentShowcase title="57. Storage Quota Warning" source="custom" desc="Файловое хранилище почти заполнено.">
         <BgSolid>
            <motion.div initial={{ scale: 0.95 }} whileInView={{ scale: 1 }} className={\`\${solidStyles} p-6 w-full max-w-[360px] flex gap-4\`}>
               <div className="bg-red-50 p-3 rounded-xl h-max"><HardDrive className="size-6 text-red-500"/></div>
               <div className="flex-1">
                  <h4 className="text-[14px] font-bold text-slate-900 mb-1">Диск переполнен</h4>
                  <p className="text-[11px] font-medium text-slate-500 mb-3">Хранилище макетов S3: Использовано 4.9 TB (98%).</p>
                  <button className="px-4 py-2 bg-red-600 text-white font-bold rounded-[8px] text-[11px] shadow-sm hover:bg-red-700 w-full transition-colors">Очистить старые корзины</button>
               </div>
            </motion.div>
         </BgSolid>
      </ComponentShowcase>

      {/* 58. Payment Expiring */}
      <ComponentShowcase title="58. Payment Details Expiring" source="custom" desc="Карта оплаты скоро просрочится.">
         <BgSolid>
            <motion.div initial={{ x: -10 }} whileInView={{ x: 0 }} className={\`\${solidStyles} p-5 w-full max-w-[380px] flex items-center justify-between border-l-4 border-slate-800 !rounded-[16px]\`}>
               <div className="flex items-center gap-4">
                  <CreditCard className="size-6 text-slate-800"/>
                  <div>
                     <h4 className="text-[13px] font-bold text-slate-900">Обновите платежные данные</h4>
                     <p className="text-[11px] font-medium text-slate-500 mt-0.5">Карта Visa *1234 истекает через 10 дней.</p>
                  </div>
               </div>
               <button className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-md text-[11px] transition-colors shrink-0">Обновить</button>
            </motion.div>
         </BgSolid>
      </ComponentShowcase>

      {/* 59. Manual Approval Queue */}
      <ComponentShowcase title="59. Pending Manual Approval" source="custom" desc="Отправка на ручную модерацию.">
         <BgSolid>
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className={\`\${solidStyles} p-8 w-full max-w-[320px] text-center\`}>
               <UserCog className="size-12 text-slate-300 mx-auto mb-4" strokeWidth={1.5}/>
               <h4 className="text-[16px] font-bold text-slate-900 mb-2">Запрос отправлен старшему</h4>
               <p className="text-[13px] font-medium text-slate-500 mb-6">Скидки свыше 25% требуют ручного одобрения РОПа. Вы получите уведомление в системе.</p>
               <button className="w-full py-3 bg-white border border-slate-200 text-slate-700 font-bold shadow-sm rounded-[14px] text-[13px] hover:bg-slate-50 transition-colors">Вернуться к списку</button>
            </motion.div>
         </BgSolid>
      </ComponentShowcase>

      {/* 60. Changelog Release Modal */}
      <ComponentShowcase title="60. System Release Notes" source="custom" desc="Информационное уведомление о новом обновлении.">
         <BgSolid>
            <motion.div initial={{ y: 20 }} whileInView={{ y: 0 }} className={\`\${solidStyles} p-0 w-full max-w-[400px] overflow-hidden\`}>
               <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-center relative overflow-hidden text-white">
                  <div className="absolute top-0 right-0 -mr-8 -mt-8 size-40 bg-white/10 blur-2xl rounded-full"></div>
                  <Megaphone className="size-12 text-white mb-4 mx-auto relative z-10" strokeWidth={1.5}/>
                  <h4 className="text-[20px] font-black text-white relative z-10">Добро пожаловать в v2.5</h4>
               </div>
               <div className="p-6 bg-white">
                  <ul className="space-y-4 mb-6 text-[13px] text-slate-600 font-medium">
                     <li className="flex gap-3"><span className="text-emerald-500 font-bold shrink-0">Новое</span> Полноэкранный вид досок канбан.</li>
                     <li className="flex gap-3"><span className="text-blue-500 font-bold shrink-0">Фикс</span> Исправлен баг при скачивании PDF файлов.</li>
                     <li className="flex gap-3"><span className="text-amber-500 font-bold shrink-0">Убрано</span> Старый интерфейс инвентаризации удален.</li>
                  </ul>
                  <button className="w-full py-3 bg-slate-900 text-white font-bold rounded-[12px] text-[13px] shadow-sm hover:bg-slate-800 transition-colors">Изучить самостоятельно</button>
               </div>
            </motion.div>
         </BgSolid>
      </ComponentShowcase>

    </CategoryPage>
  );
}
`;

fs.writeFileSync(path, content);
console.log("Successfully appended 41-60 system notifications!");
