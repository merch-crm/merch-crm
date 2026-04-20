"use client";

import React from 'react';
import { CategoryPage, ComponentShowcase } from "@/components/ui-kit";
import { 
 Table as TableUI, 
 TableBody, 
 TableCell, 
 TableHead, 
 TableHeader, 
 TableRow 
 } from "@/components/ui/table";
import { 
 MoreVertical 
 } from 'lucide-react';
import {
 flexRender,
 getCoreRowModel,
 getSortedRowModel,
 useReactTable,
 type ColumnDef,
 type SortingState,
} from '@tanstack/react-table';

import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { FileFormatIcon } from '@/components/ui/file-format-icon';
import { motion, AnimatePresence } from 'framer-motion';



type Data = {
 id: string;
 member: {
  name: string;
  email: string;
  image: string;
 };
 title: {
  name: string;
  date: string;
 };
 project: {
  name: string;
  description: string;
 };
 status: 'active' | 'inactive';
};

const data: Data[] = [
 {
  id: '326860c3',
  member: {
   name: 'Дмитрий Соколов',
   email: 'dmitry@merchcrm.com',
   image: '/images/avatar/illustration/james.png',
  },
  title: {
   name: 'Маркетинг-менеджер',
   date: 'С августа 2021',
  },
  project: {
   name: 'Monday.com',
   description: 'Брейншторм стратегии кампании',
  },
  status: 'active',
 },
 {
  id: 'bf409fe0',
  member: {
   name: 'Алексей Иванов',
   email: 'alexey@merchcrm.com',
   image: '/images/avatar/illustration/liam.png',
  },
  title: {
   name: 'Продукт-дизайнер',
   date: 'С января 2022',
  },
  project: {
   name: 'Tuesday.com',
   description: 'Документация дизайн-системы',
  },
  status: 'inactive',
 },
 {
  id: 'a1b2c3d4',
  member: {
   name: 'Елена Кузнецова',
   email: 'elena@merchcrm.com',
   image: '/images/avatar/illustration/sarah.png',
  },
  title: {
   name: 'DevOps-инженер',
   date: 'С марта 2020',
  },
  project: {
   name: 'Wednesday.com',
   description: 'Обновление облачной инфраструктуры',
  },
  status: 'active',
 },
];

