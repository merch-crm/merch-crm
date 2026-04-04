"use client";

import { motion } from 'framer-motion';
import { MessageSquare, Heart, MoreHorizontal, User } from 'lucide-react';

const posts = [
  { id: 1, user: 'Leo', msg: 'Matrix update v2.1 initial pass complete.', date: '2m' },
  { id: 2, user: 'Ana', msg: 'Asset queue synchronized across nodes.', date: '12m' },
  { id: 3, user: 'Tom', msg: 'Security audit flagged 2 anomalies.', date: '1h' },
];

export function BentoThreeColumnFeed() {
  return (
    <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-12 gap-3 p-4 bg-white rounded-[40px] border border-gray-100 shadow-crm-md">
      {/* Feed Column (Main) */}
      <div className="md:col-span-6 flex flex-col gap-3">
         <div className="p-6 border-b border-gray-50 flex items-center justify-between">
            <h3 className="text-xl font-black text-gray-950 ">Activity Stream</h3>
            <FilterIcon className="size-4 text-gray-300" />
         </div>
         <div className="flex flex-col gap-3 px-2">
            {posts.map((post, i) => (
               <motion.div 
                  key={post.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-6 bg-gray-50 rounded-[32px] border border-gray-100 flex flex-col gap-3 hover:bg-white hover:shadow-lg transition-all group"
               >
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <div className="size-10 rounded-2xl bg-white border border-gray-100 flex items-center justify-center font-black text-gray-950 text-xs">LM</div>
                        <span className="text-sm font-black text-gray-900">{post.user}</span>
                        <span className="text-[11px] font-black text-gray-300  ">• {post.date}</span>
                     </div>
                     <MoreHorizontal className="size-4 text-gray-300 group-hover:text-gray-950" />
                  </div>
                  <p className="text-sm font-bold text-gray-600 leading-relaxed italic">&quot;{post.msg}&quot;</p>
                  <div className="flex items-center gap-3 pt-2 border-t border-gray-100/50">
                     <div className="flex items-center gap-2 text-[11px] font-black text-gray-400 hover:text-emerald-500 cursor-pointer transition-colors"><MessageSquare className="size-3" /> 12</div>
                     <div className="flex items-center gap-2 text-[11px] font-black text-gray-400 hover:text-rose-500 cursor-pointer transition-colors"><Heart className="size-3" /> 84</div>
                  </div>
               </motion.div>
            ))}
         </div>
      </div>

      {/* Media & Stats Column */}
      <div className="md:col-span-6 flex flex-col gap-3 sticky top-4 self-start">
         <div className="grid grid-cols-2 gap-3 h-full">
            <div className="bg-slate-900 rounded-[32px] p-8 text-white flex flex-col justify-between group overflow-hidden">
               <div className="flex flex-col gap-1">
                  <h4 className="text-xl font-black ">Media Hub</h4>
                  <p className="text-white/40 text-[11px] font-black   leading-none">Node Storage</p>
               </div>
               <div className="size-12 rounded-2xl bg-white/10 flex items-center justify-center text-primary-base transition-transform group-hover:rotate-12">
                  <BoxIcon className="size-6" />
               </div>
            </div>
            
            <div className="bg-emerald-500 rounded-[32px] p-8 text-white flex flex-col justify-center items-center gap-3 group">
               <div className="size-16 rounded-[28px] bg-white text-emerald-600 shadow-2xl flex items-center justify-center">
                  <User className="size-8" />
               </div>
               <div className="text-center">
                  <h4 className="font-black text-lg">Elite Tier</h4>
                  <p className="text-white/70 text-[11px] font-black   mt-1">Status Active</p>
               </div>
            </div>

            <div className="col-span-2 bg-indigo-600 rounded-[32px] p-8 text-white flex items-center justify-between group overflow-hidden shadow-2xl shadow-indigo-200">
               <div className="flex flex-col gap-2">
                  <h4 className="text-2xl font-black  ">Global Reach</h4>
                  <p className="text-white/60 text-xs font-bold italic leading-relaxed">System propagation active in 4 continents.</p>
               </div>
               <div className="px-6 py-3 bg-white text-indigo-600 rounded-2xl text-[11px] font-black   transition-transform active:scale-95 group-hover:shadow-[0_0_20px_rgba(255,255,255,0.4)]">Expand Map</div>
            </div>
         </div>
      </div>
    </div>
  );
}

function FilterIcon({ className }: { className: string }) {
   return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
}

function BoxIcon({ className }: { className: string }) {
   return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
}
