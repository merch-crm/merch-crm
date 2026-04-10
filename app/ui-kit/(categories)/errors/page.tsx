"use client";

import React, { useState } from 'react';
import { CategoryPage, ComponentShowcase } from "@/components/ui-kit";
import { AlertTriangle, RefreshCw,
 X, Search, Sparkles,
 CloudLightning, Trash2, Smartphone, EyeOff, TimerOff, Eye, ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { BentoNewsletterSubscribe } from '@/components/library/custom/components/forms/bento-newsletter-subscribe';

// Утилита для фона, чтобы белые модалки контрастировали
const BgSolid = ({ children }: { children: React.ReactNode }) => (
 <div className="relative w-full min-h-[400px] bg-[#f1f3f5] bg-cover bg-center flex flex-col items-center justify-center p-4">

  {children}
 </div>
);

// Базовые стили для Solid White Modals
const solidStyles = "bg-white rounded-[32px] shadow-[0_24px_50px_rgba(0,0,0,0.06),0_4px_12px_rgba(0,0,0,0.03)] border border-slate-100 flex flex-col items-center justify-center relative z-10";

export default function ErrorsPage() {
 const [showPass02, setShowPass02] = useState(false);
 const [showPass06, setShowPass06] = useState(false);
 const [showLog0, setShowLog0] = useState(false);
 const [systemError] = useState({
  timestamp: new Date().toLocaleTimeString('ru-RU', { hour12: false }),
  code: 'FETCH_FAILED',
  path: '/api/v1/sync',
  status: '502 Bad Gateway',
  trace: 'sync.worker.ts:14:8'
 });


 const [pin, setPin] = useState(['', '', '', '']);
 const pinRefs = React.useRef<(HTMLInputElement | null)[]>([]);

 const handlePinChange = (index: number, value: string) => {
  const newVal = value.replace(/[^0-9]/g, '').slice(-1);
  const newPin = [...pin];
  newPin[index] = newVal;
  setPin(newPin);
  if (newVal && index < 3) pinRefs.current[index + 1]?.focus();
 };

 const handlePinKeyDown = (index: number, e: React.KeyboardEvent) => {
  if (e.key === 'Backspace' && !pin[index] && index > 0) {
   pinRefs.current[index - 1]?.focus();
  }
 };

 return (
  <CategoryPage title="Системные уведомления" description="Реестр системных уведомлений и модальных окон в стиле Modern Industrial Craft." count={15}>

   
   
   
   {/* ═══════════════════════════════════════════ */}
   {/* 1. ОШИБКИ                  */}
   {/* ═══════════════════════════════════════════ */}
   <div className="pt-8 pb-4 border-b border-slate-200">
    <div className="flex items-center gap-3">
     <h2 className="text-2xl font-bold text-slate-900 ">Ошибки</h2>
     <span className="text-[11px] font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">Модальное окно</span>
    </div>
    <p className="text-slate-500 font-medium mt-1">Критические сбои, потеря связи и ненайденные ресурсы.</p>
   </div>

   {/* 0. Primary System Notification */}
   <ComponentShowcase title="Ошибка #502 (Модальное окно)" source="custom" desc="Основное системное уведомление Modern Industrial Craft с развернутым логом ошибок и кнопкой 'Подробнее'.">
    <BgSolid>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} className="w-full max-w-[420px] bg-white border border-slate-200 p-2 flex flex-col gap-2 rounded-[32px] shadow-[0_24px_50px_rgba(0,0,0,0.06),0_4px_12px_rgba(0,0,0,0.03)] z-10 relative">
       <div className="bg-[#F9FAFB] rounded-[28px] p-8 flex flex-col items-center text-center overflow-hidden">
        <div className="w-20 h-20 bg-white shadow-sm border border-slate-100 rounded-[24px] flex items-center justify-center mb-6 relative z-10">
         <svg
          xmlns="http://www.w3.org/2000/svg"
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-[#EF4444]"
         >
          {/* Полупрозрачный фон иконки */}
          <polyline
           points="2 12 6 12 9 3 15 21 18 12 22 12"
           className="opacity-20"
          />
          {/* Бесшовный рисующий путь */}
          <motion.polyline
           points="2 12 6 12 9 3 15 21 18 12 22 12"
           animate={{ 
            pathLength: [0, 1, 0],
            pathOffset: [0, 0, 1]
           }}
           transition={{
            duration: 2.5,
            ease: "easeInOut",
            repeat: Infinity,
           }}
          />
         </svg>
        </div>
        
        <h3 className="text-zinc-900 font-bold text-2xl mb-2 relative z-10">Ошибка #502</h3>
        <p className="text-zinc-500 text-[15px] leading-tight relative z-10 font-medium px-4 mb-4">Обнаружена неполадка в работе модуля обмена данными. Рекомендуется повторить попытку или обратиться в поддержку.</p>
        
        <button 
         type="button"
         onClick={() => setShowLog0(!showLog0)}
         className="text-zinc-400 hover:text-zinc-900 text-[13px] font-bold transition-all flex items-center gap-1.5 mb-2 relative z-10"
        >
         {showLog0 ? 'Скрыть подробности' : 'Подробнее'}
         <ChevronDown className={`size-4 transition-transform duration-300 ${showLog0 ? 'rotate-180' : ''}`} />
        </button>

        <AnimatePresence>
         {showLog0 && (
          <motion.div 
           initial={{ height: 0, opacity: 0 }}
           animate={{ height: "auto", opacity: 1 }}
           exit={{ height: 0, opacity: 0 }}
           className="w-full overflow-hidden"
          >
           <div className="mt-4 p-4 bg-white border border-slate-100 rounded-[18px] text-left overflow-x-auto">
            <pre className="text-[11px] font-mono text-zinc-400 leading-tight">
             [SYSTEM_LOG] {systemError.timestamp}<br/>
             ERROR: {systemError.code}<br/>
             PATH: {systemError.path}<br/>
             STATUS: {systemError.status}<br/>
             TRACE: {systemError.trace}
            </pre>
           </div>
          </motion.div>
         )}
        </AnimatePresence>
       </div>
       <div className="flex gap-2 relative z-10">
        <button type="button" className="flex-1 py-4 bg-slate-50 rounded-[24px] text-zinc-600 font-bold hover:bg-slate-100 text-[15px] transition-all hover:text-zinc-900 border border-slate-100/50">Назад</button>
        <button type="button" className="flex-1 py-4 bg-[#EF4444] text-white font-bold rounded-[24px] hover:bg-red-600 text-[15px] shadow-sm transition-colors">Повторить</button>
       </div>
      </motion.div>
    </BgSolid>
   </ComponentShowcase>

   {/* 0.4 Offline State — Нет подключения */}
   <ComponentShowcase title="Нет подключения (Модальное окно)" source="custom" desc="Состояние потери интернет-соединения с автоматическим пингом.">
    <BgSolid>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} className="w-full max-w-[420px] bg-white border border-zinc-200 p-2 flex flex-col gap-2 rounded-[32px] shadow-[0_24px_50px_rgba(0,0,0,0.06),0_4px_12px_rgba(0,0,0,0.03)] z-10 relative">
       <div className="bg-slate-50 rounded-[28px] p-6 flex flex-col items-center text-center overflow-hidden">
        <div className="w-20 h-20 bg-white shadow-sm border border-stone-100 rounded-[24px] flex items-center justify-center mb-6 relative z-10">
         <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-600">
          {/* Базовая точка сигнала */}
          <motion.circle 
           cx="12" cy="19" r="1.5" 
           fill="currentColor" 
           stroke="none"
           animate={{ 
            opacity: [0, 1, 1, 1, 1, 0],
            scale: [0.5, 1, 1, 1, 1, 0.5]
           }}
           transition={{ 
            duration: 4, 
            times: [0, 0.1, 0.8, 0.9, 0.95, 1],
            repeat: Infinity,
            ease: "easeInOut"
           }}
          />
          
          {/* Дуги с анимацией волны */}
          {[
           { d: "M8.5 16.5a5 5 0 0 1 7 0", delay: 0.2 },
           { d: "M5 12.55a11 11 0 0 1 14.08 0", delay: 0.4 },
           { d: "M1.5 8.55a18 18 0 0 1 21 0", delay: 0.6 }
          ].map((arc, i) => (
           <motion.path 
            key={i}
            d={arc.d}
            initial={{ opacity: 0.1 }}
            animate={{ opacity: [0.1, 1, 0.1] }}
            transition={{ 
             duration: 2, 
             delay: arc.delay,
             repeat: Infinity,
             ease: "easeInOut"
            }}
           />
          ))}
         </svg>
        </div>
        <h3 className="text-zinc-900 font-bold text-xl mb-2 relative z-10">Нет подключения</h3>
        <p className="text-stone-500 text-[15px] leading-tight relative z-10 font-medium">Интернет-соединение отсутствует. Данные будут сохранены локально и синхронизированы при восстановлении связи.</p>
       </div>
       <div className="flex gap-2 relative z-10">
        <button type="button" className="flex-1 py-4 bg-slate-50 rounded-[24px] text-zinc-600 font-bold hover:bg-slate-100 text-[15px] transition-all hover:text-zinc-900">Работать оффлайн</button>
        <button type="button" className="flex-1 py-4 bg-zinc-900 text-white font-bold rounded-[24px] hover:bg-zinc-800 text-[15px] shadow-sm transition-colors flex items-center justify-center gap-2">
         <RefreshCw className="size-4 animate-spin" />
         Повторить
        </button>
       </div>
      </motion.div>
    </BgSolid>
   </ComponentShowcase>

   {/* 0.8 Page Not Found — Страница не найдена */}
   <ComponentShowcase title="Страница не найдена 404 (Модальное окно)" source="custom" desc="Уведомление об ошибке 404 в стиле Modern Industrial Craft.">
    <BgSolid>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} className="w-full max-w-[420px] bg-white border border-slate-200 p-2 flex flex-col gap-2 rounded-[32px] shadow-[0_24px_50px_rgba(0,0,0,0.06),0_4px_12px_rgba(0,0,0,0.03)] z-10 relative">
       <div className="bg-[#F9FAFB] rounded-[28px] p-8 flex flex-col items-center text-center overflow-hidden">
        <div className="w-20 h-20 bg-white shadow-sm border border-slate-100 rounded-[24px] flex items-center justify-center mb-6 relative z-10">
         <motion.div 
          animate={{ 
           x: [0, -4, 4, -4, 0],
           y: [0, -4, 4, -4, 0]
          }} 
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
         >
          <Search className="size-8 text-zinc-400" strokeWidth={1.5} />
         </motion.div>
        </div>
        <h3 className="text-zinc-900 font-bold text-3xl mb-1 relative z-10 text-[32px]">404</h3>
        <p className="text-zinc-900 font-bold text-lg mb-2 relative z-10">Страница не найдена</p>
        <p className="text-zinc-500 text-[14px] leading-tight relative z-10 font-medium px-4">Запрашиваемый ресурс был удален, перемещен или никогда не существовал.</p>
       </div>
       <div className="flex gap-2 relative z-10">
        <button type="button" className="flex-1 py-4 bg-slate-50 rounded-[24px] text-zinc-600 font-bold hover:bg-slate-100 text-[15px] transition-all hover:text-zinc-900 border border-slate-100/50">Назад</button>
        <button type="button" className="flex-1 py-4 bg-zinc-900 text-white font-bold rounded-[24px] hover:bg-zinc-800 text-[15px] shadow-sm transition-all font-bold">На главную</button>
       </div>
      </motion.div>
    </BgSolid>
   </ComponentShowcase>

   {/* ═══════════════════════════════════════════ */}
   {/* 2. ПОДТВЕРЖДЕНИЕ ДЕЙСТВИЯ          */}
   {/* ═══════════════════════════════════════════ */}
   <div className="pt-12 pb-4 border-b border-slate-200">
    <div className="flex items-center gap-3">
     <h2 className="text-2xl font-bold text-red-600 ">Подтверждение действия</h2>
     <span className="text-[11px] font-bold text-red-400 bg-red-50 px-2.5 py-1 rounded-full">Модальное окно</span>
    </div>
    <p className="text-slate-500 font-medium mt-1">Деструктивные операции, требующие явного подтверждения пользователя.</p>
   </div>

   {/* 0.2 Destructive Confirm — Подтверждение удаления */}
   <ComponentShowcase title="Удаление (Модальное окно)" source="custom" desc="Подтверждение необратимого действия с текстовым вводом названия для защиты от случайного удаления.">
    <BgSolid>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} className="w-full max-w-[420px] bg-white border border-slate-200/60 p-2 flex flex-col gap-2 rounded-[32px] shadow-[0_24px_50px_rgba(0,0,0,0.06),0_4px_12px_rgba(0,0,0,0.03)] z-10 relative">
       <div className="bg-[#F9FAFB] rounded-[28px] p-8 flex flex-col items-center text-center overflow-hidden">
        <div className="w-20 h-20 bg-white shadow-sm border border-slate-100 rounded-[24px] flex items-center justify-center mb-5 relative z-10">
         <motion.svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500" animate={{ rotate: [0, -8, 8, -4, 0] }} transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 1.5, ease: "easeInOut" }} style={{ transformOrigin: "top center" }}>
          <path d="M3 6h18" />
          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
          <line x1="10" x2="10" y1="11" y2="17" />
          <line x1="14" x2="14" y1="11" y2="17" />
         </motion.svg>
        </div>
        <h3 className="text-slate-900 font-bold text-xl mb-2 relative z-10">Удалить?</h3>
        <p className="text-slate-500 text-[15px] leading-tight relative z-10 font-medium mb-4">Это действие необратимо. Все данные, файлы и история будут уничтожены навсегда.</p>
        <div className="w-full relative z-10">
         <label className="text-[11px] font-bold text-slate-400 block text-left mb-1.5 pl-1">Введите пароль пользователя</label>
         <div className="relative">
          <input type={showPass02 ? "text" : "password"} placeholder="••••••••" className="w-full bg-white [&:-webkit-autofill]:shadow-[0_0_0_1000px_white_inset] [&:-webkit-autofill]:[-webkit-text-fill-color:inherit] [transition:background-color_9999999s_ease-in-out_0s] border border-slate-200/60 rounded-[18px] px-5 py-4 pr-12 text-[15px] text-zinc-900 placeholder:text-zinc-300 outline-none focus:border-zinc-900 transition-all font-bold shadow-[inset_0_2px_4px_rgba(0,0,0,0.01)]" />
          <button 
          type="button"
          onClick={() => setShowPass02(!showPass02)}
          className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-zinc-600 transition-colors"
          >
           {showPass02 ? <EyeOff className="size-4" strokeWidth={2.5} /> : <Eye className="size-4" strokeWidth={2.5} />}
          </button>
         </div>
        </div>
       </div>
       <div className="flex gap-2 relative z-10">
        <button className="flex-1 py-4 bg-slate-50 rounded-[24px] text-zinc-600 font-bold hover:bg-slate-100 text-[15px] transition-all hover:text-zinc-900">Отмена</button>
        <button type="button" className="flex-1 py-4 bg-[#F04438] text-white font-bold rounded-[24px] hover:bg-red-600 text-[15px] shadow-sm transition-colors opacity-50 cursor-not-allowed">Удалить навсегда</button>
       </div>
      </motion.div>
    </BgSolid>
   </ComponentShowcase>

   {/* 0.7 Simple Delete — Простое удаление */}
   <ComponentShowcase title="Удаление элемента (Модальное окно)" source="custom" desc="Быстрое подтверждение удаления без необходимости ввода пароля.">
    <BgSolid>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} className="w-full max-w-[420px] bg-white border border-slate-200 p-2 flex flex-col gap-2 rounded-[32px] shadow-[0_24px_50px_rgba(0,0,0,0.06),0_4px_12px_rgba(0,0,0,0.03)] z-10 relative">
       <div className="bg-[#F9FAFB] rounded-[28px] p-8 flex flex-col items-center text-center overflow-hidden">
        <div className="w-20 h-20 bg-white shadow-sm border border-slate-100 rounded-[24px] flex items-center justify-center mb-6 relative z-10 mx-auto">
         <motion.div animate={{ rotate: [0, -8, 8, -4, 0] }} transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 1.5, ease: "easeInOut" }} style={{ transformOrigin: "top center" }}>
          <Trash2 className="size-8 text-red-500" strokeWidth={1.5} />
         </motion.div>
        </div>
        <h3 className="text-zinc-900 font-bold text-xl mb-2 relative z-10">Удалить элемент?</h3>
        <p className="text-zinc-500 text-[15px] leading-tight relative z-10 font-medium">Это действие необратимо. Элемент будет исключен из базы данных без возможности восстановления.</p>
       </div>
       <div className="flex gap-2 relative z-10">
        <button className="flex-1 py-4 bg-slate-50 rounded-[24px] text-zinc-600 font-bold hover:bg-slate-100 text-[15px] transition-all hover:text-zinc-900">Отмена</button>
        <button type="button" className="flex-1 py-4 bg-red-500 text-white font-bold rounded-[24px] hover:bg-red-600 text-[15px] shadow-sm transition-colors">Удалить</button>
       </div>
      </motion.div>
    </BgSolid>
   </ComponentShowcase>

   {/* ═══════════════════════════════════════════ */}
   {/* 3. БЕЗОПАСНОСТЬ               */}
   {/* ═══════════════════════════════════════════ */}
   <div className="pt-12 pb-4 border-b border-slate-200">
    <div className="flex items-center gap-3">
     <h2 className="text-2xl font-bold text-slate-900 ">Безопасность</h2>
     <span className="text-[11px] font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">Модальное окно</span>
    </div>
    <p className="text-slate-500 font-medium mt-1">Верификация, доступ к данным и управление сессиями.</p>
   </div>


   {/* 4. PIN Code Entry (Окно ввода разового пароля) */}
   <ComponentShowcase title="Ввод PIN-кода (Модальное окно)" source="custom" desc="Окно ввода разового пароля в стиле 0.x (Интерактивное).">
    <BgSolid>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} className="w-full max-w-[420px] bg-white border border-slate-200 p-2 flex flex-col gap-2 rounded-[32px] shadow-[0_24px_50px_rgba(0,0,0,0.06)] z-10 relative">
       <div className="bg-[#F9FAFB] rounded-[28px] p-8 flex flex-col items-center text-center overflow-hidden">
        <div className="w-16 h-16 bg-white shadow-sm border border-slate-100 rounded-[20px] flex items-center justify-center mb-6 relative z-10 mx-auto">
         <Smartphone className="size-8 text-zinc-900" strokeWidth={1.5} />
        </div>
        <h3 className="text-zinc-900 font-bold text-xl mb-1 relative z-10">Код подтверждения</h3>
        <p className="text-zinc-500 text-[15px] leading-tight relative z-10 font-medium mb-6">Мы отправили код на ваш телефон</p>
        
        <div className="flex gap-2 justify-center mb-6 relative z-10 mx-auto">
         {pin.map((digit, i) => (
          <input 
           key={i}
           ref={el => { pinRefs.current[i] = el; }}
           type="text" 
           inputMode="numeric"
           pattern="[0-9]*"
           maxLength={1} 
           value={digit}
           onChange={(e) => handlePinChange(i, e.target.value)}
           onKeyDown={(e) => handlePinKeyDown(i, e)}
           autoFocus={i === 0} 
           className={`size-16 rounded-[16px] bg-white border transition-all p-0 appearance-none selection:bg-none text-center text-zinc-900 text-2xl font-black shadow-sm outline-none focus:ring-0 ${digit ? "border-zinc-900 opacity-100" : "border-slate-200 opacity-60"} focus:border-zinc-900 focus:opacity-100`}
          />
         ))}
        </div>

        <button type="button" className="text-[14px] text-zinc-400 font-bold hover:text-zinc-900 transition-all relative z-10">
         Запросить новый код
        </button>
       </div>
       <div className="flex gap-2 relative z-10">
        <button className="flex-1 py-4 bg-slate-50 rounded-[24px] text-zinc-600 font-bold hover:bg-slate-100 text-[15px] transition-all hover:text-zinc-900">Отмена</button>
        <button type="button" className={`flex-1 py-4 rounded-[24px] font-bold text-[15px] shadow-sm transition-all ${pin.every(d => d !== '') ? "bg-zinc-900 text-white hover:bg-black" : "bg-zinc-100 text-zinc-400 cursor-not-allowed"}`}>
         Подтвердить
        </button>
       </div>
      </motion.div>
    </BgSolid>
   </ComponentShowcase>

   {/* 0.6 Session Timeout — Сессия истекла */}
   <ComponentShowcase title="Сессия истекла (Модальное окно)" source="custom" desc="Сессия пользователя истекла. Требуется повторная авторизация.">
    <BgSolid>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} className="w-full max-w-[420px] bg-white border border-slate-200 p-2 flex flex-col gap-2 rounded-[32px] shadow-[0_24px_50px_rgba(0,0,0,0.06),0_4px_12px_rgba(0,0,0,0.03)] z-10 relative">
       <div className="bg-[#F9FAFB] rounded-[28px] p-8 flex flex-col items-center text-center overflow-hidden">
        <motion.div className="w-20 h-20 bg-white shadow-sm border border-slate-100 rounded-[24px] flex items-center justify-center mb-5 relative z-10" animate={{ scale: [1, 1.06, 1] }} transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}>
         <TimerOff className="size-8 text-slate-600" strokeWidth={2} />
        </motion.div>
        <h3 className="text-slate-900 font-bold text-xl mb-2 relative z-10">Сессия истекла</h3>
        <p className="text-slate-500 text-[15px] leading-tight relative z-10 font-medium mb-4">Вы были неактивны более 30 минут. Для безопасности аккаунта требуется повторный вход в систему.</p>
        <div className="w-full relative z-10">
         <label className="text-[11px] font-bold text-slate-400 block text-left mb-1.5 pl-1">Введите пароль пользователя</label>
         <div className="relative">
          <input type={showPass06 ? "text" : "password"} placeholder="••••••••" className="w-full bg-white [&:-webkit-autofill]:shadow-[0_0_0_1000px_white_inset] [&:-webkit-autofill]:[-webkit-text-fill-color:inherit] [transition:background-color_9999999s_ease-in-out_0s] border border-slate-200/60 rounded-[18px] px-5 py-4 pr-12 text-[15px] text-zinc-900 placeholder:text-zinc-300 outline-none focus:border-zinc-900 transition-all font-bold shadow-[inset_0_2px_4px_rgba(0,0,0,0.01)]" />
          <button 
          type="button"
          onClick={() => setShowPass06(!showPass06)}
          className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-zinc-600 transition-colors"
          >
           {showPass06 ? <EyeOff className="size-4" strokeWidth={2.5} /> : <Eye className="size-4" strokeWidth={2.5} />}
          </button>
         </div>
        </div>
       </div>
       <div className="flex gap-2 relative z-10">
        <button className="flex-1 py-4 bg-slate-50 rounded-[24px] text-zinc-600 font-bold hover:bg-slate-100 text-[15px] transition-all hover:text-zinc-900">На главную</button>
        <button className="flex-1 py-4 bg-zinc-900 text-white font-bold rounded-[24px] hover:bg-zinc-800 text-[15px] shadow-sm transition-all">Войти снова</button>
       </div>
      </motion.div>
    </BgSolid>
   </ComponentShowcase>

   {/* 0.3 Permission Request — Запрос разрешений */}
   <ComponentShowcase title="Запрос разрешений (Модальное окно)" source="custom" desc="Запрос системного разрешения: push-уведомления, геолокация, камера.">
    <BgSolid>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} className="w-full max-w-[420px] bg-white border border-slate-200 p-2 flex flex-col gap-2 rounded-[32px] shadow-[0_24px_50px_rgba(0,0,0,0.06),0_4px_12px_rgba(0,0,0,0.03)] z-10 relative">
       <div className="bg-[#F9FAFB] rounded-[28px] p-8 flex flex-col items-center text-center overflow-hidden">
        <div className="w-20 h-20 bg-white shadow-sm border border-slate-100 rounded-[24px] flex items-center justify-center mb-5 relative z-10">
         <motion.svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500" animate={{ rotate: [0, -12, 14, -10, 8, -4, 0] }} transition={{ duration: 0.8, repeat: Infinity, repeatDelay: 1, ease: "easeInOut" }} style={{ transformOrigin: "8px 2px" }}>
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
         </motion.svg>
        </div>
        <h3 className="text-slate-900 font-bold text-xl mb-2 relative z-10">Включить уведомления?</h3>
        <p className="text-slate-500 text-[15px] leading-tight relative z-10 font-medium">MerchCRM хочет отправлять вам push-уведомления о новых заказах, статусах доставки и важных событиях.</p>
       </div>
       <div className="flex gap-2 relative z-10">
        <button className="flex-1 py-4 bg-slate-50 rounded-[24px] text-zinc-600 font-bold hover:bg-slate-100 text-[15px] transition-all hover:text-zinc-900">Не сейчас</button>
        <button className="flex-1 py-4 bg-blue-600 text-white font-bold rounded-[24px] hover:bg-blue-700 text-[15px] shadow-sm transition-colors">Разрешить</button>
       </div>
      </motion.div>
    </BgSolid>
   </ComponentShowcase>

   {/* ═══════════════════════════════════════════ */}
   {/* 4. ПРОЦЕССЫ                 */}
   {/* ═══════════════════════════════════════════ */}
   <div className="pt-12 pb-4 border-b border-slate-200">
    <div className="flex items-center gap-3">
     <h2 className="text-2xl font-bold text-slate-900 ">Процессы</h2>
     <span className="text-[11px] font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">Модальное окно</span>
    </div>
    <p className="text-slate-500 font-medium mt-1">Синхронизация данных, экспорт и фоновая обработка.</p>
   </div>

   {/* 6. System Process (Системная загрузка) */}
   <ComponentShowcase title="Процесс системы (Модальное окно)" source="custom" desc="Модалка длительного процесса в стиле 0.x.">
    <BgSolid>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} className="w-full max-w-[420px] bg-white border border-slate-200 p-2 flex flex-col gap-2 rounded-[32px] shadow-[0_24px_50px_rgba(0,0,0,0.06)] z-10 relative">
       <div className="bg-[#F9FAFB] rounded-[28px] p-8 flex flex-col items-center text-center overflow-hidden">
        <div className="relative size-20 mx-auto mb-8 flex items-center justify-center">
         <motion.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} className="absolute inset-0 border-4 border-slate-100 border-t-zinc-900 rounded-full" />
         <div className="size-14 bg-white shadow-sm border border-slate-100 rounded-full flex items-center justify-center relative z-10">
          <CloudLightning className="size-6 text-zinc-900" strokeWidth={1.5} />
         </div>
        </div>

        <h3 className="text-zinc-900 font-bold text-xl mb-1 relative z-10">Синхронизация</h3>
        <p className="text-zinc-500 text-[15px] leading-tight relative z-10 font-medium mb-6">Отправляем данные в облако</p>
        
        <div className="w-full space-y-3">
         <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
          <motion.div initial={{ width: "0%" }} whileInView={{ width: "65%" }} transition={{ duration: 1.5, ease: "easeOut" }} className="h-full bg-zinc-900" />
         </div>
         <p className="text-[13px] text-zinc-500 font-bold tracking-normal">Шаг 2 из 3</p>
        </div>
       </div>
      </motion.div>
    </BgSolid>
   </ComponentShowcase>

   {/* ═══════════════════════════════════════════ */}
   {/* 5. ИНФОРМАЦИЯ                */}
   {/* ═══════════════════════════════════════════ */}
   <div className="pt-12 pb-4 border-b border-slate-200">
    <div className="flex items-center gap-3">
     <h2 className="text-2xl font-bold text-slate-900 ">Информация</h2>
     <span className="text-[11px] font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">Модальное окно</span>
    </div>
    <p className="text-slate-500 font-medium mt-1">Системные обновления, чейнджлоги и лицензионные предупреждения.</p>
   </div>

   {/* 0.5 Update Available — Доступно обновление */}
   <ComponentShowcase title="Доступно обновление (Модальное окно)" source="custom" desc="Доступна новая версия системы. Мягкий запрос на обновление.">
    <BgSolid>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} className="w-full max-w-[420px] bg-white border border-slate-200 p-2 flex flex-col gap-2 rounded-[32px] shadow-[0_24px_50px_rgba(0,0,0,0.06),0_4px_12px_rgba(0,0,0,0.03)] z-10 relative">
       <div className="bg-[#F9FAFB] rounded-[28px] p-8 flex flex-col items-center text-center overflow-hidden">
        <div className="w-20 h-20 bg-white shadow-sm border border-slate-100 rounded-[24px] flex items-center justify-center mb-5 relative z-10">
         <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <motion.g animate={{ y: [0, 2, 0] }} transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}>
           <polyline points="7 10 12 15 17 10" />
           <line x1="12" x2="12" y1="15" y2="3" />
          </motion.g>
         </svg>
        </div>
        <h3 className="text-slate-900 font-bold text-xl mb-2 relative z-10">Обновление v4.3.0</h3>
        <p className="text-slate-500 text-[15px] leading-tight relative z-10 font-medium">Доступна новая версия MerchCRM. Включает улучшения производительности, новые отчёты и исправления безопасности.</p>
        <div className="flex items-center gap-3 mt-3 relative z-10">
         <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">12 MB</span>
         <span className="text-[11px] font-bold text-slate-400">~2 мин</span>
        </div>
       </div>
       <div className="flex gap-2 relative z-10">
        <button className="flex-1 py-4 bg-slate-50 rounded-[24px] text-zinc-600 font-bold hover:bg-slate-100 text-[15px] transition-all hover:text-zinc-900">Напомнить</button>
        <button className="flex-1 py-4 bg-emerald-600 text-white font-bold rounded-[24px] hover:bg-emerald-700 text-[15px] shadow-sm transition-colors">Установить</button>
       </div>
      </motion.div>
    </BgSolid>
   </ComponentShowcase>

   {/* 8. Modern Changelog (Обновленная версия 0.x) */}
   <ComponentShowcase title="Журнал обновлений (Модальное окно)" source="custom" desc="Вертикальный чейнджлог с четкой иерархией в стиле 0.x.">
    <BgSolid>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} className="w-full max-w-[420px] bg-white border border-slate-200 p-2 flex flex-col gap-2 rounded-[32px] shadow-[0_24px_50px_rgba(0,0,0,0.06)] z-10 relative">
       <div className="bg-white rounded-[28px] p-8 flex flex-col overflow-hidden text-left">
        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-200/50">
         <div className="size-12 bg-white shadow-sm border border-slate-100 rounded-[14px] flex items-center justify-center shrink-0">
          <Sparkles className="size-6 text-zinc-900" strokeWidth={1.5} />
         </div>
         <h3 className="text-zinc-900 font-bold text-lg">Changelog v4.2.0</h3>
        </div>
        
        <div className="max-h-[160px] overflow-y-auto scrollbar-none mb-6 space-y-3">
         <p className="text-zinc-500 text-[14px] leading-tight font-medium">Теперь все элементы интерфейса (модалки, кнопки, инпуты) используют новую систему отступов и теней.</p>
         
         <div className="space-y-2">
          <h4 className="text-zinc-900 font-bold text-[15px]">Безопасность API</h4>
          <p className="text-zinc-500 text-[14px] leading-tight font-medium">Токены теперь ротируются каждые 48 часов. Обратите внимание на настройки в панели администратора.</p>
         </div>

         <p className="text-zinc-500 text-[14px] leading-tight font-medium">Мы также улучшили производительность при работе с большими наборами данных и добавили поддержку новых форматов экспорта.</p>
        </div>

        <button className="w-full py-4 rounded-[20px] bg-zinc-900 text-white text-[15px] font-bold shadow-md hover:bg-black transition-all">Принять условия</button>
       </div>
      </motion.div>
    </BgSolid>
   </ComponentShowcase>

   {/* 0.1 Warning — Предупреждение без блокировки */}
   <ComponentShowcase title="Предупреждение: Лицензия (Модальное окно)" source="custom" desc="Мягкое предупреждение без блокировки интерфейса. Срок действия, лимиты, приближающиеся дедлайны.">
    <BgSolid>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} className="w-full max-w-[420px] bg-white border border-slate-200 p-2 flex flex-col gap-2 rounded-[32px] shadow-[0_24px_50px_rgba(0,0,0,0.06),0_4px_12px_rgba(0,0,0,0.03)] z-10 relative">
       <div className="bg-[#F9FAFB] rounded-[28px] p-8 flex flex-col items-center text-center overflow-hidden">
        <div className="w-20 h-20 bg-white shadow-sm border border-slate-100 rounded-[24px] flex items-center justify-center mb-5 relative z-10">
         <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500">
          <path d="M12 9v4" className="opacity-20" />
          <path d="M12 17h.01" className="opacity-20" />
          <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" className="opacity-20" />
          <motion.path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }} />
          <motion.path d="M12 9v4" animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.3 }} />
          <motion.path d="M12 17h.01" animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.3 }} />
         </svg>
        </div>
        <h3 className="text-slate-900 font-bold text-xl mb-2 relative z-10">Лицензия истекает</h3>
        <p className="text-slate-500 text-[15px] leading-tight relative z-10 font-medium">Срок действия вашей лицензии заканчивается через 3 дня. Продлите подписку, чтобы сохранить доступ к системе.</p>
       </div>
       <div className="flex gap-2 relative z-10">
        <button className="flex-1 py-4 bg-slate-50 rounded-[24px] text-zinc-600 font-bold hover:bg-slate-100 text-[15px] transition-all hover:text-zinc-900">Позже</button>
        <button className="flex-1 py-4 bg-amber-500 text-white font-bold rounded-[24px] hover:bg-amber-600 text-[15px] shadow-sm transition-colors">Продлить</button>
       </div>
      </motion.div>
    </BgSolid>
   </ComponentShowcase>

   {/* ═══════════════════════════════════════════ */}
   {/* 6. ТОСТЫ                  */}
   {/* ═══════════════════════════════════════════ */}
   <div className="pt-12 pb-4 border-b border-slate-200">
    <div className="flex items-center gap-3">
     <h2 className="text-2xl font-bold text-slate-900 ">Тосты</h2>
     <span className="text-[11px] font-bold text-blue-400 bg-blue-50 px-2.5 py-1 rounded-full">Уведомление</span>
    </div>
    <p className="text-slate-500 font-medium mt-1">Компактные всплывающие уведомления, не блокирующие интерфейс.</p>
   </div>

   {/* 5. Horizontal Toast (Горизонтальное уведомление) */}
   <ComponentShowcase title="Потеря соединения (Уведомление)" source="custom" desc="Вытянутое компактное уведомление.">
    <BgSolid>
      <motion.div initial={{ y: -20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} className={`${solidStyles} p-3 w-full max-w-[400px] flex-row gap-3 !rounded-[20px] shadow-[0_15px_30px_rgba(0,0,0,0.06)]`}>
       <div className="bg-rose-100/50 p-2.5 rounded-full ring-1 ring-rose-200/50 shrink-0 ml-1">
         <AlertTriangle className="size-5 text-rose-500" strokeWidth={2} />
       </div>
       <div className="flex-1 text-left flex flex-col justify-center">
         <h4 className="text-[13px] font-bold text-slate-900">Потеря соединения</h4>
         <p className="text-[12px] text-slate-500 font-medium mt-0.5">Связь с базой данных разорвана.</p>
       </div>
       <button className="p-2 hover:bg-slate-100 rounded-full transition-colors mr-1 shrink-0">
         <X className="size-4 text-slate-400" strokeWidth={2.5}/>
       </button>
      </motion.div>
    </BgSolid>
   </ComponentShowcase>

   {/* 10. Progress Bar Action (Прогресс обработки) */}
   <ComponentShowcase title="Прогресс выгрузки (Уведомление)" source="custom" desc="Интегрированный прогресс-бар в карточке.">
    <BgSolid>
     <motion.div initial={{ scale: 0.95, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} className="w-full max-w-[380px] bg-white border border-slate-200 p-2 flex flex-col gap-2 rounded-[32px] shadow-[0_24px_50px_rgba(0,0,0,0.06)] z-10 relative">
      <div className="bg-[#fcfdfe] p-8 rounded-[28px] border border-slate-100 flex flex-col items-center text-center">
       <div className="text-center w-full">
        <h3 className="text-lg font-bold text-slate-900 leading-tight ">Экспорт отчета</h3>
        <p className="text-sm text-slate-500 font-medium leading-tight mt-1">Генерация PDF файла...</p>
       </div>

       {/* Progress Bar Container */}
       <div className="w-full mt-8 mb-2">
        <div className="flex items-center justify-between mb-2.5 px-1">
         <span className="text-[13px] font-bold text-slate-400">Прогресс</span>
         <span className="text-[14px] font-black text-blue-600 bg-blue-50/50 px-2 py-0.5 rounded-full">68%</span>
        </div>
        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
         <motion.div 
          initial={{ width: 0 }}
          whileInView={{ width: '68%' }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="h-full bg-blue-500 rounded-full shadow-[0_0_12px_rgba(59,130,246,0.3)]"
         />
        </div>
       </div>

       {/* Mini Button */}
       <button className="mt-8 px-6 w-full h-12 bg-white border-2 border-slate-100 text-slate-500 rounded-[20px] font-bold text-[14px] hover:bg-slate-50 hover:border-slate-200 transition-all hover:text-slate-900 active:scale-[0.98]">
        Приостановить
       </button>
      </div>
     </motion.div>
    </BgSolid>
   </ComponentShowcase>

   {/* 11. Subscription (Newsletter) */}
   <ComponentShowcase title="Подписка" source="custom" desc="Элегантный виджет для сбора email-подписок.">
     <BentoNewsletterSubscribe />
   </ComponentShowcase>

  </CategoryPage>
 );
}
