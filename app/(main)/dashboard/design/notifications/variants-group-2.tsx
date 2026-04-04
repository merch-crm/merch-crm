"use client";

import React from "react";
import { 
  AlertCircle, 
  Home, 
  Zap, 
  RotateCcw,
  Info,
  Activity
} from "lucide-react";
import { motion } from "framer-motion";
import { anim } from "./motion";
import { ModalProps } from "./types";

export const Variant11 = ({ title, message }: ModalProps) => (
  <motion.div variants={anim.container} initial="hidden" animate="show" exit="exit" className="w-[450px] grid grid-cols-6 gap-3 p-3 bg-white border border-gray-200 rounded-[32px] shadow-sm">
    <motion.div variants={anim.item} className="col-span-2 bg-red-50 rounded-[24px] flex items-center justify-center p-6 border border-red-100">
      <Zap className="text-red-500 w-10 h-10" />
    </motion.div>
    <motion.div variants={anim.item} className="col-span-4 bg-gray-50 rounded-[24px] p-6 flex flex-col justify-center border border-gray-100">
      <h3 className="text-gray-900 font-bold text-xl mb-1">{title}</h3>
      <p className="text-gray-500 text-xs leading-relaxed">{message}</p>
    </motion.div>
    <motion.div variants={anim.item} className="col-span-3">
      <motion.button whileHover={anim.btnHover} whileTap={anim.btnTap} className="w-full bg-white border border-gray-200 text-gray-700 font-semibold py-4 rounded-[24px] hover:bg-gray-50 transition-colors shadow-sm">
        На главную
      </motion.button>
    </motion.div>
    <motion.div variants={anim.item} className="col-span-3">
      <motion.button whileHover={anim.btnHover} whileTap={anim.btnTap} className="w-full bg-red-600 text-white font-semibold py-4 rounded-[24px] hover:bg-red-700 transition-all shadow-md">
        Обновить
      </motion.button>
    </motion.div>
  </motion.div>
);

export const Variant12 = ({ title, message }: ModalProps) => (
  <motion.div variants={anim.container} initial="hidden" animate="show" exit="exit" className="w-[460px] grid grid-cols-12 gap-2 p-2 bg-gray-50 border border-gray-200 rounded-[36px] shadow-sm">
    <motion.div variants={anim.item} className="col-span-12 bg-white rounded-[30px] p-8 border border-gray-100 shadow-sm">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center shrink-0">
          <AlertCircle className="text-red-600 w-6 h-6" />
        </div>
        <h3 className="text-gray-900 font-bold text-2xl tracking-tight">{title}</h3>
      </div>
      <p className="text-gray-500 text-[14px] leading-relaxed mb-1">{message}</p>
    </motion.div>
    <motion.button variants={anim.item} whileHover={anim.btnHover} whileTap={anim.btnTap} className="col-span-4 bg-white rounded-[30px] border border-gray-100 flex items-center justify-center p-4 hover:bg-gray-100 transition-colors shadow-sm">
      <Home className="text-gray-400 w-6 h-6" />
    </motion.button>
    <motion.button variants={anim.item} whileHover={anim.btnHover} whileTap={anim.btnTap} className="col-span-8 bg-red-600 rounded-[30px] text-white font-bold py-5 hover:bg-red-700 transition-all shadow-md flex items-center justify-center gap-3">
      Попробовать снова <RotateCcw size={20} />
    </motion.button>
  </motion.div>
);

