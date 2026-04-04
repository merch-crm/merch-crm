const fs = require('fs');
const path = 'app/ui-kit/(categories)/errors/page.tsx';
let content = fs.readFileSync(path, 'utf8');

const marker = '    </CategoryPage>';
const parts = content.split(marker);

if (parts.length < 2) {
  process.exit(1);
}

const newItems = `
      {/* 81. Biometric + SMS */}
      <ComponentShowcase title="81. Multi-Factor Flow" source="custom" desc="Двухуровневая верификация (Биометрия + СМС).">
         <BgSolid>
            <motion.div initial={{ scale: 0.95 }} whileInView={{ scale: 1 }} className={'\${solidStyles} p-8 w-full max-w-[340px] text-center'}>
               <div className="flex justify-center -space-x-3 mb-6">
                  <div className="size-12 rounded-full bg-slate-900 flex items-center justify-center border-4 border-white"><Fingerprint className="size-6 text-white"/></div>
                  <div className="size-12 rounded-full bg-blue-500 flex items-center justify-center border-4 border-white"><Smartphone className="size-6 text-white"/></div>
               </div>
               <h4 className="text-[16px] font-bold text-slate-900 mb-2">Двойное подтверждение</h4>
               <p className="text-[12px] font-medium text-slate-500 mb-6">Для доступа к финансовым отчетам подтвердите личность через FaceID и введите код из СМС.</p>
               <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center justify-center gap-2 mb-6">
                  <span className="text-[20px] font-black text-slate-300 tracking-widest">****</span>
               </div>
               <button className="w-full py-3 bg-slate-900 text-white font-bold rounded-[14px] text-[13px]">Продолжить</button>
            </motion.div>
         </BgSolid>
      </ComponentShowcase>

      {/* 82. API Cooldown */}
      <ComponentShowcase title="82. Rate Limit Cooldown" source="custom" desc="Визуальный таймер при превышении лимитов запросов.">
         <BgSolid>
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className={'\${solidStyles} p-6 w-full max-w-[300px] text-center'}>
               <div className="relative size-20 mx-auto mb-4">
                  <svg className="size-full transform -rotate-90">
                     <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-slate-100" />
                     <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="4" fill="transparent" strokeDasharray="226" strokeDashoffset="180" className="text-rose-500 transition-all duration-1000" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                     <span className="text-[18px] font-black text-slate-900">46с</span>
                  </div>
               </div>
               <h4 className="text-[15px] font-bold text-slate-900 mb-2">Слишком много запросов</h4>
               <p className="text-[11px] font-medium text-slate-500">Пожалуйста, подождите. Ваша сессия временно ограничена системой безопасности.</p>
            </motion.div>
         </BgSolid>
      </ComponentShowcase>

      {/* 83. DB Migration Status */}
      <ComponentShowcase title="83. Database Structural Lock" source="custom" desc="Индикация применения миграций к БД.">
         <BgSolid>
            <motion.div initial={{ y: 20 }} whileInView={{ y: 0 }} className={'\${solidStyles} p-6 w-full max-w-[360px]'}>
               <div className="flex gap-4 items-center mb-6">
                  <div className="bg-amber-50 p-2 rounded-lg text-amber-600"><Dna className="size-6"/></div>
                  <div>
                     <h4 className="text-[14px] font-bold text-slate-900">Миграция схемы данных</h4>
                     <p className="text-[11px] text-slate-400 font-mono">v.2.4.8 -> v.2.5.0</p>
                  </div>
               </div>
               <div className="space-y-3 mb-6 font-mono text-[11px]">
                  <div className="flex items-center gap-2 text-emerald-600"><Check className="size-3"/> ALTER TABLE "orders" ADD COLUMN "loyalty_points"</div>
                  <div className="flex items-center gap-2 text-blue-600"><RefreshCw className="size-3 animate-spin"/> CREATE INDEX "idx_loyalty" ON "orders"</div>
                  <div className="flex items-center gap-2 text-slate-300"><Clock className="size-3"/> VACUUM ANALYZE</div>
               </div>
            </motion.div>
         </BgSolid>
      </ComponentShowcase>

      {/* 84. Cache Strategy UI */}
      <ComponentShowcase title="84. Cache Policy View" source="custom" desc="Окно управления кэшированием (TTL/LRU).">
         <BgSolid>
            <motion.div initial={{ scale: 0.95 }} whileInView={{ scale: 1 }} className={'\${solidStyles} p-6 w-full max-w-[340px]'}>
               <div className="flex justify-between items-center mb-6">
                  <h4 className="text-[14px] font-black text-slate-900">Сброс кэша шлюза</h4>
                  <Hourglass className="size-4 text-slate-400"/>
               </div>
               <div className="space-y-2 mb-6">
                  {['Static Assets', 'API Routes', 'User Sessions'].map((p, i) => (
                     <label key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                        <input type="checkbox" className="accent-slate-900" defaultChecked={i < 2} />
                        <span className="text-[12px] font-bold text-slate-700">{p}</span>
                     </label>
                  ))}
               </div>
               <button className="w-full py-2.5 bg-slate-900 text-white font-bold rounded-[12px] text-[12px]">Очистить выбранное</button>
            </motion.div>
         </BgSolid>
      </ComponentShowcase>

      {/* 85. Git Merge Conflict */}
      <ComponentShowcase title="85. Manual Merge Required" source="custom" desc="Конфликт версий при командной работе.">
         <BgSolid>
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className={'\${solidStyles} p-0 w-full max-w-[320px] overflow-hidden border-2 border-slate-900'}>
               <div className="bg-slate-900 p-4 flex items-center gap-3">
                  <GitBranch className="size-4 text-white"/>
                  <span className="text-[12px] font-black text-white uppercase tracking-tighter">Merge Conflict</span>
               </div>
               <div className="p-6">
                  <p className="text-[12px] font-medium text-slate-500 mb-6 italic">Файл <code className="text-slate-900 font-bold">pricing-strategy.ts</code> изменен одновременно вами и <strong className="text-slate-900">Petr S.</strong></p>
                  <div className="flex gap-2">
                     <button className="flex-1 py-2 bg-slate-100 text-slate-700 font-bold rounded-lg text-[11px]">Использовать моё</button>
                     <button className="flex-1 py-2 bg-slate-800 text-white font-bold rounded-lg text-[11px]">Использовать Петра</button>
                  </div>
               </div>
            </motion.div>
         </BgSolid>
      </ComponentShowcase>

      {/* 86. Docker Pull Image */}
      <ComponentShowcase title="86. Image Deployment Progress" source="custom" desc="Прогресс скачивания Docker-образа.">
         <BgSolid>
            <motion.div initial={{ y: 20 }} whileInView={{ y: 0 }} className={'\${solidStyles} p-6 w-full max-w-[400px] !rounded-[16px]'}>
               <div className="flex gap-4 items-center mb-6">
                  <Package className="size-8 text-blue-500"/>
                  <div className="flex-1">
                     <h4 className="text-[14px] font-black text-slate-900 uppercase italic">Docker Pulling</h4>
                     <p className="text-[11px] text-slate-500 mt-1 font-mono">merch-crm-worker:v2.5-final</p>
                  </div>
               </div>
               <div className="space-y-1.5">
                  {[
                     { l: 'Layer 1: a3ed5...', p: 100 },
                     { l: 'Layer 2: 4fd2a...', p: 100 },
                     { l: 'Layer 3: 1c83b...', p: 45 },
                     { l: 'Layer 4: extraction', p: 0 }
                  ].map((layer, i) => (
                     <div key={i} className="flex items-center gap-3">
                        <span className="text-[10px] font-mono text-slate-400 w-24 truncate">{layer.l}</span>
                        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                           <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: layer.p + '%' }}/>
                        </div>
                     </div>
                  ))}
               </div>
            </motion.div>
         </BgSolid>
      </ComponentShowcase>

      {/* 87. Redis Key Eviction */}
      <ComponentShowcase title="87. Key Eviction Alert" source="custom" desc="Уведомление о вытеснении ключей из Redis.">
         <BgSolid>
            <motion.div initial={{ scale: 0.95 }} whileInView={{ scale: 1 }} className={'\${solidStyles} p-6 w-full max-w-[340px] border-l-4 border-rose-500'}>
               <div className="flex gap-3 items-center mb-4">
                  <ZapOff className="size-5 text-rose-500"/>
                  <h4 className="text-[14px] font-bold text-slate-900">Redis: Eviction Spike</h4>
               </div>
               <p className="text-[12px] font-medium text-slate-500 mb-6">Мы заметили удаление «горячих» сессий из кэша из-за нехватки памяти (maxmemory-policy: allkeys-lru).</p>
               <button className="w-full py-2.5 bg-rose-50 text-rose-600 font-bold rounded-[10px] text-[12px] transition-colors hover:bg-rose-100">Увеличить лимит (Auto-scale)</button>
            </motion.div>
         </BgSolid>
      </ComponentShowcase>

      {/* 88. S3 Access Denied */}
      <ComponentShowcase title="88. Object Storage Denied" source="custom" desc="Ошибка доступа к объекту в облаке S3.">
         <BgSolid>
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className={'\${solidStyles} p-8 w-full max-w-[320px] text-center bg-slate-50 border-2 border-dashed border-slate-200 shadow-none'}>
               <CloudOff className="size-10 text-slate-400 mx-auto mb-4" strokeWidth={1.5}/>
               <h4 className="text-[16px] font-bold text-slate-900 mb-2">Объект недоступен</h4>
               <p className="text-[12px] font-medium text-slate-500 mb-6">Ссылка на макет <code className="text-slate-900 px-1 font-bold">mockup_v1.zip</code> истекла или объект был перемещен администратором.</p>
               <button className="text-[12px] font-bold text-blue-600 hover:underline">Проверить ACL настройки</button>
            </motion.div>
         </BgSolid>
      </ComponentShowcase>

      {/* 89. Payment Dispute */}
      <ComponentShowcase title="89. Billing Dispute" source="custom" desc="Уведомление об открытом диспуте по платежу.">
         <BgSolid>
            <motion.div initial={{ x: -20 }} whileInView={{ x: 0 }} className={'\${solidStyles} p-0 w-full max-w-[360px] overflow-hidden'}>
               <div className="bg-rose-600 p-4 flex items-center justify-between">
                  <span className="text-[11px] font-black text-rose-100 uppercase tracking-widest leading-none">Chargeback Alert</span>
                  <div className="bg-rose-400 size-1 rounded-full animate-ping"></div>
               </div>
               <div className="p-6">
                  <h4 className="text-[15px] font-bold text-slate-900 mb-3">Оспаривание транзакции</h4>
                  <p className="text-[12px] font-medium text-slate-500 mb-6">Банк клиента открыл диспут по платежу <strong className="text-slate-900">#TRX-9842</strong>. Ваш баланс временно заморожен на сумму $234.00.</p>
                  <div className="flex gap-2">
                     <button className="flex-1 py-3 bg-slate-900 text-white font-bold rounded-[14px] text-[12px]">Принять</button>
                     <button className="flex-1 py-3 bg-white border border-slate-200 text-slate-600 font-bold rounded-[14px] text-[12px]">Опротестовать</button>
                  </div>
               </div>
            </motion.div>
         </BgSolid>
      </ComponentShowcase>

      {/* 90. WebVitals Alert */}
      <ComponentShowcase title="90. Performance Degradation" source="custom" desc="Системное уведомление о снижении показателей скорости.">
         <BgSolid>
            <motion.div initial={{ y: -10 }} whileInView={{ y: 0 }} className={'\${solidStyles} p-6 w-full max-w-[340px]'}>
               <div className="flex gap-3 items-center mb-6">
                  <div className="bg-amber-100 p-2 rounded-lg"><PieChart className="size-5 text-amber-600"/></div>
                  <h4 className="text-[14px] font-bold text-slate-900 tracking-tight">Core Web Vitals Alert</h4>
               </div>
               <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-3 bg-slate-50 rounded-xl">
                     <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">LCP</p>
                     <span className="text-[16px] font-black text-rose-600">4.8s</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl">
                     <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">CLS</p>
                     <span className="text-[16px] font-black text-emerald-600">0.05</span>
                  </div>
               </div>
               <p className="text-[11px] font-medium text-slate-500 border-t border-slate-100 pt-4">Ваши последние изменения в карточке товара замедлили отрисовку. Рекомендуем выполнить аудит в <strong className="text-blue-600 cursor-pointer">Lighthouse</strong>.</p>
            </motion.div>
         </BgSolid>
      </ComponentShowcase>

      {/* 91. Session Hijacking Suspected */}
      <ComponentShowcase title="91. Security Hijack Suspected" source="custom" desc="Подозрение на кражу сессии куки.">
         <BgSolid>
            <motion.div initial={{ scale: 0.9 }} whileInView={{ scale: 1 }} className={'\${solidStyles} p-8 w-full max-w-[340px] text-center border-4 border-rose-600'}>
               <ShieldPlus className="size-16 text-rose-600 mx-auto mb-6" strokeWidth={1} />
               <h4 className="text-[18px] font-black text-slate-900 mb-2">Аварийный сброс сессии</h4>
               <p className="text-[12px] font-medium text-slate-500 mb-8">Резкое изменение User-Agent и IP-адреса внутри активной сессии. Мы принудительно разлогинили вас во избежание кражи данных.</p>
               <button className="w-full py-4 bg-slate-900 text-white font-black uppercase rounded-[12px] text-[12px] tracking-widest shadow-xl">Перелогиниться</button>
            </motion.div>
         </BgSolid>
      </ComponentShowcase>

      {/* 92. UI Version Mismatch */}
      <ComponentShowcase title="92. UI Kit Drift Alert" source="custom" desc="Обнаружение устаревших компонентов в кодовой базе.">
         <BgSolid>
            <motion.div initial={{ x: 20 }} whileInView={{ x: 0 }} className={'\${solidStyles} p-6 w-full max-w-[380px] flex gap-5 items-center'}>
               <div className="p-4 bg-indigo-50 text-indigo-600 rounded-3xl shrink-0"><Component className="size-8"/></div>
               <div className="flex-1">
                  <h4 className="text-[14px] font-bold text-slate-900">Drift Detection</h4>
                  <p className="text-[11px] font-medium text-slate-500 mt-1 mb-4 leading-relaxed">Вы используете <code className="bg-slate-100 px-1 rounded text-slate-900">Button v1.0.4</code>, хотя в мастер-системе доступна <code className="text-emerald-600 font-bold">v1.2.0</code>.</p>
                  <button className="text-[11px] font-black text-indigo-600 uppercase tracking-widest hover:underline">Запустить авто-миграцию</button>
               </div>
            </motion.div>
         </BgSolid>
      </ComponentShowcase>

      {/* 93. Data Integrity Failed */}
      <ComponentShowcase title="93. Corrupted Record Found" source="custom" desc="Сбой контрольной суммы записи в БД.">
         <BgSolid>
            <motion.div initial={{ y: -10 }} whileInView={{ y: 0 }} className={'\${solidStyles} p-6 w-full max-w-[320px] bg-rose-50/10 border border-rose-200'}>
               <div className="flex justify-between items-center mb-4">
                  <FileDigit className="size-5 text-rose-500"/>
                  <span className="text-[10px] font-black text-rose-400 uppercase tracking-tighter">Checksum Error</span>
               </div>
               <h4 className="text-[15px] font-bold text-slate-900 mb-2">Нарушение целостности</h4>
               <p className="text-[12px] font-medium text-slate-500 mb-6">Хэш-сумма записи <strong className="text-slate-900">#ORD-421</strong> не совпадает с оригинальной подписью. Данные могут быть повреждены.</p>
               <button className="w-full py-2.5 bg-white border border-rose-200 text-rose-600 font-bold rounded-lg text-[12px] hover:bg-rose-50">Восстановить из Wal-Log</button>
            </motion.div>
         </BgSolid>
      </ComponentShowcase>

      {/* 94. Network Jitter Warning */}
      <ComponentShowcase title="94. High Network Jitter" source="custom" desc="Нестабильное соединение с CRM.">
         <BgSolid>
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className={'\${solidStyles} p-4 w-full max-w-[420px] flex items-center gap-4 border-l-4 border-slate-800'}>
               <div className="bg-slate-100 p-2 rounded-lg text-slate-400"><SignalLow className="size-5"/></div>
               <div className="flex-1">
                  <h4 className="text-[13px] font-bold text-slate-900">Пакеты данных теряются</h4>
                  <p className="text-[11px] font-medium text-slate-500 mt-0.5">У вас высокая задержка (>400ms). Фоновые действия (автосохранение) могут работать нестабильно.</p>
               </div>
               <div className="bg-slate-950 px-2 py-1 rounded text-[10px] font-black text-white">428ms</div>
            </motion.div>
         </BgSolid>
      </ComponentShowcase>

      {/* 95. SOC2 Ready Modal */}
      <ComponentShowcase title="95. Compliance Badge" source="custom" desc="Информационное уведомление о прохождении аудита.">
         <BgSolid>
            <motion.div initial={{ scale: 0.95 }} whileInView={{ scale: 1 }} className={'\${solidStyles} p-8 w-full max-w-[340px] text-center'}>
               <div className="size-20 rounded-full bg-emerald-500 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-500/20">
                  <BadgeCheck className="size-12 text-white" strokeWidth={1} />
               </div>
               <h4 className="text-[18px] font-black text-slate-900 mb-2">SOC2 Type II Passed</h4>
               <p className="text-[12px] font-medium text-slate-500 mb-8 leading-relaxed">Система Merch CRM официально прошла ежегодный аудит безопасности. Ваши данные под защитой мировых стандартов.</p>
               <button className="w-full py-3.5 bg-slate-900 text-white font-bold rounded-[16px] text-[13px] shadow-lg">Скачать отчет аудита</button>
            </motion.div>
         </BgSolid>
      </ComponentShowcase>

      {/* 96. Global Analytics Goal */}
      <ComponentShowcase title="96. Conversion Celebration" source="custom" desc="Праздничное уведомление о достижении цели.">
         <BgSolid>
            <motion.div initial={{ y: 50, rotate: -2 }} whileInView={{ y: 0, rotate: 0 }} className={'\${solidStyles} !bg-[#0F172A] p-0 w-full max-w-[340px] overflow-hidden'}>
               <div className="p-8 text-center relative">
                  <PartyPopper className="size-16 text-yellow-400 mx-auto mb-4 animate-bounce" />
                  <h4 className="text-[24px] font-black text-white leading-tight mb-2">Цель достигнута!</h4>
                  <p className="text-[13px] font-medium text-slate-400 mb-8">Вы выполнили план продаж на этот квартал за рекордные 2 месяца. Вы — супергерой!</p>
                  <div className="grid grid-cols-3 gap-2">
                     {[...Array(6)].map((_, i) => (
                        <div key={i} className="h-1 bg-white/10 rounded-full">
                           <motion.div initial={{ width: 0 }} whileInView={{ width: '100%' }} transition={{ delay: i * 0.1 }} className="h-full bg-yellow-400"/>
                        </div>
                     ))}
                  </div>
               </div>
               <button className="w-full py-4 bg-indigo-600 text-white font-bold text-[13px] hover:bg-indigo-700 transition-colors uppercase tracking-[3px]">Поделиться успехом</button>
            </motion.div>
         </BgSolid>
      </ComponentShowcase>

      {/* 97. Support Agent Join */}
      <ComponentShowcase title="97. Live Support Joined" source="custom" desc="Уведомление о том, что менеджер зашел в чат.">
         <BgSolid>
            <motion.div initial={{ scale: 0.95 }} whileInView={{ scale: 1 }} className={'\${solidStyles} p-4 w-full max-w-sm flex items-center gap-4 bg-white border border-blue-200 shadow-[0_10px_30px_rgba(59,130,246,0.08)]'}>
               <div className="relative">
                  <div className="size-12 rounded-full overflow-hidden bg-slate-100">
                     <img src="https://ui-avatars.com/api/?name=Alex+K&background=0284c7&color=fff" alt="Agent" />
                  </div>
                  <div className="absolute bottom-0 right-0 size-3 bg-emerald-500 border-2 border-white rounded-full"></div>
               </div>
               <div className="flex-1">
                  <h4 className="text-[13px] font-bold text-slate-900">Алексей подключился</h4>
                  <p className="text-[11px] font-medium text-slate-500 mt-0.5 whitespace-nowrap overflow-hidden text-ellipsis">«Добрый день! Вижу у вас возникла сложность с...»</p>
               </div>
               <button className="px-3 py-1.5 bg-blue-600 text-white text-[11px] font-bold rounded-lg shrink-0">Ответить</button>
            </motion.div>
         </BgSolid>
      </ComponentShowcase>

      {/* 98. System Garbage Collection */}
      <ComponentShowcase title="98. GC Pause Warning" source="custom" desc="Пауза системы при очистке памяти.">
         <BgSolid>
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className={'\${solidStyles} p-5 w-full max-w-[320px] text-center border-2 border-slate-100 shadow-none'}>
               <RefreshCw className="size-8 text-slate-300 mx-auto mb-4 animate-[spin_5s_linear_infinite]"/>
               <h4 className="text-[14px] font-black text-slate-900 uppercase italic">Garbage Collection</h4>
               <p className="text-[11px] font-medium text-slate-500 px-4">Временная задержка (50-200ms) для оптимизации кучи Node.js. Извините за микро-лаги.</p>
            </motion.div>
         </BgSolid>
      </ComponentShowcase>

      {/* 99. Workspace Invite Teaser */}
      <ComponentShowcase title="99. New Team Invitation" source="custom" desc="Приглашение в новую рабочую область.">
         <BgSolid>
            <motion.div initial={{ y: 20 }} whileInView={{ y: 0 }} className={'\${solidStyles} p-6 w-full max-w-[340px]'}>
               <div className="size-14 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-950 flex items-center justify-center text-white mb-6 shadow-xl">
                  <UserCheck className="size-6"/>
               </div>
               <h4 className="text-[16px] font-black text-slate-900 mb-2">Вас пригласили в «Logistics Global»</h4>
               <p className="text-[12px] font-medium text-slate-500 mb-8 leading-snug">Мария Г. хочет, чтобы вы присоединились к отделу международных отгрузок.</p>
               <div className="flex gap-2">
                  <button className="flex-[2] py-3 bg-slate-900 text-white font-bold rounded-[14px] text-[12px]">Принять</button>
                  <button className="flex-[1] py-3 bg-slate-50 text-slate-400 font-bold rounded-[14px] text-[12px]">Позже</button>
               </div>
            </motion.div>
         </BgSolid>
      </ComponentShowcase>

      {/* 100. The Grand Record Milestone */}
      <ComponentShowcase title="100. One Million Milestone" source="custom" desc="Гранд-финал: празднование миллионной записи в системе.">
         <BgSolid>
            <motion.div 
               initial={{ scale: 0.9, y: 30 }} 
               whileInView={{ scale: 1, y: 0 }} 
               className={'\${solidStyles} !bg-white !border-4 !border-slate-950 p-0 w-full max-w-[400px] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.2)]'}
            >
               <div className="p-1 bg-slate-950 text-center font-black text-[10px] text-white uppercase tracking-[10px]">Grand Milestone</div>
               <div className="p-10 text-center">
                  <div className="relative inline-block mb-6">
                     <span className="text-[72px] font-black text-slate-950 block leading-none">1,000,000</span>
                     <span className="absolute -top-4 -right-8 bg-blue-600 text-white px-2 py-0.5 rounded-full text-[10px] font-bold">RECORDS</span>
                  </div>
                  <h4 className="text-[18px] font-bold text-slate-600 mb-8">Система Merch CRM официально обработала миллионный заказ.</h4>
                  <div className="flex justify-center gap-4">
                     {[...Array(3)].map((_, i) => (
                        <div key={i} className="size-1.5 bg-slate-950 rounded-full animate-bounce" style={{ animationDelay: i * 150 + 'ms' }}/>
                     ))}
                  </div>
               </div>
               <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                     <Heart className="size-4 text-rose-500 fill-rose-500"/>
                     <span className="text-[11px] font-black text-slate-900 uppercase">Built for Growth</span>
                  </div>
                  <button className="text-[12px] font-black text-slate-400 hover:text-slate-950">Закрыть историю</button>
               </div>
            </motion.div>
         </BgSolid>
      </ComponentShowcase>
`;

fs.writeFileSync(path, parts[0] + newItems + marker + parts[1]);
console.log("Successfully appended 81-100 system notifications!");
