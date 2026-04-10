"use client";

import React from "react";
import { 
 AlertCircle, 
 Home, 
 Zap, 
 RotateCcw,
 ServerCrash,
 ShieldAlert,
 Cpu
} from "lucide-react";
import { motion } from "framer-motion";
import { anim } from "./motion";
import { ModalProps } from "./types";

export const Variant31 = ({ title, message }: ModalProps) => (
 <motion.div variants={anim.container} initial="hidden" animate="show" exit="exit" className="w-[420px] bg-[#F2F4F7] border border-gray-200/60 p-2 rounded-[36px] shadow-sm flex flex-col gap-2">
  <motion.div variants={anim.item} className="bg-white rounded-[28px] p-6 pt-7 border border-gray-100 shadow-sm">
   <div className="flex items-center gap-3 mb-4">
    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center shrink-0">
     <Zap className="w-6 h-6 text-red-600" />
    </div>
    <h3 className="text-gray-900 font-bold text-xl">{title}</h3>
   </div>
   <p className="text-[#475467] text-[15px] leading-[1.6]">{message}</p>
  </motion.div>
  <motion.div variants={anim.item} className="bg-white rounded-[28px] p-3 border border-gray-100 shadow-sm flex gap-2">
   <motion.button type="button" whileHover={anim.btnHover} whileTap={anim.btnTap} className="flex-1 bg-[#F9FAFB] hover:bg-gray-100 text-[#344054] font-bold py-4 rounded-[20px] text-[15px] transition-colors">
    Cancel
   </motion.button>
   <motion.button type="button" whileHover={anim.btnHover} whileTap={anim.btnTap} className="flex-1 bg-[#F04438] hover:bg-red-600 text-white font-bold py-4 rounded-[20px] text-[15px] shadow-sm transition-colors">
    Resolve
   </motion.button>
  </motion.div>
 </motion.div>
);

export const Variant32 = ({ title, message }: ModalProps) => (
 <motion.div variants={anim.container} initial="hidden" animate="show" exit="exit" className="w-[480px] bg-gray-100 border border-gray-200/50 p-2 rounded-[32px] shadow-sm flex gap-2">
  <motion.div variants={anim.item} className="flex-1 bg-white rounded-[24px] p-6 border border-gray-100 shadow-sm flex flex-col justify-center text-center items-center">
   <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mb-4">
     <ServerCrash className="w-7 h-7 text-red-500" />
   </div>
   <h3 className="text-gray-900 font-black text-lg mb-2">{title}</h3>
   <p className="text-gray-500 text-sm">{message}</p>
  </motion.div>
  <div className="flex flex-col gap-2 w-[140px] shrink-0">
   <motion.button 
    type="button"
    variants={anim.item} 
    className="flex-1 bg-white rounded-[24px] border border-gray-100 flex items-center justify-center p-2 shadow-sm cursor-pointer hover:bg-gray-50 transition-colors"
    whileTap={{ scale: 0.95 }}
   >
     <span className="font-bold text-gray-700 text-sm">Dismiss</span>
   </motion.button>
   <motion.button 
    type="button"
    variants={anim.item} 
    className="flex-1 bg-red-600 rounded-[24px] flex flex-col items-center justify-center p-2 shadow-sm cursor-pointer hover:bg-red-700 transition-colors text-white gap-2"
    whileTap={{ scale: 0.95 }}
   >
     <RotateCcw className="w-5 h-5" />
     <span className="font-bold text-sm">Retry</span>
   </motion.button>
  </div>
 </motion.div>
);

export const Variant33 = ({ title, message }: ModalProps) => (
 <motion.div variants={anim.container} initial="hidden" animate="show" exit="exit" className="w-[400px] bg-gray-50 border border-gray-200/50 p-2 flex flex-col gap-2 rounded-[40px] shadow-sm">
  <motion.div variants={anim.item} className="bg-white rounded-full px-6 py-4 border border-gray-100 shadow-sm flex items-center gap-3">
   <AlertCircle className="w-6 h-6 text-red-500" />
   <h3 className="text-gray-900 font-bold text-lg">{title}</h3>
  </motion.div>
  <motion.div variants={anim.item} className="bg-white rounded-[32px] p-6 border border-gray-100 shadow-sm text-center">
   <p className="text-[#475467] text-[15px] leading-relaxed">{message}</p>
  </motion.div>
  <motion.div variants={anim.item} className="bg-white rounded-full p-2 border border-gray-100 shadow-sm flex gap-2">
    <button type="button" className="flex-1 py-3 text-gray-600 font-semibold rounded-full hover:bg-gray-50 text-sm transition-colors">Later</button>
    <button type="button" className="flex-1 py-3 bg-gray-900 text-white font-semibold rounded-full hover:bg-black text-sm transition-colors shadow-sm">Fix Issue</button>
  </motion.div>
 </motion.div>
);

