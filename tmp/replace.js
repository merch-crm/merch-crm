const fs = require('fs');
const path = 'app/ui-kit/(categories)/errors/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// Update imports
content = content.replace(
  'MessageSquare, ArrowRight, Save, Bell, AlertCircle, Trash2, History',
  'MessageSquare, ArrowRight, Save, Bell, AlertCircle, Trash2, History, Database, Lock, Info, Power'
);

// Split at point 21
const parts = content.split('      {/* 21. Welcome / App Tour */}');

if (parts.length < 2) {
  console.error("Could not find the split point!");
  process.exit(1);
}

const newEnd = `      {/* 21. 500 Internal Server Error */}
      <ComponentShowcase title="21. Critical System Crash" source="custom" desc="Критическая ошибка сервера (500).">
         <BgSolid>
            <motion.div initial={{ scale: 0.95 }} whileInView={{ scale: 1 }} className={\`\${solidStyles} p-8 w-full max-w-[340px] text-center border-t-4 border-rose-600\`}>
               <div className="bg-rose-50 text-rose-600 p-4 rounded-full mx-auto w-max mb-6">
                  <Server className="size-8" strokeWidth={2}/>
               </div>
               <h4 className="text-[18px] font-black text-slate-900 mb-2">Ошибка 500</h4>
               <p className="text-[13px] font-medium text-slate-500 mb-6">Внутренняя ошибка сервера. Наши инженеры уже получили уведомление.</p>
               <button className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-[14px] text-[13px] transition-colors">Вернуться на главную</button>
            </motion.div>
         </BgSolid>
      </ComponentShowcase>

      {/* 22. 404 Page Not Found */}
      <ComponentShowcase title="22. 404 Not Found" source="custom" desc="Страница не найдена или удалена.">
         <BgSolid>
            <motion.div initial={{ y: 20 }} whileInView={{ y: 0 }} className={\`\${solidStyles} p-10 w-full max-w-[380px] text-center\`}>
               <h1 className="text-[64px] font-black text-slate-200 tracking-tighter leading-none mb-4">404</h1>
               <h4 className="text-[18px] font-bold text-slate-900 mb-2">Страница потерялась</h4>
               <p className="text-[13px] font-medium text-slate-500 mb-8 px-4">Документ, который вы ищете, был перемещен или удален.</p>
               <div className="flex gap-2">
                  <button className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-[14px] text-[13px] transition-colors">Назад</button>
                  <button className="flex-[2] py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-[14px] text-[13px] shadow-sm transition-colors">В панель управления</button>
               </div>
            </motion.div>
         </BgSolid>
      </ComponentShowcase>

      {/* 23. Transaction Declined */}
      <ComponentShowcase title="23. Payment Failed" source="custom" desc="Уведомление об ошибке транзакции.">
         <BgSolid>
            <motion.div initial={{ x: -10 }} whileInView={{ x: 0 }} className={\`\${solidStyles} p-8 w-full max-w-[320px] text-center\`}>
               <div className="size-16 rounded-[20px] bg-rose-50 flex items-center justify-center mx-auto mb-5 border border-rose-100">
                  <X className="size-8 text-rose-500" strokeWidth={2.5}/>
               </div>
               <h4 className="text-[16px] font-bold text-slate-900 mb-2">Платеж отклонен</h4>
               <p className="text-[13px] text-slate-500 font-medium mb-6">Ваш банк отклонил транзакцию по карте *4912. Проверьте баланс.</p>
               <button className="w-full py-3 bg-slate-900 text-white rounded-[14px] text-[13px] font-bold hover:bg-slate-800 transition-colors">Повторить попытку</button>
               <button className="w-full py-3 text-slate-500 hover:text-slate-800 text-[13px] font-bold transition-colors mt-1">Использовать другую карту</button>
            </motion.div>
         </BgSolid>
      </ComponentShowcase>
      
      {/* 24. API Rate Limit */}
      <ComponentShowcase title="24. Rate Limit Exceeded" source="custom" desc="Исчерпан лимит запросов к API.">
         <BgSolid>
            <motion.div initial={{ scale: 0.9 }} whileInView={{ scale: 1 }} className={\`\${solidStyles} p-6 w-full max-w-[340px] flex-row gap-4 flex-wrap\`}>
               <div className="bg-amber-100/50 p-3 rounded-full shrink-0">
                  <Clock className="size-6 text-amber-600" strokeWidth={2.5}/>
               </div>
               <div className="flex-1">
                  <h4 className="text-[14px] font-bold text-slate-900">Слишком много запросов</h4>
                  <p className="text-[12px] font-medium text-slate-500 mt-1">Лимит API (100/мин) исчерпан.</p>
               </div>
               <div className="w-full bg-slate-50 border border-slate-100 rounded-[12px] p-3 text-center mt-2">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Автоматическая разблокировка через:</span>
                  <p className="text-[18px] font-black text-amber-600 mt-1">00:45</p>
               </div>
            </motion.div>
         </BgSolid>
      </ComponentShowcase>

      {/* 25. Session Expired */}
      <ComponentShowcase title="25. Session Timeout" source="custom" desc="Таймаут сессии из-за бездействия.">
         <BgSolid>
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className={\`\${solidStyles} p-8 w-full max-w-[300px] text-center !rounded-[36px]\`}>
               <div className="relative mx-auto w-max mb-6">
                  <div className="size-16 bg-slate-100 rounded-full flex items-center justify-center">
                     <UserX className="size-8 text-slate-400" strokeWidth={2}/>
                  </div>
                  <div className="absolute -bottom-1 -right-1 bg-amber-500 size-6 rounded-full border-2 border-white flex items-center justify-center">
                     <AlertTriangle className="size-3 text-white" strokeWidth={3}/>
                  </div>
               </div>
               <h4 className="text-[16px] font-bold text-slate-900 mb-2">Сессия истекла</h4>
               <p className="text-[12px] font-medium text-slate-500 mb-6">В целях безопасности мы завершили сеанс из-за неактивности.</p>
               <button className="w-full py-3 bg-blue-600 text-white rounded-[16px] text-[13px] font-bold shadow-md hover:bg-blue-700 transition-colors">Войти снова</button>
            </motion.div>
         </BgSolid>
      </ComponentShowcase>

      {/* 26. Cloud Sync Success */}
      <ComponentShowcase title="26. Cloud Sync Complete" source="custom" desc="Уведомление об успешной синхронизации.">
         <BgSolid>
            <motion.div initial={{ y: 20 }} whileInView={{ y: 0 }} className={\`\${solidStyles} p-6 w-full max-w-[320px] flex items-center text-center gap-3 !rounded-[24px]\`}>
               <div className="bg-emerald-50 w-full rounded-[16px] py-6 flex flex-col items-center border border-emerald-100/50">
                  <UploadCloud className="size-8 text-emerald-500 mb-2" strokeWidth={2}/>
                  <h4 className="text-[15px] font-bold text-slate-900">Синхронизировано</h4>
                  <p className="text-[11px] font-medium text-emerald-600 mt-1">Все изменения сохранены в облаке</p>
               </div>
               <button className="w-full py-3 text-[13px] font-bold text-slate-400 hover:text-slate-800 transition-colors">Окей, скрыть</button>
            </motion.div>
         </BgSolid>
      </ComponentShowcase>

      {/* 27. CSV Import Error */}
      <ComponentShowcase title="27. Parsed File Error" source="custom" desc="Ошибка при загрузке CSV файла.">
         <BgSolid>
            <motion.div initial={{ scale: 0.95 }} whileInView={{ scale: 1 }} className={\`\${solidStyles} p-0 w-full max-w-[380px] overflow-hidden\`}>
               <div className="bg-rose-50 p-6 flex gap-4 items-center border-b border-rose-100">
                  <div className="bg-white p-2 rounded-full shadow-sm"><FileEdit className="size-5 text-rose-500" strokeWidth={2}/></div>
                  <div>
                     <h4 className="text-[15px] font-bold text-rose-900">Ошибка парсинга CSV</h4>
                     <p className="text-[12px] font-medium text-rose-600/80">Файл customers_2025.csv</p>
                  </div>
               </div>
               <div className="p-6 bg-white">
                  <p className="text-[13px] font-medium text-slate-600 mb-4">В строке 42 отсутствует обязательное поле "Email". Загрузка остановлена.</p>
                  <div className="flex justify-end gap-3">
                     <button className="px-4 py-2 text-[13px] font-bold text-slate-500 hover:text-slate-800 transition-colors">Закрыть</button>
                     <button className="px-4 py-2 bg-slate-900 justify-end text-white rounded-[10px] text-[13px] font-bold hover:bg-slate-800 transition-colors">Загрузить исправленный</button>
                  </div>
               </div>
            </motion.div>
         </BgSolid>
      </ComponentShowcase>

      {/* 28. Null State / Not Found */}
      <ComponentShowcase title="28. Search Null State" source="custom" desc="Уведомление при пустом результате поиска.">
         <BgSolid>
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className={\`\${solidStyles} p-10 w-full max-w-[340px] text-center border border-dashed border-slate-300 bg-slate-50/50 shadow-none\`}>
               <Search className="size-10 text-slate-300 mx-auto mb-4" strokeWidth={1.5} />
               <h4 className="text-[16px] font-bold text-slate-700 mb-1">Ничего не найдено</h4>
               <p className="text-[13px] font-medium text-slate-500 mb-6">Попробуйте изменить параметры фильтрации или поисковый запрос.</p>
               <button className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-[12px] text-[12px] shadow-sm hover:bg-slate-50 transition-colors">Сбросить фильтры</button>
            </motion.div>
         </BgSolid>
      </ComponentShowcase>

      {/* 29. Unsaved Changes Alert */}
      <ComponentShowcase title="29. Unsaved Changes" source="custom" desc="Уведомление о несохраненных данных.">
         <BgSolid>
            <motion.div initial={{ y: 20 }} whileInView={{ y: 0 }} className={\`\${solidStyles} p-8 w-full max-w-[360px]\`}>
               <div className="flex gap-4 items-start mb-6">
                  <div className="bg-amber-100 text-amber-600 p-2.5 rounded-full shrink-0">
                     <Save className="size-5" strokeWidth={2.5}/>
                  </div>
                  <div>
                     <h4 className="text-[16px] font-bold text-slate-900 mb-1">Несохранённые изменения</h4>
                     <p className="text-[12px] font-medium text-slate-500 leading-relaxed">В форме остались новые данные. Если вы уйдете сейчас, они будут навсегда удалены.</p>
                  </div>
               </div>
               <div className="flex gap-2 w-full">
                  <button className="flex-1 py-3 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-[12px] text-[13px] transition-colors">Покинуть</button>
                  <button className="flex-[1.5] py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-[12px] text-[13px] shadow-md transition-colors">Сохранить и выйти</button>
               </div>
            </motion.div>
         </BgSolid>
      </ComponentShowcase>

      {/* 30. DB Integrity Error */}
      <ComponentShowcase title="30. Data Integrity Error" source="custom" desc="Уведомление о повреждении данных.">
         <BgSolid>
            <motion.div initial={{ scale: 0.9 }} whileInView={{ scale: 1 }} className={\`\${solidStyles} p-6 w-full max-w-[400px] flex-row items-center gap-5 !rounded-[20px] bg-rose-600 text-white shadow-[0_20px_40px_rgba(225,29,72,0.2)] border-rose-500\`}>
               <div className="bg-white/20 p-3 rounded-full shrink-0"><Database className="size-6 text-white"/></div>
               <div className="flex-1">
                  <h4 className="text-[15px] font-bold">Нарушение целостности</h4>
                  <p className="text-[12px] font-medium text-rose-100 mt-1">Обнаружена аномалия в индексах базы товаров.</p>
               </div>
               <button className="px-4 py-2 bg-white text-rose-600 text-[12px] font-bold rounded-lg shadow-sm hover:bg-rose-50 transition-colors">Подробнее</button>
            </motion.div>
         </BgSolid>
      </ComponentShowcase>

      {/* 31. Subscription Locked */}
      <ComponentShowcase title="31. License Expired" source="custom" desc="Лицензия CRM истекла.">
         <BgSolid>
            <motion.div initial={{ y: -20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} className={\`\${solidStyles} p-8 w-full max-w-[340px] text-center\`}>
               <div className="size-16 rounded-[20px] bg-indigo-50 flex items-center justify-center mx-auto mb-5 border border-indigo-100">
                  <Key className="size-8 text-indigo-500" strokeWidth={2}/>
               </div>
               <h4 className="text-[18px] font-bold text-slate-900 mb-2">Лицензия истекла</h4>
               <p className="text-[13px] text-slate-500 font-medium mb-6">Доступ к системе заморожен. Оплатите подписку для возобновления работы.</p>
               <button className="w-full py-3.5 bg-indigo-600 text-white rounded-[16px] text-[14px] font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 transition-colors">Оплатить подписку</button>
            </motion.div>
         </BgSolid>
      </ComponentShowcase>

      {/* 32. Multi-player Conflict */}
      <ComponentShowcase title="32. Edit Conflict Dialog" source="custom" desc="Конфликт одновременного редактирования.">
         <BgSolid>
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className={\`\${solidStyles} p-6 w-full max-w-[360px]\`}>
               <div className="flex justify-between items-start mb-4">
                  <div className="flex -space-x-2">
                     <div className="size-10 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center relative z-10"><UserX className="size-5 text-slate-500"/></div>
                     <div className="size-10 rounded-full border-2 border-white bg-blue-100 flex items-center justify-center relative translate-x-1"><UserX className="size-5 text-blue-500"/></div>
                  </div>
                  <AlertTriangle className="size-6 text-amber-500" />
               </div>
               <h4 className="text-[16px] font-bold text-slate-900 mb-2">Обнаружен конфликт</h4>
               <p className="text-[12px] font-medium text-slate-500 mb-6">Менеджер "Анна К." прямо сейчас редактирует эту же карточку товара. Если вы сохраните, её изменения будут перезаписаны.</p>
               <div className="flex gap-2">
                  <button className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-[10px] text-[12px]">Отмена</button>
                  <button className="flex-[1.5] py-2.5 bg-slate-900 text-white font-bold rounded-[10px] text-[12px]">Перезаписать принудительно</button>
               </div>
            </motion.div>
         </BgSolid>
      </ComponentShowcase>

      {/* 33. Feature Locked / Paywall */}
      <ComponentShowcase title="33. Feature Paywall" source="custom" desc="Уведомление о заблокированной функции.">
         <BgSolid>
            <motion.div initial={{ scale: 0.95 }} whileInView={{ scale: 1 }} className={\`\${solidStyles} p-0 w-full max-w-[300px] overflow-hidden text-center\`}>
               <div className="px-6 pb-6 pt-10 bg-slate-900 text-white flex flex-col items-center">
                  <Lock className="size-10 text-slate-400 mb-4" strokeWidth={1.5}/>
                  <h4 className="text-[18px] font-bold text-white mb-2">Доступ закрыт</h4>
                  <p className="text-[13px] font-medium text-slate-400">Модуль расширенной аналитики доступен только для Enterprise тарифов.</p>
               </div>
               <div className="p-4 bg-white w-full">
                  <button className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-[14px] text-[13px] transition-colors">Связаться с отделом продаж</button>
               </div>
            </motion.div>
         </BgSolid>
      </ComponentShowcase>

      {/* 34. Deprecation Warning */}
      <ComponentShowcase title="34. Deprecation Banner" source="custom" desc="Предупреждение об устаревшем API.">
         <BgSolid>
            <motion.div initial={{ y: -30 }} whileInView={{ y: 0 }} className={\`\${solidStyles} p-4 w-full max-w-[420px] flex-row gap-4 items-center !rounded-[16px] absolute top-6 bg-slate-800 text-white border-transparent\`}>
               <Info className="size-5 text-blue-400 shrink-0"/>
               <div className="flex-1 text-left">
                  <h4 className="text-[13px] font-bold">Версия API v1 устарела</h4>
                  <p className="text-[11px] font-medium text-slate-400 mt-0.5">Она будет отключена 12 Июня. Обновите интеграции.</p>
               </div>
               <button className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-[11px] font-bold transition-colors">Документация</button>
            </motion.div>
         </BgSolid>
      </ComponentShowcase>

      {/* 35. Lost Connection / Reconnecting */}
      <ComponentShowcase title="35. Reconnecting Modal" source="custom" desc="Уведомление о потере сети и реконнекте.">
         <BgSolid>
            <motion.div initial={{ scale: 0.9 }} whileInView={{ scale: 1 }} className={\`\${solidStyles} p-8 w-full max-w-[320px] text-center\`}>
               <div className="relative size-16 mx-auto mb-6">
                  <WifiOff className="size-16 text-slate-300" strokeWidth={1.5} />
                  <div className="absolute right-0 bottom-0 bg-white rounded-full p-1 shadow-sm">
                     <RefreshCw className="size-4 text-blue-500 animate-spin" />
                  </div>
               </div>
               <h4 className="text-[16px] font-bold text-slate-900 mb-1">Связь прервана</h4>
               <p className="text-[12px] font-medium text-slate-500 mb-6">Ожидание восстановления сети...</p>
               <div className="w-full h-1 bg-slate-100 mx-auto rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full w-1/3 animate-[slide_1s_infinite_alternate]" />
               </div>
            </motion.div>
         </BgSolid>
      </ComponentShowcase>

      {/* 36. Email Verification Needed */}
      <ComponentShowcase title="36. Verify Email Alert" source="custom" desc="Запрос подтверждения почты для доступа.">
         <BgSolid>
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className={\`\${solidStyles} p-8 w-full max-w-[340px] text-center\`}>
               <div className="size-16 bg-blue-50 text-blue-600 rounded-full mx-auto flex items-center justify-center mb-6"><Mail className="size-8" strokeWidth={1.5}/></div>
               <h4 className="text-[18px] font-bold text-slate-900 mb-2">Подтвердите адрес</h4>
               <p className="text-[13px] font-medium text-slate-500 mb-6 px-4">Для разблокировки функционала перейдите по ссылке в письме.</p>
               <button className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-[16px] text-[14px] transition-colors mb-2 shadow-sm">Я подтвердил</button>
               <button className="text-[12px] text-slate-400 hover:text-slate-700 font-bold underline">Отправить письмо еще раз</button>
            </motion.div>
         </BgSolid>
      </ComponentShowcase>

      {/* 37. Background Job Completed */}
      <ComponentShowcase title="37. Job Success Toast" source="custom" desc="Системное уведомление о завершении фоновой задачи.">
         <BgSolid>
            <motion.div initial={{ y: 50, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} className={\`\${solidStyles} p-4 w-full max-w-[360px] flex-row items-center gap-4 !rounded-[16px] absolute bottom-8\`}>
               <div className="bg-emerald-50 text-emerald-500 p-2.5 rounded-full shrink-0">
                  <CheckCircle2 className="size-5" strokeWidth={2.5}/>
               </div>
               <div className="flex-1 text-left">
                  <h4 className="text-[13px] font-bold text-slate-900">Бэкап создан</h4>
                  <p className="text-[11px] font-medium text-slate-500 mt-0.5">Резервная копия базы (110MB) загружена в AWS S3.</p>
               </div>
               <button className="text-[11px] font-black text-blue-600 uppercase tracking-widest hover:underline shrink-0 pr-2">Logs</button>
            </motion.div>
         </BgSolid>
      </ComponentShowcase>

      {/* 38. Server Resource Spikes */}
      <ComponentShowcase title="38. High CPU Alert" source="custom" desc="Модальное окно о превышении нагрузки.">
         <BgSolid>
            <motion.div initial={{ scale: 0.95 }} whileInView={{ scale: 1 }} className={\`\${solidStyles} p-0 w-full max-w-[320px] overflow-hidden\`}>
               <div className="bg-[#1e1e2e] p-6 text-center text-white border-b-4 border-amber-500">
                  <Cpu className="size-10 text-amber-500 mx-auto mb-3" strokeWidth={1.5}/>
                  <h4 className="text-[16px] font-bold mb-1">Высокая нагрузка CPU</h4>
                  <p className="text-[12px] text-slate-400 font-mono">Cluster: eu-west-1a</p>
               </div>
               <div className="p-6 text-center bg-white">
                  <p className="text-[13px] font-medium text-slate-600 mb-6 font-mono">Утилизация ядра превысила 92%. Ожидаются задержки в обработке очередей.</p>
                  <button className="w-full py-3 bg-slate-900 text-white font-bold rounded-[12px] text-[13px] shadow-sm hover:bg-slate-800 transition-colors">Масштабировать</button>
               </div>
            </motion.div>
         </BgSolid>
      </ComponentShowcase>

      {/* 39. System Reboot Warning */}
      <ComponentShowcase title="39. Forced Restart" source="custom" desc="Таймер перезагрузки системы.">
         <BgSolid>
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className={\`\${solidStyles} p-8 w-full max-w-[340px] text-center border-2 border-red-500 shadow-[0_0_40px_rgba(239,68,68,0.2)]\`}>
               <div className="size-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-5">
                  <Power className="size-8 text-red-600" strokeWidth={2}/>
               </div>
               <h4 className="text-[18px] font-bold text-slate-900 mb-2">Перезагрузка через</h4>
               <p className="text-[48px] font-black text-red-600 tracking-tighter leading-none mb-6 font-mono">04:59</p>
               <p className="text-[12px] font-medium text-slate-500 mb-6">Принудительное обновление безопасности CRM. Пожалуйста сохраните работу.</p>
               <button className="w-full py-3 text-red-600 hover:bg-red-50 font-bold rounded-[14px] text-[13px] transition-colors w-full">Перезагрузить сейчас</button>
            </motion.div>
         </BgSolid>
      </ComponentShowcase>

      {/* 40. Form Validation Errors */}
      <ComponentShowcase title="40. Validation Errors List" source="custom" desc="Системное окно с перечнем ошибок в форме.">
         <BgSolid>
            <motion.div initial={{ x: 10 }} whileInView={{ x: 0 }} className={\`\${solidStyles} p-6 w-full max-w-[340px] text-left\`}>
               <h4 className="text-[15px] font-bold text-rose-600 mb-1">Ошибки сохранения (3)</h4>
               <p className="text-[12px] font-medium text-slate-500 mb-4">Форма не прошла валидацию. Исправьте следующие поля:</p>
               <div className="flex flex-col gap-2 mb-6">
                  {['Артикул не может быть пустым', 'Цена не может быть отрицательной', 'Требуется выбрать склад'].map((e, i) => (
                     <div key={i} className="flex gap-2 items-start bg-rose-50/50 p-2 rounded-lg border border-rose-100">
                        <X className="size-3.5 text-rose-500 mt-0.5 shrink-0" strokeWidth={3}/>
                        <span className="text-[12px] font-semibold text-rose-900">{e}</span>
                     </div>
                  ))}
               </div>
               <button className="w-full py-2.5 bg-slate-900 text-white font-bold rounded-[12px] text-[13px] shadow-sm hover:bg-slate-800 transition-colors">Понятно</button>
            </motion.div>
         </BgSolid>
      </ComponentShowcase>

    </CategoryPage>
  );
}
`;

fs.writeFileSync(path, parts[0] + newEnd);
console.log("Successfully replaced chunks 21-40 with purely structural notifications!");
