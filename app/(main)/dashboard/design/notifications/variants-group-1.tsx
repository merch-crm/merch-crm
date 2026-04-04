"use client";

import React from "react";
import { 
  AlertCircle, 
  Home, 
  Zap, 
  RotateCcw
} from "lucide-react";
import { motion } from "framer-motion";
import { anim } from "./motion";
import { ModalProps } from "./types";

export const Variant1 = ({ title, message }: ModalProps) => (
  <motion.div variants={anim.container} initial="hidden" animate="show" exit="exit" className="w-[420px] bg-white border border-gray-200 rounded-[28px] shadow-sm p-8 flex flex-col items-center text-center">
    <motion.div variants={anim.icon} className="w-20 h-20 rounded-full flex items-center justify-center border border-red-100 bg-red-50 mb-6 relative">
      <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.1, 0.3] }} transition={{ repeat: Infinity, duration: 2 }} className="absolute inset-0 bg-red-200 rounded-full" />
      <div className="w-14 h-14 rounded-full bg-red-500 flex items-center justify-center shadow-[0_4px_12px_rgba(239,68,68,0.3)] relative z-10">
        <Zap className="text-white w-6 h-6" />
      </div>
    </motion.div>
    <motion.h3 variants={anim.item} className="text-gray-900 font-bold text-2xl mb-3">{title}</motion.h3>
    <motion.p variants={anim.item} className="text-gray-500 text-sm leading-relaxed mb-8">{message}</motion.p>
    <motion.div variants={anim.item} className="flex w-full gap-3">
      <motion.button whileHover={anim.btnHover} whileTap={anim.btnTap} className="flex-1 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 py-3.5 rounded-[16px] font-medium transition-colors">
        На главную
      </motion.button>
      <motion.button whileHover={anim.btnHover} whileTap={anim.btnTap} className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3.5 rounded-[16px] font-semibold transition-colors shadow-sm">
        Обновить
      </motion.button>
    </motion.div>
  </motion.div>
);

export const Variant2 = ({ title, message }: ModalProps) => (
  <motion.div variants={anim.container} initial="hidden" animate="show" exit="exit" className="w-[420px] bg-white border border-gray-200 rounded-[32px] p-8 flex flex-col items-center text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
    <motion.div variants={anim.icon} className="w-16 h-16 rounded-full bg-red-50 border border-red-100 flex items-center justify-center mb-5">
      <AlertCircle className="text-red-500 w-7 h-7" />
    </motion.div>
    <motion.h3 variants={anim.item} className="text-gray-900 font-bold text-2xl mb-3">{title}</motion.h3>
    <motion.p variants={anim.item} className="text-gray-500 text-sm leading-relaxed mb-8 px-4">{message}</motion.p>
    <motion.div variants={anim.item} className="flex w-full gap-3">
      <motion.button whileHover={anim.btnHover} whileTap={anim.btnTap} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-900 py-3.5 rounded-2xl font-semibold transition-colors">
        На главную
      </motion.button>
      <motion.button whileHover={anim.btnHover} whileTap={anim.btnTap} className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3.5 rounded-2xl font-semibold transition-colors">
        Обновить
      </motion.button>
    </motion.div>
  </motion.div>
);

export const Variant3 = ({ title, message }: ModalProps) => (
  <motion.div variants={anim.container} initial="hidden" animate="show" exit="exit" className="w-[400px] bg-white border border-gray-200 rounded-[24px] p-6 flex flex-col items-center text-center">
    <motion.div variants={anim.icon} className="mb-6 relative">
      <div className="absolute inset-0 bg-red-100 rounded-full scale-150" />
      <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center relative z-10">
        <Zap className="text-white w-5 h-5 mx-auto" />
      </div>
    </motion.div>
    <motion.h3 variants={anim.item} className="text-gray-900 font-semibold text-xl mb-2">{title}</motion.h3>
    <motion.p variants={anim.item} className="text-gray-500 text-[13px] leading-relaxed mb-6">{message}</motion.p>
    <motion.div variants={anim.item} className="grid grid-cols-2 w-full gap-2">
      <motion.button whileHover={anim.btnHover} whileTap={anim.btnTap} className="col-span-1 border border-gray-200 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors">
        На главную
      </motion.button>
      <motion.button whileHover={anim.btnHover} whileTap={anim.btnTap} className="col-span-1 bg-red-600 text-white py-3 rounded-xl font-medium hover:bg-red-700 transition-colors">
        Обновить
      </motion.button>
    </motion.div>
  </motion.div>
);