export const Variant13 = ({ title, message }: ModalProps) => (
  <motion.div variants={anim.container} initial="hidden" animate="show" exit="exit" className="w-[440px] grid grid-cols-2 gap-2.5 p-2.5 bg-white border border-gray-200 rounded-[40px] shadow-sm">
    <motion.div variants={anim.item} className="col-span-2 bg-[#1d1d1f] rounded-[32px] p-8 relative overflow-hidden group">
      <motion.div animate={{ opacity: [0.1, 0.2, 0.1] }} transition={{ repeat: Infinity, duration: 4 }} className="absolute inset-0 bg-red-500 blur-[40px] pointer-events-none" />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-8">
           <Zap className="text-red-500 w-8 h-8" />
           <span className="text-white/40 text-[10px] font-bold tracking-widest bg-white/5 border border-white/10 px-2.5 py-1 rounded-full">DANGER</span>
        </div>
        <h3 className="text-white font-bold text-2xl mb-2">{title}</h3>
        <p className="text-white/60 text-sm leading-relaxed">{message}</p>
      </div>
    </motion.div>
    <motion.button variants={anim.item} whileHover={anim.btnHover} whileTap={anim.btnTap} className="bg-gray-100 py-4 rounded-[28px] text-gray-900 font-bold hover:bg-gray-200 transition-colors">
      Назад
    </motion.button>
    <motion.button variants={anim.item} whileHover={anim.btnHover} whileTap={anim.btnTap} className="bg-red-600 py-4 rounded-[28px] text-white font-bold hover:bg-red-700 transition-colors shadow-sm">
      Исправить
    </motion.button>
  </motion.div>
);

export const Variant14 = ({ title, message }: ModalProps) => (
  <motion.div variants={anim.container} initial="hidden" animate="show" exit="exit" className="w-[420px] grid grid-cols-4 gap-2 p-2 rounded-[32px]">
    <motion.div variants={anim.item} className="col-span-4 bg-white border border-gray-200 rounded-[24px] p-6 shadow-sm">
       <div className="flex gap-4 mb-4">
         <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center shrink-0">
           <AlertCircle className="text-red-500 w-5 h-5" />
         </div>
         <div>
            <h3 className="text-gray-900 font-bold text-lg mb-1">{title}</h3>
            <p className="text-gray-500 text-xs leading-relaxed font-medium">{message}</p>
         </div>
       </div>
    </motion.div>
    <motion.div variants={anim.item} className="col-span-1 bg-white border border-gray-200 rounded-[24px] flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm cursor-pointer py-4">
       <Home className="text-gray-400 w-5 h-5" />
    </motion.div>
    <motion.div variants={anim.item} className="col-span-3 bg-red-600 rounded-[24px] flex items-center justify-center text-white font-bold text-sm hover:bg-red-700 transition-colors shadow-md cursor-pointer py-4">
       Принять и обновить
    </motion.div>
  </motion.div>
);

export const Variant15 = ({ title, message }: ModalProps) => (
  <motion.div variants={anim.container} initial="hidden" animate="show" exit="exit" className="w-[460px] grid grid-cols-2 gap-2 bg-white/50 backdrop-blur-md border border-gray-200 rounded-[32px] p-2">
    <motion.div variants={anim.item} className="bg-white rounded-[26px] p-6 border border-gray-100 flex flex-col justify-between shadow-sm">
      <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center mb-6">
        <Zap className="text-red-500 w-6 h-6" />
      </div>
      <div>
        <h3 className="text-gray-900 font-bold text-xl mb-2">{title}</h3>
        <p className="text-gray-400 text-[10px] uppercase font-bold tracking-widest">Type: Network Error</p>
      </div>
    </motion.div>
    <motion.div variants={anim.item} className="bg-white rounded-[26px] p-6 border border-gray-100 flex flex-col justify-between shadow-sm">
      <p className="text-gray-500 text-[13px] leading-relaxed mb-6">{message}</p>
      <div className="flex flex-col gap-2">
        <motion.button type="button" whileHover={anim.btnHover} whileTap={anim.btnTap} className="w-full bg-red-600 text-white font-bold py-3 rounded-xl text-xs hover:bg-red-700 transition-colors shadow-sm">
          Обновить
        </motion.button>
        <motion.button type="button" whileHover={anim.btnHover} whileTap={anim.btnTap} className="w-full bg-gray-50 text-gray-600 font-bold py-3 rounded-xl text-xs hover:bg-gray-100 transition-colors">
          Назад
        </motion.button>
      </div>
    </motion.div>
  </motion.div>
);

