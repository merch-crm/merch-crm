"use client";

import React from 'react';
import { CategoryPage, ComponentShowcase } from "@/components/ui-kit";

// Old Imports
import { 
  Send, Paperclip, Smile, Phone, Video, Mic, Users, MessageSquare, Radio
} from 'lucide-react';

// New Bento Imports
import { BentoChatList } from "@/components/library/custom/components/communications/bento-chat-list";
import { BentoMessageBubble } from "@/components/library/custom/components/communications/bento-message-bubble";
import { BentoCallCard } from "@/components/library/custom/components/communications/bento-call-card";
import { BentoEmailComposer } from "@/components/library/custom/components/communications/bento-email-composer";
import { BentoContactChip } from "@/components/library/custom/components/communications/bento-contact-chip";
import { BentoOmniChannel } from "@/components/library/custom/components/communications/bento-omni-channel";
import { BentoVoiceNote } from "@/components/library/custom/components/communications/bento-voice-note";
import { BentoLiveChatbot } from "@/components/library/custom/components/communications/bento-live-chatbot";
import { ChatBubble } from "@/components/library/custom";

export default function CommunicationsPage() {
  return (
    <CategoryPage
      title="Коммуникации и Мессенджер"
      description="10 высокотехнологичных инструментов для чатов, электронной почты и видеозвонков в стиле Lumin-Apple."
      count={10}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-3 gap-y-16">
        
        {/* 1. Messenger Input */}
        <ComponentShowcase 
          title="Премиум-поле мессенджера" 
          source="custom" 
          desc="Многофункциональное поле ввода для мессенджера с поддержкой вложений."
        >
           <div className="w-full max-w-sm mx-auto p-3 bg-white border-2 border-slate-100 rounded-[2rem] flex items-end gap-3 shadow-2xl shadow-slate-200/50">
              <button className="p-3 text-slate-400 hover:text-primary-base transition-colors shrink-0 bg-gray-50 rounded-2xl">
                 <Paperclip size={20} />
              </button>
              <textarea 
                 placeholder="Напишите сообщение..." 
                 className="flex-1 max-h-32 min-h-[46px] bg-transparent border-none outline-none focus:ring-0 text-sm py-3 resize-none font-medium" 
              />
              <div className="flex items-center gap-2 shrink-0 pb-1 pr-1">
                 <button className="p-2 text-gray-400 hover:text-gray-950 transition-colors">
                    <Smile size={20} />
                 </button>
                 <button className="p-3 bg-gray-950 text-white rounded-2xl shadow-xl shadow-gray-950/20 transition-all active:scale-95">
                    <Send size={18} />
                 </button>
              </div>
           </div>
        </ComponentShowcase>

        {/* 2. Video Call Overlay */}
        <ComponentShowcase 
          title="Интерфейс видеоконференции" 
          source="custom" 
          desc="Интерфейс управления текущим видеозвонком." 
        >
           <div className="w-full max-w-sm mx-auto bg-slate-900 rounded-[2.5rem] aspect-video relative overflow-hidden group shadow-2xl border border-white/5">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center opacity-40 blur-sm" />
              <div className="absolute top-4 left-4 z-10 flex items-center gap-2 px-3 py-1.5 bg-black/40 backdrop-blur-md rounded-full border border-white/10">
                 <div className="size-1.5 bg-rose-500 rounded-full animate-pulse" />
                 <span className="text-[11px] font-black text-white  ">04:12:05</span>
              </div>
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 z-10">
                 <button className="size-10 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all"><Mic size={18} /></button>
                 <button className="size-10 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all"><Video size={18} /></button>
                 <button className="size-12 rounded-2.5xl bg-rose-500 text-white shadow-xl shadow-rose-500/30 flex items-center justify-center hover:bg-rose-600 transition-all scale-110"><Phone size={22} className="rotate-[135deg]" /></button>
                 <button className="size-10 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all"><Users size={18} /></button>
              </div>
              <div className="absolute top-4 right-4 z-10 size-12 rounded-2xl border-2 border-white/20 overflow-hidden shadow-2xl">
                 <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center" />
              </div>
           </div>
        </ComponentShowcase>

        {/* 3. Broadcast Banner */}
        <ComponentShowcase 
          title="Системное объявление" 
          source="custom" 
          desc="Акцентный хедер для важных объявлений или прямого эфира." 
        >
           <div className="w-full bg-indigo-600 rounded-[2rem] p-6 shadow-2xl shadow-indigo-500/20 relative overflow-hidden flex items-center justify-between border border-white/10">
              <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-white/10 to-transparent skew-x-[-20deg] translate-x-20" />
              <div className="flex items-center gap-3 relative z-10">
                 <div className="size-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white">
                    <Radio className="size-6" />
                 </div>
                 <div className="space-y-1">
                    <h5 className="text-white text-sm font-black font-heading leading-tight">Прямой эфир: Town Hall</h5>
                    <p className="text-indigo-100 text-[11px] font-bold opacity-80">CEO в 14:00 МСК: итоги квартала.</p>
                 </div>
              </div>
              <button className="relative z-10 px-6 py-2.5 bg-white text-indigo-600 rounded-xl text-[11px] font-black   shadow-xl active:scale-95 transition-all">Подключиться</button>
           </div>
        </ComponentShowcase>

      </div>

      <div className="mt-16 mb-12 w-full border-t border-border pt-16">
        <h2 className="text-4xl font-black font-heading  mb-3">Bento-модули коммуникаций CRM</h2>
        <p className="text-muted-foreground font-medium text-lg max-w-2xl">Высокотехнологичные модули взаимодействия, спроектированных для максимальной скорости работы в CRM-окружении.</p>
      </div>

      <ComponentShowcase 
        title="Омниканальный предпросмотр" 
        source="custom" 
        desc="Полная интеграция всех каналов связи в единую высокопроизводительную сетку." 
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 w-full max-w-7xl mx-auto p-8 bg-gray-50/50 rounded-[3.5rem] border border-border shadow-inner py-16 relative overflow-hidden">
          
          <div className="col-span-1 flex flex-col gap-3">
             <BentoContactChip name="Анна Шмидт" role="VP Продаж" company="Альфа Групп" status="online" />
             <BentoChatList 
               chats={[
                 { id: '1', name: 'Иван Петров', message: 'Можете отправить КП?', time: '10:42', unread: 2, online: true },
                 { id: '2', name: 'UI Команда', message: 'Новые макеты готовы.', time: '09:15' },
                 { id: '3', name: 'Мария', message: 'Отлично!', time: 'Вчера', online: false },
               ]} 
             />
          </div>

          <div className="col-span-1 lg:col-span-1 flex flex-col gap-3">
             <div className="flex-1 p-8 bg-white border border-gray-100 rounded-[2.5rem] shadow-sm flex flex-col gap-3 justify-end min-h-[350px]">
                <BentoMessageBubble type="received" message="Видел новый дашборд метрик?" time="10:45" />
                <BentoMessageBubble type="sent" message="Да! Конверсия выросла на 15% 🚀" time="10:48" status="read" />
                <BentoVoiceNote duration="0:24" />
             </div>
          </div>

          <div className="col-span-1 flex items-center justify-center">
             <BentoCallCard name="Михаил Ченко" role="Ключевой клиент" duration="14:25" />
          </div>

          <div className="col-span-1 flex flex-col gap-3 items-center">
             <BentoOmniChannel />
             <div className="mt-auto pointer-events-auto z-50">
               <BentoLiveChatbot />
             </div>
          </div>

          <div className="col-span-1 lg:col-span-3 flex items-start justify-center h-full">
             <BentoEmailComposer />
          </div>

        </div>
      </ComponentShowcase>

      <div className="mt-16 mb-12 w-full border-t border-border pt-16">
        <div className="flex items-center gap-3 mb-3">
           <div className="size-10 rounded-xl bg-primary-base/10 text-primary-base flex items-center justify-center">
              <MessageSquare size={24} />
           </div>
           <h2 className="text-4xl font-black font-heading ">Чат-баблы</h2>
        </div>
        <p className="text-muted-foreground font-medium text-lg max-w-2xl">Классические компоненты для отображения переписки в интерфейсе.</p>
      </div>

      <ComponentShowcase 
        title="Чат-баблы (Классика)" 
        source="custom" 
        desc="Универсальные компоненты для входящих и исходящих сообщений."
      >
        <div className="w-full max-w-md mx-auto space-y-3 p-6 bg-white border border-gray-100 rounded-[2.5rem] shadow-sm">
          <ChatBubble variant="incoming" sender="Александр" message="Как продвигается UI Kit?" timestamp="11:30" />
          <ChatBubble variant="outgoing" message="Реализовали 25 компонентов." timestamp="11:32" />
        </div>
      </ComponentShowcase>
    </CategoryPage>
  );
}