export const Variant4 = ({ title, message }: ModalProps) => (
  <motion.div variants={anim.container} initial="hidden" animate="show" exit="exit" className="w-[440px] bg-white border border-gray-100 rounded-[40px] shadow-sm p-10 flex flex-col items-center text-center">
    <motion.div variants={anim.icon} className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
      <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }} className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm border border-red-100">
        <AlertCircle className="text-red-500 w-6 h-6" />
      </motion.div>
    </motion.div>
    <motion.h3 variants={anim.item} className="text-gray-900 font-bold text-2xl mb-4">{title}</motion.h3>
    <motion.p variants={anim.item} className="text-gray-500 text-[15px] leading-relaxed mb-8 px-2">{message}</motion.p>
    <motion.div variants={anim.item} className="flex w-full gap-3">
      <motion.button type="button" whileHover={anim.btnHover} whileTap={anim.btnTap} className="flex-1 bg-white border-2 border-gray-100 text-gray-700 py-4 rounded-[20px] font-bold hover:bg-gray-50 transition-colors">
        На главную
      </motion.button>
      <motion.button type="button" whileHover={anim.btnHover} whileTap={anim.btnTap} className="flex-1 bg-red-500 text-white py-4 rounded-[20px] font-bold hover:bg-red-600 shadow-sm transition-colors">
        Обновить
      </motion.button>
    </motion.div>
  </motion.div>
);

export const Variant5 = ({ title, message }: ModalProps) => (
  <motion.div variants={anim.container} initial="hidden" animate="show" exit="exit" className="w-[380px] bg-white rounded-[24px] border border-gray-200 p-8 flex flex-col text-center items-center shadow-[0_2px_10px_rgb(0,0,0,0.02)]">
    <motion.div variants={anim.icon}>
      <AlertCircle className="w-16 h-16 text-red-500 mb-6 stroke-[1.5px]" />
    </motion.div>
    <motion.h3 variants={anim.item} className="text-gray-900 font-bold text-xl mb-3">{title}</motion.h3>
    <motion.p variants={anim.item} className="text-gray-500 text-sm leading-relaxed mb-8">{message}</motion.p>
    <motion.div variants={anim.item} className="flex flex-col w-full gap-2">
      <motion.button type="button" whileHover={anim.btnHover} whileTap={anim.btnTap} className="w-full bg-red-600 text-white py-3.5 rounded-xl font-medium hover:bg-red-700 transition-colors">
        Обновить страницу
      </motion.button>
      <motion.button type="button" whileHover={anim.btnHover} whileTap={anim.btnTap} className="w-full bg-white text-gray-600 py-3.5 rounded-xl font-medium hover:bg-gray-50 transition-colors border border-gray-200">
        Вернуться на главную
      </motion.button>
    </motion.div>
  </motion.div>
);

export const Variant6 = ({ title, message }: ModalProps) => (
  <motion.div variants={anim.container} initial="hidden" animate="show" exit="exit" className="w-[420px] flex flex-col">
    <motion.div variants={anim.item} className="bg-white border border-gray-200 border-b-0 rounded-t-[28px] p-6 flex items-center gap-3 relative z-10">
      <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center border border-red-100">
        <AlertCircle className="text-red-500 w-6 h-6" />
      </div>
      <h3 className="text-gray-900 font-bold text-xl">{title}</h3>
    </motion.div>
    <motion.div variants={anim.item} className="bg-gray-50 border border-gray-200 rounded-b-[28px] p-6 pt-5">
      <p className="text-gray-500 text-sm leading-relaxed mb-6">{message}</p>
      <div className="flex gap-3">
        <motion.button type="button" whileHover={anim.btnHover} whileTap={anim.btnTap} className="flex-1 bg-white border border-gray-200 text-gray-700 py-3 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors">
          <Home size={16} /> На главную
        </motion.button>
        <motion.button type="button" whileHover={anim.btnHover} whileTap={anim.btnTap} className="flex-1 bg-red-600 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-red-700 transition-colors">
          <RotateCcw size={16} /> Обновить
        </motion.button>
      </div>
    </motion.div>
  </motion.div>
);

export const Variant7 = ({ title, message }: ModalProps) => (
  <motion.div variants={anim.container} initial="hidden" animate="show" exit="exit" className="w-[440px] flex flex-col gap-2">
    <motion.div variants={anim.item} className="bg-white border border-gray-200 rounded-[24px] p-6 shadow-sm flex items-center gap-3">
      <motion.div variants={anim.icon} className="w-14 h-14 bg-red-500 rounded-full flex items-center justify-center shadow-sm shrink-0">
        <AlertCircle className="text-white w-6 h-6" />
      </motion.div>
      <h3 className="text-gray-900 font-bold text-2xl">{title}</h3>
    </motion.div>
    <motion.div variants={anim.item} className="bg-white border border-gray-200 rounded-[24px] p-6 shadow-sm">
      <p className="text-gray-500 text-sm leading-relaxed mb-6">{message}</p>
      <div className="flex gap-3">
        <motion.button type="button" whileHover={anim.btnHover} whileTap={anim.btnTap} className="flex-1 bg-gray-100 text-gray-700 py-3.5 rounded-[16px] font-semibold hover:bg-gray-200 transition-colors">
          На главную
        </motion.button>
        <motion.button type="button" whileHover={anim.btnHover} whileTap={anim.btnTap} className="flex-1 bg-red-50 text-red-600 py-3.5 rounded-[16px] font-semibold hover:bg-red-100 transition-colors border border-red-100">
          Обновить
        </motion.button>
      </div>
    </motion.div>
  </motion.div>
);