export const Variant34 = ({ title, message }: ModalProps) => (
 <motion.div variants={anim.container} initial="hidden" animate="show" exit="exit" className="w-[440px] bg-[repeating-linear-gradient(-45deg,#f3f4f6,#f3f4f6_8px,#f9fafb_8px,#f9fafb_16px)] border border-gray-200 p-4 rounded-[36px] shadow-sm flex flex-col gap-3">
  <motion.div variants={anim.item} className="bg-white rounded-[24px] p-6 border-b-[4px] border-b-gray-100 shadow-sm">
   <h3 className="text-gray-900 font-black text-2xl mb-2">{title}</h3>
   <p className="text-gray-500 text-[14px] leading-relaxed">{message}</p>
  </motion.div>
  <motion.div variants={anim.item} className="flex gap-3">
   <button type="button" className="w-16 h-16 shrink-0 bg-white border-b-[4px] border-b-gray-100 rounded-[24px] shadow-sm flex items-center justify-center hover:-translate-y-1 hover:border-b-[6px] active:translate-y-1 active:border-b-0 transition-all">
    <Home className="w-6 h-6 text-gray-400" />
   </button>
   <button type="button" className="flex-1 bg-red-600 border-b-[4px] border-b-red-800 text-white font-black text-lg rounded-[24px] shadow-sm hover:-translate-y-1 hover:border-b-[6px] hover:border-b-red-800 active:translate-y-1 active:border-b-0 transition-all">
    Proceed
   </button>
  </motion.div>
 </motion.div>
);

export const Variant35 = ({ title, message }: ModalProps) => (
 <motion.div variants={anim.container} initial="hidden" animate="show" exit="exit" className="w-[420px] bg-white border border-gray-200 p-2 flex flex-col gap-2 rounded-[32px] shadow-lg">
  <motion.div variants={anim.item} className="bg-gray-50 rounded-[28px] p-6 flex flex-col items-center text-center overflow-hidden">
   <div className="w-20 h-20 bg-white shadow-sm border border-gray-100 rounded-[24px] flex items-center justify-center mb-5 relative z-10">
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
     className="text-red-500"
    >
     <polyline points="2 12 6 12 9 3 15 21 18 12 22 12" className="opacity-20" />
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
   <h3 className="text-gray-900 font-bold text-xl mb-2 relative z-10">{title}</h3>
   <p className="text-gray-500 text-[14px] leading-relaxed relative z-10">{message}</p>
  </motion.div>
  <motion.div variants={anim.item} className="flex gap-2 relative z-10">
   <button type="button" className="flex-1 py-4 bg-gray-50 rounded-[24px] text-gray-700 font-semibold hover:bg-gray-100 text-[15px] transition-colors">Назад</button>
   <button type="button" className="flex-1 py-4 bg-[#F04438] text-white font-bold rounded-[24px] hover:bg-red-600 text-[15px] shadow-sm transition-colors">Обновить</button>
  </motion.div>
 </motion.div>
);

export const Variant36 = ({ title, message }: ModalProps) => (
 <motion.div variants={anim.container} initial="hidden" animate="show" exit="exit" className="w-[440px] bg-[#F2F4F7] border border-gray-200 p-1.5 rounded-[40px] shadow-sm flex flex-col gap-1.5">
  <motion.div variants={anim.item} className="bg-white rounded-[34px] px-8 py-5 border border-gray-100 shadow-[0_2px_8px_rgb(0,0,0,0.02)] flex items-center justify-between">
    <h3 className="text-gray-900 font-bold text-lg">{title}</h3>
    <Zap className="w-5 h-5 text-red-500" />
  </motion.div>
  <motion.div variants={anim.item} className="bg-gray-900 rounded-[34px] p-8 shadow-sm">
   <p className="text-gray-300 text-[15px] leading-relaxed font-medium">{message}</p>
  </motion.div>
  <motion.div variants={anim.item} className="bg-white rounded-[34px] p-2 border border-gray-100 shadow-[0_2px_8px_rgb(0,0,0,0.02)]">
   <button type="button" className="w-full bg-[#faeaeb] text-red-600 font-bold py-4 rounded-[28px] text-[15px] hover:bg-[#fbdfe1] transition-colors">
    Acknowledge High Priority
   </button>
  </motion.div>
 </motion.div>
);

export const Variant37 = ({ title, message }: ModalProps) => (
 <motion.div variants={anim.container} initial="hidden" animate="show" exit="exit" className="w-[380px] bg-[#E5E7EB] border border-gray-300 p-3 rounded-[32px] shadow-sm flex flex-col gap-3">
  <motion.div variants={anim.item} className="bg-white rounded-[24px] p-6 shadow-sm">
   <div className="flex gap-3 items-center mb-3">
     <ShieldAlert className="text-red-600 w-6 h-6" />
     <h3 className="text-gray-900 font-black text-xl">{title}</h3>
   </div>
   <p className="text-gray-600 text-sm leading-relaxed">{message}</p>
  </motion.div>
  <motion.div variants={anim.item} className="grid grid-cols-2 gap-3">
   <div className="bg-white rounded-[24px] p-1.5 shadow-sm">
    <button type="button" className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3.5 rounded-[20px] transition-colors text-sm">Cancel</button>
   </div>
   <div className="bg-white rounded-[24px] p-1.5 shadow-sm">
    <button type="button" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 rounded-[20px] transition-colors shadow-sm text-sm">Confirm</button>
   </div>
  </motion.div>
 </motion.div>
);

