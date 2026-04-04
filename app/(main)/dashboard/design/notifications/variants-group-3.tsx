"use client";

import React from "react";
import { 
  AlertCircle, 
  Zap, 
  Cpu,
  Code2,
  Activity,
  Maximize2
} from "lucide-react";
import { motion } from "framer-motion";
import { anim } from "./motion";
import { ModalProps } from "./types";

export const Variant21 = ({ title, message }: ModalProps) => (
  <motion.div variants={anim.container} initial="hidden" animate="show" exit="exit" className="w-[480px] bg-white border border-gray-200 rounded-[30px] p-10 shadow-sm flex flex-col items-center text-center">
    <div className="flex gap-2 mb-8">
      {[...Array(3)].map((_, i) => (
        <motion.div key={i} animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 2, delay: i * 0.3 }} className="w-2.5 h-2.5 bg-red-500 rounded-full" />
      ))}
    </div>
    <motion.h3 variants={anim.item} className="text-gray-900 font-bold text-3xl  mb-4">{title}</motion.h3>
    <motion.p variants={anim.item} className="text-gray-500 text-sm leading-relaxed mb-6 px-4">{message}</motion.p>
    <motion.div variants={anim.item} className="w-full bg-gray-50 border border-gray-100 rounded-[20px] p-4 flex justify-between items-center mb-8">
       <div className="flex flex-col items-start gap-1">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none">Timestamp</span>
          <span className="text-gray-900 font-mono text-xs">2024-04-04 12:45:01</span>
       </div>
       <div className="flex flex-col items-end gap-1">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none">Error_Code</span>
          <span className="text-red-500 font-mono text-xs font-bold underline">SYS_CRITICAL_505</span>
       </div>
    </motion.div>
    <motion.div variants={anim.item} className="flex w-full gap-3">
      <motion.button type="button" whileHover={anim.btnHover} whileTap={anim.btnTap} className="flex-1 bg-white border border-gray-200 text-gray-700 py-4 rounded-[20px] font-bold hover:bg-gray-50 transition-colors shadow-sm">
        На главную
      </motion.button>
      <motion.button type="button" whileHover={anim.btnHover} whileTap={anim.btnTap} className="flex-1 bg-red-600 text-white py-4 rounded-[20px] font-bold hover:bg-red-700 transition-colors shadow-md">
        Patch & Continue
      </motion.button>
    </motion.div>
  </motion.div>
);

export const Variant22 = ({ title, message }: ModalProps) => (
  <motion.div variants={anim.container} initial="hidden" animate="show" exit="exit" drag dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }} className="w-[420px] bg-white border-2 border-red-500 rounded-[32px] p-8 shadow-xl cursor-grab active:cursor-grabbing">
    <div className="flex items-start justify-between mb-8">
       <div className="w-14 h-14 bg-red-500 text-white rounded-2xl flex items-center justify-center shadow-lg transform -rotate-6">
         <AlertCircle className="w-8 h-8" />
       </div>
       <div className="flex gap-1.5 pt-2 pr-2">
         <div className="w-2.5 h-2.5 bg-gray-200 rounded-full" />
         <div className="w-2.5 h-2.5 bg-gray-200 rounded-full" />
         <div className="w-2.5 h-2.5 bg-red-100 rounded-full" />
       </div>
    </div>
    <motion.h3 variants={anim.item} className="text-gray-900 font-black text-2xl  mb-3">{title}</motion.h3>
    <motion.p variants={anim.item} className="text-gray-500 text-sm leading-relaxed mb-10">{message}</motion.p>
    <motion.div variants={anim.item} className="flex w-full gap-3 items-end">
       <motion.button type="button" whileHover={anim.btnHover} whileTap={anim.btnTap} className="flex-1 bg-gray-900 text-white font-bold py-4 rounded-2xl shadow-md transition-colors hover:bg-black">
          Force Resolve
       </motion.button>
       <div className="flex-shrink-0 w-14 h-14 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition-colors cursor-pointer">
          <Maximize2 size={24} />
       </div>
    </motion.div>
  </motion.div>
);