export const Variant8 = ({ title, message }: ModalProps) => (
  <motion.div variants={anim.container} initial="hidden" animate="show" exit="exit" className="w-[400px] border border-gray-200 rounded-[32px] overflow-hidden bg-white shadow-sm flex flex-col">
    <motion.div variants={anim.item} className="h-24 bg-red-50 border-b border-red-100 flex items-center justify-center">
      <motion.div variants={anim.icon} className="w-16 h-16 bg-white border border-gray-100 rounded-2xl shadow-sm flex items-center justify-center -mb-24">
        <Zap className="text-red-500 w-8 h-8" />
      </motion.div>
    </motion.div>
    <motion.div variants={anim.item} className="pt-16 pb-8 px-8 flex flex-col items-center text-center">
      <h3 className="text-gray-900 font-bold text-xl mb-3">{title}</h3>
      <p className="text-gray-500 text-sm leading-relaxed mb-8">{message}</p>
      <div className="flex w-full gap-3">
        <motion.button type="button" whileHover={anim.btnHover} whileTap={anim.btnTap} className="flex-[0.8] bg-white border border-gray-200 text-gray-700 py-3 rounded-[14px] font-medium hover:bg-gray-50 transition-colors">
          Назад
        </motion.button>
        <motion.button type="button" whileHover={anim.btnHover} whileTap={anim.btnTap} className="flex-[1.2] bg-red-600 text-white py-3 rounded-[14px] font-medium hover:bg-red-700 transition-colors">
          Обновить страницу
        </motion.button>
      </div>
    </motion.div>
  </motion.div>
);

export const Variant9 = ({ title, message }: ModalProps) => (
  <motion.div variants={anim.container} initial="hidden" animate="show" exit="exit" className="w-[420px] bg-white border border-gray-200 rounded-[24px] p-2 flex flex-col shadow-sm">
    <motion.div variants={anim.item} className="bg-gray-50 rounded-[18px] p-6 pb-8 border border-gray-100">
      <div className="flex items-center gap-3 mb-4">
        <motion.div animate={{ rotate: [0, -10, 10, 0] }} transition={{ duration: 0.5, delay: 0.2 }}>
           <AlertCircle className="text-red-500 w-6 h-6" />
        </motion.div>
        <h3 className="text-gray-900 font-bold text-lg">{title}</h3>
      </div>
      <p className="text-gray-600 text-sm leading-relaxed">{message}</p>
    </motion.div>
    <motion.div variants={anim.item} className="flex gap-2 p-2 pt-4">
      <motion.button type="button" whileHover={anim.btnHover} whileTap={anim.btnTap} className="flex-1 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 py-3 rounded-xl font-medium transition-colors">
        На главную
      </motion.button>
      <motion.button type="button" whileHover={anim.btnHover} whileTap={anim.btnTap} className="flex-[1.5] bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-medium transition-colors">
        Попробовать снова
      </motion.button>
    </motion.div>
  </motion.div>
);

export const Variant10 = ({ title, message }: ModalProps) => (
  <motion.div variants={anim.container} initial="hidden" animate="show" exit="exit" className="w-[380px] bg-white border border-gray-200 rounded-[32px] shadow-sm overflow-hidden flex flex-col">
    <motion.div variants={anim.item} className="p-8 flex items-start gap-3 pb-4">
      <motion.div variants={anim.icon} className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center shrink-0">
        <motion.span animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }} transition={{ repeat: Infinity, duration: 1.5 }} className="w-4 h-4 bg-red-500 rounded-full" />
      </motion.div>
      <div>
        <h3 className="text-gray-900 font-bold text-xl mb-2">{title}</h3>
        <p className="text-gray-500 text-sm leading-relaxed">{message}</p>
      </div>
    </motion.div>
    <motion.div variants={anim.item} className="p-4 bg-gray-50/50 border-t border-gray-100 flex gap-2">
      <motion.button type="button" whileHover={anim.btnHover} whileTap={anim.btnTap} className="flex-1 bg-white border border-gray-200 text-gray-700 py-3 rounded-[16px] font-semibold hover:bg-gray-50 transition-colors">
        Отмена
      </motion.button>
      <motion.button type="button" whileHover={anim.btnHover} whileTap={anim.btnTap} className="flex-1 bg-red-600 text-white py-3 rounded-[16px] font-semibold hover:bg-red-700 transition-colors">
        Обновить
      </motion.button>
    </motion.div>
  </motion.div>
);