export const Variant16 = ({ title, message }: ModalProps) => (
  <motion.div variants={anim.container} initial="hidden" animate="show" exit="exit" className="w-[440px] bg-white border border-gray-200 shadow-sm p-8 rounded-[24px]">
    <motion.div variants={anim.item}>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1 h-8 bg-red-500 rounded-full" />
        <h3 className="text-[#1d1d1f] font-bold text-2xl tracking-tight">{title}</h3>
      </div>
    </motion.div>
    <motion.div variants={anim.item}>
      <p className="text-gray-500 text-[15px] leading-relaxed mb-10">{message}</p>
    </motion.div>
    <motion.div variants={anim.item} className="flex gap-4">
      <motion.button type="button" whileHover={anim.btnHover} whileTap={anim.btnTap} className="flex-1 bg-white border border-gray-200 text-gray-700 font-semibold py-4 rounded-2xl hover:bg-gray-50 transition-colors shadow-sm">
        На главную
      </motion.button>
      <motion.button type="button" whileHover={anim.btnHover} whileTap={anim.btnTap} className="flex-[2] bg-gray-900 text-white font-bold py-4 rounded-2xl hover:bg-black transition-colors shadow-md">
        Попробовать снова
      </motion.button>
    </motion.div>
  </motion.div>
);

export const Variant17 = ({ title, message }: ModalProps) => (
  <motion.div variants={anim.container} initial="hidden" animate="show" exit="exit" className="w-[420px] bg-white border border-gray-200 p-8 pt-12 rounded-[40px] relative shadow-sm">
    <motion.div variants={anim.icon} className="absolute -top-10 left-8">
      <div className="w-20 h-20 bg-red-600 rounded-[28px] flex items-center justify-center shadow-xl border-4 border-white transform rotate-3">
        <Zap className="text-white w-10 h-10" />
      </div>
    </motion.div>
    <motion.h3 variants={anim.item} className="text-gray-900 font-black text-3xl  mb-4">{title}</motion.h3>
    <motion.p variants={anim.item} className="text-gray-500 text-sm leading-relaxed mb-8">{message}</motion.p>
    <motion.div variants={anim.item} className="grid grid-cols-2 gap-3">
      <motion.button type="button" whileHover={anim.btnHover} whileTap={anim.btnTap} className="bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold py-4 rounded-2xl transition-colors">
        Dismiss
      </motion.button>
      <motion.button type="button" whileHover={anim.btnHover} whileTap={anim.btnTap} className="bg-red-500 hover:bg-red-600 text-white font-bold py-4 rounded-2xl shadow-md transition-colors">
        Reload
      </motion.button>
    </motion.div>
  </motion.div>
);

export const Variant18 = ({ title, message }: ModalProps) => (
  <motion.div variants={anim.container} initial="hidden" animate="show" exit="exit" className="w-[450px] bg-[#fdfdfd] border border-gray-200 p-6 rounded-[24px] shadow-sm flex flex-col gap-4">
    <div className="flex gap-4">
      <motion.div variants={anim.item} className="flex-1 bg-white border border-gray-100 p-5 rounded-[20px] shadow-sm">
        <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Status_Code</h4>
        <div className="flex items-center gap-2">
           <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
           <span className="text-gray-900 font-bold text-lg">505 ERR</span>
        </div>
      </motion.div>
      <motion.div variants={anim.item} className="flex-[1.5] bg-[#1d1d1f] p-5 rounded-[20px] shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-3">
           <Activity className="text-white/20 w-4 h-4" />
        </div>
        <h4 className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-3">Event_Type</h4>
        <span className="text-white font-bold text-lg">Connection</span>
      </motion.div>
    </div>
    <motion.div variants={anim.item} className="bg-white border border-gray-100 p-6 rounded-[20px] shadow-sm">
       <h3 className="text-gray-900 font-bold text-xl mb-2">{title}</h3>
       <p className="text-gray-500 text-sm leading-relaxed">{message}</p>
    </motion.div>
    <motion.div variants={anim.item}>
      <motion.button type="button" whileHover={anim.btnHover} whileTap={anim.btnTap} className="w-full bg-gray-900 hover:bg-black text-white font-bold py-4 rounded-[20px] transition-all shadow-md">
        Initialize Restart Sequence
      </motion.button>
    </motion.div>
  </motion.div>
);

