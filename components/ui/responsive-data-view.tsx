"use client";

import React, { memo } from "react";

interface ResponsiveDataViewProps<T> {
  /** Массив данных для отображения */
  data?: T[];
  /** Функция рендера таблицы для десктопа */
  renderTable: () => React.ReactNode;
  /** Функция рендера карточки для мобильных */
  renderCard: (item: T, index: number) => React.ReactNode;
  /** Функция для получения уникального ключа элемента */
  getItemKey?: (item: T, index: number) => string | number;
  /** CSS-классы для мобильного контейнера (alias for mobileGridClassName) */
  mobileClassName?: string;
  /** Alias for mobileClassName for backward compatibility */
  mobileGridClassName?: string;
  /** CSS-классы для десктопного контейнера */
  desktopClassName?: string;
  /** Компонент для пустого состояния */
  emptyState?: React.ReactNode;
}

function ResponsiveDataViewInner<T>({
  data,
  renderTable,
  renderCard,
  getItemKey,
  mobileClassName,
  mobileGridClassName,
  desktopClassName = "hidden md:block",
  emptyState,
}: ResponsiveDataViewProps<T>) {
  const finalMobileClassName = mobileClassName || mobileGridClassName || "flex flex-col divide-y divide-slate-100 md:hidden";
  // Проверка на пустые данные
  if (!data || !Array.isArray(data)) {
    return emptyState || null;
  }

  if (data.length === 0) {
    return <>{emptyState}</>;
  }

  return (
    <div className="w-full">
      {/* Mobile View */}
      <div className={finalMobileClassName}>
        {data?.map((item, index) => {
          const key = getItemKey ? getItemKey(item, index) : index;
          return (
            <React.Fragment key={key}>
              {renderCard(item, index)}
            </React.Fragment>
          );
        })}
      </div>

      {/* Desktop View */}
      <div className={desktopClassName}>
        {renderTable()}
      </div>
    </div>
  );
}

// Мемоизированная версия с правильной типизацией
export const ResponsiveDataView = memo(ResponsiveDataViewInner) as <T>(
  props: ResponsiveDataViewProps<T>
) => React.ReactElement;