export const Variant23 = ({ title, message }: ModalProps) => (
  <motion.div variants={anim.container} initial="hidden" animate="show" exit="exit" className="w-[440px] bg-white border border-gray-200 rounded-[24px] p-10 shadow-sm flex flex-col items-center">
    <motion.div variants={anim.icon} className="mb-8">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="80"
        height="80"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-red-500"
      >
        <motion.path
          d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, ease: "easeInOut", repeat: Infinity, repeatDelay: 1 }}
        />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    </motion.div>
    <motion.h3 variants={anim.item} className="text-gray-900 font-bold text-2xl mb-4 text-center">{title}</motion.h3>
    <motion.p variants={anim.item} className="text-gray-500 text-[15px] text-center leading-relaxed mb-10">{message}</motion.p>
    <motion.div variants={anim.item} className="w-full">
      <motion.button type="button" whileHover={anim.btnHover} whileTap={anim.btnTap} className="w-full bg-[#1d1d1f] text-white font-bold py-4 rounded-2xl shadow-md transition-colors hover:shadow-lg flex items-center justify-center gap-3">
         Попробовать снова <Activity className="w-5 h-5 text-red-500" />
      </motion.button>
    </motion.div>
  </motion.div>
);

export const Variant24 = ({ title, message }: ModalProps) => (
  <motion.div variants={anim.container} initial="hidden" animate="show" exit="exit" className="w-[410px] bg-white/80 backdrop-blur-xl border border-white/50 rounded-[40px] shadow-sm overflow-hidden flex flex-col gap-2 p-2">
    <motion.div variants={anim.item} className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm">
      <div className="flex gap-4 items-center mb-6">
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center border border-red-200">
           <Zap className="text-red-600 w-6 h-6" />
        </div>
        <div>
          <h3 className="text-gray-900 font-black text-2xl  leading-none">{title}</h3>
          <p className="text-gray-400 text-[10px] mt-1.5 font-bold uppercase tracking-widest">ID: #RE-4402</p>
        </div>
      </div>
      <p className="text-gray-600 text-sm leading-relaxed mb-6 font-medium">{message}</p>
      <div className="pt-6 border-t border-dashed border-gray-200 flex flex-col gap-3">
         <div className="flex justify-between text-[11px] font-bold text-gray-400">
            <span>NETWORK SPEED</span>
            <span className="text-red-500">UNSTABLE</span>
         </div>
         <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
            <motion.div animate={{ width: ["20%", "60%", "30%"] }} transition={{ duration: 3, repeat: Infinity }} className="h-full bg-red-500 rounded-full" />
         </div>
      </div>
    </motion.div>
    <motion.div variants={anim.item} className="bg-red-600 rounded-[32px] p-2 flex gap-2">
       <button type="button" className="flex-1 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-[26px] text-sm transition-colors backdrop-blur-md">
         Later
       </button>
       <button type="button" className="flex-[2] py-4 bg-white text-red-600 font-bold rounded-[26px] text-sm transition-colors shadow-sm hover:scale-[1.02] active:scale-[0.98]">
         Acknowledge
       </button>
    </motion.div>
  </motion.div>
);

export const Variant25 = ({ title, message }: ModalProps) => (
  <motion.div variants={anim.container} initial="hidden" animate="show" exit="exit" className="w-[440px] bg-white border border-gray-200 rounded-[28px] p-10 shadow-sm flex flex-col relative overflow-hidden">
    <div className="absolute top-0 right-0 p-4">
       <motion.div animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }}>
          <Cpu className="text-gray-100" size={140} />
       </motion.div>
    </div>
    <motion.div variants={anim.icon} className="mb-10 p-4 bg-red-50 w-fit rounded-3xl border border-red-100">
       <Activity className="text-red-500 w-8 h-8" />
    </motion.div>
    <motion.h3 variants={anim.item} className="text-gray-900 font-black text-3xl  mb-4 relative z-10">{title}</motion.h3>
    <motion.p variants={anim.item} className="text-gray-500 text-sm leading-relaxed mb-10 relative z-10 max-w-[280px]">{message}</motion.p>
    <motion.div variants={anim.item} className="flex gap-3 relative z-10">
       <motion.button type="button" whileHover={anim.btnHover} whileTap={anim.btnTap} className="bg-gray-100 text-gray-800 font-bold py-4 px-6 rounded-2xl hover:bg-gray-200 transition-colors">
          Log info
       </motion.button>
       <motion.button type="button" whileHover={anim.btnHover} whileTap={anim.btnTap} className="bg-gray-900 text-white font-bold py-4 px-8 rounded-2xl flex-1 hover:bg-black transition-all shadow-md">
          Retry Sync
       </motion.button>
    </motion.div>
  </motion.div>
);