export const Variant19 = ({ title, message }: ModalProps) => (
  <motion.div variants={anim.container} initial="hidden" animate="show" exit="exit" className="w-[360px] bg-white border border-gray-200 rounded-[48px] p-2 pb-6 flex flex-col items-center text-center shadow-lg">
    <motion.div variants={anim.item} className="w-full h-48 bg-red-50 rounded-[42px] mb-8 relative flex items-center justify-center overflow-hidden">
       <motion.div animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }} transition={{ repeat: Infinity, duration: 3 }} className="text-red-500/20 absolute">
          <Zap size={140} />
       </motion.div>
       <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm border border-red-100 relative z-10">
          <AlertCircle size={32} className="text-red-600" />
       </div>
    </motion.div>
    <motion.h3 variants={anim.item} className="text-gray-900 font-bold text-2xl mb-3 px-6">{title}</motion.h3>
    <motion.p variants={anim.item} className="text-gray-500 text-sm leading-relaxed mb-10 px-8">{message}</motion.p>
    <motion.div variants={anim.item} className="flex flex-col w-full px-6 gap-2">
       <motion.button type="button" whileHover={anim.btnHover} whileTap={anim.btnTap} className="w-full bg-red-600 text-white font-bold py-5 rounded-[28px] hover:bg-red-700 transition-colors shadow-md">
          Обновить
       </motion.button>
       <motion.button type="button" whileHover={anim.btnHover} whileTap={anim.btnTap} className="w-full py-4 text-gray-400 font-bold hover:text-gray-900 transition-colors">
          Dismiss
       </motion.button>
    </motion.div>
  </motion.div>
);

export const Variant20 = ({ title, message }: ModalProps) => (
  <motion.div variants={anim.container} initial="hidden" animate="show" exit="exit" className="w-[450px] bg-gray-100 border border-gray-200 rounded-[32px] overflow-hidden flex flex-col shadow-sm">
    <motion.div variants={anim.item} className="p-10 bg-white border-b border-gray-200 rounded-b-[40px] shadow-sm">
       <div className="flex items-center gap-4 mb-6">
         <Info className="text-red-500 w-6 h-6" />
         <h4 className="text-red-500 font-bold text-[11px] uppercase tracking-widest">Diagnostic Alert</h4>
       </div>
       <h3 className="text-gray-900 font-black text-3xl  mb-4">{title}</h3>
       <p className="text-gray-500 text-sm leading-relaxed font-medium">{message}</p>
    </motion.div>
    <motion.div variants={anim.item} className="p-8 pb-10 flex gap-4">
       <motion.button type="button" whileHover={anim.btnHover} whileTap={anim.btnTap} className="flex-1 bg-white border border-gray-200 text-gray-700 font-bold py-4 rounded-2xl hover:bg-gray-50 transition-colors shadow-sm">
          Ignore
       </motion.button>
       <motion.button type="button" whileHover={anim.btnHover} whileTap={anim.btnTap} className="flex-1 bg-gray-900 text-white font-bold py-4 rounded-2xl hover:bg-black transition-colors shadow-md">
          Resolve
       </motion.button>
    </motion.div>
  </motion.div>
);
