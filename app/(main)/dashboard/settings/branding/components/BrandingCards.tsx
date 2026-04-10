'use client';

import Image from 'next/image';
import { 
 Building2, 
 Upload, 
 Trash2, 
 Palette, 
 Phone, 
 Mail, 
 Globe, 
 MapPin,
 FileText,
 Loader2,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { UseFormReturn } from 'react-hook-form';
import { BrandingFormData } from '@/lib/types/branding';

/**
 * Карточка информации о компании
 */
export function CompanyCard({ 
 form, 
 logoUrl, 
 isUploadingLogo, 
 onLogoUpload, 
 onLogoDelete 
}: { 
 form: UseFormReturn<BrandingFormData>;
 logoUrl: string | null;
 isUploadingLogo: boolean;
 onLogoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
 onLogoDelete: () => void;
}) {
 return (
  <Card>
   <CardHeader>
    <CardTitle className="flex items-center gap-2">
     <Building2 className="h-5 w-5" />
     Компания
    </CardTitle>
    <CardDescription>
     Основная информация о вашей компании
    </CardDescription>
   </CardHeader>
   <CardContent className="space-y-3">
    <div className="flex items-start gap-3">
     <div className="w-24 h-24 rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center overflow-hidden bg-muted">
      {logoUrl ? (
       <div className="relative w-full h-full">
        <Image src={logoUrl} alt="Логотип" fill className="object-contain" unoptimized={logoUrl.startsWith('blob:')} />
       </div>
      ) : (
       <Building2 className="h-8 w-8 text-muted-foreground" />
      )}
     </div>
     <div className="space-y-2">
      <Label>Логотип компании</Label>
      <p className="text-sm text-muted-foreground">
       PNG, JPEG, WebP или SVG до 2 МБ
      </p>
      <div className="flex gap-2">
       <Button type="button" variant="outline" size="sm" disabled={isUploadingLogo} asChild>
        <label className="cursor-pointer">
         {isUploadingLogo ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
         ) : (
          <Upload className="h-4 w-4 mr-2" />
         )}
         Загрузить
         <input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" onChange={onLogoUpload} className="hidden" />
        </label>
       </Button>
       {logoUrl && (
        <Button type="button" variant="outline" size="sm" onClick={onLogoDelete}>
         <Trash2 className="h-4 w-4 mr-2" />
         Удалить
        </Button>
       )}
      </div>
     </div>
    </div>
    <Separator />
    <div className="space-y-2">
     <Label htmlFor="companyName">Название компании *</Label>
     <Input id="companyName" {...form.register('companyName')} placeholder="ООО «Моя компания»" />
     {form.formState.errors.companyName && (
      <p className="text-sm text-destructive">{String(form.formState.errors.companyName.message)}</p>
     )}
    </div>
   </CardContent>
  </Card>
 );
}

/**
 * Карточка цветовой схемы
 */
export function ColorCard({ form }: { form: UseFormReturn<BrandingFormData> }) {
 return (
  <Card>
   <CardHeader>
    <CardTitle className="flex items-center gap-2">
     <Palette className="h-5 w-5" />
     Цветовая схема
    </CardTitle>
    <CardDescription>
     Цвета для оформления PDF документов
    </CardDescription>
   </CardHeader>
   <CardContent>
    <div className="grid grid-cols-2 gap-3">
     <div className="space-y-2">
      <Label htmlFor="primaryColor">Основной цвет</Label>
      <div className="flex gap-2">
       <Input id="primaryColor" type="color" {...form.register('primaryColor')} className="w-12 h-10 p-1 cursor-pointer" />
       <Input {...form.register('primaryColor')} placeholder="#2563eb" className="flex-1" />
      </div>
     </div>
     <div className="space-y-2">
      <Label htmlFor="secondaryColor">Вторичный цвет</Label>
      <div className="flex gap-2">
       <Input id="secondaryColor" type="color" {...form.register('secondaryColor')} className="w-12 h-10 p-1 cursor-pointer" />
       <Input {...form.register('secondaryColor')} placeholder="#64748b" className="flex-1" />
      </div>
     </div>
    </div>
   </CardContent>
  </Card>
 );
}

/**
 * Карточка контактов
 */
export function ContactsCard({ form }: { form: UseFormReturn<BrandingFormData> }) {
 return (
  <Card>
   <CardHeader>
    <CardTitle className="flex items-center gap-2">
     <Phone className="h-5 w-5" />
     Контактная информация
    </CardTitle>
   </CardHeader>
   <CardContent className="space-y-3">
    <div className="grid grid-cols-2 gap-3">
     <div className="space-y-2">
      <Label htmlFor="phone">Телефон</Label>
      <div className="relative">
       <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
       <Input id="phone" {...form.register('phone')} placeholder="+7 (999) 123-45-67" className="pl-10" />
      </div>
     </div>
     <div className="space-y-2">
      <Label htmlFor="email">Email</Label>
      <div className="relative">
       <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
       <Input id="email" type="email" {...form.register('email')} placeholder="info@company.ru" className="pl-10" />
      </div>
      {form.formState.errors.email && (
       <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
      )}
     </div>
    </div>
    <div className="grid grid-cols-2 gap-3">
     <div className="space-y-2">
      <Label htmlFor="website">Сайт</Label>
      <div className="relative">
       <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
       <Input id="website" {...form.register('website')} placeholder="https://company.ru" className="pl-10" />
      </div>
      {form.formState.errors.website && (
       <p className="text-sm text-destructive">{form.formState.errors.website.message}</p>
      )}
     </div>
     <div className="space-y-2">
      <Label htmlFor="address">Адрес</Label>
      <div className="relative">
       <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
       <Input id="address" {...form.register('address')} placeholder="г. Москва, ул. Примерная, д. 1" className="pl-10" />
      </div>
     </div>
    </div>
   </CardContent>
  </Card>
 );
}

/**
 * Карточка реквизитов
 */
export function DetailsCard({ form }: { form: UseFormReturn<BrandingFormData> }) {
 return (
  <Card>
   <CardHeader>
    <CardTitle className="flex items-center gap-2">
     <FileText className="h-5 w-5" />
     Реквизиты
    </CardTitle>
    <CardDescription>
     Юридическая информация для счетов и документов
    </CardDescription>
   </CardHeader>
   <CardContent className="space-y-3">
    <div className="grid grid-cols-3 gap-3">
     <div className="space-y-2">
      <Label htmlFor="inn">ИНН</Label>
      <Input id="inn" {...form.register('inn')} placeholder="1234567890" />
     </div>
     <div className="space-y-2">
      <Label htmlFor="kpp">КПП</Label>
      <Input id="kpp" {...form.register('kpp')} placeholder="123456789" />
     </div>
     <div className="space-y-2">
      <Label htmlFor="ogrn">ОГРН</Label>
      <Input id="ogrn" {...form.register('ogrn')} placeholder="1234567890123" />
     </div>
    </div>
    <div className="space-y-2">
     <Label htmlFor="bankDetails">Банковские реквизиты</Label>
     <Textarea id="bankDetails" {...form.register('bankDetails')} placeholder="Р/с 40702810000000000000 в ПАО «Банк» БИК 044525000 К/с 30101810000000000000" rows={3} />
    </div>
   </CardContent>
  </Card>
 );
}
