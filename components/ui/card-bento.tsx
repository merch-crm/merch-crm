import { type ReactNode, type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

/* ===========================================
   CARD COMPONENT
   ===========================================
   
   Использование:
   
   // Базовая карточка
   <Card>Контент с автоматическим отступом 27px от краёв</Card>
   
   // Карточка с breakout-разделителем
   <Card>
     <CardHeader>Заголовок</CardHeader>
     <div className="card-breakout border-t border-slate-100" />
     <p>Контент</p>
   </Card>
   
   // Карточка без доп. стилей внутри
   <Card>
     <CardBody className="flex gap-4">
       <span>Элемент 1</span>
       <span>Элемент 2</span>
     </CardBody>
   </Card>
*/

type CardVariant = 'default' | 'elevated' | 'ghost';
type CardSize = 'compact' | 'default' | 'spacious';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
    variant?: CardVariant;
    size?: CardSize;
}

/**
 * Внешний контейнер бенто-блока.
 * padding + border + bg + shadow уже включены.
 * Не добавляй дочерним элементам горизонтальные padding — они накопятся.
 */
export function Card({
    children,
    className,
    variant = 'default',
    size = 'default',
    ...props
}: CardProps) {
    return (
        <div
            className={cn(
                'crm-card',
                variant === 'elevated' && 'crm-card--elevated',
                variant === 'ghost' && 'crm-card--ghost',
                size === 'compact' && 'crm-card--compact',
                size === 'spacious' && 'crm-card--spacious',
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}

/* =========================================== */

interface CardBodyProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
}

/**
 * Структурный контейнер внутри Card — без padding и визуальных стилей.
 * Используй для группировки элементов без накопления отступов.
 */
export function CardBody({ children, className, ...props }: CardBodyProps) {
    return (
        <div className={cn('crm-card-body', className)} {...props}>
            {children}
        </div>
    );
}

/* =========================================== */

interface CardSectionProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
}

/**
 * Секция карточки, которая "выходит" за горизонтальные границы padding.
 * Используй для разделителей, цветных фонов, полноширинных элементов.
 * 
 * @example
 * <CardSection className="border-t border-slate-100 py-4">
 *   <p>Этот блок тянется от края до края</p>
 * </CardSection>
 */
export function CardSection({ children, className, ...props }: CardSectionProps) {
    return (
        <div className={cn('card-breakout', className)} {...props}>
            {children}
        </div>
    );
}

/* =========================================== */

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
}

/**
 * Заголовочная область карточки.
 * По умолчанию добавляет нижний отступ.
 */
export function CardHeader({ children, className, ...props }: CardHeaderProps) {
    return (
        <div className={cn('mb-4', className)} {...props}>
            {children}
        </div>
    );
}

/**
 * Нижняя область карточки с разделителем.
 */
export function CardFooter({ children, className, ...props }: CardHeaderProps) {
    return (
        <div className={cn('mt-4 pt-4 border-t border-slate-100', className)} {...props}>
            {children}
        </div>
    );
}

/* =========================================== */

interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
    children: ReactNode;
    as?: 'h1' | 'h2' | 'h3' | 'h4';
}

export function CardTitle({
    children,
    className,
    as: Component = 'h2',
    ...props
}: CardTitleProps) {
    return (
        <Component
            className={cn('text-lg font-semibold text-slate-900', className)}
            {...props}
        >
            {children}
        </Component>
    );
}