export const Variant26 = ({ title, message }: ModalProps) => (
  <motion.div variants={anim.container} initial="hidden" animate="show" exit="exit" className="w-[430px] bg-[#1d1d1f] p-1 rounded-[32px] shadow-2xl relative overflow-hidden">
    <div className="absolute top-0 inset-x-0 h-8 flex items-center overflow-hidden pointer-events-none opacity-40">
       <motion.div animate={{ x: [-200, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "linear" }} className="flex gap-4 whitespace-nowrap">
         {[...Array(10)].map((_, i) => (
           <span key={i} className="text-[10px] font-black text-red-500">WARNING CAUTION DANGER ALERT</span>
         ))}
       </motion.div>
    </div>
    <div className="bg-white rounded-[28px] mt-8 p-8 flex flex-col">
       <motion.div variants={anim.item} className="flex items-center gap-4 mb-8">
         <div className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center shrink-0">
           <Zap size={24} className="text-red-500" />
         </div>
         <h3 className="text-gray-900 font-bold text-2xl tracking-tighter">{title}</h3>
       </motion.div>
       <motion.p variants={anim.item} className="text-gray-500 text-[15px] leading-relaxed mb-10 font-medium">{message}</motion.p>
       <motion.div variants={anim.item} className="flex gap-3">
          <button type="button" className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold py-4 rounded-2xl transition-colors">Abort</button>
          <button type="button" className="flex-[2] bg-red-600 hover:bg-red-700 text-white font-black py-4 rounded-2xl transition-all shadow-lg border-b-4 border-b-red-800 active:border-b-0 active:translate-y-1">REBOOT SYSTEM</button>
       </motion.div>
    </div>
  </motion.div>
);

export const Variant27 = ({ title, message }: ModalProps) => (
  <motion.div variants={anim.container} initial="hidden" animate="show" exit="exit" className="w-[460px] bg-gray-900 border border-gray-800 rounded-[24px] p-6 shadow-2xl relative overflow-hidden">
    <motion.div variants={anim.item} className="bg-black/60 rounded-[14px] p-5 border border-white/5 mb-6 relative overflow-hidden">
      <motion.div animate={{ opacity: [0.1, 0.3, 0.1] }} transition={{ repeat: Infinity, duration: 3 }} className="absolute inset-0 bg-red-500/20" />
      <Code2 className="w-5 h-5 text-red-400 shrink-0 mt-0.5 relative z-10" />
      <div className="relative z-10 ml-2">
        <h4 className="text-red-400 font-mono text-[11px] mb-1">EXCEPTION_CAUGHT</h4>
        <p className="font-mono text-[12px] text-gray-300 leading-snug break-all">{message}</p>
      </div>
    </motion.div>
    <motion.h3 variants={anim.item} className="text-white font-bold text-xl mb-4 px-2">{title}</motion.h3>
    <motion.div variants={anim.item} className="grid grid-cols-2 gap-2">
      <button type="button" className="bg-white/5 hover:bg-white/10 text-white font-semibold py-3 rounded-xl border border-white/10 flex items-center justify-center gap-2 transition-colors">
         Trace
      </button>
      <button type="button" className="bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold py-3 rounded-xl border border-red-500/20 flex items-center justify-center gap-2 transition-colors">
         Reload
      </button>
    </motion.div>
  </motion.div>
);

export const Variant28 = ({ title, message }: ModalProps) => (
  <motion.div variants={anim.container} initial="hidden" animate="show" exit="exit" className="w-[460px] bg-white border border-gray-200 rounded-[32px] p-8 shadow-sm flex items-start gap-3">
    <motion.div variants={anim.icon} className="relative shrink-0">
      <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
         <motion.div animate={{ height: ["0%", "100%", "0%"] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }} className="w-1 absolute bottom-0 bg-red-500 rounded-full" />
      </div>
      <Zap className="absolute inset-0 m-auto text-red-500 w-6 h-6" />
    </motion.div>
    <div className="flex-1">
      <motion.h3 variants={anim.item} className="text-gray-900 font-bold text-xl mb-2">{title}</motion.h3>
      <motion.p variants={anim.item} className="text-gray-500 text-[14px] leading-relaxed mb-6">{message}</motion.p>
      <motion.div variants={anim.item}>
         <button type="button" className="bg-gray-900 hover:bg-black text-white font-bold py-2.5 px-6 rounded-xl text-sm transition-colors shadow-sm">
           Confirm Action
         </button>
      </motion.div>
    </div>
  </motion.div>
);

export const Variant29 = ({ title, message }: ModalProps) => (
  <motion.div variants={anim.container} initial="hidden" animate="show" exit="exit" className="w-[420px] bg-white border-2 border-gray-900 rounded-[20px] shadow-[8px_8px_0px_rgba(239,68,68,1)] flex flex-col items-center p-8 text-center">
    <motion.div variants={anim.icon} className="w-24 h-24 border-4 border-gray-900 rounded-full mb-6 relative overflow-hidden bg-red-100">
       <motion.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} className="w-full h-full border-[12px] border-dashed border-red-500 rounded-full inset-0 absolute" />
       <AlertCircle className="w-8 h-8 text-gray-900 absolute inset-0 m-auto" />
    </motion.div>
    <motion.h3 variants={anim.item} className="text-gray-900 font-black text-2xl  mb-4">{title}</motion.h3>
    <motion.p variants={anim.item} className="text-gray-600 text-sm font-medium leading-relaxed mb-8">{message}</motion.p>
    <motion.button variants={anim.item} whileHover={anim.btnHover} whileTap={anim.btnTap} className="w-full bg-gray-900 hover:bg-gray-800 text-white font-black py-4 rounded-xl shadow-sm transition-colors border border-gray-900">
      Initiate sequence
    </motion.button>
  </motion.div>
);