export const Variant38 = ({ title, message }: ModalProps) => (
 <motion.div variants={anim.container} initial="hidden" animate="show" exit="exit" className="w-[460px] bg-gray-100 border border-gray-200/60 p-2.5 rounded-[40px] shadow-sm">
  <motion.div variants={anim.item} className="bg-white p-2.5 rounded-[34px] shadow-sm border border-gray-100 flex flex-col gap-2.5">
   <div className="bg-gray-50 rounded-[28px] p-6 flex gap-3 items-start border border-gray-200/50">
     <div className="bg-white p-3 rounded-full shadow-sm border border-gray-100 shrink-0">
      <AlertCircle className="w-6 h-6 text-red-500" />
     </div>
     <div className="pt-1">
      <h3 className="text-gray-900 font-bold text-lg mb-1.5">{title}</h3>
      <p className="text-gray-500 text-sm leading-relaxed">{message}</p>
     </div>
   </div>
   <div className="flex gap-2.5">
     <button type="button" className="flex-1 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-[28px] transition-colors">Discard</button>
     <button type="button" className="flex-1 py-4 bg-gray-900 hover:bg-black text-white font-bold rounded-[28px] transition-colors shadow-sm border border-gray-800">Review</button>
   </div>
  </motion.div>
 </motion.div>
);

export const Variant39 = ({ title, message }: ModalProps) => (
 <motion.div variants={anim.container} initial="hidden" animate="show" exit="exit" className="w-[450px] bg-[#f8f9fa] border border-gray-200/80 p-2.5 rounded-[36px] shadow-sm flex flex-col gap-2.5">
  <div className="flex gap-2.5 items-stretch h-[140px]">
    <motion.div variants={anim.item} className="bg-white rounded-[28px] p-6 border border-gray-100 shadow-sm flex-[2]">
    <div className="mb-8">
     <h3 className="text-gray-900 font-extrabold text-2xl mb-2 leading-none">{title}</h3>
     <p className="text-gray-400 font-medium text-xs">Sys_Alert</p>
    </div>
    </motion.div>
    <motion.div variants={anim.item} className="bg-white rounded-[28px] border border-gray-100 shadow-sm flex-1 flex items-center justify-center">
     <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
      <Cpu className="text-red-500 w-8 h-8" />
     </div>
    </motion.div>
  </div>
  <motion.div variants={anim.item} className="bg-white rounded-[28px] p-6 border border-gray-100 shadow-sm relative overflow-hidden">
    <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 rounded-full -translate-y-1/2 translate-x-1/2 border border-gray-100" />
    <p className="text-gray-600 text-[14px] leading-relaxed relative z-10">{message}</p>
  </motion.div>
  <motion.div variants={anim.item} className="flex gap-2.5">
    <button type="button" className="flex-1 py-4 bg-white text-gray-900 border border-gray-200 font-bold rounded-[28px] transition-colors shadow-sm hover:border-gray-300">Decline</button>
    <button type="button" className="flex-[2] py-4 bg-red-600 text-white font-bold rounded-[28px] transition-colors shadow-sm hover:bg-red-700">Approve Correction</button>
  </motion.div>
 </motion.div>
);

export const Variant40 = ({ title, message }: ModalProps) => (
 <motion.div variants={anim.container} initial="hidden" animate="show" exit="exit" className="w-[420px] bg-gray-50 border border-gray-200/50 p-2 rounded-[50px] shadow-sm">
  <motion.div variants={anim.item} className="bg-white rounded-[42px] p-2 flex flex-col gap-2 border border-gray-100 shadow-sm">
   <div className="bg-gray-50/50 rounded-[34px] px-8 py-10 flex flex-col items-center justify-center text-center">
    <ServerCrash className="w-14 h-14 text-red-500 mb-6" />
    <h3 className="text-gray-900 font-bold text-2xl mb-3">{title}</h3>
    <p className="text-gray-500 text-sm leading-relaxed max-w-[280px]">{message}</p>
   </div>
   <div className="p-2 flex flex-col items-center gap-1">
    <button type="button" className="w-full py-4 bg-gray-900 hover:bg-gray-800 text-white font-bold text-[15px] rounded-[30px] transition-colors shadow-sm">
     Acknowledge
    </button>
    <button type="button" className="w-full py-4 text-gray-500 hover:text-gray-900 hover:bg-gray-50 font-bold text-[15px] rounded-[30px] transition-colors">
     View Details
    </button>
   </div>
  </motion.div>
 </motion.div>
);