export default function TablesPage() {
 return (
  <CategoryPage 
   title="Таблицы и Списки" 
   description="Основные элементы организации данных в стиле Midnight: строгие сетки, интерактивные состояния и глубокий контраст." 
  >
   <div className="grid grid-cols-1 gap-3 mb-20">
    
    <ComponentShowcase title="Премиальная интерактивная таблица" source="custom">
      <div className="w-full bg-white rounded-[32px] border border-slate-200 shadow-2xl overflow-hidden">
       <AdvancedTableDemo />
      </div>
    </ComponentShowcase>
   </div>

  </CategoryPage>
 );
}
function AdvancedTableDemo() {
 const [sorting, setSorting] = React.useState<SortingState>([]);
 const [rowSelection, setRowSelection] = React.useState({});

 const columns = React.useMemo<ColumnDef<Data>[]>(
  () => [
   {
    id: 'select',
    header: ({ table }) => (
     <Checkbox
      checked={table.getIsAllPageRowsSelected()}
      onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
      aria-label='Выбрать все'
     />
    ),
    cell: ({ row }) => (
     <Checkbox
      checked={row.getIsSelected()}
      onCheckedChange={(value) => row.toggleSelected(!!value)}
      aria-label='Выбрать строку'
     />
    ),
    enableSorting: false,
    enableHiding: false,
   },
   {
    accessorKey: 'member',
    header: () => <span className="font-black text-[11px] text-slate-400">Участник</span>,
    cell: ({ row }) => {
     const { name, email, image } = row.original.member;

     return (
      <div className='flex items-center gap-3'>
       <Avatar size='sm'>
        <AvatarImage src={image} alt={name} />
        <AvatarFallback>{name.charAt(0)}</AvatarFallback>
       </Avatar>
       <div className='flex flex-col'>
        <span className='text-sm font-black text-slate-900'>{name}</span>
        <span className='text-xs font-medium text-slate-400'>{email}</span>
       </div>
      </div>
     );
    },
   },
   {
    accessorKey: 'title',
    header: () => <span className="font-black  text-[11px] text-slate-400">Должность</span>,
    cell: ({ row }) => {
     const { name, date } = row.original.title;

     return (
      <div className='flex flex-col'>
       <span className='text-sm font-bold text-slate-900'>{name}</span>
       <span className='text-xs font-medium text-slate-400'>{date}</span>
      </div>
     );
    },
   },
   {
    accessorKey: 'project',
    header: () => <span className="font-black  text-[11px] text-slate-400">Проект</span>,
    cell: ({ row }) => {
     const { name, description } = row.original.project;

     return (
      <div className='flex items-center gap-3'>
       <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50'>
        <FileFormatIcon type='fig' className="size-5" />
       </div>
       <div className='flex flex-col'>
        <span className='text-sm font-bold text-slate-900'>{name}</span>
        <span className='text-xs font-medium text-slate-400'>
         {description}
        </span>
       </div>
      </div>
     );
    },
   },
   {
    accessorKey: 'status',
    header: () => <span className="font-black  text-[11px] text-slate-400">Статус</span>,
    cell: ({ row }) => {
     const status = row.original.status;

     return (
      <div className='flex items-center gap-2'>
       <Badge
        color={status === 'active' ? 'success' : 'neutral'}
        variant="solid"
        className="rounded-full px-3 py-1 font-black text-[11px]"
       >
        {status === 'active' ? 'Активен' : 'Неактивен'}
       </Badge>
      </div>
     );
    },
   },
   {
    id: 'actions',
    cell: () => (
     <div className='flex justify-end'>
       <Button variant='ghost' size='sm' className="rounded-full hover:bg-white shadow-sm ring-1 ring-black/[0.03]">
        <MoreVertical className="w-4 h-4 text-slate-400" />
       </Button>
     </div>
    ),
   },
  ],
  [],
 );

 const table = useReactTable({
  data,
  columns,
  getCoreRowModel: getCoreRowModel(),
  onSortingChange: setSorting,
  getSortedRowModel: getSortedRowModel(),
  onRowSelectionChange: setRowSelection,
  state: {
   sorting,
   rowSelection,
  },
 });

 return (
  <div className='w-full'>
   <TableUI>
    <TableHeader className="bg-slate-50/50">
     {table.getHeaderGroups().map((headerGroup) => (
      <TableRow key={headerGroup.id} className="hover:bg-transparent border-b border-gray-100">
       {headerGroup.headers.map((header) => (
        <TableHead key={header.id} className="h-14 px-6 text-slate-400">
         {header.isPlaceholder
          ? null
          : flexRender(
            header.column.columnDef.header,
            header.getContext(),
           )}
        </TableHead>
       ))}
      </TableRow>
     ))}
    </TableHeader>
    <TableBody>
     <AnimatePresence>
      {table.getRowModel().rows?.length ? (
       table.getRowModel().rows.map((row, index) => (
        <motion.tr
         key={row.id}
         initial={{ opacity: 0, y: 10 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ delay: index * 0.05, type: 'spring', stiffness: 300, damping: 30 }}
         data-state={row.getIsSelected() && 'selected'}
         className="group hover:bg-slate-50/80 transition-colors border-b border-gray-50/50"
        >
         {row.getVisibleCells().map((cell) => (
          <TableCell key={cell.id} className="py-4 px-6">
           {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </TableCell>
         ))}
        </motion.tr>
       ))
      ) : (
       <TableRow>
        <TableCell colSpan={columns.length} className='h-24 text-center font-bold text-slate-400'>
         Нет результатов.
        </TableCell>
       </TableRow>
      )}
     </AnimatePresence>
    </TableBody>
   </TableUI>
  </div>
 );
}

// audit-ok: force-rebuild-trigger-1
