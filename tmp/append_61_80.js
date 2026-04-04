const fs = require('fs');
const path = 'app/ui-kit/(categories)/errors/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// Add more icons
const nextIcons = ', ShieldCheck, Server, Cpu, MessageSquare, History, Gavel, FileJson, CheckCircle2, ThumbsUp, CloudSync, Star, Moon, Gauge';
content = content.replace(", CheckSquare", ", CheckSquare" + nextIcons);

const marker = '    </CategoryPage>';
const parts = content.split(marker);

if (parts.length < 2) {
  console.error("Could not find the marker.");
  process.exit(1);
}

const newItems = `
      {/* 61. Account Recovery */}
      <ComponentShowcase title="61. Recovery Process" source="custom" desc="Уведомление о начале восстановления доступа.">
         <BgSolid>
            <motion.div initial={{ scale: 0.95 }} whileInView={{ scale: 1 }} className={'\${solidStyles} p-8 w-full max-w-[340px] text-center'}>
               <ShieldCheck className="size-12 text-emerald-500 mx-auto mb-4" strokeWidth={1.5} />
               <h4 className="text-[16px] font-bold text-slate-900 mb-2">Проверка личности</h4>
               <p className="text-[12px] font-medium text-slate-500 mb-6">Мы отправили секретный код на вашу резервную почту. Код действителен в течение 10 минут.</p>
               <div className="flex gap-2 justify-center mb-6">
                  {[...Array(4)].map((_, i) => (
                     <div key={i} className="size-10 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center text-[18px] font-black text-slate-400">?</div>
                  ))}
               </div>
               <button className="text-[12px] font-bold text-blue-600 hover:text-blue-700">Не получили код?</button>
            </motion.div>
         </BgSolid>
      </ComponentShowcase>

      {/* 62. Database Backup */}
      <ComponentShowcase title="62. Hot Backup Progress" source="custom" desc="Процесс создания резервной копии БД.">
         <BgSolid>
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className={'\${solidStyles} p-6 w-full max-w-[340px]'}>
               <div className="flex items-center gap-3 mb-6">
                  <div className="bg-blue-50 p-2 rounded-lg">
                     <Database className="size-5 text-blue-600"/>
                  </div>
                  <h4 className="text-[14px] font-bold text-slate-900">Бэкап PostgreSQL</h4>
               </div>
               <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-[11px] font-bold text-slate-400 uppercase tracking-tighter">
                     <span>Прогресс (Cluster-A)</span>
                     <span>64%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                     <motion.div 
                        initial={{ width: 0 }} 
                        whileInView={{ width: '64%' }}
                        className="h-full bg-blue-600"
                     />
                  </div>
               </div>
               <p className="text-[11px] text-slate-400 text-center font-medium italic">Не закрывайте вкладку до завершения синхронизации.</p>
            </motion.div>
         </BgSolid>
      </ComponentShowcase>

      {/* 63. Critical Alert Octagon */}
      <ComponentShowcase title="63. Critical Violation" source="custom" desc="Экстренная блокировка из-за нарушения.">
         <BgSolid>
            <motion.div initial={{ scale: 0.8 }} whileInView={{ scale: 1 }} className={'\${solidStyles} !bg-rose-950 !border-rose-900 p-8 w-full max-w-[320px] text-center text-white'}>
               <AlertOctagon className="size-16 text-rose-500 mx-auto mb-6 animate-pulse" strokeWidth={1} />
               <h4 className="text-[18px] font-black uppercase tracking-widest mb-2">Обнаружена атака</h4>
               <p className="text-[12px] font-medium text-rose-300 opacity-80 mb-8">Зафиксирован массовый перебор паролей с вашего IP. Доступ к панели управления заблокирован на 24 часа.</p>
               <button className="w-full py-3 bg-rose-600 text-white font-bold rounded-[8px] text-[12px] shadow-lg shadow-rose-900/50">Запросить разблокировку (SLA)</button>
            </motion.div>
         </BgSolid>
      </ComponentShowcase>

      {/* 64. Billing Renewal */}
      <ComponentShowcase title="64. Subscription Status" source="custom" desc="Уведомление о продлении подписки.">
         <BgSolid>
            <motion.div initial={{ x: 20 }} whileInView={{ x: 0 }} className={'\${solidStyles} p-6 w-full max-w-[360px]'}>
               <div className="bg-indigo-50 p-4 rounded-2xl mb-6 flex items-center justify-between">
                  <div className="flex gap-3 items-center">
                     <Sparkles className="size-5 text-indigo-600"/>
                     <span className="text-[14px] font-bold text-indigo-900">Premium Plan</span>
                  </div>
                  <span className="text-[12px] font-black text-indigo-600">Active</span>
               </div>
               <h4 className="text-[15px] font-bold text-slate-900 mb-2">Следующее списание: $89.00</h4>
               <p className="text-[12px] font-medium text-slate-500 mb-6 text-pretty">Продление произойдет автоматически 12 апреля через Stripe. Если вы хотите изменить тариф, сделайте это до выходных.</p>
               <div className="flex gap-2">
                  <button className="flex-1 py-2.5 bg-slate-900 text-white font-bold rounded-[12px] text-[12px] hover:bg-slate-800 transition-colors">Управление</button>
                  <button className="flex-1 py-2.5 bg-slate-100 text-slate-800 font-bold rounded-[12px] text-[12px] hover:bg-slate-200 transition-colors">Чеки</button>
               </div>
            </motion.div>
         </BgSolid>
      </ComponentShowcase>

      {/* 65. API Key Leaked Prompt */}
      <ComponentShowcase title="65. Security Breach Found" source="custom" desc="Обнаружение утечки ключей в публичных репозиториях.">
         <BgSolid>
            <motion.div initial={{ y: -20 }} whileInView={{ y: 0 }} className={'\${solidStyles} p-0 w-full max-w-[340px] overflow-hidden'}>
               <div className="p-1 bg-rose-600 text-[10px] font-black text-center text-white uppercase tracking-widest">Emergency</div>
               <div className="p-6">
                  <div className="flex gap-4 items-start mb-6">
                     <div className="bg-rose-50 p-2 rounded-lg"><KeyRound className="size-6 text-rose-600"/></div>
                     <div>
                        <h4 className="text-[14px] font-black text-slate-900">Обнаружена утечка API</h4>
                        <p className="text-[11px] font-bold text-rose-500 uppercase mt-1 tracking-tighter italic">Found on GitHub Public Repo</p>
                     </div>
                  </div>
                  <p className="text-[12px] font-medium text-slate-500 mb-6">Ключ <code className="bg-slate-100 px-1 rounded text-slate-900">prod_sk...f92</code> скомпрометирован. Мы автоматически деактивировали его.</p>
                  <button className="w-full py-2.5 bg-slate-900 text-white font-bold rounded-[10px] text-[12px] shadow-sm hover:bg-slate-800 transition-colors">Сгенерировать новый ключ</button>
               </div>
            </motion.div>
         </BgSolid>
      </ComponentShowcase>

      {/* 66. Job Queue Status */}
      <ComponentShowcase title="66. Heavy Task in Queue" source="custom" desc="Индикация постановки задачи в очередь.">
         <BgSolid>
            <motion.div initial={{ scale: 0.9 }} whileInView={{ scale: 1 }} className={'\${solidStyles} p-6 w-full max-w-[400px] flex gap-5 items-center !rounded-[18px]'}>
               <div className="relative size-10 shrink-0">
                  <RotateCw className="size-full text-blue-500 animate-[spin_3s_linear_infinite]" strokeWidth={2.5}/>
                  <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-blue-600">#42</div>
               </div>
               <div className="flex-1 min-w-0">
                  <h4 className="text-[14px] font-bold text-slate-900 truncate">Рендеринг отчета DTF</h4>
                  <p className="text-[11px] font-medium text-slate-500 mt-0.5">В очереди перед вами: <strong className="text-slate-900">3 задачи</strong>. Примерное время ожидания: 1.5 мин.</p>
               </div>
            </motion.div>
         </BgSolid>
      </ComponentShowcase>

      {/* 67. Warehouse Conflict */}
      <ComponentShowcase title="67. Inventory Conflict" source="custom" desc="Конфликт остатков при двойном списании.">
         <BgSolid>
            <motion.div initial={{ x: -20 }} whileInView={{ x: 0 }} className={'\${solidStyles} p-0 w-full max-w-[320px] overflow-hidden'}>
               <div className="p-4 bg-slate-900 flex justify-between items-center">
                  <h4 className="text-[13px] font-bold text-white">Инвентарный конфликт</h4>
                  <div className="bg-amber-500 size-2 rounded-full animate-ping"></div>
               </div>
               <div className="p-6">
                  <p className="text-[12px] font-medium text-slate-500 mb-6">Пользователь <strong className="text-slate-900">Ivan P.</strong> только что списал 10 ед. товара. Ваши текущие данные устарели (было 12, осталось 2).</p>
                  <button className="w-full py-2.5 bg-white border border-slate-200 text-slate-900 font-bold rounded-[10px] text-[12px] flex items-center justify-center gap-2 hover:bg-slate-50">
                     <RefreshCcw className="size-3.5"/> Обновить остатки
                  </button>
               </div>
            </motion.div>
         </BgSolid>
      </ComponentShowcase>

      {/* 68. System Resource Spike */}
      <ComponentShowcase title="68. Resource Exhaustion" source="custom" desc="Критическая нагрузка на память сервера.">
         <BgSolid>
            <motion.div initial={{ y: 20 }} whileInView={{ y: 0 }} className={'\${solidStyles} p-5 w-full max-w-[340px] border border-rose-500 bg-rose-50/20 shadow-none'}>
               <div className="flex justify-between items-center mb-4">
                  <h4 className="text-[13px] font-black text-rose-600 uppercase tracking-widest">Memory Alert</h4>
                  <Cpu className="size-4 text-rose-500"/>
               </div>
               <div className="flex gap-1 items-end h-8 mb-4">
                  {[...Array(12)].map((_, i) => (
                     <div key={i} className={'flex-1 rounded-sm ' + (i > 8 ? 'bg-rose-500 animate-pulse' : 'bg-slate-200')} style={{ height: (Math.random() * 100) + '%' }}/>
                  ))}
               </div>
               <p className="text-[11px] font-bold text-slate-600">RAM Usage: <span className="text-rose-600">94.2% (15.1/16GB)</span>. Процессы могут быть завершены принудительно.</p>
            </motion.div>
         </BgSolid>
      </ComponentShowcase>

      {/* 69. Admin Broadcast */}
      <ComponentShowcase title="69. Message from System" source="custom" desc="Прямое сообщение от администратора системы.">
         <BgSolid>
            <motion.div initial={{ scale: 0.95 }} whileInView={{ scale: 1 }} className={'\${solidStyles} p-6 w-full max-w-[380px] bg-slate-900 text-white'}>
               <div className="flex gap-4 items-start">
                  <div className="size-10 rounded-full bg-blue-500 flex items-center justify-center font-bold text-[18px]">A</div>
                  <div className="flex-1">
                     <div className="flex justify-between items-center mb-2">
                        <h4 className="text-[14px] font-bold text-blue-400">Admin_Support</h4>
                        <span className="text-[10px] text-slate-500 uppercase">Broadcast</span>
                     </div>
                     <p className="text-[13px] leading-relaxed text-slate-300 font-medium italic">«Коллеги, сегодня в 18:00 будет обновлен модуль Логистики. Пожалуйста, завершите все активные путевые листы до этого времени.»</p>
                  </div>
               </div>
            </motion.div>
         </BgSolid>
      </ComponentShowcase>

      {/* 70. Session Persistence */}
      <ComponentShowcase title="70. Session Renewal" source="custom" desc="Автоматическое продление сессии пользователем.">
         <BgSolid>
            <motion.div initial={{ y: -10 }} whileInView={{ y: 0 }} className={'\${solidStyles} p-4 w-full max-w-[420px] flex items-center gap-4 border-l-4 border-emerald-500 !rounded-[16px]'}>
               <div className="bg-emerald-50 p-2.5 rounded-full"><Clock className="size-4 text-emerald-600"/></div>
               <div className="flex-1">
                  <h4 className="text-[13px] font-bold text-slate-900">Сессия успешно продлена</h4>
                  <p className="text-[11px] font-medium text-slate-500 mt-0.5">Ваша активность подтверждена. Следующий тайм-аут через 8 часов.</p>
               </div>
               <button className="text-[12px] font-bold text-slate-400 hover:text-slate-900 px-2 transition-colors">ОК</button>
            </motion.div>
         </BgSolid>
      </ComponentShowcase>

      {/* 71. Compliance Check */}
      <ComponentShowcase title="71. Compliance Verification" source="custom" desc="Проверка соответствия законодательству (GDPR/152-ФЗ).">
         <BgSolid>
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className={'\${solidStyles} p-8 w-full max-w-[340px] text-center bg-slate-50 border-double border-4 border-slate-200 shadow-none'}>
               <Gavel className="size-10 text-slate-400 mx-auto mb-4" strokeWidth={1.5}/>
               <h4 className="text-[16px] font-bold text-slate-900 mb-2">Обновите согласия</h4>
               <p className="text-[12px] font-medium text-slate-500 mb-6">В связи с новыми правилами обработки ПД, нам нужно ваше подтверждение на использование cookies для аналитики.</p>
               <div className="flex gap-2">
                  <button className="flex-1 py-2.5 bg-slate-900 text-white font-bold rounded-[10px] text-[12px]">Принимаю</button>
                  <button className="flex-1 py-2.5 bg-white border border-slate-200 text-slate-600 font-bold rounded-[10px] text-[12px]">Только обязательные</button>
               </div>
            </motion.div>
         </BgSolid>
      </ComponentShowcase>

      {/* 72. Import Success Summary */}
      <ComponentShowcase title="72. Data Import Summary" source="custom" desc="Итоговый отчет после импорта большого файла.">
         <BgSolid>
            <motion.div initial={{ scale: 0.95 }} whileInView={{ scale: 1 }} className={'\${solidStyles} p-6 w-full max-w-[340px]'}>
               <div className="flex gap-3 items-center mb-5">
                  <div className="bg-emerald-500 p-2 rounded-lg text-white"><FileJson className="size-5"/></div>
                  <h4 className="text-[15px] font-black text-slate-900">Импорт каталога</h4>
               </div>
               <div className="space-y-2 mb-6">
                  {[
                     { l: 'Создано товаров', v: '1,240', c: 'text-emerald-600' },
                     { l: 'Обновлено цен', v: '45', c: 'text-blue-600' },
                     { l: 'Ошибок (пропущено)', v: '0', c: 'text-slate-400' }
                  ].map((it, i) => (
                     <div key={i} className="flex justify-between text-[12px] border-b border-slate-50 pb-2">
                        <span className="text-slate-500 font-medium">{it.l}</span>
                        <span className={'font-bold ' + it.c}>{it.v}</span>
                     </div>
                  ))}
               </div>
               <button className="w-full py-2.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold rounded-[12px] text-[12px] transition-colors">Отлично</button>
            </motion.div>
         </BgSolid>
      </ComponentShowcase>

      {/* 73. Task Finished - Mini Toast */}
      <ComponentShowcase title="73. Silent Completion" source="custom" desc="Ненавязчивое уведомление о фоновом процессе.">
         <BgSolid>
            <motion.div initial={{ y: 50, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} className={'\${solidStyles} p-3 pl-4 w-full max-w-[280px] flex items-center gap-3 bg-white border-2 border-emerald-500 !rounded-full shadow-lg shadow-emerald-500/10'}>
               <CheckCircle2 className="size-4 text-emerald-500"/>
               <span className="text-[12px] font-bold text-slate-900 flex-1">Прайс-лист сформирован</span>
               <button className="bg-slate-50 p-1.5 rounded-full"><Download className="size-3 text-slate-400"/></button>
            </motion.div>
         </BgSolid>
      </ComponentShowcase>

      {/* 74. NPS / Feedback */}
      <ComponentShowcase title="74. User Feedback" source="custom" desc="Запрос оценки удовлетворенности системой.">
         <BgSolid>
            <motion.div initial={{ scale: 0.9 }} whileInView={{ scale: 1 }} className={'\${solidStyles} p-8 w-full max-w-[340px] text-center'}>
               <ThumbsUp className="size-10 text-amber-500 mx-auto mb-4" strokeWidth={1.5}/>
               <h4 className="text-[17px] font-bold text-slate-900 mb-1">Как вам новая CRM?</h4>
               <p className="text-[12px] font-medium text-slate-500 mb-8">Нам важно знать, стали ли вы работать быстрее после недавнего обновления.</p>
               <div className="flex gap-2 justify-center mb-4">
                  {[1, 2, 3, 4, 5].map(n => (
                     <button key={n} className="size-10 rounded-xl bg-slate-50 border border-slate-100 text-[14px] font-bold text-slate-400 hover:bg-indigo-600 hover:text-white transition-all transform hover:scale-110">{n}</button>
                  ))}
               </div>
               <button className="text-[11px] font-bold text-slate-400 hover:text-slate-600 tracking-tight uppercase">Не сейчас</button>
            </motion.div>
         </BgSolid>
      </ComponentShowcase>

      {/* 75. Sync Status Cluster */}
      <ComponentShowcase title="75. Regional Syncing" source="custom" desc="Процесс синхронизации данных между региональными складами.">
         <BgSolid>
            <motion.div initial={{ x: -10 }} whileInView={{ x: 0 }} className={'\${solidStyles} p-6 w-full max-w-[360px]'}>
               <div className="flex justify-between items-center mb-6">
                  <h4 className="text-[14px] font-black text-slate-900">Cluster Sync Status</h4>
                  <CloudSync className="size-5 text-blue-500 animate-[spin_4s_linear_infinite]"/>
               </div>
               <div className="grid grid-cols-2 gap-2 mb-6">
                  {['Siberia-Central', 'Dubai-Freezone', 'EU-Frankfurt', 'Asia-Pacific'].map((loc, i) => (
                     <div key={i} className="bg-slate-50 p-2.5 rounded-lg flex items-center gap-2 border border-slate-100">
                        <div className={'size-1.5 rounded-full ' + (i === 2 ? 'bg-amber-400 animate-pulse' : 'bg-emerald-500')}></div>
                        <span className="text-[10px] font-bold text-slate-600 truncate">{loc}</span>
                     </div>
                  ))}
               </div>
               <button className="w-full py-2 bg-slate-900 text-white font-bold rounded-[8px] text-[11px] shadow-sm hover:bg-slate-800">Перейти в панель мониторинга</button>
            </motion.div>
         </BgSolid>
      </ComponentShowcase>

      {/* 76. Achievement / Milestone */}
      <ComponentShowcase title="76. Milestone Reached" source="custom" desc="Поздравление с достижением бизнес-цели.">
         <BgSolid>
            <motion.div initial={{ y: 20 }} whileInView={{ y: 0 }} className={'\${solidStyles} !bg-indigo-600 !border-none p-1 w-full max-w-[320px] overflow-hidden'}>
               <div className="p-8 text-center bg-indigo-600">
                  <Star className="size-16 text-yellow-300 mx-auto mb-4 drop-shadow-[0_0_15px_rgba(253,224,71,0.5)]" fill="currentColor"/>
                  <h4 className="text-[18px] font-black text-white mb-2">100,000 Заказов!</h4>
                  <p className="text-[13px] font-medium text-white/80">Ваша компания преодолела важный порог. Мы подготовили подарок в разделе Настройки.</p>
               </div>
               <button className="w-full py-4 bg-white/10 hover:bg-white/20 text-white text-[13px] font-black uppercase tracking-widest transition-colors">Забрать бонус</button>
            </motion.div>
         </BgSolid>
      </ComponentShowcase>

      {/* 77. Environmental Detection */}
      <ComponentShowcase title="77. Theme Suggestion" source="custom" desc="Предложение сменить тему в зависимости от времени суток.">
         <BgSolid>
            <motion.div initial={{ scale: 0.95 }} whileInView={{ scale: 1 }} className={'\${solidStyles} p-6 w-full max-w-[340px] border-none bg-slate-900 text-white flex gap-5 items-center !rounded-[24px]'}>
               <div className="bg-indigo-500/20 p-3 rounded-full text-indigo-400 shrink-0"><Moon className="size-6 animate-[bounce_10s_ease-in-out_infinite]"/></div>
               <div className="flex-1">
                  <h4 className="text-[14px] font-bold">Пора передохнуть?</h4>
                  <p className="text-[11px] font-medium text-slate-400 mb-3 leading-snug text-pretty">Сейчас поздно. Может быть включим Ночной режим, чтобы глаза не уставали?</p>
                  <button className="text-[12px] font-black text-indigo-400 hover:text-indigo-300">Включить Dark Mode</button>
               </div>
            </motion.div>
         </BgSolid>
      </ComponentShowcase>

      {/* 78. Performance Insight */}
      <ComponentShowcase title="78. Optimization Tip" source="custom" desc="Интеллектуальная подсказка по оптимизации данных.">
         <BgSolid>
            <motion.div initial={{ y: -10 }} whileInView={{ y: 0 }} className={'\${solidStyles} p-6 w-full max-w-[320px]'}>
               <div className="flex items-center gap-2 text-indigo-600 mb-4">
                  <Gauge className="size-5"/>
                  <span className="text-[11px] font-black uppercase tracking-tighter">Perf Intel</span>
               </div>
               <h4 className="text-[15px] font-bold text-slate-900 mb-2">Ускорьте загрузку на 40%</h4>
               <p className="text-[12px] font-medium text-slate-500 mb-6">Ваш каталог содержит 200+ изображений без сжатия. Запустите автоматическую оптимизацию (WebP).</p>
               <button className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-[10px] text-[12px] transition-all">Применить везде</button>
            </motion.div>
         </BgSolid>
      </ComponentShowcase>

      {/* 79. Logout Confirmation */}
      <ComponentShowcase title="79. Farewell Prompt" source="custom" desc="Экран подтверждения выхода из системы.">
         <BgSolid>
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className={'\${solidStyles} p-8 w-full max-w-[320px] text-center'}>
               <LogOut className="size-10 text-slate-300 mx-auto mb-4" strokeWidth={1.5}/>
               <h4 className="text-[18px] font-bold text-slate-900 mb-2">Уже уходите?</h4>
               <p className="text-[12px] font-medium text-slate-500 mb-8 italic">«Продуктивный день — залог успеха.» — Merch CRM Support</p>
               <div className="flex flex-col gap-2">
                  <button className="w-full py-3 bg-rose-600 text-white font-bold rounded-[14px] text-[13px] hover:bg-rose-700 transition-colors">Завершить сессию</button>
                  <button className="w-full py-3 bg-slate-100 text-slate-500 font-bold rounded-[14px] text-[13px] hover:bg-slate-200 transition-colors">Остаться в системе</button>
               </div>
            </motion.div>
         </BgSolid>
      </ComponentShowcase>

      {/* 80. Massive Fail / Crash */}
      <ComponentShowcase title="80. Fatal Kernel Error" source="custom" desc="Критический сбой ядра системы.">
         <BgSolid>
            <motion.div initial={{ scale: 0.95 }} whileInView={{ scale: 1 }} className={'\${solidStyles} p-0 w-full max-w-[340px] overflow-hidden border-rose-500 shadow-[0_0_50px_rgba(244,63,94,0.1)]'}>
               <div className="p-4 bg-rose-600 flex gap-3 items-center">
                  <div className="size-2 rounded-full bg-white animate-ping"></div>
                  <h4 className="text-[13px] font-bold text-white tracking-widest uppercase">Kernel Panic</h4>
               </div>
               <div className="p-8 bg-white font-mono">
                  <p className="text-[12px] text-slate-900 mb-4 font-bold">Error code: 0x8004100E</p>
                  <p className="text-[11px] text-rose-500 mb-6 leading-relaxed">System state inconsistent. Shared memory segment (addr: 0xf12a) is corrupted. Re-authentication required after reboot.</p>
                  <button className="w-full py-3 bg-slate-900 text-white font-black rounded-[4px] text-[12px] uppercase shadow-md shadow-slate-900/40">Hard Restart (F5)</button>
               </div>
            </motion.div>
         </BgSolid>
      </ComponentShowcase>
`;

fs.writeFileSync(path, parts[0] + newItems + marker + parts[1]);
console.log("Successfully fixed and appended 61-80 system notifications!");