export const Variant30 = ({ title, message }: ModalProps) => (
  <motion.div variants={anim.container} initial="hidden" animate="show" exit="exit" className="w-[440px] bg-white border border-gray-200 rounded-[24px] shadow-sm flex flex-col overflow-hidden">
    <motion.div variants={anim.item} className="p-8 pb-6">
      <div className="flex justify-center gap-1 mb-6 h-8">
        {[...Array(5)].map((_, i) => (
          <motion.div 
            key={i} 
            animate={{ height: ["20%", "100%", "20%"] }} 
            transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.1 }}
            className="w-1.5 bg-red-500 rounded-full" 
          />
        ))}
      </div>
      <h3 className="text-gray-900 font-bold text-center text-xl mb-3">{title}</h3>
      <p className="text-gray-500 text-[14px] text-center leading-relaxed mb-6">{message}</p>
    </motion.div>
    <motion.div variants={anim.item} className="bg-gray-50 border-t border-gray-200 p-3 grid grid-cols-2 gap-2">
      <button type="button" className="py-3 bg-white border border-gray-200 text-gray-700 font-medium rounded-[12px] text-sm hover:bg-gray-50 flex items-center justify-center gap-2 group">
         <span className="font-mono text-[11px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded shadow-sm border border-gray-200 group-hover:bg-white transition-colors">ESC</span> Back
      </button>
      <button type="button" className="py-3 bg-red-600 border border-red-700 text-white font-medium rounded-[12px] text-sm hover:bg-red-700 shadow-sm flex items-center justify-center gap-2">
         Retry <span className="font-mono text-[11px] text-red-200 bg-red-800/40 px-1.5 py-0.5 rounded shadow-sm border border-red-700">ENTER</span>
      </button>
    </motion.div>
  </motion.div>
);
