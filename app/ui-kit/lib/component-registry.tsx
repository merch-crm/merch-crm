import { type ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose,
} from '@/components/ui/dialog';
import {
    Tooltip,
    TooltipRich,
    TooltipList,
    TooltipIcon,
} from '@/components/ui/tooltip';
import {
    Accordion,
    AccordionCards,
    AccordionFAQ,
    AccordionSettings,
    AccordionBordered,
    AccordionSteps,
} from '@/components/ui/accordion';

import {
    Plus, Trash2, Download, Settings, Bell,
    Shield, User, HelpCircle, Info, Package,
} from 'lucide-react';

// =========================================
// TYPES
// =========================================

export interface CSSProperty {
    property: string;
    value: string;
}

export interface VariantExample {
    name: string;
    description?: string;
    props: Record<string, unknown>;
    cssProperties: CSSProperty[];
    render: () => ReactNode;
}

export interface ComponentDefinition {
    id: string;
    name: string;
    description: string;
    category: 'primitives' | 'forms' | 'feedback' | 'navigation' | 'layout' | 'data-display';
    importStatement: string;
    filePath: string;
    variants: VariantExample[];
}

// =========================================
// REGISTRY
// =========================================

export const componentRegistry: ComponentDefinition[] = [

    // =========================================
    // LAYOUT — Card
    // =========================================
    {
        id: 'card',
        name: 'Card (crm-card)',
        description: 'Bento-блок — базовый строительный элемент интерфейса. Единственное место, задающее padding контента от края.',
        category: 'layout',
        importStatement: 'className="crm-card"',
        filePath: 'styles/cards.css',
        variants: [
            {
                name: 'Default',
                description: 'Стандартная карточка с padding 27px',
                props: { className: 'crm-card' },
                cssProperties: [
                    { property: 'padding', value: 'var(--radius-padding) — 27px' },
                    { property: 'border-radius', value: 'var(--radius-outer)' },
                    { property: 'background', value: '#ffffff' },
                    { property: 'border', value: '1px solid var(--border)' },
                    { property: 'box-shadow', value: 'var(--crm-shadow-sm)' },
                ],
                render: () => (
                    <div className="crm-card w-48">
                        <h3 className="font-bold text-slate-900 mb-1 text-sm">Заголовок</h3>
                        <p className="text-xs text-slate-500">Содержимое карточки</p>
                    </div>
                ),
            },
            {
                name: '.crm-card-body',
                description: 'Вложенный контейнер без визуальных стилей',
                props: { className: 'crm-card-body' },
                cssProperties: [
                    { property: 'padding', value: '0' },
                    { property: 'background', value: 'transparent' },
                    { property: 'border', value: 'none' },
                ],
                render: () => (
                    <div className="crm-card w-48">
                        <p className="text-xs text-slate-500 mb-2">Внешняя карточка</p>
                        <div className="crm-card-body bg-slate-50 rounded-lg p-3 border border-slate-100">
                            <p className="text-xs text-slate-600">crm-card-body</p>
                        </div>
                    </div>
                ),
            },
            {
                name: '.card-breakout',
                description: 'Выход за горизонтальные границы padding (для разделителей)',
                props: { className: 'card-breakout' },
                cssProperties: [
                    { property: 'margin-left', value: 'calc(-1 * var(--radius-padding))' },
                    { property: 'margin-right', value: 'calc(-1 * var(--radius-padding))' },
                ],
                render: () => (
                    <div className="crm-card w-48">
                        <p className="text-xs font-bold text-slate-700 mb-3">Заголовок</p>
                        <div className="card-breakout border-t border-slate-100" />
                        <p className="text-xs text-slate-500 mt-3">Контент после разделителя</p>
                    </div>
                ),
            },
            {
                name: '.crm-card--elevated',
                description: 'С усиленной тенью, без рамки',
                props: { className: 'crm-card crm-card--elevated' },
                cssProperties: [
                    { property: 'box-shadow', value: 'var(--crm-shadow-lg)' },
                    { property: 'border', value: 'none' },
                ],
                render: () => (
                    <div className="crm-card crm-card--elevated w-48">
                        <h3 className="text-sm font-bold text-slate-900 mb-1">Elevated</h3>
                        <p className="text-xs text-slate-500">С тенью для акцента</p>
                    </div>
                ),
            },
            {
                name: '.crm-card--ghost',
                description: 'Серый фон без рамки',
                props: { className: 'crm-card crm-card--ghost' },
                cssProperties: [
                    { property: 'background', value: 'var(--muted)' },
                    { property: 'border', value: 'none' },
                ],
                render: () => (
                    <div className="crm-card crm-card--ghost w-48">
                        <h3 className="text-sm font-bold text-slate-900 mb-1">Ghost</h3>
                        <p className="text-xs text-slate-500">Для вторичного контента</p>
                    </div>
                ),
            },
            {
                name: '.crm-card--compact',
                description: 'Уменьшенные отступы — 16px',
                props: { className: 'crm-card crm-card--compact' },
                cssProperties: [
                    { property: 'padding', value: '16px' },
                ],
                render: () => (
                    <div className="crm-card crm-card--compact w-48">
                        <h3 className="text-sm font-bold text-slate-900">Compact</h3>
                        <p className="text-xs text-slate-500">Меньше padding</p>
                    </div>
                ),
            },
            {
                name: '.crm-card--spacious',
                description: 'Увеличенные отступы — var(--padding-xl)',
                props: { className: 'crm-card crm-card--spacious' },
                cssProperties: [
                    { property: 'padding', value: 'var(--padding-xl)' },
                ],
                render: () => (
                    <div className="crm-card crm-card--spacious w-48">
                        <h3 className="text-sm font-bold text-slate-900 mb-1">Spacious</h3>
                        <p className="text-xs text-slate-500">Больше воздуха</p>
                    </div>
                ),
            },
        ],
    },

    // =========================================
    // PRIMITIVES — Button
    // =========================================
    {
        id: 'button',
        name: 'Button',
        description: 'Кнопка с множеством вариантов и размеров. Использует class-variance-authority.',
        category: 'primitives',
        importStatement: "import { Button } from '@/components/ui/button'",
        filePath: 'components/ui/button.tsx',
        variants: [
            {
                name: 'variant="default"',
                description: 'Primary — основное действие',
                props: { variant: 'default' },
                cssProperties: [
                    { property: 'background', value: 'var(--primary)' },
                    { property: 'color', value: '#ffffff' },
                    { property: 'height', value: '44px (h-11)' },
                    { property: 'padding', value: '0 24px (px-6)' },
                    { property: 'border-radius', value: 'var(--radius)' },
                    { property: 'font-weight', value: '700' },
                ],
                render: () => <Button variant="default">Primary</Button>,
            },
            {
                name: 'variant="secondary"',
                description: 'Вторичная кнопка',
                props: { variant: 'secondary' },
                cssProperties: [
                    { property: 'background', value: 'var(--secondary)' },
                    { property: 'color', value: 'var(--secondary-foreground)' },
                ],
                render: () => <Button variant="secondary">Secondary</Button>,
            },
            {
                name: 'variant="destructive"',
                description: 'Для удаления / опасных действий',
                props: { variant: 'destructive' },
                cssProperties: [
                    { property: 'background', value: '#ff463c' },
                    { property: 'color', value: '#ffffff' },
                ],
                render: () => <Button variant="destructive">Destructive</Button>,
            },
            {
                name: 'variant="outline"',
                description: 'С рамкой, прозрачный фон',
                props: { variant: 'outline' },
                cssProperties: [
                    { property: 'background', value: 'transparent' },
                    { property: 'border', value: '2px solid var(--input)' },
                ],
                render: () => <Button variant="outline">Outline</Button>,
            },
            {
                name: 'variant="ghost"',
                description: 'Без фона, hover добавляет bg',
                props: { variant: 'ghost' },
                cssProperties: [
                    { property: 'background', value: 'transparent' },
                    { property: 'hover:background', value: 'var(--accent)' },
                ],
                render: () => <Button variant="ghost">Ghost</Button>,
            },
            {
                name: 'variant="link"',
                description: 'Стиль ссылки',
                props: { variant: 'link' },
                cssProperties: [
                    { property: 'color', value: 'var(--primary)' },
                    { property: 'text-decoration', value: 'underline on hover' },
                ],
                render: () => <Button variant="link">Link</Button>,
            },
            {
                name: 'variant="btn-dark"',
                description: 'Тёмно-серый',
                props: { variant: 'btn-dark' },
                cssProperties: [
                    { property: 'background', value: '#1f1f1f' },
                    { property: 'color', value: '#ffffff' },
                ],
                render: () => <Button variant="btn-dark">Dark</Button>,
            },
            {
                name: 'variant="btn-black"',
                description: 'Чёрный',
                props: { variant: 'btn-black' },
                cssProperties: [
                    { property: 'background', value: '#0f172a' },
                    { property: 'color', value: '#ffffff' },
                ],
                render: () => <Button variant="btn-black">Black</Button>,
            },
            {
                name: 'variant="action"',
                description: 'Для иконок в таблицах и списках',
                props: { variant: 'action', size: 'icon' },
                cssProperties: [
                    { property: 'background', value: '#f8fafc (slate-50)' },
                    { property: 'color', value: '#94a3b8 (slate-400)' },
                    { property: 'border', value: '1px solid rgba(226,232,240,0.6)' },
                    { property: 'hover:color', value: 'var(--primary)' },
                ],
                render: () => (
                    <div className="flex gap-2">
                        <Button variant="action" size="icon"><Settings className="w-4 h-4" /></Button>
                        <Button variant="action" size="icon"><Download className="w-4 h-4" /></Button>
                        <Button variant="action" size="icon"><Bell className="w-4 h-4" /></Button>
                    </div>
                ),
            },
            {
                name: 'variant="action-destructive"',
                description: 'Action с hover-эффектом удаления',
                props: { variant: 'action-destructive', size: 'icon' },
                cssProperties: [
                    { property: 'hover:background', value: '#fff1f2 (rose-50)' },
                    { property: 'hover:color', value: '#e11d48 (rose-600)' },
                ],
                render: () => (
                    <Button variant="action-destructive" size="icon">
                        <Trash2 className="w-4 h-4" />
                    </Button>
                ),
            },
            {
                name: 'Sizes',
                description: 'xs / sm / default / lg / icon',
                props: {},
                cssProperties: [
                    { property: 'xs', value: 'h-8 w-8' },
                    { property: 'sm', value: 'h-9 px-3' },
                    { property: 'default', value: 'h-11 px-6' },
                    { property: 'lg', value: 'h-12 px-8' },
                    { property: 'icon', value: 'h-10 w-10' },
                ],
                render: () => (
                    <div className="flex items-center gap-2 flex-wrap">
                        <Button size="xs"><Plus className="w-4 h-4" /></Button>
                        <Button size="sm">Small</Button>
                        <Button size="default">Default</Button>
                        <Button size="lg">Large</Button>
                        <Button size="icon"><Plus className="w-5 h-5" /></Button>
                    </div>
                ),
            },
            {
                name: 'With icon',
                description: 'Кнопка с иконкой слева',
                props: {},
                cssProperties: [],
                render: () => (
                    <div className="flex gap-3 flex-wrap">
                        <Button><Plus className="w-4 h-4 mr-2" />Добавить</Button>
                        <Button variant="destructive"><Trash2 className="w-4 h-4 mr-2" />Удалить</Button>
                    </div>
                ),
            },
            {
                name: 'disabled',
                description: 'Неактивное состояние',
                props: { disabled: true },
                cssProperties: [
                    { property: 'opacity', value: '0.5' },
                    { property: 'pointer-events', value: 'none' },
                ],
                render: () => (
                    <div className="flex gap-3 flex-wrap">
                        <Button disabled>Disabled</Button>
                        <Button variant="outline" disabled>Disabled</Button>
                    </div>
                ),
            },
        ],
    },

    // =========================================
    // PRIMITIVES — Badge
    // =========================================
    {
        id: 'badge',
        name: 'Badge',
        description: 'Метки и статусы. Используется для отображения состояния заказов, категорий и т.д.',
        category: 'primitives',
        importStatement: "import { Badge } from '@/components/ui/badge'",
        filePath: 'components/ui/badge.tsx',
        variants: [
            {
                name: 'variant="default"',
                description: 'Primary',
                props: { variant: 'default' },
                cssProperties: [
                    { property: 'background', value: 'var(--primary)' },
                    { property: 'color', value: '#ffffff' },
                    { property: 'padding', value: '4px 12px' },
                    { property: 'font-size', value: '12px' },
                    { property: 'font-weight', value: '700' },
                ],
                render: () => <Badge variant="default">Default</Badge>,
            },
            {
                name: 'variant="secondary"',
                description: 'Secondary',
                props: { variant: 'secondary' },
                cssProperties: [{ property: 'background', value: 'var(--secondary)' }],
                render: () => <Badge variant="secondary">Secondary</Badge>,
            },
            {
                name: 'variant="destructive"',
                description: 'Destructive',
                props: { variant: 'destructive' },
                cssProperties: [{ property: 'background', value: 'var(--destructive)' }],
                render: () => <Badge variant="destructive">Destructive</Badge>,
            },
            {
                name: 'variant="outline"',
                description: 'Outline',
                props: { variant: 'outline' },
                cssProperties: [{ property: 'background', value: 'transparent' }, { property: 'border', value: '1px solid currentColor' }],
                render: () => <Badge variant="outline">Outline</Badge>,
            },
            {
                name: 'Status Badges',
                description: 'Все цветные статусы',
                props: {},
                cssProperties: [
                    { property: 'success', value: 'green-100 / green-800' },
                    { property: 'warning', value: 'amber-100 / amber-800' },
                    { property: 'info', value: 'blue-100 / blue-800' },
                    { property: 'purple', value: 'purple-100 / purple-800' },
                    { property: 'gray', value: 'gray-100 / gray-800' },
                ],
                render: () => (
                    <div className="flex flex-wrap gap-2">
                        <Badge variant="success">Выполнен</Badge>
                        <Badge variant="warning">В печати</Badge>
                        <Badge variant="info">Подготовка</Badge>
                        <Badge variant="purple">Контроль</Badge>
                        <Badge variant="gray">Упаковка</Badge>
                    </div>
                ),
            },
        ],
    },

    // =========================================
    // FORMS — Input
    // =========================================
    {
        id: 'input',
        name: 'Input',
        description: 'Поле ввода текста с полной поддержкой типов и состояний.',
        category: 'forms',
        importStatement: "import { Input } from '@/components/ui/input'",
        filePath: 'components/ui/input.tsx',
        variants: [
            {
                name: 'Default',
                description: 'Стандартный input',
                props: {},
                cssProperties: [
                    { property: 'height', value: '48px (h-12)' },
                    { property: 'padding', value: '8px 16px' },
                    { property: 'border-radius', value: 'var(--radius) — 12px' },
                    { property: 'font-weight', value: '500 (medium)' },
                ],
                render: () => (
                    <div className="w-56">
                        <Input placeholder="Введите текст..." />
                    </div>
                ),
            },
            {
                name: 'Types',
                description: 'email / password / number',
                props: {},
                cssProperties: [],
                render: () => (
                    <div className="w-56 space-y-2">
                        <Input type="email" placeholder="example@mail.ru" />
                        <Input type="password" placeholder="••••••••" />
                        <Input type="number" placeholder="0" />
                    </div>
                ),
            },
            {
                name: 'disabled',
                description: 'Неактивный',
                props: { disabled: true },
                cssProperties: [
                    { property: 'opacity', value: '0.5' },
                    { property: 'cursor', value: 'not-allowed' },
                ],
                render: () => (
                    <div className="w-56">
                        <Input disabled placeholder="Недоступно" />
                    </div>
                ),
            },
            {
                name: 'Error state',
                description: 'С ошибкой валидации',
                props: {},
                cssProperties: [
                    { property: 'border-color', value: '#ef4444 (red-500)' },
                ],
                render: () => (
                    <div className="w-56 space-y-1">
                        <Input className="border-red-500 focus-visible:ring-red-500" placeholder="Введите email" />
                        <p className="text-xs text-red-600 font-medium">Обязательное поле</p>
                    </div>
                ),
            },
        ],
    },

    // =========================================
    // FORMS — Textarea
    // =========================================
    {
        id: 'textarea',
        name: 'Textarea',
        description: 'Многострочное поле ввода.',
        category: 'forms',
        importStatement: "import { Textarea } from '@/components/ui/textarea'",
        filePath: 'components/ui/textarea.tsx',
        variants: [
            {
                name: 'Default',
                description: 'Стандартный textarea',
                props: {},
                cssProperties: [
                    { property: 'min-height', value: '80px' },
                    { property: 'padding', value: '12px 16px' },
                    { property: 'border-radius', value: '16px (rounded-2xl)' },
                    { property: 'font-weight', value: '700 (bold)' },
                ],
                render: () => (
                    <div className="w-56">
                        <Textarea placeholder="Введите комментарий..." />
                    </div>
                ),
            },
        ],
    },

    // =========================================
    // FORMS — Label
    // =========================================
    {
        id: 'label',
        name: 'Label',
        description: 'Подпись к полю формы. Обычно используется с Input.',
        category: 'forms',
        importStatement: "import { Label } from '@/components/ui/label'",
        filePath: 'components/ui/label.tsx',
        variants: [
            {
                name: 'Default',
                description: 'Стандартный label',
                props: {},
                cssProperties: [
                    { property: 'font-size', value: '14px (text-sm)' },
                    { property: 'font-weight', value: '700 (bold)' },
                    { property: 'color', value: '#334155 (slate-700)' },
                ],
                render: () => (
                    <div className="w-56 space-y-2">
                        <Label>Название заказа</Label>
                        <Input placeholder="..." />
                    </div>
                ),
            },
            {
                name: 'Required',
                description: 'Обязательное поле',
                props: {},
                cssProperties: [],
                render: () => (
                    <div className="w-56 space-y-1.5">
                        <Label className="text-red-600">Email *</Label>
                        <Input type="email" placeholder="example@mail.ru" />
                    </div>
                ),
            },
        ],
    },

    // =========================================
    // FORMS — Switch
    // =========================================
    {
        id: 'switch',
        name: 'Switch',
        description: 'Переключатель вкл/выкл с цветовыми вариантами.',
        category: 'forms',
        importStatement: "import { Switch } from '@/components/ui/switch'",
        filePath: 'components/ui/switch.tsx',
        variants: [
            {
                name: 'Primary variants',
                description: 'Off / On',
                props: {},
                cssProperties: [
                    { property: 'width', value: '44px (w-11)' },
                    { property: 'height', value: '24px (h-6)' },
                    { property: 'checked:background', value: 'var(--primary)' },
                    { property: 'checked:box-shadow', value: '0 0 0 4px rgba(93,0,255,0.25)' },
                ],
                render: () => (
                    <div className="flex gap-6">
                        <div className="flex items-center gap-2">
                            <Switch variant="primary" />
                            <span className="text-sm text-slate-600">Off</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Switch variant="primary" defaultChecked />
                            <span className="text-sm text-slate-600">On</span>
                        </div>
                    </div>
                ),
            },
            {
                name: 'Color variants',
                description: 'primary / success / disabled',
                props: {},
                cssProperties: [
                    { property: 'success checked:bg', value: '#10b981 (emerald-500)' },
                ],
                render: () => (
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <Switch variant="primary" defaultChecked />
                            <span className="text-sm text-slate-700">Primary</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Switch variant="success" defaultChecked />
                            <span className="text-sm text-slate-700">Success</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Switch disabled />
                            <span className="text-sm text-slate-400">Disabled</span>
                        </div>
                    </div>
                ),
            },
        ],
    },

    // =========================================
    // NAVIGATION — Tabs
    // =========================================
    {
        id: 'tabs',
        name: 'Tabs',
        description: 'Вкладки для переключения контента.',
        category: 'navigation',
        importStatement: "import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'",
        filePath: 'components/ui/tabs.tsx',
        variants: [
            {
                name: 'Default',
                description: 'Стандартные табы',
                props: {},
                cssProperties: [
                    { property: 'TabsList height', value: '44px' },
                    { property: 'TabsList background', value: '#f8fafc (slate-50)' },
                    { property: 'TabsTrigger[active] bg', value: '#ffffff' },
                    { property: 'TabsTrigger[active] color', value: 'var(--primary)' },
                    { property: 'TabsTrigger font-weight', value: '700' },
                ],
                render: () => (
                    <div className="w-72">
                        <Tabs defaultValue="tab1">
                            <TabsList>
                                <TabsTrigger value="tab1">Общее</TabsTrigger>
                                <TabsTrigger value="tab2">История</TabsTrigger>
                                <TabsTrigger value="tab3">Файлы</TabsTrigger>
                            </TabsList>
                            <TabsContent value="tab1">
                                <div className="crm-card crm-card--compact mt-3">
                                    <p className="text-sm text-slate-500">Содержимое вкладки</p>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>
                ),
            },
        ],
    },

    // =========================================
    // DATA DISPLAY — Avatar
    // =========================================
    {
        id: 'avatar',
        name: 'Avatar',
        description: 'Аватар пользователя с fallback на инициалы.',
        category: 'data-display',
        importStatement: "import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'",
        filePath: 'components/ui/avatar.tsx',
        variants: [
            {
                name: 'Sizes',
                description: 'sm / default / lg / xl',
                props: {},
                cssProperties: [
                    { property: 'sm', value: 'h-8 w-8' },
                    { property: 'default', value: 'h-10 w-10' },
                    { property: 'lg', value: 'h-12 w-12' },
                    { property: 'xl', value: 'h-16 w-16' },
                ],
                render: () => (
                    <div className="flex items-end gap-3">
                        <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs">SM</AvatarFallback>
                        </Avatar>
                        <Avatar>
                            <AvatarFallback>MD</AvatarFallback>
                        </Avatar>
                        <Avatar className="h-12 w-12">
                            <AvatarFallback>LG</AvatarFallback>
                        </Avatar>
                        <Avatar className="h-16 w-16">
                            <AvatarFallback className="text-lg">XL</AvatarFallback>
                        </Avatar>
                    </div>
                ),
            },
            {
                name: 'With image',
                description: 'С изображением и fallback',
                props: {},
                cssProperties: [],
                render: () => (
                    <Avatar className="h-12 w-12">
                        <AvatarImage src="https://github.com/shadcn.png" alt="User" />
                        <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                ),
            },
            {
                name: 'Colored fallback',
                description: 'Цветные инициалы',
                props: {},
                cssProperties: [
                    { property: 'AvatarFallback bg', value: 'slate-100 / custom colors' },
                ],
                render: () => (
                    <div className="flex gap-2">
                        <Avatar>
                            <AvatarFallback className="bg-primary/10 text-primary">АБ</AvatarFallback>
                        </Avatar>
                        <Avatar>
                            <AvatarFallback className="bg-emerald-100 text-emerald-700">ВГ</AvatarFallback>
                        </Avatar>
                        <Avatar>
                            <AvatarFallback className="bg-amber-100 text-amber-700">ДЕ</AvatarFallback>
                        </Avatar>
                        <Avatar>
                            <AvatarFallback className="bg-rose-100 text-rose-700">ЖЗ</AvatarFallback>
                        </Avatar>
                    </div>
                ),
            },
            {
                name: 'Group',
                description: 'Перекрывающиеся аватары',
                props: {},
                cssProperties: [
                    { property: 'margin', value: '-space-x-2' },
                    { property: 'border', value: '2px solid white' },
                ],
                render: () => (
                    <div className="flex -space-x-2">
                        <Avatar className="border-2 border-white">
                            <AvatarFallback className="bg-primary/10 text-primary text-xs">А</AvatarFallback>
                        </Avatar>
                        <Avatar className="border-2 border-white">
                            <AvatarFallback className="bg-emerald-100 text-emerald-700 text-xs">Б</AvatarFallback>
                        </Avatar>
                        <Avatar className="border-2 border-white">
                            <AvatarFallback className="bg-amber-100 text-amber-700 text-xs">В</AvatarFallback>
                        </Avatar>
                        <Avatar className="border-2 border-white">
                            <AvatarFallback className="bg-slate-100 text-slate-600 text-xs">+5</AvatarFallback>
                        </Avatar>
                    </div>
                ),
            },
        ],
    },

    // =========================================
    // FEEDBACK — Dialog
    // =========================================
    {
        id: 'dialog',
        name: 'Dialog',
        description: 'Модальное окно с оверлеем.',
        category: 'feedback',
        importStatement: "import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog'",
        filePath: 'components/ui/dialog.tsx',
        variants: [
            {
                name: 'Default',
                description: 'Стандартный диалог',
                props: {},
                cssProperties: [
                    { property: 'overlay background', value: 'rgba(0,0,0,0.8)' },
                    { property: 'overlay backdrop-filter', value: 'blur(4px)' },
                    { property: 'max-width', value: '480px' },
                    { property: 'padding', value: '20px (p-5)' },
                    { property: 'z-index', value: '500' },
                ],
                render: () => (
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button>Открыть диалог</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Заголовок</DialogTitle>
                                <DialogDescription>Описание модального окна</DialogDescription>
                            </DialogHeader>
                            <div className="py-4">
                                <p className="text-sm text-slate-600">Содержимое диалога</p>
                            </div>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button variant="outline">Отмена</Button>
                                </DialogClose>
                                <Button>Сохранить</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                ),
            },
            {
                name: 'hideClose',
                description: 'Без кнопки ✕',
                props: { hideClose: true },
                cssProperties: [],
                render: () => (
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="outline">Важное действие</Button>
                        </DialogTrigger>
                        <DialogContent hideClose>
                            <DialogHeader>
                                <DialogTitle>Подтвердите</DialogTitle>
                                <DialogDescription>Выберите один из вариантов</DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button variant="outline">Нет</Button>
                                </DialogClose>
                                <DialogClose asChild>
                                    <Button>Да</Button>
                                </DialogClose>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                ),
            },
        ],
    },

    // =========================================
    // FEEDBACK — Tooltip
    // =========================================
    {
        id: 'tooltip',
        name: 'Tooltip',
        description: 'Всплывающие подсказки. Четыре варианта: простой, с заголовком, список, иконка.',
        category: 'feedback',
        importStatement: "import { Tooltip, TooltipRich, TooltipList, TooltipIcon } from '@/components/ui/tooltip'",
        filePath: 'components/ui/tooltip.tsx',
        variants: [
            {
                name: 'Tooltip (4 стороны)',
                description: 'top / right / bottom / left',
                props: {},
                cssProperties: [
                    { property: 'background', value: '#0f172a (slate-900)' },
                    { property: 'padding', value: '6px 12px' },
                    { property: 'font-size', value: '12px' },
                    { property: 'border-radius', value: '6px' },
                ],
                render: () => (
                    <div className="flex gap-2 flex-wrap justify-center">
                        <Tooltip content="Сверху" side="top"><Button variant="outline" size="sm">Top</Button></Tooltip>
                        <Tooltip content="Справа" side="right"><Button variant="outline" size="sm">Right</Button></Tooltip>
                        <Tooltip content="Снизу" side="bottom"><Button variant="outline" size="sm">Bottom</Button></Tooltip>
                        <Tooltip content="Слева" side="left"><Button variant="outline" size="sm">Left</Button></Tooltip>
                    </div>
                ),
            },
            {
                name: 'TooltipRich',
                description: 'С заголовком и описанием',
                props: {},
                cssProperties: [
                    { property: 'max-width', value: '280px' },
                    { property: 'padding', value: '12px 16px' },
                ],
                render: () => (
                    <TooltipRich title="Настройки уведомлений" description="Управляйте email и push-уведомлениями">
                        <Button variant="outline"><Settings className="w-4 h-4 mr-2" />Настройки</Button>
                    </TooltipRich>
                ),
            },
            {
                name: 'TooltipList',
                description: 'Список (горячие клавиши)',
                props: {},
                cssProperties: [{ property: 'min-width', value: '180px' }],
                render: () => (
                    <TooltipList
                        title="Горячие клавиши"
                        items={[
                            { label: 'Сохранить', value: '⌘S' },
                            { label: 'Отменить', value: '⌘Z' },
                            { label: 'Поиск', value: '⌘K' },
                        ]}
                    >
                        <Button variant="outline"><HelpCircle className="w-4 h-4 mr-2" />Справка</Button>
                    </TooltipList>
                ),
            },
            {
                name: 'TooltipIcon',
                description: 'Иконка-подсказка (?) рядом с текстом',
                props: {},
                cssProperties: [
                    { property: 'icon size', value: '16px' },
                    { property: 'icon background', value: '#e2e8f0 (slate-200)' },
                ],
                render: () => (
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-700">Маржинальность</span>
                        <TooltipIcon content="Процент прибыли от выручки" />
                    </div>
                ),
            },
        ],
    },

    // =========================================
    // DATA DISPLAY — Accordion
    // =========================================
    {
        id: 'accordion',
        name: 'Accordion',
        description: 'Раскрывающиеся секции. 6 вариантов: default, cards, FAQ, settings, bordered, steps.',
        category: 'data-display',
        importStatement: "import { Accordion, AccordionCards, AccordionFAQ, AccordionSettings, AccordionBordered, AccordionSteps } from '@/components/ui/accordion'",
        filePath: 'components/ui/accordion.tsx',
        variants: [
            {
                name: 'Accordion (default)',
                description: 'Простой с разделителем',
                props: {},
                cssProperties: [
                    { property: 'border-bottom', value: '1px solid #e2e8f0' },
                    { property: 'trigger font-weight', value: '700' },
                    { property: 'chevron transition', value: 'rotate 300ms' },
                ],
                render: () => (
                    <div className="w-64">
                        <Accordion
                            defaultValue="q1"
                            items={[
                                { id: 'q1', title: 'Что такое MerchCRM?', content: 'Система управления заказами.' },
                                { id: 'q2', title: 'Как добавить товар?', content: 'Через раздел Склад.' },
                            ]}
                        />
                    </div>
                ),
            },
            {
                name: 'AccordionCards',
                description: 'В стиле карточек',
                props: {},
                cssProperties: [
                    { property: 'item border-radius', value: '12px (rounded-xl)' },
                    { property: 'item border', value: '1px solid #e2e8f0' },
                ],
                render: () => (
                    <div className="w-64">
                        <AccordionCards
                            defaultValue="c1"
                            items={[
                                { id: 'c1', title: 'Раздел 1', content: 'Содержимое раздела 1' },
                                { id: 'c2', title: 'Раздел 2', content: 'Содержимое раздела 2' },
                            ]}
                        />
                    </div>
                ),
            },
            {
                name: 'AccordionFAQ',
                description: 'FAQ с Plus/Minus иконками',
                props: {},
                cssProperties: [
                    { property: 'icon', value: 'Plus / Minus toggle' },
                    { property: 'open icon bg', value: 'var(--primary)' },
                ],
                render: () => (
                    <div className="w-64">
                        <AccordionFAQ
                            items={[
                                { id: 'f1', title: 'Часто задаваемый вопрос?', content: 'Ответ на вопрос здесь.' },
                            ]}
                        />
                    </div>
                ),
            },
            {
                name: 'AccordionSettings',
                description: 'С иконкой и описанием (настройки)',
                props: {},
                cssProperties: [
                    { property: 'icon container', value: 'bg-primary/10' },
                    { property: 'description', value: 'text-xs text-slate-500' },
                ],
                render: () => (
                    <div className="w-64">
                        <AccordionSettings
                            items={[
                                {
                                    id: 's1',
                                    title: 'Уведомления',
                                    description: 'Email и push-уведомления',
                                    icon: <Bell className="w-4 h-4" />,
                                    content: <p className="text-sm text-slate-500">Настройки уведомлений</p>,
                                },
                            ]}
                        />
                    </div>
                ),
            },
            {
                name: 'AccordionBordered',
                description: 'С цветной левой полосой',
                props: {},
                cssProperties: [
                    { property: 'border-left', value: '2px solid slate-200' },
                    { property: 'open border-left', value: '2px solid var(--primary)' },
                ],
                render: () => (
                    <div className="w-64">
                        <AccordionBordered
                            defaultValue="b1"
                            items={[
                                { id: 'b1', title: 'Документация', content: 'Описание раздела' },
                                { id: 'b2', title: 'API Reference', content: 'API документация' },
                            ]}
                        />
                    </div>
                ),
            },
            {
                name: 'AccordionSteps',
                description: 'Пошаговые инструкции с номерами',
                props: {},
                cssProperties: [
                    { property: 'step circle', value: 'h-8 w-8 rounded-full' },
                    { property: 'active step bg', value: 'var(--primary)' },
                ],
                render: () => (
                    <div className="w-64">
                        <AccordionSteps
                            defaultValue="step1"
                            items={[
                                { id: 'step1', title: 'Создайте заказ', content: 'Заполните форму создания заказа.' },
                                { id: 'step2', title: 'Назначьте исполнителя', content: 'Выберите сотрудника.' },
                            ]}
                        />
                    </div>
                ),
            },
        ],
    },
];

// =========================================
// HELPERS
// =========================================

export function getComponentsByCategory(category: ComponentDefinition['category']) {
    return componentRegistry.filter(c => c.category === category);
}

export function getComponentById(id: string) {
    return componentRegistry.find(c => c.id === id);
}

export const categories = [
    { id: 'layout' as const, name: 'Layout', description: 'Компоненты разметки' },
    { id: 'primitives' as const, name: 'Primitives', description: 'Базовые элементы' },
    { id: 'forms' as const, name: 'Forms', description: 'Элементы форм' },
    { id: 'navigation' as const, name: 'Navigation', description: 'Навигация' },
    { id: 'data-display' as const, name: 'Data Display', description: 'Отображение данных' },
    { id: 'feedback' as const, name: 'Feedback', description: 'Обратная связь' },
];
