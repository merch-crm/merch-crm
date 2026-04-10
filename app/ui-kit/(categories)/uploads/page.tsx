"use client";

import React from 'react';
import { CategoryPage, ComponentShowcase } from "@/components/ui-kit";
import { FileItem } from "@/components/ui/file-upload/FileItem";
import { ImageUploader } from "@/components/ui/image-uploader";
import { 
 FileText, 
 Upload,
 HardDrive,
 CheckCircle,
 Image as LucideImage,
 Archive,
 ImageIcon,
 Download,
 Eye,
 Search,
 Plus,
 Star,
 Command,
 Filter
} from 'lucide-react';
import { FolderAnimation } from '@/components/library/custom';

export default function UploadsPage() {
 const [demoFiles, setDemoFiles] = React.useState([
  {
   id: "1",
   file: new File([""], "contract_v2.pdf", { type: "application/pdf" }),
   progress: 100,
   status: "success" as const,
  },
  {
   id: "2",
   file: new File([""], "too_large_video.mp4", { type: "video/mp4" }),
   progress: 45,
   status: "error" as const,
   error: "Размер файла превышает 50МБ"
  },
  {
   id: "3",
   file: new File([""], "presentation_final.pptx", { type: "application/vnd.ms-powerpoint" }),
   progress: 65,
   status: "uploading" as const,
  }
 ]);

 const removeFile = (id: string) => {
  setDemoFiles(prev => prev.filter(f => f.id !== id));
 };

 const mockUploadedFile = demoFiles.find(f => f.id === "1");
 const mockErrorFile = demoFiles.find(f => f.id === "2");
 const mockUploadingFile = demoFiles.find(f => f.id === "3");

 return (
  <CategoryPage
   title="Медиа и Загрузки"
   description="Компоненты для работы с медиа-контентом и файлами: от простых инпутов и галерей до продвинутых загрузчиков и интерактивных ассетов."
   count={14}
  >
   <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-3 gap-y-16">

    {/* 1. New Image Uploader */}
    <ComponentShowcase title="Загрузчик изображений" source="custom" desc="Загрузчик изображений с предпросмотром и поддержкой Drag&Drop.">
      <div className="w-full max-w-sm mx-auto">
       <ImageUploaderDemo />
      </div>
    </ComponentShowcase>

    {/* 2. Media Asset Card (From Images) */}
    <ComponentShowcase 
     title="Карточка медиа-актива" 
     source="custom" 
     desc="Информационная карточка медиа-актива с детальной мета-информацией." 
    >
     <div className="max-w-xs w-full bg-white rounded-[3rem] border border-gray-100 p-6 shadow-sm group hover:shadow-2xl transition-all">
       <div className="aspect-[4/3] bg-slate-100 rounded-[2rem] border border-gray-50 flex items-center justify-center group-hover:scale-[1.02] transition-transform overflow-hidden relative">
        <ImageIcon className="size-12 text-gray-300" />
        <div className="absolute top-4 left-4 size-8 bg-white/80 backdrop-blur-md rounded-xl flex items-center justify-center shadow-sm">
          <Star className="size-4 text-amber-500 fill-amber-500" />
        </div>
       </div>
       <div className="mt-6 space-y-3">
        <div>
          <h6 className="text-[11px] font-black text-gray-950 ">Main_Campaign_Hero.webp</h6>
          <p className="text-[11px] font-bold text-gray-400  mt-1">4200 x 2400 · 8.4 MB</p>
        </div>
        <div className="flex gap-2">
          <button className="flex-1 py-3 bg-gray-50 rounded-2xl text-[11px] font-black  text-gray-400 hover:bg-gray-100 hover:text-gray-950 transition-all flex items-center justify-center gap-2"><Eye className="size-3.5" /> Превью</button>
          <button className="size-12 bg-gray-950 text-white rounded-2xl flex items-center justify-center shadow-xl"><Download className="size-5" /></button>
        </div>
       </div>
     </div>
    </ComponentShowcase>

    {/* 3. Media Hotspots (From Images) */}
    <ComponentShowcase 
     title="Интерактивные точки на медиа" 
     source="custom" 
     desc="Изображение с интерактивными точками интереса и всплывающими подсказками." 
    >
     <div className="w-full max-w-lg h-64 bg-slate-100 rounded-2xl border border-gray-200 relative overflow-hidden cursor-crosshair">
       <div className="absolute inset-0 flex items-center justify-center opacity-10"><LucideImage className="size-32" /></div>
       
       {/* Hotspot 1 — Blue */}
       <div className="absolute top-[30%] left-[40%] group/dot">
        <div className="size-6 bg-primary-base border-4 border-white rounded-full shadow-xl cursor-pointer animate-pulse" />
        <div className="absolute left-8 top-1/2 -translate-y-1/2 opacity-0 group-hover/dot:opacity-100 transition-all duration-200 bg-white px-4 py-2.5 rounded-xl shadow-xl border border-gray-100 pointer-events-none whitespace-nowrap z-10">
          <p className="text-[11px] font-black text-gray-950  leading-none">Камера V4</p>
          <p className="text-[11px] font-bold text-emerald-500 mt-1">Онлайн • Активна</p>
        </div>
       </div>

       {/* Hotspot 2 — Rose */}
       <div className="absolute bottom-[20%] right-[30%] group/dot2">
        <div className="size-6 bg-rose-500 border-4 border-white rounded-full shadow-xl cursor-pointer" />
        <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-0 group-hover/dot2:opacity-100 transition-all duration-200 bg-white px-4 py-2.5 rounded-xl shadow-xl border border-gray-100 pointer-events-none whitespace-nowrap z-10">
          <p className="text-[11px] font-black text-gray-950  leading-none">Датчик движения B2</p>
          <p className="text-[11px] font-bold text-rose-500 mt-1">Тревога • Сработал</p>
        </div>
       </div>
     </div>
    </ComponentShowcase>

    {/* 4. Asset Dropzone Area */}
    <ComponentShowcase 
     title="Интерактивная зона загрузки" 
     source="custom" 
     className="lg:col-span-2"
     desc="Продвинутый загрузчик с поддержкой drag-and-drop, очередью файлов и анимациями." 
    >
     <div className="w-full px-10 py-16 bg-white rounded-[40px] border-2 border-dashed border-slate-200/60 shadow-xl shadow-slate-200/20 flex flex-col items-center gap-3 group hover:border-primary-base/40 transition-all duration-500 hover:bg-slate-50/50 relative overflow-hidden">
       <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary-base/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
       
       <div className="relative">
        <div className="absolute inset-0 bg-primary-base/20 blur-2xl rounded-full scale-0 group-hover:scale-150 transition-transform duration-700 opacity-0 group-hover:opacity-30" />
        <div className="size-20 rounded-[28px] bg-white shadow-2xl shadow-slate-200 border border-slate-100 flex items-center justify-center text-slate-300 group-hover:scale-110 group-hover:bg-primary-base group-hover:text-white transition-all duration-700 relative z-10">
          <Upload className="size-8 group-hover:-translate-y-1 transition-transform" />
        </div>
       </div>

       <div className="text-center space-y-2 relative z-10">
        <h5 className="text-xl font-black font-heading text-slate-900 group-hover:text-primary-base transition-colors">Перетащите файлы сюда</h5>
        <p className="text-[11px] font-bold text-slate-400  max-w-[300px] mx-auto leading-relaxed">
          Максимальный размер: 24МБ <br /> 
          <span className="text-slate-300 group-hover:text-slate-400 transition-colors">Поддерживаем: PNG, JPG, FIG, MP4</span>
        </p>
       </div>
       
       <button className="relative z-10 px-10 py-4 bg-slate-900 text-white rounded-2xl text-[11px] font-black tracking-[0.2em] shadow-2xl shadow-slate-900/20 hover:bg-primary-base hover:shadow-primary-base/30 transition-all active:scale-95">
        Выбрать файлы
       </button>
     </div>
    </ComponentShowcase>

    {/* 5. Library Explorer (From Images) */}
    <ComponentShowcase 
     title="Обозреватель медиа-библиотеки" 
     source="custom" 
     className="lg:col-span-2"
     desc="Полноценный интерфейс поиска и фильтрации медиа-библиотеки." 
    >
      <div className="w-full max-w-2xl space-y-3 mx-auto">
       <div className="flex gap-3">
         <div className="flex-1 bg-white border border-gray-100 rounded-2xl px-6 py-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3 text-gray-400">
            <Search className="size-5" />
            <span className="text-sm font-bold font-heading">Поиск медиа-файлов...</span>
          </div>
          <div className="size-8 bg-gray-50 rounded-lg flex items-center justify-center text-gray-900"><Command className="size-4" /></div>
         </div>
         <button className="size-14 bg-gray-950 text-white rounded-2xl flex items-center justify-center shadow-2xl"><Filter className="size-6" /></button>
       </div>
       <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
         {[1,2,3,4,5,6].map(i => (
          <div key={i} className="aspect-square bg-white rounded-3xl shadow-sm border border-gray-100 flex items-center justify-center hover:scale-105 transition-transform cursor-pointer"><Plus className="size-6 text-gray-200" /></div>
         ))}
       </div>
      </div>
    </ComponentShowcase>

    {/* 6. File Item States (Success) */}
    <ComponentShowcase title="Состояние файла (Успех)" source="custom">
     <div className="w-full max-w-sm mx-auto bg-white/50 p-4 rounded-3xl border border-slate-100 shadow-sm">
       {mockUploadedFile ? (
        <FileItem uploadedFile={mockUploadedFile} onRemove={() => removeFile("1")} />
       ) : (
        <div className="h-[72px] flex items-center justify-center text-[11px] font-black text-slate-300 border-2 border-dashed border-slate-100 rounded-2xl">Файл удален</div>
       )}
     </div>
    </ComponentShowcase>

    {/* 7. File Item States (Error) */}
    <ComponentShowcase title="Состояние файла (Ошибка)" source="custom">
     <div className="w-full max-w-sm mx-auto bg-white/50 p-4 rounded-3xl border border-slate-100 shadow-sm">
       {mockErrorFile ? (
        <FileItem uploadedFile={mockErrorFile} onRemove={() => removeFile("2")} />
       ) : (
        <div className="h-[72px] flex items-center justify-center text-[11px] font-black text-slate-300 border-2 border-dashed border-slate-100 rounded-2xl">Файл удален</div>
       )}
     </div>
    </ComponentShowcase>

    {/* 8. File Item States (Uploading) */}
    <ComponentShowcase title="Состояние файла (Процесс)" source="custom">
     <div className="w-full max-w-sm mx-auto bg-white/50 p-4 rounded-3xl border border-slate-100 shadow-sm">
       {mockUploadingFile ? (
        <FileItem uploadedFile={mockUploadingFile} onRemove={() => removeFile("3")} />
       ) : (
        <div className="h-[72px] flex items-center justify-center text-[11px] font-black text-slate-300 border-2 border-dashed border-slate-100 rounded-2xl">Файл удален</div>
       )}
     </div>
    </ComponentShowcase>

    {/* 9. Upload Constraints Detail */}
    <ComponentShowcase title="Инфо о лимитах" source="custom">
     <div className="w-full max-w-[280px] mx-auto p-4 bg-white border border-gray-100 rounded-2xl shadow-sm flex flex-col gap-3">
       <h4 className="text-[11px] font-black text-gray-400 ">Требования к файлам</h4>
       <div className="space-y-2">
        <div className="flex justify-between text-[11px] font-bold">
          <span className="text-gray-500">Макс. размер</span>
          <span className="text-gray-900">10 МБ</span>
        </div>
        <div className="flex justify-between text-[11px] font-bold">
          <span className="text-gray-500">Форматы</span>
          <span className="text-gray-900">PDF, XLS, DOC</span>
        </div>
        <div className="flex justify-between text-[11px] font-bold">
          <span className="text-gray-500">За один раз</span>
          <span className="text-gray-900">До 20 шт</span>
        </div>
       </div>
     </div>
    </ComponentShowcase>

    {/* 10. Cloud Storage Link */}
    <ComponentShowcase title="Облачное хранилище (UI)" source="custom">
      <div className="w-full max-w-sm mx-auto p-5 bg-indigo-600 rounded-[30px] text-white flex items-center gap-3 shadow-xl shadow-indigo-500/20 group cursor-pointer overflow-hidden relative">
       <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
       <div className="size-12 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
         <HardDrive className="animate-pulse" />
       </div>
       <div className="flex-1">
         <h4 className="text-sm font-black">Google Drive</h4>
         <p className="text-[11px] font-bold opacity-70">Подключено: merch-pro-docs</p>
       </div>
       <div className="size-8 rounded-full bg-white/20 flex items-center justify-center">
         <CheckCircle size={14} />
       </div>
      </div>
    </ComponentShowcase>

    {/* 11. File History/Audit UI */}
    <ComponentShowcase title="История загрузок" source="custom">
      <div className="w-full max-w-sm mx-auto flex flex-col gap-2 bg-gray-50 p-4 rounded-2xl">
       {[
        { name: "invoice_88.pdf", date: "Сегодня, 12:44", size: "124 KB", user: "Иван П." },
        { name: "merch_layout.ai", date: "Вчера, 18:20", size: "12.4 MB", user: "Анна С." }
       ].map((f, i) => (
        <div key={i} className="bg-white p-3 rounded-xl flex items-center justify-between border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
           <div className="size-8 rounded-lg bg-slate-100 flex items-center justify-center"><FileText size={14} /></div>
           <div className="flex flex-col">
             <span className="text-[11px] font-bold text-slate-900">{f.name}</span>
             <span className="text-[11px] text-slate-400 font-medium">{f.date} • {f.user}</span>
           </div>
          </div>
          <span className="text-[11px] font-black text-slate-300">{f.size}</span>
        </div>
       ))}
      </div>
    </ComponentShowcase>


    {/* 12. Animated Folders & Archives */}
    <div className="lg:col-span-2 space-y-3 mt-12">
     <div className="flex items-center gap-3">
       <div className="size-10 rounded-xl bg-primary-base/10 text-primary-base flex items-center justify-center">
        <Archive size={24} />
       </div>
       <h2 className="text-2xl font-black text-slate-900 ">Хранение и Архивы</h2>
     </div>
     
     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      <ComponentShowcase 
       title="Ассеты" 
       source="custom"
       desc="Папка для хранения медиа-файлов проекта."
      >
       <div className="flex items-center justify-center py-12">
        <FolderAnimation 
         label="FILES" 
         color="#3b82f6"
         size={1.2}
        />
       </div>
      </ComponentShowcase>
      
      <ComponentShowcase 
       title="Системные папки" 
       source="custom"
       desc="Специфические папки для конфигураций и моделей."
      >
       <div className="flex items-center justify-center py-12">
        <FolderAnimation 
         label="PROMPT" 
         color="#1e293b" 
         size={1.2}
        />
       </div>
      </ComponentShowcase>

      <ComponentShowcase 
       title="Брендинг" 
       source="custom"
       desc="Папка с логотипами и брендбуками."
      >
       <div className="flex items-center justify-center py-12">
        <FolderAnimation 
         label="BRAND" 
         color="#ec4899" 
         size={1.2}
        />
       </div>
      </ComponentShowcase>
     </div>
    </div>

   </div>
  </CategoryPage>
 );
}

function ImageUploaderDemo() {
 return (
  <ImageUploader 
   value={[]} 
   onChange={() => {}} 
  />
 );
}

