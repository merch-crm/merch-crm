'use client';

import * as React from 'react';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ContactListProps extends React.HTMLAttributes<HTMLDivElement> {
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
}

function ContactList({
  searchPlaceholder = 'Поиск контактов...',
  onSearch,
  children,
  className,
  ...rest
}: ContactListProps) {
  const [query, setQuery] = React.useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    onSearch?.(e.target.value);
  };

  return (
    <div className={cn('flex flex-col gap-3', className)} {...rest}>
      <div className="relative group">
        <Search className="absolute left-3.5 top-1/2 size-4.5 -translate-y-1/2 text-text-soft-400 transition-colors group-focus-within:text-primary-base" />
        <input
          type="text"
          value={query}
          onChange={handleChange}
          placeholder={searchPlaceholder}
          className={cn(
            'w-full rounded-element border border-stroke-soft-200 bg-bg-white-0 py-3 pl-10.5 pr-4 text-sm font-medium text-text-strong-950 outline-none placeholder:text-text-soft-400 transition-all duration-200',
            'focus:border-primary-base focus:ring-4 focus:ring-primary-base/10 hover:border-text-soft-400',
          )}
        />
      </div>
      <div className="flex flex-col gap-3">{children}</div>
    </div>
  );
}

export { ContactList };
export type { ContactListProps };
