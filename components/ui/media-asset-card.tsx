'use client';

import * as React from 'react';
import Image from 'next/image';
import { ImageIcon, Star, Eye, Download } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MediaAssetCardProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  dimensions?: string;
  size?: string;
  isFavorite?: boolean;
  thumbnailUrl?: string | null;
  onPreview?: () => void;
  onDownload?: () => void;
  onFavoriteToggle?: () => void;
}

const MediaAssetCard = React.forwardRef<HTMLDivElement, MediaAssetCardProps>(
  (
    {
      name,
      dimensions,
      size,
      isFavorite = false,
      thumbnailUrl,
      onPreview,
      onDownload,
      onFavoriteToggle,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          'max-w-xs w-full bg-white rounded-card border border-gray-100 p-6 shadow-sm group hover:shadow-2xl transition-all',
          className
        )}
        {...props}
      >
        <div className="aspect-[4/3] bg-slate-100 rounded-card border border-gray-50 flex items-center justify-center group-hover:scale-[1.02] transition-transform overflow-hidden relative">
          {thumbnailUrl ? (
            <Image src={thumbnailUrl} alt={name} fill className="object-cover" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
          ) : (
            <ImageIcon className="size-12 text-gray-300" />
          )}
          
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onFavoriteToggle?.();
            }}
            className="absolute top-4 left-4 size-8 bg-white/80 backdrop-blur-md rounded-xl flex items-center justify-center shadow-sm hover:bg-white transition-colors"
          >
            <Star className={cn( 'size-4 transition-all duration-300', isFavorite ? 'text-amber-500 fill-amber-500 scale-110' : 'text-gray-300' )} />
          </button>
        </div>
        
        <div className="mt-6 space-y-3">
          <div>
            <h6 className="text-[11px] font-black text-gray-950 truncate" title={name}>
              {name}
            </h6>
            {(dimensions || size) && (
              <p className="text-[11px] font-bold text-gray-400 mt-1">
                {dimensions}{dimensions && size ? ' · ' : ''}{size}
              </p>
            )}
          </div>
          
          <div className="flex gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onPreview?.();
              }}
              className="flex-1 py-3 bg-gray-50 rounded-element text-[11px] font-black text-gray-400 hover:bg-gray-100 hover:text-gray-950 transition-all flex items-center justify-center gap-2"
            >
              <Eye className="size-3.5" /> Превью
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDownload?.();
              }}
              className="size-12 bg-gray-950 text-white rounded-element flex items-center justify-center shadow-xl hover:bg-gray-800 transition-colors active:scale-95"
            >
              <Download className="size-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }
);

MediaAssetCard.displayName = 'MediaAssetCard';

export { MediaAssetCard };
export type { MediaAssetCardProps };
